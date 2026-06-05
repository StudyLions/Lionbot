// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, transport-agnostic ENHANCEMENT logic — the ONE
//          validated path used by BOTH the website
//          (pages/api/pet/enhancement/index.ts) and the Anki addon
//          (pages/api/anki/pet/enhance.ts, bearer). The success/destroy
//          RNG, the scroll consumption, the stack-split-on-success/destroy
//          handling, the glow-tier math, and the achievement logging all
//          live here — server-side, never client-trusted, so the addon
//          can't cheat enhancement outcomes.
//
//          Extracted verbatim from the web route (mechanics unchanged).
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import {
  GAME_CONSTANTS,
  calcGlowTier,
  calcGlowIntensity,
  calcLevelPenalty,
} from "@/utils/gameConstants"

const MAX_ENHANCEMENT_BY_RARITY: Record<string, number> = GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY
const ENHANCEMENT_GOLD_BONUS = GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS
const ENHANCEMENT_DROP_BONUS = GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS
const EQUIP_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

export async function getEnhanceView(userId: bigint) {
  const [equipment, scrolls] = await Promise.all([
    prisma.lg_user_inventory.findMany({
      where: { userid: userId, lg_items: { category: { in: EQUIP_CATEGORIES as any } } },
      select: {
        inventoryid: true,
        enhancement_level: true,
        quantity: true,
        is_locked: true,
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
        is_locked: true,
        lg_items: {
          select: {
            itemid: true, name: true, rarity: true, asset_path: true,
            lg_scroll_properties: { select: { success_rate: true, destroy_rate: true, target_slot: true, bonus_value: true } },
          },
        },
      },
    }),
  ])

  const equipResult = equipment.map((e) => {
    const totalBonus = e.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0)
    return {
      inventoryId: e.inventoryid,
      enhancementLevel: e.enhancement_level,
      maxLevel: MAX_ENHANCEMENT_BY_RARITY[e.lg_items.rarity] ?? 5,
      quantity: e.quantity,
      isLocked: e.is_locked,
      totalBonus,
      glowTier: calcGlowTier(e.enhancement_level, totalBonus),
      glowIntensity: calcGlowIntensity(e.enhancement_level),
      item: {
        id: e.lg_items.itemid, name: e.lg_items.name, rarity: e.lg_items.rarity,
        slot: e.lg_items.slot, category: e.lg_items.category, assetPath: e.lg_items.asset_path,
      },
      slots: e.lg_enhancement_slots.map((s) => ({
        slotNumber: s.slot_number, scrollName: s.scroll_name, bonusValue: s.bonus_value,
      })),
    }
  })

  const scrollResult = scrolls.map((s) => ({
    inventoryId: s.inventoryid,
    quantity: s.quantity,
    isLocked: s.is_locked,
    item: {
      id: s.lg_items.itemid, name: s.lg_items.name, rarity: s.lg_items.rarity, assetPath: s.lg_items.asset_path,
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

  return { equipment: equipResult, scrolls: scrollResult }
}

export async function applyEnhancement(
  userId: bigint,
  equipmentInventoryId: number,
  scrollInventoryId: number
) {
  const eqId = Math.floor(Number(equipmentInventoryId))
  const scId = Math.floor(Number(scrollInventoryId))
  if (!Number.isInteger(eqId) || eqId < 1 || !Number.isInteger(scId) || scId < 1) {
    throw new PetServiceError(400, "missing_ids", "Valid equipmentInventoryId and scrollInventoryId required")
  }

  const equipInv = await prisma.lg_user_inventory.findFirst({
    where: { inventoryid: eqId, userid: userId },
    include: { lg_items: true },
  })
  if (!equipInv) throw new PetServiceError(404, "equipment_not_found", "Equipment not found")

  const scrollInv = await prisma.lg_user_inventory.findFirst({
    where: { inventoryid: scId, userid: userId },
    include: { lg_items: { include: { lg_scroll_properties: true } } },
  })
  if (!scrollInv || scrollInv.quantity < 1) {
    throw new PetServiceError(404, "scroll_not_found", "Scroll not found or none remaining")
  }
  const scrollProps = scrollInv.lg_items.lg_scroll_properties
  if (!scrollProps) throw new PetServiceError(400, "not_a_scroll", "Item is not a scroll")

  if (equipInv.is_locked) {
    throw new PetServiceError(400, "equipment_locked", "This equipment is locked. Unlock it before enhancing.")
  }
  if (scrollInv.is_locked) {
    throw new PetServiceError(400, "scroll_locked", "This scroll is locked. Unlock it before using it to enhance.")
  }

  const maxLevel = MAX_ENHANCEMENT_BY_RARITY[equipInv.lg_items.rarity] ?? 5
  if (equipInv.enhancement_level >= maxLevel) {
    throw new PetServiceError(400, "max_level", "Item already at max enhancement")
  }

  const effectiveSuccess = scrollProps.success_rate * calcLevelPenalty(equipInv.enhancement_level)
  const destroyRate = scrollProps.destroy_rate

  // Consume the scroll first (matches the web route).
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

    let enhancedInventoryId = equipInv.inventoryid
    if (equipInv.quantity > 1) {
      // Split one copy off the stack so only it gains the level.
      const [, newRow] = await prisma.$transaction([
        prisma.lg_user_inventory.update({
          where: { inventoryid: equipInv.inventoryid },
          data: { quantity: equipInv.quantity - 1 },
        }),
        prisma.lg_user_inventory.create({
          data: {
            userid: userId, itemid: equipInv.lg_items.itemid, source: equipInv.source,
            quantity: 1, enhancement_level: newLevel,
          },
          select: { inventoryid: true },
        }),
      ])
      enhancedInventoryId = newRow.inventoryid
      await prisma.lg_enhancement_slots.create({
        data: {
          inventoryid: enhancedInventoryId, slot_number: newLevel,
          scroll_itemid: scrollInv.lg_items.itemid, scroll_name: scrollInv.lg_items.name, bonus_value: bonusValue,
        },
      })
    } else {
      await prisma.$transaction([
        prisma.lg_user_inventory.update({
          where: { inventoryid: equipInv.inventoryid },
          data: { enhancement_level: newLevel },
        }),
        prisma.lg_enhancement_slots.upsert({
          where: { inventoryid_slot_number: { inventoryid: equipInv.inventoryid, slot_number: newLevel } },
          create: {
            inventoryid: equipInv.inventoryid, slot_number: newLevel,
            scroll_itemid: scrollInv.lg_items.itemid, scroll_name: scrollInv.lg_items.name, bonus_value: bonusValue,
          },
          update: {},
        }),
      ])
    }

    const allSlots = await prisma.lg_enhancement_slots.findMany({ where: { inventoryid: enhancedInventoryId } })
    const totalBonus = allSlots.reduce((sum, s) => sum + s.bonus_value, 0)
    const glowTier = calcGlowTier(newLevel, totalBonus)
    const goldGained = bonusValue * ENHANCEMENT_GOLD_BONUS * 100
    const dropGained = bonusValue * ENHANCEMENT_DROP_BONUS * 100

    const newAchievements = await logAndCheckAchievements(userId, {
      inventoryid: enhancedInventoryId, itemName: equipInv.lg_items.name, scrollName: scrollInv.lg_items.name,
      outcome: "success", fromLevel: equipInv.enhancement_level, toLevel: newLevel,
      itemRarity: equipInv.lg_items.rarity, glowTier,
    })

    return {
      outcome: "success", itemName: equipInv.lg_items.name, newLevel, maxLevel,
      bonusGained: bonusValue, goldGained: Math.round(goldGained * 10) / 10,
      dropGained: Math.round(dropGained * 100) / 100, totalBonus, glowTier,
      scrollName: scrollInv.lg_items.name, newAchievements,
    }
  }

  if (Math.random() < destroyRate) {
    if (equipInv.quantity > 1) {
      await prisma.lg_user_inventory.update({
        where: { inventoryid: equipInv.inventoryid },
        data: { quantity: equipInv.quantity - 1 },
      })
    } else {
      await prisma.lg_pet_equipment.deleteMany({ where: { userid: userId, itemid: equipInv.lg_items.itemid } })
      await prisma.lg_pet_cosmetics.deleteMany({ where: { userid: userId, itemid: equipInv.lg_items.itemid } })
      await prisma.lg_user_inventory.delete({ where: { inventoryid: equipInv.inventoryid } })
    }
    const newAchievements = await logAndCheckAchievements(userId, {
      inventoryid: equipInv.inventoryid, itemName: equipInv.lg_items.name, scrollName: scrollInv.lg_items.name,
      outcome: "destroyed", fromLevel: equipInv.enhancement_level, toLevel: null, itemRarity: equipInv.lg_items.rarity,
    })
    return { outcome: "destroyed", itemName: equipInv.lg_items.name, newAchievements }
  }

  const newAchievements = await logAndCheckAchievements(userId, {
    inventoryid: equipInv.inventoryid, itemName: equipInv.lg_items.name, scrollName: scrollInv.lg_items.name,
    outcome: "failed", fromLevel: equipInv.enhancement_level, toLevel: null, itemRarity: equipInv.lg_items.rarity,
  })
  return { outcome: "failed", itemName: equipInv.lg_items.name, currentLevel: equipInv.enhancement_level, newAchievements }
}

interface LogParams {
  inventoryid: number
  itemName: string
  scrollName: string
  outcome: string
  fromLevel: number
  toLevel: number | null
  itemRarity: string
  glowTier?: string
}

async function logAndCheckAchievements(userId: bigint, params: LogParams): Promise<string[]> {
  const newAchievements: string[] = []
  try {
    await prisma.lg_enhancement_log.create({
      data: {
        userid: userId, inventoryid: params.inventoryid, item_name: params.itemName,
        scroll_name: params.scrollName, outcome: params.outcome,
        from_level: params.fromLevel, to_level: params.toLevel,
      },
    })

    const existingAchievements = await prisma.lg_enhancement_achievements.findMany({
      where: { userid: userId }, select: { achievement_key: true },
    })
    const has = new Set(existingAchievements.map((a) => a.achievement_key))
    const totalLogs = await prisma.lg_enhancement_log.count({ where: { userid: userId } })

    const checks: { key: string; condition: boolean }[] = [
      { key: "first_enhance", condition: totalLogs === 1 },
      { key: "enhancement_master", condition: totalLogs >= 100 },
    ]
    if (params.outcome === "success" && params.toLevel !== null) {
      checks.push({ key: "plus_5", condition: params.toLevel >= 5 })
      checks.push({ key: "plus_10", condition: params.toLevel >= 10 })
    }
    if (params.outcome === "destroyed") {
      checks.push({ key: "first_destroy", condition: true })
      checks.push({ key: "destroy_legendary", condition: ["LEGENDARY", "MYTHICAL"].includes(params.itemRarity) })
    }
    if (params.glowTier === "celestial") {
      checks.push({ key: "celestial_glow", condition: true })
    }

    const recentLogs = await prisma.lg_enhancement_log.findMany({
      where: { userid: userId }, orderBy: { created_at: "desc" }, take: 10, select: { outcome: true },
    })
    const cs = recentLogs.findIndex((l) => l.outcome !== "success")
    checks.push({ key: "lucky_streak_5", condition: (cs === -1 ? recentLogs.length : cs) >= 5 })
    const cf = recentLogs.findIndex((l) => l.outcome !== "failed")
    checks.push({ key: "unlucky_streak_10", condition: (cf === -1 ? recentLogs.length : cf) >= 10 })

    if (params.outcome === "failed") {
      const recentWithDestroy = await prisma.lg_enhancement_log.count({
        where: { userid: userId, outcome: { in: ["failed", "destroyed"] }, created_at: { gte: new Date(Date.now() - 86400000) } },
      })
      const recentDestroyed = await prisma.lg_enhancement_log.count({
        where: { userid: userId, outcome: "destroyed", created_at: { gte: new Date(Date.now() - 86400000) } },
      })
      checks.push({ key: "survivor_3", condition: recentWithDestroy - recentDestroyed >= 3 && recentDestroyed === 0 })
    }

    for (const check of checks) {
      if (check.condition && !has.has(check.key)) {
        try {
          await prisma.lg_enhancement_achievements.create({
            data: { userid: userId, achievement_key: check.key },
          })
          newAchievements.push(check.key)
        } catch {
          // unique constraint — already unlocked
        }
      }
    }
  } catch (err) {
    console.error("Enhancement log/achievement error:", err)
  }
  return newAchievements
}
