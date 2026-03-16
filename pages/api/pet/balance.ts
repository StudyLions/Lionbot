// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Lightweight endpoint returning just gold + gems balance
//          for persistent display across all pet pages
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const userConfig = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gold: true, gems: true },
    })

    return res.status(200).json({
      gold: (userConfig?.gold ?? BigInt(0)).toString(),
      gems: userConfig?.gems ?? 0,
    })
  },
})
