// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: GET server members with pagination and search (moderator+)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
  const auth = await requireModerator(req, res, guildId)
  if (!auth) return

  const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100)
  const sort = (req.query.sort as string) || "tracked_time"
  const order = (req.query.order as string) === "asc" ? "asc" : "desc"
  const search = req.query.search as string | undefined

  const where: any = { guildid: guildId }
  if (search) {
    where.display_name = { contains: search, mode: "insensitive" }
  }

  const [members, total] = await Promise.all([
    prisma.members.findMany({
      where,
      orderBy: { [sort]: order } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        userid: true,
        display_name: true,
        tracked_time: true,
        coins: true,
        workout_count: true,
        first_joined: true,
        last_left: true,
      },
    }),
    prisma.members.count({ where }),
  ])

  return res.status(200).json({
    members: members.map((m) => ({
      userId: m.userid.toString(),
      displayName: m.display_name,
      trackedTimeHours: Math.round((m.tracked_time || 0) / 3600 * 10) / 10,
      coins: m.coins || 0,
      workoutCount: m.workout_count || 0,
      firstJoined: m.first_joined,
      lastLeft: m.last_left,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
  },
})
