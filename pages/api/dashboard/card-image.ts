// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Proxy API for bot-rendered card images (profile, stats, etc.)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: map website skin IDs to bot skin IDs
const SKIN_ID_MAP: Record<string, string> = { base: "original" }
// --- END AI-MODIFIED ---

const imageCache = new Map<string, { data: Buffer; expiresAt: number }>()

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: accept optional skin query param for skin preview with user data
    const { type = "profile", guildId, skin } = req.query
    const cardType = String(type)
    const guildIdStr = guildId ? String(guildId) : ""
    const skinParam = skin ? String(skin) : ""
    const botSkinId = skinParam ? (SKIN_ID_MAP[skinParam] ?? skinParam) : ""

    const cacheKey = `${auth.discordId}-${cardType}-${guildIdStr}-${botSkinId}`
    // --- END AI-MODIFIED ---
    const cached = imageCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader("Content-Type", "image/png")
      res.setHeader("Cache-Control", "public, max-age=300")
      return res.send(cached.data)
    }

    try {
      const params = new URLSearchParams({
        type: cardType,
        userid: auth.discordId,
        ...(guildIdStr ? { guildid: guildIdStr } : {}),
        ...(botSkinId ? { skin: botSkinId } : {}),
      })

      const headers: Record<string, string> = {}
      if (BOT_RENDER_AUTH) {
        headers["Authorization"] = BOT_RENDER_AUTH
      }

      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Fail fast when render URL is not configured
      if (!BOT_RENDER_URL) {
        return res.status(503).json({ error: "Render service not configured" })
      }
      // --- END AI-MODIFIED ---

      const response = await fetch(`${BOT_RENDER_URL}/render?${params}`, {
        headers,
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        const text = await response.text()
        return res.status(response.status).json({
          error: `Card render failed: ${text}`,
          fallback: true,
        })
      }

      const buffer = Buffer.from(await response.arrayBuffer())

      imageCache.set(cacheKey, {
        data: buffer,
        expiresAt: Date.now() + 300000,
      })

      res.setHeader("Content-Type", "image/png")
      res.setHeader("Cache-Control", "public, max-age=300")
      return res.send(buffer)
    } catch (err: any) {
      return res.status(503).json({
        error: "Card rendering service unavailable",
        fallback: true,
      })
    }
  },
})
