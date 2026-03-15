// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement API - enhance equipment with scrolls
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const MAX_ENHANCEMENT_BY_RARITY: Record<string, number> = {
  COMMON: 5, UNCOMMON: 7, RARE: 10, EPIC: 12, LEGENDARY: 15, MYTHICAL: 20,
}
const LEVEL_PENALTY_FACTOR = 0.08

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const equipCategories = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS"]

    const [equipment, scrolls] = await Promise.all([
      prisma.lg_user_inventory.findMany({
        where: { userid: userId, lg_items: { category: { in: equipCategories as any } } },
        select: {
          inventoryid: true,
          enhancement_level: true,
          lg_items: { select: { itemid: true, name: true, rarity: true, slot: true, category: true } },
        },
      }),
      prisma.lg_user_inventory.findMany({
        where: { userid: userId, lg_items: { category: "SCROLL" as any } },
        select: {
          inventoryid: true,
          quantity: true,
          lg_items: {
            select: {
              itemid: true,
              name: true,
              rarity: true,
              lg_scroll_properties: { select: { success_rate: true, destroy_rate: true, target_slot: true } },
            },
          },
        },
      }),
    ])

    const equipResult = equipment.map((e) => ({
      inventoryId: e.inventoryid,
      enhancementLevel: e.enhancement_level,
      maxLevel: MAX_ENHANCEMENT_BY_RARITY[e.lg_items.rarity] ?? 5,
      item: {
        id: e.lg_items.itemid,
        name: e.lg_items.name,
        rarity: e.lg_items.rarity,
        slot: e.lg_items.slot,
        category: e.lg_items.category,
      },
    }))

    const scrollResult = scrolls.map((s) => ({
      inventoryId: s.inventoryid,
      quantity: s.quantity,
      item: {
        id: s.lg_items.itemid,
        name: s.lg_items.name,
        rarity: s.lg_items.rarity,
      },
      properties: s.lg_items.lg_scroll_properties
        ? {
            successRate: s.lg_items.lg_scroll_properties.success_rate,
            destroyRate: s.lg_items.lg_scroll_properties.destroy_rate,
            targetSlot: s.lg_items.lg_scroll_properties.target_slot,
          }
        : null,
    }))

    return res.status(200).json({ equipment: equipResult, scrolls: scrollResult })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { equipmentInventoryId, scrollInventoryId } = req.body

    if (!equipmentInventoryId || !scrollInventoryId) {
      return res.status(400).json({ error: "equipmentInventoryId and scrollInventoryId required" })
    }

    const equipInv = await prisma.lg_user_inventory.findFirst({
      where: { inventoryid: equipmentInventoryId, userid: userId },
      include: { lg_items: true },
    })
    if (!equipInv) return res.status(404).json({ error: "Equipment not found" })

    const scrollInv = await prisma.lg_user_inventory.findFirst({
      where: { inventoryid: scrollInventoryId, userid: userId },
      include: { lg_items: { include: { lg_scroll_properties: true } } },
    })
    if (!scrollInv || scrollInv.quantity < 1) {
      return res.status(404).json({ error: "Scroll not found or none remaining" })
    }

    const scrollProps = scrollInv.lg_items.lg_scroll_properties
    if (!scrollProps) return res.status(400).json({ error: "Item is not a scroll" })

    const maxLevel = MAX_ENHANCEMENT_BY_RARITY[equipInv.lg_items.rarity] ?? 5
    if (equipInv.enhancement_level >= maxLevel) {
      return res.status(400).json({ error: "Item already at max enhancement" })
    }

    const levelPenalty = Math.max(0.1, 1 - LEVEL_PENALTY_FACTOR * equipInv.enhancement_level)
    const effectiveSuccess = scrollProps.success_rate * levelPenalty
    const effectiveDestroy = scrollProps.destroy_rate

    if (scrollInv.quantity <= 1) {
      await prisma.lg_user_inventory.delete({ where: { inventoryid: scrollInv.inventoryid } })
    } else {
      await prisma.lg_user_inventory.update({
        where: { inventoryid: scrollInv.inventoryid },
        data: { quantity: scrollInv.quantity - 1 },
      })
    }

    const roll = Math.random()

    if (roll < effectiveSuccess) {
      await prisma.lg_user_inventory.update({
        where: { inventoryid: equipInv.inventoryid },
        data: { enhancement_level: equipInv.enhancement_level + 1 },
      })
      return res.status(200).json({
        outcome: "success",
        itemName: equipInv.lg_items.name,
        newLevel: equipInv.enhancement_level + 1,
        maxLevel,
      })
    }

    if (roll < effectiveSuccess + effectiveDestroy) {
      await prisma.lg_pet_equipment.deleteMany({
        where: { userid: userId, itemid: equipInv.lg_items.itemid },
      })
      await prisma.lg_user_inventory.delete({ where: { inventoryid: equipInv.inventoryid } })
      return res.status(200).json({
        outcome: "destroyed",
        itemName: equipInv.lg_items.name,
      })
    }

    return res.status(200).json({
      outcome: "failed",
      itemName: equipInv.lg_items.name,
      currentLevel: equipInv.enhancement_level,
    })
  },
})
