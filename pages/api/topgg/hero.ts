// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: SVG hero banner for top.gg description fallback.
//          Returns a styled SVG with bot name, tagline, and live stats.
//          Used as <img> src when iframes aren't supported.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"

interface RowEstimate {
  relname: string
  estimate: number
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+"
  if (n >= 1_000) return Math.round(n / 1_000) + "k+"
  return n.toString()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  let guilds = 70000
  let users = 240000
  let sessions = 8100000

  try {
    const [estimates, guildCount] = await Promise.all([
      prisma.$queryRaw<RowEstimate[]>`
        SELECT relname, reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname IN ('voice_sessions', 'text_sessions', 'user_config')
      `,
      prisma.guild_config.count({ where: { left_at: null } }),
    ])
    const m: Record<string, number> = {}
    for (const r of estimates) m[r.relname] = Number(r.estimate)
    guilds = guildCount
    users = Math.max(m["user_config"] || 0, 0) || users
    const rawSessions = (Math.max(m["voice_sessions"] || 0, 0)) + (Math.max(m["text_sessions"] || 0, 0))
    sessions = rawSessions > 0 ? rawSessions : sessions
  } catch {}

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="800" height="200" rx="16" fill="url(#bg)"/>
  <circle cx="720" cy="40" r="100" fill="#3b82f6" opacity="0.05"/>
  <circle cx="80" cy="180" r="80" fill="#8b5cf6" opacity="0.04"/>
  <text x="400" y="60" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="36" font-weight="700" fill="url(#accent)">LionBot</text>
  <text x="400" y="92" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="16" fill="rgba(255,255,255,0.7)">The Ultimate Discord Productivity Bot</text>
  <line x1="300" y1="112" x2="500" y2="112" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="200" y="150" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#60a5fa">${formatNum(guilds)}</text>
  <text x="200" y="172" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.45)" letter-spacing="0.08em">SERVERS</text>
  <text x="400" y="150" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#a78bfa">${formatNum(users)}</text>
  <text x="400" y="172" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.45)" letter-spacing="0.08em">USERS</text>
  <text x="600" y="150" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#f472b6">${formatNum(sessions)}</text>
  <text x="600" y="172" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.45)" letter-spacing="0.08em">STUDY SESSIONS</text>
</svg>`

  res.setHeader("Content-Type", "image/svg+xml")
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
  res.status(200).send(svg)
}
