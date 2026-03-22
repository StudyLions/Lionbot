// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Send friend request -- look up user by Discord
//          username or ID, validate limits, insert request
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function calcMaxFriends(petLevel: number): number {
  return Math.min(20, 10 + Math.floor((petLevel - 1) / 5))
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { query } = req.body as { query?: string }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Please provide a Discord username or ID" })
    }

    const trimmed = query.trim()

    let targetConfig: { userid: bigint; name: string | null } | null = null

    if (/^\d{17,20}$/.test(trimmed)) {
      targetConfig = await prisma.user_config.findUnique({
        where: { userid: BigInt(trimmed) },
        select: { userid: true, name: true },
      })
    }

    if (!targetConfig) {
      targetConfig = await prisma.user_config.findFirst({
        where: { name: { equals: trimmed, mode: "insensitive" } },
        select: { userid: true, name: true },
      })
    }

    if (!targetConfig) {
      return res.status(404).json({ error: "User not found" })
    }

    const targetId = targetConfig.userid
    if (targetId === userId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" })
    }

    const targetPet = await prisma.lg_pets.findUnique({
      where: { userid: targetId },
      select: { level: true },
    })
    if (!targetPet) {
      return res.status(400).json({ error: "That user does not have a pet" })
    }

    const [
      senderPet,
      blocked,
      reverseBlocked,
      existingFriend,
      existingRequest,
      senderFriendCount,
      targetFriendCount,
    ] = await Promise.all([
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true },
      }),
      prisma.lg_blocks.findUnique({
        where: {
          blocker_userid_blocked_userid: {
            blocker_userid: targetId,
            blocked_userid: userId,
          },
        },
      }),
      prisma.lg_blocks.findUnique({
        where: {
          blocker_userid_blocked_userid: {
            blocker_userid: userId,
            blocked_userid: targetId,
          },
        },
      }),
      prisma.lg_friends.findFirst({
        where: {
          OR: [
            { userid1: userId < targetId ? userId : targetId, userid2: userId < targetId ? targetId : userId },
          ],
        },
      }),
      prisma.lg_friend_requests.findFirst({
        where: {
          OR: [
            { from_userid: userId, to_userid: targetId, status: "PENDING" },
            { from_userid: targetId, to_userid: userId, status: "PENDING" },
          ],
        },
      }),
      prisma.lg_friends.count({
        where: { OR: [{ userid1: userId }, { userid2: userId }] },
      }),
      prisma.lg_friends.count({
        where: { OR: [{ userid1: targetId }, { userid2: targetId }] },
      }),
    ])

    if (!senderPet) {
      return res.status(400).json({ error: "You need a pet to send friend requests" })
    }
    if (blocked || reverseBlocked) {
      return res.status(400).json({ error: "Cannot send friend request to this user" })
    }
    if (existingFriend) {
      return res.status(400).json({ error: "You are already friends with this user" })
    }
    if (existingRequest) {
      return res.status(400).json({ error: "A pending friend request already exists between you" })
    }

    const senderMax = calcMaxFriends(senderPet.level)
    if (senderFriendCount >= senderMax) {
      return res.status(400).json({ error: `You have reached your friend limit (${senderMax})` })
    }

    const targetMax = calcMaxFriends(targetPet.level)
    if (targetFriendCount >= targetMax) {
      return res.status(400).json({ error: "That user has reached their friend limit" })
    }

    await prisma.lg_friend_requests.create({
      data: {
        from_userid: userId,
        to_userid: targetId,
        status: "PENDING",
      },
    })

    return res.status(200).json({ success: true })
  },
})
