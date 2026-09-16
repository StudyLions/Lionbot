// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, transport-agnostic FARM logic — the ONE validated,
//          economy-correct path used by BOTH the website
//          (pages/api/pet/farm.ts, NextAuth cookie) and the Anki addon
//          (pages/api/anki/pet/farm.ts, bearer). Fully user-scoped (no
//          IDOR): every query keyed by the passed userId. All gold
//          spend/grant + rarity rolls + harvest item-drops happen here,
//          server-side, so the addon can never cheat the economy.
//
//          Extracted verbatim from pages/api/pet/farm.ts (mechanics
//          unchanged) so the two transports cannot drift.
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"
import {
  RARITY_GOLD_MULTIPLIER,
  RARITY_DROP_MULTIPLIER,
  ITEM_DROP_CHANCE_HARVEST,
  rollRarity,
  tryItemDrop,
} from "@/utils/farmHelpers"

// Death/water timers are tier-aware in the bot; the web has always used
// tier NONE for personal farms, so we keep that here for parity.
const TIER_WATER_DURATION_MULT: Record<string, number> = {
  NONE: 1.0, LIONHEART: 1.5, LIONHEART_PLUS: 2.0, LIONHEART_PLUS_PLUS: 3.0,
}
const TIER_DEATH_TIMER_HOURS: Record<string, number | null> = {
  NONE: 48, LIONHEART: 72, LIONHEART_PLUS: 96, LIONHEART_PLUS_PLUS: null,
}
const GROWTH_PER_TEXT_MESSAGE = 2.0

const VALID_RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]

export function isWatered(lastWatered: Date | null, waterIntervalHours: number, tier = "NONE"): boolean {
  if (!lastWatered) return false
  const elapsed = (Date.now() - lastWatered.getTime()) / 1000
  const mult = TIER_WATER_DURATION_MULT[tier] ?? 1.0
  return elapsed < waterIntervalHours * 3600 * mult
}

export function isDead(lastWatered: Date | null, plantedAt: Date | null, tier = "NONE"): boolean {
  if (!plantedAt) return false
  const deathHours = TIER_DEATH_TIMER_HOURS[tier]
  if (deathHours === null || deathHours === undefined) return false
  const ref = lastWatered || plantedAt
  return (Date.now() - ref.getTime()) / 1000 > deathHours * 3600
}

export function computeProgress(growthPoints: number, growthPointsNeeded: number) {
  if (growthPointsNeeded <= 0) return { stage: 1, progress: 0, readyToHarvest: false }
  const totalPerStage = growthPointsNeeded / 5
  const stage = Math.min(5, 1 + Math.floor(growthPoints / totalPerStage))
  const progress = Math.min(100, Math.round((growthPoints / growthPointsNeeded) * 100))
  return { stage, progress, readyToHarvest: stage >= 5 }
}

function estimateTimeRemaining(growthPoints: number, growthPointsNeeded: number): number | null {
  if (growthPoints >= growthPointsNeeded) return 0
  const remaining = growthPointsNeeded - growthPoints
  const pointsPerMinute = GROWTH_PER_TEXT_MESSAGE * 2
  if (pointsPerMinute <= 0) return null
  return Math.ceil(remaining / pointsPerMinute) * 60
}

function nextWaterAt(lastWatered: Date | null, waterIntervalHours: number, tier = "NONE"): string | null {
  if (!lastWatered) return null
  const mult = TIER_WATER_DURATION_MULT[tier] ?? 1.0
  return new Date(lastWatered.getTime() + waterIntervalHours * 3600 * 1000 * mult).toISOString()
}

function parseAssetPrefix(prefix: string): { plantType: string; typeId: number } {
  const [plantType, idStr] = prefix.split(":")
  return { plantType, typeId: parseInt(idStr, 10) || 1 }
}

// Plot ids are 0-indexed; reject anything that isn't a non-negative int
// so prisma never receives `undefined` for the composite key.
function assertPlotId(plotId: unknown): asserts plotId is number {
  if (typeof plotId !== "number" || !Number.isInteger(plotId) || plotId < 0) {
    throw new PetServiceError(400, "plot_required", "A valid plotId is required")
  }
}

