// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: List active family members with pet visual data
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Full rewrite to return PetVisualData for MiniGameboy,
//          discordName/avatarHash from user_config, and correct
//          field names (discordId, petName, petLevel, petVisual).
// --- END AI-MODIFIED ---
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { getRoomDefaults } from "@/utils/roomDefaults"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const familyId = membership.family_id

    const members = await prisma.lg_family_members.findMany({
      where: { family_id: familyId, left_at: null },
      orderBy: { joined_at: "asc" },
    })

    const userIds = members.map((m) => m.userid)

    // --- AI-MODIFIED (2026-04-24) ---
    // Purpose: Also fetch cosmetics_enabled per pet and the cosmetic overlay
    // rows so family portraits show the same merged visuals each member sees
    // on their own pet card. Stats are not surfaced in this view, so we
    // pre-merge cosmetics over equipment per slot for each member.
    const [pets, userConfigs, allEquipment, allCosmetics] = await Promise.all([
      prisma.lg_pets.findMany({
        where: { userid: { in: userIds } },
        select: {
          userid: true,
          pet_name: true,
          level: true,
          expression: true,
          active_room_id: true,
          active_gameboy_skin_id: true,
          cosmetics_enabled: true,
        },
      }),
      prisma.user_config.findMany({
        where: { userid: { in: userIds } },
        select: { userid: true, name: true, avatar_hash: true },
      }),
      prisma.lg_pet_equipment.findMany({
        where: { userid: { in: userIds } },
        select: {
          userid: true,
          slot: true,
          lg_items: {
            select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
          },
        },
      }),
      prisma.lg_pet_cosmetics.findMany({
        where: { userid: { in: userIds } },
        select: {
          userid: true,
          slot: true,
          lg_items: {
            select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
          },
        },
      }),
    ])
    // --- END AI-MODIFIED ---

    const petMap = new Map(pets.map((p) => [p.userid.toString(), p]))
    const userMap = new Map(userConfigs.map((u) => [u.userid.toString(), u]))

    const roomIds = pets.filter((p) => p.active_room_id).map((p) => p.active_room_id!)
    const rooms = roomIds.length > 0
      ? await prisma.lg_rooms.findMany({
          where: { room_id: { in: roomIds } },
          select: { room_id: true, asset_prefix: true },
        })
      : []
    const roomMap = new Map(rooms.map((r) => [r.room_id, r.asset_prefix]))

    const skinIds = pets
      .filter((p) => p.active_gameboy_skin_id)
      .map((p) => p.active_gameboy_skin_id!)
    const skins = skinIds.length > 0
      ? await prisma.lg_gameboy_skins.findMany({
          where: { skin_id: { in: skinIds } },
          select: { skin_id: true, asset_path: true },
        })
      : []
    const skinMap = new Map(skins.map((s) => [s.skin_id, s.asset_path]))

    const equipPerUser = new Map<
      string,
      Record<string, { assetPath: string; category: string }>
    >()
    for (const e of allEquipment) {
      const key = e.userid.toString()
      if (!equipPerUser.has(key)) equipPerUser.set(key, {})
      equipPerUser.get(key)![e.slot] = {
        assetPath: e.lg_items.asset_path,
        category: e.lg_items.category,
      }
    }

    // --- AI-MODIFIED (2026-04-24) ---
    // Purpose: Cosmetic overlay per user. Applied per slot on top of the
    // equipment map only when the owning pet's cosmetics_enabled flag is on.
    const cosmeticPerUser = new Map<
      string,
      Record<string, { assetPath: string; category: string }>
    >()
    for (const c of allCosmetics) {
      const key = c.userid.toString()
      if (!cosmeticPerUser.has(key)) cosmeticPerUser.set(key, {})
      cosmeticPerUser.get(key)![c.slot] = {
        assetPath: c.lg_items.asset_path,
        category: c.lg_items.category,
      }
    }
    // --- END AI-MODIFIED ---

    let allFurniture: { userid: bigint; slot: string; asset_path: string }[] = []
    let allLayouts: { userid: bigint; layout: unknown }[] = []

    if (userIds.length > 0) {
      const placeholders = userIds.map((_, i) => `$${i + 1}`).join(", ")
      ;[allFurniture, allLayouts] = await Promise.all([
        prisma.$queryRawUnsafe<{ userid: bigint; slot: string; asset_path: string }[]>(
          `SELECT userid, slot, asset_path FROM lg_user_furniture WHERE userid IN (${placeholders})`,
          ...userIds
        ),
        prisma.$queryRawUnsafe<{ userid: bigint; layout: unknown }[]>(
          `SELECT userid, layout FROM lg_room_layout WHERE userid IN (${placeholders})`,
          ...userIds
        ),
      ])
    }

    const furniturePerUser = new Map<string, Record<string, string>>()
    for (const f of allFurniture) {
      const key = f.userid.toString()
      if (!furniturePerUser.has(key)) furniturePerUser.set(key, {})
      let path = f.asset_path
      if (!path.startsWith("rooms/")) path = `rooms/furniture/${path}`
      furniturePerUser.get(key)![f.slot] = path
    }

    const layoutPerUser = new Map<string, unknown>()
    for (const l of allLayouts) {
      layoutPerUser.set(l.userid.toString(), l.layout)
    }

    const result = members.map((m) => {
      const uid = m.userid.toString()
      const pet = petMap.get(uid)
      const user = userMap.get(uid)
      const roomPrefix = pet?.active_room_id
        ? roomMap.get(pet.active_room_id) ?? "rooms/default"
        : "rooms/default"
      const skinPath = pet?.active_gameboy_skin_id
        ? skinMap.get(pet.active_gameboy_skin_id) ?? null
        : null

      const defaults = getRoomDefaults(roomPrefix)
      const userFurn = furniturePerUser.get(uid) ?? {}
      const furniture = { ...defaults, ...userFurn }

      // --- AI-MODIFIED (2026-04-24) ---
      // Purpose: Pre-merge cosmetic overlay over equipment when this pet
      // has cosmetics_enabled. Family portraits should match what the pet
      // owner sees on their own card.
      const baseEquipment = equipPerUser.get(uid) ?? {}
      const userCosmetics = cosmeticPerUser.get(uid) ?? {}
      const showCosmetics = pet?.cosmetics_enabled !== false
      const renderedEquipment = showCosmetics
        ? { ...baseEquipment, ...userCosmetics }
        : baseEquipment
      // --- END AI-MODIFIED ---

      return {
        discordId: uid,
        discordName: user?.name ?? "Unknown",
        avatarHash: user?.avatar_hash ?? null,
        petName: pet?.pet_name ?? "Unknown",
        petLevel: pet?.level ?? 1,
        role: m.role,
        contributionXp: m.contribution_xp.toString(),
        joinedAt: m.joined_at?.toISOString() ?? new Date().toISOString(),
        petVisual: {
          roomPrefix,
          furniture,
          roomLayout: layoutPerUser.get(uid) ?? {},
          equipment: renderedEquipment,
          expression: (pet?.expression ?? "default").toLowerCase(),
          skinPath,
        },
      }
    })

    return res.status(200).json({ members: result })
  },
})
