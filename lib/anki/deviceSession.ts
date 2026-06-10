// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: The single "turn an authenticated identity into a working
//          addon session" core, shared by every Anki auth entry point:
//            - Discord pairing   (pages/api/anki/auth/exchange.ts)
//            - Email sign-in     (pages/api/anki/auth/login.ts)
//            - Email verify      (pages/api/anki/auth/verify-email.ts)
//
//          Responsibilities (extracted verbatim from exchange.ts so the
//          behavior of the Discord path is unchanged):
//            1. bootstrapGameAccount(): create user_config + lg_pets
//               from DB defaults if missing (idempotent) so brand-new
//               users have a working pet + economy.
//            2. createDeviceSession(): upsert the anki_devices row
//               (re-pair friendly: reactivates a revoked device owned
//               by the same user, preserving its review history),
//               mint the bearer + refresh token, build the user/pet
//               snapshot, and return the exact response payload the
//               addon expects from every auth endpoint.
//
//          Security invariants preserved:
//            - A device_id owned by a DIFFERENT user is rejected (409).
//            - A bearer is only returned after the refresh hash is
//              committed; a mint failure rolls back a newly-created
//              device row (but never a reactivated one).
//            - invalidateDeviceCache() so revoked-state caches can't
//              shadow the fresh session.
// ============================================================
import type { NextApiRequest } from "next"
import { prisma } from "@/utils/prisma"
import {
  mintAnkiBearer,
  mintAnkiRefreshToken,
  ANKI_JWT_TTL,
  ANKI_JWT_VERSION,
  DEFAULT_ANKI_SCOPES,
} from "@/lib/anki/auth"
import { isLionheartActive } from "../../pages/api/auth/ios/exchange"
import { invalidateDeviceCache } from "@/lib/anki/requireAuth"

export interface DeviceSessionInput {
  userid: bigint
  deviceId: string
  deviceName: string
  addonVersion?: string | null
  osPlatform?: string | null
  ankiVersion?: string | null
  ipPrefix?: string | null
  /** "discord" (pairing) or "email" (standalone account). Included in
   *  the user snapshot so the addon can render the right identity. */
  accountType?: "discord" | "email"
  /** For email accounts: the sign-in address, echoed in the snapshot. */
  email?: string | null
}

export interface AnkiPetSnapshot {
  pet_name: string
  level: number
  xp: string
  food: number
  bath: number
  sleep: number
}

export interface AnkiSessionPayload {
  session_token: string
  /** JWT lifetime as a jose duration string (e.g. "1h") — the exact
   *  value the addon has always received from exchange. */
  session_token_ttl: string
  refresh_token: string
  device_id: string
  user: {
    discord_id: string
    username: string
    global_name: string | null
    avatar: string | null
    is_premium: boolean
    account_type: "discord" | "email"
    email: string | null
  }
  pet: AnkiPetSnapshot | null
}

// Single-shape result (not a discriminated union): this codebase
// compiles with strict:false, where `!r.ok` does not narrow a union,
// so callers couldn't touch the error fields. ok:true ⇒ payload set;
// ok:false ⇒ status/error/message set.
export interface DeviceSessionResult {
  ok: boolean
  payload?: AnkiSessionPayload
  status?: number
  error?: string
  message?: string
}

/**
 * Brand-new-account bootstrap. A user who has never used LionBot has
 * no user_config / lg_pets row — but the addon must work for them.
 * Create both rows from DB defaults if missing, ordered so the FK
 * targets exist first (anki_devices + lg_pets reference user_config).
 * Idempotent (ON CONFLICT DO NOTHING). Throws on DB failure.
 */
export async function bootstrapGameAccount(userid: bigint): Promise<void> {
  await prisma.$executeRaw`INSERT INTO user_config (userid) VALUES (${userid}) ON CONFLICT (userid) DO NOTHING`
  await prisma.$executeRaw`INSERT INTO lg_pets (userid) VALUES (${userid}) ON CONFLICT (userid) DO NOTHING`
}

/**
 * Upsert the device row, mint bearer + refresh, build the user/pet
 * snapshot. Returns the full addon session payload (the same shape
 * for every auth method) or a structured error.
 */
