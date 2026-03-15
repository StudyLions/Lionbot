// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Cancel a marketplace listing - returns remaining
//          items to seller's inventory
// ============================================================
import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async POST(req, res) {
    const auth = await getAuthContext(req)
    if (!auth) return res.status(401).json({ error: "Not authenticated" })
    const userId = BigInt(auth.discordId)

    const { listingId } = req.body
    if (!listingId) return res.status(400).json({ error: "Missing listingId" })

    const listing = await prisma.lg_marketplace_listings.findUnique({
      where: { listingid: listingId },
      include: { lg_items: true },
    })
    if (!listing) return res.status(404).json({ error: "Listing not found" })
    if (listing.seller_userid !== userId) return res.status(403).json({ error: "Not your listing" })
    if (listing.status !== "ACTIVE") return res.status(400).json({ error: "Listing is not active" })

    await prisma.$transaction([
      prisma.lg_marketplace_listings.update({
        where: { listingid: listingId },
        data: { status: "CANCELLED" },
      }),
      prisma.lg_user_inventory.create({
        data: {
          userid: userId,
          itemid: listing.itemid,
          enhancement_level: listing.enhancement_level,
          quantity: listing.quantity_remaining,
          source: "TRADE",
        },
      }),
    ])

    return res.status(200).json({
      success: true,
      message: `Cancelled listing. ${listing.quantity_remaining}x ${listing.lg_items.name} returned to your inventory.`,
    })
  },
})
