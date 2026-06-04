// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, transport-agnostic FRIENDS logic for the Anki addon
//          (and, for the write actions, the website too). Friendships are
//          ordered pairs in lg_friends (userid1 < userid2); requests live
//          in lg_friend_requests; care interactions in lg_friend_interactions
//          (one per type/day UTC). Every action is scoped to the
//          authenticated userId and friendship-gated — you can only act on
//          someone you're actually friends with (no IDOR / griefing).
//
//          Reads (addon-shaped): listFriends / listPendingRequests /
//          getFriendProfile. Writes (the validated path, shared with the
//          web routes): sendFriendRequest / respondFriendRequest /
//          removeFriend / interactWithFriend.
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"

const DECAY_INTERVAL_HOURS = 24
const MAX_DECAY_PER_WAKE = 4
const REQUEST_RATE_LIMIT = 10
export const FRIEND_INTERACTIONS = ["FEED", "BATHE", "SLEEP", "WATER", "WATER_ALL"] as const

export function calcMaxFriends(petLevel: number): number {
  return Math.min(20, 10 + Math.floor((petLevel - 1) / 5))
}

function applyDecay(food: number, bath: number, sleep: number, last: Date | null) {
  if (!last) return { food, bath, sleep }
  const elapsed = (Date.now() - new Date(last).getTime()) / (1000 * 3600)
  const ticks = Math.min(Math.floor(elapsed / DECAY_INTERVAL_HOURS), MAX_DECAY_PER_WAKE)
  return {
    food: Math.max(0, food - ticks),
    bath: Math.max(0, bath - ticks),
    sleep: Math.max(0, sleep - ticks),
  }
}

function orderedPair(a: bigint, b: bigint): [bigint, bigint] {
  return a < b ? [a, b] : [b, a]
}

function toBigInt(v: unknown, field: string): bigint {
  try {
    if (typeof v === "bigint") return v
    if (typeof v === "number" && Number.isInteger(v)) return BigInt(v)
    if (typeof v === "string" && /^\d{1,20}$/.test(v.trim())) return BigInt(v.trim())
  } catch {
    // fallthrough
  }
  throw new PetServiceError(400, "bad_id", `Invalid ${field}`)
}

async function friendshipExists(a: bigint, b: bigint): Promise<boolean> {
  const [lower, upper] = orderedPair(a, b)
  const row = await prisma.lg_friends.findUnique({
    where: { userid1_userid2: { userid1: lower, userid2: upper } },
  })
  return !!row
}

// ============================== READS ==============================

export async function listFriends(userId: bigint) {
  const pet = await prisma.lg_pets.findUnique({ where: { userid: userId }, select: { level: true } })
  if (!pet) throw new PetServiceError(404, "no_pet", "No pet found. Use /pet in Discord first.")

  const [friendRows, pendingCount] = await Promise.all([
    prisma.lg_friends.findMany({
      where: { OR: [{ userid1: userId }, { userid2: userId }] },
      select: { userid1: true, userid2: true, created_at: true },
    }),
    prisma.lg_friend_requests.count({ where: { to_userid: userId, status: "PENDING" } }),
  ])

  const friendUserIds = friendRows.map((f) => (f.userid1 === userId ? f.userid2 : f.userid1))
  const sinceMap = new Map(
    friendRows.map((f) => [(f.userid1 === userId ? f.userid2 : f.userid1).toString(), f.created_at])
  )

  const [petRows, configRows] =
    friendUserIds.length > 0
      ? await Promise.all([
          prisma.lg_pets.findMany({
            where: { userid: { in: friendUserIds } },
            select: { userid: true, pet_name: true, level: true, expression: true, food: true, bath: true, sleep: true, last_decay_at: true },
          }),
          prisma.user_config.findMany({
            where: { userid: { in: friendUserIds } },
            select: { userid: true, name: true, avatar_hash: true },
          }),
        ])
      : [[], []]

  const petMap = new Map(petRows.map((p) => [p.userid.toString(), p]))
  const configMap = new Map(configRows.map((c) => [c.userid.toString(), c]))

  const friends = friendUserIds.map((fid) => {
    const k = fid.toString()
    const p = petMap.get(k)
    const c = configMap.get(k)
    const d = applyDecay(p?.food ?? 0, p?.bath ?? 0, p?.sleep ?? 0, p?.last_decay_at ?? null)
    return {
      discordId: k,
      name: c?.name ?? null,
      avatarHash: c?.avatar_hash ?? null,
      petName: p?.pet_name ?? null,
      petLevel: p?.level ?? 0,
      expression: (p?.expression ?? "default").toLowerCase(),
      friendsSince: sinceMap.get(k)?.toISOString() ?? null,
      ...d,
    }
  })
  friends.sort((a, b) => (b.petLevel - a.petLevel) || (a.name || "").localeCompare(b.name || ""))

  return { friends, pendingCount, maxFriends: calcMaxFriends(pet.level) }
}

