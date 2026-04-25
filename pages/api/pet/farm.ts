// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm API - view plots, water, harvest, plant, clear
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-30) ---
// Purpose: Import shared farm helpers instead of defining locally
import {
  RARITY_GOLD_MULTIPLIER, RARITY_DROP_MULTIPLIER,
  ITEM_DROP_CHANCE_HARVEST,
  rollRarity, tryItemDrop,
} from "@/utils/farmHelpers"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Remove DEV_SPEED=60 (was 60x too fast), fix stage formula,
//          add tier support, material drops, correct transaction types
const GROWTH_PER_VOICE_MINUTE = 1.0
const GROWTH_PER_TEXT_MESSAGE = 2.0

const TIER_WATER_DURATION_MULT: Record<string, number> = {
  NONE: 1.0, LIONHEART: 1.5, LIONHEART_PLUS: 2.0, LIONHEART_PLUS_PLUS: 3.0,
}
const TIER_DEATH_TIMER_HOURS: Record<string, number | null> = {
  NONE: 48, LIONHEART: 72, LIONHEART_PLUS: 96, LIONHEART_PLUS_PLUS: null,
}

function isWatered(lastWatered: Date | null, waterIntervalHours: number, tier: string = "NONE"): boolean {
  if (!lastWatered) return false
  const elapsed = (Date.now() - lastWatered.getTime()) / 1000
  const mult = TIER_WATER_DURATION_MULT[tier] ?? 1.0
  const interval = waterIntervalHours * 3600 * mult
  return elapsed < interval
}

function isDead(lastWatered: Date | null, plantedAt: Date | null, tier: string = "NONE"): boolean {
  if (!plantedAt) return false
  const deathHours = TIER_DEATH_TIMER_HOURS[tier]
  if (deathHours === null || deathHours === undefined) return false
  const ref = lastWatered || plantedAt
  const elapsed = (Date.now() - ref.getTime()) / 1000
  return elapsed > deathHours * 3600
}

function computeProgress(growthPoints: number, growthPointsNeeded: number): {
  stage: number; progress: number; readyToHarvest: boolean
} {
  if (growthPointsNeeded <= 0) return { stage: 1, progress: 0, readyToHarvest: false }
  const totalPerStage = growthPointsNeeded / 5
  const stage = Math.min(5, 1 + Math.floor(growthPoints / totalPerStage))
  const progress = Math.min(100, Math.round((growthPoints / growthPointsNeeded) * 100))
  return { stage, progress, readyToHarvest: stage >= 5 }
}

function estimateTimeRemaining(
  growthPoints: number,
  growthPointsNeeded: number
): number | null {
  if (growthPoints >= growthPointsNeeded) return 0
  const remaining = growthPointsNeeded - growthPoints
  const pointsPerMinute = GROWTH_PER_TEXT_MESSAGE * 2
  if (pointsPerMinute <= 0) return null
  return Math.ceil(remaining / pointsPerMinute) * 60
}

function nextWaterAt(lastWatered: Date | null, waterIntervalHours: number, tier: string = "NONE"): string | null {
  if (!lastWatered) return null
  const mult = TIER_WATER_DURATION_MULT[tier] ?? 1.0
  const interval = waterIntervalHours * 3600 * 1000 * mult
  return new Date(lastWatered.getTime() + interval).toISOString()
}
// --- END AI-MODIFIED ---

