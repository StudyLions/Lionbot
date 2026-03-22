// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Admin room actions API -- PATCH for rename, adjust balance,
//          transfer ownership, freeze/unfreeze, extend free; DELETE for
//          force close. All actions are audit-logged.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin, requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function discordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}`
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      include: {
        rented_members: { select: { userid: true, contribution: true } },
      },
    })

    if (!room || room.guildid !== guildId) {
      return res.status(404).json({ error: "Room not found in this server" })
    }

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { renting_price: true, renting_cap: true },
    })
    const rentPrice = guildConfig?.renting_price ?? 1000
    const memberCap = guildConfig?.renting_cap ?? 25

    const allMemberIds = [room.ownerid, ...room.rented_members.map((m) => m.userid)]
    const [userConfigs, memberRows, studyStats, recentSessions, ongoingSessions] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: allMemberIds } },
        select: { userid: true, name: true, avatar_hash: true },
      }),
      prisma.members.findMany({
        where: { guildid: guildId, userid: { in: allMemberIds } },
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
        select: { userid: true, start_time: true, duration: true, tag: true },
      }),
      prisma.voice_sessions_ongoing.findMany({
        where: { channelid: channelId },
        select: { userid: true },
      }),
    ])

    const ucMap = new Map(userConfigs.map((u) => [u.userid.toString(), u]))
    const memMap = new Map(memberRows.map((m) => [m.userid.toString(), m]))
    const studyMap = new Map(studyStats.map((s) => [s.userid.toString(), s._sum.duration ?? 0]))
    const contribMap = new Map(room.rented_members.map((m) => [m.userid.toString(), m.contribution]))
    const liveSet = new Set(ongoingSessions.map((s) => s.userid.toString()))

    const members = allMemberIds.map((uid) => {
      const uidStr = uid.toString()
      const uc = ucMap.get(uidStr)
      const mem = memMap.get(uidStr)
      return {
        userId: uidStr,
        displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
        avatarUrl: discordAvatarUrl(uidStr, uc?.avatar_hash ?? null),
        isOwner: uid === room.ownerid,
        totalStudySeconds: studyMap.get(uidStr) ?? 0,
        contribution: uid === room.ownerid ? 0 : (contribMap.get(uidStr) ?? 0),
        coinBalance: mem?.coins ?? 0,
        isLive: liveSet.has(uidStr),
      }
    })
    members.sort((a, b) => b.totalStudySeconds - a.totalStudySeconds)

    const activityFeed = recentSessions.map((s) => {
      const uidStr = s.userid.toString()
      const uc = ucMap.get(uidStr)
      const mem = memMap.get(uidStr)
      return {
        type: "study_session" as const,
        userId: uidStr,
        displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
        timestamp: s.start_time.toISOString(),
        durationSeconds: s.duration,
        tag: s.tag,
      }
    })

    const daysRemaining = rentPrice > 0 ? Math.floor(room.coin_balance / rentPrice) : 999

    res.status(200).json({
      channelId: room.channelid.toString(),
      guildId: room.guildid.toString(),
      name: room.name || null,
      coinBalance: room.coin_balance,
      rentPrice,
      daysRemaining,
      memberCap,
      ownerId: room.ownerid.toString(),
      totalContribution: room.contribution,
      createdAt: room.created_at?.toISOString() ?? null,
      deletedAt: room.deleted_at?.toISOString() ?? null,
      frozenAt: room.frozen_at?.toISOString() ?? null,
      frozenBy: room.frozen_by?.toString() ?? null,
      members,
      activityFeed,
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { action } = req.body

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { guildid: true, ownerid: true, coin_balance: true, name: true, frozen_at: true, deleted_at: true },
    })
    if (!room || room.guildid !== guildId) {
      return res.status(404).json({ error: "Room not found in this server" })
    }

    switch (action) {
      case "rename": {
        const { name } = req.body
        if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
          return res.status(400).json({ error: "Name must be 1-100 characters" })
        }
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { name: name.trim() } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "rename", details: { oldName: room.name, newName: name.trim() } },
        })
        return res.status(200).json({ success: true, name: name.trim() })
      }

      case "adjust_balance": {
        const { amount } = req.body
        if (typeof amount !== "number" || !Number.isFinite(amount)) {
          return res.status(400).json({ error: "Amount must be a number" })
        }
        const newBalance = room.coin_balance + amount
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { coin_balance: Math.max(0, newBalance) } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "adjust_balance", details: { oldBalance: room.coin_balance, adjustment: amount, newBalance: Math.max(0, newBalance) } },
        })
        return res.status(200).json({ success: true, newBalance: Math.max(0, newBalance) })
      }

      case "transfer_ownership": {
        const { newOwnerId } = req.body
        if (!newOwnerId) return res.status(400).json({ error: "newOwnerId required" })
        const newOwnerBigint = BigInt(newOwnerId)
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { ownerid: newOwnerBigint } })
        await prisma.rented_members.deleteMany({ where: { channelid: channelId, userid: newOwnerBigint } })
        if (room.ownerid !== newOwnerBigint) {
          await prisma.rented_members.create({ data: { channelid: channelId, userid: room.ownerid } }).catch(() => {})
        }
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "transfer_ownership", details: { oldOwner: room.ownerid.toString(), newOwner: newOwnerId } },
        })
        return res.status(200).json({ success: true })
      }

      case "freeze": {
        if (room.frozen_at) return res.status(400).json({ error: "Room is already frozen" })
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { frozen_at: new Date(), frozen_by: auth.userId } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "freeze", details: {} },
        })
        return res.status(200).json({ success: true })
      }

      case "unfreeze": {
        if (!room.frozen_at) return res.status(400).json({ error: "Room is not frozen" })
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { frozen_at: null, frozen_by: null } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "unfreeze", details: {} },
        })
        return res.status(200).json({ success: true })
      }

      case "extend_free": {
        const { amount } = req.body
        if (typeof amount !== "number" || amount <= 0) return res.status(400).json({ error: "amount must be positive" })
        await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { coin_balance: { increment: Math.floor(amount) } } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "extend_free", details: { amount: Math.floor(amount), oldBalance: room.coin_balance } },
        })
        return res.status(200).json({ success: true, newBalance: room.coin_balance + Math.floor(amount) })
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { guildid: true, deleted_at: true, name: true, ownerid: true },
    })
    if (!room || room.guildid !== guildId) {
      return res.status(404).json({ error: "Room not found in this server" })
    }
    if (room.deleted_at) return res.status(400).json({ error: "Room is already closed" })

    await prisma.rented_rooms.update({ where: { channelid: channelId }, data: { deleted_at: new Date() } })
    await prisma.room_admin_log.create({
      data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "force_close", details: { roomName: room.name, ownerId: room.ownerid.toString() } },
    })
    res.status(200).json({ success: true })
  },
})
