// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Route-level auth helper for /api/anki/* endpoints.
//
//          Mirrors the SHAPE of lib/ios/adminAuthBridge.ts but
//          deliberately does NOT plug into the global
//          utils/adminAuth.ts getAuthContext chain. Reason:
//          accepting an Anki bearer for a non-Anki route would
//          be a scope-escalation bug. By keeping the bridge
//          local to /api/anki/* (i.e. only routes that import
//          `requireAnkiAuth` can accept the bearer), the
//          Anki scope is enforced topologically — any code that
//          doesn't import this file cannot accept the bearer.
//
//          Verification steps performed in order:
//            1. Extract Authorization: Bearer header
//            2. Verify JWT signature + claims + version
//            3. Check the scope claim contains the required scope
//            4. Look up anki_devices by deviceId, confirm not
//               revoked AND jwt_version matches device's stored
//               jwt_version (defends against an old bearer being
//               accepted after the device's jwt_version was bumped)
//            5. Update last_seen_at + last_ip_prefix on the
//               device row (async / fire-and-forget; failure is
//               non-blocking)
//
//          Errors send 401 / 403 with a standardized body and
//          return null. Callers should check for null and
//          early-return.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import {
  extractAnkiBearer,
  verifyAnkiBearer,
  type AnkiScope,
  type VerifiedAnkiBearer,
} from "./auth"

/**
 * Context attached to a successful Anki bearer auth. Mirrors the
 * shape of utils/adminAuth.ts AuthContext where useful, but adds
 * the device-specific fields callers need.
 */
export interface AnkiAuthContext {
  discordId: string
  userId: bigint
  deviceId: string
  scopes: AnkiScope[]
  jti: string
  /** Issued-at unix seconds — useful for some idempotency keys. */
  iat: number
  /** The verified JWT row from anki_devices (subset). */
  device: {
    deviceId: string
    userid: bigint
    deviceName: string
    jwtVersion: string
    scopes: string[]
    addonVersion: string | null
    osPlatform: string | null
    ankiVersion: string | null
    createdAt: Date
    lastSeenAt: Date
    revokedAt: Date | null
    revokedReason: string | null
  }
}

/**
 * Tiny in-memory LRU cache for device lookups. Vercel serverless
 * instances each get their own — that's fine; revocations
 * propagate within the TTL on each instance independently.
 *
 * Keyed by deviceId. Value is the device row or `null` for
 * "known revoked / known absent" (negative cache).
 */
const DEVICE_CACHE_TTL_MS = 60_000
type CachedDevice = {
  expiresAt: number
  device: AnkiAuthContext["device"] | null
}
const deviceCache: Map<string, CachedDevice> = new Map()
const DEVICE_CACHE_MAX = 5000

function cacheGet(deviceId: string): CachedDevice | null {
  const hit = deviceCache.get(deviceId)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    deviceCache.delete(deviceId)
    return null
  }
  return hit
}

function cacheSet(deviceId: string, device: AnkiAuthContext["device"] | null) {
  if (deviceCache.size >= DEVICE_CACHE_MAX) {
    // Drop oldest 10% to keep the cache bounded. Map preserves
    // insertion order, so the first N keys are the oldest.
    const dropCount = Math.floor(DEVICE_CACHE_MAX / 10)
    const keysToDrop = Array.from(deviceCache.keys()).slice(0, dropCount)
    keysToDrop.forEach((key) => deviceCache.delete(key))
  }
  deviceCache.set(deviceId, {
    expiresAt: Date.now() + DEVICE_CACHE_TTL_MS,
    device,
  })
}

/**
 * Invalidate the cached device entry. Call after revoke /
 * refresh-rotate so subsequent requests on the same instance
 * see the change immediately rather than waiting up to 60s.
 */
export function invalidateDeviceCache(deviceId: string) {
  deviceCache.delete(deviceId)
}

/**
 * Standardized 401 / 403 / 503 responses. Body shape kept
 * stable so the addon can switch on it.
 */
function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message: string,
  extra?: Record<string, unknown>
) {
  return res.status(status).json({ error, message, ...extra })
}

/** Pull the trailing /24 (IPv4) or /48 (IPv6) for abuse triage. */
function extractIpPrefix(req: NextApiRequest): string | null {
  const fwd = req.headers["x-forwarded-for"]
  const raw =
    (typeof fwd === "string"
      ? fwd.split(",")[0].trim()
      : Array.isArray(fwd)
      ? fwd[0]
      : null) || req.socket.remoteAddress
  if (!raw) return null
  if (raw.includes(":")) {
    // IPv6: keep first 3 groups -> /48
    const parts = raw.split(":")
    return parts.slice(0, 3).join(":") + "::/48"
  }
  // IPv4: keep first 3 octets -> /24
  const parts = raw.split(".")
  if (parts.length === 4) return parts.slice(0, 3).join(".") + ".0/24"
  return null
}

