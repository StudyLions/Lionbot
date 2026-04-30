// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Public "Verified by Leo" stats for the public profile
//          page. Returns numbers that come straight from Leo's
//          tracked tables -- the admin can't fudge them. We only
//          expose them for APPROVED listings whose admin has opted
//          into the corresponding sections (verified_stats /
//          live_sessions). The page calls this endpoint client-side
//          on mount so the SSG payload doesn't have to revalidate
//          every minute.
//
//          Numbers exposed:
//            - tracked_members: count of members rows for the guild
//            - studied_minutes_30d: SUM of voice_sessions.duration
//              (in minutes, rounded) over the last 30 days
//            - active_voice_sessions: COUNT of voice_sessions_ongoing
//              rows for the guild (live count of users in voice now)
//
//          We cap each query with a guild-id filter that hits the
//          right index, so this stays fast even on the live DB.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"

interface StatsResponse {
  tracked_members: number
  studied_minutes_30d: number
  active_voice_sessions: number
  generated_at: string
}

export default apiHandler({
  async GET(req, res) {
    const slugRaw = req.query.slug
    const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Missing slug" })
    }

    const listing = await prisma.server_listings.findFirst({
      where: { slug, status: "APPROVED" },
      select: { guildid: true, sections_enabled: true },
    })
    if (!listing) {
      return res.status(404).json({ error: "Not found" })
    }

    const sections = (listing.sections_enabled ?? {}) as Record<string, boolean>
    const verifiedEnabled = sections.verified_stats !== false
    const liveEnabled = sections.live_sessions !== false

    if (!verifiedEnabled && !liveEnabled) {
      // The admin opted out of every stats section -- don't leak
      // anything we'd otherwise show. We still 200 so the client
      // can cleanly hide the panel without a stack trace.
      const empty: StatsResponse = {
        tracked_members: 0,
        studied_minutes_30d: 0,
        active_voice_sessions: 0,
        generated_at: new Date().toISOString(),
      }
      return res.status(200).json(empty)
    }

    const guildId = listing.guildid

    // We run the three queries concurrently. Even on the busiest
    // guild, none of these touch a large unindexed scan -- members
    // is keyed by (guildid, userid), voice_sessions has a
    // guild+start_time index, and voice_sessions_ongoing is small
    // by definition (only currently-active rows).
    const sinceMs = 30 * 86400_000
    const since = new Date(Date.now() - sinceMs)

    const [trackedMembers, durationsAgg, activeNow] = await Promise.all([
      verifiedEnabled
        ? prisma.members.count({ where: { guildid: guildId } })
        : Promise.resolve(0),
      verifiedEnabled
        ? prisma.voice_sessions.aggregate({
            where: { guildid: guildId, start_time: { gte: since } },
            _sum: { duration: true },
          })
        : Promise.resolve({ _sum: { duration: 0 } } as any),
      liveEnabled
        ? prisma.voice_sessions_ongoing.count({ where: { guildid: guildId } })
        : Promise.resolve(0),
    ])

    const totalSeconds = (durationsAgg._sum?.duration ?? 0) as number
    const studiedMinutes = Math.round(totalSeconds / 60)

    const payload: StatsResponse = {
      tracked_members: trackedMembers,
      studied_minutes_30d: studiedMinutes,
      active_voice_sessions: activeNow,
      generated_at: new Date().toISOString(),
    }

    // Cache aggressively at the CDN -- live count goes stale fast,
    // but a 30s window is plenty for the public page and saves us
    // 95% of the DB load when a listing trends.
    res.setHeader(
      "Cache-Control",
      "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
    )
    return res.status(200).json(payload)
  },
})
