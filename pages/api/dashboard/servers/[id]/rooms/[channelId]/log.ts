// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Admin audit log for a specific room -- returns all
//          admin actions taken on this room with admin display names
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { guildid: true },
    })
    if (!room || room.guildid !== guildId) {
      return res.status(404).json({ error: "Room not found in this server" })
    }

    const logs = await prisma.room_admin_log.findMany({
      where: { channelid: channelId },
      orderBy: { created_at: "desc" },
      take: 50,
    })

    const adminIds = [...new Set(logs.map((l) => l.adminid))]
    const [adminConfigs, adminMembers] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: adminIds } },
        select: { userid: true, name: true },
      }),
      prisma.members.findMany({
        where: { guildid: guildId, userid: { in: adminIds } },
        select: { userid: true, display_name: true },
      }),
    ])
    const acMap = new Map(adminConfigs.map((u) => [u.userid.toString(), u.name]))
    const amMap = new Map(adminMembers.map((m) => [m.userid.toString(), m.display_name]))

    const entries = logs.map((l) => {
      const adminIdStr = l.adminid.toString()
      return {
        logId: l.logid,
        action: l.action,
        details: l.details,
        adminId: adminIdStr,
        adminName: amMap.get(adminIdStr) || acMap.get(adminIdStr) || `User ${adminIdStr.slice(-4)}`,
        createdAt: l.created_at.toISOString(),
      }
    })

    res.status(200).json({ entries })
  },
})
