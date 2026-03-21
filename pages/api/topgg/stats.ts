// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: SVG stats bar for top.gg description fallback.
//          Compact horizontal bar showing live metrics as an image.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"

interface RowEstimate {
  relname: string
  estimate: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 10_000) return Math.round(n / 1_000) + "k"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toLocaleString("en-US")
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  let guilds = 0, users = 0, sessions = 0, studyingNow = 0, activeTimers = 0

  try {
    const [estimates, studyCount, timerCount, guildCount] = await Promise.all([
      prisma.$queryRaw<RowEstimate[]>`
        SELECT relname, reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname IN ('voice_sessions', 'text_sessions', 'user_config')
      `,
      prisma.voice_sessions_ongoing.count(),
      prisma.timers.count(),
      prisma.guild_config.count({ where: { left_at: null } }),
    ])
    const m: Record<string, number> = {}
    for (const r of estimates) m[r.relname] = Number(r.estimate)
    guilds = guildCount
    users = m["user_config"] || 0
    sessions = (m["voice_sessions"] || 0) + (m["text_sessions"] || 0)
    studyingNow = studyCount
    activeTimers = timerCount
  } catch {}

  const metrics = [
    { label: "SERVERS", value: fmt(guilds), color: "#60a5fa" },
    { label: "USERS", value: fmt(users), color: "#a78bfa" },
    { label: "SESSIONS", value: fmt(sessions), color: "#f472b6" },
    { label: "STUDYING NOW", value: fmt(studyingNow), color: "#34d399" },
    { label: "ACTIVE TIMERS", value: fmt(activeTimers), color: "#fbbf24" },
  ]

  const colW = 160
  const totalW = colW * metrics.length
  const h = 80

  const cols = metrics
    .map((m, i) => {
      const cx = colW * i + colW / 2
      return `
    <text x="${cx}" y="32" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="22" font-weight="700" fill="${m.color}">${m.value}</text>
    <text x="${cx}" y="52" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="9" fill="rgba(255,255,255,0.4)" letter-spacing="0.1em">${m.label}</text>
    ${i < metrics.length - 1 ? `<line x1="${colW * (i + 1)}" y1="16" x2="${colW * (i + 1)}" y2="58" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>` : ""}`
    })
    .join("")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}">
  <rect width="${totalW}" height="${h}" rx="12" fill="#0f172a" opacity="0.6"/>
  ${cols}
</svg>`

  res.setHeader("Content-Type", "image/svg+xml")
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
  res.status(200).send(svg)
}
