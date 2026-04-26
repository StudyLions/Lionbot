// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family farm - view plots, plant, water, harvest, uproot
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { hasPermission, maxFarmsForLevel, familyLevelFromXp } from "@/utils/familyPermissions"
// --- AI-MODIFIED (2026-03-30) ---
// Purpose: Import shared farm helpers for rarity rolls and item drops
import {
  RARITY_GOLD_MULTIPLIER, RARITY_DROP_MULTIPLIER,
  ITEM_DROP_CHANCE_HARVEST,
  rollRarity, tryItemDrop,
} from "@/utils/farmHelpers"
// --- END AI-MODIFIED ---

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

// --- AI-MODIFIED (2026-04-26) ---
// Purpose: Bug fix -- plants were not rendering on the family farm because the
// shared FarmScene / PlotDetail components read assetPrefix / plantType / typeId
// / nextWaterAt / goldInvested / growthPointsNeeded at the TOP LEVEL of each
// plot, but this endpoint only exposed assetPrefix nested inside `seed`. So the
// "if (!plot.assetPrefix) return null" guard in Layer 4 of FarmScene skipped
// every planted plot, and the floating tooltip (which uses seed.name directly)
// was the only visible evidence a crop was there. Reported by Fire in the
// support server.
function parseAssetPrefix(prefix: string): { plantType: string; typeId: number } {
  const [plantType, idStr] = prefix.split(":")
  return { plantType, typeId: parseInt(idStr, 10) || 1 }
}

