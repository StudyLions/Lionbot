// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Return list of users blocked by the authenticated
//          user, with basic profile info
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const rows = await prisma.lg_blocks.findMany({
      where: { blocker_userid: userId },
      orderBy: { created_at: "desc" },
    })

    if (rows.length === 0) {
      return res.status(200).json({ blocked: [] })
    }

    const blockedIds = rows.map((r) => r.blocked_userid)

    const configs = await prisma.user_config.findMany({
      where: { userid: { in: blockedIds } },
      select: { userid: true, name: true },
    })
    const configMap = new Map(configs.map((c) => [c.userid.toString(), c]))

    const blocked = rows.map((r) => {
      const uid = r.blocked_userid.toString()
      const cfg = configMap.get(uid)
      return {
        userId: uid,
        userName: cfg?.name ?? "Unknown",
        blockedAt: r.created_at?.toISOString() ?? new Date().toISOString(),
      }
    })

    return res.status(200).json({ blocked })
  },
})
