// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Accept or decline a friend request -- validates
//          ownership, friend limits, creates friendship pair
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function calcMaxFriends(petLevel: number): number {
  return Math.min(20, 10 + Math.floor((petLevel - 1) / 5))
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { requestId, action } = req.body as {
      requestId?: number
      action?: string
    }

    if (!requestId || typeof requestId !== "number") {
      return res.status(400).json({ error: "Missing or invalid requestId" })
    }
    if (action !== "accept" && action !== "decline") {
      return res.status(400).json({ error: 'Action must be "accept" or "decline"' })
    }

    const request = await prisma.lg_friend_requests.findUnique({
      where: { request_id: requestId },
    })

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" })
    }
    if (request.to_userid !== userId) {
      return res.status(403).json({ error: "This request is not addressed to you" })
    }
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: "This request has already been handled" })
    }

    if (action === "decline") {
      await prisma.lg_friend_requests.update({
        where: { request_id: requestId },
        data: { status: "DECLINED" },
      })
      return res.status(200).json({ success: true })
    }

    const fromUserId = request.from_userid

    const [myPet, theirPet, myFriendCount, theirFriendCount] = await Promise.all([
      prisma.lg_pets.findUnique({
        where: { userid: userId },
        select: { level: true },
      }),
      prisma.lg_pets.findUnique({
        where: { userid: fromUserId },
        select: { level: true },
      }),
      prisma.lg_friends.count({
        where: { OR: [{ userid1: userId }, { userid2: userId }] },
      }),
      prisma.lg_friends.count({
        where: { OR: [{ userid1: fromUserId }, { userid2: fromUserId }] },
      }),
    ])

    if (!myPet) {
      return res.status(400).json({ error: "You need a pet to accept friend requests" })
    }
    if (!theirPet) {
      return res.status(400).json({ error: "The sender no longer has a pet" })
    }

    const myMax = calcMaxFriends(myPet.level)
    if (myFriendCount >= myMax) {
      return res.status(400).json({ error: `You have reached your friend limit (${myMax})` })
    }
    const theirMax = calcMaxFriends(theirPet.level)
    if (theirFriendCount >= theirMax) {
      return res.status(400).json({ error: "The sender has reached their friend limit" })
    }

    const [lower, upper] = userId < fromUserId
      ? [userId, fromUserId]
      : [fromUserId, userId]

    await prisma.$transaction([
      prisma.lg_friends.create({
        data: { userid1: lower, userid2: upper },
      }),
      prisma.lg_friend_requests.update({
        where: { request_id: requestId },
        data: { status: "ACCEPTED" },
      }),
    ])

    return res.status(200).json({ success: true })
  },
})
