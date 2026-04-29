// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- public personal store page.
//
// 2026-04-29 (rev 2): full-bleed redesign. The previous version sat inside
// PetShell, capping content at 1024px and stuffing the lion + speech
// bubble + listings into 3 fragile columns. The bubble was absolute-
// positioned outside the GameBoy frame and routinely got clipped by /
// overlapped with the listings column. The customize button used the
// invalid `<Link><a><PixelButton>` nesting which the button swallowed
// in some browsers, so the click never navigated.
//
// The redesigned page:
//   - drops PetShell entirely; renders directly under <Layout>, so the
//     theme background paints the full viewport
//   - hero: GameBoy frame on the left, speech bubble in its OWN flex
//     column on the right (no absolute positioning -- so no overlap)
//   - listings: full-width responsive grid below the hero (up to 6 cols
//     on xl screens)
//   - customize button: real <a> styled like a button, no nested
//     interactive elements
// ============================================================
import { useCallback, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { ChevronLeft, Settings, Heart, Store, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import PixelCard from "@/components/pet/ui/PixelCard"
import { Skeleton } from "@/components/ui/skeleton"
import StoreCanvas from "@/components/pet/store/StoreCanvas"
import SpeechBubble from "@/components/pet/store/SpeechBubble"
import ThemeStyle from "@/components/pet/store/ThemeStyle"
import ListingCard, { type ListingData } from "@/components/pet/marketplace/ListingCard"
import BuyDialog from "@/components/pet/marketplace/BuyDialog"
import { LION_HEART_TIER_LABELS, type LionHeartTier } from "@/utils/subscription"
import {
  resolveThemeForRender, resolveAnimationForRender,
  type StoreThemeId, type StoreAnimationId,
} from "@/constants/StoreThemes"
import { cn } from "@/lib/utils"

interface StoreApiResponse {
  seller: {
    discordId: string
    discordName: string
    avatarHash: string | null
    tier: LionHeartTier
    tierLabel: string
  }
  store: {
    displayName: string | null
    effectiveName: string
    speechBubble: string
    lionPose: string
    themeId: string
    accentColor: string | null
    backgroundAnimation: string
    slug?: string | null
  }
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
  listings: ListingData[]
  isOwner: boolean
}

const TIER_BADGE_COLORS: Record<LionHeartTier, { border: string; bg: string; text: string }> = {
  FREE:                { border: "#3a4a6c", bg: "#0c1020",        text: "#8899aa" },
  LIONHEART:           { border: "#5B8DEF", bg: "#5B8DEF15",      text: "#a8c5ff" },
  LIONHEART_PLUS:      { border: "#FF69B4", bg: "#FF69B415",      text: "#ffb0d8" },
  LIONHEART_PLUS_PLUS: { border: "#FFD700", bg: "#FFD70015",      text: "#ffe680" },
}

/**
 * Renders an anchor styled like our PixelButton without nesting an actual
 * <button>. The previous version used <Link><a><PixelButton/></a></Link>
 * which is `<a><button>` -- invalid HTML and the button swallows clicks
 * in some browsers, so the link never navigated. This is a flat <a>.
 */
function PixelLinkButton({
  href, variant = "primary", className, children,
}: {
  href: string
  variant?: "primary" | "ghost" | "info"
  className?: string
  children: React.ReactNode
}) {
  const variants = {
    primary: "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8] hover:bg-[#338844]",
    info:    "bg-[#2a3a7a] border-[#4080f0] text-[#d0e0ff] hover:bg-[#334488]",
    ghost:   "bg-transparent border-[#3a4a6c] text-[#8899aa] hover:bg-[#1a2438] hover:text-[#c0d0e0]",
  } as const
  return (
    <Link href={href}>
      <a
        className={cn(
          "font-pixel inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px]",
          "border-2 transition-all select-none no-underline",
          "shadow-[2px_2px_0_#060810]",
          "motion-safe:hover:shadow-[1px_1px_0_#060810] motion-safe:hover:translate-x-px motion-safe:hover:translate-y-px",
          "motion-safe:active:shadow-none motion-safe:active:translate-x-0.5 motion-safe:active:translate-y-0.5",
          variants[variant],
          className,
        )}
      >
        {children}
      </a>
    </Link>
  )
}

function StoreInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const id = typeof router.query.id === "string" ? router.query.id : null

  const { data, isLoading, error } = useDashboard<StoreApiResponse>(
    id ? `/api/pet/marketplace/store/${id}` : null,
  )

  const [buyTarget, setBuyTarget] = useState<ListingData | null>(null)

  const handleBuy = useCallback(async (listingId: number, quantity: number) => {
    const res = await fetch("/api/pet/marketplace/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, quantity }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || "Purchase failed")
    invalidatePrefix("/api/pet/marketplace")
    toast.success(body.message || "Purchase complete!")
    return body
  }, [])

  if (isLoading || !id) {
    return (
      <FullBleedShell>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[420px] w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[240px]" />
            ))}
          </div>
        </div>
      </FullBleedShell>
    )
  }

  if (error || !data) {
    const isAuthError = (error as any)?.status === 401
    return (
      <FullBleedShell>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <PixelCard className="p-8 text-center" corners>
            <p className="font-pixel text-sm text-[var(--pet-red,#e04040)] mb-3">
              {isAuthError ? "Sign in to view stores." : (error as Error)?.message || "Store not found."}
            </p>
            <PixelLinkButton href="/pet/marketplace" variant="ghost">
              <ChevronLeft size={12} className="mr-1" /> Back to Marketplace
            </PixelLinkButton>
          </PixelCard>
        </div>
      </FullBleedShell>
    )
  }

  const { seller, store, pet, listings, isOwner } = data
  const tierColors = TIER_BADGE_COLORS[seller.tier]
  const isPremiumSeller = seller.tier !== "FREE"

  // Resolve the active theme + animation against the seller's tier so a
  // downgraded subscriber gracefully falls back to defaults.
  const theme = resolveThemeForRender(store.themeId, seller.tier)
  const animation = resolveAnimationForRender(store.backgroundAnimation, seller.tier)
  const accent = store.accentColor ?? theme.accent

  return (
    <FullBleedShell
      themeId={theme.id as StoreThemeId}
      animationId={animation.id as StoreAnimationId}
      pageBackground={theme.pageBackground}
      textColor={theme.textColor}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/pet/marketplace">
            <a
              className="font-pixel text-[12px] inline-flex items-center gap-1.5 transition-colors no-underline px-3 py-1.5 border-2 border-transparent hover:border-[#3a4a6c] hover:bg-black/20"
              style={{ color: theme.textDim }}
            >
              <ChevronLeft size={14} /> Back to Marketplace
            </a>
          </Link>

          {isOwner && (
            <PixelLinkButton href="/pet/marketplace/store/customize" variant="info">
              <Settings size={12} /> Customize Your Store
            </PixelLinkButton>
          )}
        </div>

        {/* Hero: lion shopkeeper + speech bubble + store identity */}
        <PixelCard
          className="p-5 md:p-6"
          corners
          borderColor={isPremiumSeller ? tierColors.border : undefined}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
            {/* Lion on the left */}
            <div className="flex-shrink-0">
              <StoreCanvas
                pet={pet}
                speechBubble={null}
                shopkeeperName={undefined}
                hideSpeechBubble
                showCaption={false}
                accentColor={store.accentColor}
                themeId={theme.id as StoreThemeId}
                animationId={animation.id as StoreAnimationId}
                width={300}
                animated
              />
            </div>

            {/* Identity + bubble on the right */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Title row */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Store size={20} className="text-[var(--pet-gold,#f0c040)] flex-shrink-0" />
                  <h1
                    className="font-pixel text-2xl leading-tight break-words"
                    style={{ color: theme.textColor }}
                  >
                    {store.effectiveName}
                  </h1>
                  {isPremiumSeller && (
                    <span
                      className="font-pixel text-[10px] px-2 py-1 border-2 inline-flex items-center gap-1 flex-shrink-0"
                      style={{
                        borderColor: tierColors.border,
                        background: tierColors.bg,
                        color: tierColors.text,
                      }}
                    >
                      <Heart size={10} /> {seller.tierLabel}
                    </span>
                  )}
                </div>
                <p
                  className="font-pixel text-[12px] mt-2"
                  style={{ color: theme.textDim }}
                >
                  {store.displayName ? (
                    <>shopkeeper: <span style={{ color: theme.textColor }}>{seller.discordName}</span></>
                  ) : (
                    <><span style={{ color: theme.textColor }}>{seller.discordName}</span>&apos;s personal store</>
                  )}
                  <span className="mx-2 opacity-50">&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag size={11} /> {listings.length} active listing{listings.length === 1 ? "" : "s"}
                  </span>
                  {store.slug ? (
                    <>
                      <span className="mx-2 opacity-50">&middot;</span>
                      <code
                        className="text-[10px] px-1.5 py-0.5 border"
                        style={{
                          color: accent,
                          borderColor: `${accent}55`,
                          background: "rgba(0,0,0,0.25)",
                        }}
                      >
                        /store/{store.slug}
                      </code>
                    </>
                  ) : null}
                </p>
              </div>

              {/* Speech bubble -- now in its own flex column, no absolute */}
              {store.speechBubble ? (
                <div className="max-w-xl">
                  <SpeechBubble tailSide="left" accentColor={accent}>
                    {store.speechBubble}
                  </SpeechBubble>
                </div>
              ) : null}

              {/* Lion + shopkeeper caption (was previously inside StoreCanvas) */}
              {pet ? (
                <p
                  className="font-pixel text-[11px]"
                  style={{ color: `${theme.textDim}cc` }}
                >
                  Tended by <span style={{ color: theme.textColor }}>{pet.name}</span>,
                  who is a level {pet.level} LionGotchi.
                </p>
              ) : null}
            </div>
          </div>
        </PixelCard>

        {/* Listings -- full-width grid below the hero */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2
              className="font-pixel text-base inline-flex items-center gap-2"
              style={{ color: theme.textColor }}
            >
              <ShoppingBag size={16} className="text-[var(--pet-gold,#f0c040)]" />
              On sale
            </h2>
            {isOwner && (
              <PixelLinkButton href="/pet/marketplace/sell" variant="primary">
                + List a new item
              </PixelLinkButton>
            )}
          </div>

          {listings.length === 0 ? (
            <PixelCard className="p-12 text-center" corners>
              <ShoppingBag size={32} className="mx-auto text-[var(--pet-text-dim,#8899aa)] mb-3 opacity-50" />
              <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)] mb-4">
                {isOwner
                  ? "Your shop is empty -- list an item to start selling!"
                  : `${seller.discordName} hasn't listed anything yet. Check back soon!`}
              </p>
              {isOwner && (
                <PixelLinkButton href="/pet/marketplace/sell" variant="primary">
                  + List your first item
                </PixelLinkButton>
              )}
            </PixelCard>
          ) : (
            <div
              className={cn(
                "grid gap-3",
                "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
              )}
            >
              {listings.map((listing) => (
                <ListingCard
                  key={listing.listingId}
                  listing={listing}
                  onBuy={(l) => {
                    if (!session) {
                      toast.error("Sign in to buy items.")
                      return
                    }
                    if (isOwner) {
                      toast.message("That's your own listing -- visitors will buy it from here.")
                      return
                    }
                    setBuyTarget(l)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {buyTarget && (
        <BuyDialog
          listing={buyTarget as any}
          onClose={() => setBuyTarget(null)}
          onConfirm={async (listingId, quantity) => {
            await handleBuy(listingId, quantity)
            setBuyTarget(null)
          }}
        />
      )}
    </FullBleedShell>
  )
}

/**
 * Full-bleed wrapper that paints the seller's chosen theme background
 * across the entire viewport (minus the global header). When themeId /
 * pageBackground are not supplied (e.g. loading + error states) it
 * falls back to the default pet section background.
 */
function FullBleedShell({
  children, themeId, animationId, pageBackground, textColor,
}: {
  children: React.ReactNode
  themeId?: StoreThemeId
  animationId?: StoreAnimationId
  pageBackground?: string
  textColor?: string
}) {
  const animClass =
    animationId === "parallax-clouds" ? "lg-store-anim lg-store-anim-parallax-clouds"
      : animationId === "pulse" ? "lg-store-anim lg-store-anim-pulse"
      : animationId === "rainbow" ? "lg-store-anim lg-store-anim-rainbow"
      : ""

  return (
    <>
      {themeId && animationId ? (
        <ThemeStyle themeId={themeId} animationId={animationId} />
      ) : null}
      <div
        className={cn("pet-section pet-scanline min-h-[calc(100vh-80px)]", animClass)}
        style={{
          background: pageBackground,
          backgroundSize: animationId === "rainbow" ? "400% 400%" : undefined,
          color: textColor,
        }}
      >
        {children}
      </div>
    </>
  )
}

export default function StorePage() {
  return (
    <Layout SEO={{ title: "Store - LionGotchi Marketplace", description: "Browse a personal LionGotchi store front." }}>
      <AdminGuard variant="pet">
        <StoreInner />
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
