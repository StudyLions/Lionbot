// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Live impact context data for the settings page
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalMembers,
      activeMembers,
      coinsAgg,
      activeRooms,
      taskRewardsToday,
      transfersThisWeek,
      rankUpsThisWeek,
      avgStudy,
      untrackedVoice,
      untrackedText,
      autoroleCount,
      unrankedRoleCount,
      videoChannelCount,
    ] = await Promise.all([
      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only count current members (exclude those who left)
      prisma.members.count({ where: { guildid: guildId, last_left: null } }),
      // --- END AI-MODIFIED ---

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(DISTINCT actorid) as count
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${weekAgo}
      `).then(r => Number(r[0]?.count ?? 0)),

      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only aggregate coins for current members
      prisma.members.aggregate({
        where: { guildid: guildId, last_left: null },
        _sum: { coins: true },
      }),
      // --- END AI-MODIFIED ---

      prisma.rented_rooms.count({
        where: { guildid: guildId, deleted_at: null },
      }),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count
        FROM coin_transactions
        WHERE guildid = ${guildId}
          AND transactiontype = 'TASKS'
          AND created_at >= ${dayAgo}
      `).then(r => Number(r[0]?.count ?? 0)),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count
        FROM coin_transactions
        WHERE guildid = ${guildId}
          AND transactiontype = 'TRANSFER'
          AND created_at >= ${weekAgo}
      `).then(r => Number(r[0]?.count ?? 0)),

      // --- AI-MODIFIED (2026-03-14) ---
      // Purpose: member_ranks has no obtained_at column; count total ranked members instead
      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count
        FROM member_ranks
        WHERE guildid = ${guildId}
          AND (current_xp_rankid IS NOT NULL OR current_voice_rankid IS NOT NULL OR current_msg_rankid IS NOT NULL)
      `).then(r => Number(r[0]?.count ?? 0)).catch(() => 0),
      // --- END AI-MODIFIED ---

      prisma.$queryRaw<[{ avg_hours: number | null }]>(Prisma.sql`
        SELECT AVG(daily_total) as avg_hours FROM (
          SELECT userid, SUM(duration) / 3600.0 as daily_total
          FROM voice_sessions
          WHERE guildid = ${guildId} AND start_time >= ${weekAgo}
          GROUP BY userid, DATE(start_time)
        ) sub
      `).then(r => Math.round((Number(r[0]?.avg_hours ?? 0)) * 10) / 10).catch(() => 0),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count FROM untracked_channels WHERE guildid = ${guildId}
      `).then(r => Number(r[0]?.count ?? 0)),

      prisma.untracked_text_channels.count({ where: { guildid: guildId } }),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count FROM autoroles WHERE guildid = ${guildId}
      `).then(r => Number(r[0]?.count ?? 0)),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count FROM unranked_roles WHERE guildid = ${guildId}
      `).then(r => Number(r[0]?.count ?? 0)),

      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count FROM video_channels WHERE guildid = ${guildId}
      `).then(r => Number(r[0]?.count ?? 0)),
    ])

    return res.status(200).json({
      activeRooms,
      videoChannelCount,
      totalMembers,
      activeMembersWeek: activeMembers,
      totalCoins: Number(coinsAgg._sum.coins ?? 0),
      taskRewardsToday,
      transfersThisWeek,
      rankUpsThisWeek,
      avgDailyStudyHours: avgStudy,
      untrackedVoiceCount: untrackedVoice,
      untrackedTextCount: untrackedText,
      autoroleCount,
      unrankedRoleCount,
    })
  },
})
