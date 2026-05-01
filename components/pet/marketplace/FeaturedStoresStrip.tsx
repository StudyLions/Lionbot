// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Theme catalog + discoverability rollout -- horizontal
//          scroll-snap strip of theme-painted seller-store tiles
//          rendered above the marketplace browse grid.
//
//          Why this exists: until now the only path to a personal
//          shop was a 9px seller chip on a single listing. This
//          strip puts ten of the most active customised stores
//          right at the top of the marketplace, painted in their
//          own theme + accent so each shop reads as a distinct
//          visual destination rather than a row of links.
//
//          The strip:
//            - Fetches /api/pet/marketplace/featured-stores via
//              SWR.
//            - Returns null when the response is empty (so the
//              page just collapses cleanly on a fresh DB).
//            - Renders skeleton tiles while loading so the page
//              doesn't reflow on first paint.
//            - Each tile paints the upper half with the theme's
//              pageBackground and houses a small StoreCanvas; the
//              lower half uses the theme's panelBackground for
//              text legibility.
//            - Whole tile is a Next/Link to /pet/marketplace/store/
//              {slug || sellerId}.
// ============================================================
import Link from "next/link"
import { useEffect } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import StoreCanvas from "@/components/pet/store/StoreCanvas"
import {
  STORE_THEMES,
  type StoreThemeId,
  type StoreAnimationId,
} from "@/constants/StoreThemes"
import { type LionHeartTier } from "@/utils/subscription"
import { Sparkles, Store, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedStore {
  sellerId: string
  sellerName: string
  sellerTier: LionHeartTier
  sellerTierLabel: string
  store: {
    displayName: string | null
    effectiveName: string
    slug: string | null
    themeId: string
    accentColor: string | null
    backgroundAnimation: string
    lionPose: string
    speechBubble: string | null
  }
  activeListingCount: number
  pet: {
    name: string
    level: number
    expression: string
    roomPrefix: string
    furniture: Record<string, string>
    roomLayout: Record<string, unknown>
    equipment: Record<string, {
      name: string
      category: string
      rarity: string
      assetPath: string
      glowTier: string
      glowIntensity: number
    }>
  } | null
}

interface FeaturedStoresStripResponse {
  stores: FeaturedStore[]
}

const TIER_BADGE: Record<LionHeartTier, { bg: string; text: string }> = {
  FREE: { bg: "rgba(110,120,140,0.30)", text: "#c8d2e0" },
  LIONHEART: { bg: "rgba(240,192,64,0.18)", text: "#f0c040" },
  LIONHEART_PLUS: { bg: "rgba(168,85,247,0.22)", text: "#c8a4ff" },
  LIONHEART_PLUS_PLUS: { bg: "rgba(255,107,157,0.22)", text: "#ff90b8" },
}

/**
 * Idempotent <link rel="stylesheet"> injection for theme fonts. We dedupe
 * by href so 10 tiles on the same page only inject each unique font once.
 * Mirrors the helper in components/pet/store/ThemeStyle.tsx but kept inline
 * here so the strip works even when the surrounding page hasn't already
 * mounted ThemeStyle.
 */
function ensureGoogleFont(href: string | undefined) {
  if (typeof window === "undefined" || !href) return
  if (document.head.querySelector(`link[data-store-font="${href}"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.dataset.storeFont = href
  document.head.appendChild(link)
}

export default function FeaturedStoresStrip({
  enabled = true,
}: {
  /** Disable the fetch when there's no logged-in viewer or the page is
   *  in a loading state where rendering nothing is the safer default. */
  enabled?: boolean
}) {
  const { data, isLoading, error } = useDashboard<FeaturedStoresStripResponse>(
    enabled ? "/api/pet/marketplace/featured-stores" : null,
  )

  const stores = data?.stores ?? []

  // Inject every unique theme font once on mount/update so the tile names
  // render in the theme's own typeface rather than the page-default.
  useEffect(() => {
    for (const s of stores) {
      const theme = STORE_THEMES[s.store.themeId as StoreThemeId] ?? STORE_THEMES.default
      ensureGoogleFont(theme.font.googleFontHref)
    }
  }, [stores])

  if (error) return null
  if (!isLoading && stores.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--pet-gold,#f0c040)]">
            <Sparkles size={16} />
          </span>
          <h2 className="font-pixel text-base sm:text-lg text-[var(--pet-text,#e2e8f0)]">
            Stores to discover
          </h2>
        </div>
        <p className="font-pixel text-[10px] sm:text-[11px] text-[var(--pet-text-dim,#7a8a9a)] hidden sm:block">
          Theme-painted shops with active listings
        </p>
      </div>

      {/* Horizontal scroll-snap row. We rely on overflow-x-auto + snap so
          the tiles flow naturally and the strip never breaks the page
          width on tiny screens. The negative-x-padding compensates for the
          inset of PetShell so tiles can full-bleed if you flick fast. */}
      <div className="-mx-1 px-1 overflow-x-auto scrollbar-thin pb-2">
        <div
          className="flex gap-3 snap-x snap-mandatory min-w-min"
          style={{ scrollPaddingLeft: "0.25rem", scrollPaddingRight: "0.25rem" }}
        >
          {isLoading && stores.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)
            : stores.map((s) => <FeaturedStoreTile key={s.sellerId} store={s} />)}
        </div>
      </div>
    </section>
  )
}

function FeaturedStoreTile({ store }: { store: FeaturedStore }) {
  const theme = STORE_THEMES[store.store.themeId as StoreThemeId] ?? STORE_THEMES.default
  const accent = (store.store.accentColor || theme.accent || "#f0c040").slice(0, 7)
  const tierBadge = TIER_BADGE[store.sellerTier]
  const targetSlug = store.store.slug || store.sellerId
  const animationId = (store.store.backgroundAnimation as StoreAnimationId) ?? "none"

  // The tile itself is a Link -- we wrap with <a className="block"> so the
  // entire surface is clickable, not just the name.
  return (
    <Link href={`/pet/marketplace/store/${targetSlug}`}>
      <a
        className={cn(
          "snap-start flex-shrink-0 w-[260px] sm:w-[280px] border-2 overflow-hidden",
          "transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.99]",
          "shadow-[3px_3px_0_rgba(0,0,0,0.5)]",
        )}
        style={{ borderColor: accent }}
        aria-label={`Visit ${store.store.effectiveName}`}
      >
        {/* Lion / theme-painted upper section */}
        <div
          className="relative h-[200px] flex items-center justify-center overflow-hidden"
          style={{
            background: theme.pageBackground,
            backgroundSize: animationId === "rainbow" ? "400% 400%" : undefined,
            color: theme.textColor,
          }}
        >
          {store.pet ? (
            <StoreCanvas
              pet={store.pet}
              accentColor={accent}
              themeId={(store.store.themeId as StoreThemeId) ?? "default"}
              animationId="none"
              animated={false}
              width={140}
              hideSpeechBubble
              showCaption={false}
              shopkeeperName={store.store.effectiveName}
            />
          ) : (
            <div
              className="font-pixel text-[11px] px-3 py-2 text-center"
              style={{ color: theme.textDim }}
            >
              {store.sellerName} hasn&apos;t hatched their lion yet.
            </div>
          )}

          {/* Tier badge in the upper-right corner */}
          <span
            className="absolute top-2 right-2 px-1.5 py-0.5 font-pixel text-[9px] flex items-center gap-1 border"
            style={{
              background: tierBadge.bg,
              color: tierBadge.text,
              borderColor: tierBadge.text,
            }}
          >
            {store.sellerTier === "FREE" ? <Lock size={9} /> : <Sparkles size={9} />}
            {store.sellerTierLabel}
          </span>
        </div>

        {/* Identity / metadata lower section. Themed panel background so
            the type stays legible regardless of how busy the upper half
            gets. */}
        <div
          className="px-3 py-2.5 flex flex-col gap-1"
          style={{
            background: theme.panelBackground,
            color: theme.textColor,
            fontFamily: theme.font.family,
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Store size={12} className="flex-shrink-0" style={{ color: accent }} />
            <span className="text-[13px] sm:text-[14px] truncate font-bold leading-tight">
              {store.store.effectiveName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span style={{ color: theme.textDim }}>
              by {store.sellerName}
            </span>
            <span
              className="px-1.5 py-0.5 font-pixel"
              style={{
                background: `${accent}1f`,
                color: accent,
                border: `1px solid ${accent}66`,
              }}
            >
              {store.activeListingCount} {store.activeListingCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
      </a>
    </Link>
  )
}

function SkeletonTile() {
  return (
    <div className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] border-2 border-[#1a2a3c] bg-[#0c1020] overflow-hidden">
      <div className="h-[200px] animate-pulse bg-gradient-to-br from-[#0a0e1a] via-[#101626] to-[#0a0e1a]" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3 w-3/4 bg-[#1a2a3c] animate-pulse" />
        <div className="h-2 w-1/2 bg-[#1a2a3c] animate-pulse" />
      </div>
    </div>
  )
}