/**
 * Verify an Anki bearer on a Next.js API request.
 *
 * On success: returns the auth context + side-effect updates the
 *   device's last_seen_at / last_ip_prefix asynchronously.
 * On failure: sends a 401 / 403 response and returns null. Callers
 *   should:
 *
 *     const ctx = await requireAnkiAuth(req, res, "anki.review.write")
 *     if (!ctx) return // response already sent
 *
 * @param scope Optional required scope. If omitted, only signature
 *              and revocation are checked.
 */
export async function requireAnkiAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  scope?: AnkiScope
): Promise<AnkiAuthContext | null> {
  const bearer = extractAnkiBearer(req)
  if (!bearer) {
    sendError(res, 401, "missing_bearer", "Missing Authorization: Bearer header")
    return null
  }

  let verified: VerifiedAnkiBearer | null
  try {
    verified = await verifyAnkiBearer(bearer)
  } catch (err) {
    console.error("[anki/requireAuth] verify threw:", err)
    sendError(res, 500, "internal_error", "Auth verification failed")
    return null
  }

  if (!verified) {
    sendError(
      res,
      401,
      "invalid_bearer",
      "Bearer is invalid, expired, or version-rotated"
    )
    return null
  }

  if (scope && !verified.scopes.includes(scope)) {
    sendError(
      res,
      403,
      "scope_missing",
      `Token does not have required scope: ${scope}`,
      { required_scope: scope, granted_scopes: verified.scopes }
    )
    return null
  }

  // Device lookup (with cache).
  let device = cacheGet(verified.deviceId)?.device ?? undefined
  if (device === undefined) {
    let row
    try {
      row = await prisma.anki_devices.findUnique({
        where: { device_id: verified.deviceId },
        select: {
          device_id: true,
          userid: true,
          device_name: true,
          jwt_version: true,
          scopes: true,
          addon_version: true,
          os_platform: true,
          anki_version: true,
          created_at: true,
          last_seen_at: true,
          revoked_at: true,
          revoked_reason: true,
        },
      })
    } catch (err) {
      console.error("[anki/requireAuth] DB lookup failed:", err)
      sendError(res, 503, "db_unavailable", "Could not verify device state")
      return null
    }
    if (!row) {
      // Negative-cache so repeated invalid bearers don't slam the
      // DB. Short TTL via the same map entry.
      cacheSet(verified.deviceId, null)
      sendError(res, 401, "device_unknown", "This device is not registered")
      return null
    }
    device = {
      deviceId: row.device_id,
      userid: row.userid,
      deviceName: row.device_name,
      jwtVersion: row.jwt_version,
      scopes: row.scopes,
      addonVersion: row.addon_version,
      osPlatform: row.os_platform,
      ankiVersion: row.anki_version,
      createdAt: row.created_at,
      lastSeenAt: row.last_seen_at,
      revokedAt: row.revoked_at,
      revokedReason: row.revoked_reason,
    }
    cacheSet(verified.deviceId, device)
  }

  if (device === null) {
    sendError(res, 401, "device_unknown", "This device is not registered")
    return null
  }

  if (device.revokedAt) {
    sendError(
      res,
      401,
      "device_revoked",
      "This device has been signed out",
      { revoked_reason: device.revokedReason }
    )
    return null
  }

  // Defends against the case where ANKI_JWT_VERSION matches but the
  // device's stored jwt_version was bumped (e.g. by a future
  // forced-rotation feature). For now device.jwtVersion is always
  // ANKI_JWT_VERSION at mint time, so this check is a forward-
  // compat hook with no v1 effect.
  if (device.jwtVersion !== verified.ver) {
    invalidateDeviceCache(device.deviceId)
    sendError(
      res,
      401,
      "device_jwt_version_mismatch",
      "Device bearer version has been rotated; please sign in again"
    )
    return null
  }

  // Fire-and-forget last-seen update. We don't await, and we
  // swallow errors — failing here would 503 a working bearer.
  const ipPrefix = extractIpPrefix(req)
  void prisma.anki_devices
    .update({
      where: { device_id: device.deviceId },
      data: {
        last_seen_at: new Date(),
        ...(ipPrefix ? { last_ip_prefix: ipPrefix } : {}),
      },
    })
    .catch((err) =>
      console.warn("[anki/requireAuth] last_seen update failed:", err)
    )

  return {
    discordId: verified.discordId,
    userId: BigInt(verified.discordId),
    deviceId: verified.deviceId,
    scopes: verified.scopes,
    jti: verified.jti,
    iat: verified.iat,
    device,
  }
}
