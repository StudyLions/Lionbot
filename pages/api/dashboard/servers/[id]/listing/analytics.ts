// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Aggregate analytics for the dashboard editor's
//          "Performance" panel. Returns a small payload covering:
//            - 7d totals (page views, invite clicks, external clicks)
//            - 30d totals
//            - per-day series for the last 14 days (for sparklines)
//            - top referrer hostnames
//
//          Numbers come from `server_listing_analytics` plus the
//          all-time counters on `server_listings` for an at-a-glance
//          headline. We intentionally cap query work cheaply by
//          using GROUP BY on indexed columns and LIMITing the
//          referrer list -- this endpoint is hit on every dashboard
//          page open.
// ============================================================
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { requireAdmin } from "@/utils/adminAuth"
import { isListingPremiumGuild } from "@/utils/listingHelpers"
import { prisma } from "@/utils/prisma"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

interface DailyPoint {
  date: string
  views: number
  invite_clicks: number
  external_clicks: number
}

interface ReferrerRow {
  hostname: string
  count: number
}

interface AnalyticsResponse {
  totals: {
    all_time_views: number
    all_time_invite_clicks: number
    last7d: { views: number; invite_clicks: number; external_clicks: number }
    last30d: { views: number; invite_clicks: number; external_clicks: number }
  }
  daily: DailyPoint[]
  top_referrers: ReferrerRow[]
}

export default apiHandler({
  async GET(req, res) {
    if (!SERVERS_DIRECTORY_ENABLED) {
      return res.status(404).json({ error: "Not found" })
    }
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isListingPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Server premium subscription required." })
    }

    const listing = await prisma.server_listings.findUnique({
      where: { guildid: guildId },
      select: { view_count: true, invite_click_count: true },
    })

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400_000)

    // Totals over windows -- single round-trip via groupBy.
    const grouped = await prisma.server_listing_analytics.groupBy({
      by: ["event_type"],
      where: {
        guildid: guildId,
        created_at: { gte: thirtyDaysAgo },
      },
      _count: { _all: true },
    })

    const grouped7 = await prisma.server_listing_analytics.groupBy({
      by: ["event_type"],
      where: {
        guildid: guildId,
        created_at: { gte: sevenDaysAgo },
      },
      _count: { _all: true },
    })

    const totalsByEvent = (rows: typeof grouped) => {
      const out = { views: 0, invite_clicks: 0, external_clicks: 0 }
      for (const row of rows) {
        if (row.event_type === "view") out.views = row._count._all
        else if (row.event_type === "invite_click") out.invite_clicks = row._count._all
        else if (row.event_type === "external_click") out.external_clicks = row._count._all
      }
      return out
    }

    // Daily series for sparklines. We pull rows and bin them in
    // application code rather than in SQL -- the dataset is small
    // (a single guild, 14 days) so the simpler code wins.
    const recent = await prisma.server_listing_analytics.findMany({
      where: { guildid: guildId, created_at: { gte: fourteenDaysAgo } },
      select: { created_at: true, event_type: true, referrer: true },
      orderBy: { created_at: "asc" },
    })

    const daily: DailyPoint[] = []
    const buckets = new Map<string, DailyPoint>()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400_000)
      const key = d.toISOString().slice(0, 10)
      const point: DailyPoint = { date: key, views: 0, invite_clicks: 0, external_clicks: 0 }
      buckets.set(key, point)
      daily.push(point)
    }
    for (const row of recent) {
      const key = row.created_at.toISOString().slice(0, 10)
      const bucket = buckets.get(key)
      if (!bucket) continue
      if (row.event_type === "view") bucket.views++
      else if (row.event_type === "invite_click") bucket.invite_clicks++
      else if (row.event_type === "external_click") bucket.external_clicks++
    }

    // Top referrers (last 30d). We normalise to hostname so we don't
    // leak query strings or fingerprintable paths.
    const referrerRows = await prisma.server_listing_analytics.findMany({
      where: {
        guildid: guildId,
        created_at: { gte: thirtyDaysAgo },
        referrer: { not: null },
      },
      select: { referrer: true },
    })

    const referrerCounts = new Map<string, number>()
    for (const row of referrerRows) {
      const host = safeHostname(row.referrer)
      if (!host) continue
      referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1)
    }
    const top_referrers: ReferrerRow[] = Array.from(referrerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hostname, count]) => ({ hostname, count }))

    const payload: AnalyticsResponse = {
      totals: {
        all_time_views: listing?.view_count ?? 0,
        all_time_invite_clicks: listing?.invite_click_count ?? 0,
        last7d: totalsByEvent(grouped7),
        last30d: totalsByEvent(grouped),
      },
      daily,
      top_referrers,
    }

    res.setHeader("Cache-Control", "private, no-cache")
    return res.status(200).json(payload)
  },
})

function safeHostname(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    const u = new URL(referrer)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}