// One plot -> the JSON shape the /pet/farm page (and the addon) render.
export function mapPlot(plot: any, tier = "NONE") {
  const seed = plot.lg_farm_seeds
  if (!seed || !plot.planted_at) {
    return {
      plotId: plot.plot_id, empty: true, dead: plot.dead, seed: null,
      stage: 0, progress: 0, readyToHarvest: false, needsWater: false, isWatered: false,
      rarity: "COMMON", growthPoints: 0, growthPointsNeeded: 0, goldInvested: 0,
      assetPrefix: null, plantType: null, typeId: null,
      nextWaterAt: null, estimatedSecondsRemaining: null, plantedAt: null, lastWatered: null,
    }
  }
  const dead = plot.dead || isDead(plot.last_watered, plot.planted_at, tier)
  const growth = computeProgress(plot.growth_points, seed.growth_points_needed)
  const watered = isWatered(plot.last_watered, seed.water_interval_hours, tier)
  const { plantType, typeId } = parseAssetPrefix(seed.asset_prefix)
  return {
    plotId: plot.plot_id,
    empty: false,
    dead,
    seed: {
      id: seed.seed_id, name: seed.name, plantType: seed.plant_type,
      harvestGold: seed.harvest_gold, growTimeHours: seed.grow_time_hours,
      waterIntervalHours: seed.water_interval_hours, growthPointsNeeded: seed.growth_points_needed,
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
    nextWaterAt: nextWaterAt(plot.last_watered, seed.water_interval_hours, tier),
    estimatedSecondsRemaining: estimateTimeRemaining(plot.growth_points, seed.growth_points_needed),
    plantedAt: plot.planted_at.toISOString(),
    lastWatered: plot.last_watered?.toISOString() ?? null,
  }
}

/** Full farm view for an interactive client: plots + seed catalog + gold. */
export async function getFarmView(userId: bigint) {
  const [plots, seeds, userConfig] = await Promise.all([
    prisma.lg_user_farm.findMany({
      where: { userid: userId },
      include: { lg_farm_seeds: true },
      orderBy: { plot_id: "asc" },
    }),
    prisma.lg_farm_seeds.findMany({ orderBy: { seed_id: "asc" } }),
    prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } }),
  ])
  return {
    plots: plots.map((p) => mapPlot(p)),
    availableSeeds: seeds.map((s) => {
      const { typeId } = parseAssetPrefix(s.asset_prefix)
      return {
        id: s.seed_id, name: s.name, plantType: s.plant_type,
        growTimeHours: s.grow_time_hours, waterIntervalHours: s.water_interval_hours,
        harvestGold: s.harvest_gold, plantCost: s.plant_cost,
        growthPointsNeeded: s.growth_points_needed, assetPrefix: s.asset_prefix, typeId,
      }
    }),
    gold: Number(userConfig?.gold ?? 0),
  }
}

const CLEARED = {
  seed_id: null, planted_at: null, last_watered: null, growth_stage: 0, dead: false,
  growth_points: 0, gold_invested: 0, voice_minutes_earned: 0, messages_earned: 0, rarity: "COMMON",
}

export async function plantSeed(userId: bigint, plotId: number, seedId: number) {
  assertPlotId(plotId)
  if (!Number.isInteger(seedId) || seedId < 1) throw new PetServiceError(400, "seed_required", "A valid seedId is required")
  const [plot, seed, userConfig] = await Promise.all([
    prisma.lg_user_farm.findUnique({ where: { userid_plot_id: { userid: userId, plot_id: plotId } } }),
    prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
    prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } }),
  ])
  if (!plot) throw new PetServiceError(404, "plot_not_found", "Plot not found")
  if (plot.seed_id) throw new PetServiceError(400, "plot_occupied", "Plot is not empty")
  if (!seed) throw new PetServiceError(404, "seed_not_found", "Seed not found")
  if (Number(userConfig?.gold ?? 0) < seed.plant_cost) {
    throw new PetServiceError(400, "insufficient_gold", `Not enough gold. Need ${seed.plant_cost}`)
  }
  const rarity = rollRarity()
  await prisma.$transaction(async (tx) => {
    // Atomic, race-safe spend: only decrements if the balance still covers it.
    const dec = await tx.$queryRaw<Array<{ gold: bigint }>>`
      UPDATE user_config SET gold = gold - ${seed.plant_cost}
      WHERE userid = ${userId} AND gold >= ${seed.plant_cost} RETURNING gold`
    if (dec.length === 0) throw new PetServiceError(400, "insufficient_gold", `Not enough gold. Need ${seed.plant_cost}`)
    // Re-check the plot is still empty under the txn to avoid a double-plant race.
    const updated = await tx.lg_user_farm.updateMany({
      where: { userid: userId, plot_id: plotId, seed_id: null },
      data: {
        seed_id: seedId, planted_at: new Date(), last_watered: new Date(),
        growth_stage: 1, dead: false, growth_points: 0, gold_invested: seed.plant_cost,
        voice_minutes_earned: 0, messages_earned: 0, rarity,
      },
    })
    if (updated.count === 0) throw new PetServiceError(400, "plot_occupied", "Plot is not empty")
    await tx.lg_gold_transactions.create({
      data: {
        transaction_type: "FARM_PLANT", actorid: userId, from_account: userId,
        amount: seed.plant_cost, description: `Planted ${seed.name} (${rarity})`,
      },
    })
  })
  return { success: true, action: "planted", seedName: seed.name, rarity, cost: seed.plant_cost }
}

