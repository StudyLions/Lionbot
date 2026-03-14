// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Schedule analytics - summary stats, daily attendance
//          trends, booking heatmap, top members, upcoming
//          sessions, and coin flow
// ============================================================
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

interface MemberRow {
  userid: bigint
  display_name: string | null
  avatar_hash: string | null
  global_name: string | null
}

async function resolveMemberNames(guildId: bigint, userIds: bigint[]) {
  if (userIds.length === 0) return new Map<string, { name: string; avatarUrl: string }>()

  const members = await prisma.members.findMany({
    where: { guildid: guildId, userid: { in: userIds } },
    select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true, name: true } } },
  })
  const memberMap = new Map(members.map((m) => [m.userid.toString(), m]))

  const missingIds = userIds.filter((uid) => !memberMap.has(uid.toString()))
  const globals = missingIds.length > 0
    ? await prisma.user_config.findMany({
        where: { userid: { in: missingIds } },
        select: { userid: true, name: true, avatar_hash: true },
      })
    : []
  const globalMap = new Map(globals.map((u) => [u.userid.toString(), u]))

  const result = new Map<string, { name: string; avatarUrl: string }>()
  for (const uid of userIds) {
    const id = uid.toString()
    const member = memberMap.get(id)
    const global = globalMap.get(id)
    const name = member?.display_name || member?.user_config?.name || global?.name || `User ${id}`
    const hash = member?.user_config?.avatar_hash ?? global?.avatar_hash ?? null
    result.set(id, { name, avatarUrl: buildAvatarUrl(id, hash) })
  }
  return result
}

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const now = new Date()
    const nowSlotId = Math.floor(now.getTime() / 1000 / 3600) * 3600
    const next24hSlotId = nowSlotId + 24 * 3600
    const weekStart = new Date(now)
    weekStart.setUTCDate(weekStart.getUTCDate() - 7)
    const weekStartSlotId = Math.floor(weekStart.getTime() / 1000 / 3600) * 3600
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)
    const thirtyDaysSlotId = Math.floor(thirtyDaysAgo.getTime() / 1000 / 3600) * 3600

    const [
      summaryRaw,
      weekStats,
      dailyTrendRaw,
      heatmapRaw,
      topReliableRaw,
      topActiveRaw,
      topNoShowsRaw,
      upcomingRaw,
      coinFlowRaw,
    ] = await Promise.all([
      prisma.$queryRaw<[{
        total_sessions: bigint
        total_bookings: bigint
        total_attended: bigint
        total_missed: bigint
        unique_members: bigint
      }]>`
        SELECT
          COUNT(DISTINCT ss.slotid) as total_sessions,
          COUNT(ssm.*) as total_bookings,
          COUNT(*) FILTER (WHERE ssm.attended = true) as total_attended,
          COUNT(*) FILTER (WHERE ssm.attended = false AND ss.closed_at IS NOT NULL) as total_missed,
          COUNT(DISTINCT ssm.userid) as unique_members
        FROM schedule_sessions ss
        LEFT JOIN schedule_session_members ssm ON ssm.guildid = ss.guildid AND ssm.slotid = ss.slotid
        WHERE ss.guildid = ${guildId}
      `,

      prisma.$queryRaw<[{
        sessions_week: bigint
        bookings_week: bigint
        attended_week: bigint
        active_members_week: bigint
      }]>`
        SELECT
          COUNT(DISTINCT ss.slotid) as sessions_week,
          COUNT(ssm.*) as bookings_week,
          COUNT(*) FILTER (WHERE ssm.attended = true) as attended_week,
          COUNT(DISTINCT ssm.userid) as active_members_week
        FROM schedule_sessions ss
        LEFT JOIN schedule_session_members ssm ON ssm.guildid = ss.guildid AND ssm.slotid = ss.slotid
        WHERE ss.guildid = ${guildId} AND ss.slotid >= ${weekStartSlotId}
      `,

      prisma.$queryRaw<Array<{
        day: string
        bookings: bigint
        attended: bigint
        missed: bigint
      }>>`
        SELECT
          to_char(to_timestamp(ss.slotid), 'YYYY-MM-DD') as day,
          COUNT(ssm.*) as bookings,
          COUNT(*) FILTER (WHERE ssm.attended = true) as attended,
          COUNT(*) FILTER (WHERE ssm.attended = false AND ss.closed_at IS NOT NULL) as missed
        FROM schedule_sessions ss
        LEFT JOIN schedule_session_members ssm ON ssm.guildid = ss.guildid AND ssm.slotid = ss.slotid
        WHERE ss.guildid = ${guildId} AND ss.slotid >= ${thirtyDaysSlotId}
        GROUP BY day
        ORDER BY day
      `,

      prisma.$queryRaw<Array<{
        dow: number
        hour: number
        cnt: bigint
      }>>`
        SELECT
          EXTRACT(DOW FROM to_timestamp(ssm.slotid))::int as dow,
          EXTRACT(HOUR FROM to_timestamp(ssm.slotid))::int as hour,
          COUNT(*) as cnt
        FROM schedule_session_members ssm
        WHERE ssm.guildid = ${guildId}
        GROUP BY dow, hour
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        total_booked: bigint
        total_attended: bigint
        rate: number
      }>>`
        SELECT
          ssm.userid,
          COUNT(*) as total_booked,
          COUNT(*) FILTER (WHERE ssm.attended = true) as total_attended,
          ROUND(COUNT(*) FILTER (WHERE ssm.attended = true) * 100.0 / NULLIF(COUNT(*), 0)) as rate
        FROM schedule_session_members ssm
        JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        WHERE ssm.guildid = ${guildId} AND ss.closed_at IS NOT NULL
        GROUP BY ssm.userid
        HAVING COUNT(*) >= 3
        ORDER BY rate DESC, total_attended DESC
        LIMIT 10
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        total_booked: bigint
      }>>`
        SELECT userid, COUNT(*) as total_booked
        FROM schedule_session_members
        WHERE guildid = ${guildId}
        GROUP BY userid
        ORDER BY total_booked DESC
        LIMIT 10
      `,

      prisma.$queryRaw<Array<{
        userid: bigint
        total_missed: bigint
        total_booked: bigint
      }>>`
        SELECT
          ssm.userid,
          COUNT(*) FILTER (WHERE ssm.attended = false) as total_missed,
          COUNT(*) as total_booked
        FROM schedule_session_members ssm
        JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        WHERE ssm.guildid = ${guildId} AND ss.closed_at IS NOT NULL
        GROUP BY ssm.userid
        HAVING COUNT(*) FILTER (WHERE ssm.attended = false) > 0
        ORDER BY total_missed DESC
        LIMIT 10
      `,

      prisma.$queryRaw<Array<{
        slotid: number
        userid: bigint
        booked_at: Date
      }>>`
        SELECT ssm.slotid, ssm.userid, ssm.booked_at
        FROM schedule_session_members ssm
        JOIN schedule_sessions ss ON ss.guildid = ssm.guildid AND ss.slotid = ssm.slotid
        WHERE ssm.guildid = ${guildId}
          AND ssm.slotid >= ${nowSlotId}
          AND ssm.slotid < ${next24hSlotId}
          AND ss.closed_at IS NULL
        ORDER BY ssm.slotid, ssm.booked_at
      `,

      prisma.$queryRaw<[{
        total_spent: bigint
        total_earned: bigint
      }]>`
        SELECT
          COALESCE(SUM(CASE WHEN ct.transactiontype = 'SCHEDULE_BOOK' THEN ABS(ct.amount) ELSE 0 END), 0) as total_spent,
          COALESCE(SUM(CASE WHEN ct.transactiontype = 'SCHEDULE_REWARD' THEN ct.amount ELSE 0 END), 0) as total_earned
        FROM coin_transactions ct
        WHERE ct.guildid = ${guildId}
          AND ct.transactiontype IN ('SCHEDULE_BOOK', 'SCHEDULE_REWARD')
      `,
    ])

    const allUserIds = new Set<bigint>()
    for (const r of topReliableRaw) allUserIds.add(r.userid)
    for (const r of topActiveRaw) allUserIds.add(r.userid)
    for (const r of topNoShowsRaw) allUserIds.add(r.userid)
    for (const r of upcomingRaw) allUserIds.add(r.userid)
    const nameMap = await resolveMemberNames(guildId, Array.from(allUserIds))

    const s = summaryRaw[0]
    const w = weekStats[0]
    const totalBookings = Number(s?.total_bookings || 0)
    const totalAttended = Number(s?.total_attended || 0)
    const totalMissed = Number(s?.total_missed || 0)

    const dailyMap = new Map<string, { bookings: number; attended: number; missed: number }>()
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo)
      date.setUTCDate(date.getUTCDate() + d)
      dailyMap.set(date.toISOString().slice(0, 10), { bookings: 0, attended: 0, missed: 0 })
    }
    for (const row of dailyTrendRaw) {
      const entry = dailyMap.get(row.day)
      if (entry) {
        entry.bookings = Number(row.bookings)
        entry.attended = Number(row.attended)
        entry.missed = Number(row.missed)
      }
    }
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
      rate: data.bookings > 0 ? Math.round((data.attended / data.bookings) * 100) : 0,
    }))

    const heatmap = heatmapRaw.map((h) => ({
      dayOfWeek: Number(h.dow),
      hour: Number(h.hour),
      count: Number(h.cnt),
    }))

    const upcomingSlots = new Map<number, Array<{ userId: string; name: string; avatarUrl: string; bookedAt: string }>>()
    for (const r of upcomingRaw) {
      const sid = r.slotid
      if (!upcomingSlots.has(sid)) upcomingSlots.set(sid, [])
      const info = nameMap.get(r.userid.toString()) || { name: `User ${r.userid}`, avatarUrl: buildAvatarUrl(r.userid.toString(), null) }
      upcomingSlots.get(sid)!.push({
        userId: r.userid.toString(),
        name: info.name,
        avatarUrl: info.avatarUrl,
        bookedAt: r.booked_at.toISOString(),
      })
    }
    const upcoming = Array.from(upcomingSlots.entries()).map(([slotid, members]) => ({
      slotid,
      slotTime: new Date(slotid * 1000).toISOString(),
      memberCount: members.length,
      members,
    }))

    const cf = coinFlowRaw[0]

    res.status(200).json({
      summary: {
        totalSessions: Number(s?.total_sessions || 0),
        totalBookings,
        totalAttended,
        totalMissed,
        attendanceRate: totalBookings > 0 ? Math.round((totalAttended / totalBookings) * 100) : 0,
        uniqueMembers: Number(s?.unique_members || 0),
        sessionsThisWeek: Number(w?.sessions_week || 0),
        bookingsThisWeek: Number(w?.bookings_week || 0),
        attendedThisWeek: Number(w?.attended_week || 0),
        activeThisWeek: Number(w?.active_members_week || 0),
      },
      dailyTrend,
      heatmap,
      topMembers: {
        mostReliable: topReliableRaw.map((r) => {
          const info = nameMap.get(r.userid.toString())
          return {
            userId: r.userid.toString(),
            name: info?.name || `User ${r.userid}`,
            avatarUrl: info?.avatarUrl || buildAvatarUrl(r.userid.toString(), null),
            totalBooked: Number(r.total_booked),
            totalAttended: Number(r.total_attended),
            rate: Number(r.rate),
          }
        }),
        mostActive: topActiveRaw.map((r) => {
          const info = nameMap.get(r.userid.toString())
          return {
            userId: r.userid.toString(),
            name: info?.name || `User ${r.userid}`,
            avatarUrl: info?.avatarUrl || buildAvatarUrl(r.userid.toString(), null),
            totalBooked: Number(r.total_booked),
          }
        }),
        mostNoShows: topNoShowsRaw.map((r) => {
          const info = nameMap.get(r.userid.toString())
          return {
            userId: r.userid.toString(),
            name: info?.name || `User ${r.userid}`,
            avatarUrl: info?.avatarUrl || buildAvatarUrl(r.userid.toString(), null),
            totalMissed: Number(r.total_missed),
            totalBooked: Number(r.total_booked),
          }
        }),
      },
      upcoming,
      coinFlow: {
        totalSpent: Number(cf?.total_spent || 0),
        totalEarned: Number(cf?.total_earned || 0),
        netFlow: Number(cf?.total_earned || 0) - Number(cf?.total_spent || 0),
      },
    })
  },
})
