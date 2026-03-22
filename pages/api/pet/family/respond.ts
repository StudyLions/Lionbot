// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Accept or decline a family invite
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { maxMembersForLevel, familyLevelFromXp } from "@/utils/familyPermissions"

const COOLDOWN_DAYS = 7

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { inviteId, action } = req.body

    if (!inviteId || !action || !["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "inviteId and action (accept|decline) required" })
    }

    const invite = await prisma.lg_family_invites.findUnique({
      where: { invite_id: inviteId },
    })
    if (!invite) return res.status(404).json({ error: "Invite not found" })
    if (invite.to_userid !== userId) return res.status(403).json({ error: "This invite is not for you" })
    if (invite.status !== "PENDING") return res.status(400).json({ error: "Invite is no longer pending" })

    if (action === "decline") {
      await prisma.lg_family_invites.update({
        where: { invite_id: inviteId },
        data: { status: "DECLINED" },
      })
      return res.status(200).json({ success: true, action: "declined" })
    }

    const activeMembership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
    })
    if (activeMembership) {
      return res.status(400).json({ error: "You are already in a family" })
    }

    const lastLeft = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: { not: null } },
      orderBy: { left_at: "desc" },
    })
    if (lastLeft?.left_at) {
      const daysSince = (Date.now() - lastLeft.left_at.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < COOLDOWN_DAYS) {
        const remaining = Math.ceil(COOLDOWN_DAYS - daysSince)
        return res.status(400).json({ error: `Cooldown: ${remaining} day(s) remaining` })
      }
    }

    const [family, memberCount] = await Promise.all([
      prisma.lg_families.findUnique({ where: { family_id: invite.family_id } }),
      prisma.lg_family_members.count({ where: { family_id: invite.family_id, left_at: null } }),
    ])
    if (!family) return res.status(404).json({ error: "Family no longer exists" })

    const level = familyLevelFromXp(Number(family.xp))
    const maxMembers = Math.max(family.max_members, maxMembersForLevel(level))
    if (memberCount >= maxMembers) {
      return res.status(400).json({ error: "Family is full" })
    }

    await prisma.$transaction(async (tx) => {
      await tx.lg_family_invites.update({
        where: { invite_id: inviteId },
        data: { status: "ACCEPTED" },
      })

      await tx.lg_family_members.upsert({
        where: { family_id_userid: { family_id: invite.family_id, userid: userId } },
        create: {
          family_id: invite.family_id,
          userid: userId,
          role: "MEMBER",
        },
        update: {
          role: "MEMBER",
          left_at: null,
          joined_at: new Date(),
          contribution_xp: BigInt(0),
        },
      })
    })

    return res.status(200).json({ success: true, action: "accepted", familyId: invite.family_id })
  },
})
