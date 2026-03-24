// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: API route for enhancement achievements.
//          GET returns user's unlocked achievements.
// ============================================================

import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const achievements = await prisma.lg_enhancement_achievements.findMany({
      where: { userid: userId },
      select: { achievement_key: true, unlocked_at: true },
      orderBy: { unlocked_at: "asc" },
    })

    return res.status(200).json({
      achievements: achievements.map(a => ({
        key: a.achievement_key,
        unlockedAt: a.unlocked_at.toISOString(),
      })),
    })
  },
})
