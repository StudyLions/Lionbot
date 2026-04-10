// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-10
// Purpose: Auto-equip the best item per slot based on total
//          enhancement bonus, with rarity as tiebreaker.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

const CATEGORY_TO_SLOT: Record<string, string> = {
  HAT: "HEAD",
  GLASSES: "FACE",
  COSTUME: "BODY",
  SHIRT: "BODY",
  WINGS: "BACK",
  BOOTS: "FEET",
}

const RARITY_ORDER: Record<string, number> = {
  COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHICAL: 5,
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const invItems = await prisma.lg_user_inventory.findMany({
      where: {
        userid: userId,
        lg_items: { category: { in: EQUIPMENT_CATEGORIES as any } },
      },
      select: {
        inventoryid: true,
        lg_items: {
          select: { itemid: true, name: true, category: true, slot: true, rarity: true, asset_path: true },
        },
        lg_enhancement_slots: {
          select: { bonus_value: true },
        },
      },
    })

    const bestBySlot: Record<string, { itemid: number; totalBonus: number; rarityRank: number }> = {}

    for (const inv of invItems) {
      const slot = inv.lg_items.slot || CATEGORY_TO_SLOT[inv.lg_items.category]
      if (!slot) continue

      const totalBonus = inv.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
      const rarityRank = RARITY_ORDER[inv.lg_items.rarity] ?? 0
      const current = bestBySlot[slot]

      if (
        !current ||
        totalBonus > current.totalBonus ||
        (totalBonus === current.totalBonus && rarityRank > current.rarityRank)
      ) {
        bestBySlot[slot] = { itemid: inv.lg_items.itemid, totalBonus, rarityRank }
      }
    }

    const slotsToEquip = Object.entries(bestBySlot)
    if (slotsToEquip.length === 0) {
      return res.status(400).json({ error: "No equippable items found in inventory" })
    }

    await prisma.$transaction(
      slotsToEquip.map(([slot, { itemid }]) =>
        prisma.lg_pet_equipment.upsert({
          where: { userid_slot: { userid: userId, slot: slot as any } },
          create: { userid: userId, slot: slot as any, itemid },
          update: { itemid },
        })
      )
    )

    const equipment = await prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: {
        slot: true,
        lg_items: {
          select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
        },
      },
    })

    const equipmentMap: Record<string, any> = {}
    for (const e of equipment) {
      equipmentMap[e.slot] = {
        id: e.lg_items.itemid,
        name: e.lg_items.name,
        category: e.lg_items.category,
        rarity: e.lg_items.rarity,
        assetPath: e.lg_items.asset_path,
      }
    }

    return res.status(200).json({
      success: true,
      equipped: slotsToEquip.length,
      equipment: equipmentMap,
    })
  },
})
