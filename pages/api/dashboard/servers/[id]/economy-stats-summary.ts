// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-30
// Purpose: Fast economy summary stats from members/shop tables.
//          Split from economy-stats.ts for progressive loading
//          so large servers don't time out.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [
      circulation,
      distributionRaw,
      top5HolderCoins,
      roomStats,
      shopItemsAll,
      bestSellersRaw,
    ] = await Promise.all([
      prisma.members.aggregate({
        where: { guildid: guildId, last_left: null },
        _sum: { coins: true },
        _count: true,
        _avg: { coins: true },
      }),

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

      prisma.$queryRaw<[{ top5_coins: bigint }]>`
        SELECT COALESCE(SUM(coins), 0) as top5_coins
        FROM (
          SELECT coins FROM members
          WHERE guildid = ${guildId} AND last_left IS NULL AND coins > 0
          ORDER BY coins DESC LIMIT 5
        ) top5
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
    ])

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

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
    res.status(200).json({
      summary: {
        totalCoins: Number(circulation._sum.coins || 0),
        memberCount: circulation._count,
        avgBalance: Math.round(Number(circulation._avg.coins || 0)),
        activeRooms: Number(roomStats[0]?.cnt || 0),
        coinsInRoomBanks: Number(roomStats[0]?.total_balance || 0),
        top5HolderCoins: Number(top5HolderCoins[0]?.top5_coins || 0),
      },
      distribution: {
        zero: Number(distributionRaw[0]?.zero || 0),
        low: Number(distributionRaw[0]?.low || 0),
        medium: Number(distributionRaw[0]?.medium || 0),
        high: Number(distributionRaw[0]?.high || 0),
        whale: Number(distributionRaw[0]?.whale || 0),
      },
      shopAnalytics: {
        bestSellers,
        neverPurchased,
        totalItems: shopItemsAll.length,
      },
    })
  },
})
