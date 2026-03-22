// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Create a new family (costs 10,000 gold)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const CREATION_COST = BigInt(10000)
const COOLDOWN_DAYS = 7
const NAME_REGEX = /^[a-zA-Z0-9 ]{2,32}$/

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { name } = req.body

    if (!name || typeof name !== "string" || !NAME_REGEX.test(name.trim())) {
      return res.status(400).json({ error: "Name must be 2-32 characters, alphanumeric + spaces only" })
    }
    const trimmedName = name.trim()

    const [pet, activeMembership, userConfig, nameExists] = await Promise.all([
      prisma.lg_pets.findUnique({ where: { userid: userId }, select: { userid: true } }),
      prisma.lg_family_members.findFirst({ where: { userid: userId, left_at: null } }),
      prisma.user_config.findUnique({ where: { userid: userId }, select: { gold: true } }),
      prisma.lg_families.findUnique({ where: { name: trimmedName }, select: { family_id: true } }),
    ])

    if (!pet) return res.status(400).json({ error: "You need a pet to create a family" })
    if (activeMembership) return res.status(400).json({ error: "You are already in a family" })
    if (!userConfig || userConfig.gold < CREATION_COST) {
      return res.status(400).json({ error: `Not enough gold. Need ${CREATION_COST.toString()}` })
    }
    if (nameExists) return res.status(400).json({ error: "A family with that name already exists" })

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

    const result = await prisma.$transaction(async (tx) => {
      await tx.user_config.update({
        where: { userid: userId },
        data: { gold: { decrement: Number(CREATION_COST) } },
      })

      const family = await tx.lg_families.create({
        data: { name: trimmedName, leader_userid: userId },
      })

      await tx.lg_family_members.create({
        data: { family_id: family.family_id, userid: userId, role: "LEADER" },
      })

      await tx.lg_family_farms.create({
        data: { family_id: family.family_id, farm_index: 0 },
      })

      await tx.lg_family_farm_plots.createMany({
        data: Array.from({ length: 15 }, (_, i) => ({
          family_id: family.family_id,
          farm_index: 0,
          plot_id: i,
        })),
      })

      return family
    })

    return res.status(200).json({
      familyId: result.family_id,
      name: result.name,
    })
  },
})
