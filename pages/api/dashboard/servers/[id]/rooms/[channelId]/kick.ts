// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Admin kick member from a private room with audit logging
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: "userId required" })

    const targetUserId = BigInt(userId)

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { guildid: true, ownerid: true },
    })
    if (!room || room.guildid !== guildId) {
      return res.status(404).json({ error: "Room not found in this server" })
    }
    if (room.ownerid === targetUserId) {
      return res.status(400).json({ error: "Cannot kick the room owner" })
    }

    const deleted = await prisma.rented_members.deleteMany({
      where: { channelid: channelId, userid: targetUserId },
    })
    if (deleted.count === 0) {
      return res.status(404).json({ error: "User is not a member of this room" })
    }

    await prisma.room_admin_log.create({
      data: {
        channelid: channelId,
        guildid: guildId,
        adminid: auth.userId,
        action: "kick_member",
        details: { kickedUserId: userId },
      },
    })

    res.status(200).json({ success: true })
  },
})
