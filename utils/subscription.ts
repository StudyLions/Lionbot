// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- shared server-side helpers for looking
//          up a user's effective LionHeart tier and the marketplace
//          perk numbers tied to each tier.
//
//          The single source of truth for "what tier is this user?"
//          and "what marketplace perks does that tier unlock?"
//
//          Tier strings deliberately align with the bot
//          (StudyLion/src/modules/premium/cog.py) and the website's
//          existing constants/SubscriptionData.ts so we don't end
//          up with two slightly different ladders. If you change a
//          number here, also update the bot's mirror in
//          StudyLion/src/modules/liongotchi/marketplace_perks.py.
// ============================================================
import { prisma } from "@/utils/prisma"

export type LionHeartTier =
  | "FREE"
  | "LIONHEART"
  | "LIONHEART_PLUS"
  | "LIONHEART_PLUS_PLUS"

export const LION_HEART_TIER_LABELS: Record<LionHeartTier, string> = {
  FREE: "Base",
  LIONHEART: "LionHeart",
  LIONHEART_PLUS: "LionHeart+",
  LIONHEART_PLUS_PLUS: "LionHeart++",
}

export const LION_HEART_TIER_RANK: Record<LionHeartTier, number> = {
  FREE: 0,
  LIONHEART: 1,
  LIONHEART_PLUS: 2,
  LIONHEART_PLUS_PLUS: 3,
}

/**
 * Resolve a user's effective LionHeart tier from the database.
 * Returns "FREE" for any user without an ACTIVE subscription row,
 * so callers can always treat the result as a non-null tier.
 */
export async function getUserTier(userid: bigint): Promise<LionHeartTier> {
  const row = await prisma.user_subscriptions.findUnique({
    where: { userid },
    select: { tier: true, status: true },
  })
  if (!row) return "FREE"
  if (row.status !== "ACTIVE" && row.status !== "CANCELLING") return "FREE"
  if (
    row.tier === "LIONHEART" ||
    row.tier === "LIONHEART_PLUS" ||
    row.tier === "LIONHEART_PLUS_PLUS"
  ) {
    return row.tier
  }
  return "FREE"
}

export function tierAtLeast(tier: LionHeartTier, required: LionHeartTier): boolean {
  return LION_HEART_TIER_RANK[tier] >= LION_HEART_TIER_RANK[required]
}

// ----------------------------------------------------------------
// Marketplace 2.0 perk ladders. Keeping these here (next to the tier
// helper) means buy.ts / list.ts only need a single import. The numbers
// match the plan and are mirrored by the bot in marketplace_perks.py.
// ----------------------------------------------------------------

const MARKETPLACE_FEE_PERCENT_BY_TIER: Record<LionHeartTier, number> = {
  FREE: 5,
  LIONHEART: 4,
  LIONHEART_PLUS: 3,
  LIONHEART_PLUS_PLUS: 2,
}

const LISTING_DURATION_DAYS_BY_TIER: Record<LionHeartTier, number> = {
  FREE: 7,
  LIONHEART: 14,
  LIONHEART_PLUS: 21,
  LIONHEART_PLUS_PLUS: 30,
}

const MAX_ACTIVE_LISTINGS_BY_TIER: Record<LionHeartTier, number> = {
  FREE: 30,
  LIONHEART: 50,
  LIONHEART_PLUS: 75,
  LIONHEART_PLUS_PLUS: 100,
}

export function getMarketplaceFeePercent(tier: LionHeartTier): number {
  return MARKETPLACE_FEE_PERCENT_BY_TIER[tier] ?? MARKETPLACE_FEE_PERCENT_BY_TIER.FREE
}

export function getListingDurationDays(tier: LionHeartTier): number {
  return LISTING_DURATION_DAYS_BY_TIER[tier] ?? LISTING_DURATION_DAYS_BY_TIER.FREE
}

export function getMaxActiveListings(tier: LionHeartTier): number {
  return MAX_ACTIVE_LISTINGS_BY_TIER[tier] ?? MAX_ACTIVE_LISTINGS_BY_TIER.FREE
}

/**
 * Lowest tier required to unlock a higher max-listings cap than the
 * current tier. Used by /api/pet/marketplace/list to point an
 * over-capped seller at the cheapest upgrade that would help them.
 * Returns null if they're already at the max tier.
 */
export function getNextTierWithMoreListings(tier: LionHeartTier): LionHeartTier | null {
  const order: LionHeartTier[] = ["FREE", "LIONHEART", "LIONHEART_PLUS", "LIONHEART_PLUS_PLUS"]
  const currentCap = getMaxActiveListings(tier)
  for (const candidate of order) {
    if (LION_HEART_TIER_RANK[candidate] <= LION_HEART_TIER_RANK[tier]) continue
    if (getMaxActiveListings(candidate) > currentCap) return candidate
  }
  return null
}

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 3 -- featured-listing slot caps.
// FREE = 0 slots (the feature is premium-only). The cap is checked by
// /api/pet/marketplace/feature whenever a seller toggles a listing's
// is_featured to true. Mirrored in the bot's marketplace_perks.py.
const FEATURED_SLOTS_BY_TIER: Record<LionHeartTier, number> = {
  FREE: 0,
  LIONHEART: 1,
  LIONHEART_PLUS: 3,
  LIONHEART_PLUS_PLUS: 10,
}

export function getFeaturedListingSlots(tier: LionHeartTier): number {
  return FEATURED_SLOTS_BY_TIER[tier] ?? FEATURED_SLOTS_BY_TIER.FREE
}
// --- END AI-MODIFIED ---
