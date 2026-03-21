// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Proxy API for Pomodoro timer control (start/stop/reload/unload)
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireAdmin } from "@/utils/adminAuth"

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Remove hardcoded IP fallback -- staging and production use different ports
const BOT_RENDER_URL = process.env.BOT_RENDER_URL
// --- END AI-MODIFIED ---
const BOT_RENDER_AUTH = process.env.BOT_RENDER_AUTH || ""

export default apiHandler({
  async POST(req, res) {
    const guildId = req.query.id as string
    if (!guildId) {
      return res.status(400).json({ error: "Missing guild id" })
    }

    const auth = await requireAdmin(req, res, BigInt(guildId))
    if (!auth) return

    const { channelid, action } = req.body || {}
    if (!channelid || !action) {
      return res.status(400).json({ error: "Missing channelid or action" })
    }

    const validActions = ["start", "stop", "reload", "unload"]
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` })
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Fail fast when render URL is not configured
    if (!BOT_RENDER_URL) {
      return res.status(503).json({ error: "Render service not configured" })
    }
    // --- END AI-MODIFIED ---

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (BOT_RENDER_AUTH) {
        headers["Authorization"] = BOT_RENDER_AUTH
      }

      const response = await fetch(`${BOT_RENDER_URL}/timer-control`, {
        method: "POST",
        headers,
        body: JSON.stringify({ guildid: guildId, channelid, action }),
        signal: AbortSignal.timeout(10000),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return res.status(response.status).json(data)
      }

      return res.status(200).json(data)
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Don't leak internal error details to client
    // --- Original code (commented out for rollback) ---
    // } catch (err: unknown) {
    //   return res.status(503).json({
    //     error: "Timer control service unavailable",
    //     reason: err instanceof Error ? err.message : "Unknown error",
    //   })
    // }
    // --- End original code ---
    } catch (err: unknown) {
      console.error("Timer control error:", err instanceof Error ? err.message : err)
      return res.status(503).json({
        error: "Timer control service unavailable",
      })
    }
    // --- END AI-MODIFIED ---
  },
})