export async function createDeviceSession(
  input: DeviceSessionInput
): Promise<DeviceSessionResult> {
  const {
    userid,
    deviceId,
    deviceName,
    addonVersion,
    osPlatform,
    ankiVersion,
    ipPrefix,
    accountType = "discord",
    email = null,
  } = input

  // Mint the refresh token first; if anything fails after this we
  // abort without leaving a device row pointing at a dead token.
  const { token: refreshToken, hash: refreshHash } = mintAnkiRefreshToken()

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
      where: { device_id: deviceId, userid },
      data: {
        device_name: deviceName,
        refresh_token_hash: refreshHash,
        refresh_token_version: 1,
        jwt_version: ANKI_JWT_VERSION,
        scopes: DEFAULT_ANKI_SCOPES.slice(),
        addon_version: addonVersion || null,
        os_platform: osPlatform || null,
        anki_version: ankiVersion || null,
        last_ip_prefix: ipPrefix || undefined,
        last_seen_at: new Date(),
        revoked_at: null,
        revoked_reason: null,
      },
    })
    if (reactivated.count === 0) {
      await prisma.anki_devices.create({
        data: {
          device_id: deviceId,
          userid,
          device_name: deviceName,
          refresh_token_hash: refreshHash,
          refresh_token_version: 1,
          jwt_version: ANKI_JWT_VERSION,
          scopes: DEFAULT_ANKI_SCOPES.slice(),
          addon_version: addonVersion || null,
          os_platform: osPlatform || null,
          anki_version: ankiVersion || null,
          last_ip_prefix: ipPrefix || undefined,
        },
      })
      createdNew = true
    }
  } catch (err: unknown) {
    console.error("[anki/deviceSession] device register failed:", err)
    const code = (err as { code?: string }).code
    if (code === "P2002") {
      return {
        ok: false,
        status: 409,
        error: "device_already_exists",
        message: "This device is registered to another account",
      }
    }
    return {
      ok: false,
      status: 503,
      error: "db_unavailable",
      message: "Could not register device",
    }
  }
  // Clear any cached (revoked) state so the new bearer works at once.
  invalidateDeviceCache(deviceId)

  let sessionToken: string
  try {
    sessionToken = await mintAnkiBearer({
      discordId: userid.toString(),
      deviceId,
    })
  } catch (err) {
    console.error("[anki/deviceSession] mint bearer failed:", err)
    // Only roll back a row we just CREATED — never delete a
    // reactivated pre-existing device (that would cascade-delete the
    // user's anki_review_events history).
    if (createdNew) {
      await prisma.anki_devices
        .delete({ where: { device_id: deviceId } })
        .catch((e) =>
          console.error("[anki/deviceSession] rollback delete failed:", e)
        )
    }
    return {
      ok: false,
      status: 500,
      error: "mint_failed",
      message: "Could not issue session token",
    }
  }

  // User snapshot + pet basics so the addon can render immediately
  // without a second round-trip.
  let username = userid.toString()
  const globalName: string | null = null
  let avatar: string | null = null
  let petSnapshot: AnkiPetSnapshot | null = null

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
    console.warn("[anki/deviceSession] user snapshot lookup failed:", err)
    // Non-fatal — the addon still gets the bearer.
  }

  let isPremium = false
  try {
    isPremium = await isLionheartActive(userid.toString())
  } catch (err) {
    console.warn("[anki/deviceSession] premium lookup failed:", err)
  }

  return {
    ok: true,
    payload: {
      session_token: sessionToken,
      session_token_ttl: ANKI_JWT_TTL,
      refresh_token: refreshToken,
      device_id: deviceId,
      user: {
        discord_id: userid.toString(),
        username,
        global_name: globalName,
        avatar,
        is_premium: isPremium,
        account_type: accountType,
        email,
      },
      pet: petSnapshot,
    },
  }
}

/**
 * Best-effort client IP → privacy-preserving prefix for the device
 * row (IPv4 /24; IPv6 skipped). Prefers the platform-trusted source:
 * a client can spoof x-forwarded-for, but Vercel overwrites x-real-ip
 * with the true peer address, so this can't be poisoned the way the
 * bare XFF[0] could. (Moved verbatim from exchange.ts.)
 */
export function extractIpPrefix(req: NextApiRequest): string | null {
  const h = req.headers
  const pickFirst = (v: string | string[] | undefined): string | null =>
    typeof v === "string" ? v.split(",")[0].trim() : Array.isArray(v) ? v[0] || null : null
  const raw =
    pickFirst(h["x-real-ip"]) ||
    pickFirst(h["x-vercel-forwarded-for"]) ||
    pickFirst(h["x-forwarded-for"]) ||
    req.socket.remoteAddress
  if (!raw) return null
  // IPv4 -> /24. Only emit when it's a clean dotted quad of numeric
  // octets, so we never hand Postgres a malformed INET. Bare network
  // IP (last octet zeroed) — NOT CIDR (Prisma's INET serializer uses
  // Rust's IpAddr parser which rejects a /24 suffix).
  const v4 = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const octets = [v4[1], v4[2], v4[3]].map((o) => parseInt(o, 10))
    if (octets.every((o) => o >= 0 && o <= 255)) {
      return `${octets[0]}.${octets[1]}.${octets[2]}.0`
    }
    return null
  }
  // IPv6 truncation is error-prone (double-:: collapses), and this
  // is best-effort abuse-triage telemetry only — skip rather than
  // risk an invalid INET that fails the device insert.
  return null
}
