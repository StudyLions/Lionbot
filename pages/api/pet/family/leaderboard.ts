// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family leaderboard by level and XP
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { familyLevelFromXp } from "@/utils/familyPermissions"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const limit = Math.min(Math.max(parseInt((req.query.limit as string) ?? "10", 10) || 10, 1), 50)

    const families = await prisma.lg_families.findMany({
      orderBy: [{ level: "desc" }, { xp: "desc" }],
      take: limit,
      select: {
        family_id: true,
        name: true,
        icon_url: true,
        level: true,
        xp: true,
        leader_userid: true,
        created_at: true,
      },
    })

    const leaderIds = families.map((f) => f.leader_userid)
    const [leaderPets, memberCounts] = await Promise.all([
      prisma.lg_pets.findMany({
        where: { userid: { in: leaderIds } },
        select: { userid: true, pet_name: true },
      }),
      prisma.lg_family_members.groupBy({
        by: ["family_id"],
        where: {
          family_id: { in: families.map((f) => f.family_id) },
          left_at: null,
        },
        _count: { userid: true },
      }),
    ])

    const leaderMap = new Map(leaderPets.map((p) => [p.userid.toString(), p.pet_name]))
    const countMap = new Map(memberCounts.map((c) => [c.family_id, c._count.userid]))

    const result = families.map((f) => ({
      familyId: f.family_id,
      name: f.name,
      iconUrl: f.icon_url,
      level: familyLevelFromXp(Number(f.xp)),
      xp: f.xp.toString(),
      memberCount: countMap.get(f.family_id) ?? 0,
      leaderName: leaderMap.get(f.leader_userid.toString()) ?? "Unknown",
      createdAt: f.created_at.toISOString(),
    }))

    return res.status(200).json({ families: result })
  },
})
