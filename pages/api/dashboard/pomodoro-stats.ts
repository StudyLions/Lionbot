// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Pomodoro-specific study stats API - voice sessions in timer channels
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"

interface PomodoroStatsResponse {
  totalSessions: number
  totalFocusMinutes: number
  todayMinutes: number
  weekMinutes: number
  monthMinutes: number
  longestSessionMinutes: number
  currentStreak: number
  dailyBreakdown: Array<{ date: string; minutes: number }>
}

interface DailyRow {
  day: Date
  total_seconds: string
  session_count: string
}

interface MaxDurationRow {
  max_duration: number | null
}

export default apiHandler({
  async GET(req: NextApiRequest, res: NextApiResponse) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId

    // 1. Get all timer channelids
    const timers = await prisma.timers.findMany({
      select: { channelid: true },
    })
    const timerChannelIds = timers.map((t) => t.channelid)

    if (timerChannelIds.length === 0) {
      return res.status(200).json({
        totalSessions: 0,
        totalFocusMinutes: 0,
        todayMinutes: 0,
        weekMinutes: 0,
        monthMinutes: 0,
        longestSessionMinutes: 0,
        currentStreak: 0,
        dailyBreakdown: [],
      } as PomodoroStatsResponse)
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    // 2. Get voice sessions in timer channels for this user (last 30 days)
    const dailyRaw = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
      SELECT
        DATE(start_time AT TIME ZONE 'UTC')::date as day,
        COALESCE(SUM(duration), 0)::bigint::text as total_seconds,
        COUNT(*)::bigint::text as session_count
      FROM voice_sessions
      WHERE userid = ${userId}
        AND channelid IS NOT NULL
        AND channelid IN (${Prisma.join(timerChannelIds)})
        AND start_time >= ${thirtyDaysAgo}
      GROUP BY DATE(start_time AT TIME ZONE 'UTC')
      ORDER BY day
    `)

    // 3. Get longest session
    const maxDurationRow = await prisma.$queryRaw<MaxDurationRow[]>(Prisma.sql`
      SELECT MAX(duration)::int as max_duration
      FROM voice_sessions
      WHERE userid = ${userId}
        AND channelid IS NOT NULL
        AND channelid IN (${Prisma.join(timerChannelIds)})
    `)
    const longestSessionSeconds = maxDurationRow[0]?.max_duration ?? 0
    const longestSessionMinutes = Math.round(longestSessionSeconds / 60)

    // 4. Build daily map and compute aggregates
    const dailyMap = new Map<string, { totalSeconds: number; sessionCount: number }>()
    let totalSessions = 0
    let totalSeconds = 0

    for (const row of dailyRaw) {
      const d = row.day instanceof Date ? row.day : new Date(row.day)
      const dateStr = d.toISOString().slice(0, 10)
      const totalSec = parseInt(row.total_seconds, 10) || 0
      const sessCount = parseInt(row.session_count, 10) || 0
      dailyMap.set(dateStr, { totalSeconds: totalSec, sessionCount: sessCount })
      totalSessions += sessCount
      totalSeconds += totalSec
    }

    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const todayData = dailyMap.get(todayStr)
    const todayMinutes = todayData ? Math.round(todayData.totalSeconds / 60) : 0

    // Week: last 7 days
    let weekSeconds = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      weekSeconds += dailyMap.get(dateStr)?.totalSeconds ?? 0
    }
    const weekMinutes = Math.round(weekSeconds / 60)

    // Month: last 30 days (already in dailyRaw scope)
    const monthMinutes = Math.round(totalSeconds / 60)
    const totalFocusMinutes = Math.round(totalSeconds / 60)

    // 5. Daily breakdown (last 30 days)
    const dailyBreakdown: Array<{ date: string; minutes: number }> = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const data = dailyMap.get(dateStr)
      dailyBreakdown.push({
        date: dateStr,
        minutes: data ? Math.round(data.totalSeconds / 60) : 0,
      })
    }

    // 6. Current streak: consecutive days backward from today with pomodoro sessions
    let currentStreak = 0
    let check = todayStr
    while (dailyMap.has(check) && (dailyMap.get(check)?.sessionCount ?? 0) > 0) {
      currentStreak++
      const d = new Date(check)
      d.setUTCDate(d.getUTCDate() - 1)
      check = d.toISOString().slice(0, 10)
    }

    const payload: PomodoroStatsResponse = {
      totalSessions,
      totalFocusMinutes,
      todayMinutes,
      weekMinutes,
      monthMinutes,
      longestSessionMinutes,
      currentStreak,
      dailyBreakdown,
    }

    res.status(200).json(payload)
  },
})
