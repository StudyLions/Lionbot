// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Bulk economy operations - give/take/set/reset coins
//          for all, active, or inactive members with audit trail
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const target = (req.query.target as string) || "all"
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    let count: number
    if (target === "active") {
      const result = await prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT m.userid) as cnt
        FROM members m
        WHERE m.guildid = ${guildId}
          AND EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND ct.actorid = m.userid
              AND ct.created_at >= ${thirtyDaysAgo}
          )
      `
      count = Number(result[0]?.cnt || 0)
    } else if (target === "inactive") {
      const result = await prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(*) as cnt
        FROM members m
        WHERE m.guildid = ${guildId}
          AND NOT EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND ct.actorid = m.userid
              AND ct.created_at >= ${thirtyDaysAgo}
          )
      `
      count = Number(result[0]?.cnt || 0)
    } else {
      count = await prisma.members.count({ where: { guildid: guildId } })
    }

    res.status(200).json({ count })
  },

  async POST(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { operation, amount, target, reason } = req.body as {
      operation: "give" | "take" | "set" | "reset"
      amount?: number
      target: "all" | "active" | "inactive"
      reason?: string
    }

    if (!["give", "take", "set", "reset"].includes(operation)) {
      return res.status(400).json({ error: "Operation must be give, take, set, or reset" })
    }
    if (!["all", "active", "inactive"].includes(target)) {
      return res.status(400).json({ error: "Target must be all, active, or inactive" })
    }
    if (operation !== "reset" && (amount === undefined || typeof amount !== "number" || amount < 0)) {
      return res.status(400).json({ error: "Amount must be a non-negative number for give/take/set" })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    let memberFilter: any = { guildid: guildId }
    if (target === "active") {
      const activeIds = await prisma.$queryRaw<Array<{ userid: bigint }>>`
        SELECT DISTINCT m.userid
        FROM members m
        WHERE m.guildid = ${guildId}
          AND EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND ct.actorid = m.userid
              AND ct.created_at >= ${thirtyDaysAgo}
          )
      `
      memberFilter.userid = { in: activeIds.map((r) => r.userid) }
    } else if (target === "inactive") {
      const inactiveIds = await prisma.$queryRaw<Array<{ userid: bigint }>>`
        SELECT m.userid
        FROM members m
        WHERE m.guildid = ${guildId}
          AND NOT EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND ct.actorid = m.userid
              AND ct.created_at >= ${thirtyDaysAgo}
          )
      `
      memberFilter.userid = { in: inactiveIds.map((r) => r.userid) }
    }

    const members = await prisma.members.findMany({
      where: memberFilter,
      select: { userid: true, coins: true },
    })

    if (members.length === 0) {
      return res.status(200).json({ affected: 0, message: "No members matched the target criteria" })
    }

    const BATCH_SIZE = 100
    let affected = 0
    const reasonStr = reason?.trim() || `Bulk ${operation} via dashboard`

    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE)
      const ops: any[] = []

      for (const m of batch) {
        const currentCoins = m.coins || 0
        let newCoins: number
        let txAmount: number

        switch (operation) {
          case "give":
            newCoins = currentCoins + (amount as number)
            txAmount = amount as number
            break
          case "take":
            newCoins = Math.max(0, currentCoins - (amount as number))
            txAmount = -(Math.min(currentCoins, amount as number))
            break
          case "set":
            newCoins = amount as number
            txAmount = (amount as number) - currentCoins
            break
          case "reset":
            newCoins = 0
            txAmount = -currentCoins
            break
          default:
            continue
        }

        if (txAmount === 0 && operation !== "set") continue

        ops.push(
          prisma.members.update({
            where: { guildid_userid: { guildid: guildId, userid: m.userid } },
            data: { coins: newCoins },
          })
        )
        ops.push(
          prisma.coin_transactions.create({
            data: {
              transactiontype: "ADMIN",
              guildid: guildId,
              actorid: auth.userId,
              amount: txAmount,
              bonus: 0,
              from_account: txAmount < 0 ? m.userid : null,
              to_account: txAmount >= 0 ? m.userid : null,
            },
          })
        )
      }

      if (ops.length > 0) {
        await prisma.$transaction(ops)
        affected += batch.length
      }
    }

    const opLabels: Record<string, string> = {
      give: `Gave ${amount?.toLocaleString()} coins to`,
      take: `Took ${amount?.toLocaleString()} coins from`,
      set: `Set balance to ${amount?.toLocaleString()} for`,
      reset: "Reset balance to 0 for",
    }

    res.status(200).json({
      affected,
      message: `${opLabels[operation]} ${affected} members. Reason: ${reasonStr}`,
    })
  },
})
