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
import { DAILY_GOLD_CAP, DAILY_XP_CAP } from "@/lib/anki/rewards"

const STREAK_MIN_CARDS = 10

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

  // Home guild + rank.
  let homeGuildId: bigint | null = null
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: ctx.userId },
      select: { anki_home_guildid: true },
    })
    homeGuildId = cfg?.anki_home_guildid ?? null
  } catch {
    // Non-fatal — surface unranked.
  }

  // Today's rank in home guild (cards reviewed today).
  let rankToday: number | null = null
  let rankAllTime: number | null = null
  if (homeGuildId) {
    try {
      const myCardsToday = await prisma.anki_review_events.count({
        where: {
          userid: ctx.userId,
          guildid: homeGuildId,
          reviewed_at: { gte: dayStart },
        },
      })
      if (myCardsToday > 0) {
        const ahead = await prisma.anki_review_events.groupBy({
          by: ["userid"],
          where: {
            guildid: homeGuildId,
            reviewed_at: { gte: dayStart },
            NOT: { userid: ctx.userId },
          },
          _count: { _all: true },
          having: { userid: { _count: { gt: myCardsToday } } },
        })
        rankToday = ahead.length + 1
      }
      const myCardsAll = await prisma.anki_review_events.count({
        where: { userid: ctx.userId, guildid: homeGuildId },
      })
      if (myCardsAll > 0) {
        const ahead = await prisma.anki_review_events.groupBy({
          by: ["userid"],
          where: {
            guildid: homeGuildId,
            NOT: { userid: ctx.userId },
          },
          _count: { _all: true },
          having: { userid: { _count: { gt: myCardsAll } } },
        })
        rankAllTime = ahead.length + 1
      }
    } catch (err) {
      console.warn("[anki/me/stats] rank lookup failed:", err)
    }
  }

  // Today's economy progress (mirrors what the ingest endpoint
  // returns in daily_progress so the addon can show a consistent
  // chip when reviews aren't actively happening).
  const [goldAgg, xpAgg] = await Promise.all([
    prisma.lg_gold_transactions.aggregate({
      where: {
        to_account: ctx.userId,
        created_at: { gte: dayStart },
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    }),
    prisma.member_experience.aggregate({
      where: {
        userid: ctx.userId,
        earned_at: { gte: dayStart },
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    }),
  ])

  return res.status(200).json({
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
      home_guild_id: homeGuildId?.toString() || null,
      today: rankToday,
      all_time: rankAllTime,
    },
    daily_progress: {
      gold: {
        earned: Number(goldAgg._sum.amount || 0),
        cap: DAILY_GOLD_CAP,
      },
      xp: {
        earned: Number(xpAgg._sum.amount || 0),
        cap: DAILY_XP_CAP,
      },
    },
  })
}
