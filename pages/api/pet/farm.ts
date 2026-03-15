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
        nextWaterAt: nextWaterAt(plot.last_watered, seed.water_interval_hours),
        estimatedSecondsRemaining: estimateTimeRemaining(plot.growth_points, seed.growth_points_needed),
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })

    return res.status(200).json({
      plots: result,
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
        inventoryId: s.inventoryid,
        quantity: s.quantity,
        itemId: s.lg_items.itemid,
        name: s.lg_items.name,
      })),
      gold: userConfig?.gold ?? 0,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action, plotId, seedId } = req.body

    if (!action || plotId === undefined) {
      return res.status(400).json({ error: "action and plotId required" })
    }

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
      if ((userConfig?.gold ?? 0) < seed.plant_cost) {
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
