// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Stats summary for the addon's "Anki Stats" tab.
//
//          Returns:
//            - today / this_week / this_month / all_time card counts
//            - streak in days (consecutive days with ≥ STREAK_MIN_CARDS reviews)
//            - current rank in user's home guild (today + all-time)
//            - today's pet/economy progress chip data
//
//          One endpoint -> one round-trip from the addon. The
//          queries are all cheap individually thanks to the
//          (userid, reviewed_at DESC) and (guildid, reviewed_at)
//          indexes on anki_review_events.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { DAILY_GOLD_CAP } from "@/lib/anki/rewards"

const STREAK_MIN_CARDS = 10

// Per-user response cache. The stats payload is read-only and only
// shifts as reviews trickle in (batched every 30s by the addon), so
// a short TTL is invisible to the user but hard-caps how often a
// single client can trigger the expensive rank groupBy + streak loop.
// Best-effort: each Vercel instance has its own Map; a client that
// hammers the endpoint usually stays pinned to one warm instance, so
// the cache absorbs the burst there. Cold instances just recompute.
const STATS_CACHE_TTL_MS = 30_000
const STATS_CACHE_MAX = 5_000
type StatsPayload = Record<string, unknown>
const statsCache = new Map<string, { at: number; body: StatsPayload }>()

function cacheGet(userId: bigint): StatsPayload | null {
  const key = userId.toString()
  const hit = statsCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > STATS_CACHE_TTL_MS) {
    statsCache.delete(key)
    return null
  }
  return hit.body
}

function cacheSet(userId: bigint, body: StatsPayload): void {
  if (statsCache.size >= STATS_CACHE_MAX) {
    // Evict the oldest insertion (Map preserves insertion order).
    const oldest = statsCache.keys().next().value
    if (oldest !== undefined) statsCache.delete(oldest)
  }
  statsCache.set(userId.toString(), { at: Date.now(), body })
}

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function utcWeekStart(d: Date): Date {
  // Mon-Sun. utcDayStart, then move back to Monday.
  const today = utcDayStart(d)
  const dow = today.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const daysBack = dow === 0 ? 6 : dow - 1
  return new Date(today.getTime() - daysBack * 86400_000)
}

function utcMonthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  const ctx = await requireAnkiAuth(req, res)
  if (!ctx) return

  const cached = cacheGet(ctx.userId)
  if (cached) {
    res.setHeader("X-Cache", "hit")
    return res.status(200).json(cached)
  }

  const now = new Date()
  const dayStart = utcDayStart(now)
  const weekStart = utcWeekStart(now)
  const monthStart = utcMonthStart(now)

  // Card counts (today / week / month / all-time)
  const [today, week, month, all] = await Promise.all([
    prisma.anki_review_events.count({
      where: { userid: ctx.userId, reviewed_at: { gte: dayStart } },
    }),
    prisma.anki_review_events.count({
      where: { userid: ctx.userId, reviewed_at: { gte: weekStart } },
    }),
    prisma.anki_review_events.count({
      where: { userid: ctx.userId, reviewed_at: { gte: monthStart } },
    }),
    prisma.anki_review_events.count({
      where: { userid: ctx.userId },
    }),
  ])

  // Streak: walk back day by day until we hit a day with < STREAK_MIN_CARDS.
  // Cap at 365 to bound the loop. For typical users the streak
  // is short so this is fast; the index on (userid, reviewed_at)
  // makes each per-day count cheap.
  let streak = 0
  const STREAK_MAX = 365
  for (let i = 0; i < STREAK_MAX; i++) {
    const start = new Date(dayStart.getTime() - i * 86400_000)
    const end = new Date(start.getTime() + 86400_000)
    const cnt = await prisma.anki_review_events.count({
      where: {
        userid: ctx.userId,
        reviewed_at: { gte: start, lt: end },
      },
    })
    if (cnt >= STREAK_MIN_CARDS) {
      streak++
    } else {
      // The current day "in progress" doesn't break the streak —
      // only complete prior days count as breaks. So if today
      // is below threshold but yesterday was at threshold, we
      // continue checking yesterday.
      if (i === 0 && cnt < STREAK_MIN_CARDS) {
        continue
      }
      break
    }
  }

  // GLOBAL rank — Anki is not tied to any server. Rank is the
  // user's position across ALL LionBot users by review count.
  // (groupBy+having scans the whole table; fine at current scale,
  // revisit with a materialized leaderboard if it grows large.)
  let rankToday: number | null = null
  let rankAllTime: number | null = null
  try {
    if (today > 0) {
      const ahead = await prisma.anki_review_events.groupBy({
        by: ["userid"],
        where: { reviewed_at: { gte: dayStart }, NOT: { userid: ctx.userId } },
        _count: { _all: true },
        having: { userid: { _count: { gt: today } } },
      })
      rankToday = ahead.length + 1
    }
    if (all > 0) {
      const ahead = await prisma.anki_review_events.groupBy({
        by: ["userid"],
        where: { NOT: { userid: ctx.userId } },
        _count: { _all: true },
        having: { userid: { _count: { gt: all } } },
      })
      rankAllTime = ahead.length + 1
    }
  } catch (err) {
    console.warn("[anki/me/stats] global rank lookup failed:", err)
  }

  // Today's gold earned (shared across all sources via the gold
  // ledger). Cards-reviewed is the natural Anki metric and is
  // returned in `cards` above.
  const goldAgg = await prisma.lg_gold_transactions.aggregate({
    where: {
      to_account: ctx.userId,
      created_at: { gte: dayStart },
      amount: { gt: 0 },
    },
    _sum: { amount: true },
  })

  const body: StatsPayload = {
    cards: {
      today,
      week,
      month,
      all_time: all,
    },
    streak: {
      days: streak,
      min_cards_per_day: STREAK_MIN_CARDS,
    },
    rank: {
      scope: "global",
      today: rankToday,
      all_time: rankAllTime,
    },
    daily_progress: {
      gold: {
        earned: Number(goldAgg._sum.amount || 0),
        cap: DAILY_GOLD_CAP,
      },
    },
  }

  cacheSet(ctx.userId, body)
  res.setHeader("X-Cache", "miss")
  return res.status(200).json(body)
}
