// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: List all private rooms the user owns or is a member of,
//          grouped by server, with health/expiry data and nav badge info
// ============================================================
// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Added walletBalanceByGuild, frozenAt, and voiceOccupants
//          fields to support the redesigned rooms dashboard
// --- END AI-MODIFIED ---
import { apiHandler } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId

    const [ownedRooms, memberRows] = await Promise.all([
      prisma.rented_rooms.findMany({
        where: { ownerid: userId },
        include: {
          rented_members: { select: { userid: true } },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.rented_members.findMany({
        where: { userid: userId },
        select: { channelid: true },
      }),
    ])

    const memberChannelIds = memberRows
      .map((m) => m.channelid)
      .filter((cid) => !ownedRooms.some((r) => r.channelid === cid))

    let memberRooms: typeof ownedRooms = []
    if (memberChannelIds.length > 0) {
      memberRooms = await prisma.rented_rooms.findMany({
        where: { channelid: { in: memberChannelIds } },
        include: {
          rented_members: { select: { userid: true } },
        },
        orderBy: { created_at: "desc" },
      })
    }

    const allRooms = [...ownedRooms, ...memberRooms]
    const guildIds = allRooms
      .map((r) => r.guildid)
      .filter((gid, i, arr) => arr.findIndex((g) => g === gid) === i)

    // --- AI-MODIFIED (2026-04-03) ---
    // Purpose: Fetch guild configs with auto_extend flag and user wallet balances
    const [guildConfigs, walletRows, voiceOngoing] = await Promise.all([
      prisma.guild_config.findMany({
        where: { guildid: { in: guildIds } },
        select: {
          guildid: true,
          name: true,
          renting_price: true,
          renting_cap: true,
        },
      }),
      prisma.members.findMany({
        where: {
          userid: userId,
          guildid: { in: guildIds },
        },
        select: { guildid: true, coins: true },
      }),
      prisma.voice_sessions_ongoing.findMany({
        where: {
          channelid: { in: allRooms.filter((r) => !r.deleted_at).map((r) => r.channelid) },
        },
        select: { channelid: true },
      }),
    ])
    // --- END AI-MODIFIED ---

    const guildMap = new Map(guildConfigs.map((g) => [g.guildid.toString(), g]))
    const voiceByChannel = new Map<string, number>()
    for (const v of voiceOngoing) {
      const key = v.channelid.toString()
      voiceByChannel.set(key, (voiceByChannel.get(key) ?? 0) + 1)
    }

    const walletBalanceByGuild: Record<string, number> = {}
    for (const w of walletRows) {
      walletBalanceByGuild[w.guildid.toString()] = w.coins
    }

    const activeRooms = allRooms.filter((r) => !r.deleted_at)
    const expiredRooms = allRooms.filter((r) => !!r.deleted_at)

    function buildRoomCard(room: (typeof allRooms)[0]) {
      const guild = guildMap.get(room.guildid.toString())
      const rentPrice = guild?.renting_price ?? 1000
      const memberCap = guild?.renting_cap ?? 25
      const daysRemaining =
        rentPrice > 0 ? Math.floor(room.coin_balance / rentPrice) : 999
      const isOwner = room.ownerid === userId
      const memberCount = (room.rented_members?.length ?? 0) + 1
      const nextTick = room.last_tick
        ? new Date(
            new Date(room.last_tick).getTime() + 24 * 60 * 60 * 1000
          ).toISOString()
        : room.created_at
          ? new Date(
              new Date(room.created_at).getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          : null

      return {
        channelId: room.channelid.toString(),
        guildId: room.guildid.toString(),
        guildName: guild?.name || "Unknown Server",
        name: room.name || null,
        coinBalance: room.coin_balance,
        rentPrice,
        daysRemaining,
        memberCount,
        memberCap,
        isOwner,
        ownerId: room.ownerid.toString(),
        createdAt: room.created_at?.toISOString() ?? null,
        deletedAt: room.deleted_at?.toISOString() ?? null,
        nextTick,
        isExpiring: daysRemaining < 1,
        frozenAt: room.frozen_at?.toISOString() ?? null,
        voiceOccupants: voiceByChannel.get(room.channelid.toString()) ?? 0,
      }
    }

    const activeCards = activeRooms.map(buildRoomCard)
    const expiredCards = expiredRooms.map(buildRoomCard)

    const grouped: Record<
      string,
      { guildId: string; guildName: string; rooms: typeof activeCards }
    > = {}
    for (const card of activeCards) {
      if (!grouped[card.guildId]) {
        grouped[card.guildId] = {
          guildId: card.guildId,
          guildName: card.guildName,
          rooms: [],
        }
      }
      grouped[card.guildId].rooms.push(card)
    }

    const hasExpiringRooms = activeCards.some(
      (c) => c.daysRemaining <= 2 && !c.deletedAt
    )

    res.status(200).json({
      servers: Object.values(grouped),
      expiredRooms: expiredCards,
      hasExpiringRooms,
      totalActiveRooms: activeCards.length,
      walletBalanceByGuild,
    })
  },
})
