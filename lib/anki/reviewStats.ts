// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-06
// Purpose: Shared Anki review-stats computation, so BOTH the bearer addon
//          endpoint (pages/api/anki/me/stats.ts) and the session-authed
//          website dashboard (pages/api/anki/me/summary.ts → /dashboard/anki)
//          return the exact same numbers with no forked logic.
//
//          Returns today / week / month / all-time card counts, the review
//          streak, the GLOBAL rank (today + all-time), and today's gold.
//          Result is cached per-user (short TTL) to bound the rank groupBy.
//          Extracted verbatim from the original stats route.
// ============================================================
import { prisma } from "@/utils/prisma"
import { DAILY_GOLD_CAP } from "@/lib/anki/rewards"

const STREAK_MIN_CARDS = 10

export interface ReviewStats {
  cards: { today: number; week: number; month: number; all_time: number }
  streak: { days: number; min_cards_per_day: number }
  rank: { scope: "global"; today: number | null; all_time: number | null }
  daily_progress: { gold: { earned: number; cap: number } }
}

// Per-user response cache — read-only payload that only shifts as reviews
// trickle in, so a short TTL is invisible but hard-caps how often a single
// client triggers the expensive rank groupBy + streak aggregate. Best-effort
// (per Vercel instance), shared by the bearer + session callers.
const CACHE_TTL_MS = 30_000
const CACHE_MAX = 5_000
const cache = new Map<string, { at: number; body: ReviewStats }>()

function cacheGet(userId: bigint): ReviewStats | null {
  const hit = cache.get(userId.toString())
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(userId.toString())
    return null
  }
  return hit.body
}

function cacheSet(userId: bigint, body: ReviewStats): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(userId.toString(), { at: Date.now(), body })
}

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
function utcWeekStart(d: Date): Date {
  const today = utcDayStart(d)
  const dow = today.getUTCDay()
  const daysBack = dow === 0 ? 6 : dow - 1
  return new Date(today.getTime() - daysBack * 86400_000)
}
function utcMonthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export async function getReviewStats(userId: bigint): Promise<ReviewStats> {
  const cached = cacheGet(userId)
  if (cached) return cached

  const now = new Date()
  const dayStart = utcDayStart(now)
  const weekStart = utcWeekStart(now)
  const monthStart = utcMonthStart(now)

  const [today, week, month, all] = await Promise.all([
    prisma.anki_review_events.count({ where: { userid: userId, reviewed_at: { gte: dayStart } } }),
    prisma.anki_review_events.count({ where: { userid: userId, reviewed_at: { gte: weekStart } } }),
    prisma.anki_review_events.count({ where: { userid: userId, reviewed_at: { gte: monthStart } } }),
    prisma.anki_review_events.count({ where: { userid: userId } }),
  ])

  // Streak: one aggregate over the last ~371 UTC days, walked in memory.
  const streakSince = new Date(dayStart.getTime() - 371 * 86400_000)
  const dayRows = await prisma.$queryRaw<Array<{ d: string; c: number | bigint }>>`
    SELECT to_char((reviewed_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS d,
           count(*)::int AS c
    FROM anki_review_events
    WHERE userid = ${userId} AND reviewed_at >= ${streakSince}
    GROUP BY 1`
  const cardsByDay = new Map<string, number>()
  for (const r of dayRows) cardsByDay.set(r.d, Number(r.c))
  const utcDayKey = (ms: number): string => {
    const dt = new Date(ms)
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`
  }
  let streak = 0
  for (let i = 0; i < 371; i++) {
    const cnt = cardsByDay.get(utcDayKey(dayStart.getTime() - i * 86400_000)) ?? 0
    if (cnt >= STREAK_MIN_CARDS) streak++
    else {
      if (i === 0) continue // today in-progress doesn't break the streak
      break
    }
  }

  // GLOBAL rank (Anki isn't server-scoped). groupBy+having scans the table —
  // fine at current scale; revisit with a materialized leaderboard if it grows.
  let rankToday: number | null = null
  let rankAllTime: number | null = null
  try {
    if (today > 0) {
      const ahead = await prisma.anki_review_events.groupBy({
        by: ["userid"],
        where: { reviewed_at: { gte: dayStart }, NOT: { userid: userId } },
        _count: { _all: true },
        having: { userid: { _count: { gt: today } } },
      })
      rankToday = ahead.length + 1
    }
    if (all > 0) {
      const ahead = await prisma.anki_review_events.groupBy({
        by: ["userid"],
        where: { NOT: { userid: userId } },
        _count: { _all: true },
        having: { userid: { _count: { gt: all } } },
      })
      rankAllTime = ahead.length + 1
    }
  } catch (err) {
    console.warn("[reviewStats] global rank lookup failed:", err)
  }

  const goldAgg = await prisma.lg_gold_transactions.aggregate({
    where: { to_account: userId, created_at: { gte: dayStart }, amount: { gt: 0 } },
    _sum: { amount: true },
  })

  const body: ReviewStats = {
    cards: { today, week, month, all_time: all },
    streak: { days: streak, min_cards_per_day: STREAK_MIN_CARDS },
    rank: { scope: "global", today: rankToday, all_time: rankAllTime },
    daily_progress: { gold: { earned: Number(goldAgg._sum.amount || 0), cap: DAILY_GOLD_CAP } },
  }

  cacheSet(userId, body)
  return body
}
