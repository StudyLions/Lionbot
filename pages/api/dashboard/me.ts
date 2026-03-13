// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - current user profile and global stats
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const discordId = await getDiscordId(req)
  if (!discordId) return unauthorized(res)

  const userId = BigInt(discordId)

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
    recentSessions: recentSessions.map(s => ({
      id: s.sessionid,
      guildId: s.guildid.toString(),
      startTime: s.start_time,
      durationMinutes: Math.round(s.duration / 60),
      liveDurationMinutes: Math.round((s.live_duration || 0) / 60),
      tag: s.tag,
      rating: s.rating,
    })),
  }

  return res.status(200).json(serializable)
}
