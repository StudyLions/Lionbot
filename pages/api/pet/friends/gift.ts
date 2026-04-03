// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Gift gold or an inventory item to a friend.
//          Gold gifts have a 5% tax. Item gifts preserve
//          enhancement level and scroll/slot data.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const GIFT_TAX_PERCENT = 5

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const senderId = BigInt(auth.discordId)
    const { targetUserId, type, amount, inventoryId } = req.body as {
      targetUserId?: string
      type?: string
      amount?: number
      inventoryId?: number
    }

    const targetId = parseBigInt(targetUserId, "targetUserId")

    if (targetId === senderId) {
      return res.status(400).json({ error: "You cannot gift to yourself" })
    }
    if (type !== "GOLD" && type !== "ITEM") {
      return res.status(400).json({ error: 'Type must be "GOLD" or "ITEM"' })
    }

    const [lower, upper] = senderId < targetId
      ? [senderId, targetId]
      : [targetId, senderId]

    const friendship = await prisma.lg_friends.findUnique({
      where: { userid1_userid2: { userid1: lower, userid2: upper } },
    })
    if (!friendship) {
      return res.status(403).json({ error: "You can only gift to friends" })
    }

    if (type === "GOLD") {
      if (!amount || typeof amount !== "number" || amount < 1 || !Number.isInteger(amount)) {
        return res.status(400).json({ error: "Amount must be a positive integer" })
      }
      if (amount > 1_000_000) {
        return res.status(400).json({ error: "Maximum gift amount is 1,000,000 gold" })
      }

      const taxAmount = Math.floor(amount * GIFT_TAX_PERCENT / 100)
      const recipientReceives = amount - taxAmount

      await prisma.$transaction(async (tx) => {
        const senders = await tx.$queryRaw<{ gold: bigint }[]>`
          SELECT gold FROM user_config WHERE userid = ${senderId} FOR UPDATE
        `
        const sender = senders[0]
        // --- AI-MODIFIED (2026-04-03) ---
        // Purpose: Use ValidationError so apiHandler returns the message to the client
        //          instead of swallowing it as "Internal server error"
        if (!sender || Number(sender.gold) < amount) {
          throw new ValidationError("Not enough gold", 400)
        }
        // --- END AI-MODIFIED ---

        await tx.$queryRaw`SELECT 1 FROM user_config WHERE userid = ${targetId} FOR UPDATE`

        await tx.user_config.update({
          where: { userid: senderId },
          data: { gold: { decrement: amount } },
        })
        await tx.user_config.update({
          where: { userid: targetId },
          data: { gold: { increment: recipientReceives } },
        })

        await tx.lg_gold_transactions.create({
          data: {
            transaction_type: "GIFT",
            actorid: senderId,
            from_account: senderId,
            to_account: targetId,
            amount: amount,
            description: `Gift to ${targetId.toString()} (tax: ${taxAmount})`,
          },
        })
      })

      return res.status(200).json({
        success: true,
        taxAmount,
      })
    }

    if (!inventoryId || typeof inventoryId !== "number") {
      return res.status(400).json({ error: "inventoryId is required for item gifts" })
    }

    await prisma.$transaction(async (tx) => {
      const items = await tx.$queryRaw<any[]>`
        SELECT i.*, it.tradeable
        FROM lg_user_inventory i
        JOIN lg_items it ON it.itemid = i.itemid
        WHERE i.inventoryid = ${inventoryId} AND i.userid = ${senderId}
        FOR UPDATE OF i
      `
      const item = items[0]
      // --- AI-MODIFIED (2026-04-03) ---
      // Purpose: Use ValidationError so apiHandler returns the message to the client
      if (!item) {
        throw new ValidationError("Item not found in your inventory", 404)
      }
      if (!item.tradeable) {
        throw new ValidationError("This item cannot be traded", 400)
      }

      const equipped = await tx.lg_pet_equipment.findFirst({
        where: { userid: senderId, itemid: item.itemid },
      })
      if (equipped) {
        throw new ValidationError("Unequip this item before gifting it", 400)
      }
      // --- END AI-MODIFIED ---

      const scrollSlots = await tx.lg_enhancement_slots.findMany({
        where: { inventoryid: inventoryId },
      })

      await tx.lg_user_inventory.delete({
        where: { inventoryid: inventoryId },
      })

      const newItem = await tx.lg_user_inventory.create({
        data: {
          userid: targetId,
          itemid: item.itemid,
          enhancement_level: item.enhancement_level,
          quantity: item.quantity,
          source: "TRADE",
        },
      })

      for (const s of scrollSlots) {
        await tx.$executeRaw`INSERT INTO lg_enhancement_slots (inventoryid, slot_number, scroll_itemid, scroll_name, bonus_value, enhanced_at) VALUES (${newItem.inventoryid}, ${s.slot_number}, ${s.scroll_itemid}, ${s.scroll_name}, ${s.bonus_value}, ${s.enhanced_at})`
      }
    })

    return res.status(200).json({ success: true })
  },
})
