// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Pet room editor API - room data, layout, furniture, room switching
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const ROOM_LAYERS = ["wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window"]

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Reduced defaults to wall/floor/mat only -- new pets start with mostly empty rooms
const DEFAULT_ROOM_FURNITURE: Record<string, Record<string, string>> = {
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
// --- END AI-MODIFIED ---

function getDefaultFurniture(roomPrefix: string): Record<string, string> {
  return DEFAULT_ROOM_FURNITURE[roomPrefix] ?? {}
}
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const [pet, userConfig, allRooms, ownedRooms, equipmentRows] = await Promise.all([
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: {
          pet_name: true,
          expression: true,
          level: true,
          active_room_id: true,
        },
      }),
      prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true, gems: true },
      }),
      prisma.lg_rooms.findMany({
        select: {
          room_id: true,
          name: true,
          asset_prefix: true,
          has_furniture: true,
          gold_price: true,
          gem_price: true,
        },
        orderBy: { room_id: "asc" },
      }),
      prisma.lg_user_rooms.findMany({
        where: { userid: userId },
        select: { room_id: true },
      }),
      prisma.lg_pet_equipment.findMany({
        where: { userid: userId },
        select: {
          slot: true,
          lg_items: { select: { name: true, category: true, rarity: true, asset_path: true } },
        },
      }),
    ])

    let activeRoom: { roomId: number; name: string; assetPrefix: string } | null = null
    if (pet?.active_room_id) {
      const room = allRooms.find((r) => r.room_id === pet.active_room_id)
      if (room) {
        activeRoom = { roomId: room.room_id, name: room.name, assetPrefix: room.asset_prefix }
      }
    }

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Query all FURNITURE items with ownership status for the room editor panel
    const [allFurniture, ownedItems] = await Promise.all([
      prisma.lg_items.findMany({
        where: { category: 'FURNITURE' },
        select: { itemid: true, name: true, asset_path: true, gold_price: true, gem_price: true, rarity: true },
        orderBy: { itemid: 'asc' },
      }),
      prisma.lg_user_inventory.findMany({
        where: { userid: userId },
        select: { itemid: true },
      }),
    ])
    const ownedItemIds = new Set(ownedItems.map(i => i.itemid))
    // --- END AI-MODIFIED ---

    const furnitureRows = await prisma.$queryRawUnsafe<{ slot: string; asset_path: string }[]>(
      `SELECT slot, asset_path FROM lg_user_furniture WHERE userid = $1`,
      userId
    )
    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Merge user furniture with room defaults so every slot is populated.
    //          Normalize legacy paths missing the rooms/furniture/ prefix.
    const roomPrefix = activeRoom?.assetPrefix ?? "rooms/default"
    const defaults = getDefaultFurniture(roomPrefix)
    const furniture: Record<string, string> = { ...defaults }
    for (const row of furnitureRows) {
      let path = row.asset_path
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Normalize raw filenames to rooms/furniture/ where they exist on CDN.
      // Full paths like "rooms/default/lamp_purple.png" are used as-is.
      if (!path.startsWith("rooms/")) {
        path = `rooms/furniture/${path}`
      }
      // --- END AI-MODIFIED ---
      furniture[row.slot] = path
    }
    // --- END AI-MODIFIED ---

    const layoutRows = await prisma.$queryRawUnsafe<{ layout: any }[]>(
      `SELECT layout FROM lg_room_layout WHERE userid = $1`,
      userId
    )
    const layout = layoutRows.length > 0 ? layoutRows[0].layout : {}

    const ownedSet = new Set(ownedRooms.map((r) => r.room_id))
    const rooms = allRooms.map((r) => ({
      roomId: r.room_id,
      name: r.name,
      assetPrefix: r.asset_prefix,
      hasFurniture: r.has_furniture,
      goldPrice: r.gold_price,
      gemPrice: r.gem_price,
      owned: ownedSet.has(r.room_id),
    }))

    const equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string }> = {}
    for (const e of equipmentRows) {
      equipment[e.slot] = {
        name: e.lg_items.name,
        category: e.lg_items.category,
        rarity: e.lg_items.rarity,
        assetPath: e.lg_items.asset_path,
      }
    }

    return res.status(200).json({
      activeRoom,
      furniture,
      layout,
      rooms,
      equipment,
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Lowercase expression to match blob asset paths (DB stores UPPERCASE)
      pet: pet
        ? { name: pet.pet_name, expression: (pet.expression ?? 'default').toLowerCase(), level: pet.level }
        : null,
      // --- END AI-MODIFIED ---
      gold: (userConfig?.gold ?? BigInt(0)).toString(),
      gems: userConfig?.gems ?? 0,
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: All FURNITURE items with ownership flag for room editor item picker
      availableItems: allFurniture.map(item => ({
        itemId: item.itemid,
        name: item.name,
        assetPath: item.asset_path,
        goldPrice: item.gold_price,
        gemPrice: item.gem_price,
        rarity: item.rarity,
        owned: ownedItemIds.has(item.itemid),
      })),
      // --- END AI-MODIFIED ---
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { layout, activeRoomId, slot, assetPath } = req.body

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Cast layout string to jsonb explicitly for PostgreSQL compatibility
    if (layout !== undefined) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO lg_room_layout (userid, layout, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (userid) DO UPDATE SET layout = $2::jsonb, updated_at = now()`,
        userId,
        JSON.stringify(layout)
      )
      return res.status(200).json({ success: true })
    }
    // --- END AI-MODIFIED ---

    if (activeRoomId !== undefined) {
      await prisma.lg_pets.update({
        where: { userid: userId },
        data: { active_room_id: activeRoomId },
      })
      return res.status(200).json({ success: true })
    }

    if (slot !== undefined && assetPath !== undefined) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO lg_user_furniture (userid, slot, asset_path) VALUES ($1, $2, $3) ON CONFLICT (userid, slot) DO UPDATE SET asset_path = $3`,
        userId,
        slot,
        assetPath
      )
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: "Invalid request body" })
  },
})
