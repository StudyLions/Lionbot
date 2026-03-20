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

const LISTING_DURATION_DAYS = 7
const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export const MARKETPLACE_FEE_PERCENT = 5

export const MAX_PRICE_PER_UNIT = 10_000_000
export const MAX_ACTIVE_LISTINGS_PER_USER = 30

let lastExpireRun = 0
const EXPIRE_DEBOUNCE_MS = 30_000

export async function expireListingsDebounced() {
  const now = Date.now()
  if (now - lastExpireRun < EXPIRE_DEBOUNCE_MS) return 0
  lastExpireRun = now
  return expireListings()
}

export async function expireListings() {
  const expired = await prisma.$queryRaw<
    Array<{ listingid: number; seller_userid: bigint; itemid: number; enhancement_level: number; quantity_remaining: number }>
  >`
    UPDATE lg_marketplace_listings
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' AND expires_at < NOW()
    RETURNING listingid, seller_userid, itemid, enhancement_level, quantity_remaining
  `

  for (const listing of expired) {
    try {
      await upsertInventoryStandalone(
        listing.seller_userid,
        listing.itemid,
        listing.enhancement_level,
        listing.quantity_remaining,
      )
    } catch (e) {
      console.error(`Failed to return items for expired listing ${listing.listingid}:`, e)
    }
  }

  return expired.length
}

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

async function upsertInventoryStandalone(
  userid: bigint,
  itemid: number,
  enhancementLevel: number,
  quantity: number,
) {
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

export function getExpiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + LISTING_DURATION_DAYS)
  return d
}

export async function notifySellerDM(data: {
  sellerUserId: string
  buyerName: string
  itemName: string
  quantity: number
  totalPrice: number
  currency: string
  remaining: number
}) {
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
