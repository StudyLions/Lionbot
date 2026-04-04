// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: API route for room owners to remove (kick) members
//          from their private room. Deletes the rented_members row;
//          the bot syncs Discord permissions on its next member-sync loop.
// ============================================================
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { userId } = req.body

    if (!userId || typeof userId !== "string" || !/^\d{17,20}$/.test(userId.trim())) {
      throw new ValidationError("Invalid user ID")
    }

    const targetUserId = BigInt(userId.trim())

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      include: { rented_members: { select: { userid: true } } },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    if (room.deleted_at) {
      throw new ValidationError("This room has expired")
    }
    if (room.ownerid !== auth.userId) {
      return res.status(403).json({ error: "Only the room owner can remove members" })
    }

    if (targetUserId === room.ownerid) {
      throw new ValidationError("Cannot remove the room owner")
    }

    if (!room.rented_members.some((m) => m.userid === targetUserId)) {
      throw new ValidationError("This user is not a member of the room")
    }

    await prisma.rented_members.delete({
      where: {
        channelid_userid: {
          channelid: channelId,
          userid: targetUserId,
        },
      },
    })

    res.status(200).json({
      message: "Member removed. Discord permissions will update within a few minutes.",
      userId: targetUserId.toString(),
    })
  },
})
