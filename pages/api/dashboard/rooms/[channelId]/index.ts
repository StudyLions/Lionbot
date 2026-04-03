// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Room detail API (GET), room rename (PATCH), close room (DELETE).
//          Returns full room data, members with avatars + voice indicators,
//          study leaderboard, activity feed, wallet balance, freeze status.
// ============================================================
// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Added walletBalance, isInVoice per member, frozenAt,
//          autoExtendEnabled to support redesigned rooms dashboard
// --- END AI-MODIFIED ---
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

function discordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}`
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      include: {
        rented_members: { select: { userid: true } },
      },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    const allMemberIds = [room.ownerid, ...room.rented_members.map((m) => m.userid)]
    const isOwner = room.ownerid === auth.userId
    const isMember = room.rented_members.some((m) => m.userid === auth.userId)
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: room.guildid },
      select: {
        name: true,
        renting_price: true,
        renting_cap: true,
        renting_auto_extend: true,
      },
    })

    const rentPrice = guildConfig?.renting_price ?? 1000
    const memberCap = guildConfig?.renting_cap ?? 25
    const daysRemaining = rentPrice > 0 ? Math.floor(room.coin_balance / rentPrice) : 999
    const nextTick = room.last_tick
      ? new Date(new Date(room.last_tick).getTime() + 24 * 60 * 60 * 1000)
      : room.created_at
        ? new Date(new Date(room.created_at).getTime() + 24 * 60 * 60 * 1000)
        : null

    const timerRow = await prisma.timers.findUnique({
      where: { channelid: channelId },
      select: {
        channelid: true,
        focus_length: true,
        break_length: true,
        auto_restart: true,
        last_started: true,
        inactivity_threshold: true,
        channel_name: true,
        pretty_name: true,
        voice_alerts: true,
      },
    })

    const [userConfigs, memberDataRows, studyStats, recentSessions, walletRow, voiceOngoing] =
      await Promise.all([
        prisma.user_config.findMany({
          where: { userid: { in: allMemberIds } },
          select: { userid: true, name: true, avatar_hash: true },
        }),
        prisma.members.findMany({
          where: { guildid: room.guildid, userid: { in: allMemberIds } },
          select: { userid: true, display_name: true, coins: true },
        }),
        prisma.voice_sessions.groupBy({
          by: ["userid"],
          where: { channelid: channelId, userid: { in: allMemberIds } },
          _sum: { duration: true },
          orderBy: { _sum: { duration: "desc" } },
        }),
        prisma.voice_sessions.findMany({
          where: { channelid: channelId },
          orderBy: { start_time: "desc" },
          take: 30,
          select: {
            userid: true,
            start_time: true,
            duration: true,
            tag: true,
          },
        }),
        prisma.members.findUnique({
          where: {
            guildid_userid: { guildid: room.guildid, userid: auth.userId },
          },
          select: { coins: true },
        }),
        prisma.voice_sessions_ongoing.findMany({
          where: { channelid: channelId },
          select: { userid: true },
        }),
      ])

    const userConfigMap = new Map(userConfigs.map((u) => [u.userid.toString(), u]))
    const memberMap = new Map(memberDataRows.map((m) => [m.userid.toString(), m]))
    const studyMap = new Map(
      studyStats.map((s) => [s.userid.toString(), s._sum.duration ?? 0])
    )
    const voiceUserIds = new Set(voiceOngoing.map((v) => v.userid.toString()))

    const members = allMemberIds.map((uid) => {
      const uidStr = uid.toString()
      const uc = userConfigMap.get(uidStr)
      const mem = memberMap.get(uidStr)
      const totalSeconds = studyMap.get(uidStr) ?? 0
      return {
        userId: uidStr,
        displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
        avatarUrl: discordAvatarUrl(uidStr, uc?.avatar_hash ?? null),
        isOwner: uid === room.ownerid,
        totalStudySeconds: totalSeconds,
        coinBalance: mem?.coins ?? 0,
        isInVoice: voiceUserIds.has(uidStr),
      }
    })

    members.sort((a, b) => b.totalStudySeconds - a.totalStudySeconds)

    const activityFeed = recentSessions.map((s) => {
      const uidStr = s.userid.toString()
      const uc = userConfigMap.get(uidStr)
      const mem = memberMap.get(uidStr)
      return {
        type: "study_session" as const,
        userId: uidStr,
        displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
        timestamp: s.start_time.toISOString(),
        durationSeconds: s.duration,
        tag: s.tag,
      }
    })

    res.status(200).json({
      channelId: room.channelid.toString(),
      guildId: room.guildid.toString(),
      guildName: guildConfig?.name || "Unknown Server",
      name: room.name || null,
      coinBalance: room.coin_balance,
      rentPrice,
      daysRemaining,
      memberCap,
      isOwner,
      isMember,
      ownerId: room.ownerid.toString(),
      createdAt: room.created_at?.toISOString() ?? null,
      deletedAt: room.deleted_at?.toISOString() ?? null,
      nextTick: nextTick?.toISOString() ?? null,
      members,
      activityFeed,
      timer: timerRow
        ? {
            focusMinutes: Math.round(timerRow.focus_length / 60),
            breakMinutes: Math.round(timerRow.break_length / 60),
            autoRestart: timerRow.auto_restart ?? false,
            isRunning: !!timerRow.last_started,
            lastStarted: timerRow.last_started?.toISOString() ?? null,
            inactivityThreshold: timerRow.inactivity_threshold,
            voiceAlerts: timerRow.voice_alerts ?? true,
          }
        : null,
      walletBalance: walletRow?.coins ?? 0,
      frozenAt: room.frozen_at?.toISOString() ?? null,
      autoExtendEnabled: guildConfig?.renting_auto_extend ?? false,
    })
  },

  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, deleted_at: true },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    if (room.deleted_at) {
      return res.status(400).json({ error: "This room has expired" })
    }
    if (room.ownerid !== auth.userId) {
      return res.status(403).json({ error: "Only the room owner can rename" })
    }

    const { name } = req.body
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ error: "Name must be 1-100 characters" })
    }

    const updated = await prisma.rented_rooms.update({
      where: { channelid: channelId },
      data: { name: name.trim() },
      select: { name: true },
    })

    res
      .status(200)
      .json({
        name: updated.name,
        message: "Name saved. Will sync to Discord within a few minutes.",
      })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, coin_balance: true, deleted_at: true },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    if (room.deleted_at) {
      return res.status(400).json({ error: "This room is already closed" })
    }
    if (room.ownerid !== auth.userId) {
      return res.status(403).json({ error: "Only the room owner can close the room" })
    }

    const refundAmount = room.coin_balance

    await prisma.$transaction([
      prisma.rented_rooms.update({
        where: { channelid: channelId },
        data: { deleted_at: new Date() },
      }),
      ...(refundAmount > 0
        ? [
            prisma.members.update({
              where: {
                guildid_userid: {
                  guildid: room.guildid,
                  userid: room.ownerid,
                },
              },
              data: { coins: { increment: refundAmount } },
            }),
          ]
        : []),
    ])

    res.status(200).json({
      message: "Room closed successfully",
      refunded: refundAmount,
    })
  },
})
