// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Adjust a member's coin balance with proper audit trail
//          (creates coin_transactions unlike the bot's /economy command)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const targetUserId = BigInt(req.query.userId as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const { action, amount } = req.body as {
      action: "add" | "set" | "reset"
      amount?: number
    }

    if (!["add", "set", "reset"].includes(action)) {
      return res.status(400).json({ error: "Action must be 'add', 'set', or 'reset'" })
    }
    if (action !== "reset" && (amount === undefined || typeof amount !== "number")) {
      return res.status(400).json({ error: "Amount is required for add/set actions" })
    }

    const member = await prisma.members.findUnique({
      where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
      select: { coins: true },
    })
    if (!member) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    const currentCoins = member.coins || 0
    let newCoins: number
    let transactionAmount: number

    switch (action) {
      case "add":
        newCoins = currentCoins + (amount as number)
        transactionAmount = amount as number
        break
      case "set":
        newCoins = amount as number
        transactionAmount = (amount as number) - currentCoins
        break
      case "reset":
        newCoins = 0
        transactionAmount = -currentCoins
        break
      default:
        return res.status(400).json({ error: "Invalid action" })
    }

    if (newCoins < 0) newCoins = 0

    await prisma.$transaction([
      prisma.members.update({
        where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
        data: { coins: newCoins },
      }),
      prisma.coin_transactions.create({
        data: {
          transactiontype: "ADMIN",
          guildid: guildId,
          actorid: auth.userId,
          amount: Math.abs(transactionAmount),
          bonus: 0,
          from_account: transactionAmount < 0 ? targetUserId : null,
          to_account: transactionAmount >= 0 ? targetUserId : null,
        },
      }),
    ])

    res.status(200).json({
      previousBalance: currentCoins,
      newBalance: newCoins,
      message: `Balance updated: ${currentCoins} -> ${newCoins}`,
    })
  },
})
