// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Seller dashboard - active listings, past sales,
//          revenue summary
// ============================================================
import { prisma } from "@/utils/prisma"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Switch from getAuthContext (no rate limit) to requireAuth (rate-limited)
import { requireAuth } from "@/utils/adminAuth"
// --- End original code ---
// import { getAuthContext } from "@/utils/adminAuth"
// --- END AI-MODIFIED ---
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use debounced expireListings to avoid running full expiry scan on every request
import { expireListingsDebounced } from "@/utils/marketplace"
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Use requireAuth for rate limiting
    const auth = await requireAuth(req, res)
    if (!auth) return
    // --- END AI-MODIFIED ---
    const userId = BigInt(auth.discordId)

    // --- AI-MODIFIED (2026-03-20) ---
    // --- Original code (commented out for rollback) ---
    // await expireListings()
    // --- End original code ---
    await expireListingsDebounced()
    // --- END AI-MODIFIED ---

    const [activeListings, pastListings, sales, goldRevenue, gemRevenue] = await Promise.all([
      prisma.lg_marketplace_listings.findMany({
        where: { seller_userid: userId, status: "ACTIVE" },
        include: { lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } } },
        orderBy: { created_at: "desc" },
      }),
      prisma.lg_marketplace_listings.findMany({
        where: { seller_userid: userId, status: { in: ["SOLD", "CANCELLED", "EXPIRED"] } },
        include: { lg_items: { select: { itemid: true, name: true, category: true, rarity: true, asset_path: true } } },
        orderBy: { created_at: "desc" },
        take: 20,
      }),
      prisma.lg_marketplace_sales.findMany({
        where: { seller_userid: userId },
        include: { lg_items: { select: { name: true } } },
        orderBy: { sold_at: "desc" },
        take: 30,
      }),
      prisma.lg_marketplace_sales.aggregate({ where: { seller_userid: userId, currency: "GOLD" }, _sum: { total_price: true } }),
      prisma.lg_marketplace_sales.aggregate({ where: { seller_userid: userId, currency: "GEMS" }, _sum: { total_price: true } }),
    ])

    const buyerIds = Array.from(new Set(sales.map((s) => s.buyer_userid)))
    const buyers = await prisma.user_config.findMany({
      where: { userid: { in: buyerIds } },
      select: { userid: true, name: true },
    })
    const buyerMap: Record<string, string> = {}
    for (const b of buyers) buyerMap[b.userid.toString()] = b.name ? b.name.slice(0, 4) + "***" : `P${b.userid.toString().slice(-4)}`

    return res.status(200).json({
      active: activeListings.map((l) => ({
        listingId: l.listingid,
        item: { id: l.lg_items.itemid, name: l.lg_items.name, category: l.lg_items.category, rarity: l.lg_items.rarity, assetPath: l.lg_items.asset_path },
        enhancementLevel: l.enhancement_level,
        quantityListed: l.quantity_listed, quantityRemaining: l.quantity_remaining,
        pricePerUnit: l.price_per_unit, currency: l.currency,
        createdAt: l.created_at.toISOString(), expiresAt: l.expires_at.toISOString(),
      })),
      past: pastListings.map((l) => ({
        listingId: l.listingid,
        item: { id: l.lg_items.itemid, name: l.lg_items.name, category: l.lg_items.category, rarity: l.lg_items.rarity, assetPath: l.lg_items.asset_path },
        status: l.status, quantityListed: l.quantity_listed, quantityRemaining: l.quantity_remaining,
        pricePerUnit: l.price_per_unit, currency: l.currency,
        createdAt: l.created_at.toISOString(),
      })),
      sales: sales.map((s) => ({
        buyerName: buyerMap[s.buyer_userid.toString()] ?? "Player",
        itemName: s.lg_items.name, quantity: s.quantity,
        pricePerUnit: s.price_per_unit, totalPrice: s.total_price,
        currency: s.currency, soldAt: s.sold_at.toISOString(),
      })),
      revenue: {
        totalGold: goldRevenue._sum.total_price ?? 0,
        totalGems: gemRevenue._sum.total_price ?? 0,
        totalSales: sales.length,
      },
    })
  },
})
