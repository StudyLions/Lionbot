// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Returns the bot's effective GUILD-LEVEL permission flags so the
//          Setup Checklist drawers can preflight "Bot needs Manage Webhooks
//          to enable this" warnings before the admin saves.
//
//          NOTE: Channel-specific permission overrides are NOT computed here
//          for the Phase 1 ship. A channel ID can be passed via ?channel_id=
//          in a future iteration and we'll layer overwrite logic on top.
//
//          Returned shape:
//            {
//              bot_present: boolean,
//              raw_bitfield: string,        // permission bitfield as a string (BigInt)
//              is_administrator: boolean,
//              perms: {
//                view_channel:    boolean,
//                send_messages:   boolean,
//                embed_links:     boolean,
//                attach_files:    boolean,
//                mention_everyone:boolean,
//                manage_webhooks: boolean,
//                manage_roles:    boolean,
//                manage_channels: boolean,
//                manage_messages: boolean,
//                move_members:    boolean,
//                connect:         boolean,
//                speak:           boolean,
//              }
//            }
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const BOT_USER_ID = process.env.DISCORD_CLIENT_ID

// Discord permission bit constants (raw values, not bit shifts, for readability)
const PERMS = {
  view_channel:     0x0000000000000400n,
  send_messages:    0x0000000000000800n,
  embed_links:      0x0000000000004000n,
  attach_files:     0x0000000000008000n,
  mention_everyone: 0x0000000000020000n,
  manage_webhooks:  0x0000000020000000n,
  manage_roles:     0x0000000010000000n,
  manage_channels:  0x0000000000000010n,
  manage_messages:  0x0000000000002000n,
  move_members:     0x0000000001000000n,
  connect:          0x0000000000100000n,
  speak:            0x0000000000200000n,
  administrator:    0x0000000000000008n,
}

interface CachedResult {
  payload: object
  expiresAt: number
}
const cache = new Map<string, CachedResult>()
// 60s TTL is plenty for setup; admins typically tweak Discord roles in a
// separate tab and re-check after ~10 seconds anyway.
const CACHE_TTL_MS = 60_000

async function discordGet(url: string): Promise<Response> {
  let res = await fetch(url, { headers: { Authorization: `Bot ${BOT_TOKEN}` } })
  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    res = await fetch(url, { headers: { Authorization: `Bot ${BOT_TOKEN}` } })
  }
  return res
}

export default apiHandler({
  async GET(req: NextApiRequest, res: NextApiResponse) {
    if (!BOT_TOKEN || !BOT_USER_ID) {
      return res.status(500).json({ error: "Bot is not configured for permission preflight." })
    }

    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const cacheKey = guildId.toString()
    if (req.query.refresh !== "true") {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) {
        return res.status(200).json(cached.payload)
      }
    }

    // 1. Bot's roles in this guild
    const memberRes = await discordGet(
      `https://discord.com/api/v10/guilds/${guildId}/members/${BOT_USER_ID}`,
    )
    if (memberRes.status === 404) {
      const payload = { bot_present: false, raw_bitfield: "0", is_administrator: false, perms: {} }
      cache.set(cacheKey, { payload, expiresAt: Date.now() + CACHE_TTL_MS })
      return res.status(200).json(payload)
    }
    if (!memberRes.ok) {
      console.error(`bot-permissions: members API ${memberRes.status}`, await memberRes.text().catch(() => ""))
      return res.status(502).json({ error: "Couldn't reach Discord. Try again in a moment." })
    }
    const memberData = (await memberRes.json()) as { roles: string[] }

    // 2. Guild roles (with permission bitfields). Includes @everyone (id == guildId).
    const rolesRes = await discordGet(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
    )
    if (!rolesRes.ok) {
      console.error(`bot-permissions: roles API ${rolesRes.status}`, await rolesRes.text().catch(() => ""))
      return res.status(502).json({ error: "Couldn't reach Discord. Try again in a moment." })
    }
    const allRoles = (await rolesRes.json()) as Array<{ id: string; permissions: string }>

    // 3. Effective bot perms = OR of @everyone + all bot's own roles.
    const botRoleIds = new Set([guildId.toString(), ...memberData.roles])
    let effective = 0n
    for (const role of allRoles) {
      if (botRoleIds.has(role.id)) {
        effective |= BigInt(role.permissions)
      }
    }

    const isAdmin = (effective & PERMS.administrator) === PERMS.administrator
    // Admin grants every permission flag, so short-circuit the per-flag check.
    const has = (flag: bigint) => isAdmin || (effective & flag) === flag

    const payload = {
      bot_present: true,
      raw_bitfield: effective.toString(),
      is_administrator: isAdmin,
      perms: {
        view_channel:     has(PERMS.view_channel),
        send_messages:    has(PERMS.send_messages),
        embed_links:      has(PERMS.embed_links),
        attach_files:     has(PERMS.attach_files),
        mention_everyone: has(PERMS.mention_everyone),
        manage_webhooks:  has(PERMS.manage_webhooks),
        manage_roles:     has(PERMS.manage_roles),
        manage_channels:  has(PERMS.manage_channels),
        manage_messages:  has(PERMS.manage_messages),
        move_members:     has(PERMS.move_members),
        connect:          has(PERMS.connect),
        speak:            has(PERMS.speak),
      },
    }

    cache.set(cacheKey, { payload, expiresAt: Date.now() + CACHE_TTL_MS })
    return res.status(200).json(payload)
  },
})
