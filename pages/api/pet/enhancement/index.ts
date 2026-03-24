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
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Import calcLevelPenalty instead of old LEVEL_PENALTY_FACTOR
import { GAME_CONSTANTS, calcGlowTier, calcGlowIntensity, calcLevelPenalty } from "@/utils/gameConstants"

const MAX_ENHANCEMENT_BY_RARITY: Record<string, number> = GAME_CONSTANTS.MAX_ENHANCEMENT_BY_RARITY
// --- END AI-MODIFIED ---
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

    // --- AI-REPLACED (2026-03-22) ---
    // Reason: Old linear penalty + unconditional destroy logic didn't match bot
    // What the new code does better: Diminishing-returns curve + destroy conditional on failure (matches bot)
    // --- Original code (commented out for rollback) ---
    // const levelPenalty = Math.max(0.1, 1 - LEVEL_PENALTY_FACTOR * equipInv.enhancement_level)
    // const effectiveSuccess = scrollProps.success_rate * levelPenalty
    // const effectiveDestroy = scrollProps.destroy_rate
    // --- End original code ---
    const effectiveSuccess = scrollProps.success_rate * calcLevelPenalty(equipInv.enhancement_level)
    const destroyRate = scrollProps.destroy_rate
    // --- END AI-REPLACED ---

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

      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Log enhancement attempt + check achievements
      const newAchievements = await logAndCheckAchievements(userId, {
        inventoryid: equipInv.inventoryid,
        itemName: equipInv.lg_items.name,
        scrollName: scrollInv.lg_items.name,
        outcome: "success",
        fromLevel: equipInv.enhancement_level,
        toLevel: newLevel,
        itemRarity: equipInv.lg_items.rarity,
        glowTier,
      })
      // --- END AI-MODIFIED ---

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
        newAchievements,
      })
    }

    // --- AI-REPLACED (2026-03-22) ---
    // Reason: Destroy was an unconditional band on same roll, didn't match bot logic
    // What the new code does better: Destroy is now conditional on failure (second roll), matching the bot
    // --- Original code (commented out for rollback) ---
    // if (roll < effectiveSuccess + effectiveDestroy) {
    // --- End original code ---
    if (Math.random() < destroyRate) {
    // --- END AI-REPLACED ---
      await prisma.lg_pet_equipment.deleteMany({
        where: { userid: userId, itemid: equipInv.lg_items.itemid },
      })
      await prisma.lg_user_inventory.delete({ where: { inventoryid: equipInv.inventoryid } })

      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Log destroy + check achievements
      const newAchievements = await logAndCheckAchievements(userId, {
        inventoryid: equipInv.inventoryid,
        itemName: equipInv.lg_items.name,
        scrollName: scrollInv.lg_items.name,
        outcome: "destroyed",
        fromLevel: equipInv.enhancement_level,
        toLevel: null,
        itemRarity: equipInv.lg_items.rarity,
      })
      // --- END AI-MODIFIED ---

      return res.status(200).json({
        outcome: "destroyed",
        itemName: equipInv.lg_items.name,
        newAchievements,
      })
    }

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Log fail + check achievements
    const newAchievements = await logAndCheckAchievements(userId, {
      inventoryid: equipInv.inventoryid,
      itemName: equipInv.lg_items.name,
      scrollName: scrollInv.lg_items.name,
      outcome: "failed",
      fromLevel: equipInv.enhancement_level,
      toLevel: null,
      itemRarity: equipInv.lg_items.rarity,
    })
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      outcome: "failed",
      itemName: equipInv.lg_items.name,
      currentLevel: equipInv.enhancement_level,
      newAchievements,
    })
  },
})

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Enhancement logging + achievement checking helper
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
        userid: userId,
        inventoryid: params.inventoryid,
        item_name: params.itemName,
        scroll_name: params.scrollName,
        outcome: params.outcome,
        from_level: params.fromLevel,
        to_level: params.toLevel,
      },
    })

    const existingAchievements = await prisma.lg_enhancement_achievements.findMany({
      where: { userid: userId },
      select: { achievement_key: true },
    })
    const has = new Set(existingAchievements.map(a => a.achievement_key))

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
      const highRarities = ["LEGENDARY", "MYTHICAL"]
      checks.push({ key: "destroy_legendary", condition: highRarities.includes(params.itemRarity) })
    }

    if (params.glowTier === "celestial") {
      checks.push({ key: "celestial_glow", condition: true })
    }

    const recentLogs = await prisma.lg_enhancement_log.findMany({
      where: { userid: userId },
      orderBy: { created_at: "desc" },
      take: 10,
      select: { outcome: true },
    })

    const consecutiveSuccesses = recentLogs.findIndex(l => l.outcome !== "success")
    const actualSuccessStreak = consecutiveSuccesses === -1 ? recentLogs.length : consecutiveSuccesses
    checks.push({ key: "lucky_streak_5", condition: actualSuccessStreak >= 5 })

    const consecutiveFails = recentLogs.findIndex(l => l.outcome !== "failed")
    const actualFailStreak = consecutiveFails === -1 ? recentLogs.length : consecutiveFails
    checks.push({ key: "unlucky_streak_10", condition: actualFailStreak >= 10 })

    const survivedDestroyCount = recentLogs
      .filter(l => l.outcome === "failed")
      .length
    if (params.outcome === "failed") {
      const recentWithDestroy = await prisma.lg_enhancement_log.count({
        where: {
          userid: userId,
          outcome: { in: ["failed", "destroyed"] },
          created_at: { gte: new Date(Date.now() - 86400000) },
        },
      })
      const recentDestroyed = await prisma.lg_enhancement_log.count({
        where: {
          userid: userId,
          outcome: "destroyed",
          created_at: { gte: new Date(Date.now() - 86400000) },
        },
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
          // unique constraint -- already unlocked
        }
      }
    }
  } catch (err) {
    console.error("Enhancement log/achievement error:", err)
  }

  return newAchievements
}
// --- END AI-MODIFIED ---
