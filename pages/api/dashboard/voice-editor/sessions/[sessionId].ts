// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor - PATCH (edit) and DELETE session
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const MIN_DURATION = 300       // 5 minutes
const MAX_DURATION = 43200     // 12 hours
const MAX_LOOKBACK_DAYS = 30

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

export default apiHandler({
  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const sessionId = parseInt(req.query.sessionId as string)
    if (isNaN(sessionId)) throw new ValidationError("Invalid session ID")

    const session = await prisma.voice_sessions.findUnique({
      where: { sessionid: sessionId },
      select: {
        sessionid: true,
        guildid: true,
        userid: true,
        start_time: true,
        duration: true,
        is_manual: true,
      },
    })

    if (!session) {
      return res.status(404).json({ error: "Session not found" })
    }
    if (session.userid !== auth.userId) {
      return res.status(403).json({ error: "You can only edit your own sessions" })
    }

    if (!(await isPremiumGuild(session.guildid))) {
      return res.status(403).json({ error: "Voice Time Editor requires a premium subscription" })
    }

    const config = await prisma.guild_config.findUnique({
      where: { guildid: session.guildid },
      select: {
        manual_sessions_enabled: true,
        manual_sessions_limit: true,
        manual_sessions_until: true,
      },
    })

    const now = new Date()
    if (!config?.manual_sessions_enabled) {
      return res.status(403).json({ error: "Voice Time Editor is not enabled on this server" })
    }
    if (config.manual_sessions_until && config.manual_sessions_until < now) {
      return res.status(403).json({ error: "The Voice Time Editor editing window has expired" })
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyLimit = config.manual_sessions_limit ?? 5

    const usageCount = await prisma.manual_session_log.count({
      where: {
        guildid: session.guildid,
        userid: auth.userId,
        created_at: { gte: monthStart },
        action: { in: ["ADD", "EDIT"] },
      },
    })
    if (usageCount >= monthlyLimit) {
      return res.status(403).json({
        error: `Monthly edit limit reached (${monthlyLimit} per month)`,
      })
    }

    const { startTime: newStartTimeStr, duration: newDurationSec } = req.body
    const sessionUpdates: { start_time?: Date; duration?: number } = {}

    let oldStartTime: Date | undefined
    let newStartTimeParsed: Date | undefined
    let oldDuration: number | undefined
    let newDurationParsed: number | undefined

    let effectiveStartTime = session.start_time
    let effectiveDuration = session.duration

    if (newStartTimeStr) {
      const parsed = new Date(newStartTimeStr)
      if (isNaN(parsed.getTime())) throw new ValidationError("Invalid start time")
      if (parsed > now) throw new ValidationError("Start time cannot be in the future")

      const lookbackLimit = new Date(now)
      lookbackLimit.setDate(lookbackLimit.getDate() - MAX_LOOKBACK_DAYS)
      if (parsed < lookbackLimit) {
        throw new ValidationError(`Sessions can only be within the last ${MAX_LOOKBACK_DAYS} days`)
      }

      sessionUpdates.start_time = parsed
      oldStartTime = session.start_time
      newStartTimeParsed = parsed
      effectiveStartTime = parsed
    }

    if (newDurationSec !== undefined) {
      const dur = parseInt(newDurationSec)
      if (isNaN(dur) || dur < MIN_DURATION || dur > MAX_DURATION) {
        throw new ValidationError(`Duration must be between ${MIN_DURATION / 60} minutes and ${MAX_DURATION / 3600} hours`)
      }
      sessionUpdates.duration = dur
      oldDuration = session.duration
      newDurationParsed = dur
      effectiveDuration = dur
    }

    if (Object.keys(sessionUpdates).length === 0) {
      return res.status(400).json({ error: "No changes provided" })
    }

    const endTime = new Date(effectiveStartTime.getTime() + effectiveDuration * 1000)
    if (endTime > now) {
      throw new ValidationError("Session end time cannot be in the future")
    }

    const overlapping = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as count
      FROM voice_sessions
      WHERE guildid = ${session.guildid}
        AND userid = ${auth.userId}
        AND sessionid != ${sessionId}
        AND start_time < ${endTime}
        AND (start_time + duration * interval '1 second') > ${effectiveStartTime}
    `
    if (Number(overlapping[0]?.count || 0) > 0) {
      throw new ValidationError("This change would overlap with another session in this server")
    }

    await prisma.voice_sessions.update({
      where: { sessionid: sessionId },
      data: sessionUpdates,
    })

    await prisma.manual_session_log.create({
      data: {
        guildid: session.guildid,
        userid: auth.userId,
        sessionid: sessionId,
        action: "EDIT",
        reason: req.body.reason ? String(req.body.reason).slice(0, 500) : null,
        old_start_time: oldStartTime ?? null,
        new_start_time: newStartTimeParsed ?? null,
        old_duration: oldDuration ?? null,
        new_duration: newDurationParsed ?? null,
      },
    })

    return res.status(200).json({ success: true })
  },

  async DELETE(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const sessionId = parseInt(req.query.sessionId as string)
    if (isNaN(sessionId)) throw new ValidationError("Invalid session ID")

    const session = await prisma.voice_sessions.findUnique({
      where: { sessionid: sessionId },
      select: {
        sessionid: true,
        guildid: true,
        userid: true,
        start_time: true,
        duration: true,
        is_manual: true,
      },
    })

    if (!session) {
      return res.status(404).json({ error: "Session not found" })
    }
    if (session.userid !== auth.userId) {
      return res.status(403).json({ error: "You can only delete your own sessions" })
    }
    if (!session.is_manual) {
      return res.status(403).json({ error: "Only manually-added sessions can be deleted" })
    }

    await prisma.manual_session_log.create({
      data: {
        guildid: session.guildid,
        userid: auth.userId,
        sessionid: sessionId,
        action: "DELETE",
        old_start_time: session.start_time,
        old_duration: session.duration,
      },
    })

    await prisma.voice_sessions.delete({
      where: { sessionid: sessionId },
    })

    return res.status(200).json({ success: true })
  },
})
