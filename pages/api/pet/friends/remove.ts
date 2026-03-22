// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Unfriend -- deletes the friendship row using
//          ordered pair (lower userid first)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const targetId = parseBigInt(req.body?.targetUserId, "targetUserId")

    if (targetId === userId) {
      return res.status(400).json({ error: "Invalid target" })
    }

    const [lower, upper] = userId < targetId
      ? [userId, targetId]
      : [targetId, userId]

    const deleted = await prisma.lg_friends.deleteMany({
      where: { userid1: lower, userid2: upper },
    })

    if (deleted.count === 0) {
      return res.status(404).json({ error: "You are not friends with this user" })
    }

    return res.status(200).json({ success: true })
  },
})
