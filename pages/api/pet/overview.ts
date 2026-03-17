// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet overview API - returns pet state and gold balance
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

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
        },
      }),
      prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      }),
    ])

    if (!pet) {
      return res.status(200).json({ hasPet: false, pet: null, gold: 0, gems: 0 })
    }

    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Also fetch active gameboy skin asset path for frame rendering
    const skinRow = pet.active_gameboy_skin_id
      ? await prisma.lg_gameboy_skins.findUnique({
          where: { skin_id: pet.active_gameboy_skin_id },
          select: { asset_path: true },
        })
      : null
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Also fetch active room, user furniture, and room layout for room preview
    const [equipmentRows, inventoryCount, farmPlots, room, furnitureRows, layoutRows] = await Promise.all([
      prisma.lg_pet_equipment.findMany({
        where: { userid: userId },
        select: {
          slot: true,
          lg_items: { select: { name: true, category: true, rarity: true, asset_path: true } },
        },
      }),
      prisma.lg_user_inventory.count({ where: { userid: userId } }),
      prisma.lg_user_farm.count({
        where: { userid: userId, seed_id: { not: null } },
      }),
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
    ])
    // --- END AI-MODIFIED ---

    const equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string }> = {}
    for (const e of equipmentRows) {
      equipment[e.slot] = {
        name: e.lg_items.name,
        category: e.lg_items.category,
        rarity: e.lg_items.rarity,
        assetPath: e.lg_items.asset_path,
      }
    }

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Build furniture map with room defaults merged, extract layout
    // Reduced defaults to wall/floor/mat only -- new pets start with mostly empty rooms
    const roomPrefixStr = room?.asset_prefix ?? 'rooms/default'
    const roomDefaults: Record<string, Record<string, string>> = {
      "rooms/default": {
        wall: "rooms/default/wall_checker_blue.png",
        floor: "rooms/default/floor_blue.png",
        mat: "rooms/default/mat_blue.png",
      },
      "rooms/castle": {
        wall: "rooms/castle/wall_1.png",
        floor: "rooms/castle/floor_1.png",
        mat: "rooms/castle/carpet_1.png",
      },
    }
    const furnitureMap: Record<string, string> = { ...(roomDefaults[roomPrefixStr] ?? {}) }
    for (const f of furnitureRows) {
      let path = f.asset_path
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Normalize raw filenames to rooms/furniture/ where they exist on CDN
      if (!path.startsWith("rooms/")) {
        path = `rooms/furniture/${path}`
      }
      // --- END AI-MODIFIED ---
      furnitureMap[f.slot] = path
    }
    const layoutRow = layoutRows[0] ?? null
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      hasPet: true,
      pet: {
        name: pet.pet_name,
        expression: (pet.expression ?? 'default').toLowerCase(),
        level: pet.level,
        xp: pet.xp.toString(),
        food: pet.food,
        bath: pet.bath,
        sleep: pet.sleep,
        life: pet.life,
        lastDecayAt: pet.last_decay_at.toISOString(),
        fullscreenMode: pet.fullscreen_mode,
        createdAt: pet.created_at.toISOString(),
      },
      equipment,
      inventoryCount,
      activeFarmPlots: farmPlots,
      gold: (userConfig?.gold ?? BigInt(0)).toString(),
      gems: userConfig?.gems ?? 0,
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Include room data for room preview rendering
      roomPrefix: room?.asset_prefix ?? 'rooms/default',
      furniture: furnitureMap,
      roomLayout: layoutRow?.layout ?? {},
      // --- END AI-MODIFIED ---
      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Include active gameboy skin asset path for frame rendering
      gameboySkinPath: skinRow?.asset_path ?? null,
      // --- END AI-MODIFIED ---
    })
  },
})
