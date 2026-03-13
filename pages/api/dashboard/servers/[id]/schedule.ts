// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Schedule configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"

const EDITABLE_FIELDS = [
  "lobby_channel",
  "room_channel",
  "schedule_cost",
  "reward",
  "bonus_reward",
  "min_attendance",
  "blacklist_role",
  "blacklist_after",
] as const

const DEFAULTS = {
  lobby_channel: null as bigint | null,
  room_channel: null as bigint | null,
  schedule_cost: null as number | null,
  reward: null as number | null,
  bonus_reward: null as number | null,
  min_attendance: null as number | null,
  blacklist_role: null as bigint | null,
  blacklist_after: null as number | null,
}

function toResponse(config: typeof DEFAULTS | null, scheduleChannels: { channelid: bigint }[]) {
  const c = config || DEFAULTS
  return {
    lobby_channel: c.lobby_channel?.toString() ?? null,
    room_channel: c.room_channel?.toString() ?? null,
    schedule_cost: c.schedule_cost,
    reward: c.reward,
    bonus_reward: c.bonus_reward,
    min_attendance: c.min_attendance,
    blacklist_role: c.blacklist_role?.toString() ?? null,
    blacklist_after: c.blacklist_after,
    schedule_channels: scheduleChannels.map((ch) => ({ channelid: ch.channelid.toString() })),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guildId = BigInt(req.query.id as string)

  if (req.method === "GET") {
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const guild = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { guildid: true },
    })
    if (!guild) return res.status(404).json({ error: "Server not found" })

    const config = await prisma.schedule_guild_config.findUnique({
      where: { guildid: guildId },
      include: { schedule_channels: true },
    })

    const scheduleChannels = config?.schedule_channels ?? []
    const payload = toResponse(config, scheduleChannels)

    return res.status(200).json(payload)
  }

  if (req.method === "PATCH") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const guild = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { guildid: true },
    })
    if (!guild) return res.status(404).json({ error: "Server not found" })

    const updates: Record<string, unknown> = {}
    const body = req.body

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        const val = body[field]
        if (val === null || val === undefined || val === "") {
          updates[field] = null
        } else if (field === "lobby_channel" || field === "room_channel" || field === "blacklist_role") {
          updates[field] = BigInt(val)
        } else {
          updates[field] = typeof val === "number" ? val : parseInt(val, 10)
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    const config = await prisma.schedule_guild_config.upsert({
      where: { guildid: guildId },
      create: { guildid: guildId, ...updates },
      update: updates,
      include: { schedule_channels: true },
    })

    const payload = toResponse(config, config.schedule_channels)

    return res.status(200).json(payload)
  }

  return res.status(405).json({ error: "Method not allowed" })
}
