// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Shared marketplace utilities - listing expiry,
//          DM notification webhook, constants
// ============================================================

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Fix expireListings race condition with atomic UPDATE...RETURNING,
//          add debouncing, add upsertInventory helper, add marketplace fee constant
// --- Original code (commented out for rollback) ---
// import { prisma } from "@/utils/prisma"
//
// const LISTING_DURATION_DAYS = 7
// const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
// const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""
//
// export async function expireListings() {
//   const now = new Date()
//   const expired = await prisma.lg_marketplace_listings.findMany({
//     where: { status: "ACTIVE", expires_at: { lt: now } },
//     select: { listingid: true, seller_userid: true, itemid: true, enhancement_level: true, quantity_remaining: true },
//   })
//
//   for (const listing of expired) {
//     await prisma.$transaction([
//       prisma.lg_marketplace_listings.update({
//         where: { listingid: listing.listingid },
//         data: { status: "EXPIRED" },
//       }),
//       prisma.lg_user_inventory.create({
//         data: {
//           userid: listing.seller_userid,
//           itemid: listing.itemid,
//           enhancement_level: listing.enhancement_level,
//           quantity: listing.quantity_remaining,
//           source: "TRADE",
//         },
//       }),
//     ])
//   }
//
//   return expired.length
// }
// --- End original code ---

import { prisma } from "@/utils/prisma"

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Shared type for scroll data JSON snapshots stored on marketplace listings/sales
export interface ScrollSlotSnapshot {
  slotNumber: number
  scrollItemId: number
  scrollName: string
  bonusValue: number
  enhancedAt: string
  successRate: number | null
}

export function snapshotScrollSlots(slots: any[]): ScrollSlotSnapshot[] {
  return slots.map((s) => ({
    slotNumber: s.slot_number,
    scrollItemId: s.scroll_itemid,
    scrollName: s.scroll_name ?? s.lg_items?.name ?? "Unknown Scroll",
    bonusValue: s.bonus_value,
    enhancedAt: s.enhanced_at instanceof Date ? s.enhanced_at.toISOString() : String(s.enhanced_at),
    successRate: s.lg_items?.lg_scroll_properties?.success_rate ?? null,
  }))
}

export function computeTotalBonus(scrollData: ScrollSlotSnapshot[] | null): number {
  if (!scrollData || scrollData.length === 0) return 0
  return scrollData.reduce((sum, s) => sum + s.bonusValue, 0)
}
// --- END AI-MODIFIED ---

// --- AI-REPLACED (2026-04-29) ---
// Reason: Marketplace 2.0 -- replace flat-rate constants with tier-aware
//   helpers in utils/subscription.ts. Free users keep the original 5% fee
//   and 7-day duration; LionHeart subscribers get progressively better
//   numbers. Existing listings are NOT touched (durations are baked into
//   the row at creation time, fees apply at sale time and the FREE tier
//   rate is unchanged).
// What the new code does better: single source of truth for the perk
//   ladder, no need to edit two places when LionHeart gets a new tier,
//   and the website + bot can both import the same numbers.
// --- Original code (commented out for rollback) ---
// const LISTING_DURATION_DAYS = 7
// export const MARKETPLACE_FEE_PERCENT = 5
// export const MAX_ACTIVE_LISTINGS_PER_USER = 30
// --- End original code ---
import {
  getListingDurationDays,
  getMarketplaceFeePercent,
  getMaxActiveListings,
  type LionHeartTier,
} from "@/utils/subscription"

// Re-exported so existing call sites can import from one place if they prefer.
export { getListingDurationDays, getMarketplaceFeePercent, getMaxActiveListings }
export type { LionHeartTier }

// Default-tier (FREE) numbers retained as legacy aliases for any code that
// hasn't been migrated yet. They MUST equal the FREE-tier values from
// utils/subscription.ts so behavior is byte-identical for non-subscribers.
export const MARKETPLACE_FEE_PERCENT = getMarketplaceFeePercent("FREE")
export const MAX_ACTIVE_LISTINGS_PER_USER = getMaxActiveListings("FREE")
// --- END AI-REPLACED ---

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
// --- Original code (commented out for rollback) ---
// const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
// --- End original code ---
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export const MAX_PRICE_PER_UNIT = 10_000_000

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 -- store name + speech bubble character caps.
// SPEECH_BUBBLE_MAX_FREE keeps the prompt short for non-subscribers; LionHeart
// members get the longer cap. STORE_NAME_MAX_LENGTH matches the @db.VarChar(40)
// column on lg_user_stores.
export const STORE_NAME_MAX_LENGTH = 40
export const SPEECH_BUBBLE_MAX_FREE = 100
export const SPEECH_BUBBLE_MAX_PREMIUM = 500
// --- END AI-MODIFIED ---

let lastExpireRun = 0
const EXPIRE_DEBOUNCE_MS = 30_000

export async function expireListingsDebounced() {
  const now = Date.now()
  if (now - lastExpireRun < EXPIRE_DEBOUNCE_MS) return 0
  lastExpireRun = now
  return expireListings()
}

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Include scroll_data in expired listings RETURNING clause so scroll
// data can be restored to the seller's inventory on expiry
export async function expireListings() {
  const expired = await prisma.$queryRaw<
    Array<{
      listingid: number
      seller_userid: bigint
      itemid: number
      enhancement_level: number
      quantity_remaining: number
      scroll_data: ScrollSlotSnapshot[] | null
    }>
  >`
    UPDATE lg_marketplace_listings
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' AND expires_at < NOW()
    RETURNING listingid, seller_userid, itemid, enhancement_level, quantity_remaining, scroll_data
  `

  for (const listing of expired) {
    try {
      await restoreInventoryStandalone(
        listing.seller_userid,
        listing.itemid,
        listing.enhancement_level,
        listing.quantity_remaining,
        listing.scroll_data,
      )
    } catch (e) {
      console.error(`Failed to return items for expired listing ${listing.listingid}:`, e)
    }
  }

  return expired.length
}
// --- END AI-MODIFIED ---

