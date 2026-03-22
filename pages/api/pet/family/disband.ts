// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Disband family (leader only) - returns items/gold
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (membership.role !== "LEADER") {
      return res.status(403).json({ error: "Only the leader can disband the family" })
    }

    const family = membership.lg_families

    await prisma.$transaction(async (tx) => {
      const bankItems = await tx.lg_family_bank.findMany({
        where: { family_id: family.family_id },
      })

      for (const item of bankItems) {
        const newInv = await tx.lg_user_inventory.create({
          data: {
            userid: userId,
            itemid: item.itemid,
            enhancement_level: item.enhancement_level,
            quantity: item.quantity,
            source: "DROP" as any,
          },
        })

        if (item.scroll_data && Array.isArray(item.scroll_data)) {
          const slots = item.scroll_data as Array<{
            slot_number: number
            scroll_itemid: number | null
            bonus_value: number
          }>
          for (const slot of slots) {
            await tx.$executeRaw`INSERT INTO lg_enhancement_slots (inventoryid, slot_number, scroll_itemid, bonus_value) VALUES (${newInv.inventoryid}, ${slot.slot_number}, ${slot.scroll_itemid}, ${slot.bonus_value})`
          }
        }
      }

      if (family.gold > BigInt(0)) {
        await tx.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: family.gold } },
        })
      }

      await tx.lg_families.delete({
        where: { family_id: family.family_id },
      })
    })

    return res.status(200).json({ success: true })
  },
})