export async function listPendingRequests(userId: bigint) {
  const rows = await prisma.lg_friend_requests.findMany({
    where: { to_userid: userId, status: "PENDING" },
    orderBy: { created_at: "desc" },
    select: { request_id: true, from_userid: true, created_at: true },
  })
  const fromIds = rows.map((r) => r.from_userid)
  const [configs, pets] =
    fromIds.length > 0
      ? await Promise.all([
          prisma.user_config.findMany({ where: { userid: { in: fromIds } }, select: { userid: true, name: true, avatar_hash: true } }),
          prisma.lg_pets.findMany({ where: { userid: { in: fromIds } }, select: { userid: true, pet_name: true, level: true } }),
        ])
      : [[], []]
  const cMap = new Map(configs.map((c) => [c.userid.toString(), c]))
  const pMap = new Map(pets.map((p) => [p.userid.toString(), p]))
  return {
    requests: rows.map((r) => {
      const k = r.from_userid.toString()
      return {
        requestId: r.request_id,
        fromUserId: k,
        fromUserName: cMap.get(k)?.name ?? "Unknown",
        fromAvatarHash: cMap.get(k)?.avatar_hash ?? null,
        fromPetName: pMap.get(k)?.pet_name ?? null,
        fromPetLevel: pMap.get(k)?.level ?? 0,
        createdAt: r.created_at?.toISOString() ?? null,
      }
    }),
  }
}

export async function getFriendProfile(userId: bigint, rawTargetId: unknown) {
  const targetId = toBigInt(rawTargetId, "userId")
  if (targetId === userId) throw new PetServiceError(400, "self", "That's your own pet")

  // Blocked BY the target -> can't view.
  const blocked = await prisma.lg_blocks.findUnique({
    where: { blocker_userid_blocked_userid: { blocker_userid: targetId, blocked_userid: userId } },
  })
  if (blocked) throw new PetServiceError(403, "blocked", "You cannot view this user's profile")

  const [pet, config] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: targetId },
      select: { pet_name: true, level: true, expression: true, food: true, bath: true, sleep: true, last_decay_at: true },
    }),
    prisma.user_config.findUnique({ where: { userid: targetId }, select: { name: true, avatar_hash: true } }),
  ])
  if (!pet) throw new PetServiceError(404, "no_pet", "User does not have a pet")

  const isFriend = await friendshipExists(userId, targetId)
  const today = { feed: false, bathe: false, sleep: false, waterPlots: [] as number[] }
  if (isFriend) {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const interactions = await prisma.lg_friend_interactions.findMany({
      where: { actor_userid: userId, target_userid: targetId, created_at: { gte: todayStart } },
      select: { interaction_type: true, plot_id: true },
    })
    for (const i of interactions) {
      if (i.interaction_type === "FEED") today.feed = true
      else if (i.interaction_type === "BATHE") today.bathe = true
      else if (i.interaction_type === "SLEEP") today.sleep = true
      else if (i.interaction_type === "WATER" && i.plot_id != null) today.waterPlots.push(i.plot_id)
    }
  }

  const d = applyDecay(pet.food, pet.bath, pet.sleep, pet.last_decay_at)
  return {
    discordId: targetId.toString(),
    name: config?.name ?? null,
    avatarHash: config?.avatar_hash ?? null,
    pet: {
      petName: pet.pet_name,
      level: pet.level,
      expression: (pet.expression ?? "default").toLowerCase(),
      ...d,
    },
    isFriend,
    todayInteractions: today,
  }
}

// ============================== WRITES ==============================

