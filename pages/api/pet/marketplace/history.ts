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

    // --- AI-MODIFIED (2026-03-31) ---
    // Purpose: Split daily buckets by currency so gold and gem histories are independent
    type DailyBucket = { prices: number[]; volume: number; min: number; max: number }
    const combinedMap: Record<string, DailyBucket> = {}
    const goldMap: Record<string, DailyBucket> = {}
    const gemMap: Record<string, DailyBucket> = {}

    for (const s of sales) {
      const day = s.sold_at.toISOString().slice(0, 10)
      const cur = s.currency === "GEMS" ? gemMap : goldMap

      if (!combinedMap[day]) combinedMap[day] = { prices: [], volume: 0, min: Infinity, max: 0 }
      combinedMap[day].prices.push(s.price_per_unit)
      combinedMap[day].volume += s.quantity
      combinedMap[day].min = Math.min(combinedMap[day].min, s.price_per_unit)
      combinedMap[day].max = Math.max(combinedMap[day].max, s.price_per_unit)

      if (!cur[day]) cur[day] = { prices: [], volume: 0, min: Infinity, max: 0 }
      cur[day].prices.push(s.price_per_unit)
      cur[day].volume += s.quantity
      cur[day].min = Math.min(cur[day].min, s.price_per_unit)
      cur[day].max = Math.max(cur[day].max, s.price_per_unit)
    }

    function buildHistory(map: Record<string, DailyBucket>) {
      return Object.entries(map).map(([date, d]) => ({
        date,
        avgPrice: Math.round(d.prices.reduce((a, b) => a + b, 0) / d.prices.length),
        minPrice: d.min === Infinity ? 0 : d.min,
        maxPrice: d.max,
        volume: d.volume,
      }))
    }

    function buildSummary(filtered: typeof sales) {
      const vol = filtered.reduce((sum, s) => sum + s.quantity, 0)
      const avg = filtered.length > 0
        ? Math.round(filtered.reduce((sum, s) => sum + s.price_per_unit, 0) / filtered.length)
        : 0
      return { totalSales: filtered.length, totalVolume: vol, avgPrice: avg }
    }

    const priceHistory = buildHistory(combinedMap)
    const goldHistory = buildHistory(goldMap)
    const gemHistory = buildHistory(gemMap)

    const goldSales = sales.filter(s => s.currency !== "GEMS")
    const gemSales = sales.filter(s => s.currency === "GEMS")
    // --- END AI-MODIFIED ---

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
      goldHistory,
      gemHistory,
      summary: {
        totalSales: sales.length,
        totalVolume,
        avgPrice,
        activeListings,
        lowestPrice: lowestPrice ? { price: lowestPrice.price_per_unit, currency: lowestPrice.currency } : null,
      },
      goldSummary: buildSummary(goldSales),
      gemSummary: buildSummary(gemSales),
      supply: supplyData.map((s) => ({ source: s.source, count: Number(s.cnt) })),
    })
  },
})
