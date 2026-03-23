// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: API route for Ambient Sounds analytics data.
//          Returns aggregated usage stats: hours played, popular
//          sounds, peak listeners, and daily breakdown.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const range = (req.query.range as string) || "7d"
    const days = range === "30d" ? 30 : 7
    const since = new Date(Date.now() - days * 86_400_000)

    const usage = await prisma.ambient_sounds_usage.findMany({
      where: { guildid: guildId, started_at: { gte: since } },
      orderBy: { started_at: "asc" },
    })

    let totalSeconds = 0
    let peakListeners = 0
    const soundTotals: Record<string, number> = {}
    const dailyTotals: Record<string, number> = {}

    for (const row of usage) {
      const end = row.ended_at ?? new Date()
      const dur = (end.getTime() - row.started_at.getTime()) / 1000
      totalSeconds += dur
      peakListeners = Math.max(peakListeners, row.peak_listeners)

      soundTotals[row.sound_type] = (soundTotals[row.sound_type] ?? 0) + dur
      const dayKey = row.started_at.toISOString().slice(0, 10)
      dailyTotals[dayKey] = (dailyTotals[dayKey] ?? 0) + dur
    }

    const allTimeUsage = await prisma.ambient_sounds_usage.findMany({
      where: { guildid: guildId },
    })
    let allTimeSeconds = 0
    let allTimePeak = 0
    for (const row of allTimeUsage) {
      const end = row.ended_at ?? new Date()
      allTimeSeconds += (end.getTime() - row.started_at.getTime()) / 1000
      allTimePeak = Math.max(allTimePeak, row.peak_listeners)
    }

    return res.status(200).json({
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      allTimeHours: Math.round((allTimeSeconds / 3600) * 10) / 10,
      peakListeners,
      allTimePeakListeners: allTimePeak,
      soundBreakdown: Object.entries(soundTotals).map(([sound, secs]) => ({
        sound,
        hours: Math.round((secs / 3600) * 10) / 10,
      })),
      dailyBreakdown: Object.entries(dailyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, secs]) => ({
          date,
          hours: Math.round((secs / 3600) * 10) / 10,
        })),
      sessionCount: usage.length,
      range,
    })
  },
})
