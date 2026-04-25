// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Builds per-user weekly DigestData for the WeeklyDigest
//          email. Reuses the same date math and aggregation
//          patterns as pages/api/dashboard/stats.ts so the email
//          numbers always match what users see in the dashboard.
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import type { WeeklyDigestProps } from "../../emails/WeeklyDigest"
import { getPromoTierForUser } from "./tier"

interface BuildDigestArgs {
  userid: bigint
  firstName: string
  // Reference moment used to compute "this week" / "last week".
  // Defaults to now(); pass an explicit value for tests.
  now?: Date
}

function getUtcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function getMondayUtc(d: Date): Date {
  const day = d.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + mondayOffset)
  return getUtcDayStart(monday)
}

function fmtRange(weekStart: Date, weekEnd: Date) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(d)
  return { weekStartLabel: fmt(weekStart), weekEndLabel: fmt(weekEnd) }
}

function pickHighlight(opts: {
  studyMinutesThisWeek: number
  studyMinutesLastWeek: number
  currentStreak: number
  streakExtended: boolean
  tasksCompleted: number
  isFirstActiveWeek: boolean
}): string | null {
  const {
    studyMinutesThisWeek,
    studyMinutesLastWeek,
    currentStreak,
    streakExtended,
    tasksCompleted,
    isFirstActiveWeek,
  } = opts
  if (isFirstActiveWeek && studyMinutesThisWeek > 0) {
    return "Your first active week on LionBot — welcome to the routine!"
  }
  if (studyMinutesThisWeek >= 600 && studyMinutesLastWeek < 600) {
    return "Crossed 10 hours of focus this week — that is a serious week."
  }
  if (currentStreak >= 7 && streakExtended) {
    return `${currentStreak}-day streak and counting. Consistency is your superpower.`
  }
  if (
    studyMinutesLastWeek > 0 &&
    studyMinutesThisWeek >= studyMinutesLastWeek * 1.25
  ) {
    const diffH = (studyMinutesThisWeek - studyMinutesLastWeek) / 60
    return `Beat last week by ${diffH.toFixed(1)} hours. Strong upward trend.`
  }
  if (tasksCompleted >= 25) {
    return `${tasksCompleted} tasks shipped this week — checklist hero status.`
  }
  return null
}

export interface DigestEligibleUser {
  userid: bigint
  email: string
  name: string | null
}

// Pulls every candidate for this run: has email, hasn't opted out, and
// either weekly_digest pref is true. The cron filters again at send-time
// but doing it here keeps Resend traffic and Discord guild lookups down.
export async function getDigestRecipients(
  limit?: number
): Promise<DigestEligibleUser[]> {
  const rows = await prisma.user_config.findMany({
    where: {
      email: { not: null },
      email_unsubscribed_all: false,
      email_pref_weekly_digest: true,
    },
    select: { userid: true, email: true, name: true },
    orderBy: { userid: "asc" },
    take: limit,
  })
  return rows
    .filter((r) => !!r.email)
    .map((r) => ({ userid: r.userid, email: r.email!, name: r.name }))
}

