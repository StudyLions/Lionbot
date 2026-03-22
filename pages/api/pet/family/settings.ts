// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: GET/POST family settings (name, description, icon)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { hasPermission } from "@/utils/familyPermissions"

const NAME_CHANGE_GEM_COST = 500
const ICON_CHANGE_GEM_COST = 200
const NAME_REGEX = /^[a-zA-Z0-9 ]{2,32}$/

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

    const family = membership.lg_families

    return res.status(200).json({
      name: family.name,
      description: family.description,
      iconUrl: family.icon_url,
      dailyGoldWithdrawCap: family.daily_gold_withdraw_cap,
      nameChangeGemCost: NAME_CHANGE_GEM_COST,
      iconChangeGemCost: ICON_CHANGE_GEM_COST,
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { name, description, iconUrl } = req.body

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    if (!hasPermission(membership.role, "edit_settings", membership.lg_families.role_permissions)) {
      return res.status(403).json({ error: "You don't have permission to edit settings" })
    }

    const updates: Record<string, any> = {}
    let gemsNeeded = 0

    if (name !== undefined) {
      const trimmedName = (name as string).trim()
      if (!NAME_REGEX.test(trimmedName)) {
        return res.status(400).json({ error: "Name must be 2-32 characters, alphanumeric + spaces only" })
      }
      if (trimmedName !== membership.lg_families.name) {
        const nameExists = await prisma.lg_families.findUnique({
          where: { name: trimmedName },
          select: { family_id: true },
        })
        if (nameExists) return res.status(400).json({ error: "A family with that name already exists" })
        updates.name = trimmedName
        gemsNeeded += NAME_CHANGE_GEM_COST
      }
    }

    if (iconUrl !== undefined) {
      if (iconUrl !== null && typeof iconUrl === "string" && iconUrl.length > 256) {
        return res.status(400).json({ error: "Icon URL too long (max 256 characters)" })
      }
      if (iconUrl !== membership.lg_families.icon_url) {
        updates.icon_url = iconUrl || null
        gemsNeeded += ICON_CHANGE_GEM_COST
      }
    }

    if (description !== undefined) {
      if (typeof description === "string" && description.length > 500) {
        return res.status(400).json({ error: "Description too long (max 500 characters)" })
      }
      updates.description = (description as string) ?? ""
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No changes provided" })
    }

    if (gemsNeeded > 0) {
      const userConfig = await prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gems: true },
      })
      if (!userConfig || (userConfig.gems ?? 0) < gemsNeeded) {
        return res.status(400).json({ error: `Not enough gems. Need ${gemsNeeded}` })
      }

      await prisma.$transaction([
        prisma.user_config.update({
          where: { userid: userId },
          data: { gems: { decrement: gemsNeeded } },
        }),
        prisma.lg_families.update({
          where: { family_id: membership.family_id },
          data: updates,
        }),
      ])
    } else {
      await prisma.lg_families.update({
        where: { family_id: membership.family_id },
        data: updates,
      })
    }

    return res.status(200).json({ success: true, gemsSpent: gemsNeeded })
  },
})
