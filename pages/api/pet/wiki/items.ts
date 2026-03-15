// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki items API - paginated browse with ownership data
// ============================================================
import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const SORT_MAP: Record<string, any> = {
  name_asc: [{ name: "asc" as const }],
  name_desc: [{ name: "desc" as const }],
  rarity_desc: [{ rarity: "desc" as const }, { name: "asc" as const }],
  rarity_asc: [{ rarity: "asc" as const }, { name: "asc" as const }],
  price_desc: [{ gold_price: "desc" as const }, { name: "asc" as const }],
  price_asc: [{ gold_price: "asc" as const }, { name: "asc" as const }],
}

export default apiHandler({
  async GET(req, res) {
    const auth = await getAuthContext(req)
    const userId = auth ? BigInt(auth.discordId) : null

    const search = (req.query.search as string) || ""
    const category = (req.query.category as string) || ""
    const rarityParam = (req.query.rarity as string) || ""
    const sort = (req.query.sort as string) || "rarity_desc"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(10, parseInt(req.query.pageSize as string) || 40))

    const where: any = {}
    if (search) where.name = { contains: search, mode: "insensitive" }
    if (category) where.category = category
    if (rarityParam) {
      const rarities = rarityParam.split(",").filter(Boolean)
      if (rarities.length === 1) where.rarity = rarities[0]
      else if (rarities.length > 1) where.rarity = { in: rarities }
    }

    const orderBy = SORT_MAP[sort] || SORT_MAP.rarity_desc

    const [items, total] = await Promise.all([
      prisma.lg_items.findMany({
        where,
        select: {
          itemid: true, name: true, category: true, slot: true, rarity: true,
          asset_path: true, gold_price: true, gem_price: true, tradeable: true, description: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lg_items.count({ where }),
    ])

    const itemIds = items.map((i) => i.itemid)

    const ownerCounts = await prisma.$queryRaw<Array<{ itemid: number; cnt: bigint }>>`
      SELECT itemid, COUNT(DISTINCT userid) as cnt FROM lg_user_inventory
      WHERE itemid = ANY(${itemIds}) GROUP BY itemid`
    const ownerMap: Record<number, number> = {}
    for (const oc of ownerCounts) ownerMap[oc.itemid] = Number(oc.cnt)

    let userOwnedMap: Record<number, number> = {}
    if (userId) {
      const userItems = await prisma.lg_user_inventory.groupBy({
        by: ["itemid"],
        where: { userid: userId, itemid: { in: itemIds } },
        _sum: { quantity: true },
      })
      for (const ui of userItems) userOwnedMap[ui.itemid] = ui._sum.quantity ?? 0
    }

    const result = items.map((i) => ({
      id: i.itemid,
      name: i.name,
      category: i.category,
      slot: i.slot,
      rarity: i.rarity,
      assetPath: i.asset_path,
      goldPrice: i.gold_price,
      gemPrice: i.gem_price,
      tradeable: i.tradeable,
      description: i.description,
      ownerCount: ownerMap[i.itemid] ?? 0,
      userOwned: userOwnedMap[i.itemid] ?? 0,
    }))

    return res.status(200).json({
      items: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
