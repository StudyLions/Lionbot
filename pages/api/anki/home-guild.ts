// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Get/set the user's Anki "home guild" — the guild
//          that Anki review rewards attribute to.
//
//          GET  -> { current: { guild_id, name } | null, options: [...] }
//          POST -> body { guild_id } (string snowflake)  -> updates user_config.anki_home_guildid
//
//          Auth via NextAuth cookie (this is dashboard UI, not
//          an addon endpoint). The options list is filtered to
//          guilds where the bot is present AND the user is a
//          member.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/utils/prisma"
import {
  getUserGuilds,
  checkBotInGuild,
  type DiscordGuild,
} from "@/utils/adminAuth"

async function getSession(req: NextApiRequest) {
  const token = await getToken({
    req,
    secret: process.env.SECRET,
    cookieName: "__Secure-next-auth.session-token.v2",
  })
  if (!token?.discordId || !token?.accessToken) return null
  return {
    discordId: token.discordId as string,
    accessToken: token.accessToken as string,
  }
}

const SUPPORT_GUILD = {
  guildid: BigInt("780195610154237993"),
  name: "LionBot Support Server",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req)
  if (!session) {
    return res
      .status(401)
      .json({ error: "not_authenticated", message: "Sign in with Discord first" })
  }
  const userId = BigInt(session.discordId)

  if (req.method === "GET") {
    return handleGet(userId, session.accessToken, session.discordId, res)
  }
  if (req.method === "POST") {
    return handleSet(userId, req, res)
  }
  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "method_not_allowed", message: "GET or POST" })
}

async function handleGet(
  userId: bigint,
  accessToken: string,
  discordId: string,
  res: NextApiResponse
) {
  const cfg = await prisma.user_config.findUnique({
    where: { userid: userId },
    select: { anki_home_guildid: true },
  })
  const currentId = cfg?.anki_home_guildid ?? null

  // Resolve eligible options: guilds where the bot is present.
  // Try the Discord user-guilds API first; if it fails, just
  // surface the support guild + current.
  let guilds: DiscordGuild[] = []
  try {
    guilds = await getUserGuilds(accessToken, discordId)
  } catch (err) {
    console.warn("[anki/home-guild] getUserGuilds failed:", err)
  }

  // Filter to guilds where bot is present. This is two calls per
  // guild, so cap at the 25 most-relevant (Discord generally returns
  // them in their join order — we'll trust that and slice).
  const checkLimit = guilds.slice(0, 30)
  const presence = await Promise.all(
    checkLimit.map(async (g) => ({
      g,
      present: await checkBotInGuild(g.id).catch(() => false),
    }))
  )
  const eligible = presence.filter((p) => p.present).map((p) => p.g)

  // Always offer the support guild as a final fallback option.
  const supportInList = eligible.some(
    (g) => g.id === SUPPORT_GUILD.guildid.toString()
  )
  const options = supportInList
    ? eligible
    : [
        ...eligible,
        {
          id: SUPPORT_GUILD.guildid.toString(),
          name: SUPPORT_GUILD.name,
          icon: null,
          banner: null,
          permissions: "0",
        },
      ]

  let currentMeta: { guild_id: string; name: string } | null = null
  if (currentId) {
    const found = options.find((g) => g.id === currentId.toString())
    currentMeta = found
      ? { guild_id: found.id, name: found.name }
      : { guild_id: currentId.toString(), name: `Server ${currentId}` }
  }

  return res.status(200).json({
    current: currentMeta,
    is_default_fallback: !currentId,
    options: options.map((g) => ({
      guild_id: g.id,
      name: g.name,
      icon_hash: g.icon,
      member_count: g.approximate_member_count ?? null,
    })),
  })
}

async function handleSet(
  userId: bigint,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = (req.body || {}) as { guild_id?: string | null }
  let guildId: bigint | null = null
  if (body.guild_id !== null && body.guild_id !== undefined) {
    if (typeof body.guild_id !== "string" || !/^\d{17,20}$/.test(body.guild_id)) {
      return res
        .status(400)
        .json({ error: "bad_guild_id", message: "guild_id must be a Discord snowflake" })
    }
    try {
      guildId = BigInt(body.guild_id)
    } catch {
      return res
        .status(400)
        .json({ error: "bad_guild_id", message: "guild_id parse failed" })
    }
  }

  // Verify guild_config row exists for the chosen guild (defends
  // against a malicious POST setting an arbitrary snowflake).
  if (guildId !== null) {
    const exists = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { guildid: true },
    })
    if (!exists) {
      return res
        .status(400)
        .json({ error: "guild_not_found", message: "LionBot is not in that guild" })
    }
  }

  await prisma.user_config.update({
    where: { userid: userId },
    data: { anki_home_guildid: guildId },
  })

  return res.status(200).json({
    ok: true,
    current_guild_id: guildId?.toString() ?? null,
  })
}
