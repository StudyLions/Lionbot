// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Shared marketplace utilities - listing expiry,
//          DM notification webhook, constants
// ============================================================
import { prisma } from "@/utils/prisma"

const LISTING_DURATION_DAYS = 7
const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export async function expireListings() {
  const now = new Date()
  const expired = await prisma.lg_marketplace_listings.findMany({
    where: { status: "ACTIVE", expires_at: { lt: now } },
    select: { listingid: true, seller_userid: true, itemid: true, enhancement_level: true, quantity_remaining: true },
  })

  for (const listing of expired) {
    await prisma.$transaction([
      prisma.lg_marketplace_listings.update({
        where: { listingid: listing.listingid },
        data: { status: "EXPIRED" },
      }),
      prisma.lg_user_inventory.create({
        data: {
          userid: listing.seller_userid,
          itemid: listing.itemid,
          enhancement_level: listing.enhancement_level,
          quantity: listing.quantity_remaining,
          source: "TRADE",
        },
      }),
    ])
  }

  return expired.length
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
