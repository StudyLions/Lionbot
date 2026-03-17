// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement API - enhance equipment with scrolls
// ============================================================
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: MapleStory-style scroll system -- bonus_value per scroll,
//          enhancement slot history, glow tier calculation
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { GAME_CONSTANTS, calcGlowTier, calcGlowIntensity } from "@/utils/gameConstants"

const MAX_ENHANCEMENT_BY_RARITY: Record<string, number> = GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY
const LEVEL_PENALTY_FACTOR = GAME_CONSTANTS.LEVEL_PENALTY_FACTOR
const ENHANCEMENT_GOLD_BONUS = GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS
const ENHANCEMENT_DROP_BONUS = GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const equipCategories = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

    const [equipment, scrolls] = await Promise.all([
      prisma.lg_user_inventory.findMany({
        where: { userid: userId, lg_items: { category: { in: equipCategories as any } } },
        select: {
          inventoryid: true,
          enhancement_level: true,
          lg_items: { select: { itemid: true, name: true, rarity: true, slot: true, category: true, asset_path: true } },
          lg_enhancement_slots: {
            select: { slot_number: true, scroll_name: true, bonus_value: true, scroll_itemid: true },
            orderBy: { slot_number: "asc" },
          },
        },
      }),
      prisma.lg_user_inventory.findMany({
        where: { userid: userId, lg_items: { category: "SCROLL" as any }, quantity: { gt: 0 } },
        select: {
          inventoryid: true,
          quantity: true,
          lg_items: {
            select: {
              itemid: true,
              name: true,
              rarity: true,
              asset_path: true,
              lg_scroll_properties: { select: { success_rate: true, destroy_rate: true, target_slot: true, bonus_value: true } },
            },
          },
        },
      }),
    ])

    const equipResult = equipment.map((e) => {
      const totalBonus = e.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
      const glowTier = calcGlowTier(e.enhancement_level, totalBonus)
      const glowIntensity = calcGlowIntensity(e.enhancement_level)
      return {
        inventoryId: e.inventoryid,
        enhancementLevel: e.enhancement_level,
        maxLevel: MAX_ENHANCEMENT_BY_RARITY[e.lg_items.rarity] ?? 5,
        totalBonus,
        glowTier,
        glowIntensity,
        item: {
          id: e.lg_items.itemid,
          name: e.lg_items.name,
          rarity: e.lg_items.rarity,
          slot: e.lg_items.slot,
          category: e.lg_items.category,
          assetPath: e.lg_items.asset_path,
        },
        slots: e.lg_enhancement_slots.map((s) => ({
          slotNumber: s.slot_number,
          scrollName: s.scroll_name,
          bonusValue: s.bonus_value,
        })),
      }
    })

    const scrollResult = scrolls.map((s) => ({
      inventoryId: s.inventoryid,
      quantity: s.quantity,
      item: {
        id: s.lg_items.itemid,
        name: s.lg_items.name,
        rarity: s.lg_items.rarity,
        assetPath: s.lg_items.asset_path,
      },
      properties: s.lg_items.lg_scroll_properties
        ? {
            successRate: s.lg_items.lg_scroll_properties.success_rate,
            destroyRate: s.lg_items.lg_scroll_properties.destroy_rate,
            targetSlot: s.lg_items.lg_scroll_properties.target_slot,
            bonusValue: s.lg_items.lg_scroll_properties.bonus_value,
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
      const newLevel = equipInv.enhancement_level + 1
      const bonusValue = scrollProps.bonus_value

      await prisma.$transaction([
        prisma.lg_user_inventory.update({
          where: { inventoryid: equipInv.inventoryid },
          data: { enhancement_level: newLevel },
        }),
        prisma.lg_enhancement_slots.upsert({
          where: { inventoryid_slot_number: { inventoryid: equipInv.inventoryid, slot_number: newLevel } },
          create: {
            inventoryid: equipInv.inventoryid,
            slot_number: newLevel,
            scroll_itemid: scrollInv.lg_items.itemid,
            scroll_name: scrollInv.lg_items.name,
            bonus_value: bonusValue,
          },
          update: {},
        }),
      ])

      const allSlots = await prisma.lg_enhancement_slots.findMany({
        where: { inventoryid: equipInv.inventoryid },
      })
      const totalBonus = allSlots.reduce((sum, s) => sum + s.bonus_value, 0)
      const glowTier = calcGlowTier(newLevel, totalBonus)

      const goldGained = bonusValue * ENHANCEMENT_GOLD_BONUS * 100
      const dropGained = bonusValue * ENHANCEMENT_DROP_BONUS * 100

      return res.status(200).json({
        outcome: "success",
        itemName: equipInv.lg_items.name,
        newLevel,
        maxLevel,
        bonusGained: bonusValue,
        goldGained: Math.round(goldGained * 10) / 10,
        dropGained: Math.round(dropGained * 100) / 100,
        totalBonus,
        glowTier,
        scrollName: scrollInv.lg_items.name,
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
// --- END AI-MODIFIED ---
