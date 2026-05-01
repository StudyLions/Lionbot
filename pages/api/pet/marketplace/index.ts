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
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- "Featured only" filter, opt-in
    // via ?featured=true (the default behavior is still to merely sort
    // featured ones to the top via orderBy below).
    if (req.query.featured === "true") {
      listingWhere.is_featured = true
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Add enhancement_desc and bonus_desc sort options
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- featured listings always sort to
    // the top of the page (within the user's chosen sort). Implemented as
    // an array of orderBy clauses so featured/non-featured is the primary
    // key and the user's sort is the tiebreaker. is_featured DESC means
    // true-rows-first; featured_at DESC then orders the featured group by
    // most-recently-promoted.
    const userSort: any = sort === "price_asc" ? { price_per_unit: "asc" }
      : sort === "price_desc" ? { price_per_unit: "desc" }
      : sort === "ending_soon" ? { expires_at: "asc" }
      : sort === "enhancement_desc" ? { enhancement_level: "desc" }
      : sort === "bonus_desc" ? { total_bonus: "desc" }
      : { created_at: "desc" }
    const orderBy: any[] = [
      { is_featured: "desc" },
      { featured_at: "desc" },
      userSort,
    ]
    // --- END AI-MODIFIED ---
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
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Theme catalog + discoverability rollout -- batch-fetch each
    // seller's lg_user_stores row alongside user_config so listing cards can
    // render store-tinted "Visit shop" chips and route via slug if set.
    // Both queries run in parallel so the page doesn't pay a sequential
    // round-trip cost.
    const [sellers, sellerStores] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: sellerIds } },
        select: { userid: true, name: true },
      }),
      prisma.lg_user_stores.findMany({
        where: { userid: { in: sellerIds } },
        select: {
          userid: true,
          display_name: true,
          slug: true,
          theme_id: true,
          accent_color: true,
        },
      }),
    ])
    // --- END AI-MODIFIED ---
    const sellerMap: Record<string, string> = {}
    for (const s of sellers) sellerMap[s.userid.toString()] = s.name ?? `Player${s.userid.toString().slice(-4)}`
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Index store rows by seller id so we can attach displayName /
    // slug / themeId / accentColor to each listing in O(1).
    type SellerStoreMeta = {
      displayName: string | null
      slug: string | null
      themeId: string
      accentColor: string | null
    }
    const sellerStoreMap: Record<string, SellerStoreMeta> = {}
    for (const s of sellerStores) {
      sellerStoreMap[s.userid.toString()] = {
        displayName: s.display_name?.trim() || null,
        slug: s.slug ?? null,
        themeId: s.theme_id ?? "default",
        accentColor: s.accent_color ?? null,
      }
    }
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Include scroll_data, totalBonus, and item description in browse response
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 -- expose sellerId so ListingCard / ListingRow
    // can link the seller name to that user's personal store front. We
    // already have the snowflake from seller_userid; just need to stringify
    // it so JSON doesn't choke on the BigInt.
    const result = listings.map((l) => {
      const sid = l.seller_userid.toString()
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: Hydrate per-listing store metadata. `sellerStore` is null
      // for sellers who haven't set up a personal store row at all (default
      // theme, no display name, no slug).
      const sellerStore = sellerStoreMap[sid] ?? null
      // --- END AI-MODIFIED ---
      return {
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
        sellerId: sid,
        sellerName: sellerMap[sid] ?? "Unknown",
        createdAt: l.created_at.toISOString(),
        expiresAt: l.expires_at.toISOString(),
        scrollData: l.scroll_data ?? null,
        totalBonus: l.total_bonus ?? 0,
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Marketplace 2.0 Phase 3 -- expose is_featured so ListingCard
        // / ListingRow can render the FEATURED badge + animated border.
        isFeatured: l.is_featured ?? false,
        // --- END AI-MODIFIED ---
        // --- AI-MODIFIED (2026-04-30) ---
        // Purpose: Marketplace discoverability -- ship the seller's store
        // metadata alongside the listing so cards can render a tinted
        // "Visit shop" chip and route via slug when available.
        sellerStore: sellerStore
          ? {
              displayName: sellerStore.displayName,
              slug: sellerStore.slug,
              themeId: sellerStore.themeId,
              accentColor: sellerStore.accentColor,
            }
          : null,
        // --- END AI-MODIFIED ---
      }
    })
    // --- END AI-MODIFIED ---
    // --- END AI-MODIFIED ---

    return res.status(200).json({
      listings: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  },
})
