// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Shared server-side helpers for "Feature Your Server"
//          API routes:
//           - isListingPremiumGuild: thin wrapper around the
//             premium_guilds.premium_until check used by every
//             listing endpoint that needs to gate access
//           - listingGracePeriodInfo: derives whether a guild is
//             inside the 30-day grace window after expiry, so the
//             public profile page can keep rendering with a
//             "renew to keep your listing live" banner instead of
//             404'ing immediately
//           - signPreviewToken / verifyPreviewToken: HMAC for the
//             ?preview=<token> escape hatch shown in the Discord
//             notification embed so Ari can review the page before
//             approving it
// ============================================================
import crypto from "crypto"
import { prisma } from "./prisma"
import { LISTING_GRACE_PERIOD_DAYS } from "@/constants/ServerListingData"

export interface ListingPremiumStatus {
  isPremium: boolean
  premiumUntil: Date | null
  /** True if premium is expired but still inside the grace window. */
  inGracePeriod: boolean
  /** True if grace window has elapsed -- listing should be hidden. */
  graceExpired: boolean
  /** Days remaining in the grace period (0 if not in grace). */
  graceDaysRemaining: number
}

export async function getListingPremiumStatus(
  guildId: bigint,
): Promise<ListingPremiumStatus> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  const now = new Date()
  if (!row) {
    return {
      isPremium: false,
      premiumUntil: null,
      inGracePeriod: false,
      graceExpired: true,
      graceDaysRemaining: 0,
    }
  }
  const premiumUntil = row.premium_until
  const isPremium = premiumUntil > now
  if (isPremium) {
    return {
      isPremium: true,
      premiumUntil,
      inGracePeriod: false,
      graceExpired: false,
      graceDaysRemaining: 0,
    }
  }
  const graceUntil = new Date(premiumUntil.getTime() + LISTING_GRACE_PERIOD_DAYS * 86400_000)
  const inGracePeriod = now < graceUntil
  const graceDaysRemaining = inGracePeriod
    ? Math.ceil((graceUntil.getTime() - now.getTime()) / 86400_000)
    : 0
  return {
    isPremium: false,
    premiumUntil,
    inGracePeriod,
    graceExpired: !inGracePeriod,
    graceDaysRemaining,
  }
}

/** Convenience boolean used by API routes that just need a hard yes/no. */
export async function isListingPremiumGuild(guildId: bigint): Promise<boolean> {
  const status = await getListingPremiumStatus(guildId)
  return status.isPremium
}

// --- Preview tokens for unapproved listings ---------------------------------
// We sign `slug` with HMAC-SHA256 using BOT_HTTP_SHARED_SECRET. The token is
// short-lived (24h default) and base64url-encoded so it can ride safely in a
// query string. The preview escape hatch is what lets Ari look at the rendered
// page before flipping status=APPROVED in the DB.

const PREVIEW_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function getPreviewSecret(): string {
  const secret = process.env.BOT_HTTP_SHARED_SECRET
  if (!secret) {
    // We deliberately throw rather than silently signing with a default --
    // a missing secret in production should fail loud, not let anyone
    // forge preview tokens.
    throw new Error("BOT_HTTP_SHARED_SECRET is not configured")
  }
  return secret
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64url(str: string): Buffer {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, "base64")
}

export function signPreviewToken(slug: string, ttlMs = PREVIEW_TOKEN_TTL_MS): string {
  const expiresAt = Date.now() + ttlMs
  const payload = `${slug}.${expiresAt}`
  const sig = crypto
    .createHmac("sha256", getPreviewSecret())
    .update(payload)
    .digest()
  return `${expiresAt.toString(36)}.${base64url(sig)}`
}

/**
 * Returns true if `token` was produced by signPreviewToken for the same
 * slug AND has not expired. Constant-time comparison protects against
 * timing attacks even though the surface is small.
 */
export function verifyPreviewToken(slug: string, token: string): boolean {
  if (!token || !token.includes(".")) return false
  try {
    const [expRaw, sigRaw] = token.split(".", 2)
    const expiresAt = parseInt(expRaw, 36)
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false
    const expected = crypto
      .createHmac("sha256", getPreviewSecret())
      .update(`${slug}.${expiresAt}`)
      .digest()
    const provided = fromBase64url(sigRaw)
    if (provided.length !== expected.length) return false
    return crypto.timingSafeEqual(provided, expected)
  } catch {
    return false
  }
}
