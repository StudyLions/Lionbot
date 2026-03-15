// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Server admin overview stats - active users, activity,
//          moderation, and economy snapshots
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setUTCHours(0, 0, 0, 0)

    const weekStart = new Date(now)
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
    weekStart.setUTCHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

    const [
      activeSessions,
      studiedTodayResult,
      studiedThisWeekResult,
      totalMembers,
      newMembersThisWeek,
      openTickets,
      recentWarnings,
      activeStudyBans,
      coinsAggregate,
      transactionsToday,
      topEarnerResult,
    ] = await Promise.all([
      // --- AI-MODIFIED (2026-03-14) ---
      // Purpose: include tag field for session tags display on members page
      prisma.voice_sessions_ongoing.findMany({
        where: { guildid: guildId },
        select: {
          userid: true,
          channelid: true,
          start_time: true,
          tag: true,
          members: { select: { display_name: true } },
        },
      }),
      // --- END AI-MODIFIED ---

      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT userid) as count
        FROM voice_sessions
        WHERE guildid = ${guildId} AND start_time >= ${todayStart}
      `,

      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT userid) as count
        FROM voice_sessions
        WHERE guildid = ${guildId} AND start_time >= ${weekStart}
      `,

      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: filter to current members only (exclude those who left)
      prisma.members.count({ where: { guildid: guildId, last_left: null } }),

      prisma.members.count({
        where: { guildid: guildId, last_left: null, first_joined: { gte: weekStart } },
      }),
      // --- END AI-MODIFIED ---

      prisma.tickets.count({
        where: {
          guildid: guildId,
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
      }),

      prisma.tickets.count({
        where: {
          guildid: guildId,
          ticket_type: "WARNING",
          created_at: { gte: sevenDaysAgo },
        },
      }),

      prisma.tickets.count({
        where: {
          guildid: guildId,
          ticket_type: "STUDY_BAN",
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
      }),

      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only aggregate coins for current members
      prisma.members.aggregate({
        where: { guildid: guildId, last_left: null },
        _sum: { coins: true },
      }),
      // --- END AI-MODIFIED ---

      prisma.coin_transactions.count({
        where: { guildid: guildId, created_at: { gte: todayStart } },
      }),

      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only consider current members for top earner
      prisma.members.findFirst({
        where: { guildid: guildId, last_left: null },
        orderBy: { coins: "desc" },
        select: { userid: true, display_name: true, coins: true },
      }),
      // --- END AI-MODIFIED ---
    ])

    res.status(200).json({
      activeNow: {
        count: activeSessions.length,
        users: activeSessions.map((s) => ({
          userId: s.userid.toString(),
          displayName: s.members?.display_name || `User ...${s.userid.toString().slice(-4)}`,
          channelId: s.channelid?.toString() || null,
          startTime: s.start_time?.toISOString() || null,
          tag: s.tag || null,
        })),
      },
      activity: {
        studiedToday: Number(studiedTodayResult[0]?.count ?? 0),
        studiedThisWeek: Number(studiedThisWeekResult[0]?.count ?? 0),
        newMembersThisWeek: newMembersThisWeek,
        totalMembers: totalMembers,
      },
      moderation: {
        openTickets,
        recentWarnings,
        activeStudyBans,
      },
      economy: {
        totalCoinsInCirculation: coinsAggregate._sum.coins || 0,
        transactionsToday,
        topEarner: topEarnerResult
          ? {
              userId: topEarnerResult.userid.toString(),
              displayName: topEarnerResult.display_name || `User ...${topEarnerResult.userid.toString().slice(-4)}`,
              coins: topEarnerResult.coins || 0,
            }
          : null,
      },
    })
  },
})
