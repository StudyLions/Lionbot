// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Theme catalog + discoverability rollout -- powers the
//          FeaturedStoresStrip on /pet/marketplace by returning
//          up to 10 customized seller stores that have at least
//          one active listing.
//
//          Customized means the seller went out of their way to
//          set a non-default theme, custom display name, or
//          vanity slug. Those signals = "this person built a
//          shop, surface them to other browsers."
//
//          Sort order: seller tier descending (premium first),
//          then store.updated_at descending (recently tweaked
//          stores bubble up). The viewer is excluded so the strip
//          never points back at their own shop.
//
//          Each entry ships everything the strip needs to render
//          a tile WITHOUT the strip having to make 10 follow-up
//          requests:
//            displayName / slug / themeId / accentColor
//            sellerName (fallback if no displayName) / sellerTier
//            activeListingCount + minimal pet visual data so
//            StoreCanvas can render the lion shopkeeper.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"
import { fetchPetVisualData } from "@/utils/petProfile"
import { getAuthContext } from "@/utils/adminAuth"
import {
  LION_HEART_TIER_LABELS,
  LION_HEART_TIER_RANK,
  type LionHeartTier,
} from "@/utils/subscription"

const MAX_STORES = 10

function isCustomTier(tier: string): tier is LionHeartTier {
  return (
    tier === "FREE" ||
    tier === "LIONHEART" ||
    tier === "LIONHEART_PLUS" ||
    tier === "LIONHEART_PLUS_PLUS"
  )
}

export default apiHandler({
  async GET(req, res) {
    // Auth is opportunistic: we want to exclude the viewer's own store from
    // the strip when they're logged in, but logged-out browsers still see
    // the same recommendations as everyone else.
    const auth = await getAuthContext(req).catch(() => null)
    const viewerId = auth?.discordId ? BigInt(auth.discordId) : null

    // 1) Pull every customized store row in a single query. "Customized"
    //    means the seller has a non-default theme OR a display name OR a
    //    vanity slug -- any of those signals are evidence they actually
    //    set the store up rather than just touching the page once.
    const rawStores = await prisma.lg_user_stores.findMany({
      where: {
        OR: [
          { theme_id: { not: "default" } },
          { display_name: { not: null } },
          { slug: { not: null } },
        ],
        ...(viewerId ? { NOT: { userid: viewerId } } : {}),
      },
      select: {
        userid: true,
        display_name: true,
        slug: true,
        theme_id: true,
        accent_color: true,
        background_animation: true,
        lion_pose: true,
        speech_bubble: true,
        updated_at: true,
      },
    })

    if (rawStores.length === 0) {
      return res.status(200).json({ stores: [] })
    }

    const candidateIds = rawStores.map((s) => s.userid)

    // 2) Batch-count active listings per seller, batch-resolve seller tiers,
    //    and batch-fetch fallback display names. All in parallel so we only
    //    pay one round-trip even with hundreds of candidates.
    const [activeCounts, subRows, userConfigs] = await Promise.all([
      prisma.lg_marketplace_listings.groupBy({
        by: ["seller_userid"],
        where: { seller_userid: { in: candidateIds }, status: "ACTIVE" },
        _count: { _all: true },
      }),
      prisma.user_subscriptions.findMany({
        where: { userid: { in: candidateIds } },
        select: { userid: true, tier: true, status: true },
      }),
      prisma.user_config.findMany({
        where: { userid: { in: candidateIds } },
        select: { userid: true, name: true },
      }),
    ])

    const activeCountMap = new Map<string, number>()
    for (const row of activeCounts) {
      activeCountMap.set(row.seller_userid.toString(), row._count._all)
    }

    const tierMap = new Map<string, LionHeartTier>()
    for (const row of subRows) {
      const isActive = row.status === "ACTIVE" || row.status === "CANCELLING"
      const tier = isActive && row.tier && isCustomTier(row.tier) ? row.tier : "FREE"
      tierMap.set(row.userid.toString(), tier)
    }

    const nameMap = new Map<string, string>()
    for (const row of userConfigs) {
      const sid = row.userid.toString()
      nameMap.set(sid, row.name ?? `Player${sid.slice(-4)}`)
    }

    // 3) Filter to stores with >=1 active listing, then sort by tier desc
    //    (premium first), then by updated_at desc, then take MAX_STORES.
    type Enriched = (typeof rawStores)[number] & {
      activeListingCount: number
      tier: LionHeartTier
      sellerName: string
    }
    const enriched: Enriched[] = []
    for (const s of rawStores) {
      const sid = s.userid.toString()
      const count = activeCountMap.get(sid) ?? 0
      if (count <= 0) continue
      enriched.push({
        ...s,
        activeListingCount: count,
        tier: tierMap.get(sid) ?? "FREE",
        sellerName: nameMap.get(sid) ?? `Player${sid.slice(-4)}`,
      })
    }
    enriched.sort((a, b) => {
      const ta = LION_HEART_TIER_RANK[a.tier]
      const tb = LION_HEART_TIER_RANK[b.tier]
      if (tb !== ta) return tb - ta
      return b.updated_at.getTime() - a.updated_at.getTime()
    })
    const top = enriched.slice(0, MAX_STORES)

    if (top.length === 0) {
      return res.status(200).json({ stores: [] })
    }

    // 4) For the surviving top-N only, fetch the pet visual data so
    //    StoreCanvas can render. Run them in parallel; petVisual is a
    //    composite query (~6 round-trips per user) so we want the I/O
    //    overlapped rather than serial.
    const petVisuals = await Promise.all(
      top.map((s) => fetchPetVisualData(s.userid).catch(() => null)),
    )

    const stores = top.map((s, idx) => {
      const petVisual = petVisuals[idx]
      const sid = s.userid.toString()
      const fallbackName = s.sellerName
      const displayName = s.display_name?.trim() || null
      return {
        sellerId: sid,
        sellerName: fallbackName,
        sellerTier: s.tier,
        sellerTierLabel: LION_HEART_TIER_LABELS[s.tier],
        store: {
          displayName,
          effectiveName: displayName || `${fallbackName}'s Shop`,
          slug: s.slug ?? null,
          themeId: s.theme_id ?? "default",
          accentColor: s.accent_color ?? null,
          backgroundAnimation: s.background_animation ?? "none",
          lionPose: s.lion_pose ?? "idle",
          speechBubble: s.speech_bubble ?? null,
        },
        activeListingCount: s.activeListingCount,
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
      }
    })

    return res.status(200).json({ stores })
  },
})