export async function sendFriendRequest(userId: bigint, query: unknown) {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    throw new PetServiceError(400, "bad_query", "Please provide a Discord username or ID")
  }
  const trimmed = query.trim()

  let targetConfig: { userid: bigint; name: string | null } | null = null
  if (/^\d{17,20}$/.test(trimmed)) {
    targetConfig = await prisma.user_config.findUnique({ where: { userid: BigInt(trimmed) }, select: { userid: true, name: true } })
  }
  if (!targetConfig) {
    targetConfig = await prisma.user_config.findFirst({ where: { name: { equals: trimmed, mode: "insensitive" } }, select: { userid: true, name: true } })
  }
  if (!targetConfig) throw new PetServiceError(404, "user_not_found", "User not found")

  const targetId = targetConfig.userid
  if (targetId === userId) throw new PetServiceError(400, "self", "You cannot send a friend request to yourself")

  const targetPet = await prisma.lg_pets.findUnique({ where: { userid: targetId }, select: { level: true } })
  if (!targetPet) throw new PetServiceError(400, "target_no_pet", "That user does not have a pet")

  const [senderPet, blocked, reverseBlocked, existingFriend, existingRequest, senderFriendCount, targetFriendCount] = await Promise.all([
    prisma.lg_pets.findUnique({ where: { userid: userId }, select: { level: true } }),
    prisma.lg_blocks.findUnique({ where: { blocker_userid_blocked_userid: { blocker_userid: targetId, blocked_userid: userId } } }),
    prisma.lg_blocks.findUnique({ where: { blocker_userid_blocked_userid: { blocker_userid: userId, blocked_userid: targetId } } }),
    prisma.lg_friends.findFirst({
      where: { userid1: userId < targetId ? userId : targetId, userid2: userId < targetId ? targetId : userId },
    }),
    prisma.lg_friend_requests.findFirst({
      where: {
        OR: [
          { from_userid: userId, to_userid: targetId, status: "PENDING" },
          { from_userid: targetId, to_userid: userId, status: "PENDING" },
        ],
      },
    }),
    prisma.lg_friends.count({ where: { OR: [{ userid1: userId }, { userid2: userId }] } }),
    prisma.lg_friends.count({ where: { OR: [{ userid1: targetId }, { userid2: targetId }] } }),
  ])

  if (!senderPet) throw new PetServiceError(400, "no_pet", "You need a pet to send friend requests")
  if (blocked || reverseBlocked) throw new PetServiceError(400, "blocked", "Cannot send friend request to this user")
  if (existingFriend) throw new PetServiceError(400, "already_friends", "You are already friends with this user")
  if (existingRequest) throw new PetServiceError(400, "request_exists", "A pending friend request already exists between you")

  const senderMax = calcMaxFriends(senderPet.level)
  if (senderFriendCount >= senderMax) throw new PetServiceError(400, "limit_reached", `You have reached your friend limit (${senderMax})`)
  if (targetFriendCount >= calcMaxFriends(targetPet.level)) throw new PetServiceError(400, "target_limit", "That user has reached their friend limit")

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recent = await prisma.lg_friend_requests.count({ where: { from_userid: userId, created_at: { gte: oneDayAgo } } })
  if (recent >= REQUEST_RATE_LIMIT) {
    throw new PetServiceError(429, "rate_limited", `You can only send ${REQUEST_RATE_LIMIT} friend requests per day. Try again later.`)
  }

  await prisma.lg_friend_requests.create({ data: { from_userid: userId, to_userid: targetId, status: "PENDING" } })
  return { success: true, targetName: targetConfig.name ?? trimmed }
}

export async function respondFriendRequest(userId: bigint, requestId: unknown, action: unknown) {
  if (typeof requestId !== "number" || !Number.isInteger(requestId)) {
    throw new PetServiceError(400, "bad_request_id", "Missing or invalid requestId")
  }
  if (action !== "accept" && action !== "decline") {
    throw new PetServiceError(400, "bad_action", 'Action must be "accept" or "decline"')
  }

  const request = await prisma.lg_friend_requests.findUnique({ where: { request_id: requestId } })
  if (!request) throw new PetServiceError(404, "not_found", "Friend request not found")
  if (request.to_userid !== userId) throw new PetServiceError(403, "not_yours", "This request is not addressed to you")
  if (request.status !== "PENDING") throw new PetServiceError(400, "already_handled", "This request has already been handled")

  if (action === "decline") {
    await prisma.lg_friend_requests.update({ where: { request_id: requestId }, data: { status: "DECLINED" } })
    return { success: true, action: "declined" }
  }

  const fromUserId = request.from_userid
  const [myPet, theirPet, myCount, theirCount] = await Promise.all([
    prisma.lg_pets.findUnique({ where: { userid: userId }, select: { level: true } }),
    prisma.lg_pets.findUnique({ where: { userid: fromUserId }, select: { level: true } }),
    prisma.lg_friends.count({ where: { OR: [{ userid1: userId }, { userid2: userId }] } }),
    prisma.lg_friends.count({ where: { OR: [{ userid1: fromUserId }, { userid2: fromUserId }] } }),
  ])
  if (!myPet) throw new PetServiceError(400, "no_pet", "You need a pet to accept friend requests")
  if (!theirPet) throw new PetServiceError(400, "sender_no_pet", "The sender no longer has a pet")
  if (myCount >= calcMaxFriends(myPet.level)) throw new PetServiceError(400, "limit_reached", `You have reached your friend limit (${calcMaxFriends(myPet.level)})`)
  if (theirCount >= calcMaxFriends(theirPet.level)) throw new PetServiceError(400, "sender_limit", "The sender has reached their friend limit")

  const [lower, upper] = orderedPair(userId, fromUserId)
  await prisma.$transaction([
    prisma.lg_friends.create({ data: { userid1: lower, userid2: upper } }),
    prisma.lg_friend_requests.update({ where: { request_id: requestId }, data: { status: "ACCEPTED" } }),
  ])
  return { success: true, action: "accepted" }
}

