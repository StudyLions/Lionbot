// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Single marketplace listing detail with seller info,
//          item detail, and price history for this item
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const listingId = parseInt(req.query.listingId as string)
    if (isNaN(listingId)) return res.status(400).json({ error: "Invalid listingId" })

    const listing = await prisma.lg_marketplace_listings.findUnique({
      where: { listingid: listingId },
      include: {
        lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true, slot: true, description: true, gold_price: true, gem_price: true, tradeable: true } },
      },
    })
    if (!listing) return res.status(404).json({ error: "Listing not found" })

    const seller = await prisma.user_config.findUnique({
      where: { userid: listing.seller_userid },
      select: { name: true },
    })

    const recentSales = await prisma.lg_marketplace_sales.findMany({
      where: { itemid: listing.itemid },
      orderBy: { sold_at: "desc" },
      take: 10,
      select: { quantity: true, price_per_unit: true, total_price: true, currency: true, sold_at: true },
    })

    const otherListings = await prisma.lg_marketplace_listings.findMany({
      where: { itemid: listing.itemid, status: "ACTIVE", listingid: { not: listingId } },
      orderBy: { price_per_unit: "asc" },
      take: 5,
      select: { listingid: true, price_per_unit: true, currency: true, quantity_remaining: true },
    })

    return res.status(200).json({
      listing: {
        listingId: listing.listingid,
        item: {
          id: listing.lg_items.itemid, name: listing.lg_items.name, category: listing.lg_items.category,
          rarity: listing.lg_items.rarity, assetPath: listing.lg_items.asset_path, slot: listing.lg_items.slot,
          description: listing.lg_items.description, goldPrice: listing.lg_items.gold_price, gemPrice: listing.lg_items.gem_price,
        },
        enhancementLevel: listing.enhancement_level,
        quantityRemaining: listing.quantity_remaining,
        quantityListed: listing.quantity_listed,
        pricePerUnit: listing.price_per_unit,
        currency: listing.currency,
        sellerName: seller?.name ?? `Player${listing.seller_userid.toString().slice(-4)}`,
        status: listing.status,
        createdAt: listing.created_at.toISOString(),
        expiresAt: listing.expires_at.toISOString(),
        // --- AI-MODIFIED (2026-03-21) ---
        // Purpose: Include scroll/enhancement data in listing detail response
        scrollData: listing.scroll_data ?? null,
        totalBonus: listing.total_bonus ?? 0,
        // --- END AI-MODIFIED ---
      },
      recentSales: recentSales.map((s) => ({
        quantity: s.quantity, pricePerUnit: s.price_per_unit, totalPrice: s.total_price,
        currency: s.currency, soldAt: s.sold_at.toISOString(),
      })),
      otherListings: otherListings.map((l) => ({
        listingId: l.listingid, pricePerUnit: l.price_per_unit, currency: l.currency, quantity: l.quantity_remaining,
      })),
    })
  },
})
