// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET study session history for logged-in user
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add guild names, all duration types, date/type filters, richer stats, ongoing session, CSV export
// --- END AI-MODIFIED ---
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const format = req.query.format as string | undefined
    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50)
    const guildFilter = req.query.guild ? BigInt(req.query.guild as string) : undefined
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
    const typeFilter = req.query.type as string | undefined

    const where: any = { userid: auth.userId }
    if (guildFilter) where.guildid = guildFilter
    if (dateFrom || dateTo) {
      where.start_time = {}
      if (dateFrom) where.start_time.gte = dateFrom
      if (dateTo) {
        const end = new Date(dateTo)
        end.setUTCDate(end.getUTCDate() + 1)
        where.start_time.lte = end
      }
    }
    if (typeFilter === "camera") where.video_duration = { gt: 0 }
    else if (typeFilter === "stream") where.stream_duration = { gt: 0 }
    else if (typeFilter === "voice") {
      where.video_duration = { equals: 0 }
      where.stream_duration = { equals: 0 }
    }

    // CSV export: fetch all matching sessions (capped at 10,000)
    if (format === "csv") {
      const allSessions = await prisma.voice_sessions.findMany({
        where,
        orderBy: { start_time: "desc" },
        take: 10000,
        select: {
          guildid: true, start_time: true, duration: true,
          video_duration: true, stream_duration: true, tag: true, rating: true,
        },
      })
      const guildIds = Array.from(new Set(allSessions.map(s => s.guildid)))
      const guilds = guildIds.length > 0
        ? await prisma.guild_config.findMany({
            where: { guildid: { in: guildIds } },
            select: { guildid: true, name: true },
          })
        : []
      const guildMap = new Map(guilds.map(g => [g.guildid.toString(), g.name || "Unknown"]))

      const rows = ["Date,Start Time,Server,Duration (min),Camera (min),Stream (min),Tag,Rating"]
      for (const s of allSessions) {
        const dt = new Date(s.start_time)
        const date = dt.toISOString().slice(0, 10)
        const time = dt.toISOString().slice(11, 16)
        const name = (guildMap.get(s.guildid.toString()) || "Unknown").replace(/,/g, " ")
        const dur = Math.round(s.duration / 60)
        const cam = Math.round((s.video_duration || 0) / 60)
        const str = Math.round((s.stream_duration || 0) / 60)
        const tag = (s.tag || "").replace(/,/g, " ")
        rows.push(`${date},${time},${name},${dur},${cam},${str},${tag},${s.rating ?? ""}`)
      }
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=study-history.csv")
      return res.status(200).send(rows.join("\n"))
    }

    const [sessions, total, statsAgg, longestRaw, dayBreakdown, ongoingSessions] = await Promise.all([
      prisma.voice_sessions.findMany({
        where,
        orderBy: { start_time: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          // --- AI-MODIFIED (2026-03-23) ---
          // Purpose: Include is_manual flag for Voice Time Editor badge in history UI
          sessionid: true, guildid: true, start_time: true, duration: true,
          live_duration: true, stream_duration: true, video_duration: true,
          tag: true, rating: true, is_manual: true,
          // --- END AI-MODIFIED ---
        },
      }),
      prisma.voice_sessions.count({ where }),
      prisma.voice_sessions.aggregate({
        where,
        _sum: { duration: true },
        _count: true,
      }),
      prisma.voice_sessions.findFirst({
        where,
        orderBy: { duration: "desc" },
        select: { duration: true },
      }),
      prisma.$queryRaw<{ dow: number; total_seconds: bigint }[]>(Prisma.sql`
        SELECT EXTRACT(DOW FROM start_time AT TIME ZONE 'UTC')::int as dow,
               SUM(duration)::bigint as total_seconds
        FROM voice_sessions
        WHERE userid = ${auth.userId}
          ${guildFilter ? Prisma.sql`AND guildid = ${guildFilter}` : Prisma.empty}
          ${dateFrom ? Prisma.sql`AND start_time >= ${dateFrom}` : Prisma.empty}
          ${dateTo ? Prisma.sql`AND start_time <= ${new Date(new Date(dateTo).setUTCDate(dateTo.getUTCDate() + 1))}` : Prisma.empty}
        GROUP BY dow ORDER BY total_seconds DESC LIMIT 1
      `),
      prisma.voice_sessions_ongoing.findMany({
        where: { userid: auth.userId },
        select: {
          guildid: true, start_time: true,
          live_video: true, live_stream: true,
        },
      }),
    ])

    // Resolve guild names
    const allGuildIds = Array.from(new Set([
      ...sessions.map(s => s.guildid),
      ...ongoingSessions.map(s => s.guildid),
    ]))
    const guilds = allGuildIds.length > 0
      ? await prisma.guild_config.findMany({
          where: { guildid: { in: allGuildIds } },
          select: { guildid: true, name: true },
        })
      : []
    const guildNameMap = new Map(guilds.map(g => [g.guildid.toString(), g.name || "Unknown"]))

    // Unique servers in filtered results
    const uniqueServersRaw = await prisma.voice_sessions.groupBy({
      by: ["guildid"],
      where,
    })

    const totalDuration = statsAgg._sum.duration || 0
    const totalSessions = statsAgg._count
    const mostActiveDay = dayBreakdown.length > 0 ? DAY_NAMES[dayBreakdown[0].dow] : null

    // Ongoing session
    const ongoing = ongoingSessions.length > 0 ? ongoingSessions[0] : null
    const ongoingSession = ongoing ? {
      guildId: ongoing.guildid.toString(),
      guildName: guildNameMap.get(ongoing.guildid.toString()) || "Unknown",
      startTime: ongoing.start_time,
      currentMinutes: ongoing.start_time
        ? Math.round((Date.now() - new Date(ongoing.start_time).getTime()) / 60000)
        : 0,
      isCamera: ongoing.live_video,
      isStream: ongoing.live_stream,
    } : null

    res.status(200).json({
      sessions: sessions.map((s) => ({
        id: s.sessionid,
        guildId: s.guildid.toString(),
        guildName: guildNameMap.get(s.guildid.toString()) || "Unknown",
        startTime: s.start_time,
        durationMinutes: Math.round(s.duration / 60),
        cameraDurationMinutes: Math.round((s.video_duration || 0) / 60),
        streamDurationMinutes: Math.round((s.stream_duration || 0) / 60),
        liveDurationMinutes: Math.round((s.live_duration || 0) / 60),
        tag: s.tag,
        rating: s.rating,
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: Voice Time Editor manual session badge
        isManual: !!s.is_manual,
        // --- END AI-MODIFIED ---
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      stats: {
        totalSessions,
        totalMinutes: Math.round(totalDuration / 60),
        avgSessionMinutes: totalSessions > 0 ? Math.round(totalDuration / 60 / totalSessions) : 0,
        longestSessionMinutes: longestRaw ? Math.round(longestRaw.duration / 60) : 0,
        mostActiveDay,
        uniqueServers: uniqueServersRaw.length,
      },
      ongoingSession,
    })
  },
})