function nextWaterAt(lastWatered: Date | null, waterIntervalHours: number): string | null {
  if (!lastWatered) return null
  const interval = waterIntervalHours * 3600 * 1000
  return new Date(lastWatered.getTime() + interval).toISOString()
}
// --- END AI-MODIFIED ---

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

    // --- AI-MODIFIED (2026-03-30) ---
    // Purpose: Lazy-create farm + plots if family level qualifies but rows don't exist yet
    let farm = await prisma.lg_family_farms.findUnique({
      where: { family_id_farm_index: { family_id: membership.family_id, farm_index: farmIndex } },
    })
    if (!farm) {
      const family = await prisma.lg_families.findUnique({
        where: { family_id: membership.family_id },
        select: { xp: true },
      })
      const level = familyLevelFromXp(Number(family?.xp ?? 0))
      if (farmIndex < maxFarmsForLevel(level)) {
        farm = await prisma.lg_family_farms.create({
          data: { family_id: membership.family_id, farm_index: farmIndex },
        })
        await prisma.lg_family_farm_plots.createMany({
          data: Array.from({ length: 15 }, (_, i) => ({
            family_id: membership.family_id,
            farm_index: farmIndex,
            plot_id: i,
          })),
          skipDuplicates: true,
        })
      } else {
        return res.status(404).json({ error: "Farm page not found" })
      }
    }
    // --- END AI-MODIFIED ---

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

    // --- AI-MODIFIED (2026-04-26) ---
    // Purpose: Expose the same top-level fields as the personal /api/pet/farm
    //          endpoint so the shared FarmScene / PlotDetail components can
    //          actually render the planted crops (bug: plants invisible on the
    //          family farm). Adds assetPrefix / plantType / typeId at the top
    //          level, plus goldInvested / growthPointsNeeded / nextWaterAt /
    //          estimatedSecondsRemaining / growTimeHours. Keeps the nested
    //          `seed` object for backwards compat with anything still reading
    //          it (e.g. the "Planted by" attribution block + tooltips).
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
          plantedBy: null,
          plantedByName: null,
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
          assetPrefix: seed.asset_prefix,
        },
        stage: dead ? growth.stage : Math.max(plot.growth_stage, growth.stage),
        progress: growth.progress,
        readyToHarvest: !dead && growth.readyToHarvest,
        needsWater: !dead && !growth.readyToHarvest && !watered,
        isWatered: watered,
        rarity: plot.rarity || "COMMON",
        growthPoints: plot.growth_points,
        growthPointsNeeded: seed.growth_points_needed,
        goldInvested: plot.gold_invested ?? 0,
        assetPrefix: seed.asset_prefix,
        plantType,
        typeId,
        nextWaterAt: nextWaterAt(plot.last_watered, seed.water_interval_hours),
        estimatedSecondsRemaining: null,
        plantedBy: plot.planted_by?.toString() ?? null,
        plantedByName: plot.planted_by ? planterMap.get(plot.planted_by.toString()) ?? "Unknown" : null,
        plantedAt: plot.planted_at.toISOString(),
        lastWatered: plot.last_watered?.toISOString() ?? null,
      }
    })
    // --- END AI-MODIFIED ---

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

      // --- AI-MODIFIED (2026-03-30) ---
      // Purpose: Roll item drops for each harvested crop (items go to harvesting user's inventory)
      const allDrops: Array<{ itemId: number; name: string; rarity: string; category: string }> = []
      for (const p of harvestable) {
        const rarity = p.rarity || "COMMON"
        const rarityMult = RARITY_DROP_MULTIPLIER[rarity] || 1.0
        const drops = await tryItemDrop(userId, ITEM_DROP_CHANCE_HARVEST, rarityMult)
        if (drops) allDrops.push(...drops)
      }
      return res.status(200).json({ success: true, count: harvestable.length, totalGold, drops: allDrops.length > 0 ? allDrops : null })
      // --- END AI-MODIFIED ---
    }

    // --- AI-MODIFIED (2026-04-24) ---
    // Purpose: Bulk-plant the same seed in every empty plot of the active family farm.
    //          Quality-of-life feature; uses family treasury gold and stamps planted_by
    //          with the acting user. Validates total cost atomically and rolls rarity
    //          per-plot so the lottery thrill is preserved.
    if (action === "plantAll") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to plant" })
      }
      if (!seedId) return res.status(400).json({ error: "seedId required" })

      const [allPlots, seed] = await Promise.all([
        prisma.lg_family_farm_plots.findMany({
          where: { family_id: family.family_id, farm_index: farmIndex },
          select: { plot_id: true, seed_id: true, dead: true },
        }),
        prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
      ])

      if (!seed) return res.status(404).json({ error: "Seed not found" })

      const emptyPlots = allPlots.filter((p) => !p.seed_id && !p.dead)
      if (emptyPlots.length === 0) {
        return res.status(400).json({ error: "No empty plots to plant in" })
      }

      const totalCost = seed.plant_cost * emptyPlots.length
      if (family.gold < BigInt(totalCost)) {
        return res.status(400).json({
          error: `Not enough gold in treasury. Need ${totalCost}G for ${emptyPlots.length} plots`,
        })
      }

      const now = new Date()
      const rarityCounts: Record<string, number> = {}
      const ops: any[] = emptyPlots.map((p) => {
        const rarity = rollRarity()
        rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + 1
        return prisma.lg_family_farm_plots.update({
          where: {
            family_id_farm_index_plot_id: {
              family_id: family.family_id,
              farm_index: farmIndex,
              plot_id: p.plot_id,
            },
          },
          data: {
            seed_id: seedId,
            planted_at: now,
            planted_by: userId,
            last_watered: now,
            growth_stage: 1,
            dead: false,
            growth_points: 0,
            gold_invested: seed.plant_cost,
            rarity,
          },
        })
      })

      ops.push(
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { decrement: totalCost } },
        }),
        prisma.lg_family_gold_log.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: -totalCost,
            action: "FARM_PLANT",
            description: `Bulk planted ${emptyPlots.length} x ${seed.name}`,
          },
        })
      )
      await prisma.$transaction(ops)

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

    // --- AI-MODIFIED (2026-04-03) ---
    // Purpose: Bulk clear all dead plots in one request (was N sequential requests from frontend)
    if (action === "clearAll") {
      if (!hasPermission(membership.role, "plant_farm", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission" })
      }
      const allPlots = await prisma.lg_family_farm_plots.findMany({
        where: { family_id: family.family_id, farm_index: farmIndex, seed_id: { not: null } },
      })
      const deadPlots = allPlots.filter((p) => p.dead || isDead(p.last_watered, p.planted_at))
      if (deadPlots.length === 0) return res.status(200).json({ success: true, count: 0 })

      await prisma.$transaction(
        deadPlots.map((p) =>
          prisma.lg_family_farm_plots.update({
            where: { family_id_farm_index_plot_id: { family_id: family.family_id, farm_index: farmIndex, plot_id: p.plot_id } },
            data: { seed_id: null, planted_at: null, planted_by: null, last_watered: null, growth_stage: 0, dead: false, growth_points: 0, gold_invested: 0, rarity: "COMMON" },
          })
        )
      )
      return res.status(200).json({ success: true, count: deadPlots.length })
    }
    // --- END AI-MODIFIED ---
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

      // --- AI-MODIFIED (2026-03-30) ---
      // Purpose: Roll rarity on family farm plant (was always COMMON)
      const rarity = rollRarity()
      // --- END AI-MODIFIED ---

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
            rarity,
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
            description: `Planted ${seed.name} (${rarity})`,
          },
        }),
      ])

      return res.status(200).json({ success: true, action: "planted", seedName: seed.name, rarity, cost: seed.plant_cost })
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

      // --- AI-MODIFIED (2026-03-30) ---
      // Purpose: Roll item drops on single harvest (items go to harvesting user's inventory)
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
        drops,
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
      // --- AI-MODIFIED (2026-03-30) ---
      // Purpose: Log uproot gold refund in family gold log (was invisible before)
      if (refund > 0) {
        ops.push(
          prisma.lg_families.update({
            where: { family_id: family.family_id },
            data: { gold: { increment: refund } },
          }),
          prisma.lg_family_gold_log.create({
            data: {
              family_id: family.family_id,
              userid: userId,
              amount: refund,
              action: "FARM_UPROOT",
              description: `Uprooted plant, refunded ${refund}G`,
            },
          })
        )
      }
      // --- END AI-MODIFIED ---
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

    return res.status(400).json({ error: "Invalid action. Use plant, water, harvest, uproot, remove, clear, waterAll, harvestAll, or clearAll" })
  },
})
