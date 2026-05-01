// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Comprehensive user stats API - study time, streaks, achievements, rank progress
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add ScheduledSessions achievement (8th achievement)
// --- END AI-MODIFIED ---
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- Types ---
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add trend comparison fields to studyTime for overview redesign
interface StatsResponse {
  studyTime: {
    todayMinutes: number
    yesterdayMinutes: number
    thisWeekMinutes: number
    lastWeekMinutes: number
    thisMonthMinutes: number
    lastMonthMinutes: number
    allTimeMinutes: number
  }
// --- END AI-MODIFIED ---
  dailyStudy: Array<{ date: string; minutes: number }>
  streaks: {
    currentStreak: number
    longestStreak: number
    activeDays: string[]
  }
  achievements: Array<{
    id: string
    label: string
    current: number
    target: number
    unlocked: boolean
  }>
  rank: {
    currentRank: string | null
    currentRankRequired: number
    nextRank: string | null
    nextRankRequired: number | null
    progress: number
    currentValue: number
    rankType: string
  } | null
  voteCount: number
}

// --- Helpers ---
function getUtcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function getWeekStart(d: Date): Date {
  const day = d.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + mondayOffset)
  return getUtcDayStart(monday)
}

function getMonthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

// --- AI-MODIFIED (2026-05-01) ---
// Purpose: Bug fix — streak previously reset to 1 on the 1st of every month
//          because the caller only passed in the current month's active days.
//          The function itself is unchanged in shape, but we now:
//            1. Use a Set for O(1) lookup (was O(N) per check via Array.includes)
//            2. Add a "today not yet attended" grace period that matches the bot's
//             VoiceStreak achievement behavior (lib/modules/statistics/achievements.py)
//          The real fix lives at the call site, where we now pass ALL of the user's
//          distinct active dates instead of just the current month's.
function computeStreaks(activeDates: string[]): { current: number; longest: number } {
  if (activeDates.length === 0) return { current: 0, longest: 0 }

  const sorted = Array.from(new Set(activeDates)).sort()
  const set = new Set(sorted)
  const today = new Date().toISOString().slice(0, 10)

  let current = 0
  let check = today
  if (!set.has(check)) {
    const d = new Date(check)
    d.setUTCDate(d.getUTCDate() - 1)
    check = d.toISOString().slice(0, 10)
  }
  while (set.has(check)) {
    current++
    const d = new Date(check)
    d.setUTCDate(d.getUTCDate() - 1)
    check = d.toISOString().slice(0, 10)
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    prev.setUTCDate(prev.getUTCDate() + 1)
    if (prev.toISOString().slice(0, 10) === curr.toISOString().slice(0, 10)) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }
  return { current, longest }
}
// --- END AI-MODIFIED ---

