// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Public (no auth) proxy to bot render-sample endpoint
//          for card demos on the donate page. Aggressively cached.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

const VALID_TYPES = new Set([
  "profile", "stats", "weekly_stats", "monthly_stats",
  "weekly_goals", "monthly_goals", "leaderboard",
])
const VALID_SKINS = new Set([
  "original", "obsidian", "platinum", "boston_blue",
  "cotton_candy", "blue_bayoux", "bubblegum",
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const skin = (req.query.skin as string) || "obsidian"
  const type = (req.query.type as string) || "profile"

  if (!VALID_TYPES.has(type)) return res.status(400).json({ error: "Invalid type" })
  if (!VALID_SKINS.has(skin)) return res.status(400).json({ error: "Invalid skin" })

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Fail fast when render URL is not configured
  if (!BOT_RENDER_URL) {
    return res.status(503).json({ error: "Render service not configured" })
  }
  // --- END AI-MODIFIED ---

  const headers: Record<string, string> = {}
  if (BOT_RENDER_AUTH) headers["Authorization"] = BOT_RENDER_AUTH

  try {
    const params = new URLSearchParams({ type, skin })
    const response = await fetch(`${BOT_RENDER_URL}/render-sample?${params}`, {
      headers,
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return res.status(502).json({ error: "Render service returned an error" })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800")
    return res.send(buffer)
  } catch {
    return res.status(503).json({ error: "Card rendering service unavailable" })
  }
}
