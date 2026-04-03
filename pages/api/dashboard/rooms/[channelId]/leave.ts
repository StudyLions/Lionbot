// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: API route for members to voluntarily leave a private room.
//          Deletes their rented_members row. Discord permission cleanup
//          is handled by the bot on next sync/restart.
// ============================================================
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      include: { rented_members: { select: { userid: true } } },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    if (room.deleted_at) {
      return res.status(400).json({ error: "This room has expired" })
    }
    if (room.ownerid === auth.userId) {
      return res.status(400).json({ error: "Room owners cannot leave. Use Close Room instead, or transfer ownership first." })
    }
    if (!room.rented_members.some((m) => m.userid === auth.userId)) {
      return res.status(400).json({ error: "You are not a member of this room" })
    }

    await prisma.rented_members.delete({
      where: {
        channelid_userid: {
          channelid: channelId,
          userid: auth.userId,
        },
      },
    })

    res.status(200).json({ message: "You have left the room" })
  },
})
