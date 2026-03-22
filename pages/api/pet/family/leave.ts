// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Leave current family with auto-leadership transfer
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const familyId = membership.family_id

    const otherMembers = await prisma.lg_family_members.findMany({
      where: { family_id: familyId, userid: { not: userId }, left_at: null },
      orderBy: { joined_at: "asc" },
    })

    if (otherMembers.length === 0) {
      await prisma.$transaction([
        prisma.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: userId } },
          data: { left_at: new Date() },
        }),
        prisma.lg_families.delete({ where: { family_id: familyId } }),
      ])
      return res.status(200).json({ success: true, disbanded: true })
    }

    if (membership.role === "LEADER") {
      const newLeader =
        otherMembers.find((m) => m.role === "ADMIN") ??
        otherMembers.find((m) => m.role === "MODERATOR") ??
        otherMembers[0]

      await prisma.$transaction([
        prisma.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: userId } },
          data: { left_at: new Date() },
        }),
        prisma.lg_family_members.update({
          where: { family_id_userid: { family_id: familyId, userid: newLeader.userid } },
          data: { role: "LEADER" },
        }),
        prisma.lg_families.update({
          where: { family_id: familyId },
          data: { leader_userid: newLeader.userid },
        }),
      ])

      return res.status(200).json({
        success: true,
        disbanded: false,
        newLeader: newLeader.userid.toString(),
      })
    }

    await prisma.lg_family_members.update({
      where: { family_id_userid: { family_id: familyId, userid: userId } },
      data: { left_at: new Date() },
    })

    return res.status(200).json({ success: true, disbanded: false })
  },
})
