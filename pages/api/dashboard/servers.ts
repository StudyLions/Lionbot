// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - list servers the user belongs to
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

    const memberships = await prisma.members.findMany({
    where: { userid: userId },
    select: {
      guildid: true,
      tracked_time: true,
      coins: true,
      display_name: true,
      first_joined: true,
      guild_config: {
        select: {
          guildid: true,
          name: true,
          study_hourly_reward: true,
          rank_type: true,
        },
      },
    },
    orderBy: { tracked_time: "desc" },
  })

  const servers = memberships.map(m => ({
    guildId: m.guildid.toString(),
    guildName: m.guild_config?.name || "Unknown Server",
    displayName: m.display_name,
    trackedTimeSeconds: m.tracked_time || 0,
    trackedTimeHours: Math.round((m.tracked_time || 0) / 3600 * 10) / 10,
    coins: m.coins || 0,
    firstJoined: m.first_joined,
  }))

  res.status(200).json({ servers })
  },
})
// --- END AI-MODIFIED ---
