// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm API - view plots, water, harvest, plant, clear
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const GROWTH_PER_VOICE_MINUTE = 1.0
const GROWTH_PER_TEXT_MESSAGE = 2.0
const WATER_BOOST = 1.5
const DRY_PENALTY = 0.5
const DRY_DEATH_HOURS = 48

const DEV_SPEED = 60

const RARITY_WEIGHTS: Record<string, number> = {
  COMMON: 50, UNCOMMON: 25, RARE: 15, EPIC: 7, LEGENDARY: 3,
}
const RARITY_GOLD_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.5, RARE: 2.0, EPIC: 3.0, LEGENDARY: 5.0,
}

function rollRarity(): string {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight
    if (roll <= 0) return rarity
  }
  return "COMMON"
}

function isWatered(lastWatered: Date | null, waterIntervalHours: number): boolean {
  if (!lastWatered) return false
  const elapsed = (Date.now() - lastWatered.getTime()) / 1000
  const interval = (waterIntervalHours * 3600) / DEV_SPEED
  return elapsed < interval
}

function needsWater(lastWatered: Date | null, waterIntervalHours: number): boolean {
  return !isWatered(lastWatered, waterIntervalHours)
}

function isDead(lastWatered: Date | null, plantedAt: Date | null): boolean {
  if (!plantedAt) return false
  const ref = lastWatered || plantedAt
  const elapsed = (Date.now() - ref.getTime()) / 1000
  const deathThreshold = (DRY_DEATH_HOURS * 3600) / DEV_SPEED
  return elapsed > deathThreshold
}

function computeProgress(growthPoints: number, growthPointsNeeded: number): {
  stage: number; progress: number; readyToHarvest: boolean
} {
  const totalPerStage = growthPointsNeeded / 5
  const stage = Math.min(5, Math.floor(growthPoints / totalPerStage))
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

function nextWaterAt(lastWatered: Date | null, waterIntervalHours: number): string | null {
  if (!lastWatered) return null
  const interval = (waterIntervalHours * 3600 * 1000) / DEV_SPEED
  return new Date(lastWatered.getTime() + interval).toISOString()
}

function parseAssetPrefix(prefix: string): { plantType: string; typeId: number } {
  const [plantType, idStr] = prefix.split(":")
  return { plantType, typeId: parseInt(idStr, 10) || 1 }
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const [plots, seeds, ownedSeeds, userConfig] = await Promise.all([
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
    ])

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

      const dead = plot.dead || isDead(plot.last_watered, plot.planted_at)
      const growth = computeProgress(plot.growth_points, seed.growth_points_needed)
      const watered = isWatered(plot.last_watered, seed.water_interval_hours)
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
        nextWaterAt: nextWaterAt(plot.last_watered, seed.water_interval_hours),
        estimatedSecondsRemaining: estimateTimeRemaining(plot.growth_points, seed.growth_points_needed),
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: Farm history from gold transactions
    let history: Array<{type: string; amount: number; description: string; createdAt: string}> = []
    if (req.query.history === "true") {
      const txns = await prisma.lg_gold_transactions.findMany({
        where: {
          OR: [{ from_account: userId }, { to_account: userId }],
          transaction_type: { in: ["FARM_PLANT" as any, "FARM_HARVEST" as any] },
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

    return res.status(200).json({
      plots: result,
      history,
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

    if (action === "harvestAll") {
      const allPlots = await prisma.lg_user_farm.findMany({
        where: { userid: userId, dead: false },
        include: { lg_farm_seeds: true },
      })
      const harvestable = allPlots.filter(p =>
        p.seed_id && p.lg_farm_seeds && p.growth_points >= (p.lg_farm_seeds.growth_points_needed || 100)
      )
      if (harvestable.length === 0) {
        return res.status(400).json({ error: "Nothing ready to harvest" })
      }

      let totalGold = 0
      let totalInvested = 0
      let totalVoiceMin = 0
      let totalMessages = 0
      const details: Array<{name: string; rarity: string; gold: number; multiplier: number}> = []

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
      }

      if (totalGold > 0) {
        await prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: totalGold } },
        })
        await prisma.lg_gold_transactions.create({
          data: {
            transaction_type: "FARM_HARVEST" as any,
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
            transaction_type: "FARM_HARVEST" as any,
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

      await prisma.$transaction([
        prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: plotId } },
          data: {
            seed_id: seedId,
            planted_at: new Date(),
            last_watered: new Date(),
            growth_stage: 0,
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
            transaction_type: "FARM_PLANT" as any,
            actorid: userId,
            from_account: userId,
            amount: seed.plant_cost,
            description: `Planted ${seed.name} (${rarity})`,
          },
        }),
      ])

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
            transaction_type: "FARM_HARVEST" as any,
            actorid: userId,
            to_account: userId,
            amount: goldReward,
            description: `Harvested ${plot.lg_farm_seeds.name} (${rarity}) +${goldReward}G`,
          },
        }),
      ])

      return res.status(200).json({
        success: true,
        action: "harvested",
        goldEarned: goldReward,
        seedName: plot.lg_farm_seeds.name,
        rarity,
        multiplier,
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

    return res.status(400).json({ error: "Invalid action. Use 'water', 'harvest', 'plant', or 'clear'" })
  },
})
