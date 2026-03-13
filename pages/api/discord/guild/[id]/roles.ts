// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Fetch Discord guild roles via bot token for role selectors
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireModerator } from "@/utils/adminAuth"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  managed: boolean
}

const cache = new Map<string, { data: DiscordRole[]; expiresAt: number }>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "Bot token not configured" })
  }

  const guildId = BigInt(req.query.id as string)
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

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: `Discord API error: ${text}` })
    }

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
}