export async function upsertInventory(
  tx: any,
  userid: bigint,
  itemid: number,
  enhancementLevel: number,
  quantity: number,
  source: string = "TRADE",
) {
  const existing = await tx.lg_user_inventory.findFirst({
    where: { userid, itemid, enhancement_level: enhancementLevel },
  })
  if (existing) {
    await tx.lg_user_inventory.update({
      where: { inventoryid: existing.inventoryid },
      data: { quantity: { increment: quantity } },
    })
  } else {
    await tx.lg_user_inventory.create({
      data: { userid, itemid, enhancement_level: enhancementLevel, quantity, source },
    })
  }
}

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Scroll-aware inventory restoration for buy, cancel, and expire flows.
// Items with scroll_data always get their own inventory row + recreated enhancement slots.
// Items without scroll_data use the original merge-by-key behavior.
export async function restoreInventoryWithScrolls(
  tx: any,
  userid: bigint,
  itemid: number,
  enhancementLevel: number,
  quantity: number,
  scrollData: ScrollSlotSnapshot[] | null,
  source: string = "TRADE",
) {
  if (scrollData && scrollData.length > 0) {
    const newRow = await tx.lg_user_inventory.create({
      data: { userid, itemid, enhancement_level: enhancementLevel, quantity, source },
    })
    await tx.lg_enhancement_slots.createMany({
      data: scrollData.map((s) => ({
        inventoryid: newRow.inventoryid,
        slot_number: s.slotNumber,
        scroll_itemid: s.scrollItemId,
        scroll_name: s.scrollName,
        bonus_value: s.bonusValue,
        enhanced_at: new Date(s.enhancedAt),
      })),
    })
  } else {
    await upsertInventory(tx, userid, itemid, enhancementLevel, quantity, source)
  }
}

async function restoreInventoryStandalone(
  userid: bigint,
  itemid: number,
  enhancementLevel: number,
  quantity: number,
  scrollData: ScrollSlotSnapshot[] | null,
) {
  if (scrollData && scrollData.length > 0) {
    await prisma.$transaction(async (tx) => {
      const newRow = await tx.lg_user_inventory.create({
        data: { userid, itemid, enhancement_level: enhancementLevel, quantity, source: "TRADE" },
      })
      await tx.lg_enhancement_slots.createMany({
        data: scrollData.map((s) => ({
          inventoryid: newRow.inventoryid,
          slot_number: s.slotNumber,
          scroll_itemid: s.scrollItemId,
          scroll_name: s.scrollName,
          bonus_value: s.bonusValue,
          enhanced_at: new Date(s.enhancedAt),
        })),
      })
    })
  } else {
    const existing = await prisma.lg_user_inventory.findFirst({
      where: { userid, itemid, enhancement_level: enhancementLevel },
    })
    if (existing) {
      await prisma.lg_user_inventory.update({
        where: { inventoryid: existing.inventoryid },
        data: { quantity: { increment: quantity } },
      })
    } else {
      await prisma.lg_user_inventory.create({
        data: { userid, itemid, enhancement_level: enhancementLevel, quantity, source: "TRADE" },
      })
    }
  }
}
// --- END AI-MODIFIED ---

// --- AI-REPLACED (2026-04-29) ---
// Reason: Marketplace 2.0 -- listing duration becomes tier-based instead of
//   a flat 7 days. Free users still get 7 days (identical to legacy behavior),
//   LionHeart subscribers get progressively longer durations.
// What the new code does better: takes an optional tier argument so
//   list.ts can pass the seller's tier; defaults to FREE so any older
//   call site keeps working unchanged.
// --- Original code (commented out for rollback) ---
// export function getExpiresAt(): Date {
//   const d = new Date()
//   d.setDate(d.getDate() + LISTING_DURATION_DAYS)
//   return d
// }
// --- End original code ---
export function getExpiresAt(tier: LionHeartTier = "FREE"): Date {
  const d = new Date()
  d.setDate(d.getDate() + getListingDurationDays(tier))
  return d
}
// --- END AI-REPLACED ---

export async function notifySellerDM(data: {
  sellerUserId: string
  buyerName: string
  itemName: string
  quantity: number
  totalPrice: number
  currency: string
  remaining: number
}) {
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Skip notification when render URL unset (utility cannot return HTTP 503)
  if (!BOT_RENDER_URL) {
    console.warn(
      "notifySellerDM: BOT_RENDER_URL is not configured; skipping marketplace notification",
    )
    return
  }
  // --- END AI-MODIFIED ---
  if (!BOT_RENDER_AUTH) return
  try {
    await fetch(`${BOT_RENDER_URL}/marketplace-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: BOT_RENDER_AUTH },
      body: JSON.stringify({
        type: "SALE",
        seller_userid: data.sellerUserId,
        buyer_name: data.buyerName,
        item_name: data.itemName,
        quantity: data.quantity,
        total_price: data.totalPrice,
        currency: data.currency,
        remaining: data.remaining,
      }),
    })
  } catch {
    // Non-critical: DM failure shouldn't block the sale
  }
}

// --- END AI-MODIFIED ---
