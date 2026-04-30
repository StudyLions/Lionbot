// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Ask the bot to mint (or rotate) a Discord invite for
//          this listing's server. Calls the bot's HTTP endpoint
//          on shard 0 (POST /listing/invite/create) with the
//          shared secret. The bot picks a suitable channel,
//          calls Discord's create_invite API, persists the new
//          code in server_listings.invite_code, and returns the
//          full URL so the editor can show it immediately.
//
//          Failure modes:
//            - 502: bot is unreachable (shard 0 down, network)
//            - 403: bot is missing the Create Invite permission
//                   in the guild -- the editor surfaces a clear
//                   instruction to grant it
//            - 404: bot is not in the guild
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { isListingPremiumGuild } from "@/utils/listingHelpers"

interface BotInviteResponse {
  ok: boolean
  invite_code?: string
  invite_url?: string
  error_code?: string
  error?: string
}

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isListingPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Server premium subscription required." })
    }

    const baseUrl = process.env.BOT_HTTP_URL
    const secret = process.env.BOT_HTTP_SHARED_SECRET
    if (!baseUrl || !secret) {
      return res.status(503).json({
        error: "Invite-management service is not configured. Please paste an invite manually for now.",
      })
    }

    let response: Response
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, "")}/listing/invite/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ guildid: guildId.toString() }),
      })
    } catch (err: any) {
      console.error("[regenerate-invite] bot unreachable:", err?.message || err)
      return res.status(502).json({
        error: "Couldn't reach Leo. Please try again in a moment.",
      })
    }

    let payload: BotInviteResponse
    try {
      payload = (await response.json()) as BotInviteResponse
    } catch {
      return res.status(502).json({ error: "Bad response from Leo." })
    }

    if (!response.ok || !payload.ok || !payload.invite_url) {
      // Map the bot's structured error_code to a user-friendly message.
      const code = payload.error_code
      let message = payload.error || "Failed to create invite."
      let status = response.status || 500
      if (code === "MISSING_PERMS") {
        message =
          "Leo doesn't have the Create Invite permission in your server. Please grant it from the server's role settings, then try again."
        status = 403
      } else if (code === "BOT_NOT_IN_GUILD") {
        message =
          "Leo isn't in this server anymore. Re-invite Leo and try again."
        status = 404
      } else if (code === "NO_CHANNELS") {
        message =
          "Leo couldn't find a text channel where it has permission to create invites. Please give it Create Invite on at least one channel."
        status = 403
      }
      return res.status(status).json({ error: message, code })
    }

    // Persist on the website side too -- the bot already wrote it but
    // we want a guaranteed read-after-write before responding to the
    // dashboard.
    await prisma.server_listings.update({
      where: { guildid: guildId },
      data: {
        invite_code: payload.invite_code,
        invite_managed: true,
        invite_last_rotated: new Date(),
      },
    }).catch(() => {/* listing may not exist yet -- bot still returned a URL */})

    return res.status(200).json({
      invite_code: payload.invite_code,
      invite_url: payload.invite_url,
    })
  },
})
