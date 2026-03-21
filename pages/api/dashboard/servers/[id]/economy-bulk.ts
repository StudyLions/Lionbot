// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Bulk economy operations - give/take/set/reset coins
//          for all, active, or inactive members with audit trail
// ============================================================
import { prisma } from "@/utils/prisma"
import { Prisma } from "@prisma/client"
import { requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID from query
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const target = (req.query.target as string) || "all"
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: only count current members (exclude those who left)
    let count: number
    if (target === "active") {
      const result = await prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT m.userid) as cnt
        FROM members m
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL
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
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND ct.actorid = m.userid
              AND ct.created_at >= ${thirtyDaysAgo}
          )
      `
      count = Number(result[0]?.cnt || 0)
    } else {
      count = await prisma.members.count({ where: { guildid: guildId, last_left: null } })
    }
    // --- END AI-MODIFIED ---

    res.status(200).json({ count })
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
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

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: only target current members (exclude those who left)
    let memberFilter: any = { guildid: guildId, last_left: null }
    if (target === "active") {
      const activeIds = await prisma.$queryRaw<Array<{ userid: bigint }>>`
        SELECT DISTINCT m.userid
        FROM members m
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL
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
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL
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
      select: { userid: true },
    })

    if (members.length === 0) {
      return res.status(200).json({ affected: 0, message: "No members matched the target criteria" })
    }

    // --- AI-REPLACED (2026-03-20) ---
    // Reason: Read-compute-write pattern allows race conditions where concurrent
    //         admin operations could double-credit/double-debit users
    // What the new code does better: Uses atomic SQL UPDATE (coins = coins + amount)
    //         so each operation is safe against concurrent access
    // --- Original code (commented out for rollback) ---
    // for (let i = 0; i < members.length; i += BATCH_SIZE) {
    //   const batch = members.slice(i, i + BATCH_SIZE)
    //   for (const m of batch) {
    //     const currentCoins = m.coins || 0; let newCoins, txAmount;
    //     switch (operation) { case "give": newCoins = currentCoins + amount; ... }
    //     ops.push(prisma.members.update({ data: { coins: newCoins } }))
    //   }
    //   await prisma.$transaction(ops)
    // }
    // --- End original code ---

    const memberIds = members.map((m) => m.userid)
    const reasonStr = reason?.trim() || `Bulk ${operation} via dashboard`
    let affected = 0

    const BATCH_SIZE = 100
    for (let i = 0; i < memberIds.length; i += BATCH_SIZE) {
      const batchIds = memberIds.slice(i, i + BATCH_SIZE)

      await prisma.$transaction(async (tx) => {
        switch (operation) {
          case "give":
            await tx.$executeRaw`
              UPDATE members SET coins = COALESCE(coins, 0) + ${amount as number}
              WHERE guildid = ${guildId} AND userid IN (${Prisma.join(batchIds)})
            `
            break
          case "take":
            await tx.$executeRaw`
              UPDATE members SET coins = GREATEST(0, COALESCE(coins, 0) - ${amount as number})
              WHERE guildid = ${guildId} AND userid IN (${Prisma.join(batchIds)})
            `
            break
          case "set":
            await tx.$executeRaw`
              UPDATE members SET coins = ${amount as number}
              WHERE guildid = ${guildId} AND userid IN (${Prisma.join(batchIds)})
            `
            break
          case "reset":
            await tx.$executeRaw`
              UPDATE members SET coins = 0
              WHERE guildid = ${guildId} AND userid IN (${Prisma.join(batchIds)})
            `
            break
        }

        const txAmount = operation === "reset" ? 0 : (amount as number)
        const txOps = batchIds.map((uid) =>
          tx.coin_transactions.create({
            data: {
              transactiontype: "ADMIN",
              guildid: guildId,
              actorid: auth.userId,
              amount: operation === "take" ? -(txAmount) : operation === "reset" ? 0 : txAmount,
              bonus: 0,
              from_account: (operation === "take" || operation === "reset") ? uid : null,
              to_account: (operation === "give" || operation === "set") ? uid : null,
            },
          })
        )
        await Promise.all(txOps)
      })

      affected += batchIds.length
    }
    // --- END AI-REPLACED ---

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
