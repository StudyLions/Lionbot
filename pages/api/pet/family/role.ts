// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Promote or demote a family member's role
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { hasPermission, roleRank } from "@/utils/familyPermissions"

const VALID_ROLES = ["ADMIN", "MODERATOR", "MEMBER"]

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const targetUserId = parseBigInt(req.body.targetUserId, "targetUserId")
    const { newRole } = req.body

    if (!newRole || !VALID_ROLES.includes(newRole)) {
      return res.status(400).json({ error: "newRole must be ADMIN, MODERATOR, or MEMBER" })
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot change your own role" })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (!hasPermission(membership.role, "promote_demote", membership.lg_families.role_permissions)) {
      return res.status(403).json({ error: "You don't have permission to promote/demote" })
    }

    const targetMember = await prisma.lg_family_members.findFirst({
      where: { family_id: membership.family_id, userid: targetUserId, left_at: null },
    })
    if (!targetMember) return res.status(404).json({ error: "Target is not an active member of your family" })

    if (roleRank(newRole) >= roleRank(membership.role)) {
      return res.status(403).json({ error: "Cannot promote to equal or higher than your own rank" })
    }

    if (roleRank(targetMember.role) >= roleRank(membership.role)) {
      return res.status(403).json({ error: "Cannot change the role of a member with equal or higher rank" })
    }

    await prisma.lg_family_members.update({
      where: { family_id_userid: { family_id: membership.family_id, userid: targetUserId } },
      data: { role: newRole as any },
    })

    return res.status(200).json({ success: true })
  },
})
