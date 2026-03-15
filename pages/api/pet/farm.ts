// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet farm API - view plots, water, harvest
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const DEV_GROWTH_SPEED = 60

function computeGrowthStage(
  plantedAt: Date | null,
  growTimeHours: number,
  currentStage: number
): { stage: number; progress: number; readyToHarvest: boolean } {
  if (!plantedAt) return { stage: 0, progress: 0, readyToHarvest: false }
  const elapsed = (Date.now() - plantedAt.getTime()) / 1000
  const totalSeconds = (growTimeHours * 3600) / DEV_GROWTH_SPEED
  const stageSeconds = totalSeconds / 5
  const computedStage = Math.min(5, Math.floor(elapsed / stageSeconds))
  const stage = Math.max(currentStage, computedStage)
  const progress = Math.min(100, Math.round((elapsed / totalSeconds) * 100))
  return { stage, progress, readyToHarvest: stage >= 5 }
}

function needsWater(lastWatered: Date | null, waterIntervalHours: number): boolean {
  if (!lastWatered) return true
  const elapsed = (Date.now() - lastWatered.getTime()) / 1000
  const intervalSeconds = (waterIntervalHours * 3600) / DEV_GROWTH_SPEED
  return elapsed >= intervalSeconds
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const plots = await prisma.lg_user_farm.findMany({
      where: { userid: userId },
      include: { lg_farm_seeds: true },
      orderBy: { plot_id: "asc" },
    })

    const seeds = await prisma.lg_farm_seeds.findMany({
      orderBy: { seed_id: "asc" },
    })

    const ownedSeeds = await prisma.lg_user_inventory.findMany({
      where: {
        userid: userId,
        lg_items: { category: "FARM_SEED" as any },
      },
      select: {
        inventoryid: true,
        quantity: true,
        lg_items: { select: { itemid: true, name: true } },
      },
    })

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
        }
      }

      const growth = computeGrowthStage(plot.planted_at, seed.grow_time_hours, plot.growth_stage)
      const water = needsWater(plot.last_watered, seed.water_interval_hours)

      return {
        plotId: plot.plot_id,
        empty: false,
        dead: plot.dead,
        seed: { id: seed.seed_id, name: seed.name, plantType: seed.plant_type, harvestGold: seed.harvest_gold },
        stage: growth.stage,
        progress: growth.progress,
        readyToHarvest: growth.readyToHarvest,
        needsWater: water && !growth.readyToHarvest && !plot.dead,
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })

    return res.status(200).json({
      plots: result,
      availableSeeds: seeds.map((s) => ({
        id: s.seed_id,
        name: s.name,
        plantType: s.plant_type,
        growTimeHours: s.grow_time_hours,
        waterIntervalHours: s.water_interval_hours,
        harvestGold: s.harvest_gold,
      })),
      ownedSeeds: ownedSeeds.map((s) => ({
        inventoryId: s.inventoryid,
        quantity: s.quantity,
        itemId: s.lg_items.itemid,
        name: s.lg_items.name,
      })),
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action, plotId } = req.body

    if (!action || plotId === undefined) {
      return res.status(400).json({ error: "action and plotId required" })
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
      const growth = computeGrowthStage(plot.planted_at, plot.lg_farm_seeds.grow_time_hours, plot.growth_stage)
      if (!growth.readyToHarvest) {
        return res.status(400).json({ error: "Not ready to harvest yet" })
      }

      const goldReward = plot.lg_farm_seeds.harvest_gold

      await prisma.$transaction([
        prisma.lg_user_farm.update({
          where: { userid_plot_id: { userid: userId, plot_id: plotId } },
          data: { seed_id: null, planted_at: null, last_watered: null, growth_stage: 0, dead: false },
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
            description: `Harvested ${plot.lg_farm_seeds.name}`,
          },
        }),
      ])

      return res.status(200).json({
        success: true,
        action: "harvested",
        goldEarned: goldReward,
        seedName: plot.lg_farm_seeds.name,
      })
    }

    return res.status(400).json({ error: "Invalid action. Use 'water' or 'harvest'" })
  },
})
