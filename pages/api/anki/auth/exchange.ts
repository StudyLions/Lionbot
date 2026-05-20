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
  const fwd = req.headers["x-forwarded-for"]
  const raw =
    (typeof fwd === "string"
      ? fwd.split(",")[0].trim()
      : Array.isArray(fwd)
      ? fwd[0]
      : null) || req.socket.remoteAddress
  if (!raw) return null
  // IPv4 -> /24. Only emit when it's a clean dotted quad of
  // numeric octets, so we never hand Postgres a malformed INET.
  const v4 = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const octets = [v4[1], v4[2], v4[3]].map((o) => parseInt(o, 10))
    if (octets.every((o) => o >= 0 && o <= 255)) {
      return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`
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

  // ATOMIC consume: race-safe single-shot. UpdateMany with the
  // (consumed=false, expires_at > now()) predicate ensures we
  // only succeed if the code is still redeemable. Returns count.
  let consumed: {
    code_hash: Buffer
    userid: bigint
    device_id: string
    code_challenge: string
    state: string
  } | null = null

  try {
    const updateResult = await prisma.anki_pairing_codes.updateMany({
      where: {
        code_hash: codeHash,
        consumed: false,
        expires_at: { gt: new Date() },
      },
      data: { consumed: true, consumed_at: new Date() },
    })
    if (updateResult.count === 0) {
      return sendError(
        res,
        401,
        "invalid_pairing_code",
        "Pairing code is invalid, already used, or expired"
      )
    }
    const row = await prisma.anki_pairing_codes.findUnique({
      where: { code_hash: codeHash },
      select: {
        code_hash: true,
        userid: true,
        device_id: true,
        code_challenge: true,
        state: true,
      },
    })
    if (!row) {
      console.error("[anki/exchange] consumed but row vanished — DB inconsistency")
      return sendError(res, 500, "internal_error", "Pairing record missing after consume")
    }
    consumed = row
  } catch (err) {
    console.error("[anki/exchange] DB consume failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not consume pairing code")
  }

  // PKCE binding: recompute base64url(sha256(code_verifier)) and
  // compare to the stored code_challenge in constant time.
  const challenge = crypto
    .createHash("sha256")
    .update(code_verifier, "utf8")
    .digest("base64url")
  if (!timingSafeStringEqual(challenge, consumed.code_challenge)) {
    return sendError(
      res,
      401,
      "pkce_mismatch",
      "code_verifier does not match the bound code_challenge"
    )
  }

  // state must match the value the connect page recorded.
  if (!timingSafeStringEqual(state, consumed.state)) {
    return sendError(res, 401, "state_mismatch", "state does not match")
  }

  // device_id must match the one bound to the pairing code.
  // Without this, a leaked pairing code could be claimed by a
  // different device — even with PKCE — since the attacker would
  // generate their own verifier/challenge.
  //
  // Wait, that's wrong: PKCE protects against this because the
  // attacker doesn't have the verifier. But: the device_id in
  // the URL was chosen by the *legitimate* addon, and binding
  // it lets the user inspect the pairing screen and notice if
  // a different device is claiming the code. Belt-and-braces.
  if (consumed.device_id.toLowerCase() !== device_id.toLowerCase()) {
    return sendError(
      res,
      401,
      "device_id_mismatch",
      "device_id does not match the device this code was issued for"
    )
  }

  // Mint the refresh token first; if anything fails after this
  // we abort without inserting the device row.
  const { token: refreshToken, hash: refreshHash } = mintAnkiRefreshToken()

  const ipPrefix = extractIpPrefix(req)

  try {
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
  } catch (err: unknown) {
    // P2002 = unique constraint violation. Most likely cause is
    // the addon retried after a network blip and the pairing
    // code was already consumed on the previous attempt, and
    // somehow got to here a second time. The pairing code's
    // single-use predicate should have caught that above, but
    // defending in depth.
    console.error("[anki/exchange] device insert failed:", err)
    const code = (err as { code?: string }).code
    if (code === "P2002") {
      return sendError(res, 409, "device_already_exists", "device_id is already registered")
    }
    // TEMP DEBUG: surface the underlying error.
    return res.status(503).json({
      error: "db_unavailable",
      message: "Could not register device",
      _debug: String(err).slice(0, 600),
    })
  }

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
    await prisma.anki_devices
      .delete({ where: { device_id } })
      .catch((e) => console.error("[anki/exchange] rollback delete failed:", e))
    return sendError(res, 500, "mint_failed", "Could not issue session token")
  }

  // User snapshot — same shape as the iOS exchange where useful,
  // plus the home guild + pet basics so the addon can render
  // immediately without a second round-trip.
  const userid = consumed.userid
  let username = userid.toString()
  let globalName: string | null = null
  let avatar: string | null = null
  let homeGuildId: bigint | null = null
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
        anki_home_guildid: true,
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
      homeGuildId = cfg.anki_home_guildid
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
    home_guild_id: homeGuildId ? homeGuildId.toString() : null,
    pet: petSnapshot,
  })
}
