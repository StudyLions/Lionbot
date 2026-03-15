// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Create a marketplace listing - removes items from
//          seller inventory and creates active listing
// ============================================================
import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { getExpiresAt } from "@/utils/marketplace"

export default apiHandler({
  async POST(req, res) {
    const auth = await getAuthContext(req)
    if (!auth) return res.status(401).json({ error: "Not authenticated" })
    const userId = BigInt(auth.discordId)

    const { itemId, quantity, pricePerUnit, currency, enhancementLevel = 0 } = req.body
    if (!itemId || !quantity || !pricePerUnit || !currency) {
      return res.status(400).json({ error: "Missing required fields: itemId, quantity, pricePerUnit, currency" })
    }
    if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" })
    if (pricePerUnit < 1) return res.status(400).json({ error: "Price must be at least 1" })
    if (!["GOLD", "GEMS"].includes(currency)) return res.status(400).json({ error: "Currency must be GOLD or GEMS" })

    const item = await prisma.lg_items.findUnique({ where: { itemid: itemId } })
    if (!item) return res.status(404).json({ error: "Item not found" })
    if (!item.tradeable) return res.status(400).json({ error: "This item cannot be traded" })

    const inventoryRow = await prisma.lg_user_inventory.findFirst({
      where: { userid: userId, itemid: itemId, enhancement_level: enhancementLevel },
    })
    if (!inventoryRow || inventoryRow.quantity < quantity) {
      return res.status(400).json({ error: `You don't have enough of this item (have ${inventoryRow?.quantity ?? 0}, need ${quantity})` })
    }

    const expiresAt = getExpiresAt()

    await prisma.$transaction(async (tx) => {
      if (inventoryRow.quantity === quantity) {
        await tx.lg_user_inventory.delete({ where: { inventoryid: inventoryRow.inventoryid } })
      } else {
        await tx.lg_user_inventory.update({
          where: { inventoryid: inventoryRow.inventoryid },
          data: { quantity: { decrement: quantity } },
        })
      }

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
          expires_at: expiresAt,
        },
      })
    })

    return res.status(200).json({ success: true, message: `Listed ${quantity}x ${item.name} for ${pricePerUnit} ${currency} each` })
  },
})
