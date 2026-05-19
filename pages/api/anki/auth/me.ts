// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Validate an Anki bearer JWT and return a snapshot of
//          the user, home guild, and pet basics. Used by the
//          addon on cold start to confirm the cached session is
//          still good and to refresh display state without
//          asking for a full pet portrait.
//
//          Unlike the iOS /me endpoint, this does NOT call
//          Discord for fresh username/avatar — the Anki bearer
//          carries no Discord token (intentional scope
//          reduction). We surface user_config.name +
//          avatar_hash, which the bot keeps reasonably fresh.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import { isLionheartActive } from "../../auth/ios/exchange"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "method_not_allowed", message: "GET only" })
  }

  // /me doesn't require a specific scope — just a valid bearer.
  const ctx = await requireAnkiAuth(req, res)
  if (!ctx) return

  let cfg: {
    name: string | null
    avatar_hash: string | null
    anki_home_guildid: bigint | null
    first_seen: Date | null
    lg_pets: {
      pet_name: string
      level: number
      xp: bigint
      food: number
      bath: number
      sleep: number
      expression: string
    } | null
  } | null = null

  try {
    cfg = await prisma.user_config.findUnique({
      where: { userid: ctx.userId },
      select: {
        name: true,
        avatar_hash: true,
        anki_home_guildid: true,
        first_seen: true,
        lg_pets: {
          select: {
            pet_name: true,
            level: true,
            xp: true,
            food: true,
            bath: true,
            sleep: true,
            expression: true,
          },
        },
      },
    })
  } catch (err) {
    console.error("[anki/me] user_config lookup failed:", err)
    return res.status(503).json({
      error: "db_unavailable",
      message: "Could not load user state",
    })
  }

  let isPremium = false
  try {
    isPremium = await isLionheartActive(ctx.discordId)
  } catch (err) {
    console.warn("[anki/me] premium lookup failed:", err)
  }

  return res.status(200).json({
    user: {
      discord_id: ctx.discordId,
      username: cfg?.name || ctx.discordId,
      avatar_hash: cfg?.avatar_hash || null,
      is_premium: isPremium,
      first_seen: cfg?.first_seen?.toISOString() || null,
    },
    device: {
      device_id: ctx.device.deviceId,
      device_name: ctx.device.deviceName,
      addon_version: ctx.device.addonVersion,
      os_platform: ctx.device.osPlatform,
      anki_version: ctx.device.ankiVersion,
      created_at: ctx.device.createdAt.toISOString(),
      last_seen_at: ctx.device.lastSeenAt.toISOString(),
      scopes: ctx.scopes,
    },
    home_guild_id: cfg?.anki_home_guildid?.toString() || null,
    pet: cfg?.lg_pets
      ? {
          pet_name: cfg.lg_pets.pet_name,
          level: cfg.lg_pets.level,
          xp: cfg.lg_pets.xp.toString(),
          food: cfg.lg_pets.food,
          bath: cfg.lg_pets.bath,
          sleep: cfg.lg_pets.sleep,
          expression: cfg.lg_pets.expression,
        }
      : null,
  })
}
