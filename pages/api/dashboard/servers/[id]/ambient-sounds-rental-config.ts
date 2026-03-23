// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: API route for guild-level Ambient Sounds rental settings.
//          GET returns rental config. PATCH updates it.
//          Also returns active rentals for admin view.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const config = await prisma.ambient_sounds_guild_config.findUnique({
      where: { guildid: guildId },
    })

    const activeRentals = await prisma.ambient_sounds_rentals.findMany({
      where: { guildid: guildId, ended_at: null },
      orderBy: { started_at: "desc" },
    })

    return res.status(200).json({
      config: config
        ? {
            guildid: config.guildid.toString(),
            room_rental_enabled: config.room_rental_enabled,
            room_rental_hourly_rate: config.room_rental_hourly_rate,
          }
        : {
            guildid: guildId.toString(),
            room_rental_enabled: false,
            room_rental_hourly_rate: 10,
          },
      activeRentals: activeRentals.map((r) => ({
        rental_id: r.rental_id,
        channelid: r.channelid.toString(),
        userid: r.userid.toString(),
        bot_number: r.bot_number,
        sound_type: r.sound_type,
        started_at: r.started_at.toISOString(),
        expires_at: r.expires_at.toISOString(),
        total_cost: r.total_cost,
      })),
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { room_rental_enabled, room_rental_hourly_rate } = req.body as {
      room_rental_enabled?: boolean
      room_rental_hourly_rate?: number
    }

    if (
      room_rental_hourly_rate !== undefined &&
      (room_rental_hourly_rate < 1 || room_rental_hourly_rate > 10000)
    ) {
      throw new ValidationError("Hourly rate must be between 1 and 10,000 LionCoins")
    }

    const data: Record<string, any> = { updated_at: new Date() }
    if (room_rental_enabled !== undefined) data.room_rental_enabled = room_rental_enabled
    if (room_rental_hourly_rate !== undefined) data.room_rental_hourly_rate = room_rental_hourly_rate

    await prisma.ambient_sounds_guild_config.upsert({
      where: { guildid: guildId },
      create: {
        guildid: guildId,
        room_rental_enabled: room_rental_enabled ?? false,
        room_rental_hourly_rate: room_rental_hourly_rate ?? 10,
      },
      update: data,
    })

    return res.status(200).json({ success: true })
  },
})
