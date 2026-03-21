// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Fetch Discord guild roles via bot token for role selectors
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add POST handler to create Discord roles via bot token
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  managed: boolean
}

const cache = new Map<string, { data: DiscordRole[]; expiresAt: number }>()

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add POST handler for role creation; wrap GET in apiHandler pattern
export default apiHandler({
  async GET(req, res) {
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "Bot token not configured" })
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: validate guild id from query via parseBigInt (400 on invalid)
  const guildId = parseBigInt(req.query.id, "id")
  // --- END AI-MODIFIED ---
  const auth = await requireModerator(req, res, guildId)
  if (!auth) return

  const cacheKey = guildId.toString()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return res.status(200).json(cached.data)
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    )

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: handle Discord 429 rate limits with retry
    if (response.status === 429) {
      const retryAfter = parseFloat(response.headers.get("retry-after") || "2")
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      const retry = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
      )
      if (!retry.ok) {
        return res.status(retry.status).json({ error: "Discord rate limited" })
      }
      const retryRaw = await retry.json()
      const retryRoles: DiscordRole[] = retryRaw.map((r: any) => ({
        id: r.id, name: r.name, color: r.color, position: r.position, managed: r.managed,
      }))
      cache.set(cacheKey, { data: retryRoles, expiresAt: Date.now() + 300000 })
      return res.status(200).json(retryRoles)
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Don't leak raw Discord API error text to client
    if (!response.ok) {
      console.error(`Discord roles API error (${response.status}):`, await response.text().catch(() => ""))
      return res.status(response.status).json({ error: "Failed to fetch roles from Discord" })
    }
    // --- END AI-MODIFIED ---

    const raw = await response.json()
    const roles: DiscordRole[] = raw.map((r: any) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      position: r.position,
      managed: r.managed,
    }))

    cache.set(cacheKey, { data: roles, expiresAt: Date.now() + 300000 })
    res.status(200).json(roles)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles from Discord" })
  }
  },
  async POST(req, res) {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "Bot token not configured" })
    }
    // --- AI-MODIFIED (2026-03-20) ---
    const guildId = parseBigInt(req.query.id, "id")
    // --- END AI-MODIFIED ---
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { name, color } = req.body
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name (non-empty string) is required" })
    }
    const colorNum = typeof color === "number" ? color : parseInt(String(color), 10)
    if (isNaN(colorNum) || colorNum < 0 || colorNum > 0xffffff) {
      return res.status(400).json({ error: "color must be a number 0-16777215" })
    }

    try {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${guildId.toString()}/roles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name.trim(), color: colorNum }),
        }
      )
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Don't leak raw Discord API error text to client
      if (!response.ok) {
        console.error(`Discord create role API error (${response.status}):`, await response.text().catch(() => ""))
        return res.status(response.status).json({ error: "Failed to create role on Discord" })
      }
      // --- END AI-MODIFIED ---
      const role = await response.json()
      cache.delete(guildId.toString())
      return res.status(201).json({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        managed: role.managed,
      })
    } catch (err) {
      return res.status(500).json({ error: "Failed to create role" })
    }
  },
})
// --- END AI-MODIFIED ---
