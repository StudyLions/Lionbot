// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: API route for Ambient Sounds Bot configuration.
//          GET returns all 5 bot slot configs + premium status.
//          PATCH updates a specific bot slot (admin + premium only).
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const VALID_SOUNDS = ["rain", "campfire", "ocean", "brown_noise", "white_noise"]
const VALID_VOLUMES = [25, 50, 100]
const VALID_BOT_NUMBERS = [1, 2, 3, 4, 5]

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

function serializeConfig(c: any) {
  return {
    guildid: c.guildid.toString(),
    bot_number: c.bot_number,
    sound_type: c.sound_type,
    channelid: c.channelid?.toString() ?? null,
    volume: c.volume,
    enabled: c.enabled,
    status: c.status,
    error_msg: c.error_msg,
    updated_at: c.updated_at?.toISOString() ?? null,
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const [configs, isPremium] = await Promise.all([
      prisma.ambient_sounds_config.findMany({
        where: { guildid: guildId },
        orderBy: { bot_number: "asc" },
      }),
      isPremiumGuild(guildId),
    ])

    return res.status(200).json({
      isPremium,
      configs: configs.map(serializeConfig),
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Ambient Sounds requires a premium subscription" })
    }

    const body = req.body as {
      bot_number: number
      sound_type?: string | null
      channelid?: string | null
      volume?: number
      enabled?: boolean
    }

    if (!body.bot_number || !VALID_BOT_NUMBERS.includes(body.bot_number)) {
      throw new ValidationError("bot_number must be 1–5")
    }

    if (body.sound_type !== undefined && body.sound_type !== null) {
      if (!VALID_SOUNDS.includes(body.sound_type)) {
        throw new ValidationError(`Invalid sound type. Must be one of: ${VALID_SOUNDS.join(", ")}`)
      }
    }

    if (body.volume !== undefined && !VALID_VOLUMES.includes(body.volume)) {
      throw new ValidationError("Volume must be 25 (Low), 50 (Medium), or 100 (High)")
    }

    const channelId = body.channelid ? parseBigInt(body.channelid, "channel ID") : null

    const data: Record<string, any> = { updated_at: new Date() }
    if ("sound_type" in body) data.sound_type = body.sound_type ?? null
    if ("channelid" in body) data.channelid = channelId
    if ("volume" in body) data.volume = body.volume
    if ("enabled" in body) data.enabled = body.enabled

    await prisma.ambient_sounds_config.upsert({
      where: {
        guildid_bot_number: { guildid: guildId, bot_number: body.bot_number },
      },
      create: {
        guildid: guildId,
        bot_number: body.bot_number,
        sound_type: data.sound_type ?? null,
        channelid: data.channelid ?? null,
        volume: data.volume ?? 50,
        enabled: data.enabled ?? true,
        status: "pending",
        updated_at: new Date(),
      },
      update: data,
    })

    return res.status(200).json({ success: true })
  },
})
