// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Pet room editor API - room data, layout, furniture, room switching
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const ROOM_LAYERS = ["wall", "floor", "mat", "table", "chair", "bed", "lamp", "picture", "window"]

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
          roomid: true,
          name: true,
          asset_prefix: true,
          has_furniture: true,
          gold_price: true,
          gem_price: true,
        },
        orderBy: { roomid: "asc" },
      }),
      prisma.lg_user_rooms.findMany({
        where: { userid: userId },
        select: { roomid: true },
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
      const room = allRooms.find((r) => r.roomid === pet.active_room_id)
      if (room) {
        activeRoom = { roomId: room.roomid, name: room.name, assetPrefix: room.asset_prefix }
      }
    }

    const furnitureRows = await prisma.$queryRawUnsafe<{ slot: string; asset_path: string }[]>(
      `SELECT slot, asset_path FROM lg_user_furniture WHERE userid = $1`,
      userId
    )
    const furniture: Record<string, string> = {}
    for (const row of furnitureRows) {
      furniture[row.slot] = row.asset_path
    }

    const layoutRows = await prisma.$queryRawUnsafe<{ layout: any }[]>(
      `SELECT layout FROM lg_room_layout WHERE userid = $1`,
      userId
    )
    const layout = layoutRows.length > 0 ? layoutRows[0].layout : {}

    const ownedSet = new Set(ownedRooms.map((r) => r.roomid))
    const rooms = allRooms.map((r) => ({
      roomId: r.roomid,
      name: r.name,
      assetPrefix: r.asset_prefix,
      hasFurniture: r.has_furniture,
      goldPrice: r.gold_price,
      gemPrice: r.gem_price,
      owned: ownedSet.has(r.roomid),
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
      pet: pet
        ? { name: pet.pet_name, expression: pet.expression, level: pet.level }
        : null,
      gold: (userConfig?.gold ?? BigInt(0)).toString(),
      gems: userConfig?.gems ?? 0,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { layout, activeRoomId, slot, assetPath } = req.body

    if (layout !== undefined) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO lg_room_layout (userid, layout, updated_at) VALUES ($1, $2, now()) ON CONFLICT (userid) DO UPDATE SET layout = $2, updated_at = now()`,
        userId,
        JSON.stringify(layout)
      )
      return res.status(200).json({ success: true })
    }

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
