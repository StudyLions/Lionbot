// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Global marketplace stats - volume, listings, trends
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      activeListingCount,
      totalSalesEver,
      goldVolume24h,
      gemVolume24h,
      topTraded,
      biggestSale,
    ] = await Promise.all([
      prisma.lg_marketplace_listings.count({ where: { status: "ACTIVE" } }),
      prisma.lg_marketplace_sales.count(),
      prisma.lg_marketplace_sales.aggregate({ where: { sold_at: { gte: oneDayAgo }, currency: "GOLD" }, _sum: { total_price: true } }),
      prisma.lg_marketplace_sales.aggregate({ where: { sold_at: { gte: oneDayAgo }, currency: "GEMS" }, _sum: { total_price: true } }),
      prisma.$queryRaw<Array<{ itemid: number; cnt: bigint }>>`
        SELECT itemid, COUNT(*) as cnt FROM lg_marketplace_sales
        WHERE sold_at >= ${oneDayAgo}
        GROUP BY itemid ORDER BY cnt DESC LIMIT 5`,
      prisma.lg_marketplace_sales.findFirst({
        where: { sold_at: { gte: oneDayAgo } },
        orderBy: { total_price: "desc" },
        include: { lg_items: { select: { name: true, rarity: true, asset_path: true, category: true } } },
      }),
    ])

    let trendingItems: any[] = []
    if (topTraded.length > 0) {
      const itemIds = topTraded.map((t) => t.itemid)
      const items = await prisma.lg_items.findMany({
        where: { itemid: { in: itemIds } },
        select: { itemid: true, name: true, rarity: true, asset_path: true, category: true },
      })
      const itemMap: Record<number, typeof items[0]> = {}
      for (const i of items) itemMap[i.itemid] = i

      trendingItems = topTraded.map((t) => ({
        item: itemMap[t.itemid] ? {
          id: itemMap[t.itemid].itemid, name: itemMap[t.itemid].name,
          rarity: itemMap[t.itemid].rarity, assetPath: itemMap[t.itemid].asset_path,
          category: itemMap[t.itemid].category,
        } : null,
        tradeCount: Number(t.cnt),
      })).filter((t) => t.item)
    }

    return res.status(200).json({
      activeListings: activeListingCount,
      totalSalesEver,
      volume24h: {
        gold: goldVolume24h._sum.total_price ?? 0,
        gems: gemVolume24h._sum.total_price ?? 0,
      },
      trendingItems,
      biggestSale: biggestSale ? {
        itemName: biggestSale.lg_items.name,
        rarity: biggestSale.lg_items.rarity,
        totalPrice: biggestSale.total_price,
        currency: biggestSale.currency,
        quantity: biggestSale.quantity,
      } : null,
    })
  },
})
