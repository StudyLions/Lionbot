// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Proxy API for Pomodoro live timer status from bot renderer
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireModerator } from "@/utils/adminAuth"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export default apiHandler({
  async GET(req, res) {
    const guildId = req.query.id as string
    if (!guildId) {
      return res.status(400).json({ error: "Missing guild id" })
    }

    const auth = await requireModerator(req, res, BigInt(guildId))
    if (!auth) return

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Fail fast when render URL is not configured
    if (!BOT_RENDER_URL) {
      return res.status(503).json({ error: "Render service not configured" })
    }
    // --- END AI-MODIFIED ---

    try {
      const headers: Record<string, string> = {}
      if (BOT_RENDER_AUTH) {
        headers["Authorization"] = BOT_RENDER_AUTH
      }

      const response = await fetch(
        `${BOT_RENDER_URL}/timer-status?guildid=${guildId}`,
        {
          headers,
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        return res.status(response.status).json(await response.json().catch(() => ({ error: "Bot request failed" })))
      }

      const data = await response.json()
      return res.status(200).json(data)
    } catch {
      return res.status(200).json({ timers: [] })
    }
  },
})
