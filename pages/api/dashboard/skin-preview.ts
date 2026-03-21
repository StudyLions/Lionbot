// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Proxy to bot render API for skin previews.
//          Supports sample previews and real-user-data previews.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

const VALID_CARD_TYPES = new Set([
  "profile", "stats", "weekly_stats", "monthly_stats",
  "weekly_goals", "monthly_goals", "leaderboard",
])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  const { mode, type, skin, guildid } = req.query as Record<string, string | undefined>
  const cardType = type || "profile"
  const skinId = skin || "original"

  if (!VALID_CARD_TYPES.has(cardType)) {
    return res.status(400).json({ error: `Invalid card type: ${cardType}` })
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Fail fast when render URL is not configured
  if (!BOT_RENDER_URL) {
    return res.status(503).json({ error: "Render service not configured" })
  }
  // --- END AI-MODIFIED ---

  const headers: Record<string, string> = {}
  if (BOT_RENDER_AUTH) {
    headers["Authorization"] = BOT_RENDER_AUTH
  }

  try {
    let url: string

    if (mode === "user" && guildid) {
      const params = new URLSearchParams({
        type: cardType,
        userid: auth.userId.toString(),
        guildid,
        skin: skinId,
      })
      url = `${BOT_RENDER_URL}/render?${params}`
    } else {
      const params = new URLSearchParams({ type: cardType, skin: skinId })
      url = `${BOT_RENDER_URL}/render-sample?${params}`
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: `Render failed: ${text}`, fallback: true })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", "image/png")
    if (mode === "user") {
      res.setHeader("Cache-Control", "private, max-age=60")
    } else {
      res.setHeader("Cache-Control", "public, max-age=3600")
    }
    return res.send(buffer)
  } catch (err: any) {
    return res.status(503).json({ error: "Card rendering service unavailable", fallback: true })
  }
}