function parseAssetPrefix(prefix: string): { plantType: string; typeId: number } {
  const [plantType, idStr] = prefix.split(":")
  return { plantType, typeId: parseInt(idStr, 10) || 1 }
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Fetch pet tier for tier-aware water/death checks; include fullscreen_mode
    const [plots, seeds, ownedSeeds, userConfig, pet] = await Promise.all([
      prisma.lg_user_farm.findMany({
        where: { userid: userId },
        include: { lg_farm_seeds: true },
        orderBy: { plot_id: "asc" },
      }),
      prisma.lg_farm_seeds.findMany({ orderBy: { seed_id: "asc" } }),
      prisma.lg_user_inventory.findMany({
        where: {
          userid: userId,
          lg_items: { category: "FARM_SEED" as any },
        },
        select: {
          inventoryid: true,
          quantity: true,
          lg_items: { select: { itemid: true, name: true } },
        },
      }),
      prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true },
      }),
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        // --- AI-MODIFIED (2026-03-17) ---
        // Purpose: Also fetch active_gameboy_skin_id for frame rendering
        select: { fullscreen_mode: true, active_gameboy_skin_id: true },
        // --- END AI-MODIFIED ---
      }),
    ])

    const userTier = "NONE"

    const result = plots.map((plot) => {
      const seed = plot.lg_farm_seeds
      if (!seed || !plot.planted_at) {
        return {
          plotId: plot.plot_id,
          empty: true,
          dead: plot.dead,
          seed: null,
          stage: 0,
          progress: 0,
          readyToHarvest: false,
          needsWater: false,
          isWatered: false,
          rarity: "COMMON",
          growthPoints: 0,
          growthPointsNeeded: 0,
          goldInvested: 0,
          assetPrefix: null,
          plantType: null,
          typeId: null,
          nextWaterAt: null,
          estimatedSecondsRemaining: null,
          plantedAt: null,
          lastWatered: null,
        }
      }

      const dead = plot.dead || isDead(plot.last_watered, plot.planted_at, userTier)
      const growth = computeProgress(plot.growth_points, seed.growth_points_needed)
      const watered = isWatered(plot.last_watered, seed.water_interval_hours, userTier)
      const { plantType, typeId } = parseAssetPrefix(seed.asset_prefix)

      return {
        plotId: plot.plot_id,
        empty: false,
        dead,
        seed: {
          id: seed.seed_id,
          name: seed.name,
          plantType: seed.plant_type,
          harvestGold: seed.harvest_gold,
          growTimeHours: seed.grow_time_hours,
          waterIntervalHours: seed.water_interval_hours,
          growthPointsNeeded: seed.growth_points_needed,
        },
        stage: dead ? growth.stage : Math.max(plot.growth_stage, growth.stage),
        progress: growth.progress,
        readyToHarvest: !dead && growth.readyToHarvest,
        needsWater: !dead && !growth.readyToHarvest && !watered,
        isWatered: watered,
        rarity: plot.rarity || "COMMON",
        growthPoints: plot.growth_points,
        growthPointsNeeded: seed.growth_points_needed,
        goldInvested: plot.gold_invested,
        assetPrefix: seed.asset_prefix,
        plantType,
        typeId,
        voiceMinutesEarned: plot.voice_minutes_earned || 0,
        messagesEarned: plot.messages_earned || 0,
        nextWaterAt: nextWaterAt(plot.last_watered, seed.water_interval_hours, userTier),
        estimatedSecondsRemaining: estimateTimeRemaining(plot.growth_points, seed.growth_points_needed),
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Farm history includes FARM_PLANT transactions; response includes fullscreen_mode
    let history: Array<{type: string; amount: number; description: string; createdAt: string}> = []
    if (req.query.history === "true") {
      const txns = await prisma.lg_gold_transactions.findMany({
        where: {
          OR: [{ from_account: userId }, { to_account: userId }],
          transaction_type: { in: ["FARM_PLANT", "FARM_HARVEST"] },
        },
        orderBy: { created_at: "desc" },
        take: 20,
        select: {
          transaction_type: true,
          amount: true,
          description: true,
          created_at: true,
        },
      })
      history = txns.map(t => ({
        type: String(t.transaction_type),
        amount: t.amount,
        description: t.description || "",
        createdAt: t.created_at?.toISOString() || "",
      }))
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Resolve active gameboy skin asset path for frame rendering
    const skinRow = pet?.active_gameboy_skin_id
      ? await prisma.lg_gameboy_skins.findUnique({
          where: { skin_id: pet.active_gameboy_skin_id },
          select: { asset_path: true },
        })
      : null
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      plots: result,
      history,
      fullscreenMode: pet?.fullscreen_mode ?? false,
      gameboySkinPath: skinRow?.asset_path ?? null,
      availableSeeds: seeds.map((s) => {
        const { plantType, typeId } = parseAssetPrefix(s.asset_prefix)
        return {
          id: s.seed_id,
          name: s.name,
          plantType: s.plant_type,
          growTimeHours: s.grow_time_hours,
          waterIntervalHours: s.water_interval_hours,
          harvestGold: s.harvest_gold,
          plantCost: s.plant_cost,
          growthPointsNeeded: s.growth_points_needed,
          assetPrefix: s.asset_prefix,
          typeId,
        }
      }),
      ownedSeeds: ownedSeeds.map((s) => ({
        inventoryId: Number(s.inventoryid),
        quantity: s.quantity,
        itemId: Number(s.lg_items.itemid),
        name: s.lg_items.name,
      })),
      gold: Number(userConfig?.gold ?? 0),
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action, plotId, seedId } = req.body

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: Bulk actions (waterAll, harvestAll) don't require plotId
    if (!action) {
      return res.status(400).json({ error: "action required" })
    }

    if (action === "waterAll") {
      const now = new Date()
      const result = await prisma.lg_user_farm.updateMany({
        where: { userid: userId, seed_id: { not: null }, dead: false },
        data: { last_watered: now },
      })
      return res.status(200).json({ success: true, action: "wateredAll", count: result.count })
    }

    // --- AI-MODIFIED (2026-04-24) ---
    // Purpose: Bulk-plant the same seed in every empty plot on the personal farm.
    //          Quality-of-life feature requested by users who found planting
    //          one-plot-at-a-time tedious. Atomic: validates total cost up front,
    //          rolls rarity per-plot independently (preserves the lottery feel).
    if (action === "plantAll") {
      if (!seedId) return res.status(400).json({ error: "seedId required" })

      const [allPlots, seed, userConfig] = await Promise.all([
        prisma.lg_user_farm.findMany({
          where: { userid: userId },
          select: { plot_id: true, seed_id: true, dead: true },
        }),
        prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
        prisma.user_config.findUnique({
          where: { userid: userId },
          select: { gold: true },
        }),
      ])

      if (!seed) return res.status(404).json({ error: "Seed not found" })

      const emptyPlots = allPlots.filter((p) => !p.seed_id && !p.dead)
      if (emptyPlots.length === 0) {
        return res.status(400).json({ error: "No empty plots to plant in" })
      }

      const totalCost = seed.plant_cost * emptyPlots.length
      const currentGold = Number(userConfig?.gold ?? 0)
      if (currentGold < totalCost) {
        return res.status(400).json({
          error: `Not enough gold. Need ${totalCost}G for ${emptyPlots.length} plots (have ${currentGold}G)`,
        })
      }

      const now = new Date()
      const rarityCounts: Record<string, number> = {}
      const ops = emptyPlots.map((p) => {
        const rarity = rollRarity()
        rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + 1
        return prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: p.plot_id } },
          data: {
            seed_id: seedId,
            planted_at: now,
            last_watered: now,
            growth_stage: 1,
            dead: false,
            growth_points: 0,
            gold_invested: seed.plant_cost,
            voice_minutes_earned: 0,
            messages_earned: 0,
            rarity,
          },
        })
      })

      await prisma.$transaction([
        ...ops,
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { decrement: totalCost } },
        }),
        prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_PLANT",
            actorid: userId,
            from_account: userId,
            amount: totalCost,
            description: `Bulk planted ${emptyPlots.length} x ${seed.name}`,
          },
        }),
      ])

      return res.status(200).json({
        success: true,
        action: "plantedAll",
        count: emptyPlots.length,
        totalCost,
        seedName: seed.name,
        rarityCounts,
      })
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Fix harvestAll using raw growth_points check (required 100%) instead of
    // computeProgress() which marks readyToHarvest at stage 5 (80%). This mismatch
    // caused "Harvest All" button to appear but do nothing. Now matches single-harvest
    // and family farm behavior.
    if (action === "harvestAll") {
      const allPlots = await prisma.lg_user_farm.findMany({
        where: { userid: userId, dead: false },
        include: { lg_farm_seeds: true },
      })
      const harvestable = allPlots.filter(p => {
        if (!p.seed_id || !p.lg_farm_seeds) return false
        const growth = computeProgress(p.growth_points, p.lg_farm_seeds.growth_points_needed)
        return growth.readyToHarvest
      })
      if (harvestable.length === 0) {
        return res.status(400).json({ error: "Nothing ready to harvest" })
      }

      let totalGold = 0
      let totalInvested = 0
      let totalVoiceMin = 0
      let totalMessages = 0
      const details: Array<{name: string; rarity: string; gold: number; multiplier: number}> = []
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Collect material drops from each harvested plot
      const allDrops: Array<{ itemId: number; name: string; rarity: string }> = []

      for (const plot of harvestable) {
        const seed = plot.lg_farm_seeds!
        const rarity = plot.rarity || "COMMON"
        const multiplier = RARITY_GOLD_MULTIPLIER[rarity] || 1.0
        const gold = Math.round(seed.harvest_gold * multiplier)
        totalGold += gold
        totalInvested += plot.gold_invested || 0
        totalVoiceMin += plot.voice_minutes_earned || 0
        totalMessages += plot.messages_earned || 0
        details.push({ name: seed.name, rarity, gold, multiplier })

        await prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: plot.plot_id } },
          data: {
            seed_id: null, planted_at: null, last_watered: null,
            growth_stage: 0, dead: false, growth_points: 0, gold_invested: 0,
            voice_minutes_earned: 0, messages_earned: 0, rarity: "COMMON",
          },
        })

        const rarityMult = RARITY_DROP_MULTIPLIER[rarity] || 1.0
        const drops = await tryItemDrop(userId, ITEM_DROP_CHANCE_HARVEST, rarityMult)
        if (drops) allDrops.push(...drops)
      }
      // --- END AI-MODIFIED ---

      if (totalGold > 0) {
        await prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: totalGold } },
        })
        await prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_HARVEST",
            actorid: userId,
            to_account: userId,
            amount: totalGold,
            description: `Bulk harvest ${harvestable.length} plants`,
          },
        })
      }

      return res.status(200).json({
        success: true, action: "harvestedAll",
        count: harvestable.length,
        totalGold, totalInvested,
        netProfit: totalGold - totalInvested,
        totalVoiceMinutes: Math.round(totalVoiceMin),
        totalMessages,
        details,
        materialDrops: allDrops,
      })
    }

    if (action === "remove") {
      if (plotId === undefined) return res.status(400).json({ error: "plotId required" })
      const plot = await prisma.lg_user_farm.findUnique({
        where: { userid_plot_id: { userid: userId, plot_id: plotId } },
      })
      if (!plot) return res.status(404).json({ error: "Plot not found" })
      if (!plot.seed_id) return res.status(400).json({ error: "Plot is empty" })
      if (plot.dead) return res.status(400).json({ error: "Plant is dead, use clear" })

      const invested = plot.gold_invested || 0
      const refund = Math.floor(invested / 2)

      await prisma.lg_user_farm.update({
        where: { userid_plot_id: { userid: userId, plot_id: plotId } },
        data: {
          seed_id: null, planted_at: null, last_watered: null,
          growth_stage: 0, dead: false, growth_points: 0, gold_invested: 0,
          voice_minutes_earned: 0, messages_earned: 0, rarity: "COMMON",
        },
      })

      if (refund > 0) {
        await prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: refund } },
        })
        await prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_HARVEST",
            actorid: userId,
            to_account: userId,
            amount: refund,
            description: `Removed plant (50% refund)`,
          },
        })
      }

      return res.status(200).json({
        success: true, action: "removed", refund, invested,
      })
    }

    if (plotId === undefined) {
      return res.status(400).json({ error: "plotId required for this action" })
    }
    // --- END AI-MODIFIED ---

    if (action === "plant") {
      if (!seedId) return res.status(400).json({ error: "seedId required" })

      const [plot, seed, userConfig] = await Promise.all([
        prisma.lg_user_farm.findUnique({
          where: { userid_plot_id: { userid: userId, plot_id: plotId } },
        }),
        prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
        prisma.user_config.findUnique({
          where: { userid: userId },
          select: { gold: true },
        }),
      ])

      if (!plot) return res.status(404).json({ error: "Plot not found" })
      if (plot.seed_id) return res.status(400).json({ error: "Plot is not empty" })
      if (!seed) return res.status(404).json({ error: "Seed not found" })
      if (Number(userConfig?.gold ?? 0) < seed.plant_cost) {
        return res.status(400).json({ error: `Not enough gold. Need ${seed.plant_cost}` })
      }

      const rarity = rollRarity()

      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Set growth_stage=1 (not 0) to match bot; use FARM_PLANT transaction type
      await prisma.$transaction([
        prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: plotId } },
          data: {
            seed_id: seedId,
            planted_at: new Date(),
            last_watered: new Date(),
            growth_stage: 1,
            dead: false,
            growth_points: 0,
            gold_invested: seed.plant_cost,
            voice_minutes_earned: 0,
            messages_earned: 0,
            rarity,
          },
        }),
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { decrement: seed.plant_cost } },
        }),
        prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_PLANT",
            actorid: userId,
            from_account: userId,
            amount: seed.plant_cost,
            description: `Planted ${seed.name} (${rarity})`,
          },
        }),
      ])
      // --- END AI-MODIFIED ---

      return res.status(200).json({
        success: true,
        action: "planted",
        seedName: seed.name,
        rarity,
        cost: seed.plant_cost,
      })
    }

    const plot = await prisma.lg_user_farm.findUnique({
      where: { userid_plot_id: { userid: userId, plot_id: plotId } },
      include: { lg_farm_seeds: true },
    })
    if (!plot) return res.status(404).json({ error: "Plot not found" })

    if (action === "water") {
      if (!plot.seed_id || !plot.planted_at) {
        return res.status(400).json({ error: "Nothing planted here" })
      }
      if (plot.dead) return res.status(400).json({ error: "Plant is dead" })

      await prisma.lg_user_farm.update({
        where: { userid_plot_id: { userid: userId, plot_id: plotId } },
        data: { last_watered: new Date() },
      })
      return res.status(200).json({ success: true, action: "watered" })
    }

    if (action === "harvest") {
      if (!plot.seed_id || !plot.lg_farm_seeds || !plot.planted_at) {
        return res.status(400).json({ error: "Nothing to harvest" })
      }
      if (plot.dead) return res.status(400).json({ error: "Plant is dead, clear it first" })

      const growth = computeProgress(plot.growth_points, plot.lg_farm_seeds.growth_points_needed)
      if (!growth.readyToHarvest) {
        return res.status(400).json({ error: "Not ready to harvest yet" })
      }

      const rarity = plot.rarity || "COMMON"
      const multiplier = RARITY_GOLD_MULTIPLIER[rarity] || 1.0
      const goldReward = Math.round(plot.lg_farm_seeds.harvest_gold * multiplier)

      await prisma.$transaction([
        prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: plotId } },
          data: {
            seed_id: null, planted_at: null, last_watered: null,
            growth_stage: 0, dead: false,
            growth_points: 0, gold_invested: 0,
            voice_minutes_earned: 0, messages_earned: 0,
            rarity: "COMMON",
          },
        }),
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: goldReward } },
        }),
        prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_HARVEST",
            actorid: userId,
            to_account: userId,
            amount: goldReward,
            description: `Harvested ${plot.lg_farm_seeds.name} (${rarity}) +${goldReward}G`,
          },
        }),
      ])

      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Roll for item drops on harvest (matches bot behavior)
      const rarityMult = RARITY_DROP_MULTIPLIER[rarity] || 1.0
      const drops = await tryItemDrop(userId, ITEM_DROP_CHANCE_HARVEST, rarityMult)
      // --- END AI-MODIFIED ---

      return res.status(200).json({
        success: true,
        action: "harvested",
        goldEarned: goldReward,
        seedName: plot.lg_farm_seeds.name,
        rarity,
        multiplier,
        materialDrops: drops || [],
      })
    }

    if (action === "clear") {
      if (!plot.dead && plot.seed_id) {
        return res.status(400).json({ error: "Plant is alive, harvest or let it die first" })
      }
      if (!plot.seed_id && !plot.dead) {
        return res.status(400).json({ error: "Plot is already empty" })
      }

      await prisma.lg_user_farm.update({
        where: { userid_plot_id: { userid: userId, plot_id: plotId } },
        data: {
          seed_id: null, planted_at: null, last_watered: null,
          growth_stage: 0, dead: false,
          growth_points: 0, gold_invested: 0,
          voice_minutes_earned: 0, messages_earned: 0,
          rarity: "COMMON",
        },
      })

      return res.status(200).json({ success: true, action: "cleared" })
    }

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Sync fullscreen preference to DB (matches bot's lg_pets.fullscreen_mode)
    if (action === "toggleFullscreen") {
      const pet = await prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { fullscreen_mode: true },
      })
      if (!pet) return res.status(404).json({ error: "Pet not found" })

      const newMode = !pet.fullscreen_mode
      await prisma.lg_pets.update({
        where: { userid: userId },
        data: { fullscreen_mode: newMode },
      })
      return res.status(200).json({ success: true, fullscreenMode: newMode })
    }
    // --- END AI-MODIFIED ---

    return res.status(400).json({ error: "Invalid action. Use 'water', 'harvest', 'plant', 'clear', or 'toggleFullscreen'" })
  },
})
