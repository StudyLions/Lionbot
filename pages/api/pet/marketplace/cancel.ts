// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Cancel a marketplace listing - returns remaining
//          items to seller's inventory
// ============================================================

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Use inventory upsert instead of always creating new rows,
//          add rate limiting, add row locking to prevent concurrent cancel.
// --- Original code (commented out for rollback) ---
// import { prisma } from "@/utils/prisma"
// import { getAuthContext } from "@/utils/adminAuth"
// import { apiHandler } from "@/utils/apiHandler"
//
// export default apiHandler({
//   async POST(req, res) {
//     const auth = await getAuthContext(req)
//     if (!auth) return res.status(401).json({ error: "Not authenticated" })
//     const userId = BigInt(auth.discordId)
//
//     const { listingId } = req.body
//     if (!listingId) return res.status(400).json({ error: "Missing listingId" })
//
//     const listing = await prisma.lg_marketplace_listings.findUnique({
//       where: { listingid: listingId },
//       include: { lg_items: true },
//     })
//     if (!listing) return res.status(404).json({ error: "Listing not found" })
//     if (listing.seller_userid !== userId) return res.status(403).json({ error: "Not your listing" })
//     if (listing.status !== "ACTIVE") return res.status(400).json({ error: "Listing is not active" })
//
//     await prisma.$transaction([
//       prisma.lg_marketplace_listings.update({
//         where: { listingid: listingId },
//         data: { status: "CANCELLED" },
//       }),
//       prisma.lg_user_inventory.create({
//         data: {
//           userid: userId,
//           itemid: listing.itemid,
//           enhancement_level: listing.enhancement_level,
//           quantity: listing.quantity_remaining,
//           source: "TRADE",
//         },
//       }),
//     ])
//
//     return res.status(200).json({
//       success: true,
//       message: `Cancelled listing. ${listing.quantity_remaining}x ${listing.lg_items.name} returned to your inventory.`,
//     })
//   },
// })
// --- End original code ---

import { prisma } from "@/utils/prisma"
import { getAuthContext } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Import scroll-aware restoration to preserve scroll data on cancel
import { restoreInventoryWithScrolls, type ScrollSlotSnapshot } from "@/utils/marketplace"
// --- END AI-MODIFIED ---
import { checkRateLimit } from "@/utils/rateLimit"

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export default apiHandler({
  async POST(req, res) {
    const auth = await getAuthContext(req)
    if (!auth) return res.status(401).json({ error: "Not authenticated" })
    const userId = BigInt(auth.discordId)

    const { listingId } = req.body
    if (!listingId) return res.status(400).json({ error: "Missing listingId" })

    if (!checkRateLimit(`cancel:${auth.discordId}`, 2000)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." })
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const listings = await tx.$queryRaw<any[]>`
          SELECT l.*, i.name as item_name
          FROM lg_marketplace_listings l
          JOIN lg_items i ON i.itemid = l.itemid
          WHERE l.listingid = ${listingId}
          FOR UPDATE OF l
        `
        const listing = listings[0]
        if (!listing) throw new HttpError(404, "Listing not found")
        if (BigInt(listing.seller_userid) !== userId) throw new HttpError(403, "Not your listing")
        if (listing.status !== "ACTIVE") throw new HttpError(400, "Listing is not active")

        await tx.lg_marketplace_listings.update({
          where: { listingid: listingId },
          data: { status: "CANCELLED" },
        })

        // --- AI-MODIFIED (2026-03-21) ---
        // Purpose: Restore items with scroll data intact on cancellation
        const scrollData: ScrollSlotSnapshot[] | null = listing.scroll_data ?? null
        await restoreInventoryWithScrolls(
          tx, userId, listing.itemid, listing.enhancement_level,
          listing.quantity_remaining, scrollData,
        )
        // --- END AI-MODIFIED ---

        return {
          quantityRemaining: listing.quantity_remaining,
          itemName: listing.item_name as string,
        }
      })

      return res.status(200).json({
        success: true,
        message: `Cancelled listing. ${result.quantityRemaining}x ${result.itemName} returned to your inventory.`,
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message })
      }
      throw e
    }
  },
})

// --- END AI-MODIFIED ---
