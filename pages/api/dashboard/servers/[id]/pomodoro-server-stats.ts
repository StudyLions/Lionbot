// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Server-level pomodoro analytics - summary stats,
//          per-timer breakdown, daily trend, usage heatmap,
//          and top users leaderboard
// ============================================================
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: validate guild id from query via parseBigInt (400 on invalid)
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const timers = await prisma.timers.findMany({
      where: { guildid: guildId },
      select: { channelid: true, pretty_name: true, channel_name: true },
    })

    if (timers.length === 0) {
      return res.status(200).json({
        summary: {
          totalSessions: 0, totalHours: 0, uniqueUsers: 0,
          avgSessionMinutes: 0, sessionsThisWeek: 0, hoursThisWeek: 0, activeThisWeek: 0,
        },
        perTimer: [],
        dailyTrend: [],
        heatmap: [],
        topUsers: [],
      })
    }

    const timerChannelIds = timers.map((t) => t.channelid)
    const timerNameMap = new Map(
      timers.map((t) => [t.channelid.toString(), t.pretty_name || t.channel_name || `Timer ${t.channelid}`])
    )

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setUTCDate(weekStart.getUTCDate() - 7)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const [
      summaryRaw,
      weekRaw,
      perTimerRaw,
      perTimerWeekRaw,
      dailyTrendRaw,
      heatmapRaw,
      topUsersRaw,
    ] = await Promise.all([
      prisma.$queryRaw<[{
        total_sessions: bigint
        total_duration: bigint
        unique_users: bigint
        avg_duration: number | null
      }]>`
        SELECT
          COUNT(*) as total_sessions,
          COALESCE(SUM(duration), 0) as total_duration,
          COUNT(DISTINCT userid) as unique_users,
          AVG(duration)::float as avg_duration
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
      `,

      prisma.$queryRaw<[{
        sessions_week: bigint
        duration_week: bigint
        active_week: bigint
      }]>`
        SELECT
          COUNT(*) as sessions_week,
          COALESCE(SUM(duration), 0) as duration_week,
          COUNT(DISTINCT userid) as active_week
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
          AND start_time >= ${weekStart}
      `,

      prisma.$queryRaw<Array<{
        channelid: bigint
        total_sessions: bigint
        total_duration: bigint
        unique_users: bigint
      }>>`
        SELECT
          channelid,
          COUNT(*) as total_sessions,
          COALESCE(SUM(duration), 0) as total_duration,
          COUNT(DISTINCT userid) as unique_users
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
        GROUP BY channelid
      `,

      prisma.$queryRaw<Array<{
        channelid: bigint
        duration_week: bigint
      }>>`
        SELECT
          channelid,
          COALESCE(SUM(duration), 0) as duration_week
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
          AND start_time >= ${weekStart}
        GROUP BY channelid
      `,

      prisma.$queryRaw<Array<{
        day: string
        total_minutes: bigint
        session_count: bigint
      }>>`
        SELECT
          to_char(start_time, 'YYYY-MM-DD') as day,
          COALESCE(SUM(duration) / 60, 0) as total_minutes,
          COUNT(*) as session_count
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
          AND start_time >= ${thirtyDaysAgo}
        GROUP BY day
        ORDER BY day
      `,

      prisma.$queryRaw<Array<{
        dow: number
        hour: number
        cnt: bigint
      }>>`
        SELECT
          EXTRACT(DOW FROM start_time)::int as dow,
          EXTRACT(HOUR FROM start_time)::int as hour,
          COUNT(*) as cnt
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
        GROUP BY dow, hour
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        total_duration: bigint
        session_count: bigint
      }>>`
        SELECT
          userid,
          COALESCE(SUM(duration), 0) as total_duration,
          COUNT(*) as session_count
        FROM voice_sessions
        WHERE guildid = ${guildId}
          AND channelid IN (${Prisma.join(timerChannelIds)})
        GROUP BY userid
        ORDER BY total_duration DESC
        LIMIT 10
      `,
    ])

    const topUserIds = topUsersRaw.map((u) => u.userid)
    const memberRows = topUserIds.length > 0
      ? await prisma.members.findMany({
          where: { guildid: guildId, userid: { in: topUserIds } },
          select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true, name: true } } },
        })
      : []
    const memberMap = new Map(memberRows.map((m) => [m.userid.toString(), m]))

    const missingIds = topUserIds.filter((uid) => !memberMap.has(uid.toString()))
    const globalUsers = missingIds.length > 0
      ? await prisma.user_config.findMany({
          where: { userid: { in: missingIds } },
          select: { userid: true, name: true, avatar_hash: true },
        })
      : []
    const globalMap = new Map(globalUsers.map((u) => [u.userid.toString(), u]))

    const s = summaryRaw[0]
    const w = weekRaw[0]
    const totalDuration = Number(s?.total_duration || 0)

    const weekHoursMap = new Map(perTimerWeekRaw.map((r) => [r.channelid.toString(), Number(r.duration_week || 0)]))

    const perTimer = timers.map((t) => {
      const cid = t.channelid.toString()
      const stats = perTimerRaw.find((r) => r.channelid.toString() === cid)
      const weekDuration = weekHoursMap.get(cid) || 0
      return {
        channelid: cid,
        prettyName: timerNameMap.get(cid) || `Timer ${cid}`,
        totalSessions: Number(stats?.total_sessions || 0),
        totalHours: Math.round(Number(stats?.total_duration || 0) / 3600 * 10) / 10,
        uniqueUsers: Number(stats?.unique_users || 0),
        hoursThisWeek: Math.round(weekDuration / 3600 * 10) / 10,
      }
    })

    const dailyMap = new Map<string, { minutes: number; sessions: number }>()
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo)
      date.setUTCDate(date.getUTCDate() + d)
      dailyMap.set(date.toISOString().slice(0, 10), { minutes: 0, sessions: 0 })
    }
    for (const row of dailyTrendRaw) {
      const entry = dailyMap.get(row.day)
      if (entry) {
        entry.minutes = Number(row.total_minutes)
        entry.sessions = Number(row.session_count)
      }
    }
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }))

    const heatmap = heatmapRaw.map((h) => ({
      dayOfWeek: Number(h.dow),
      hour: Number(h.hour),
      count: Number(h.cnt),
    }))

    const topUsers = topUsersRaw.map((u) => {
      const uid = u.userid.toString()
      const member = memberMap.get(uid)
      const global = globalMap.get(uid)
      const name = member?.display_name || member?.user_config?.name || global?.name || `User ${uid}`
      const hash = member?.user_config?.avatar_hash ?? global?.avatar_hash ?? null
      return {
        userId: uid,
        name,
        avatarUrl: buildAvatarUrl(uid, hash),
        totalHours: Math.round(Number(u.total_duration) / 3600 * 10) / 10,
        sessions: Number(u.session_count),
      }
    })

    res.status(200).json({
      summary: {
        totalSessions: Number(s?.total_sessions || 0),
        totalHours: Math.round(totalDuration / 3600 * 10) / 10,
        uniqueUsers: Number(s?.unique_users || 0),
        avgSessionMinutes: Math.round((s?.avg_duration || 0) / 60),
        sessionsThisWeek: Number(w?.sessions_week || 0),
        hoursThisWeek: Math.round(Number(w?.duration_week || 0) / 3600 * 10) / 10,
        activeThisWeek: Number(w?.active_week || 0),
      },
      perTimer,
      dailyTrend,
      heatmap,
      topUsers,
    })
  },
})
