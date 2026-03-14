// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Comprehensive member overview data for server page
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function getWeekId(date: Date): number {
  const d = new Date(date)
  const daysToMonday = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - daysToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getMonthId(date: Date): number {
  const d = new Date(date)
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getWeekBounds(weekId: number): { start: Date; end: Date } {
  const start = new Date(weekId * 1000)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 7)
  return { start, end }
}

function getMonthBounds(monthId: number): { start: Date; end: Date } {
  const start = new Date(monthId * 1000)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  return { start, end }
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const guildId = BigInt(req.query.id as string)
    const userId = auth.userId
    const now = new Date()

    const membership = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { tracked_time: true, coins: true },
    })
    if (!membership) {
      return res.status(404).json({ error: "Not a member of this server" })
    }

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: {
        rank_type: true,
        timezone: true,
        study_hourly_reward: true,
        study_hourly_live_bonus: true,
        task_reward: true,
        max_tasks: true,
      },
    })

    const rankType = guildConfig?.rank_type ?? null

    const [
      memberRank,
      xpRanks,
      voiceRanks,
      msgRanks,
      recentSessions,
      ongoingSession,
      weeklyGoal,
      monthlyGoal,
      recentTransactions,
      inventoryCount,
      textAgg,
      textWeekAgg,
      attendanceAll,
      activityRaw,
    ] = await Promise.all([
      prisma.member_ranks.findUnique({
        where: { guildid_userid: { guildid: guildId, userid: userId } },
        select: { current_xp_rankid: true, current_voice_rankid: true, current_msg_rankid: true },
      }),

      prisma.xp_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }),
      prisma.voice_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }),
      prisma.msg_ranks.findMany({ where: { guildid: guildId }, orderBy: { required: "asc" } }),

      prisma.voice_sessions.findMany({
        where: { guildid: guildId, userid: userId },
        orderBy: { start_time: "desc" },
        take: 10,
        select: {
          sessionid: true, start_time: true, duration: true,
          video_duration: true, stream_duration: true,
          tag: true, rating: true,
        },
      }),

      prisma.voice_sessions_ongoing.findFirst({
        where: { guildid: guildId, userid: userId },
        select: { start_time: true, live_video: true, live_stream: true },
      }),

      prisma.member_weekly_goals.findFirst({
        where: { guildid: guildId, userid: userId, weekid: getWeekId(now) },
        select: { study_goal: true, task_goal: true, message_goal: true },
      }),

      prisma.member_monthly_goals.findFirst({
        where: { guildid: guildId, userid: userId, monthid: getMonthId(now) },
        select: { study_goal: true, task_goal: true, message_goal: true },
      }),

      prisma.coin_transactions.findMany({
        where: { guildid: guildId, actorid: userId },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          transactionid: true, transactiontype: true, amount: true,
          bonus: true, created_at: true,
        },
      }),

      prisma.member_inventory.count({
        where: { guildid: guildId, userid: userId },
      }),

      prisma.text_sessions.aggregate({
        where: { guildid: guildId, userid: userId },
        _sum: { messages: true, words: true },
      }),

      prisma.text_sessions.aggregate({
        where: {
          guildid: guildId,
          userid: userId,
          start_time: { gte: getWeekBounds(getWeekId(now)).start },
        },
        _sum: { messages: true },
      }),

      prisma.schedule_session_members.findMany({
        where: { guildid: guildId, userid: userId },
        orderBy: { booked_at: "desc" },
        take: 20,
        select: { attended: true, booked_at: true },
      }),

      prisma.voice_sessions.findMany({
        where: {
          guildid: guildId,
          userid: userId,
          start_time: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
        select: { start_time: true, duration: true },
      }),
    ])

    // --- Rank Progress ---
    let rankProgress: any = null
    if (rankType) {
      const ranks = rankType === "XP" ? xpRanks : rankType === "VOICE" ? voiceRanks : msgRanks
      const currentRankId = rankType === "XP"
        ? memberRank?.current_xp_rankid
        : rankType === "VOICE"
        ? memberRank?.current_voice_rankid
        : memberRank?.current_msg_rankid

      // --- AI-MODIFIED (2026-03-14) ---
      // Purpose: tracked_time is not populated; aggregate voice_sessions for VOICE rank value
      let currentValue = 0
      if (rankType === "VOICE") {
        const voiceAgg = await prisma.voice_sessions.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { duration: true },
        })
        currentValue = Math.round((voiceAgg._sum?.duration || 0) / 3600)
      } else if (rankType === "MESSAGE") {
      // --- END AI-MODIFIED ---
        currentValue = textAgg._sum?.messages || 0
      } else {
        const xpAgg = await prisma.member_experience.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { amount: true },
        })
        currentValue = xpAgg._sum?.amount || 0
      }

      const currentRankIdx = currentRankId
        ? ranks.findIndex((r) => r.rankid === currentRankId)
        : -1
      const currentRank = currentRankIdx >= 0 ? ranks[currentRankIdx] : null
      const nextRank = currentRankIdx >= 0 && currentRankIdx < ranks.length - 1
        ? ranks[currentRankIdx + 1]
        : currentRankIdx < 0 && ranks.length > 0
        ? ranks[0]
        : null

      const prevRequired = currentRank?.required ?? 0
      const nextRequired = nextRank?.required ?? prevRequired
      const progress = nextRequired > prevRequired
        ? Math.min(100, Math.round(((currentValue - prevRequired) / (nextRequired - prevRequired)) * 100))
        : currentRank ? 100 : 0

      rankProgress = {
        rankType,
        currentRank: currentRank
          ? { roleId: currentRank.roleid.toString(), required: currentRank.required }
          : null,
        nextRank: nextRank
          ? { roleId: nextRank.roleid.toString(), required: nextRank.required }
          : null,
        currentValue,
        progress,
      }
    }

    // --- Leaderboard Position ---
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: tracked_time is always 0; compute leaderboard position from voice_sessions
    const userTotalDurResult = await prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(SUM(duration), 0)::int as total
      FROM voice_sessions WHERE guildid = ${guildId} AND userid = ${userId}
    `
    const userTotalDur = Number(userTotalDurResult?.[0]?.total || 0)

    const higherCountResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM (
        SELECT userid FROM voice_sessions WHERE guildid = ${guildId}
        GROUP BY userid HAVING SUM(duration) > ${userTotalDur}
      ) sub
    `
    const higherCount = Number(higherCountResult?.[0]?.count || 0)
    const totalMembers = await prisma.members.count({ where: { guildid: guildId } })
    const leaderboardPosition = { rank: higherCount + 1, total: totalMembers }
    // --- END AI-MODIFIED ---

    // --- Goals Progress ---
    const weekBounds = getWeekBounds(getWeekId(now))
    const monthBounds = getMonthBounds(getMonthId(now))

    const weekStudyAgg = await prisma.voice_sessions.aggregate({
      where: {
        guildid: guildId, userid: userId,
        start_time: { gte: weekBounds.start, lt: weekBounds.end },
      },
      _sum: { duration: true },
    })
    const monthStudyAgg = await prisma.voice_sessions.aggregate({
      where: {
        guildid: guildId, userid: userId,
        start_time: { gte: monthBounds.start, lt: monthBounds.end },
      },
      _sum: { duration: true },
    })

    const weekTasksDone = await prisma.member_weekly_goal_tasks.count({
      where: { guildid: guildId, userid: userId, weekid: getWeekId(now), completed: true },
    })
    const monthTasksDone = await prisma.member_monthly_goal_tasks.count({
      where: { guildid: guildId, userid: userId, monthid: getMonthId(now), completed: true },
    })

    const weekMsgAgg = await prisma.text_sessions.aggregate({
      where: {
        guildid: guildId, userid: userId,
        start_time: { gte: weekBounds.start, lt: weekBounds.end },
      },
      _sum: { messages: true },
    })
    const monthMsgAgg = await prisma.text_sessions.aggregate({
      where: {
        guildid: guildId, userid: userId,
        start_time: { gte: monthBounds.start, lt: monthBounds.end },
      },
      _sum: { messages: true },
    })

    const goals = {
      weekly: weeklyGoal ? {
        studyGoal: weeklyGoal.study_goal,
        studyProgress: Math.round((weekStudyAgg._sum?.duration || 0) / 3600 * 10) / 10,
        taskGoal: weeklyGoal.task_goal,
        taskProgress: weekTasksDone,
        messageGoal: weeklyGoal.message_goal,
        messageProgress: weekMsgAgg._sum?.messages || 0,
      } : null,
      monthly: monthlyGoal ? {
        studyGoal: monthlyGoal.study_goal,
        studyProgress: Math.round((monthStudyAgg._sum?.duration || 0) / 3600 * 10) / 10,
        taskGoal: monthlyGoal.task_goal,
        taskProgress: monthTasksDone,
        messageGoal: monthlyGoal.message_goal,
        messageProgress: monthMsgAgg._sum?.messages || 0,
      } : null,
    }

    // --- Activity Chart (30 days) ---
    const chartMap = new Map<string, number>()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000)
      chartMap.set(d.toISOString().slice(0, 10), 0)
    }
    activityRaw.forEach((s) => {
      const key = s.start_time.toISOString().slice(0, 10)
      if (chartMap.has(key)) {
        chartMap.set(key, (chartMap.get(key) || 0) + Math.round(s.duration / 60))
      }
    })
    const activityChart = Array.from(chartMap.entries()).map(([date, minutes]) => ({ date, minutes }))

    // --- Attendance ---
    const totalBooked = attendanceAll.length
    const totalAttended = attendanceAll.filter((a) => a.attended).length
    const attendance = {
      totalBooked,
      totalAttended,
      recent: attendanceAll.slice(0, 10).map((a) => ({
        date: a.booked_at.toISOString(),
        attended: a.attended,
      })),
    }

    // --- Messages ---
    const messages = {
      totalMessages: textAgg._sum?.messages || 0,
      totalWords: textAgg._sum?.words || 0,
      thisWeekMessages: textWeekAgg._sum?.messages || 0,
    }

    // --- Server Info ---
    const serverInfo = {
      rankType: rankType,
      timezone: guildConfig?.timezone ?? null,
      studyReward: guildConfig?.study_hourly_reward ?? null,
      liveBonus: guildConfig?.study_hourly_live_bonus ?? null,
      taskReward: guildConfig?.task_reward ?? null,
      maxTasks: guildConfig?.max_tasks ?? null,
    }

    res.status(200).json({
      rankProgress,
      leaderboardPosition,
      recentSessions: recentSessions.map((s) => ({
        id: s.sessionid,
        startTime: s.start_time.toISOString(),
        durationMinutes: Math.round(s.duration / 60),
        cameraMins: Math.round((s.video_duration || 0) / 60),
        streamMins: Math.round((s.stream_duration || 0) / 60),
        tag: s.tag,
        rating: s.rating,
      })),
      ongoingSession: ongoingSession?.start_time ? {
        startTime: ongoingSession.start_time.toISOString(),
        currentMinutes: Math.round((Date.now() - ongoingSession.start_time.getTime()) / 60_000),
        isCamera: ongoingSession.live_video ?? false,
        isStream: ongoingSession.live_stream ?? false,
      } : null,
      goals,
      economy: {
        coins: membership.coins || 0,
        rewardRate: guildConfig?.study_hourly_reward ?? 0,
        recentTransactions: recentTransactions.map((t) => ({
          id: t.transactionid,
          type: t.transactiontype,
          amount: t.amount,
          bonus: t.bonus,
          createdAt: t.created_at.toISOString(),
        })),
        inventoryCount,
      },
      messages,
      attendance,
      activityChart,
      serverInfo,
    })
  },
})
