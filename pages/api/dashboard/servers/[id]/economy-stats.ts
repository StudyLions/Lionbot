// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Comprehensive economy analytics - summary stats,
//          30-day flow, income/spending breakdown, distribution,
//          shop analytics, and health tips
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function buildAvatarUrl(userId: string, avatarHash: string | null): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`
  }
  const index = Number(BigInt(userId) % BigInt(5))
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

function generateHealthTips(data: {
  totalCoins: number
  memberCount: number
  earnedWeek: number
  spentWeek: number
  distribution: { zero: number; low: number; medium: number; high: number; whale: number }
  topHolderCoins: number
  neverPurchased: number
  totalShopItems: number
  activeRooms: number
  coinsInRoomBanks: number
  inactiveWealth: number
  inactiveWealthPct: number
}): string[] {
  const tips: string[] = []
  const { totalCoins, earnedWeek, spentWeek, distribution, topHolderCoins, neverPurchased, totalShopItems, activeRooms, coinsInRoomBanks, inactiveWealth, inactiveWealthPct } = data

  if (totalCoins > 0 && earnedWeek > 0 && spentWeek > 0) {
    const ratio = earnedWeek / Math.max(spentWeek, 1)
    if (ratio > 3) {
      tips.push(`Your economy generated ${ratio.toFixed(1)}x more coins than were spent this week. Consider adding more coin sinks like shop items or increasing prices.`)
    } else if (ratio < 0.5 && earnedWeek > 0) {
      tips.push(`Members are spending more than they earn (${(1 / ratio).toFixed(1)}x). If this continues, balances will drain. Consider increasing study rewards.`)
    }
  }

  if (totalCoins > 0 && topHolderCoins > 0) {
    const top5Pct = Math.round((topHolderCoins / totalCoins) * 100)
    if (top5Pct > 70) {
      tips.push(`The top 5 members hold ${top5Pct}% of all coins. Consider ways for newer members to earn faster, like task rewards or starting funds.`)
    }
  }

  if (totalShopItems > 0 && neverPurchased > 0) {
    if (neverPurchased === totalShopItems) {
      tips.push(`None of your ${totalShopItems} shop items have been purchased. Prices may be too high, or members may not know about the shop.`)
    } else if (neverPurchased > totalShopItems / 2) {
      tips.push(`${neverPurchased} of ${totalShopItems} shop items have never been purchased. Consider lowering their prices.`)
    }
  }

  if (activeRooms > 0 && coinsInRoomBanks > 0 && totalCoins > 0) {
    const roomPct = Math.round((coinsInRoomBanks / totalCoins) * 100)
    if (roomPct > 20) {
      tips.push(`${coinsInRoomBanks.toLocaleString()} coins (${roomPct}% of circulation) are locked in room banks and not actively circulating.`)
    }
  }

  if (inactiveWealthPct > 40 && inactiveWealth > 0) {
    tips.push(`${inactiveWealthPct}% of coins belong to members inactive for 30+ days. Consider a coin decay system or redistribute through events.`)
  }

  if (distribution.zero > 0 && data.memberCount > 0) {
    const zeroPct = Math.round((distribution.zero / data.memberCount) * 100)
    if (zeroPct > 60) {
      tips.push(`${zeroPct}% of tracked members have zero coins. Consider increasing study rewards or adding starting funds for new members.`)
    }
  }

  if (tips.length === 0) {
    tips.push("Your economy looks healthy! Coin flow is balanced and members are actively earning and spending.")
  }

  return tips
}

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
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
    const inactiveThreshold = new Date(now)
    inactiveThreshold.setUTCDate(inactiveThreshold.getUTCDate() - 30)

    const [
      circulation,
      dailyFlowRaw,
      thisWeekFlow,
      lastWeekFlow,
      todayFlow,
      activeMembers7d,
      incomeRaw,
      spendingRaw,
      distributionRaw,
      topEarnersRaw,
      roomStats,
      shopItemsAll,
      bestSellersRaw,
      shopRevenue30d,
      inactiveWealthRaw,
      top5HolderCoins,
    ] = await Promise.all([
      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: only aggregate current members (exclude those who left)
      prisma.members.aggregate({
        where: { guildid: guildId, last_left: null },
        _sum: { coins: true },
        _count: true,
        _avg: { coins: true },
      }),
      // --- END AI-MODIFIED ---

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

      prisma.$queryRaw<[{ zero: bigint; low: bigint; medium: bigint; high: bigint; whale: bigint }]>`
        SELECT
          COUNT(*) FILTER (WHERE COALESCE(coins, 0) = 0) as zero,
          COUNT(*) FILTER (WHERE coins BETWEEN 1 AND 100) as low,
          COUNT(*) FILTER (WHERE coins BETWEEN 101 AND 1000) as medium,
          COUNT(*) FILTER (WHERE coins BETWEEN 1001 AND 10000) as high,
          COUNT(*) FILTER (WHERE coins > 10000) as whale
        FROM members
        WHERE guildid = ${guildId} AND last_left IS NULL
      `,

      prisma.$queryRaw<Array<{ userid: bigint; total_earned: bigint }>>`
        SELECT actorid as userid, SUM(amount) as total_earned
        FROM coin_transactions
        WHERE guildid = ${guildId} AND created_at >= ${weekStart} AND amount > 0
        GROUP BY actorid
        ORDER BY total_earned DESC
        LIMIT 5
      `,

      prisma.$queryRaw<[{ cnt: bigint; total_balance: bigint }]>`
        SELECT COUNT(*) as cnt, COALESCE(SUM(coin_balance), 0) as total_balance
        FROM rented_rooms
        WHERE guildid = ${guildId} AND deleted_at IS NULL
      `,

      prisma.shop_items.findMany({
        where: { guildid: guildId, deleted: false },
        select: { itemid: true, item_type: true, price: true },
      }),

      prisma.$queryRaw<Array<{ itemid: number; purchase_count: bigint }>>`
        SELECT mi.itemid, COUNT(*) as purchase_count
        FROM member_inventory mi
        JOIN shop_items si ON si.itemid = mi.itemid
        WHERE si.guildid = ${guildId} AND si.deleted = false
        GROUP BY mi.itemid
        ORDER BY purchase_count DESC
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

      prisma.$queryRaw<[{ inactive_coins: bigint }]>`
        SELECT COALESCE(SUM(m.coins), 0) as inactive_coins
        FROM members m
        WHERE m.guildid = ${guildId} AND m.last_left IS NULL
          AND m.coins > 0
          AND NOT EXISTS (
            SELECT 1 FROM coin_transactions ct
            WHERE ct.guildid = ${guildId}
              AND (ct.actorid = m.userid OR ct.from_account = m.userid OR ct.to_account = m.userid)
              AND ct.created_at >= ${inactiveThreshold}
          )
      `,

      prisma.$queryRaw<[{ top5_coins: bigint }]>`
        SELECT COALESCE(SUM(coins), 0) as top5_coins
        FROM (
          SELECT coins FROM members
          WHERE guildid = ${guildId} AND last_left IS NULL AND coins > 0
          ORDER BY coins DESC LIMIT 5
        ) top5
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

    const shopItemMap = new Map(shopItemsAll.map((s) => [s.itemid, s]))
    const purchasedItemIds = new Set(bestSellersRaw.map((b) => b.itemid))
    const neverPurchased = shopItemsAll.filter((s) => !purchasedItemIds.has(s.itemid)).length

    const bestSellers = bestSellersRaw.map((b) => {
      const item = shopItemMap.get(b.itemid)
      return {
        itemId: b.itemid,
        itemType: item?.item_type || "UNKNOWN",
        price: item?.price || 0,
        purchaseCount: Number(b.purchase_count),
        totalRevenue: Number(b.purchase_count) * (item?.price || 0),
      }
    })

    const totalCoins = Number(circulation._sum.coins || 0)
    const memberCount = circulation._count
    const earnedWeek = Number(thisWeekFlow[0]?.earned || 0)
    const spentWeek = Number(thisWeekFlow[0]?.spent || 0)
    const inactiveWealth = Number(inactiveWealthRaw[0]?.inactive_coins || 0)
    const inactiveWealthPct = totalCoins > 0 ? Math.round((inactiveWealth / totalCoins) * 100) : 0
    const top5Coins = Number(top5HolderCoins[0]?.top5_coins || 0)

    const distribution = {
      zero: Number(distributionRaw[0]?.zero || 0),
      low: Number(distributionRaw[0]?.low || 0),
      medium: Number(distributionRaw[0]?.medium || 0),
      high: Number(distributionRaw[0]?.high || 0),
      whale: Number(distributionRaw[0]?.whale || 0),
    }

    const healthTips = generateHealthTips({
      totalCoins,
      memberCount,
      earnedWeek,
      spentWeek,
      distribution,
      topHolderCoins: top5Coins,
      neverPurchased,
      totalShopItems: shopItemsAll.length,
      activeRooms: Number(roomStats[0]?.cnt || 0),
      coinsInRoomBanks: Number(roomStats[0]?.total_balance || 0),
      inactiveWealth,
      inactiveWealthPct,
    })

    res.status(200).json({
      summary: {
        totalCoins,
        memberCount,
        avgBalance: Math.round(Number(circulation._avg.coins || 0)),
        activeMembers7d: Number(activeMembers7d[0]?.cnt || 0),
        coinsEarnedToday: Number(todayFlow[0]?.earned || 0),
        coinsSpentToday: Number(todayFlow[0]?.spent || 0),
        coinsEarnedWeek: earnedWeek,
        coinsSpentWeek: spentWeek,
        coinsEarnedLastWeek: Number(lastWeekFlow[0]?.earned || 0),
        coinsSpentLastWeek: Number(lastWeekFlow[0]?.spent || 0),
        netFlowWeek: earnedWeek - spentWeek,
        activeRooms: Number(roomStats[0]?.cnt || 0),
        coinsInRoomBanks: Number(roomStats[0]?.total_balance || 0),
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
      distribution,
      topEarnersWeek,
      shopAnalytics: {
        bestSellers,
        neverPurchased,
        totalShopRevenue30d: Number(shopRevenue30d[0]?.total || 0),
      },
      healthTips,
    })
  },
})