export async function waterPlot(userId: bigint, plotId: number) {
  assertPlotId(plotId)
  const plot = await prisma.lg_user_farm.findUnique({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
  })
  if (!plot) throw new PetServiceError(404, "plot_not_found", "Plot not found")
  if (!plot.seed_id || !plot.planted_at) throw new PetServiceError(400, "nothing_planted", "Nothing planted here")
  if (plot.dead) throw new PetServiceError(400, "plant_dead", "Plant is dead")
  await prisma.lg_user_farm.update({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
    data: { last_watered: new Date() },
  })
  return { success: true, action: "watered" }
}

export async function harvestPlot(userId: bigint, plotId: number) {
  assertPlotId(plotId)
  const plot = await prisma.lg_user_farm.findUnique({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
    include: { lg_farm_seeds: true },
  })
  if (!plot) throw new PetServiceError(404, "plot_not_found", "Plot not found")
  if (!plot.seed_id || !plot.lg_farm_seeds || !plot.planted_at) {
    throw new PetServiceError(400, "nothing_to_harvest", "Nothing to harvest")
  }
  if (plot.dead) throw new PetServiceError(400, "plant_dead", "Plant is dead, clear it first")
  const growth = computeProgress(plot.growth_points, plot.lg_farm_seeds.growth_points_needed)
  if (!growth.readyToHarvest) throw new PetServiceError(400, "not_ready", "Not ready to harvest yet")

  const rarity = plot.rarity || "COMMON"
  const multiplier = RARITY_GOLD_MULTIPLIER[rarity] || 1.0
  const goldReward = Math.round(plot.lg_farm_seeds.harvest_gold * multiplier)
  await prisma.$transaction([
    prisma.lg_user_farm.update({
      where: { userid_plot_id: { userid: userId, plot_id: plotId } },
      data: { ...CLEARED },
    }),
    prisma.user_config.update({
      where: { userid: userId },
      data: { gold: { increment: goldReward } },
    }),
    prisma.lg_gold_transactions.create({
      data: {
        transaction_type: "FARM_HARVEST", actorid: userId, to_account: userId,
        amount: goldReward, description: `Harvested ${plot.lg_farm_seeds.name} (${rarity}) +${goldReward}G`,
      },
    }),
  ])
  const rarityMult = RARITY_DROP_MULTIPLIER[rarity] || 1.0
  const drops = await tryItemDrop(userId, ITEM_DROP_CHANCE_HARVEST, rarityMult)
  return {
    success: true, action: "harvested", goldEarned: goldReward,
    seedName: plot.lg_farm_seeds.name, rarity, multiplier, materialDrops: drops || [],
  }
}

