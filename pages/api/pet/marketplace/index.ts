// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Browse marketplace listings with filters, search,
//          category, rarity, currency, sort, pagination
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use debounced expireListings to avoid running full expiry scan on every browse request
import { expireListingsDebounced } from "@/utils/marketplace"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // --- Original code (commented out for rollback) ---
    // await expireListings()
    // --- End original code ---
    await expireListingsDebounced()
    // --- END AI-MODIFIED ---

    const search = (req.query.search as string) || ""
    const category = (req.query.category as string) || ""
    const rarity = (req.query.rarity as string) || ""
    const currency = (req.query.currency as string) || ""
    const sort = (req.query.sort as string) || "newest"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(60, Math.max(10, parseInt(req.query.pageSize as string) || 24))

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Add enhancement/scroll filters for marketplace search
    const minEnhancement = parseInt(req.query.minEnhancement as string) || 0
    const hasScrolls = req.query.hasScrolls === "true"
    const minBonus = parseFloat(req.query.minBonus as string) || 0
    // --- END AI-MODIFIED ---

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
    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Apply enhancement/scroll filters to listing query
    if (minEnhancement > 0) listingWhere.enhancement_level = { gte: minEnhancement }
    if (hasScrolls) listingWhere.scroll_data = { not: null }
    if (minBonus > 0) listingWhere.total_bonus = { gte: minBonus }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Add enhancement_desc and bonus_desc sort options
    const orderBy: any = sort === "price_asc" ? { price_per_unit: "asc" }
      : sort === "price_desc" ? { price_per_unit: "desc" }
      : sort === "ending_soon" ? { expires_at: "asc" }
      : sort === "enhancement_desc" ? { enhancement_level: "desc" }
      : sort === "bonus_desc" ? { total_bonus: "desc" }
      : { created_at: "desc" }
    // --- END AI-MODIFIED ---

    const [listings, total] = await Promise.all([
      prisma.lg_marketplace_listings.findMany({
        where: listingWhere,
        include: { lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true, slot: true, description: true } } },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lg_marketplace_listings.count({ where: listingWhere }),
    ])

    const sellerIds = Array.from(new Set(listings.map((l) => l.seller_userid)))
    const sellers = await prisma.user_config.findMany({
      where: { userid: { in: sellerIds } },
      select: { userid: true, name: true },
    })
    const sellerMap: Record<string, string> = {}
    for (const s of sellers) sellerMap[s.userid.toString()] = s.name ?? `Player${s.userid.toString().slice(-4)}`

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Include scroll_data, totalBonus, and item description in browse response
    const result = listings.map((l) => ({
      listingId: l.listingid,
      item: {
        id: l.lg_items.itemid, name: l.lg_items.name, category: l.lg_items.category,
        rarity: l.lg_items.rarity, assetPath: l.lg_items.asset_path, slot: l.lg_items.slot,
        description: l.lg_items.description,
      },
      enhancementLevel: l.enhancement_level,
      quantityRemaining: l.quantity_remaining,
      quantityListed: l.quantity_listed,
      pricePerUnit: l.price_per_unit,
      currency: l.currency,
      sellerName: sellerMap[l.seller_userid.toString()] ?? "Unknown",
      createdAt: l.created_at.toISOString(),
      expiresAt: l.expires_at.toISOString(),
      scrollData: l.scroll_data ?? null,
      totalBonus: l.total_bonus ?? 0,
    }))
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      listings: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
