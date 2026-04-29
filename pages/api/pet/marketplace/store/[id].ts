// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- public per-user store front API.
//          Returns the seller's customizable store config (display
//          name, speech bubble, lion pose, theme), the lion visual
//          data so the page can render them as a "shopkeeper" using
//          the existing RoomCanvas, and the seller's currently
//          ACTIVE listings.
//
//          The route is public (no auth required) so anyone can
//          discover a seller's store via /pet/marketplace/store/{id}.
//          The owner's auth context is read opportunistically just
//          so the response can include `isOwner: true` and surface
//          the "Customize Your Store" CTA on the page.
//
//          [id] is the seller's Discord snowflake. Phase 3 will add
//          slug resolution as a fallback.
// ============================================================
import { apiHandler, ValidationError } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"
import { fetchPetVisualData } from "@/utils/petProfile"
import { getAuthContext } from "@/utils/adminAuth"
import {
  getUserTier, getFeaturedListingSlots, LION_HEART_TIER_LABELS,
} from "@/utils/subscription"
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 3 -- support resolving the store by either
// a Discord snowflake (numeric) or a vanity slug (alphanumeric+hyphens).
// Pure-numeric IDs are NOT valid slugs by design (see utils/storeSlug.ts),
// so the dispatch is unambiguous: digits-only -> lookup by userid;
// otherwise -> lookup by slug, falling back to 404.
import { normalizeSlug } from "@/utils/storeSlug"
// --- END AI-MODIFIED ---

const DEFAULT_SPEECH_BUBBLE = "Welcome to my shop! Have a look around."

export default apiHandler({
  async GET(req, res) {
    const raw = String(req.query.id ?? "").trim()
    if (!raw) throw new ValidationError("store id is required")

    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- two-mode resolution:
    //   pure-digits => Discord snowflake (back-compat with /store/{id})
    //   anything else => vanity slug
    let sellerId: bigint | null = null
    if (/^\d+$/.test(raw)) {
      try {
        sellerId = BigInt(raw)
      } catch {
        throw new ValidationError("Invalid store id format")
      }
    } else {
      const slug = normalizeSlug(raw)
      const slugRow = await prisma.lg_user_stores.findFirst({
        where: { slug },
        select: { userid: true },
      })
      if (!slugRow) {
        return res.status(404).json({ error: "No store with that handle." })
      }
      sellerId = slugRow.userid
    }
    // --- END AI-MODIFIED ---

    const [storeRow, userConfig, petVisual, listings, sellerTier] = await Promise.all([
      prisma.lg_user_stores.findUnique({ where: { userid: sellerId } }),
      prisma.user_config.findUnique({
        where: { userid: sellerId },
        select: { userid: true, name: true, avatar_hash: true },
      }),
      fetchPetVisualData(sellerId),
      prisma.lg_marketplace_listings.findMany({
        where: { seller_userid: sellerId, status: "ACTIVE" },
        include: {
          lg_items: {
            select: {
              itemid: true, name: true, category: true, rarity: true,
              asset_path: true, slot: true, description: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      getUserTier(sellerId),
    ])

    if (!userConfig) {
      return res.status(404).json({ error: "This seller does not exist." })
    }

    const auth = await getAuthContext(req)
    const isOwner = !!auth && auth.discordId === sellerId.toString()

    const fallbackName = userConfig.name ?? `Player${sellerId.toString().slice(-4)}`

    const response = {
      seller: {
        discordId: sellerId.toString(),
        discordName: fallbackName,
        avatarHash: userConfig.avatar_hash ?? null,
        tier: sellerTier,
        tierLabel: LION_HEART_TIER_LABELS[sellerTier],
      },
      store: {
        displayName: storeRow?.display_name ?? null,
        effectiveName: storeRow?.display_name ?? `${fallbackName}'s Shop`,
        speechBubble: storeRow?.speech_bubble ?? DEFAULT_SPEECH_BUBBLE,
        lionPose: storeRow?.lion_pose ?? "idle",
        themeId: storeRow?.theme_id ?? "default",
        accentColor: storeRow?.accent_color ?? null,
        backgroundAnimation: storeRow?.background_animation ?? "none",
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Marketplace 2.0 Phase 3 -- expose the seller's slug so
        // the frontend can render the canonical share URL (or fall back
        // to the snowflake URL if no slug is set).
        slug: storeRow?.slug ?? null,
        // --- END AI-MODIFIED ---
      },
      pet: petVisual
        ? {
            name: petVisual.pet.name,
            level: petVisual.pet.level,
            expression: petVisual.pet.expression,
            roomPrefix: petVisual.roomPrefix,
            furniture: petVisual.furniture,
            roomLayout: petVisual.roomLayout,
            equipment: petVisual.equipment,
          }
        : null,
      listings: listings.map((l) => ({
        listingId: l.listingid,
        item: {
          id: l.lg_items.itemid,
          name: l.lg_items.name,
          category: l.lg_items.category,
          rarity: l.lg_items.rarity,
          assetPath: l.lg_items.asset_path,
          slot: l.lg_items.slot,
          description: l.lg_items.description,
        },
        enhancementLevel: l.enhancement_level,
        quantityRemaining: l.quantity_remaining,
        quantityListed: l.quantity_listed,
        pricePerUnit: l.price_per_unit,
        currency: l.currency,
        sellerId: sellerId.toString(),
        sellerName: storeRow?.display_name ?? fallbackName,
        createdAt: l.created_at.toISOString(),
        expiresAt: l.expires_at.toISOString(),
        scrollData: l.scroll_data ?? null,
        totalBonus: l.total_bonus ?? 0,
        // --- AI-MODIFIED (2026-04-29) ---
        // Purpose: Marketplace 2.0 Phase 3 -- include featured flag in
        // store-page listings so the same FEATURED badge renders here.
        isFeatured: l.is_featured ?? false,
        // --- END AI-MODIFIED ---
      })),
      isOwner,
    }

    return res.status(200).json(response)
  },
})
