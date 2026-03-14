// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Daily study activity breakdown for history page chart + server list
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const period = (req.query.period as string) || "30d"
    let days: number
    switch (period) {
      case "90d": days = 90; break
      case "year": days = 365; break
      default: days = 30; break
    }

    const since = new Date()
    since.setUTCDate(since.getUTCDate() - days)
    since.setUTCHours(0, 0, 0, 0)

    const [dailyRaw, serverRaw] = await Promise.all([
      prisma.$queryRaw<{ date: Date; minutes: number; sessions: number }[]>(Prisma.sql`
        SELECT DATE(start_time AT TIME ZONE 'UTC')::date as date,
               COALESCE(SUM(duration)::float / 60, 0)::int as minutes,
               COUNT(*)::int as sessions
        FROM voice_sessions
        WHERE userid = ${auth.userId}
          AND start_time >= ${since}
        GROUP BY DATE(start_time AT TIME ZONE 'UTC')
        ORDER BY date
      `),
      prisma.$queryRaw<{ guildid: bigint; name: string | null }[]>(Prisma.sql`
        SELECT DISTINCT vs.guildid, gc.name
        FROM voice_sessions vs
        LEFT JOIN guild_config gc ON gc.guildid = vs.guildid
        WHERE vs.userid = ${auth.userId}
        ORDER BY gc.name
      `),
    ])

    const dailyMap = new Map<string, { minutes: number; sessions: number }>()
    for (const row of dailyRaw) {
      const d = row.date instanceof Date ? row.date : new Date(row.date)
      dailyMap.set(d.toISOString().slice(0, 10), {
        minutes: Number(row.minutes),
        sessions: Number(row.sessions),
      })
    }

    const result: Array<{ date: string; minutes: number; sessions: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const entry = dailyMap.get(dateStr)
      result.push({ date: dateStr, minutes: entry?.minutes ?? 0, sessions: entry?.sessions ?? 0 })
    }

    res.status(200).json({
      days: result,
      servers: serverRaw.map(s => ({
        guildId: s.guildid.toString(),
        guildName: s.name || "Unknown Server",
      })),
    })
  },
})
