// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: List active family members with pet visual data
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const familyId = parseInt(req.query.familyId as string, 10)
    if (!familyId || isNaN(familyId)) {
      return res.status(400).json({ error: "familyId is required" })
    }

    const family = await prisma.lg_families.findUnique({
      where: { family_id: familyId },
      select: { family_id: true },
    })
    if (!family) return res.status(404).json({ error: "Family not found" })

    const members = await prisma.lg_family_members.findMany({
      where: { family_id: familyId, left_at: null },
      orderBy: { joined_at: "asc" },
    })

    const userIds = members.map((m) => m.userid)

    const pets = await prisma.lg_pets.findMany({
      where: { userid: { in: userIds } },
      select: {
        userid: true,
        pet_name: true,
        level: true,
        expression: true,
        active_room_id: true,
      },
    })
    const petMap = new Map(pets.map((p) => [p.userid.toString(), p]))

    const rooms = await prisma.lg_rooms.findMany({
      where: {
        room_id: {
          in: pets.filter((p) => p.active_room_id != null).map((p) => p.active_room_id!),
        },
      },
      select: { room_id: true, asset_prefix: true },
    })
    const roomMap = new Map(rooms.map((r) => [r.room_id, r.asset_prefix]))

    const equipment = await prisma.lg_pet_equipment.findMany({
      where: { userid: { in: userIds } },
      select: {
        userid: true,
        slot: true,
        lg_items: { select: { name: true, category: true, rarity: true, asset_path: true } },
      },
    })
    const equipMap = new Map<string, Record<string, { name: string; category: string; rarity: string; assetPath: string }>>()
    for (const e of equipment) {
      const key = e.userid.toString()
      if (!equipMap.has(key)) equipMap.set(key, {})
      equipMap.get(key)![e.slot] = {
        name: e.lg_items.name,
        category: e.lg_items.category,
        rarity: e.lg_items.rarity,
        assetPath: e.lg_items.asset_path,
      }
    }

    const result = members.map((m) => {
      const pet = petMap.get(m.userid.toString())
      return {
        userId: m.userid.toString(),
        role: m.role,
        contributionXp: m.contribution_xp.toString(),
        joinedAt: m.joined_at.toISOString(),
        pet: pet
          ? {
              name: pet.pet_name,
              level: pet.level,
              expression: (pet.expression ?? "default").toLowerCase(),
              roomPrefix: pet.active_room_id ? roomMap.get(pet.active_room_id) ?? "rooms/default" : "rooms/default",
            }
          : null,
        equipment: equipMap.get(m.userid.toString()) ?? {},
      }
    })

    return res.status(200).json({ members: result })
  },
})
