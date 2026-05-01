// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: User data formatted for ProfileCard component
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const ACHIEVEMENTS = [
  { id: "VoiceHours", target: 1000 },
  { id: "VoiceStreak", target: 100 },
  { id: "VoiceDays", target: 90 },
  { id: "Workout", target: 50 },
  { id: "TasksComplete", target: 1000 },
  { id: "ScheduledSessions", target: 50 },
  { id: "MonthlyHours", target: 100 },
  { id: "Voting", target: 100 },
] as const

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
// Purpose: Bug fix — caller previously passed only the current month's active days,
//          which made currentStreak reset to 1 on the 1st of every month. The fix
//          is at the call site (we now pass full history); here we additionally
//          switch from Array.includes to Set lookup and add a "today not yet
//          attended" grace period that matches the bot's VoiceStreak behavior.
function computeCurrentStreak(activeDates: string[]): { current: number; longest: number } {
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

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId
    const now = new Date()
    const monthStart = getMonthStart(now)

    const [userConfig, voiceSum, voteCount, tasksComplete, voiceDaysRaw, workoutCount, scheduledCount] =
      await Promise.all([
        prisma.user_config.findUnique({
          where: { userid: userId },
          select: { name: true, gems: true, avatar_hash: true },
        }),
        prisma.voice_sessions.aggregate({
          where: { userid: userId },
          _sum: { duration: true },
        }),
        prisma.topgg.count({ where: { userid: userId } }),
        prisma.tasklist.count({
          where: { userid: userId, completed_at: { not: null } },
        }),
        prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
          SELECT COUNT(DISTINCT DATE(start_time AT TIME ZONE 'UTC'))::bigint as count
          FROM voice_sessions
          WHERE userid = ${userId}
        `),
        prisma.workout_sessions.count({ where: { userid: userId } }),
        prisma.schedule_session_members.count({
          where: { userid: userId, attended: true },
        }),
      ])

    const allTimeMinutes = Math.round((voiceSum._sum.duration ?? 0) / 60)
    const allTimeHours = allTimeMinutes / 60
    const monthHours = 0 // Would need month aggregate; use 0 for global stats
    const voiceDays = Number(voiceDaysRaw[0]?.count ?? 0)

    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Bug fix — query the user's full distinct-day history (not just the
    //          current month) so the streak doesn't reset on the 1st of the month.
    const allActiveRaw = await prisma.$queryRaw<{ date: Date }[]>(Prisma.sql`
      SELECT DISTINCT DATE(start_time AT TIME ZONE 'UTC')::date as date
      FROM voice_sessions
      WHERE userid = ${userId}
      ORDER BY date
    `)
    const allActiveDays = allActiveRaw.map((r) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date)
      return d.toISOString().slice(0, 10)
    })
    const { current: currentStreak, longest: longestStreak } = computeCurrentStreak(allActiveDays)
    // --- END AI-MODIFIED ---

    const monthAgg = await prisma.voice_sessions.aggregate({
      where: { userid: userId, start_time: { gte: monthStart } },
      _sum: { duration: true },
    })
    const monthHoursVal = (monthAgg._sum.duration ?? 0) / 3600

    const achievements = ACHIEVEMENTS.map((a) => {
      let current = 0
      switch (a.id) {
        case "VoiceHours":
          current = Math.floor(allTimeHours)
          break
        case "VoiceStreak":
          // --- AI-MODIFIED (2026-05-01) ---
          // Purpose: Match bot's VoiceStreak.calculate() — once max ever hit threshold,
          //          stay at max so the achievement remains unlocked.
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
          current = Math.floor(monthHoursVal)
          break
        case "Voting":
          current = voteCount
          break
        default:
          current = 0
      }
      return { id: a.id, unlocked: current >= a.target }
    })

    const coins = 0
    const studyHours = Math.round(allTimeMinutes / 60 * 10) / 10

    const avatarUrl =
      userConfig?.avatar_hash != null
        ? `https://cdn.discordapp.com/avatars/${userId}/${userConfig.avatar_hash}.png`
        : null

    const payload = {
      username: userConfig?.name ?? "User",
      avatarUrl,
      coins,
      gems: userConfig?.gems ?? 0,
      studyHours,
      currentRank: null as string | null,
      rankProgress: 0,
      nextRank: null as string | null,
      achievements,
      currentStreak,
      voteCount,
    }

    res.status(200).json(payload)
  },
})