export async function uprootPlot(userId: bigint, plotId: number) {
  assertPlotId(plotId)
  const plot = await prisma.lg_user_farm.findUnique({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
  })
  if (!plot) throw new PetServiceError(404, "plot_not_found", "Plot not found")
  if (!plot.seed_id) throw new PetServiceError(400, "plot_empty", "Plot is empty")
  if (plot.dead) throw new PetServiceError(400, "plant_dead", "Plant is dead, use clear")

  const invested = plot.gold_invested || 0
  const refund = Math.floor(invested / 2)
  const ops: any[] = [
    prisma.lg_user_farm.update({
      where: { userid_plot_id: { userid: userId, plot_id: plotId } },
      data: { ...CLEARED },
    }),
  ]
  if (refund > 0) {
    ops.push(
      prisma.user_config.update({
        where: { userid: userId },
        data: { gold: { increment: refund } },
      }),
      prisma.lg_gold_transactions.create({
        data: {
          transaction_type: "FARM_HARVEST", actorid: userId, to_account: userId,
          amount: refund, description: `Removed plant (50% refund)`,
        },
      })
    )
  }
  await prisma.$transaction(ops)
  return { success: true, action: "removed", refund, invested }
}

export async function clearPlot(userId: bigint, plotId: number) {
  assertPlotId(plotId)
  const plot = await prisma.lg_user_farm.findUnique({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
  })
  if (!plot) throw new PetServiceError(404, "plot_not_found", "Plot not found")
  const computedDead = isDead(plot.last_watered, plot.planted_at, "NONE")
  if (!plot.seed_id && !plot.dead && !computedDead) {
    throw new PetServiceError(400, "plot_empty", "Plot is already empty")
  }
  if (plot.seed_id && !plot.dead && !computedDead) {
    throw new PetServiceError(400, "plant_alive", "Plant is alive, harvest or let it die first")
  }
  await prisma.lg_user_farm.update({
    where: { userid_plot_id: { userid: userId, plot_id: plotId } },
    data: { ...CLEARED },
  })
  return { success: true, action: "cleared" }
}

export async function waterAll(userId: bigint) {
  const result = await prisma.lg_user_farm.updateMany({
    where: { userid: userId, seed_id: { not: null }, dead: false },
    data: { last_watered: new Date() },
  })
  return { success: true, action: "wateredAll", count: result.count }
}

export async function plantAll(userId: bigint, seedId: number) {
  if (!Number.isInteger(seedId) || seedId < 1) throw new PetServiceError(400, "seed_required", "A valid seedId is required")
  const [allPlots, seed, userConfig] = await Promise.all([
    prisma.lg_user_farm.findMany({
      where: { userid: userId },
      select: { plot_id: true, seed_id: true, dead: true },
    }),
    prisma.lg_farm_seeds.findUnique({ where: { seed_id: seedId } }),
    prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } }),
  ])
  if (!seed) throw new PetServiceError(404, "seed_not_found", "Seed not found")
  const emptyPlots = allPlots.filter((p) => !p.seed_id && !p.dead)
  if (emptyPlots.length === 0) throw new PetServiceError(400, "no_empty_plots", "No empty plots to plant in")
  const totalCost = seed.plant_cost * emptyPlots.length
  const currentGold = Number(userConfig?.gold ?? 0)
  if (currentGold < totalCost) {
    throw new PetServiceError(
      400, "insufficient_gold",
      `Not enough gold. Need ${totalCost}G for ${emptyPlots.length} plots (have ${currentGold}G)`
    )
  }
  const now = new Date()
  const rarityCounts: Record<string, number> = {}
  await prisma.$transaction(async (tx) => {
    const dec = await tx.$queryRaw<Array<{ gold: bigint }>>`
      UPDATE user_config SET gold = gold - ${totalCost}
      WHERE userid = ${userId} AND gold >= ${totalCost} RETURNING gold`
    if (dec.length === 0) throw new PetServiceError(400, "insufficient_gold", `Not enough gold. Need ${totalCost}G`)
    for (const p of emptyPlots) {
      const rarity = rollRarity()
      rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + 1
      await tx.lg_user_farm.update({
        where: { userid_plot_id: { userid: userId, plot_id: p.plot_id } },
        data: {
          seed_id: seedId, planted_at: now, last_watered: now, growth_stage: 1, dead: false,
          growth_points: 0, gold_invested: seed.plant_cost, voice_minutes_earned: 0,
          messages_earned: 0, rarity,
        },
      })
    }
    await tx.lg_gold_transactions.create({
      data: {
        transaction_type: "FARM_PLANT", actorid: userId, from_account: userId,
        amount: totalCost, description: `Bulk planted ${emptyPlots.length} x ${seed.name}`,
      },
    })
  })
  return { success: true, action: "plantedAll", count: emptyPlots.length, totalCost, seedName: seed.name, rarityCounts }
}

