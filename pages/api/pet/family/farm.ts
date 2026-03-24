// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family farm - view plots, plant, water, harvest, uproot
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { hasPermission } from "@/utils/familyPermissions"

const RARITY_GOLD_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.5, RARE: 2.0, EPIC: 3.0, LEGENDARY: 5.0,
}

function computeProgress(growthPoints: number, growthPointsNeeded: number) {
  if (growthPointsNeeded <= 0) return { stage: 1, progress: 0, readyToHarvest: false }
  const totalPerStage = growthPointsNeeded / 5
  const stage = Math.min(5, 1 + Math.floor(growthPoints / totalPerStage))
  const progress = Math.min(100, Math.round((growthPoints / growthPointsNeeded) * 100))
  return { stage, progress, readyToHarvest: stage >= 5 }
}

function isWatered(lastWatered: Date | null, waterIntervalHours: number): boolean {
  if (!lastWatered) return false
  const elapsed = (Date.now() - lastWatered.getTime()) / 1000
  return elapsed < waterIntervalHours * 3600
}

function isDead(lastWatered: Date | null, plantedAt: Date | null): boolean {
  if (!plantedAt) return false
  const ref = lastWatered || plantedAt
  const elapsed = (Date.now() - ref.getTime()) / 1000
  return elapsed > 48 * 3600
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const farmIndex = parseInt((req.query.farmIndex as string) ?? "0", 10)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const farm = await prisma.lg_family_farms.findUnique({
      where: { family_id_farm_index: { family_id: membership.family_id, farm_index: farmIndex } },
    })
    if (!farm) return res.status(404).json({ error: "Farm page not found" })

    const [plots, seeds, farmCount] = await Promise.all([
      prisma.lg_family_farm_plots.findMany({
        where: { family_id: membership.family_id, farm_index: farmIndex },
        include: { lg_farm_seeds: true },
        orderBy: { plot_id: "asc" },
      }),
      prisma.lg_farm_seeds.findMany({ orderBy: { seed_id: "asc" } }),
      prisma.lg_family_farms.count({ where: { family_id: membership.family_id } }),
    ])

    const planterIds = plots.filter((p) => p.planted_by != null).map((p) => p.planted_by!)
    const planterPets = planterIds.length > 0
      ? await prisma.lg_pets.findMany({
          where: { userid: { in: planterIds } },
          select: { userid: true, pet_name: true },
        })
      : []
    const planterMap = new Map(planterPets.map((p) => [p.userid.toString(), p.pet_name]))

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
          plantedBy: null,
          plantedByName: null,
        }
      }

      const dead = plot.dead || isDead(plot.last_watered, plot.planted_at)
      const growth = computeProgress(plot.growth_points, seed.growth_points_needed)
      const watered = isWatered(plot.last_watered, seed.water_interval_hours)

      return {
        plotId: plot.plot_id,
        empty: false,
        dead,
        seed: {
          id: seed.seed_id,
          name: seed.name,
          plantType: seed.plant_type,
          harvestGold: seed.harvest_gold,
          waterIntervalHours: seed.water_interval_hours,
          growthPointsNeeded: seed.growth_points_needed,
          assetPrefix: seed.asset_prefix,
        },
        stage: dead ? growth.stage : Math.max(plot.growth_stage, growth.stage),
        progress: growth.progress,
        readyToHarvest: !dead && growth.readyToHarvest,
        needsWater: !dead && !growth.readyToHarvest && !watered,
        isWatered: watered,
        rarity: plot.rarity || "COMMON",
        growthPoints: plot.growth_points,
        plantedBy: plot.planted_by?.toString() ?? null,
        plantedByName: plot.planted_by ? planterMap.get(plot.planted_by.toString()) ?? "Unknown" : null,
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Include family gold balance in response for seed cost display
    const familyGold = await prisma.lg_families.findUnique({
      where: { family_id: membership.family_id },
      select: { gold: true },
    })

    return res.status(200).json({
      plots: result,
      farmIndex,
      totalFarms: farmCount,
      gold: Number(familyGold?.gold ?? 0),
      availableSeeds: seeds.map((s) => ({
        id: s.seed_id,
        name: s.name,
        plantType: s.plant_type,
        harvestGold: s.harvest_gold,
        plantCost: s.plant_cost,
        growTimeHours: s.grow_time_hours,
        waterIntervalHours: s.water_interval_hours,
        growthPointsNeeded: s.growth_points_needed,
        assetPrefix: s.asset_prefix,
        typeId: s.seed_id,
      })),
    })
    // --- END AI-MODIFIED ---
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { farmIndex: rawFarmIndex, plotId, action, seedId } = req.body

    if (!action) return res.status(400).json({ error: "action required" })

    const farmIndex = parseInt(rawFarmIndex ?? "0", 10)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const family = membership.lg_families

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Handle bulk actions (waterAll, harvestAll) that don't need a plotId
    if (action === "waterAll") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission" })
      }
      const allPlots = await prisma.lg_family_farm_plots.findMany({
        where: { family_id: family.family_id, farm_index: farmIndex, seed_id: { not: null }, dead: false },
        include: { lg_farm_seeds: true },
      })
      const needsWater = allPlots.filter((p) => {
        if (!p.lg_farm_seeds || !p.planted_at) return false
        return !isWatered(p.last_watered, p.lg_farm_seeds.water_interval_hours)
      })
      if (needsWater.length === 0) return res.status(200).json({ success: true, count: 0 })
      await prisma.$transaction(
        needsWater.map((p) =>
          prisma.lg_family_farm_plots.update({
            where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: p.plot_id } },
            data: { last_watered: new Date() },
          })
        )
      )
      return res.status(200).json({ success: true, count: needsWater.length })
    }

    if (action === "harvestAll") {
      if (!hasPermission(membership.role, "harvest_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to harvest" })
      }
      const allPlots = await prisma.lg_family_farm_plots.findMany({
        where: { family_id: family.family_id, farm_index: farmIndex, seed_id: { not: null }, dead: false },
        include: { lg_farm_seeds: true },
      })
      const harvestable = allPlots.filter((p) => {
        if (!p.lg_farm_seeds) return false
        const growth = computeProgress(p.growth_points, p.lg_farm_seeds.growth_points_needed)
        return growth.readyToHarvest
      })
      if (harvestable.length === 0) return res.status(200).json({ success: true, count: 0, totalGold: 0 })

      let totalGold = 0
      const ops: any[] = []
      for (const p of harvestable) {
        const rarity = p.rarity || "COMMON"
        const multiplier = RARITY_GOLD_MULTIPLIER[rarity] || 1.0
        const goldReward = Math.round(p.lg_farm_seeds!.harvest_gold * multiplier)
        totalGold += goldReward
        ops.push(
          prisma.lg_family_farm_plots.update({
            where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: p.plot_id } },
            data: { seed_id: null, planted_at: null, planted_by: null, last_watered: null, growth_stage: 0, dead: false, growth_points: 0, gold_invested: 0, rarity: "COMMON" },
          })
        )
      }
      ops.push(
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { increment: totalGold } },
        }),
        prisma.lg_family_gold_log.create({
          data: { family_id: family.family_id, userid: userId, amount: totalGold, action: "FARM_HARVEST", description: `Bulk harvest ${harvestable.length} crops +${totalGold}G` },
        })
      )
      await prisma.$transaction(ops)
      return res.status(200).json({ success: true, count: harvestable.length, totalGold })
    }
    // --- END AI-MODIFIED ---

    if (plotId === undefined || plotId === null) return res.status(400).json({ error: "plotId required" })

    if (action === "plant") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to plant" })
      }
      if (!seedId) return res.status(400).json({ error: "seedId required" })

      const [plot, seed] = await Promise.all([
        prisma.lg_family_farm_plots.findUnique({
          where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
        }),
        prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
      ])

      if (!plot) return res.status(404).json({ error: "Plot not found" })
      if (plot.seed_id) return res.status(400).json({ error: "Plot is not empty" })
      if (!seed) return res.status(404).json({ error: "Seed not found" })

      if (family.gold < BigInt(seed.plant_cost)) {
        return res.status(400).json({ error: `Not enough gold in treasury. Need ${seed.plant_cost}` })
      }

      await prisma.$transaction([
        prisma.lg_family_farm_plots.update({
          where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
          data: {
            seed_id: seedId,
            planted_at: new Date(),
            planted_by: userId,
            last_watered: new Date(),
            growth_stage: 1,
            dead: false,
            growth_points: 0,
            gold_invested: seed.plant_cost,
            rarity: "COMMON",
          },
        }),
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { decrement: seed.plant_cost } },
        }),
        prisma.lg_family_gold_log.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: -seed.plant_cost,
            action: "FARM_PLANT",
            description: `Planted ${seed.name}`,
          },
        }),
      ])

      return res.status(200).json({ success: true, action: "planted", seedName: seed.name, cost: seed.plant_cost })
    }

    const plot = await prisma.lg_family_farm_plots.findUnique({
      where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
      include: { lg_farm_seeds: true },
    })
    if (!plot) return res.status(404).json({ error: "Plot not found" })

    if (action === "water") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission" })
      }
      if (!plot.seed_id || !plot.planted_at) return res.status(400).json({ error: "Nothing planted here" })
      if (plot.dead) return res.status(400).json({ error: "Plant is dead" })

      await prisma.lg_family_farm_plots.update({
        where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
        data: { last_watered: new Date() },
      })

      return res.status(200).json({ success: true, action: "watered" })
    }

    if (action === "harvest") {
      if (!hasPermission(membership.role, "harvest_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to harvest" })
      }
      if (!plot.seed_id || !plot.lg_farm_seeds || !plot.planted_at) {
        return res.status(400).json({ error: "Nothing to harvest" })
      }
      if (plot.dead) return res.status(400).json({ error: "Plant is dead" })

      const growth = computeProgress(plot.growth_points, plot.lg_farm_seeds.growth_points_needed)
      if (!growth.readyToHarvest) return res.status(400).json({ error: "Not ready to harvest yet" })

      const rarity = plot.rarity || "COMMON"
      const multiplier = RARITY_GOLD_MULTIPLIER[rarity] || 1.0
      const goldReward = Math.round(plot.lg_farm_seeds.harvest_gold * multiplier)

      await prisma.$transaction([
        prisma.lg_family_farm_plots.update({
          where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
          data: {
            seed_id: null, planted_at: null, planted_by: null,
            last_watered: null, growth_stage: 0, dead: false,
            growth_points: 0, gold_invested: 0, rarity: "COMMON",
          },
        }),
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { increment: goldReward } },
        }),
        prisma.lg_family_gold_log.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: goldReward,
            action: "FARM_HARVEST",
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

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Support uproot, remove (alias for uproot with refund), and clear (dead plants)
    if (action === "uproot" || action === "remove") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission" })
      }
      if (!plot.seed_id) return res.status(400).json({ error: "Plot is empty" })

      const refund = Math.floor((plot.gold_invested ?? 0) * 0.5)
      const ops: any[] = [
        prisma.lg_family_farm_plots.update({
          where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
          data: {
            seed_id: null, planted_at: null, planted_by: null,
            last_watered: null, growth_stage: 0, dead: false,
            growth_points: 0, gold_invested: 0, rarity: "COMMON",
          },
        }),
      ]
      if (refund > 0) {
        ops.push(
          prisma.lg_families.update({
            where: { family_id: family.family_id },
            data: { gold: { increment: refund } },
          })
        )
      }
      await prisma.$transaction(ops)
      return res.status(200).json({ success: true, action: "uprooted", refund })
    }

    if (action === "clear") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission" })
      }
      if (!plot.dead && !isDead(plot.last_watered, plot.planted_at)) {
        return res.status(400).json({ error: "Plant is not dead" })
      }
      await prisma.lg_family_farm_plots.update({
        where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: plotId } },
        data: {
          seed_id: null, planted_at: null, planted_by: null,
          last_watered: null, growth_stage: 0, dead: false,
          growth_points: 0, gold_invested: 0, rarity: "COMMON",
        },
      })
      return res.status(200).json({ success: true, action: "cleared" })
    }
    // --- END AI-MODIFIED ---

    return res.status(400).json({ error: "Invalid action. Use plant, water, harvest, uproot, remove, clear, waterAll, or harvestAll" })
  },
})
