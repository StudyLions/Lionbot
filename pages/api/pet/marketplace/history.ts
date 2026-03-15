// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Price history and supply data for a specific item
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const itemId = parseInt(req.query.itemId as string)
    if (isNaN(itemId)) return res.status(400).json({ error: "Missing or invalid itemId" })
    const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 30))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const sales = await prisma.lg_marketplace_sales.findMany({
      where: { itemid: itemId, sold_at: { gte: since } },
      select: { price_per_unit: true, quantity: true, total_price: true, currency: true, sold_at: true },
      orderBy: { sold_at: "asc" },
    })

    const dailyMap: Record<string, { prices: number[]; volume: number; min: number; max: number }> = {}
    for (const s of sales) {
      const day = s.sold_at.toISOString().slice(0, 10)
      if (!dailyMap[day]) dailyMap[day] = { prices: [], volume: 0, min: Infinity, max: 0 }
      dailyMap[day].prices.push(s.price_per_unit)
      dailyMap[day].volume += s.quantity
      dailyMap[day].min = Math.min(dailyMap[day].min, s.price_per_unit)
      dailyMap[day].max = Math.max(dailyMap[day].max, s.price_per_unit)
    }

    const priceHistory = Object.entries(dailyMap).map(([date, d]) => ({
      date,
      avgPrice: Math.round(d.prices.reduce((a, b) => a + b, 0) / d.prices.length),
      minPrice: d.min === Infinity ? 0 : d.min,
      maxPrice: d.max,
      volume: d.volume,
    }))

    const activeListings = await prisma.lg_marketplace_listings.count({
      where: { itemid: itemId, status: "ACTIVE" },
    })

    const lowestPrice = await prisma.lg_marketplace_listings.findFirst({
      where: { itemid: itemId, status: "ACTIVE" },
      orderBy: { price_per_unit: "asc" },
      select: { price_per_unit: true, currency: true },
    })

    const supplyData = await prisma.$queryRaw<Array<{ source: string; cnt: bigint }>>`
      SELECT source, COUNT(*) as cnt FROM lg_user_inventory
      WHERE itemid = ${itemId} AND acquired_at >= ${since}
      GROUP BY source ORDER BY cnt DESC`

    const totalVolume = sales.reduce((sum, s) => sum + s.quantity, 0)
    const avgPrice = sales.length > 0
      ? Math.round(sales.reduce((sum, s) => sum + s.price_per_unit, 0) / sales.length)
      : 0

    return res.status(200).json({
      priceHistory,
      summary: {
        totalSales: sales.length,
        totalVolume,
        avgPrice,
        activeListings,
        lowestPrice: lowestPrice ? { price: lowestPrice.price_per_unit, currency: lowestPrice.currency } : null,
      },
      supply: supplyData.map((s) => ({ source: s.source, count: Number(s.cnt) })),
    })
  },
})
