// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Browse marketplace listings with filters, search,
//          category, rarity, currency, sort, pagination
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { expireListings } from "@/utils/marketplace"

export default apiHandler({
  async GET(req, res) {
    await expireListings()

    const search = (req.query.search as string) || ""
    const category = (req.query.category as string) || ""
    const rarity = (req.query.rarity as string) || ""
    const currency = (req.query.currency as string) || ""
    const sort = (req.query.sort as string) || "newest"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(60, Math.max(10, parseInt(req.query.pageSize as string) || 24))

    const itemWhere: any = {}
    if (search) itemWhere.name = { contains: search, mode: "insensitive" }
    if (category) itemWhere.category = category
    if (rarity) {
      const rarities = rarity.split(",").filter(Boolean)
      if (rarities.length === 1) itemWhere.rarity = rarities[0]
      else if (rarities.length > 1) itemWhere.rarity = { in: rarities }
    }

    const listingWhere: any = { status: "ACTIVE", lg_items: itemWhere }
    if (currency) listingWhere.currency = currency

    const orderBy: any = sort === "price_asc" ? { price_per_unit: "asc" }
      : sort === "price_desc" ? { price_per_unit: "desc" }
      : sort === "ending_soon" ? { expires_at: "asc" }
      : { created_at: "desc" }

    const [listings, total] = await Promise.all([
      prisma.lg_marketplace_listings.findMany({
        where: listingWhere,
        include: { lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true, slot: true } } },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lg_marketplace_listings.count({ where: listingWhere }),
    ])

    const sellerIds = [...new Set(listings.map((l) => l.seller_userid))]
    const sellers = await prisma.user_config.findMany({
      where: { userid: { in: sellerIds } },
      select: { userid: true, name: true },
    })
    const sellerMap: Record<string, string> = {}
    for (const s of sellers) sellerMap[s.userid.toString()] = s.name ?? `Player${s.userid.toString().slice(-4)}`

    const result = listings.map((l) => ({
      listingId: l.listingid,
      item: {
        id: l.lg_items.itemid, name: l.lg_items.name, category: l.lg_items.category,
        rarity: l.lg_items.rarity, assetPath: l.lg_items.asset_path, slot: l.lg_items.slot,
      },
      enhancementLevel: l.enhancement_level,
      quantityRemaining: l.quantity_remaining,
      quantityListed: l.quantity_listed,
      pricePerUnit: l.price_per_unit,
      currency: l.currency,
      sellerName: sellerMap[l.seller_userid.toString()] ?? "Unknown",
      createdAt: l.created_at.toISOString(),
      expiresAt: l.expires_at.toISOString(),
    }))

    return res.status(200).json({
      listings: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