export async function harvestAll(userId: bigint) {
  const allPlots = await prisma.lg_user_farm.findMany({
    where: { userid: userId, dead: false },
    include: { lg_farm_seeds: true },
  })
  const harvestable = allPlots.filter((p) => {
    if (!p.seed_id || !p.lg_farm_seeds) return false
    return computeProgress(p.growth_points, p.lg_farm_seeds.growth_points_needed).readyToHarvest
  })
  if (harvestable.length === 0) throw new PetServiceError(400, "nothing_ready", "Nothing ready to harvest")

  let totalGold = 0
  let totalInvested = 0
  let totalVoiceMin = 0
  let totalMessages = 0
  const details: Array<{ name: string; rarity: string; gold: number; multiplier: number }> = []
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
      data: { ...CLEARED },
    })
    const rarityMult = RARITY_DROP_MULTIPLIER[rarity] || 1.0
    const drops = await tryItemDrop(userId, ITEM_DROP_CHANCE_HARVEST, rarityMult)
    if (drops) allDrops.push(...drops)
  }
  if (totalGold > 0) {
    await prisma.user_config.update({
      where: { userid: userId },
      data: { gold: { increment: totalGold } },
    })
    await prisma.lg_gold_transactions.create({
      data: {
        transaction_type: "FARM_HARVEST", actorid: userId, to_account: userId,
        amount: totalGold, description: `Bulk harvest ${harvestable.length} plants`,
      },
    })
  }
  return {
    success: true, action: "harvestedAll", count: harvestable.length,
    totalGold, totalInvested, netProfit: totalGold - totalInvested,
    totalVoiceMinutes: Math.round(totalVoiceMin), totalMessages,
    details, materialDrops: allDrops,
  }
}

/**
 * Uproot every LIVE, planted plot of a given rarity in ONE atomic statement,
 * refunding 50% of each plot's gold_invested (parity with uprootPlot). Dead
 * plants are excluded — like single uproot, they must be `clear`ed instead.
 *
 * The CTE captures each plot's pre-clear gold_invested under `FOR UPDATE`, so
 * the refund is summed from exactly the rows we cleared — no read-then-write
 * window, no refund drift if the user mutates the farm concurrently. Clear +
 * refund + ledger row all commit together (or not at all).
 */
export async function removeByRarity(userId: bigint, rarity: string) {
  const target = String(rarity ?? "").toUpperCase()
  if (!VALID_RARITIES.includes(target)) {
    throw new PetServiceError(400, "bad_rarity", `Invalid rarity. Use one of: ${VALID_RARITIES.join(", ")}`)
  }

  return prisma.$transaction(async (tx) => {
    const removed = await tx.$queryRaw<Array<{ plot_id: number; gold_invested: number }>>`
      WITH victims AS (
        SELECT plot_id, gold_invested
        FROM lg_user_farm
        WHERE userid = ${userId} AND seed_id IS NOT NULL AND dead = false AND rarity = ${target}
        FOR UPDATE
      ), cleared AS (
        UPDATE lg_user_farm f
        SET seed_id = NULL, planted_at = NULL, last_watered = NULL, growth_stage = 0,
            dead = false, growth_points = 0, gold_invested = 0,
            voice_minutes_earned = 0, messages_earned = 0, rarity = 'COMMON'
        FROM victims v
        WHERE f.userid = ${userId} AND f.plot_id = v.plot_id
        RETURNING f.plot_id
      )
      SELECT plot_id, gold_invested FROM victims ORDER BY plot_id`

    const plotIds = removed.map((r) => r.plot_id)
    const totalRefund = removed.reduce((sum, r) => sum + Math.floor((r.gold_invested || 0) / 2), 0)

    if (totalRefund > 0) {
      await tx.user_config.update({
        where: { userid: userId },
        data: { gold: { increment: totalRefund } },
      })
      await tx.lg_gold_transactions.create({
        data: {
          transaction_type: "FARM_HARVEST", actorid: userId, to_account: userId,
          amount: totalRefund, description: `Removed ${plotIds.length} ${target} plant(s) (50% refund)`,
        },
      })
    }

    return { success: true, action: "removedByRarity", rarity: target, count: plotIds.length, totalRefund, plotIds }
  })
}
