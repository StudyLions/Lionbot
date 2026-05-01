// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Phase 3 -- promote a server listing to the top of the
//          /servers directory by spending LionGems.
//
//          Pricing model: flat LISTING_PROMOTION_GEM_COST gems
//          per LISTING_PROMOTION_HOURS-hour boost. Stacks: if a
//          listing is already promoted, we extend `promoted_until`
//          by another window so admins can pre-buy multi-day
//          campaigns without losing time.
//
//          Gems come out of the *acting user's* personal balance
//          (user_config.gems), not the server's. This matches how
//          all other gem spends in this codebase work, and means
//          server owners don't have to share gem balances with
//          each other.
//
//          We wrap the spend + listing update in a transaction so
//          we never end up debiting gems without giving the boost
//          (or vice versa).
// ============================================================
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
import { requireAdmin } from "@/utils/adminAuth"
import { isListingPremiumGuild } from "@/utils/listingHelpers"
import { prisma } from "@/utils/prisma"
import {
  LISTING_PROMOTION_GEM_COST,
  LISTING_PROMOTION_HOURS,
} from "@/constants/ServerListingData"
import { SERVERS_DIRECTORY_ENABLED } from "@/constants/FeatureFlags"

interface PromoteResponse {
  ok: true
  promoted_until: string
  cost: number
  hours: number
  remaining_gems: number
}

export default apiHandler({
  async POST(req, res) {
    if (!SERVERS_DIRECTORY_ENABLED) {
      return res.status(404).json({ error: "Not found" })
    }
    const guildId = parseBigInt(req.query.id, "id")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isListingPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Server premium subscription required." })
    }

    const listing = await prisma.server_listings.findUnique({
      where: { guildid: guildId },
      select: { status: true, promoted_until: true, slug: true },
    })
    if (!listing || listing.status !== "APPROVED") {
      return res.status(400).json({
        error: "Your listing must be approved and live before you can promote it.",
      })
    }

    const userId = BigInt(auth.discordId)

    // Atomic: lock the user row, validate balance, debit gems,
    // extend the promotion window, log the transaction. We use
    // a SELECT ... FOR UPDATE on user_config to serialize so two
    // browser tabs can't double-spend the same balance.
    let result: PromoteResponse
    try {
      result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM user_config WHERE userid = ${userId} FOR UPDATE`

        const userConfig = await tx.user_config.findUnique({
          where: { userid: userId },
          select: { gems: true },
        })
        const currentGems = userConfig?.gems ?? 0
        if (currentGems < LISTING_PROMOTION_GEM_COST) {
          throw new ValidationError(
            `Not enough gems. You need ${LISTING_PROMOTION_GEM_COST} but only have ${currentGems}.`,
            400,
          )
        }

        const now = new Date()
        const baseStart =
          listing.promoted_until && listing.promoted_until > now
            ? listing.promoted_until
            : now
        const newUntil = new Date(
          baseStart.getTime() + LISTING_PROMOTION_HOURS * 3600_000,
        )

        await tx.user_config.update({
          where: { userid: userId },
          data: { gems: { decrement: LISTING_PROMOTION_GEM_COST } },
        })

        await tx.gem_transactions.create({
          data: {
            transaction_type: "AUTOMATIC",
            actorid: userId,
            from_account: userId,
            to_account: null,
            amount: LISTING_PROMOTION_GEM_COST,
            description: `Listing promotion: /servers/${listing.slug} for ${LISTING_PROMOTION_HOURS}h`,
            reference: `listing_promote:${guildId.toString()}:${now.getTime()}`,
          },
        })

        await tx.server_listings.update({
          where: { guildid: guildId },
          data: {
            promoted_until: newUntil,
            updated_at: now,
          },
        })

        return {
          ok: true as const,
          promoted_until: newUntil.toISOString(),
          cost: LISTING_PROMOTION_GEM_COST,
          hours: LISTING_PROMOTION_HOURS,
          remaining_gems: currentGems - LISTING_PROMOTION_GEM_COST,
        }
      })
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(err.status).json({ error: err.message })
      }
      throw err
    }

    return res.status(200).json(result)
  },
})
