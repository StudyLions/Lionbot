// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 3 -- premium-gated, slot-capped
//          listing-feature toggle.
//
//          POST { listingId, featured }
//
//          - Caller MUST own the listing (server-side check on
//            seller_userid == auth.userid).
//          - Caller MUST be a LionHeart subscriber. FREE returns
//            403 with code=PREMIUM_REQUIRED so the UI can render
//            UpgradePrompt.
//          - Featuring a listing increments the seller's used
//            slots; if they're already at their cap, return 403
//            with code=FEATURED_SLOTS_FULL plus current/cap so
//            the UI can render a friendly "unfeature one first"
//            error.
//
//          Unfeaturing always allowed (no cap).
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import {
  getUserTier, getFeaturedListingSlots, LION_HEART_TIER_LABELS, type LionHeartTier,
} from "@/utils/subscription"

class HttpError extends Error {
  status: number
  body?: Record<string, unknown>
  constructor(status: number, message: string, body?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.body = body
  }
}

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { listingId, featured } = (req.body ?? {}) as {
      listingId?: number | string
      featured?: boolean
    }

    const lid = Number(listingId)
    if (!Number.isFinite(lid) || lid <= 0) {
      return res.status(400).json({ error: "listingId is required" })
    }
    if (typeof featured !== "boolean") {
      return res.status(400).json({ error: "featured (boolean) is required" })
    }

    const userid = BigInt(auth.discordId)
    const tier = await getUserTier(userid)

    try {
      await prisma.$transaction(async (tx) => {
        const listing = await tx.lg_marketplace_listings.findUnique({
          where: { listingid: lid },
          select: {
            listingid: true,
            seller_userid: true,
            status: true,
            is_featured: true,
          },
        })
        if (!listing) {
          throw new HttpError(404, "Listing not found")
        }
        if (listing.seller_userid !== userid) {
          throw new HttpError(403, "You can only feature your own listings.")
        }
        if (listing.status !== "ACTIVE") {
          throw new HttpError(400, "Only active listings can be featured.")
        }

        if (featured) {
          // FREE users can't feature at all. The slot count is also 0 for them
          // but we return a clearer error if they're a non-subscriber rather
          // than the "cap reached" copy.
          if (tier === "FREE") {
            throw new HttpError(403, "Featured listings are a LionHeart perk.", {
              code: "PREMIUM_REQUIRED", field: "featured", requiredTier: "LIONHEART",
            })
          }
          const slots = getFeaturedListingSlots(tier)
          // Count ACTIVE featured listings for this seller (excluding the
          // current one if it's already featured -- that's a no-op upsert).
          const used = await tx.lg_marketplace_listings.count({
            where: {
              seller_userid: userid,
              status: "ACTIVE",
              is_featured: true,
              listingid: { not: lid },
            },
          })
          if (used >= slots) {
            const upgradeMessage =
              tier === "LIONHEART_PLUS_PLUS"
                ? "You're already on the highest tier."
                : `Upgrade to feature more.`
            throw new HttpError(
              403,
              `You're using ${used}/${slots} featured slots at ${LION_HEART_TIER_LABELS[tier]}. ` +
                `Unfeature one first, or ${upgradeMessage}`,
              {
                code: "FEATURED_SLOTS_FULL",
                used, slots, tier,
                upgradeAvailable: tier !== "LIONHEART_PLUS_PLUS",
              },
            )
          }
          await tx.lg_marketplace_listings.update({
            where: { listingid: lid },
            data: { is_featured: true, featured_at: new Date() },
          })
        } else {
          await tx.lg_marketplace_listings.update({
            where: { listingid: lid },
            data: { is_featured: false, featured_at: null },
          })
        }
      })

      // Re-fetch the slot usage so the UI can update its counter.
      const slots = getFeaturedListingSlots(tier)
      const used = await prisma.lg_marketplace_listings.count({
        where: { seller_userid: userid, status: "ACTIVE", is_featured: true },
      })

      return res.status(200).json({
        ok: true,
        listingId: lid,
        featured,
        slots: { used, total: slots, tier },
      })
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message, ...(e.body ?? {}) })
      }
      throw e
    }
  },
})

// Silence the unused import warning while keeping the export available if
// future callers want to display tier labels alongside the response.
void ({} as Record<string, LionHeartTier>)
