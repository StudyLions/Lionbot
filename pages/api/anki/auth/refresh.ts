// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Rotate the Anki addon's refresh token + mint a new
//          bearer. Refresh tokens are single-use; reuse triggers
//          immediate device revocation (classic refresh-token-
//          rotation-with-reuse-detection — the standard OAuth 2.1
//          defense against refresh-token theft).
//
//          Flow:
//            1. Addon POSTs { device_id, refresh_token }.
//            2. Server looks up anki_devices by device_id.
//            3. Compares sha256(presented) to stored hash (timing-
//               safe). If MISMATCH:
//                 - If the device was already rotated since (we
//                   detect this via refresh_token_version), the
//                   presented token must be a previously-rotated
//                   one — i.e. an attacker replayed a stale token.
//                   Revoke the device with reason "refresh_token_reuse".
//                 - Otherwise: bad token, 401.
//            4. If MATCH:
//                 - Generate new refresh token + hash.
//                 - In a single transaction, UPDATE the device row
//                   to swap the hash and bump refresh_token_version.
//                 - Mint a new bearer.
//                 - Invalidate the local device cache.
//                 - Return { session_token, refresh_token }.
//
//          The atomic UPDATE WHERE refresh_token_hash=$old prevents
//          two concurrent refresh requests with the same old token
//          from both succeeding (only one will get rowcount=1).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  mintAnkiBearer,
  mintAnkiRefreshToken,
  hashAnkiRefreshToken,
  ANKI_JWT_VERSION,
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
    return sendError(
      res,
      400,
      "missing_fields",
      "Required: device_id, refresh_token"
    )
  }
  if (!UUID_RE.test(device_id)) {
    return sendError(res, 400, "bad_device_id", "device_id must be a UUID")
  }
  if (typeof refresh_token !== "string" || refresh_token.length < 16) {
    return sendError(res, 400, "bad_refresh_token", "refresh_token shape invalid")
  }

  const presentedHash = hashAnkiRefreshToken(refresh_token)

  // Generate new tokens UP FRONT so the atomic update can include
  // the new hash in a single round-trip.
  const { token: newRefreshToken, hash: newRefreshHash } = mintAnkiRefreshToken()

  // Atomic "compare-and-swap" via updateMany:
  //   only rotate if (a) the device exists, (b) is not revoked,
  //   and (c) the presented hash exactly matches the stored hash.
  //
  // If updateResult.count === 0, the swap failed for one of those
  // reasons. We then disambiguate (revoked? reuse?) and respond.
  let updateResult: { count: number }
  try {
    updateResult = await prisma.anki_devices.updateMany({
      where: {
        device_id,
        revoked_at: null,
        refresh_token_hash: presentedHash,
      },
      data: {
        refresh_token_hash: newRefreshHash,
        refresh_token_version: { increment: 1 },
        last_seen_at: new Date(),
      },
    })
  } catch (err) {
    console.error("[anki/refresh] rotate UPDATE failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not rotate refresh token")
  }

  if (updateResult.count === 1) {
    // Success path. Mint bearer and respond.
    invalidateDeviceCache(device_id)
    let sessionToken: string
    try {
      // We need discord_id from the device row to mint. Fetch it.
      const device = await prisma.anki_devices.findUnique({
        where: { device_id },
        select: { userid: true },
      })
      if (!device) {
        // Vanishingly unlikely — we just updated this row.
        return sendError(res, 500, "internal_error", "Device row missing after rotate")
      }
      sessionToken = await mintAnkiBearer({
        discordId: device.userid.toString(),
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

  // Rotation failed. Disambiguate.
  let device: {
    device_id: string
    revoked_at: Date | null
    refresh_token_hash: Buffer
  } | null
  try {
    const row = await prisma.anki_devices.findUnique({
      where: { device_id },
      select: { device_id: true, revoked_at: true, refresh_token_hash: true },
    })
    device = row
      ? {
          device_id: row.device_id,
          revoked_at: row.revoked_at,
          refresh_token_hash: Buffer.from(row.refresh_token_hash),
        }
      : null
  } catch (err) {
    console.error("[anki/refresh] device disambiguate lookup failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not verify device state")
  }

  if (!device) {
    return sendError(res, 401, "device_unknown", "This device is not registered")
  }

  if (device.revoked_at) {
    return sendError(res, 401, "device_revoked", "This device has been signed out")
  }

  // Device exists, not revoked, but the presented refresh token
  // didn't match. This means the presented token is stale —
  // either:
  //   (a) the addon retried a network blip and an old in-flight
  //       refresh already rotated (legitimate, but the second
  //       attempt SHOULD fail); or
  //   (b) an attacker has a stolen-from-disk refresh token and is
  //       using it after the legitimate addon already rotated.
  //
  // We CANNOT distinguish (a) and (b) just from the token alone.
  // The safe play is: assume (b), revoke the device. The
  // legitimate addon will get a 401 on its next request and
  // prompt the user to re-pair. Inconvenient but secure.
  try {
    await prisma.anki_devices.update({
      where: { device_id },
      data: {
        revoked_at: new Date(),
        revoked_reason: "refresh_token_reuse",
      },
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
