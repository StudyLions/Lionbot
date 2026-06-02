// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-22
// Purpose: Global Anki review leaderboard for the addon. Ranks
//          users by card count over a period (daily / weekly /
//          monthly) and returns the top N plus the caller's own
//          rank. Anki is global, so there is no guild filter —
//          this is the worldwide leaderboard.
//
//          Read-only; bearer-gated (anki.pet.read). Top-N is the
//          same for everyone, so it's cached per-period in memory
//          (short TTL); the caller's own rank is computed fresh.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"

const TOP_N = 20
const CACHE_TTL_MS = 45_000

type Period = "daily" | "weekly" | "monthly"

interface Entry {
  rank: number
  discord_id: string
  name: string | null
  avatar_hash: string | null
  count: number
}

interface TopCache {
  ts: number
  entries: Entry[]
}
const topCache: Map<Period, TopCache> = new Map()

function periodStart(period: Period, now: Date): Date {
  if (period === "daily") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }
  if (period === "weekly") {
    return new Date(now.getTime() - 7 * 86400_000)
  }
  return new Date(now.getTime() - 30 * 86400_000) // monthly
}

async function buildTop(period: Period, since: Date): Promise<Entry[]> {
  const grouped = await prisma.anki_review_events.groupBy({
    by: ["userid"],
    where: { reviewed_at: { gte: since } },
    _count: { review_id: true },
    orderBy: { _count: { review_id: "desc" } },
    take: TOP_N,
  })
  if (grouped.length === 0) return []

  const userids = grouped.map((g) => g.userid)
  const cfgs = await prisma.user_config.findMany({
    where: { userid: { in: userids } },
    select: { userid: true, name: true, avatar_hash: true },
  })
  const cfgMap = new Map(cfgs.map((c) => [c.userid.toString(), c]))

  return grouped.map((g, i) => {
    const cfg = cfgMap.get(g.userid.toString())
    return {
      rank: i + 1,
      discord_id: g.userid.toString(),
      name: cfg?.name ?? null,
      avatar_hash: cfg?.avatar_hash ?? null,
      count: g._count.review_id,
    }
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }
  const ctx = await requireAnkiAuth(req, res, "anki.pet.read")
  if (!ctx) return

  const raw = (req.query.period as string) || "daily"
  const period: Period =
    raw === "weekly" ? "weekly" : raw === "monthly" ? "monthly" : "daily"
  const now = new Date()
  const since = periodStart(period, now)

  let entries: Entry[]
  try {
    const cached = topCache.get(period)
    if (cached && now.getTime() - cached.ts < CACHE_TTL_MS) {
      entries = cached.entries
    } else {
      entries = await buildTop(period, since)
      topCache.set(period, { ts: now.getTime(), entries })
    }
  } catch (err) {
    console.error("[anki/leaderboard] top build failed:", err)
    return res.status(503).json({ error: "db_unavailable", message: "Could not load leaderboard" })
  }

  // Caller's own count + rank (rank = users with strictly more, +1).
  let myCount = 0
  let myRank: number | null = null
  try {
    myCount = await prisma.anki_review_events.count({
      where: { userid: ctx.userId, reviewed_at: { gte: since } },
    })
    if (myCount > 0) {
      const higher = await prisma.$queryRaw<Array<{ n: bigint }>>`
        SELECT count(*)::bigint AS n FROM (
          SELECT userid FROM anki_review_events
          WHERE reviewed_at >= ${since}
          GROUP BY userid
          HAVING count(*) > ${myCount}
        ) t`
      myRank = Number(higher[0]?.n ?? 0) + 1
    }
  } catch (err) {
    console.warn("[anki/leaderboard] my-rank failed:", err)
  }

  res.setHeader("Cache-Control", "private, max-age=30")
  return res.status(200).json({
    period,
    entries,
    me: { discord_id: ctx.discordId, rank: myRank, count: myCount },
  })
}
