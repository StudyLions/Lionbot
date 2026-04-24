// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Shared utility for fetching any pet owner's full
//          visual data (room, equipment, farm, stats).
//          Used by profile API, leaderboard, friends, family.
// ============================================================
import { prisma } from "@/utils/prisma"
import { getRoomDefaults } from "@/utils/roomDefaults"

export async function fetchPetVisualData(userId: bigint) {
  const [pet, userConfig] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: {
        pet_name: true,
        expression: true,
        level: true,
        xp: true,
        food: true,
        bath: true,
        sleep: true,
        life: true,
        last_decay_at: true,
        active_room_id: true,
        active_gameboy_skin_id: true,
        fullscreen_mode: true,
        created_at: true,
        // --- AI-MODIFIED (2026-04-24) ---
        // Purpose: Used to gate the cosmetic-overlay merge below.
        cosmetics_enabled: true,
        // --- END AI-MODIFIED ---
      },
    }),
    prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true, name: true, avatar_hash: true },
    }),
  ])

  if (!pet) return null

  const skinRow = pet.active_gameboy_skin_id
    ? await prisma.lg_gameboy_skins.findUnique({
        where: { skin_id: pet.active_gameboy_skin_id },
        select: { asset_path: true },
      })
    : null

  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Also fetch cosmetic overlay rows so the returned `equipment`
  // map matches what the bot renders -- cosmetics layered over real
  // equipment per slot when the pet's cosmetics_enabled flag is on.
  const [equipmentRows, cosmeticRows, room, furnitureRows, layoutRows, farmRows] = await Promise.all([
    prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: {
        slot: true,
        lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } },
      },
    }),
    prisma.lg_pet_cosmetics.findMany({
      where: { userid: userId },
      select: {
        slot: true,
        lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } },
      },
    }),
    // --- END AI-MODIFIED ---
    pet.active_room_id
      ? prisma.lg_rooms.findUnique({
          where: { room_id: pet.active_room_id },
          select: { asset_prefix: true },
        })
      : Promise.resolve(null),
    prisma.$queryRawUnsafe<{ slot: string; asset_path: string }[]>(
      `SELECT slot, asset_path FROM lg_user_furniture WHERE userid = $1`,
      userId
    ),
    prisma.$queryRawUnsafe<{ layout: unknown }[]>(
      `SELECT layout FROM lg_room_layout WHERE userid = $1`,
      userId
    ),
    prisma.lg_user_farm.findMany({
      where: { userid: userId },
      orderBy: { plot_id: "asc" },
      select: {
        plot_id: true,
        seed_id: true,
        planted_at: true,
        last_watered: true,
        growth_stage: true,
        growth_points: true,
        gold_invested: true,
        dead: true,
        rarity: true,
        voice_minutes_earned: true,
        messages_earned: true,
        lg_farm_seeds: {
          select: {
            seed_id: true,
            name: true,
            plant_type: true,
            harvest_gold: true,
            grow_time_hours: true,
            water_interval_hours: true,
            growth_points_needed: true,
            asset_prefix: true,
          },
        },
      },
    }),
  ])

  const equipItemIds = equipmentRows.map((e) => e.lg_items.itemid ?? 0).filter(Boolean)
  const equipInvRows = equipItemIds.length > 0
    ? await prisma.lg_user_inventory.findMany({
        where: { userid: userId, itemid: { in: equipItemIds } },
        select: {
          itemid: true,
          enhancement_level: true,
          lg_enhancement_slots: { select: { bonus_value: true } },
        },
      })
    : []
  const equipInvMap = new Map(equipInvRows.map((r) => [r.itemid, r]))

  const { calcGlowTier, calcGlowIntensity } = await import("@/utils/gameConstants")

  const equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier: string; glowIntensity: number }> = {}
  for (const e of equipmentRows) {
    const inv = equipInvMap.get(e.lg_items.itemid ?? 0)
    const lvl = inv?.enhancement_level ?? 0
    const totalBonus = inv?.lg_enhancement_slots.reduce((sum, s) => sum + s.bonus_value, 0) ?? 0
    equipment[e.slot] = {
      name: e.lg_items.name,
      category: e.lg_items.category,
      rarity: e.lg_items.rarity,
      assetPath: e.lg_items.asset_path,
      glowTier: calcGlowTier(lvl, totalBonus),
      glowIntensity: calcGlowIntensity(lvl),
    }
  }

  // --- AI-MODIFIED (2026-04-24) ---
  // Purpose: Apply cosmetic overlay over the equipment map per slot when
  // the pet's master cosmetics_enabled flag is on. Cosmetics deliberately
  // get glowTier "none" so the visual overlay never fakes stat bling --
  // the actual glow follows whatever item is equipped for stats.
  const cosmeticsEnabled = pet.cosmetics_enabled !== false
  if (cosmeticsEnabled) {
    for (const c of cosmeticRows) {
      equipment[c.slot] = {
        name: c.lg_items.name,
        category: c.lg_items.category,
        rarity: c.lg_items.rarity,
        assetPath: c.lg_items.asset_path,
        glowTier: "none",
        glowIntensity: 0,
      }
    }
  }
  // --- END AI-MODIFIED ---

  const roomPrefixStr = room?.asset_prefix ?? "rooms/default"
  const furnitureMap: Record<string, string> = getRoomDefaults(roomPrefixStr)
  for (const f of furnitureRows) {
    let path = f.asset_path
    if (!path.startsWith("rooms/")) path = `rooms/furniture/${path}`
    furnitureMap[f.slot] = path
  }

  const DECAY_INTERVAL_HOURS = 6
  const now = new Date()
  const elapsedHours = (now.getTime() - pet.last_decay_at.getTime()) / (1000 * 3600)
  const decayTicks = Math.floor(elapsedHours / DECAY_INTERVAL_HOURS)
  const effectiveFood = Math.max(0, pet.food - decayTicks)
  const effectiveBath = Math.max(0, pet.bath - decayTicks)
  const effectiveSleep = Math.max(0, pet.sleep - decayTicks)

  const plots = farmRows.map((p) => {
    const seed = p.lg_farm_seeds
    const gpNeeded = seed?.growth_points_needed ?? 100
    return {
      plotId: p.plot_id,
      empty: !p.seed_id,
      dead: p.dead,
      seed: seed ? {
        id: seed.seed_id, name: seed.name, plantType: seed.plant_type,
        harvestGold: seed.harvest_gold, growTimeHours: seed.grow_time_hours,
        waterIntervalHours: seed.water_interval_hours, growthPointsNeeded: gpNeeded,
      } : null,
      stage: p.growth_stage,
      progress: gpNeeded > 0 ? Math.min(1, p.growth_points / gpNeeded) : 0,
      readyToHarvest: p.growth_stage >= 5,
      needsWater: !!(p.seed_id && !p.dead && p.growth_stage < 5 && (!p.last_watered || (now.getTime() - new Date(p.last_watered).getTime()) > (seed?.water_interval_hours ?? 6) * 3600 * 1000)),
      isWatered: !!(p.last_watered && (now.getTime() - new Date(p.last_watered).getTime()) < (seed?.water_interval_hours ?? 6) * 3600 * 1000),
      rarity: p.rarity ?? "COMMON",
      growthPoints: p.growth_points,
      growthPointsNeeded: gpNeeded,
      goldInvested: p.gold_invested,
      assetPrefix: seed?.asset_prefix ?? null,
      plantType: seed?.plant_type ?? null,
      typeId: seed?.seed_id ?? null,
      plantedAt: p.planted_at?.toISOString() ?? null,
      lastWatered: p.last_watered?.toISOString() ?? null,
      nextWaterAt: null,
      estimatedSecondsRemaining: null,
    }
  })

  return {
    discordId: userId.toString(),
    discordName: userConfig?.name ?? "Unknown",
    avatarHash: userConfig?.avatar_hash ?? null,
    pet: {
      name: pet.pet_name,
      expression: (pet.expression ?? "default").toLowerCase(),
      level: pet.level,
      xp: pet.xp.toString(),
      food: effectiveFood,
      bath: effectiveBath,
      sleep: effectiveSleep,
      life: pet.life,
      fullscreenMode: pet.fullscreen_mode,
      createdAt: pet.created_at.toISOString(),
    },
    gold: (userConfig?.gold ?? BigInt(0)).toString(),
    gems: userConfig?.gems ?? 0,
    roomPrefix: roomPrefixStr,
    furniture: furnitureMap,
    roomLayout: layoutRows[0]?.layout ?? {},
    gameboySkinPath: skinRow?.asset_path ?? null,
    equipment,
    farmPlots: plots,
  }
}
