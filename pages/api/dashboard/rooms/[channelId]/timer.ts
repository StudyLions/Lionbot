// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: User-facing timer CRUD for private rooms -- create,
//          edit settings, start/stop, and delete a pomodoro timer
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")
    const { action } = req.body

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true, guildid: true, deleted_at: true, name: true },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })
    if (room.deleted_at) return res.status(400).json({ error: "Room has expired" })
    if (room.ownerid !== auth.userId) return res.status(403).json({ error: "Only the room owner can manage the timer" })

    if (action === "start") {
      const timer = await prisma.timers.findUnique({ where: { channelid: channelId } })
      if (!timer) return res.status(404).json({ error: "No timer exists for this room" })
      if (timer.last_started) return res.status(400).json({ error: "Timer is already running" })
      await prisma.timers.update({ where: { channelid: channelId }, data: { last_started: new Date() } })
      return res.status(200).json({ success: true, isRunning: true })
    }

    if (action === "stop") {
      const timer = await prisma.timers.findUnique({ where: { channelid: channelId } })
      if (!timer) return res.status(404).json({ error: "No timer exists for this room" })
      if (!timer.last_started) return res.status(400).json({ error: "Timer is not running" })
      await prisma.timers.update({ where: { channelid: channelId }, data: { last_started: null, auto_restart: false } })
      return res.status(200).json({ success: true, isRunning: false })
    }

    const { focusMinutes, breakMinutes, autoRestart, inactivityThreshold } = req.body
    const focus = Number(focusMinutes)
    const brk = Number(breakMinutes)
    if (isNaN(focus) || focus < 1 || focus > 1440) return res.status(400).json({ error: "Focus must be 1-1440 minutes" })
    if (isNaN(brk) || brk < 1 || brk > 1440) return res.status(400).json({ error: "Break must be 1-1440 minutes" })

    const existing = await prisma.timers.findUnique({ where: { channelid: channelId } })
    if (existing) return res.status(400).json({ error: "Timer already exists. Use PATCH to edit." })

    await prisma.timers.create({
      data: {
        channelid: channelId,
        guildid: room.guildid,
        ownerid: auth.userId,
        notification_channelid: channelId,
        focus_length: Math.round(focus * 60),
        break_length: Math.round(brk * 60),
        auto_restart: autoRestart ?? false,
        inactivity_threshold: inactivityThreshold ?? null,
        channel_name: room.name || null,
        voice_alerts: true,
      },
    })

    return res.status(201).json({
      success: true,
      timer: {
        focusMinutes: focus,
        breakMinutes: brk,
        autoRestart: autoRestart ?? false,
        isRunning: false,
        lastStarted: null,
      },
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
    if (!room) return res.status(404).json({ error: "Room not found" })
    if (room.ownerid !== auth.userId) return res.status(403).json({ error: "Only the room owner can edit the timer" })

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

    const updated = await prisma.timers.update({
      where: { channelid: channelId },
      data: updates,
      select: { focus_length: true, break_length: true, auto_restart: true, last_started: true, inactivity_threshold: true, voice_alerts: true },
    })

    return res.status(200).json({
      success: true,
      timer: {
        focusMinutes: Math.round(updated.focus_length / 60),
        breakMinutes: Math.round(updated.break_length / 60),
        autoRestart: updated.auto_restart ?? false,
        isRunning: !!updated.last_started,
        lastStarted: updated.last_started?.toISOString() ?? null,
        inactivityThreshold: updated.inactivity_threshold,
        voiceAlerts: updated.voice_alerts ?? true,
      },
    })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const channelId = parseBigInt(req.query.channelId, "channelId")

    const room = await prisma.rented_rooms.findUnique({
      where: { channelid: channelId },
      select: { ownerid: true },
    })
    if (!room) return res.status(404).json({ error: "Room not found" })
    if (room.ownerid !== auth.userId) return res.status(403).json({ error: "Only the room owner can delete the timer" })

    const timer = await prisma.timers.findUnique({ where: { channelid: channelId } })
    if (!timer) return res.status(404).json({ error: "No timer exists for this room" })

    await prisma.timers.delete({ where: { channelid: channelId } })
    return res.status(200).json({ success: true })
  },
})
