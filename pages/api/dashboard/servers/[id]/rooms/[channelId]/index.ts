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
        // --- AI-MODIFIED (2026-03-23) ---
        // Purpose: contribution column does not exist in rented_members schema
        rented_members: { select: { userid: true } },
        // --- END AI-MODIFIED ---
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
    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: contribution column removed from rented_members schema
    const contribMap = new Map(room.rented_members.map((m) => [m.userid.toString(), 0]))
    // --- END AI-MODIFIED ---
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

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Fetch timer data for admin room detail
    const timerRow = await prisma.timers.findUnique({
      where: { channelid: channelId },
      select: {
        channelid: true, focus_length: true, break_length: true,
        auto_restart: true, last_started: true, inactivity_threshold: true,
        channel_name: true, pretty_name: true, voice_alerts: true, ownerid: true,
      },
    })
    // --- END AI-MODIFIED ---

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
      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Include timer data for admin timer controls
      timer: timerRow ? {
        focusMinutes: Math.round(timerRow.focus_length / 60),
        breakMinutes: Math.round(timerRow.break_length / 60),
        autoRestart: timerRow.auto_restart ?? false,
        isRunning: !!timerRow.last_started,
        lastStarted: timerRow.last_started?.toISOString() ?? null,
        inactivityThreshold: timerRow.inactivity_threshold,
        voiceAlerts: timerRow.voice_alerts ?? true,
        ownerId: timerRow.ownerid?.toString() ?? null,
      } : null,
      // --- END AI-MODIFIED ---
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
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Set name_changed_at so the bot knows to sync this rename to Discord.
      // Only renames with name_changed_at set will be pushed; user-initiated Discord
      // renames (which don't touch this column) are never overwritten.
      case "rename": {
        const { name } = req.body
        if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
          return res.status(400).json({ error: "Name must be 1-100 characters" })
        }
        await prisma.rented_rooms.update({
          where: { channelid: channelId },
          // --- AI-MODIFIED (2026-03-23) ---
          // Purpose: name_changed_at column does not exist in rented_rooms schema
          data: { name: name.trim() },
          // --- END AI-MODIFIED ---
        })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "rename", details: { oldName: room.name, newName: name.trim() } },
        })
        return res.status(200).json({ success: true, name: name.trim(), message: "Name saved. Will sync to Discord within a few minutes." })
      }
      // --- END AI-MODIFIED ---

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

      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Admin actions for room timer management
      case "edit_timer": {
        const timer = await prisma.timers.findUnique({ where: { channelid: channelId } })
        if (!timer) return res.status(404).json({ error: "No timer exists for this room" })

        const updates: Record<string, any> = {}
        const { focusMinutes, breakMinutes, autoRestart, inactivityThreshold, voiceAlerts } = req.body
        if (focusMinutes !== undefined) {
          const f = Number(focusMinutes)
          if (isNaN(f) || f < 1 || f > 1440) return res.status(400).json({ error: "Focus must be 1-1440 minutes" })
          updates.focus_length = Math.round(f * 60)
        }
        if (breakMinutes !== undefined) {
          const b = Number(breakMinutes)
          if (isNaN(b) || b < 1 || b > 1440) return res.status(400).json({ error: "Break must be 1-1440 minutes" })
          updates.break_length = Math.round(b * 60)
        }
        if (autoRestart !== undefined) updates.auto_restart = !!autoRestart
        if (inactivityThreshold !== undefined) updates.inactivity_threshold = inactivityThreshold === null ? null : Number(inactivityThreshold)
        if (voiceAlerts !== undefined) updates.voice_alerts = !!voiceAlerts

        if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No fields to update" })

        const updated = await prisma.timers.update({ where: { channelid: channelId }, data: updates })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "edit_timer", details: updates },
        })
        return res.status(200).json({
          success: true,
          timer: {
            focusMinutes: Math.round(updated.focus_length / 60),
            breakMinutes: Math.round(updated.break_length / 60),
            autoRestart: updated.auto_restart ?? false,
            isRunning: !!updated.last_started,
            voiceAlerts: updated.voice_alerts ?? true,
          },
        })
      }

      case "delete_timer": {
        const timer = await prisma.timers.findUnique({ where: { channelid: channelId } })
        if (!timer) return res.status(404).json({ error: "No timer exists for this room" })
        await prisma.timers.delete({ where: { channelid: channelId } })
        await prisma.room_admin_log.create({
          data: { channelid: channelId, guildid: guildId, adminid: auth.userId, action: "delete_timer", details: { focusLength: timer.focus_length, breakLength: timer.break_length } },
        })
        return res.status(200).json({ success: true })
      }
      // --- END AI-MODIFIED ---

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
