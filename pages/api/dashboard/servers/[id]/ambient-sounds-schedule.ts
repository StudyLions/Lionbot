// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: API route for Ambient Sounds schedule management.
//          GET returns all schedule slots for a guild.
//          POST creates a new slot. DELETE removes one.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const VALID_SOUNDS = ["rain", "campfire", "ocean", "brown_noise", "white_noise", "lofi"]
// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Support 10 sound bots instead of 5
const VALID_BOT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// --- END AI-MODIFIED ---

function serializeSlot(s: any) {
  return {
    schedule_id: s.schedule_id,
    guildid: s.guildid.toString(),
    bot_number: s.bot_number,
    sound_type: s.sound_type,
    start_time: typeof s.start_time === "string"
      ? s.start_time
      : (s.start_time as Date).toISOString().slice(11, 16),
    end_time: typeof s.end_time === "string"
      ? s.end_time
      : (s.end_time as Date).toISOString().slice(11, 16),
    days: s.days ?? [0, 1, 2, 3, 4, 5, 6],
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const schedules = await prisma.ambient_sounds_schedule.findMany({
      where: { guildid: guildId },
      orderBy: [{ bot_number: "asc" }, { start_time: "asc" }],
    })

    return res.status(200).json({
      schedules: schedules.map(serializeSlot),
    })
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { bot_number, sound_type, start_time, end_time, days } = req.body as {
      bot_number: number
      sound_type: string
      start_time: string
      end_time: string
      days?: number[]
    }

    if (!VALID_BOT_NUMBERS.includes(bot_number)) {
      throw new ValidationError("bot_number must be 1-5")
    }
    // --- AI-MODIFIED (2026-04-01) ---
    // Purpose: Accept lofi sub-mood types (lofi_chill, lofi_jazzy, etc.)
    if (!VALID_SOUNDS.includes(sound_type) && !sound_type.startsWith("lofi_")) {
      throw new ValidationError(`Invalid sound type: ${sound_type}`)
    }
    // --- END AI-MODIFIED ---
    if (!start_time || !end_time) {
      throw new ValidationError("start_time and end_time are required (HH:MM format)")
    }
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      throw new ValidationError("Times must be in HH:MM format (00:00 - 23:59)")
    }

    const validDays = days ?? [0, 1, 2, 3, 4, 5, 6]
    if (!Array.isArray(validDays) || validDays.some((d) => d < 0 || d > 6)) {
      throw new ValidationError("days must be an array of 0-6 (Mon-Sun)")
    }

    const startDate = new Date(`1970-01-01T${start_time}:00.000Z`)
    const endDate = new Date(`1970-01-01T${end_time}:00.000Z`)

    const slot = await prisma.ambient_sounds_schedule.create({
      data: {
        guildid: guildId,
        bot_number,
        sound_type,
        start_time: startDate,
        end_time: endDate,
        days: validDays,
      },
    })

    return res.status(201).json({ schedule: serializeSlot(slot) })
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const scheduleId = parseInt(req.body?.schedule_id ?? req.query.scheduleId, 10)
    if (isNaN(scheduleId)) {
      throw new ValidationError("schedule_id is required")
    }

    const existing = await prisma.ambient_sounds_schedule.findUnique({
      where: { schedule_id: scheduleId },
    })
    if (!existing || existing.guildid !== guildId) {
      throw new ValidationError("Schedule slot not found")
    }

    await prisma.ambient_sounds_schedule.delete({
      where: { schedule_id: scheduleId },
    })

    return res.status(200).json({ success: true })
  },
})