export async function removeFriend(userId: bigint, rawTargetId: unknown) {
  const targetId = toBigInt(rawTargetId, "targetUserId")
  const [lower, upper] = orderedPair(userId, targetId)
  const result = await prisma.lg_friends.deleteMany({ where: { userid1: lower, userid2: upper } })
  if (result.count === 0) throw new PetServiceError(404, "not_friends", "You are not friends with this user")
  return { success: true }
}

export async function interactWithFriend(userId: bigint, rawTargetId: unknown, type: unknown, plotId?: unknown) {
  const targetId = toBigInt(rawTargetId, "targetUserId")
  if (targetId === userId) throw new PetServiceError(400, "self", "Use care for your own pet")
  if (typeof type !== "string" || !FRIEND_INTERACTIONS.includes(type as any)) {
    throw new PetServiceError(400, "bad_type", "Invalid type. Use: FEED, BATHE, SLEEP, WATER, WATER_ALL")
  }
  const plot = typeof plotId === "number" ? plotId : null
  if (type === "WATER" && plot == null) throw new PetServiceError(400, "plot_required", "plotId is required for WATER")

  if (!(await friendshipExists(userId, targetId))) {
    throw new PetServiceError(403, "not_friends", "You are not friends with this user")
  }

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  if (type !== "WATER_ALL") {
    const existing = await prisma.lg_friend_interactions.findFirst({
      where: {
        actor_userid: userId, target_userid: targetId, interaction_type: type,
        created_at: { gte: todayStart }, ...(type === "WATER" ? { plot_id: plot } : {}),
      },
    })
    if (existing) {
      throw new PetServiceError(
        400, "already_today",
        type === "WATER" ? "You already watered this plot today" : `You already used ${type} on this friend's pet today`
      )
    }
  }

  const targetPet = await prisma.lg_pets.findUnique({ where: { userid: targetId }, select: { userid: true } })
  if (!targetPet) throw new PetServiceError(404, "friend_no_pet", "Friend's pet not found")

  if (type === "FEED") {
    await prisma.$executeRaw`UPDATE lg_pets SET food = LEAST(food + 2, 8) WHERE userid = ${targetId}`
  } else if (type === "BATHE") {
    await prisma.$executeRaw`UPDATE lg_pets SET bath = LEAST(bath + 2, 8) WHERE userid = ${targetId}`
  } else if (type === "SLEEP") {
    await prisma.$executeRaw`UPDATE lg_pets SET sleep = LEAST(sleep + 2, 8) WHERE userid = ${targetId}`
  } else if (type === "WATER") {
    const updated = await prisma.lg_user_farm.updateMany({ where: { userid: targetId, plot_id: plot! }, data: { last_watered: new Date() } })
    if (updated.count === 0) throw new PetServiceError(404, "plot_not_found", "Farm plot not found")
    await prisma.$executeRaw`UPDATE lg_pets SET xp = xp + 5 WHERE userid = ${userId}`
  } else if (type === "WATER_ALL") {
    const plots = await prisma.lg_user_farm.findMany({
      where: { userid: targetId, seed_id: { not: null }, dead: false },
      select: { plot_id: true },
    })
    let wateredCount = 0
    for (const p of plots) {
      const already = await prisma.lg_friend_interactions.findFirst({
        where: { actor_userid: userId, target_userid: targetId, interaction_type: "WATER", plot_id: p.plot_id, created_at: { gte: todayStart } },
      })
      if (already) continue
      await prisma.lg_user_farm.updateMany({ where: { userid: targetId, plot_id: p.plot_id }, data: { last_watered: new Date() } })
      await prisma.lg_friend_interactions.create({ data: { actor_userid: userId, target_userid: targetId, interaction_type: "WATER", plot_id: p.plot_id } })
      wateredCount++
    }
    if (wateredCount > 0) {
      await prisma.$executeRaw`UPDATE lg_pets SET xp = xp + ${wateredCount * 5} WHERE userid = ${userId}`
    }
    return { success: true, wateredCount }
  }

  await prisma.lg_friend_interactions.create({
    data: { actor_userid: userId, target_userid: targetId, interaction_type: type, plot_id: type === "WATER" ? plot : null },
  })
  return { success: true }
}
