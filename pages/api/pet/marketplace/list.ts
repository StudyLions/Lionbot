// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Create a marketplace listing - removes items from
//          seller inventory and creates active listing
// ============================================================

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Fix TOCTOU race condition by moving inventory read inside
//          transaction with SELECT FOR UPDATE. Add integer validation,
//          rate limiting, max price cap, active listing limit, equipped
//          item check, and overflow guard.
// --- Original code (commented out for rollback) ---
// import { prisma } from "@/utils/prisma"
// import { getAuthContext } from "@/utils/adminAuth"
// import { apiHandler } from "@/utils/apiHandler"
// import { getExpiresAt } from "@/utils/marketplace"
//
// export default apiHandler({
//   async POST(req, res) {
//     const auth = await getAuthContext(req)
//     if (!auth) return res.status(401).json({ error: "Not authenticated" })
//     const userId = BigInt(auth.discordId)
//
//     const { itemId, quantity, pricePerUnit, currency, enhancementLevel = 0 } = req.body
//     if (!itemId || !quantity || !pricePerUnit || !currency) {
//       return res.status(400).json({ error: "Missing required fields: itemId, quantity, pricePerUnit, currency" })
//     }
//     if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" })
//     if (pricePerUnit < 1) return res.status(400).json({ error: "Price must be at least 1" })
//     if (!["GOLD", "GEMS"].includes(currency)) return res.status(400).json({ error: "Currency must be GOLD or GEMS" })
//
//     const item = await prisma.lg_items.findUnique({ where: { itemid: itemId } })
//     if (!item) return res.status(404).json({ error: "Item not found" })
//     if (!item.tradeable) return res.status(400).json({ error: "This item cannot be traded" })
//
//     const inventoryRow = await prisma.lg_user_inventory.findFirst({
//       where: { userid: userId, itemid: itemId, enhancement_level: enhancementLevel },
//     })
//     if (!inventoryRow || inventoryRow.quantity < quantity) {
//       return res.status(400).json({ error: `You don't have enough of this item (have ${inventoryRow?.quantity ?? 0}, need ${quantity})` })
//     }
//
//     const expiresAt = getExpiresAt()
//
//     await prisma.$transaction(async (tx) => {
//       if (inventoryRow.quantity === quantity) {
//         await tx.lg_user_inventory.delete({ where: { inventoryid: inventoryRow.inventoryid } })
//       } else {
//         await tx.lg_user_inventory.update({
//           where: { inventoryid: inventoryRow.inventoryid },
//           data: { quantity: { decrement: quantity } },
//         })
//       }
//
//       await tx.lg_marketplace_listings.create({
//         data: {
//           seller_userid: userId,
//           itemid: itemId,
//           enhancement_level: enhancementLevel,
//           quantity_listed: quantity,
//           quantity_remaining: quantity,
//           price_per_unit: pricePerUnit,
//           currency,
//           status: "ACTIVE",
//           expires_at: expiresAt,
//         },
//       })
//     })
//
//     return res.status(200).json({ success: true, message: `Listed ${quantity}x ${item.name} for ${pricePerUnit} ${currency} each` })
//   },
// })
// --- End original code ---

import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Import scroll snapshot helpers to preserve enhancement data on listings
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 -- drop the flat MAX_ACTIVE_LISTINGS_PER_USER import
// in favor of the tier-aware getMaxActiveListings helper. getExpiresAt now
// accepts a tier so the seller's listing duration matches their LionHeart
// perks. The cap-check returns the polite LISTING_CAP_REACHED grandfather
// error so existing free sellers above the new cap aren't disrupted -- they
// just can't add new listings until they're back under the cap.
import {
  getExpiresAt, MAX_PRICE_PER_UNIT,
  snapshotScrollSlots, computeTotalBonus,
} from "@/utils/marketplace"
import {
  getUserTier, getMaxActiveListings, getNextTierWithMoreListings,
  LION_HEART_TIER_LABELS,
} from "@/utils/subscription"
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
import { checkRateLimit } from "@/utils/rateLimit"

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 -- HttpError now carries an optional `body` for
// rich client responses (e.g. LISTING_CAP_REACHED needs to surface the
// current count, the cap, and the suggested upgrade tier so the UI can
// render a helpful upgrade prompt instead of a flat error string).
class HttpError extends Error {
  status: number
  body?: Record<string, unknown>
  constructor(status: number, message: string, body?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.body = body
  }
}
// --- END AI-MODIFIED ---

