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

const VALID_SOUNDS = ["rain", "campfire", "ocean", "brown_noise", "white_noise", "lofi"]
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
    nickname_template: c.nickname_template ?? null,
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Include voting config fields in API response
    voting_enabled: c.voting_enabled ?? false,
    vote_cooldown_minutes: c.vote_cooldown_minutes ?? 30,
    // --- END AI-MODIFIED ---
    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Include current LoFi song info for dashboard display
    current_song_title: c.current_song_title ?? null,
    current_song_artist: c.current_song_artist ?? null,
    // --- END AI-MODIFIED ---
    updated_at: c.updated_at?.toISOString() ?? null,
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Also fetch heartbeat data for bot online/offline detection
    // Heartbeat query is non-fatal so a failure doesn't block the premium check
    const [configs, isPremium] = await Promise.all([
      prisma.ambient_sounds_config.findMany({
        where: { guildid: guildId },
        orderBy: { bot_number: "asc" },
      }),
      isPremiumGuild(guildId),
    ])

    const STALE_THRESHOLD_MS = 30_000
    const now = Date.now()
    const botStatus: Record<number, { online: boolean; username: string | null }> = {}
    try {
      const heartbeats = await (prisma as any).sounds_bot_heartbeat.findMany({
        orderBy: { bot_number: "asc" },
      })
      for (const hb of heartbeats) {
        const age = now - hb.last_seen.getTime()
        botStatus[hb.bot_number] = {
          online: age < STALE_THRESHOLD_MS,
          username: hb.bot_username,
        }
      }
    } catch (_) {}

    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Fetch available lofi moods from any bot heartbeat
    let lofiMoods: string[] = []
    try {
      const hbWithMoods = await (prisma as any).sounds_bot_heartbeat.findFirst({
        where: { lofi_moods: { isEmpty: false } },
        select: { lofi_moods: true },
      })
      if (hbWithMoods?.lofi_moods) lofiMoods = hbWithMoods.lofi_moods
    } catch (_) {}
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      isPremium,
      configs: configs.map(serializeConfig),
      botStatus,
      lofiMoods,
    })
    // --- END AI-MODIFIED ---
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Ambient Sounds requires a premium subscription" })
    }

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Accept voting_enabled and vote_cooldown_minutes in PATCH body
    const body = req.body as {
      bot_number: number
      sound_type?: string | null
      channelid?: string | null
      volume?: number
      enabled?: boolean
      nickname_template?: string | null
      voting_enabled?: boolean
      vote_cooldown_minutes?: number
    }
    // --- END AI-MODIFIED ---

    if (!body.bot_number || !VALID_BOT_NUMBERS.includes(body.bot_number)) {
      throw new ValidationError("bot_number must be 1–5")
    }

    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Accept lofi sub-mood types (lofi_chill, lofi_jazzy, etc.)
    if (body.sound_type !== undefined && body.sound_type !== null) {
      if (!VALID_SOUNDS.includes(body.sound_type) && !body.sound_type.startsWith("lofi_")) {
        throw new ValidationError(`Invalid sound type. Must be one of: ${VALID_SOUNDS.join(", ")}`)
      }
    }
    // --- END AI-MODIFIED ---

    if (body.volume !== undefined && !VALID_VOLUMES.includes(body.volume)) {
      throw new ValidationError("Volume must be 25 (Low), 50 (Medium), or 100 (High)")
    }

    const channelId = body.channelid ? parseBigInt(body.channelid, "channel ID") : null

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Support nickname_template field; validate length
    if (body.nickname_template !== undefined && body.nickname_template !== null) {
      if (body.nickname_template.length > 100) {
        throw new ValidationError("Nickname template must be 100 characters or less")
      }
    }

    const data: Record<string, any> = { updated_at: new Date() }
    if ("sound_type" in body) data.sound_type = body.sound_type ?? null
    if ("channelid" in body) data.channelid = channelId
    if ("volume" in body) data.volume = body.volume
    if ("enabled" in body) data.enabled = body.enabled
    if ("nickname_template" in body) data.nickname_template = body.nickname_template ?? null
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Handle voting config fields
    if ("voting_enabled" in body) data.voting_enabled = body.voting_enabled
    if ("vote_cooldown_minutes" in body) {
      const cd = body.vote_cooldown_minutes!
      if (cd < 1 || cd > 1440) throw new ValidationError("Vote cooldown must be 1–1440 minutes")
      data.vote_cooldown_minutes = cd
    }
    // --- END AI-MODIFIED ---

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
