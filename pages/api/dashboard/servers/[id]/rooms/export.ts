// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: CSV export for room data -- room list with stats
//          or per-room voice session data
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ""
  const s = String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const type = (req.query.type as string) || "list"
    const channelIdParam = req.query.channelId as string | undefined

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { renting_price: true, name: true },
    })
    const rentPrice = guildConfig?.renting_price ?? 1000

    if (type === "sessions" && channelIdParam) {
      const channelId = BigInt(channelIdParam)
      const sessions = await prisma.voice_sessions.findMany({
        where: { channelid: channelId, guildid: guildId },
        orderBy: { start_time: "desc" },
        take: 1000,
        select: {
          userid: true, start_time: true, duration: true,
          live_duration: true, stream_duration: true, video_duration: true, tag: true,
        },
      })

      const header = "userId,startTime,durationSeconds,liveDuration,streamDuration,videoDuration,tag"
      const rows = sessions.map((s) =>
        [s.userid.toString(), s.start_time.toISOString(), s.duration,
         s.live_duration, s.stream_duration, s.video_duration,
         escapeCsv(s.tag)].join(",")
      )

      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="room-sessions-${channelIdParam}.csv"`)
      return res.status(200).send([header, ...rows].join("\n"))
    }

    const rooms = await prisma.rented_rooms.findMany({
      where: { guildid: guildId },
      include: { rented_members: { select: { userid: true } } },
      orderBy: { created_at: "desc" },
    })

    const ownerIds = rooms.map((r) => r.ownerid)
    const [userConfigs, memberRows] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: ownerIds } },
        select: { userid: true, name: true },
      }),
      prisma.members.findMany({
        where: { guildid: guildId, userid: { in: ownerIds } },
        select: { userid: true, display_name: true },
      }),
    ])
    const ucMap = new Map(userConfigs.map((u) => [u.userid.toString(), u.name]))
    const memMap = new Map(memberRows.map((m) => [m.userid.toString(), m.display_name]))

    const header = "channelId,name,ownerId,ownerName,coinBalance,daysRemaining,memberCount,totalContribution,createdAt,deletedAt,status,frozen"
    const rows = rooms.map((r) => {
      const oidStr = r.ownerid.toString()
      const ownerName = memMap.get(oidStr) || ucMap.get(oidStr) || oidStr
      const days = rentPrice > 0 ? Math.floor(r.coin_balance / rentPrice) : 999
      const status = r.deleted_at ? "expired" : "active"
      return [
        r.channelid.toString(), escapeCsv(r.name), oidStr, escapeCsv(ownerName),
        r.coin_balance, days, r.rented_members.length + 1, r.contribution,
        r.created_at?.toISOString() ?? "", r.deleted_at?.toISOString() ?? "",
        status, r.frozen_at ? "yes" : "no",
      ].join(",")
    })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="rooms-${guildId}.csv"`)
    res.status(200).send([header, ...rows].join("\n"))
  },
})
