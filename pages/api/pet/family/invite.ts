// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: GET pending invites for current user; POST invite a user
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { hasPermission } from "@/utils/familyPermissions"

const COOLDOWN_DAYS = 7

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const invites = await prisma.lg_family_invites.findMany({
      where: { to_userid: userId, status: "PENDING" },
      include: {
        lg_families: {
          select: {
            family_id: true,
            name: true,
            icon_url: true,
            level: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    const enriched = await Promise.all(
      invites.map(async (inv) => {
        const [memberCount, inviterPet] = await Promise.all([
          prisma.lg_family_members.count({
            where: { family_id: inv.family_id, left_at: null },
          }),
          prisma.lg_pets.findUnique({
            where: { userid: inv.from_userid },
            select: { pet_name: true },
          }),
        ])
        return {
          inviteId: inv.invite_id,
          familyId: inv.family_id,
          familyName: inv.lg_families.name,
          familyIcon: inv.lg_families.icon_url,
          familyLevel: inv.lg_families.level,
          memberCount,
          invitedBy: inv.from_userid.toString(),
          inviterName: inviterPet?.pet_name ?? "Unknown",
          createdAt: inv.created_at.toISOString(),
        }
      })
    )

    return res.status(200).json({ invites: enriched })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const targetUserId = parseBigInt(req.body.targetUserId, "targetUserId")

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot invite yourself" })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (!hasPermission(membership.role, "invite_members", membership.lg_families.role_permissions)) {
      return res.status(403).json({ error: "You don't have permission to invite members" })
    }

    const [targetPet, targetMembership, existingInvite] = await Promise.all([
      prisma.lg_pets.findUnique({ where: { userid: targetUserId }, select: { userid: true } }),
      prisma.lg_family_members.findFirst({ where: { userid: targetUserId, left_at: null } }),
      prisma.lg_family_invites.findFirst({
        where: { family_id: membership.family_id, to_userid: targetUserId, status: "PENDING" },
      }),
    ])

    if (!targetPet) return res.status(400).json({ error: "Target user doesn't have a pet" })
    if (targetMembership) return res.status(400).json({ error: "Target user is already in a family" })
    if (existingInvite) return res.status(400).json({ error: "This user already has a pending invite from your family" })

    const lastLeft = await prisma.lg_family_members.findFirst({
      where: { userid: targetUserId, left_at: { not: null } },
      orderBy: { left_at: "desc" },
    })
    if (lastLeft?.left_at) {
      const daysSince = (Date.now() - lastLeft.left_at.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < COOLDOWN_DAYS) {
        const remaining = Math.ceil(COOLDOWN_DAYS - daysSince)
        return res.status(400).json({ error: `Target is on cooldown: ${remaining} day(s) remaining` })
      }
    }

    await prisma.lg_family_invites.create({
      data: {
        family_id: membership.family_id,
        from_userid: userId,
        to_userid: targetUserId,
      },
    })

    return res.status(200).json({ success: true })
  },
})
