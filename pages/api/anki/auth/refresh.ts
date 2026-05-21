// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (reuse-detection hardened 2026-05-21)
// Purpose: Rotate the Anki addon's refresh token + mint a new
//          bearer. Refresh tokens are single-use; rotation is an
//          atomic compare-and-swap.
//
//          Reuse detection (OAuth 2.1): on rotate we snapshot the
//          OLD hash into prev_refresh_token_hash. If a later refresh
//          presents a token that matches that PREVIOUS hash, it's a
//          genuine stale-token replay (theft / a second use after
//          rotation) -> revoke the device. A token that matches
//          NEITHER the current nor the previous hash is just wrong
//          or garbage -> plain 401, NO revoke. This is what stops an
//          attacker who merely learned a victim's device_id from
//          force-revoking them by POSTing junk.
//
//          The atomic UPDATE ... WHERE refresh_token_hash=$presented
//          guarantees only one of two concurrent refreshes with the
//          same token wins (rowcount=1); the loser falls through to
//          the reuse check.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  mintAnkiBearer,
  mintAnkiRefreshToken,
  hashAnkiRefreshToken,
  timingSafeBufferEqual,
  ANKI_JWT_TTL,
} from "@/lib/anki/auth"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"

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

  // Atomic compare-and-swap. Snapshots the OLD hash into
  // prev_refresh_token_hash (RHS references the pre-UPDATE row, so
  // prev gets the old current). RETURNING gives us the userid for
  // minting in the same round-trip.
  let rotated: Array<{ userid: bigint }>
  try {
    rotated = await prisma.$queryRaw<Array<{ userid: bigint }>>`
      UPDATE anki_devices
      SET prev_refresh_token_hash = refresh_token_hash,
          refresh_token_hash = ${newRefreshHash},
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

  // CAS failed. Read the device to disambiguate.
  let row: { revoked_at: Date | null; prev_refresh_token_hash: Buffer | null } | null
  try {
    const rows = await prisma.$queryRaw<
      Array<{ revoked_at: Date | null; prev_refresh_token_hash: Buffer | null }>
    >`SELECT revoked_at, prev_refresh_token_hash FROM anki_devices WHERE device_id = ${device_id}::uuid`
    row = rows[0] ?? null
  } catch (err) {
    console.error("[anki/refresh] disambiguate lookup failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not verify device state")
  }

  if (!row) {
    return sendError(res, 401, "device_unknown", "This device is not registered")
  }
  if (row.revoked_at) {
    return sendError(res, 401, "device_revoked", "This device has been signed out")
  }

  // Genuine reuse ONLY if the presented token matches the PREVIOUS
  // (just-rotated) hash. Anything else is a wrong/garbage token and
  // must NOT revoke the device (else anyone who learns the device_id
  // could force a re-pair by posting junk).
  const prev = row.prev_refresh_token_hash
  if (prev && timingSafeBufferEqual(presentedHash, Buffer.from(prev))) {
    try {
      await prisma.anki_devices.update({
        where: { device_id },
        data: { revoked_at: new Date(), revoked_reason: "refresh_token_reuse" },
      })
      invalidateDeviceCache(device_id)
    } catch (err) {
      console.error("[anki/refresh] reuse-revoke failed:", err)
    }
    return sendError(
      res,
      401,
      "refresh_token_reuse",
      "Refresh token reuse detected — this device has been revoked for safety"
    )
  }

  // Wrong / stale-beyond-one / garbage token. No revoke.
  return sendError(res, 401, "invalid_refresh_token", "refresh_token is invalid")
}