export default apiHandler({
  async POST(req, res) {
    const auth = await getAuthContext(req)
    if (!auth) return res.status(401).json({ error: "Not authenticated" })
    const userId = BigInt(auth.discordId)

    const { itemId, currency, enhancementLevel: rawEnhancement = 0 } = req.body
    const quantity = Math.floor(Number(req.body.quantity))
    const pricePerUnit = Math.floor(Number(req.body.pricePerUnit))
    const enhancementLevel = Math.floor(Number(rawEnhancement))

    if (!itemId || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be a positive integer" })
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit < 1) {
      return res.status(400).json({ error: "Price must be at least 1" })
    }
    if (pricePerUnit > MAX_PRICE_PER_UNIT) {
      return res.status(400).json({ error: `Price cannot exceed ${MAX_PRICE_PER_UNIT.toLocaleString()}` })
    }
    if (!["GOLD", "GEMS"].includes(currency)) {
      return res.status(400).json({ error: "Currency must be GOLD or GEMS" })
    }

    const totalValue = pricePerUnit * quantity
    if (totalValue > 2_000_000_000) {
      return res.status(400).json({ error: "Total listing value exceeds maximum safe value" })
    }

    if (!checkRateLimit(`list:${auth.discordId}`, 3000)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." })
    }

    const item = await prisma.lg_items.findUnique({ where: { itemid: itemId } })
    if (!item) return res.status(404).json({ error: "Item not found" })
    if (!item.tradeable) return res.status(400).json({ error: "This item cannot be traded" })

    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 -- resolve the seller's effective LionHeart
    // tier outside the transaction so we can use it for both the active-
    // listings cap AND the listing duration. tier resolution is a single
    // index lookup so doing it pre-transaction keeps the txn short.
    const sellerTier = await getUserTier(userId)
    const cap = getMaxActiveListings(sellerTier)
    // --- END AI-MODIFIED ---

    try {
      await prisma.$transaction(async (tx) => {
        const activeCount = await tx.lg_marketplace_listings.count({
          where: { seller_userid: userId, status: "ACTIVE" },
        })
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Marketplace 2.0 GRANDFATHER RULE -- existing listings are
        // never modified. If a free seller is over the new cap (e.g. they
        // had 30 listings under the old "everyone gets 30" world and we
        // later lower the free cap), they keep every listing they have --
        // they just can't ADD a new one until enough sell or expire to put
        // them back under the cap. The error response includes the cap,
        // current count, and the cheapest upgrade that would help so the
        // UI can render a friendly upsell.
        if (activeCount >= cap) {
          const upgradeTier = getNextTierWithMoreListings(sellerTier)
          throw new HttpError(
            403,
            `You have ${activeCount} active listings (your limit is ${cap}). ` +
              `Existing listings will stay until they sell or expire -- ` +
              (upgradeTier
                ? `upgrade to ${LION_HEART_TIER_LABELS[upgradeTier]} to list more.`
                : `you are already on the highest tier.`),
            {
              code: "LISTING_CAP_REACHED",
              currentCount: activeCount,
              cap,
              tier: sellerTier,
              upgradeTier,
            },
          )
        }
        // --- END AI-MODIFIED ---

        const equipped = await tx.lg_pet_equipment.findFirst({
          where: { userid: userId, itemid: itemId },
        })
        if (equipped) {
          throw new HttpError(400, "Unequip this item before listing it for sale")
        }

        const inventoryRows = await tx.$queryRaw<any[]>`
          SELECT * FROM lg_user_inventory
          WHERE userid = ${userId} AND itemid = ${itemId} AND enhancement_level = ${enhancementLevel}
          FOR UPDATE
        `
        const inventoryRow = inventoryRows[0]
        if (!inventoryRow || inventoryRow.quantity < quantity) {
          throw new HttpError(400, `You don't have enough of this item (have ${inventoryRow?.quantity ?? 0}, need ${quantity})`)
        }
        // --- AI-MODIFIED (2026-04-23) ---
        // Purpose: Block listing locked / favorited items so users don't
        // accidentally sell something they explicitly protected. Unlock
        // from the inventory page first.
        if (inventoryRow.is_locked) {
          throw new HttpError(400, "This item is locked. Unlock it from your inventory before selling.")
        }
        // --- END AI-MODIFIED ---

        // --- AI-MODIFIED (2026-03-21) ---
        // Purpose: Snapshot enhancement slots before removing inventory, so scroll
        // data is preserved on the listing and can be restored to the buyer
        const rawSlots = await tx.lg_enhancement_slots.findMany({
          where: { inventoryid: inventoryRow.inventoryid },
          orderBy: { slot_number: "asc" },
          include: {
            lg_items: {
              select: {
                name: true,
                lg_scroll_properties: { select: { success_rate: true } },
              },
            },
          },
        })
        const scrollData = rawSlots.length > 0 ? snapshotScrollSlots(rawSlots) : null
        const totalBonus = computeTotalBonus(scrollData)
        // --- END AI-MODIFIED ---

        if (inventoryRow.quantity === quantity) {
          await tx.lg_user_inventory.delete({ where: { inventoryid: inventoryRow.inventoryid } })
        } else {
          await tx.lg_user_inventory.update({
            where: { inventoryid: inventoryRow.inventoryid },
            data: { quantity: { decrement: quantity } },
          })
        }

        // --- AI-MODIFIED (2026-03-21) ---
        // Purpose: Store scroll_data and total_bonus on the listing
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Marketplace 2.0 -- pass the seller's tier so LionHeart
        // members get longer listing windows (FREE=7d, LH=14d, LH+=21d,
        // LH++=30d). The duration is baked into the row at creation time,
        // so existing listings keep whatever duration they were originally
        // given.
        await tx.lg_marketplace_listings.create({
          data: {
            seller_userid: userId,
            itemid: itemId,
            enhancement_level: enhancementLevel,
            quantity_listed: quantity,
            quantity_remaining: quantity,
            price_per_unit: pricePerUnit,
            currency,
            status: "ACTIVE",
            expires_at: getExpiresAt(sellerTier),
            scroll_data: scrollData ? (scrollData as any) : undefined,
            total_bonus: totalBonus,
          },
        })
        // --- END AI-MODIFIED ---
        // --- END AI-MODIFIED ---
      })

      return res.status(200).json({
        success: true,
        message: `Listed ${quantity}x ${item.name} for ${pricePerUnit} ${currency} each`,
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Surface the rich error body (currently only used for
        // LISTING_CAP_REACHED) so the client can render a contextual
        // upgrade prompt instead of a flat error string.
        return res.status(e.status).json({ error: e.message, ...(e.body ?? {}) })
        // --- END AI-MODIFIED ---
      }
      throw e
    }
  },
})

// --- END AI-MODIFIED ---
