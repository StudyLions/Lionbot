// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Consume a single-use pairing code (created by the
//          /anki/connect page after Discord sign-in) and return
//          a freshly minted Anki bearer + opaque refresh token.
//
//          Flow (mirroring the plan):
//            1. Addon receives the human-readable pairing code
//               from the user (paste-back).
//            2. Addon POSTs { pairing_code, code_verifier, state,
//                            device_id, device_name, addon_version,
//                            os_platform, anki_version } here.
//            3. Server:
//               a. atomic UPDATE ... SET consumed=true RETURNING ...
//                  on anki_pairing_codes — race-safe one-shot.
//               b. recompute base64url(sha256(code_verifier)) and
//                  compare to stored code_challenge (timing-safe).
//               c. verify state matches.
//               d. verify device_id in payload matches the one bound
//                  to the pairing code (defends against a leaked code
//                  being claimed by a different device).
//               e. insert anki_devices row.
//               f. mint bearer + opaque refresh token.
//               g. respond with both.
//
//          Returns 4xx with a stable {error, message} body on
//          every failure so the addon can switch on it.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import { prisma } from "@/utils/prisma"
import {
  mintAnkiBearer,
  mintAnkiRefreshToken,
  hashAnkiPairingCode,
  timingSafeStringEqual,
  DEFAULT_ANKI_SCOPES,
  ANKI_JWT_TTL,
  ANKI_JWT_VERSION,
} from "@/lib/anki/auth"
import { isLionheartActive } from "../../auth/ios/exchange"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface ExchangeBody {
  pairing_code?: string
  code_verifier?: string
  state?: string
  device_id?: string
  device_name?: string
  addon_version?: string
  os_platform?: string
  anki_version?: string
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message: string
) {
  return res.status(status).json({ error, message })
}

