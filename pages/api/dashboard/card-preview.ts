// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: POST proxy to bot render-preview endpoint for live
//          branding preview with custom color property overrides
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

const VALID_CARD_TYPES = [
  "profile", "stats", "weekly_stats", "monthly_stats",
  "weekly_goals", "monthly_goals", "leaderboard",
]

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { type, skin, properties } = req.body as {
      type?: string
      skin?: string
      properties?: Record<string, string>
    }

    const cardType = type || "profile"
    if (!VALID_CARD_TYPES.includes(cardType)) {
      return res.status(400).json({ error: `Invalid card type: ${cardType}` })
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Fail fast when render URL is not configured
    if (!BOT_RENDER_URL) {
      return res.status(503).json({ error: "Render service not configured" })
    }
    // --- END AI-MODIFIED ---

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (BOT_RENDER_AUTH) {
      headers["Authorization"] = BOT_RENDER_AUTH
    }

    try {
      const response = await fetch(`${BOT_RENDER_URL}/render-preview`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: cardType,
          skin: skin || "original",
          properties: properties || {},
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (!response.ok) {
        const text = await response.text()
        return res.status(response.status).json({
          error: `Render failed: ${text}`,
          fallback: true,
        })
      }

      const buffer = Buffer.from(await response.arrayBuffer())

      res.setHeader("Content-Type", "image/png")
      res.setHeader("Cache-Control", "no-cache, no-store")
      return res.send(buffer)
    } catch (err: any) {
      return res.status(503).json({
        error: "Card rendering service unavailable",
        fallback: true,
      })
    }
  },
})
