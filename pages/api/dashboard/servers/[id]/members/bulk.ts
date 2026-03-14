// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Bulk operations on multiple members (coins, warnings)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { userIds, operation, amount, reason } = req.body as {
      userIds: string[]
      operation: "coins" | "warn"
      amount?: number
      reason?: string
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "At least one user ID is required" })
    }
    if (userIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 members per bulk operation" })
    }
    if (!["coins", "warn"].includes(operation)) {
      return res.status(400).json({ error: "Operation must be 'coins' or 'warn'" })
    }

    const targetUserIds = userIds.map((id) => BigInt(id))
    let affected = 0

    if (operation === "coins") {
      if (amount === undefined || typeof amount !== "number") {
        return res.status(400).json({ error: "Amount is required for coin adjustment" })
      }

      const members = await prisma.members.findMany({
        where: { guildid: guildId, userid: { in: targetUserIds } },
        select: { userid: true, coins: true },
      })

      const updates = members.map((m) =>
        prisma.$transaction([
          prisma.members.update({
            where: { guildid_userid: { guildid: guildId, userid: m.userid } },
            data: { coins: Math.max(0, (m.coins || 0) + amount) },
          }),
          prisma.coin_transactions.create({
            data: {
              transactiontype: "ADMIN",
              guildid: guildId,
              actorid: auth.userId,
              amount: Math.abs(amount),
              bonus: 0,
              from_account: amount < 0 ? m.userid : null,
              to_account: amount >= 0 ? m.userid : null,
            },
          }),
        ])
      )

      await Promise.all(updates)
      affected = members.length
    } else if (operation === "warn") {
      if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        return res.status(400).json({ error: "Reason is required for bulk warning" })
      }

      const members = await prisma.members.findMany({
        where: { guildid: guildId, userid: { in: targetUserIds } },
        select: { userid: true },
      })

      await prisma.tickets.createMany({
        data: members.map((m) => ({
          guildid: guildId,
          targetid: m.userid,
          ticket_type: "WARNING" as const,
          ticket_state: "OPEN" as const,
          moderator_id: auth.userId,
          content: reason.trim(),
          auto: false,
        })),
      })

      affected = members.length
    }

    res.status(200).json({ affected, message: `${operation} applied to ${affected} members` })
  },
})
