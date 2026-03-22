// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: GET/POST family role permissions
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import {
  hasPermission,
  getEffectivePermissions,
  canEditRolePerms,
  PERMISSION_KEYS,
  PERMISSION_LABELS,
} from "@/utils/familyPermissions"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const effective = getEffectivePermissions(membership.lg_families.role_permissions)

    return res.status(200).json({
      permissions: effective,
      permissionKeys: PERMISSION_KEYS,
      permissionLabels: PERMISSION_LABELS,
      yourRole: membership.role,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { permissions } = req.body

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({ error: "permissions object required" })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (membership.role !== "LEADER" && membership.role !== "ADMIN") {
      return res.status(403).json({ error: "Only leaders and admins can edit permissions" })
    }

    const validated: Record<string, Record<string, boolean>> = {}

    for (const role of ["ADMIN", "MODERATOR", "MEMBER"]) {
      if (!permissions[role]) continue

      if (!canEditRolePerms(membership.role, role)) {
        return res.status(403).json({ error: `You cannot edit permissions for ${role}` })
      }

      validated[role] = {}
      for (const key of PERMISSION_KEYS) {
        if (typeof permissions[role][key] === "boolean") {
          validated[role][key] = permissions[role][key]
        }
      }
    }

    const current = (typeof membership.lg_families.role_permissions === "object" && membership.lg_families.role_permissions !== null)
      ? membership.lg_families.role_permissions as Record<string, Record<string, boolean>>
      : {}

    const merged = { ...current }
    for (const role of Object.keys(validated)) {
      merged[role] = { ...(merged[role] ?? {}), ...validated[role] }
    }

    await prisma.lg_families.update({
      where: { family_id: membership.family_id },
      data: { role_permissions: merged as any },
    })

    return res.status(200).json({ success: true })
  },
})
