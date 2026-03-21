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
import {
  getExpiresAt, MAX_PRICE_PER_UNIT, MAX_ACTIVE_LISTINGS_PER_USER,
  snapshotScrollSlots, computeTotalBonus,
} from "@/utils/marketplace"
// --- END AI-MODIFIED ---
import { checkRateLimit } from "@/utils/rateLimit"

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

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

    try {
      await prisma.$transaction(async (tx) => {
        const activeCount = await tx.lg_marketplace_listings.count({
          where: { seller_userid: userId, status: "ACTIVE" },
        })
        if (activeCount >= MAX_ACTIVE_LISTINGS_PER_USER) {
          throw new HttpError(400, `You can have at most ${MAX_ACTIVE_LISTINGS_PER_USER} active listings`)
        }

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
            expires_at: getExpiresAt(),
            scroll_data: scrollData ?? undefined,
            total_bonus: totalBonus,
          },
        })
        // --- END AI-MODIFIED ---
      })

      return res.status(200).json({
        success: true,
        message: `Listed ${quantity}x ${item.name} for ${pricePerUnit} ${currency} each`,
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message })
      }
      throw e
    }
  },
})

// --- END AI-MODIFIED ---
