// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Kick a member from the family
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { hasPermission, roleRank } from "@/utils/familyPermissions"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const targetUserId = parseBigInt(req.body.targetUserId, "targetUserId")

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot kick yourself. Use /leave instead." })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (!hasPermission(membership.role, "kick_members", membership.lg_families.role_permissions)) {
      return res.status(403).json({ error: "You don't have permission to kick members" })
    }

    const targetMember = await prisma.lg_family_members.findFirst({
      where: { family_id: membership.family_id, userid: targetUserId, left_at: null },
    })
    if (!targetMember) return res.status(404).json({ error: "Target is not an active member of your family" })

    if (roleRank(membership.role) <= roleRank(targetMember.role)) {
      return res.status(403).json({ error: "Cannot kick a member of equal or higher rank" })
    }

    await prisma.lg_family_members.update({
      where: { family_id_userid: { family_id: membership.family_id, userid: targetUserId } },
      data: { left_at: new Date() },
    })

    return res.status(200).json({ success: true })
  },
})