export async function buildWeeklyDigest(
  args: BuildDigestArgs
): Promise<WeeklyDigestProps | null> {
  const { userid, firstName } = args
  const now = args.now ?? new Date()

  const thisWeekStart = getMondayUtc(now)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setUTCDate(thisWeekStart.getUTCDate() - 7)
  const nextWeekStart = new Date(thisWeekStart)
  nextWeekStart.setUTCDate(thisWeekStart.getUTCDate() + 7)
  const todayStart = getUtcDayStart(now)
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setUTCDate(todayStart.getUTCDate() - 1)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const weekEndDisplay = new Date(thisWeekStart)
  weekEndDisplay.setUTCDate(thisWeekStart.getUTCDate() + 6)

  const [
    weekAgg,
    lastWeekAgg,
    tasksCount,
    monthActive,
    topServerRow,
    gemsAgg,
    firstActivityRow,
  ] = await Promise.all([
    prisma.voice_sessions.aggregate({
      where: { userid, start_time: { gte: thisWeekStart, lt: nextWeekStart } },
      _sum: { duration: true },
    }),
    prisma.voice_sessions.aggregate({
      where: { userid, start_time: { gte: lastWeekStart, lt: thisWeekStart } },
      _sum: { duration: true },
    }),
    prisma.tasklist.count({
      where: {
        userid,
        completed_at: { gte: thisWeekStart, lt: nextWeekStart },
      },
    }),
    prisma.$queryRaw<{ date: Date }[]>(Prisma.sql`
      SELECT DISTINCT DATE(start_time AT TIME ZONE 'UTC')::date AS date
      FROM voice_sessions
      WHERE userid = ${userid}
        AND start_time >= ${monthStart}
      ORDER BY date
    `),
    prisma.$queryRaw<{ guildid: bigint; total_seconds: bigint | number }[]>(Prisma.sql`
      SELECT guildid, COALESCE(SUM(duration), 0)::bigint AS total_seconds
      FROM voice_sessions
      WHERE userid = ${userid}
        AND start_time >= ${thisWeekStart}
        AND start_time < ${nextWeekStart}
      GROUP BY guildid
      ORDER BY total_seconds DESC
      LIMIT 1
    `),
    prisma.gem_transactions.aggregate({
      where: {
        to_account: userid,
        timestamp: { gte: thisWeekStart, lt: nextWeekStart },
      },
      _sum: { amount: true },
    }),
    prisma.voice_sessions.findFirst({
      where: { userid },
      orderBy: { start_time: "asc" },
      select: { start_time: true },
    }),
  ])

  const studyMinutesThisWeek = Math.round((weekAgg._sum.duration ?? 0) / 60)
  const studyMinutesLastWeek = Math.round((lastWeekAgg._sum.duration ?? 0) / 60)

  const activeDays = monthActive
    .map((r) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date)
      return d.toISOString().slice(0, 10)
    })
    .sort()

  // Replicates dashboard streak logic: count consecutive UTC days
  // starting from today (or yesterday if today has no session yet).
  const todayKey = todayStart.toISOString().slice(0, 10)
  const yKey = yesterdayStart.toISOString().slice(0, 10)
  const set = new Set(activeDays)
  let currentStreak = 0
  let cursor = set.has(todayKey) ? new Date(todayStart) : new Date(yesterdayStart)
  if (set.has(cursor.toISOString().slice(0, 10))) {
    while (set.has(cursor.toISOString().slice(0, 10))) {
      currentStreak++
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
  }

  const streakExtended = activeDays.some((d) => {
    const dt = new Date(d)
    return dt >= thisWeekStart && dt < nextWeekStart
  })

  let topServer: WeeklyDigestProps["topServer"] = null
  if (topServerRow.length > 0) {
    const guildid = topServerRow[0].guildid
    const totalSeconds = Number(topServerRow[0].total_seconds)
    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid },
      select: { name: true },
    })
    topServer = {
      name: guildConfig?.name?.trim() || "your study server",
      minutes: Math.round(totalSeconds / 60),
    }
  }

  const gemsEarned = Math.max(0, gemsAgg._sum.amount ?? 0)

  const isFirstActiveWeek =
    !!firstActivityRow?.start_time &&
    firstActivityRow.start_time >= thisWeekStart

  if (studyMinutesThisWeek === 0 && tasksCount === 0 && currentStreak === 0) {
    return null
  }

  const promoTier = await getPromoTierForUser(userid)
  const { weekStartLabel, weekEndLabel } = fmtRange(thisWeekStart, weekEndDisplay)

  return {
    firstName,
    weekStartLabel,
    weekEndLabel,
    studyMinutesThisWeek,
    studyMinutesLastWeek,
    tasksCompleted: tasksCount,
    currentStreak,
    streakExtended,
    topServer,
    gemsEarned,
    highlight: pickHighlight({
      studyMinutesThisWeek,
      studyMinutesLastWeek,
      currentStreak,
      streakExtended,
      tasksCompleted: tasksCount,
      isFirstActiveWeek,
    }),
    premiumTier: promoTier,
  }
}
