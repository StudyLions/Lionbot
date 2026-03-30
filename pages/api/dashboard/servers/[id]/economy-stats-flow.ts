// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-30
// Purpose: Transaction-heavy economy analytics (daily flow,
//          income/spending breakdown, top earners).
//          Split from economy-stats.ts for progressive loading
//          so large servers don't time out.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setUTCHours(0, 0, 0, 0)
    const weekStart = new Date(now)
    weekStart.setUTCDate(weekStart.getUTCDate() - 7)
    const lastWeekStart = new Date(now)
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 14)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

    const [
      dailyFlowRaw,
      thisWeekFlow,
      lastWeekFlow,
      todayFlow,
      activeMembers7d,
      incomeRaw,
      spendingRaw,
      topEarnersRaw,
      shopRevenue30d,
    ] = await Promise.all([
      prisma.$queryRaw<Array<{ day: string; earned: bigint; spent: bigint; tx_count: bigint }>>`
        SELECT
          to_char(created_at, 'YYYY-MM-DD') as day,
          COALESCE(SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END), 0) as earned,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as spent,
          COUNT(*) as tx_count
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${thirtyDaysAgo}
        GROUP BY day
        ORDER BY day
      `,

      prisma.$queryRaw<[{ earned: bigint; spent: bigint }]>`
        SELECT
          COALESCE(SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END), 0) as earned,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as spent
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${weekStart}
      `,

      prisma.$queryRaw<[{ earned: bigint; spent: bigint }]>`
        SELECT
          COALESCE(SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END), 0) as earned,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as spent
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${lastWeekStart} AND created_at < ${weekStart}
      `,

      prisma.$queryRaw<[{ earned: bigint; spent: bigint }]>`
        SELECT
          COALESCE(SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END), 0) as earned,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as spent
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${todayStart}
      `,

      prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT actorid) as cnt
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${weekStart}
      `,

      prisma.$queryRaw<Array<{ transactiontype: string; total: bigint; cnt: bigint }>>`
        SELECT transactiontype::text, SUM(amount) as total, COUNT(*) as cnt
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${thirtyDaysAgo} AND amount >= 0
        GROUP BY transactiontype
        ORDER BY total DESC
      `,

      prisma.$queryRaw<Array<{ transactiontype: string; total: bigint; cnt: bigint }>>`
        SELECT transactiontype::text, SUM(ABS(amount)) as total, COUNT(*) as cnt
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${thirtyDaysAgo} AND amount < 0
        GROUP BY transactiontype
        ORDER BY total DESC
      `,

      prisma.$queryRaw<Array<{ userid: bigint; total_earned: bigint }>>`
        SELECT actorid as userid, SUM(amount) as total_earned
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${weekStart} AND amount > 0
        GROUP BY actorid
        ORDER BY total_earned DESC
        LIMIT 5
      `,

      prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COALESCE(SUM(ABS(amount)), 0) as total
        FROM coin_transactions
        WHERE guildid = ${guildId}
          AND transactiontype = 'SHOP_PURCHASE'
          AND created_at >= ${thirtyDaysAgo}
          AND amount < 0
      `,
    ])

    const dailyFlowMap = new Map<string, { earned: number; spent: number; transactions: number }>()
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo)
      date.setUTCDate(date.getUTCDate() + d)
      dailyFlowMap.set(date.toISOString().slice(0, 10), { earned: 0, spent: 0, transactions: 0 })
    }
    for (const row of dailyFlowRaw) {
      const entry = dailyFlowMap.get(row.day)
      if (entry) {
        entry.earned = Number(row.earned)
        entry.spent = Number(row.spent)
        entry.transactions = Number(row.tx_count)
      }
    }
    const dailyFlow = Array.from(dailyFlowMap.entries()).map(([date, data]) => ({ date, ...data }))

    const earnerUserIds = topEarnersRaw.map((e) => e.userid)
    const earnerMembers = earnerUserIds.length > 0
      ? await prisma.members.findMany({
          where: { guildid: guildId, userid: { in: earnerUserIds } },
          select: { userid: true, display_name: true, user_config: { select: { avatar_hash: true, name: true } } },
        })
      : []
    const earnerMap = new Map(earnerMembers.map((m) => [m.userid.toString(), m]))

    const missingEarnerIds = earnerUserIds.filter((uid) => !earnerMap.has(uid.toString()))
    const globalEarners = missingEarnerIds.length > 0
      ? await prisma.user_config.findMany({
          where: { userid: { in: missingEarnerIds } },
          select: { userid: true, name: true, avatar_hash: true },
        })
      : []
    const globalEarnerMap = new Map(globalEarners.map((u) => [u.userid.toString(), u]))

    const topEarnersWeek = topEarnersRaw.map((e) => {
      const uid = e.userid.toString()
      const member = earnerMap.get(uid)
      const global = globalEarnerMap.get(uid)
      const displayName = member?.display_name || member?.user_config?.name || global?.name || `User ${uid}`
      const avatarHash = member?.user_config?.avatar_hash ?? global?.avatar_hash ?? null
      return {
        userId: uid,
        displayName,
        avatarUrl: buildAvatarUrl(uid, avatarHash),
        earned: Number(e.total_earned),
      }
    })

    const earnedWeek = Number(thisWeekFlow[0]?.earned || 0)
    const spentWeek = Number(thisWeekFlow[0]?.spent || 0)

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
    res.status(200).json({
      summary: {
        activeMembers7d: Number(activeMembers7d[0]?.cnt || 0),
        coinsEarnedToday: Number(todayFlow[0]?.earned || 0),
        coinsSpentToday: Number(todayFlow[0]?.spent || 0),
        coinsEarnedWeek: earnedWeek,
        coinsSpentWeek: spentWeek,
        coinsEarnedLastWeek: Number(lastWeekFlow[0]?.earned || 0),
        coinsSpentLastWeek: Number(lastWeekFlow[0]?.spent || 0),
        netFlowWeek: earnedWeek - spentWeek,
      },
      dailyFlow,
      incomeBreakdown: incomeRaw.map((r) => ({
        type: r.transactiontype,
        total: Number(r.total),
        count: Number(r.cnt),
      })),
      spendingBreakdown: spendingRaw.map((r) => ({
        type: r.transactiontype,
        total: Number(r.total),
        count: Number(r.cnt),
      })),
      topEarnersWeek,
      shopRevenue30d: Number(shopRevenue30d[0]?.total || 0),
    })
  },
})
