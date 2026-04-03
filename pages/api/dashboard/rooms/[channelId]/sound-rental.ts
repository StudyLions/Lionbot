// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Member-facing API for sound bot rentals on private rooms.
//          GET: returns active rental + guild config for the room.
//          POST: rent a new sound bot (deducts LionCoins).
//          PATCH: extend an existing rental by additional hours.
//          DELETE: cancel an active rental early (no refund).
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const VALID_SOUNDS = ["rain", "campfire", "ocean", "brown_noise", "white_noise", "lofi"]

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, rented_members: { select: { userid: true } } },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })

    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const guildConfig = await prisma.ambient_sounds_guild_config.findUnique({
      where: { guildid: room.guildid },
    })

    const rental = await prisma.ambient_sounds_rentals.findFirst({
      where: { channelid: channelId, ended_at: null, expires_at: { gt: new Date() } },
      orderBy: { started_at: "desc" },
    })

    return res.status(200).json({
      rental: rental
        ? {
            rental_id: rental.rental_id,
            sound_type: rental.sound_type,
            bot_number: rental.bot_number,
            started_at: rental.started_at.toISOString(),
            expires_at: rental.expires_at.toISOString(),
            total_cost: rental.total_cost,
            userid: rental.userid.toString(),
          }
        : null,
      rentalEnabled: guildConfig?.room_rental_enabled ?? false,
      hourlyRate: guildConfig?.room_rental_hourly_rate ?? 10,
      isOwner,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { sound_type, hours } = req.body as { sound_type?: string; hours?: number }

    if (!sound_type || (!VALID_SOUNDS.includes(sound_type) && !sound_type.startsWith("lofi_"))) {
      throw new ValidationError("Invalid sound type")
    }
    const rentHours = Math.max(1, Math.min(24, hours ?? 1))

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, rented_members: { select: { userid: true } } },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })

    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const guildConfig = await prisma.ambient_sounds_guild_config.findUnique({
      where: { guildid: room.guildid },
    })
    if (!guildConfig?.room_rental_enabled) {
      throw new ValidationError("Sound bot rentals are not enabled in this server")
    }

    const existing = await prisma.ambient_sounds_rentals.findFirst({
      where: { channelid: channelId, ended_at: null, expires_at: { gt: new Date() } },
    })
    if (existing) {
      throw new ValidationError("This room already has an active sound bot rental")
    }

    const hourlyRate = guildConfig.room_rental_hourly_rate ?? 10
    const totalCost = hourlyRate * rentHours

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: room.guildid, userid: auth.userId } },
      select: { coins: true },
    })
    if (!member || member.coins < totalCost) {
      throw new ValidationError(
        `Not enough LionCoins. Need ${totalCost} but you have ${member?.coins ?? 0}.`
      )
    }

    const usedBots = await prisma.ambient_sounds_rentals.findMany({
      where: { guildid: room.guildid, ended_at: null, expires_at: { gt: new Date() } },
      select: { bot_number: true },
    })
    const adminBots = await prisma.ambient_sounds_config.findMany({
      where: { guildid: room.guildid, enabled: true },
      select: { bot_number: true },
    })
    const usedNums = new Set([
      ...usedBots.map((b) => b.bot_number),
      ...adminBots.map((b) => b.bot_number),
    ])
    let freeBotNum: number | null = null
    for (let i = 1; i <= 10; i++) {
      if (!usedNums.has(i)) { freeBotNum = i; break }
    }
    if (freeBotNum === null) {
      throw new ValidationError("All 10 sound bots are currently in use. Try again later.")
    }

    const expiresAt = new Date(Date.now() + rentHours * 3600_000)

    await prisma.$transaction([
      prisma.members.update({
        where: { guildid_userid: { guildid: room.guildid, userid: auth.userId } },
        data: { coins: { decrement: totalCost } },
      }),
      prisma.ambient_sounds_rentals.create({
        data: {
          guildid: room.guildid,
          channelid: channelId,
          userid: auth.userId,
          bot_number: freeBotNum,
          sound_type,
          expires_at: expiresAt,
          total_cost: totalCost,
        },
      }),
    ])

    return res.status(200).json({
      success: true,
      bot_number: freeBotNum,
      expires_at: expiresAt.toISOString(),
      total_cost: totalCost,
    })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { hours } = req.body as { hours?: number }
    const extendHours = Math.max(1, Math.min(24, hours ?? 1))

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, rented_members: { select: { userid: true } } },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })

    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const rental = await prisma.ambient_sounds_rentals.findFirst({
      where: { channelid: channelId, ended_at: null, expires_at: { gt: new Date() } },
    })
    if (!rental) {
      throw new ValidationError("No active rental to extend")
    }

    const guildConfig = await prisma.ambient_sounds_guild_config.findUnique({
      where: { guildid: room.guildid },
    })
    const hourlyRate = guildConfig?.room_rental_hourly_rate ?? 10
    const extendCost = hourlyRate * extendHours

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: room.guildid, userid: auth.userId } },
      select: { coins: true },
    })
    if (!member || member.coins < extendCost) {
      throw new ValidationError(
        `Not enough LionCoins. Need ${extendCost} but you have ${member?.coins ?? 0}.`
      )
    }

    const newExpiry = new Date(rental.expires_at.getTime() + extendHours * 3600_000)

    await prisma.$transaction([
      prisma.members.update({
        where: { guildid_userid: { guildid: room.guildid, userid: auth.userId } },
        data: { coins: { decrement: extendCost } },
      }),
      prisma.ambient_sounds_rentals.update({
        where: { rental_id: rental.rental_id },
        data: {
          expires_at: newExpiry,
          total_cost: { increment: extendCost },
        },
      }),
    ])

    return res.status(200).json({
      success: true,
      new_expires_at: newExpiry.toISOString(),
      extend_cost: extendCost,
    })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, rented_members: { select: { userid: true } } },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })

    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const rental = await prisma.ambient_sounds_rentals.findFirst({
      where: { channelid: channelId, ended_at: null, expires_at: { gt: new Date() } },
    })
    if (!rental) {
      throw new ValidationError("No active rental to cancel")
    }

    await prisma.ambient_sounds_rentals.update({
      where: { rental_id: rental.rental_id },
      data: { ended_at: new Date() },
    })

    return res.status(200).json({ success: true })
  },
})
