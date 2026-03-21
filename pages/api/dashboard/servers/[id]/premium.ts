// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server premium purchase API - deduct gems, extend premium
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-03-21) ---
// Purpose: import requireAdmin + parseBigInt to enforce admin-only premium purchases
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

const PLANS = {
  monthly: { cost: 1500, durationDays: 30 },
  quarterly: { cost: 4000, durationDays: 90 },
  yearly: { cost: 12000, durationDays: 365 },
} as const

type PlanKey = keyof typeof PLANS

export default apiHandler({
  async POST(req, res) {
    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: require admin permission so only server admins can purchase premium
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return
    // --- END AI-MODIFIED ---
    const { plan } = req.body as { plan?: string }

    if (!plan || !(plan in PLANS)) {
      return res.status(400).json({
        error: "Invalid plan. Use monthly, quarterly, or yearly.",
      })
    }

    const { cost, durationDays } = PLANS[plan as PlanKey]
    const userId = auth.userId

    const userConfig = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gems: true },
    })

    const gems = userConfig?.gems ?? 0
    if (gems < cost) {
      return res.status(400).json({
        error: "Not enough gems",
        needed: cost,
        balance: gems,
      })
    }

    const now = new Date()
    const durationSeconds = durationDays * 24 * 60 * 60

    const { newPremiumUntil } = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE user_config
        SET gems = gems - ${cost}
        WHERE userid = ${userId}
      `

      const txn = await tx.gem_transactions.create({
        data: {
          transaction_type: "PURCHASE",
          actorid: userId,
          from_account: userId,
          to_account: null,
          amount: -cost,
          description: `Server premium: ${plan}`,
          note: null,
          reference: null,
        },
      })

      const existing = await tx.premium_guilds.findUnique({
        where: { guildid: guildId },
      })

      let newPremiumUntil: Date
      if (existing && existing.premium_until > now) {
        newPremiumUntil = new Date(existing.premium_until.getTime() + durationSeconds * 1000)
        await tx.premium_guilds.update({
          where: { guildid: guildId },
          data: { premium_until: newPremiumUntil },
        })
      } else if (existing) {
        newPremiumUntil = new Date(now.getTime() + durationSeconds * 1000)
        await tx.premium_guilds.update({
          where: { guildid: guildId },
          data: {
            premium_since: now,
            premium_until: newPremiumUntil,
          },
        })
      } else {
        newPremiumUntil = new Date(now.getTime() + durationSeconds * 1000)
        await tx.premium_guilds.create({
          data: {
            guildid: guildId,
            premium_since: now,
            premium_until: newPremiumUntil,
          },
        })
      }

      await tx.premium_guild_contributions.create({
        data: {
          userid: userId,
          guildid: guildId,
          transactionid: txn.transactionid,
          duration: durationSeconds,
        },
      })

      return { newPremiumUntil }
    })

    const updatedUser = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gems: true },
    })

    return res.status(200).json({
      success: true,
      premiumUntil: newPremiumUntil.toISOString(),
      newBalance: updatedUser?.gems ?? gems - cost,
    })
  },
})