// --- Achievement definitions ---
const ACHIEVEMENTS = [
  { id: "VoiceHours", label: "Voice Hours", target: 1000 },
  { id: "VoiceStreak", label: "Voice Streak", target: 100 },
  { id: "VoiceDays", label: "Voice Days", target: 90 },
  { id: "Workout", label: "Workouts", target: 50 },
  { id: "TasksComplete", label: "Tasks Complete", target: 1000 },
  { id: "ScheduledSessions", label: "Scheduled Sessions", target: 50 },
  { id: "MonthlyHours", label: "Monthly Hours", target: 100 },
  { id: "Voting", label: "Top.gg Votes", target: 100 },
] as const

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId
    const guildIdParam = req.query.guildId as string | undefined
    const guildId = guildIdParam ? BigInt(guildIdParam) : null

    const now = new Date()
    const todayStart = getUtcDayStart(now)
    const weekStart = getWeekStart(now)
    const monthStart = getMonthStart(now)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const voiceWhere = guildId
      ? { userid: userId, guildid: guildId }
      : { userid: userId }
    const voiceWhereWithTime = (start: Date) => ({ ...voiceWhere, start_time: { gte: start } })
    const voiceWhereWithRange = (start: Date, end: Date) => ({
      ...voiceWhere,
      start_time: { gte: start, lt: end },
    })

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: add yesterday/lastWeek/lastMonth aggregates for trend comparisons
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1)

    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7)

    const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))

    const [todayAgg, yesterdayAgg, weekAgg, lastWeekAgg, monthAgg, lastMonthAgg, allTimeAgg] = await Promise.all([
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithTime(todayStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithRange(yesterdayStart, todayStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithTime(weekStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithRange(lastWeekStart, weekStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithTime(monthStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhereWithRange(lastMonthStart, monthStart),
        _sum: { duration: true },
      }),
      prisma.voice_sessions.aggregate({
        where: voiceWhere,
        _sum: { duration: true },
      }),
    ])
    // --- END AI-MODIFIED ---

    const toMinutes = (s: number | null) => Math.round((s ?? 0) / 60)
    const studyTime = {
      todayMinutes: toMinutes(todayAgg._sum.duration),
      yesterdayMinutes: toMinutes(yesterdayAgg._sum.duration),
      thisWeekMinutes: toMinutes(weekAgg._sum.duration),
      lastWeekMinutes: toMinutes(lastWeekAgg._sum.duration),
      thisMonthMinutes: toMinutes(monthAgg._sum.duration),
      lastMonthMinutes: toMinutes(lastMonthAgg._sum.duration),
      allTimeMinutes: toMinutes(allTimeAgg._sum.duration),
    }

    // 2. Daily breakdown (last 30 days)
    const dailyRaw = await prisma.$queryRaw<
      { date: Date; minutes: number }[]
    >(Prisma.sql`
      SELECT DATE(start_time AT TIME ZONE 'UTC')::date as date,
             COALESCE(SUM(duration)::float / 60, 0)::int as minutes
      FROM voice_sessions
      WHERE userid = ${userId}
        AND start_time >= ${thirtyDaysAgo}
        ${guildId ? Prisma.sql`AND guildid = ${guildId}` : Prisma.empty}
      GROUP BY DATE(start_time AT TIME ZONE 'UTC')
      ORDER BY date
    `)

    const dailyMap = new Map<string, number>()
    for (const row of dailyRaw) {
      const d = row.date instanceof Date ? row.date : new Date(row.date)
      dailyMap.set(d.toISOString().slice(0, 10), Number(row.minutes))
    }

    const dailyStudy: Array<{ date: string; minutes: number }> = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      dailyStudy.push({ date: dateStr, minutes: dailyMap.get(dateStr) ?? 0 })
    }

    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Bug fix — streak/longest were computed from current-month-only data,
    //          which caused streak to reset to 1 on the 1st of every month for every
    //          user. We now query the full history of distinct active days and use
    //          that for both the calendar (filtered to current month) and the streak
    //          computation (which needs to walk across month/year boundaries).
    //          The query is bounded by user-id (and optionally guild-id), both of
    //          which are indexed, and returns at most ~one row per active day, so
    //          even multi-year users return only a few hundred rows.
    const allActiveRaw = await prisma.$queryRaw<{ date: Date }[]>(Prisma.sql`
      SELECT DISTINCT DATE(start_time AT TIME ZONE 'UTC')::date as date
      FROM voice_sessions
      WHERE userid = ${userId}
        ${guildId ? Prisma.sql`AND guildid = ${guildId}` : Prisma.empty}
      ORDER BY date
    `)
    const allActiveDays = allActiveRaw.map((r) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date)
      return d.toISOString().slice(0, 10)
    })
    const monthStartIso = monthStart.toISOString().slice(0, 10)
    const activeDays = allActiveDays.filter((d) => d >= monthStartIso)
    const { current: currentStreak, longest: longestStreak } = computeStreaks(allActiveDays)
    // --- END AI-MODIFIED ---

    // 4. Achievements
    const [tasksComplete, voteCount, voiceDaysRaw, workoutCount, scheduledCount] = await Promise.all([
      prisma.tasklist.count({
        where: { userid: userId, completed_at: { not: null } },
      }),
      prisma.topgg.count({ where: { userid: userId } }),
      prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(DISTINCT DATE(start_time AT TIME ZONE 'UTC'))::bigint as count
        FROM voice_sessions
        WHERE userid = ${userId}
      `),
      prisma.workout_sessions.count({
        where: { userid: userId },
      }),
      prisma.schedule_session_members.count({
        where: { userid: userId, attended: true },
      }),
    ])

    const voiceDays = Number(voiceDaysRaw[0]?.count ?? 0)
    const allTimeHours = studyTime.allTimeMinutes / 60
    const monthHours = studyTime.thisMonthMinutes / 60

    const achievements: StatsResponse["achievements"] = ACHIEVEMENTS.map((a) => {
      let current = 0
      switch (a.id) {
        case "VoiceHours":
          current = Math.floor(allTimeHours)
          break
        case "VoiceStreak":
          // --- AI-MODIFIED (2026-05-01) ---
          // Purpose: Match bot's VoiceStreak.calculate() — once max ever hit threshold,
          //          stay at max so the achievement remains unlocked even if the user's
          //          current streak later drops below 100.
          current = longestStreak >= a.target ? longestStreak : currentStreak
          // --- END AI-MODIFIED ---
          break
        case "VoiceDays":
          current = voiceDays
          break
        case "Workout":
          current = workoutCount
          break
        case "TasksComplete":
          current = tasksComplete
          break
        case "ScheduledSessions":
          current = scheduledCount
          break
        case "MonthlyHours":
          current = Math.floor(monthHours)
          break
        case "Voting":
          current = voteCount
          break
        default:
          current = 0
      }
      return {
        id: a.id,
        label: a.label,
        current,
        target: a.target,
        unlocked: current >= a.target,
      }
    })

    // 5. Rank (only when guildId provided)
    let rank: StatsResponse["rank"] = null
    if (guildId) {
      const [guildConfig, xpRanks, voiceRanks, msgRanks] = await Promise.all([
        prisma.guild_config.findUnique({
          where: { guildid: guildId },
          select: { rank_type: true },
        }),
        prisma.xp_ranks.findMany({
          where: { guildid: guildId },
          orderBy: { required: "asc" },
        }),
        prisma.voice_ranks.findMany({
          where: { guildid: guildId },
          orderBy: { required: "asc" },
        }),
        prisma.msg_ranks.findMany({
          where: { guildid: guildId },
          orderBy: { required: "asc" },
        }),
      ])

      const rankType = guildConfig?.rank_type ?? "VOICE"
      let currentValue = 0
      let ranks: { rankid: number; roleid: bigint; required: number }[] = []

      if (rankType === "XP") {
        const xpAgg = await prisma.member_experience.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { amount: true },
        })
        currentValue = xpAgg._sum.amount ?? 0
        ranks = xpRanks
      } else if (rankType === "VOICE") {
        const voiceAgg = await prisma.voice_sessions.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { duration: true },
        })
        currentValue = voiceAgg._sum.duration ?? 0 // seconds
        ranks = voiceRanks
      } else {
        const msgAgg = await prisma.text_sessions.aggregate({
          where: { guildid: guildId, userid: userId },
          _sum: { words: true },
        })
        currentValue = msgAgg._sum.words ?? 0
        ranks = msgRanks
      }

      const currentRank = ranks.filter((r) => r.required <= currentValue).pop() ?? null
      const nextRank = ranks.find((r) => r.required > currentValue) ?? null

      const currentRankRequired = currentRank?.required ?? 0
      const nextRankRequired = nextRank?.required ?? null
      const progress =
        nextRankRequired != null
          ? Math.min(
              100,
              Math.round(
                ((currentValue - currentRankRequired) / (nextRankRequired - currentRankRequired)) *
                  100
              )
            )
          : 100

      rank = {
        currentRank: currentRank ? currentRank.roleid.toString() : null,
        currentRankRequired,
        nextRank: nextRank ? nextRank.roleid.toString() : null,
        nextRankRequired,
        progress,
        currentValue,
        rankType,
      }
    }

    const payload: StatsResponse = {
      studyTime,
      dailyStudy,
      streaks: {
        currentStreak,
        longestStreak,
        activeDays,
      },
      achievements,
      rank,
      voteCount,
    }

    res.status(200).json(payload)
  },
})
