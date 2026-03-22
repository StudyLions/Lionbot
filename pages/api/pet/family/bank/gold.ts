// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Family treasury - deposit/withdraw gold with daily cap
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
import { hasPermission } from "@/utils/familyPermissions"

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
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const [dailyWithdrawals, recentLog] = await Promise.all([
      prisma.lg_family_gold_withdrawals.aggregate({
        where: {
          family_id: family.family_id,
          userid: userId,
          withdrawn_at: { gte: todayStart },
        },
        _sum: { amount: true },
      }),
      prisma.lg_family_gold_log.findMany({
        where: { family_id: family.family_id },
        orderBy: { created_at: "desc" },
        take: 20,
      }),
    ])

    const depositorIds = [...new Set(recentLog.map((l) => l.userid))]
    const depositorPets = await prisma.lg_pets.findMany({
      where: { userid: { in: depositorIds } },
      select: { userid: true, pet_name: true },
    })
    const nameMap = new Map(depositorPets.map((p) => [p.userid.toString(), p.pet_name]))

    return res.status(200).json({
      balance: family.gold.toString(),
      dailyUsed: dailyWithdrawals._sum.amount ?? 0,
      dailyCap: family.daily_gold_withdraw_cap,
      log: recentLog.map((l) => ({
        logId: l.log_id,
        userId: l.userid.toString(),
        userName: nameMap.get(l.userid.toString()) ?? "Unknown",
        amount: l.amount,
        action: l.action,
        description: l.description,
        createdAt: l.created_at.toISOString(),
      })),
    })
  },

  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const { action, amount } = req.body

    if (!action || !["deposit", "withdraw"].includes(action)) {
      return res.status(400).json({ error: "action must be 'deposit' or 'withdraw'" })
    }
    const numAmount = parseInt(amount, 10)
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive integer" })
    }

    const membership = await prisma.lg_family_members.findFirst({
      where: { userid: userId, left_at: null },
      include: { lg_families: true },
    })
    if (!membership) return res.status(403).json({ error: "You are not in a family" })

    const family = membership.lg_families

    if (action === "deposit") {
      if (!hasPermission(membership.role, "deposit_gold", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to deposit gold" })
      }

      const userConfig = await prisma.user_config.findUnique({
        where: { userid: userId },
        select: { gold: true },
      })
      if (!userConfig || userConfig.gold < BigInt(numAmount)) {
        return res.status(400).json({ error: "Not enough gold" })
      }

      await prisma.$transaction([
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { decrement: numAmount } },
        }),
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { increment: numAmount } },
        }),
        prisma.lg_family_gold_log.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: numAmount,
            action: "DEPOSIT",
            description: `Deposited ${numAmount.toLocaleString()} gold`,
          },
        }),
      ])

      return res.status(200).json({ success: true, action: "deposited", amount: numAmount })
    }

    if (action === "withdraw") {
      if (!hasPermission(membership.role, "withdraw_gold", family.role_permissions)) {
        return res.status(403).json({ error: "You don't have permission to withdraw gold" })
      }

      if (family.gold < BigInt(numAmount)) {
        return res.status(400).json({ error: "Not enough gold in the treasury" })
      }

      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      const dailyWithdrawals = await prisma.lg_family_gold_withdrawals.aggregate({
        where: {
          family_id: family.family_id,
          userid: userId,
          withdrawn_at: { gte: todayStart },
        },
        _sum: { amount: true },
      })

      const dailyUsed = dailyWithdrawals._sum.amount ?? 0
      if (dailyUsed + numAmount > family.daily_gold_withdraw_cap) {
        const remaining = family.daily_gold_withdraw_cap - dailyUsed
        return res.status(400).json({
          error: `Daily withdrawal cap exceeded. You can withdraw ${Math.max(0, remaining).toLocaleString()} more today.`,
        })
      }

      await prisma.$transaction([
        prisma.lg_families.update({
          where: { family_id: family.family_id },
          data: { gold: { decrement: numAmount } },
        }),
        prisma.user_config.update({
          where: { userid: userId },
          data: { gold: { increment: numAmount } },
        }),
        prisma.lg_family_gold_log.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: -numAmount,
            action: "WITHDRAW",
            description: `Withdrew ${numAmount.toLocaleString()} gold`,
          },
        }),
        prisma.lg_family_gold_withdrawals.create({
          data: {
            family_id: family.family_id,
            userid: userId,
            amount: numAmount,
          },
        }),
      ])

      return res.status(200).json({ success: true, action: "withdrawn", amount: numAmount })
    }
  },
})