function extractIpPrefix(req: NextApiRequest): string | null {
  // Prefer the platform-trusted source. A client can spoof x-forwarded-for,
  // but Vercel overwrites x-real-ip with the true peer address, so this can't
  // be poisoned the way the bare XFF[0] could.
  const h = req.headers
  const pickFirst = (v: string | string[] | undefined): string | null =>
    typeof v === "string" ? v.split(",")[0].trim() : Array.isArray(v) ? v[0] || null : null
  const raw =
    pickFirst(h["x-real-ip"]) ||
    pickFirst(h["x-vercel-forwarded-for"]) ||
    pickFirst(h["x-forwarded-for"]) ||
    req.socket.remoteAddress
  if (!raw) return null
  // IPv4 -> /24. Only emit when it's a clean dotted quad of
  // numeric octets, so we never hand Postgres a malformed INET.
  const v4 = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const octets = [v4[1], v4[2], v4[3]].map((o) => parseInt(o, 10))
    if (octets.every((o) => o >= 0 && o <= 255)) {
      // Bare network IP (last octet zeroed) — NOT CIDR. Prisma's
      // INET serializer uses Rust's IpAddr parser which rejects a
      // "/24" suffix (AddrParseError), so we coarsen by zeroing the
      // last octet instead of appending a netmask.
      return `${octets[0]}.${octets[1]}.${octets[2]}.0`
    }
    return null
  }
  // IPv6 truncation is error-prone (double-:: collapses), and this
  // is best-effort abuse-triage telemetry only — skip rather than
  // risk an invalid INET that fails the device insert.
  return null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return sendError(res, 405, "method_not_allowed", "POST only")
  }

  // Per-IP throttle on this unauthenticated endpoint. Generous (60/min) — a
  // real user pairs a handful of times; this just caps a flood. (Pairing codes
  // are 60-bit + 5-min single-use, so brute-force isn't the threat here.)
  const rl = ankiRateLimitByKey(`anki-exchange:${clientIpKey(req)}`, 60, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many pairing attempts — slow down.")
  }

  const body = (req.body || {}) as ExchangeBody
  const {
    pairing_code,
    code_verifier,
    state,
    device_id,
    device_name,
    addon_version,
    os_platform,
    anki_version,
  } = body

  // Field-presence checks
  if (!pairing_code || !code_verifier || !state || !device_id || !device_name) {
    return sendError(
      res,
      400,
      "missing_fields",
      "Required: pairing_code, code_verifier, state, device_id, device_name"
    )
  }

  // Shape checks
  if (!UUID_RE.test(device_id)) {
    return sendError(res, 400, "bad_device_id", "device_id must be a UUID")
  }
  if (typeof device_name !== "string" || device_name.length === 0 || device_name.length > 64) {
    return sendError(res, 400, "bad_device_name", "device_name must be 1..64 chars")
  }
  if (typeof code_verifier !== "string" || code_verifier.length < 43 || code_verifier.length > 128) {
    return sendError(res, 400, "bad_code_verifier", "code_verifier must be 43..128 chars (RFC 7636)")
  }
  if (typeof state !== "string" || state.length < 16 || state.length > 256) {
    return sendError(res, 400, "bad_state", "state must be 16..256 chars")
  }

  const codeHash = hashAnkiPairingCode(pairing_code)

  // Verify the secret-bearing checks (PKCE, state, device binding) BEFORE
  // consuming the code. Deliberate ordering:
  //   - a wrong guess can no longer BURN a victim's in-flight code (the old
  //     consume-then-verify order let any correct code_hash grief the user
  //     into re-pairing);
  //   - every failure returns the SAME generic error, so there is no
  //     valid-vs-invalid pairing-code oracle to aid guessing.
  // The single-use consume is an atomic conditional UPDATE that runs only
  // after all checks pass, so redemption is still race-safe.
  let consumed: {
    code_hash: Buffer
    userid: bigint
    device_id: string
    code_challenge: string
    state: string
  } | null = null

  try {
    const row = await prisma.anki_pairing_codes.findUnique({
      where: { code_hash: codeHash },
      select: {
        code_hash: true,
        userid: true,
        device_id: true,
        code_challenge: true,
        state: true,
        consumed: true,
        expires_at: true,
      },
    })

    // PKCE binding: recompute base64url(sha256(code_verifier)).
    const challenge = crypto
      .createHash("sha256")
      .update(code_verifier, "utf8")
      .digest("base64url")

    // Single generic failure for EVERY case (no row / used / expired / wrong
    // PKCE / wrong state / wrong device) so nothing distinguishes them. PKCE +
    // state are compared in constant time.
    const valid =
      !!row &&
      row.consumed === false &&
      row.expires_at > new Date() &&
      timingSafeStringEqual(challenge, row.code_challenge) &&
      timingSafeStringEqual(state, row.state) &&
      row.device_id.toLowerCase() === device_id.toLowerCase()

    if (!row || !valid) {
      return sendError(
        res,
        401,
        "invalid_pairing_code",
        "Pairing code is invalid, already used, or expired"
      )
    }

    // Verified — NOW consume atomically (race-safe single use). If a concurrent
    // valid exchange already took it, count is 0 → same generic error.
    const consumeResult = await prisma.anki_pairing_codes.updateMany({
      where: { code_hash: codeHash, consumed: false, expires_at: { gt: new Date() } },
      data: { consumed: true, consumed_at: new Date() },
    })
    if (consumeResult.count === 0) {
      return sendError(
        res,
        401,
        "invalid_pairing_code",
        "Pairing code is invalid, already used, or expired"
      )
    }

    consumed = {
      code_hash: row.code_hash,
      userid: row.userid,
      device_id: row.device_id,
      code_challenge: row.code_challenge,
      state: row.state,
    }
  } catch (err) {
    console.error("[anki/exchange] pairing verify/consume failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not verify pairing code")
  }

  // Brand-new-account bootstrap. A Discord user who has never used
  // LionBot has no user_config / lg_pets row — but the addon must
  // work for them (they may only ever use Anki and never join a
  // server). Create both rows from DB defaults if missing, ordered
  // so the FK targets exist first (anki_devices + lg_pets reference
  // user_config). Idempotent (ON CONFLICT DO NOTHING).
  try {
    await prisma.$executeRaw`INSERT INTO user_config (userid) VALUES (${consumed.userid}) ON CONFLICT (userid) DO NOTHING`
    await prisma.$executeRaw`INSERT INTO lg_pets (userid) VALUES (${consumed.userid}) ON CONFLICT (userid) DO NOTHING`
  } catch (err) {
    console.error("[anki/exchange] account bootstrap failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not initialize your account")
  }

  // Mint the refresh token first; if anything fails after this
  // we abort without inserting the device row.
  const { token: refreshToken, hash: refreshHash } = mintAnkiRefreshToken()

  const ipPrefix = extractIpPrefix(req)

  // Re-pair friendly: if THIS user already has a row for this
  // device_id (e.g. a prior revoked / stale pairing), reactivate +
  // re-key it in place rather than failing. This preserves their
  // anki_review_events history (FK to device_id) and avoids the
  // dead-end where a revoked device can never pair again. A
  // device_id owned by a DIFFERENT account is rejected (P2002 on
  // the create fallback).
  let createdNew = false
  try {
    const reactivated = await prisma.anki_devices.updateMany({
      where: { device_id, userid: consumed.userid },
      data: {
        device_name,
        refresh_token_hash: refreshHash,
        refresh_token_version: 1,
        jwt_version: ANKI_JWT_VERSION,
        scopes: DEFAULT_ANKI_SCOPES.slice(),
        addon_version: addon_version || null,
        os_platform: os_platform || null,
        anki_version: anki_version || null,
        last_ip_prefix: ipPrefix || undefined,
        last_seen_at: new Date(),
        revoked_at: null,
        revoked_reason: null,
      },
    })
    if (reactivated.count === 0) {
      await prisma.anki_devices.create({
        data: {
          device_id,
          userid: consumed.userid,
          device_name,
          refresh_token_hash: refreshHash,
          refresh_token_version: 1,
          jwt_version: ANKI_JWT_VERSION,
          scopes: DEFAULT_ANKI_SCOPES.slice(),
          addon_version: addon_version || null,
          os_platform: os_platform || null,
          anki_version: anki_version || null,
          last_ip_prefix: ipPrefix || undefined,
        },
      })
      createdNew = true
    }
  } catch (err: unknown) {
    console.error("[anki/exchange] device register failed:", err)
    const code = (err as { code?: string }).code
    if (code === "P2002") {
      // device_id exists but is registered to a different account.
      return sendError(res, 409, "device_already_exists", "This device is registered to another account")
    }
    return sendError(res, 503, "db_unavailable", "Could not register device")
  }
  // Clear any cached (revoked) state so the new bearer works at once.
  invalidateDeviceCache(device_id)

  let sessionToken: string
  try {
    sessionToken = await mintAnkiBearer({
      discordId: consumed.userid.toString(),
      deviceId: device_id,
    })
  } catch (err) {
    // Roll back the device row so the user can retry — leaving a
    // device row without a token would still consume the pairing
    // code (which was the right behavior) but the addon would
    // sit unable to act.
    console.error("[anki/exchange] mint bearer failed:", err)
    // Only roll back a row we just CREATED — never delete a
    // reactivated pre-existing device (that would cascade-delete the
    // user's anki_review_events history).
    if (createdNew) {
      await prisma.anki_devices
        .delete({ where: { device_id } })
        .catch((e) => console.error("[anki/exchange] rollback delete failed:", e))
    }
    return sendError(res, 500, "mint_failed", "Could not issue session token")
  }

  // User snapshot — same shape as the iOS exchange where useful,
  // plus the home guild + pet basics so the addon can render
  // immediately without a second round-trip.
  const userid = consumed.userid
  let username = userid.toString()
  let globalName: string | null = null
  let avatar: string | null = null
  let petSnapshot: {
    pet_name: string
    level: number
    xp: string
    food: number
    bath: number
    sleep: number
  } | null = null

  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid },
      select: {
        name: true,
        avatar_hash: true,
        lg_pets: {
          select: {
            pet_name: true,
            level: true,
            xp: true,
            food: true,
            bath: true,
            sleep: true,
          },
        },
      },
    })
    if (cfg) {
      if (cfg.name) username = cfg.name
      if (cfg.avatar_hash) avatar = cfg.avatar_hash
      if (cfg.lg_pets) {
        petSnapshot = {
          pet_name: cfg.lg_pets.pet_name,
          level: cfg.lg_pets.level,
          xp: cfg.lg_pets.xp.toString(),
          food: cfg.lg_pets.food,
          bath: cfg.lg_pets.bath,
          sleep: cfg.lg_pets.sleep,
        }
      }
    }
  } catch (err) {
    console.warn("[anki/exchange] user snapshot lookup failed:", err)
    // Non-fatal — the addon still gets the bearer.
  }

  let isPremium = false
  try {
    isPremium = await isLionheartActive(userid.toString())
  } catch (err) {
    console.warn("[anki/exchange] premium lookup failed:", err)
  }

  // Best-effort cleanup: delete the now-consumed pairing code row
  // so the pairing_codes table doesn't grow forever. The daily
  // cron also handles this, but eager cleanup reduces table size.
  prisma.anki_pairing_codes
    .delete({ where: { code_hash: codeHash } })
    .catch((err) => console.warn("[anki/exchange] pairing code cleanup failed:", err))

  return res.status(200).json({
    session_token: sessionToken,
    session_token_ttl: ANKI_JWT_TTL,
    refresh_token: refreshToken,
    device_id,
    user: {
      discord_id: userid.toString(),
      username,
      global_name: globalName,
      avatar,
      is_premium: isPremium,
    },
    pet: petSnapshot,
  })
}
