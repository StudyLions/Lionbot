// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET study session history for logged-in user
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50)
  const guildFilter = req.query.guild ? BigInt(req.query.guild as string) : undefined

  const where: any = { userid: auth.userId }
  if (guildFilter) where.guildid = guildFilter

  const [sessions, total, weeklyStats] = await Promise.all([
    prisma.voice_sessions.findMany({
      where,
      orderBy: { start_time: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    prisma.voice_sessions.count({ where }),
    prisma.voice_sessions.aggregate({
      where: {
        userid: auth.userId,
        start_time: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { duration: true },
      _count: true,
    }),
  ])

  res.status(200).json({
    sessions: sessions.map((s) => ({
      id: s.sessionid,
      guildId: s.guildid.toString(),
      startTime: s.start_time,
      durationMinutes: Math.round(s.duration / 60),
      liveDurationMinutes: Math.round((s.live_duration || 0) / 60),
      tag: s.tag,
      rating: s.rating,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    weeklyStats: {
      totalMinutes: Math.round((weeklyStats._sum.duration || 0) / 60),
      sessionCount: weeklyStats._count,
    },
  })
  },
})
// --- END AI-MODIFIED ---
