// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, transport-agnostic room logic — the validated path
//          used by BOTH the website (pages/api/pet/room.ts switch branch,
//          NextAuth) and the Anki addon (pages/api/anki/pet/room.ts,
//          bearer). Fully user-scoped (no IDOR): every query keyed by the
//          passed userId; switching to a non-default room requires that
//          the user actually owns it.
//
//          getRoomState(userId) -> rooms list + active + balances (for the
//                                  native room switcher)
//          switchRoom(userId, roomId) -> set active_room_id (ownership-checked)
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"

// The default room (id 1) is always available even without an
// lg_user_rooms ownership row (matches pages/api/pet/room.ts).
const DEFAULT_ROOM_ID = 1

export async function getRoomState(userId: bigint) {
  const [pet, userConfig, allRooms, ownedRooms] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { active_room_id: true },
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
  ])

  const ownedSet = new Set(ownedRooms.map((r) => r.room_id))
  const activeRoomId = pet?.active_room_id ?? null
  const rooms = allRooms.map((r) => ({
    roomId: r.room_id,
    name: r.name,
    assetPrefix: r.asset_prefix,
    hasFurniture: r.has_furniture,
    goldPrice: r.gold_price,
    gemPrice: r.gem_price,
    owned: r.room_id === DEFAULT_ROOM_ID || ownedSet.has(r.room_id),
    active: r.room_id === activeRoomId,
  }))

  return {
    hasPet: !!pet,
    activeRoomId,
    rooms,
    gold: (userConfig?.gold ?? BigInt(0)).toString(),
    gems: userConfig?.gems ?? 0,
  }
}

export async function switchRoom(userId: bigint, rawRoomId: unknown) {
  if (typeof rawRoomId !== "number" || !Number.isInteger(rawRoomId) || rawRoomId < 1) {
    throw new PetServiceError(400, "bad_room_id", "Invalid roomId")
  }
  const roomId = rawRoomId

  // Ownership check for everything but the always-available default room.
  if (roomId !== DEFAULT_ROOM_ID) {
    const ownedRoom = await prisma.lg_user_rooms.findFirst({
      where: { userid: userId, room_id: roomId },
    })
    if (!ownedRoom) {
      throw new PetServiceError(403, "room_not_owned", "You do not own this room")
    }
  }

  // Cleaner 404 than letting Prisma throw P2025 on a missing pet row.
  const pet = await prisma.lg_pets.findUnique({
    where: { userid: userId },
    select: { userid: true },
  })
  if (!pet) {
    throw new PetServiceError(404, "no_pet", "No pet found. Use /pet in Discord first.")
  }

  await prisma.lg_pets.update({
    where: { userid: userId },
    data: { active_room_id: roomId },
  })
  return { success: true, activeRoomId: roomId }
}

/** Purchase a room (gold and/or gems) and grant ownership. Affordability
 *  is enforced atomically by the conditional UPDATE (… WHERE gold >= cost
 *  RETURNING). Does NOT switch active room — callers switch separately. */
export async function purchaseRoom(userId: bigint, rawRoomId: unknown) {
  if (typeof rawRoomId !== "number" || rawRoomId <= 0) {
    throw new PetServiceError(400, "bad_room_id", "Valid roomId is required")
  }
  const roomId = rawRoomId

  const room = await prisma.lg_rooms.findUnique({ where: { room_id: roomId } })
  if (!room) throw new PetServiceError(404, "room_not_found", "Room not found")

  const existing = await prisma.lg_user_rooms.findUnique({
    where: { userid_room_id: { userid: userId, room_id: roomId } },
  })
  if (existing) throw new PetServiceError(400, "already_owned", "Room already owned")

  const goldCost = room.gold_price ?? 0
  const gemCost = room.gem_price ?? 0
  if (goldCost === 0 && gemCost === 0) {
    throw new PetServiceError(400, "free_room", "This room is free and should already be unlocked")
  }

  const userConfig = await prisma.user_config.findUnique({
    where: { userid: userId },
    select: { gold: true, gems: true },
  })
  const currentGold = Number(userConfig?.gold ?? 0)
  const currentGems = userConfig?.gems ?? 0
  if (goldCost > 0 && currentGold < goldCost) {
    throw new PetServiceError(400, "insufficient_gold", "Insufficient gold")
  }
  if (gemCost > 0 && currentGems < gemCost) {
    throw new PetServiceError(400, "insufficient_gems", "Insufficient gems")
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (goldCost > 0) {
        const r = await tx.$queryRawUnsafe<{ gold: bigint }[]>(
          `UPDATE user_config SET gold = gold - $2 WHERE userid = $1 AND gold >= $2 RETURNING gold`,
          userId, BigInt(goldCost)
        )
        if (r.length === 0) throw new PetServiceError(400, "insufficient_gold", "Insufficient gold (race condition)")
      }
      if (gemCost > 0) {
        const r = await tx.$queryRawUnsafe<{ gems: number }[]>(
          `UPDATE user_config SET gems = gems - $2 WHERE userid = $1 AND gems >= $2 RETURNING gems`,
          userId, gemCost
        )
        if (r.length === 0) throw new PetServiceError(400, "insufficient_gems", "Insufficient gems (race condition)")
      }
      // PK (userid, room_id): a racing second purchase hits a unique violation
      // here, which rolls back the debit above — converted to a clean error below.
      await tx.lg_user_rooms.create({ data: { userid: userId, room_id: roomId } })
    })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      throw new PetServiceError(400, "already_owned", "Room already owned")
    }
    throw err
  }

  const updated = await prisma.user_config.findUnique({
    where: { userid: userId },
    select: { gold: true, gems: true },
  })
  return {
    success: true,
    newGold: (updated?.gold ?? BigInt(0)).toString(),
    newGems: updated?.gems ?? 0,
  }
}
