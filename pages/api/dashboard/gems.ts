// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Gems/Premium API - LionGems balance and transactions
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = auth.userId

    // Gem balance from user_config
    const userConfig = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { gems: true },
    })
    const gemBalance = userConfig?.gems ?? 0

    // Recent gem transactions (user is sender or recipient)
    const rawTransactions = await prisma.gem_transactions.findMany({
      where: {
        OR: [{ from_account: userId }, { to_account: userId }],
      },
      orderBy: { timestamp: "desc" },
      take: 50,
    })

    const transactions = rawTransactions.map((tx) => {
      const isCredit = tx.to_account?.toString() === userId.toString()
      const userAmount = isCredit ? tx.amount : -tx.amount
      return {
        transactionId: tx.transactionid,
        type: tx.transaction_type,
        amount: tx.amount,
        userAmount,
        description: tx.description,
        note: tx.note,
        timestamp: tx.timestamp?.toISOString() ?? null,
        fromAccount: tx.from_account?.toString() ?? null,
        toAccount: tx.to_account?.toString() ?? null,
      }
    })

    // Premium guild IDs (guilds user has contributed gems to)
    const contributions = await prisma.premium_guild_contributions.findMany({
      where: { userid: userId },
      select: { guildid: true },
      distinct: ["guildid"],
    })
    const premiumGuildIds = contributions.map((c) => c.guildid.toString())

    res.status(200).json({
      gemBalance,
      transactions,
      premiumGuildIds,
    })
  },
})
// --- END AI-MODIFIED ---
