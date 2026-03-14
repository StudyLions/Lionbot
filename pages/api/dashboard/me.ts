// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - current user profile and global stats
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: switched to requireAuth for rate limiting consistency
import { requireAuth } from "@/utils/adminAuth"
// --- END AI-MODIFIED ---
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const [userConfig, totalStudyTime, serverCount, recentSessions] = await Promise.all([
    prisma.user_config.findUnique({
      where: { userid: userId },
      select: {
        userid: true,
        timezone: true,
        name: true,
        gems: true,
        first_seen: true,
        last_seen: true,
        locale: true,
        show_global_stats: true,
      },
    }),

    prisma.members.aggregate({
      where: { userid: userId },
      _sum: { tracked_time: true },
    }),

    prisma.members.count({
      where: { userid: userId },
    }),

    prisma.voice_sessions.findMany({
      where: { userid: userId },
      orderBy: { start_time: "desc" },
      take: 10,
      select: {
        sessionid: true,
        guildid: true,
        start_time: true,
        duration: true,
        live_duration: true,
        stream_duration: true,
        video_duration: true,
        tag: true,
        rating: true,
      },
    }),
  ])

  if (!userConfig) {
    return res.status(404).json({ error: "User not found in LionBot database" })
  }

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: enrich recent sessions with guild names for the overview activity feed
  const uniqueGuildIds = Array.from(new Set(recentSessions.map(s => s.guildid)))
  const guildConfigs = uniqueGuildIds.length > 0
    ? await prisma.guild_config.findMany({
        where: { guildid: { in: uniqueGuildIds } },
        select: { guildid: true, name: true },
      })
    : []
  const guildNameMap = new Map(guildConfigs.map(g => [g.guildid.toString(), g.name]))
  // --- END AI-MODIFIED ---

  const serializable = {
    user: {
      id: userConfig.userid.toString(),
      timezone: userConfig.timezone,
      name: userConfig.name,
      gems: userConfig.gems,
      firstSeen: userConfig.first_seen,
      lastSeen: userConfig.last_seen,
      locale: userConfig.locale,
    },
    stats: {
      totalStudyTimeSeconds: totalStudyTime._sum.tracked_time || 0,
      totalStudyTimeHours: Math.round((totalStudyTime._sum.tracked_time || 0) / 3600 * 10) / 10,
      serverCount,
    },
    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: include guildName, videoDurationMinutes, streamDurationMinutes in session data
    recentSessions: recentSessions.map(s => ({
      id: s.sessionid,
      guildId: s.guildid.toString(),
      guildName: guildNameMap.get(s.guildid.toString()) || null,
      startTime: s.start_time,
      durationMinutes: Math.round(s.duration / 60),
      liveDurationMinutes: Math.round((s.live_duration || 0) / 60),
      videoDurationMinutes: Math.round((s.video_duration || 0) / 60),
      streamDurationMinutes: Math.round((s.stream_duration || 0) / 60),
      tag: s.tag,
      rating: s.rating,
    })),
    // --- END AI-MODIFIED ---
  }

  res.status(200).json(serializable)
  },
})
// --- END AI-MODIFIED ---
