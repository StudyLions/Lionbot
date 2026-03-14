// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Refund a specific coin transaction, creating a REFUND
//          record and reversing the coin amount on the member
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const guildId = BigInt(req.query.id as string)
    const targetUserId = BigInt(req.query.userId as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { transactionId, reason } = req.body
    if (!transactionId || typeof transactionId !== "number") {
      return res.status(400).json({ error: "Transaction ID is required" })
    }

    const original = await prisma.coin_transactions.findUnique({
      where: { transactionid: transactionId },
      select: {
        transactionid: true,
        transactiontype: true,
        guildid: true,
        actorid: true,
        amount: true,
        from_account: true,
        to_account: true,
      },
    })

    if (!original || original.guildid !== guildId) {
      return res.status(404).json({ error: "Transaction not found in this server" })
    }

    if (original.transactiontype === "REFUND") {
      return res.status(400).json({ error: "Cannot refund a refund" })
    }

    const existingRefund = await prisma.coin_transactions.findFirst({
      where: { refunds: transactionId, transactiontype: "REFUND" },
      select: { transactionid: true },
    })

    if (existingRefund) {
      return res.status(400).json({ error: "This transaction has already been refunded" })
    }

    const involvesMember =
      original.actorid === targetUserId ||
      original.from_account === targetUserId ||
      original.to_account === targetUserId
    if (!involvesMember) {
      return res.status(400).json({ error: "Transaction does not involve this member" })
    }

    const wasIncoming = original.to_account === targetUserId
    const coinAdjustment = wasIncoming ? -original.amount : original.amount

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { coins: true },
    })
    if (!member) {
      return res.status(404).json({ error: "Member not found" })
    }

    const newBalance = Math.max(0, (member.coins || 0) + coinAdjustment)

    await prisma.$transaction([
      prisma.members.update({
        where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
        data: { coins: newBalance },
      }),
      prisma.coin_transactions.create({
        data: {
          transactiontype: "REFUND",
          guildid: guildId,
          actorid: auth.userId,
          amount: original.amount,
          bonus: 0,
          from_account: wasIncoming ? targetUserId : null,
          to_account: wasIncoming ? null : targetUserId,
          refunds: transactionId,
        },
      }),
    ])

    res.status(201).json({
      message: `Refunded ${original.amount} coins (balance: ${newBalance})`,
      previousBalance: member.coins || 0,
      newBalance,
    })
  },
})
