// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Fetch Discord guild channels via bot token for channel selectors
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireModerator } from "@/utils/adminAuth"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

interface DiscordChannel {
  id: string
  name: string
  type: number
  position: number
  parent_id: string | null
}

const cache = new Map<string, { data: DiscordChannel[]; expiresAt: number }>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "Bot token not configured" })
  }

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: return 400 on invalid guild id (no apiHandler here)
  let guildId: bigint
  try {
    guildId = BigInt(req.query.id as string)
  } catch {
    return res.status(400).json({ error: "Invalid guild ID" })
  }
  // --- END AI-MODIFIED ---
  const auth = await requireModerator(req, res, guildId)
  if (!auth) return

  // --- AI-MODIFIED (2026-04-04) ---
  // Reason: 5-min cache caused newly added channels to not appear after refresh
  // What the new code does better: 30s TTL + ?refresh=true bypass
  // --- Original code (commented out for rollback) ---
  // const cacheKey = guildId.toString()
  // const cached = cache.get(cacheKey)
  // if (cached && Date.now() < cached.expiresAt) {
  //   return res.status(200).json(cached.data)
  // }
  // --- End original code ---
  const cacheKey = guildId.toString()
  const forceRefresh = req.query.refresh === "true"
  if (!forceRefresh) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return res.status(200).json(cached.data)
    }
  }
  // --- END AI-MODIFIED ---

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    )

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: handle Discord 429 rate limits with retry
    if (response.status === 429) {
      const retryAfter = parseFloat(response.headers.get("retry-after") || "2")
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      const retry = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
      )
      if (!retry.ok) {
        return res.status(retry.status).json({ error: "Discord rate limited" })
      }
      const retryRaw = await retry.json()
      const retryChannels: DiscordChannel[] = retryRaw.map((ch: any) => ({
        id: ch.id, name: ch.name, type: ch.type, position: ch.position, parent_id: ch.parent_id,
      }))
      cache.set(cacheKey, { data: retryChannels, expiresAt: Date.now() + 30000 })
      return res.status(200).json(retryChannels)
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Don't leak raw Discord API error text to client
    if (!response.ok) {
      console.error(`Discord channels API error (${response.status}):`, await response.text().catch(() => ""))
      return res.status(response.status).json({ error: "Failed to fetch channels from Discord" })
    }
    // --- END AI-MODIFIED ---

    const raw = await response.json()
    const channels: DiscordChannel[] = raw.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type,
      position: ch.position,
      parent_id: ch.parent_id,
    }))

    cache.set(cacheKey, { data: channels, expiresAt: Date.now() + 30000 })
    res.status(200).json(channels)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch channels from Discord" })
  }
}
