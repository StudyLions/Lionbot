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
//
// --- AI-MODIFIED (2026-06-10) ---
// The account-bootstrap + device-upsert + token-mint + user/pet
// snapshot block (steps e–g) moved VERBATIM to
// lib/anki/deviceSession.ts so the new email-account auth routes
// (login / verify-email) and this Discord pairing route share ONE
// session-creation code path. extractIpPrefix moved with it. This
// route keeps everything pairing-specific: the atomic code consume,
// PKCE verify, state + device binding. Response shape unchanged
// (plus user.account_type/email fields, additive).
// --- END AI-MODIFIED ---
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import { prisma } from "@/utils/prisma"
import {
  hashAnkiPairingCode,
  timingSafeStringEqual,
} from "@/lib/anki/auth"
import {
  bootstrapGameAccount,
  createDeviceSession,
  extractIpPrefix,
} from "@/lib/anki/deviceSession"
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

// extractIpPrefix lives in lib/anki/deviceSession.ts now (moved
// verbatim 2026-06-10, shared with the email-account auth routes).

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

  // Bootstrap (user_config + lg_pets if missing) + device upsert +
  // token mint + user/pet snapshot — the shared session core
  // (lib/anki/deviceSession.ts, extracted verbatim from here).
  try {
    await bootstrapGameAccount(consumed.userid)
  } catch (err) {
    console.error("[anki/exchange] account bootstrap failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not initialize your account")
  }

  const session = await createDeviceSession({
    userid: consumed.userid,
    deviceId: device_id,
    deviceName: device_name,
    addonVersion: addon_version,
    osPlatform: os_platform,
    ankiVersion: anki_version,
    ipPrefix: extractIpPrefix(req),
    accountType: "discord",
  })
  if (!session.ok) {
    return sendError(res, session.status, session.error, session.message)
  }

  // Best-effort cleanup: delete the now-consumed pairing code row
  // so the pairing_codes table doesn't grow forever. The daily
  // cron also handles this, but eager cleanup reduces table size.
  prisma.anki_pairing_codes
    .delete({ where: { code_hash: codeHash } })
    .catch((err) => console.warn("[anki/exchange] pairing code cleanup failed:", err))

  return res.status(200).json(session.payload)
}
