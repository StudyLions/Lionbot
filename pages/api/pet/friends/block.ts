// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Block/unblock a user -- also removes friendship
//          and pending requests when blocking
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { targetUserId, action } = req.body as {
      targetUserId?: string
      action?: string
    }

    const targetId = parseBigInt(targetUserId, "targetUserId")

    if (targetId === userId) {
      return res.status(400).json({ error: "You cannot block yourself" })
    }
    if (action !== "block" && action !== "unblock") {
      return res.status(400).json({ error: 'Action must be "block" or "unblock"' })
    }

    if (action === "unblock") {
      await prisma.lg_blocks.deleteMany({
        where: { blocker_userid: userId, blocked_userid: targetId },
      })
      return res.status(200).json({ success: true })
    }

    const [lower, upper] = userId < targetId
      ? [userId, targetId]
      : [targetId, userId]

    await prisma.$transaction([
      prisma.lg_blocks.upsert({
        where: {
          blocker_userid_blocked_userid: {
            blocker_userid: userId,
            blocked_userid: targetId,
          },
        },
        create: { blocker_userid: userId, blocked_userid: targetId },
        update: {},
      }),
      prisma.lg_friends.deleteMany({
        where: { userid1: lower, userid2: upper },
      }),
      prisma.lg_friend_requests.deleteMany({
        where: {
          OR: [
            { from_userid: userId, to_userid: targetId },
            { from_userid: targetId, to_userid: userId },
          ],
        },
      }),
    ])

    return res.status(200).json({ success: true })
  },
})
