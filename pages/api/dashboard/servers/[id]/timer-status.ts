// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Proxy API for Pomodoro live timer status from bot renderer
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireModerator } from "@/utils/adminAuth"

const BOT_RENDER_URL = process.env.BOT_RENDER_URL || "http://65.109.163.156:7100"
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export default apiHandler({
  async GET(req, res) {
    const guildId = req.query.id as string
    if (!guildId) {
      return res.status(400).json({ error: "Missing guild id" })
    }

    const auth = await requireModerator(req, res, BigInt(guildId))
    if (!auth) return

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
