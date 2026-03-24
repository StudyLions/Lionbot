// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Get current user's family overview (or null)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { familyLevelFromXp, maxMembersForLevel, maxFarmsForLevel } from "@/utils/familyPermissions"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })

    if (!membership) {
      return res.status(200).json({ family: null, membership: null })
    }

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Also fetch recent activity for the overview feed
    const [family, memberCount, todayActivityCount, recentActivityRows] = await Promise.all([
      prisma.lg_families.findUnique({
        where: { family_id: membership.family_id },
      }),
      prisma.lg_family_members.count({
        where: { family_id: membership.family_id, left_at: null },
      }),
      prisma.lg_family_gold_log.count({
        where: {
          family_id: membership.family_id,
          created_at: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
        },
      }),
      prisma.lg_family_gold_log.findMany({
        where: { family_id: membership.family_id },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
    ])
    // --- END AI-MODIFIED ---

    if (!family) {
      return res.status(200).json({ family: null, membership: null })
    }

    const level = familyLevelFromXp(Number(family.xp))
    const maxMembers = maxMembersForLevel(level)
    const maxFarms = maxFarmsForLevel(level)

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Include rolePermissions and recentActivity in response
    return res.status(200).json({
      family: {
        familyId: family.family_id,
        name: family.name,
        description: family.description,
        iconUrl: family.icon_url,
        level,
        xp: family.xp.toString(),
        gold: family.gold.toString(),
        leaderUserId: family.leader_userid.toString(),
        maxMembers: family.max_members,
        maxFarms: family.max_farms,
        dailyGoldWithdrawCap: family.daily_gold_withdraw_cap,
        rolePermissions: family.role_permissions,
        memberCount,
        maxMembersForLevel: maxMembers,
        maxFarmsForLevel: maxFarms,
        todayActivityCount,
        createdAt: family.created_at.toISOString(),
      },
      membership: {
        role: membership.role,
        contributionXp: membership.contribution_xp.toString(),
        joinedAt: membership.joined_at.toISOString(),
      },
      recentActivity: recentActivityRows.map((r) => ({
        type: r.action,
        amount: r.amount.toString(),
        description: r.description ?? "",
        createdAt: r.created_at.toISOString(),
      })),
    })
    // --- END AI-MODIFIED ---
  },
})
