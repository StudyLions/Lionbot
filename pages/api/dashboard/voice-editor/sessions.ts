// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor - POST to add a manual study session
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const MIN_DURATION = 300       // 5 minutes in seconds
const MAX_DURATION = 43200     // 12 hours in seconds
const MAX_LOOKBACK_DAYS = 30

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { guildId: guildIdStr, startTime: startTimeStr, duration: durationSec, reason } = req.body

    if (!guildIdStr || !startTimeStr || durationSec === undefined || durationSec === null) {
      throw new ValidationError("Missing required fields: guildId, startTime, duration")
    }

    const guildId = parseBigInt(guildIdStr, "guildId")
    const userId = auth.userId
    const startTime = new Date(startTimeStr)
    const duration = typeof durationSec === "number" ? durationSec : parseInt(durationSec)
    const now = new Date()

    if (isNaN(startTime.getTime())) {
      throw new ValidationError("Invalid start time")
    }
    if (isNaN(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
      throw new ValidationError(`Duration must be between ${MIN_DURATION / 60} minutes and ${MAX_DURATION / 3600} hours`)
    }
    if (startTime > now) {
      throw new ValidationError("Start time cannot be in the future")
    }

    const lookbackLimit = new Date(now)
    lookbackLimit.setDate(lookbackLimit.getDate() - MAX_LOOKBACK_DAYS)
    if (startTime < lookbackLimit) {
      throw new ValidationError(`Sessions can only be added within the last ${MAX_LOOKBACK_DAYS} days`)
    }

    const endTime = new Date(startTime.getTime() + duration * 1000)
    if (endTime > now) {
      throw new ValidationError("Session end time cannot be in the future")
    }

    const membership = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { userid: true },
    })
    if (!membership) {
      throw new ValidationError("You are not a member of this server")
    }

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Voice Time Editor requires a premium subscription" })
    }

    const config = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: {
        manual_sessions_enabled: true,
        manual_sessions_limit: true,
        manual_sessions_until: true,
      },
    })

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
        guildid: guildId,
        userid: userId,
        created_at: { gte: monthStart },
        action: { in: ["ADD", "EDIT"] },
      },
    })

    if (usageCount >= monthlyLimit) {
      return res.status(403).json({
        error: `Monthly edit limit reached (${monthlyLimit} per month)`,
      })
    }

    const overlapping = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as count
      FROM voice_sessions
      WHERE guildid = ${guildId}
        AND userid = ${userId}
        AND start_time < ${endTime}
        AND (start_time + duration * interval '1 second') > ${startTime}
    `
    if (Number(overlapping[0]?.count || 0) > 0) {
      throw new ValidationError("This session overlaps with an existing session in this server")
    }

    const ongoingOverlap = await prisma.voice_sessions_ongoing.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: userId } },
      select: { start_time: true },
    })
    if (ongoingOverlap?.start_time && ongoingOverlap.start_time < endTime) {
      throw new ValidationError("This session overlaps with your current ongoing session")
    }

    let session
    try {
      session = await prisma.voice_sessions.create({
        data: {
          members: {
            connect: { guildid_userid: { guildid: guildId, userid: userId } },
          },
          start_time: startTime,
          duration,
          is_manual: true,
          live_duration: 0,
          stream_duration: 0,
          video_duration: 0,
        },
      })
    } catch (dbErr: any) {
      console.error("voice_sessions.create failed:", dbErr?.message || dbErr)
      throw new ValidationError("Failed to create session. Please try again.")
    }

    try {
      await prisma.manual_session_log.create({
        data: {
          guildid: guildId,
          userid: userId,
          sessionid: session.sessionid,
          action: "ADD",
          reason: reason ? String(reason).slice(0, 500) : null,
          new_start_time: startTime,
          new_duration: duration,
        },
      })
    } catch (logErr: any) {
      console.error("manual_session_log.create failed:", logErr?.message || logErr)
    }

    return res.status(201).json({
      id: session.sessionid,
      startTime: session.start_time.toISOString(),
      duration: session.duration,
      durationMinutes: Math.round(session.duration / 60),
      isManual: true,
    })
  },
})
