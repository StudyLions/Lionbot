// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (reuse-detection softened 2026-05-21)
// Purpose: Rotate the Anki addon's refresh token + mint a new
//          bearer. Rotation is an atomic compare-and-swap so only
//          one of two concurrent refreshes with the same token wins.
//
//          We deliberately do NOT auto-revoke the device on a token
//          mismatch. The original OAuth-2.1-style reuse-detection
//          (revoke on any stale token) caused false positives:
//          a refresh race or a lost-response retry presents a token
//          the server already rotated, which looked identical to
//          theft and locked real users out. The Anki bearer carries no
//          Discord access; note its scope now includes anki.pet.write
//          (since 2026-06-02), so a stolen un-rotated token could touch
//          pet/economy state — but the economy is server-authoritative
//          and cheat-bounded, the addon serializes refreshes and never
//          retries the POST (so it can't trip a false reuse), and
//          revoke-on-stale's user-lockout cost still outweighs its
//          marginal benefit. A stale/wrong token just gets a 401; the
//          addon recovers by re-pairing (which reactivates the device).
//          Suspected compromise is handled explicitly via "sign out
//          everywhere" on /dashboard/anki.
//
//          The addon also serializes refreshes (one in flight at a
//          time) and does not retry the refresh POST on a network
//          error, so it never double-uses a token in the first place.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  mintAnkiBearer,
  mintAnkiRefreshToken,
  hashAnkiRefreshToken,
  ANKI_JWT_TTL,
} from "@/lib/anki/auth"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"
import { ankiRateLimitByKey, clientIpKey } from "@/lib/anki/rateLimit"

interface RefreshBody {
  device_id?: string
  refresh_token?: string
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return sendError(res, 405, "method_not_allowed", "POST only")
  }

  // Per-IP throttle on this unauthenticated endpoint (generous — legit clients
  // refresh ~hourly; this just caps a flood of guessed refresh tokens).
  const rl = ankiRateLimitByKey(`anki-refresh:${clientIpKey(req)}`, 120, 60_000)
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter))
    return sendError(res, 429, "rate_limited", "Too many refresh attempts — slow down.")
  }

  const body = (req.body || {}) as RefreshBody
  const { device_id, refresh_token } = body

  if (!device_id || !refresh_token) {
    return sendError(res, 400, "missing_fields", "Required: device_id, refresh_token")
  }
  if (!UUID_RE.test(device_id)) {
    return sendError(res, 400, "bad_device_id", "device_id must be a UUID")
  }
  if (typeof refresh_token !== "string" || refresh_token.length < 16) {
    return sendError(res, 400, "bad_refresh_token", "refresh_token shape invalid")
  }

  const presentedHash = hashAnkiRefreshToken(refresh_token)
  const { token: newRefreshToken, hash: newRefreshHash } = mintAnkiRefreshToken()

  // Atomic compare-and-swap: rotate only if the device exists, is
  // not revoked, and the presented hash matches. RETURNING gives us
  // the userid for minting in one round-trip. Two concurrent
  // refreshes with the same token: exactly one gets a row back.
  let rotated: Array<{ userid: bigint }>
  try {
    rotated = await prisma.$queryRaw<Array<{ userid: bigint }>>`
      UPDATE anki_devices
      SET refresh_token_hash = ${newRefreshHash},
          refresh_token_version = refresh_token_version + 1,
          last_seen_at = now()
      WHERE device_id = ${device_id}::uuid
        AND revoked_at IS NULL
        AND refresh_token_hash = ${presentedHash}
      RETURNING userid`
  } catch (err) {
    console.error("[anki/refresh] rotate UPDATE failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not rotate refresh token")
  }

  if (rotated.length === 1) {
    invalidateDeviceCache(device_id)
    let sessionToken: string
    try {
      sessionToken = await mintAnkiBearer({
        discordId: rotated[0].userid.toString(),
        deviceId: device_id,
      })
    } catch (err) {
      console.error("[anki/refresh] mint bearer failed:", err)
      return sendError(res, 500, "mint_failed", "Could not issue session token")
    }
    return res.status(200).json({
      session_token: sessionToken,
      session_token_ttl: ANKI_JWT_TTL,
      refresh_token: newRefreshToken,
      device_id,
    })
  }

  // CAS failed. Distinguish "revoked" (explicit dashboard sign-out)
  // from "stale/wrong token" — but in NEITHER case do we revoke.
  let revoked: Date | null = null
  let exists = false
  try {
    const rows = await prisma.$queryRaw<Array<{ revoked_at: Date | null }>>`
      SELECT revoked_at FROM anki_devices WHERE device_id = ${device_id}::uuid`
    if (rows[0]) {
      exists = true
      revoked = rows[0].revoked_at
    }
  } catch (err) {
    console.error("[anki/refresh] disambiguate lookup failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not verify device state")
  }

  if (!exists) {
    return sendError(res, 401, "device_unknown", "This device is not registered")
  }
  if (revoked) {
    return sendError(res, 401, "device_revoked", "This device has been signed out")
  }
  // Stale or wrong token — no revoke. The addon re-pairs to recover.
  return sendError(res, 401, "invalid_refresh_token", "refresh_token is invalid or stale")
}
