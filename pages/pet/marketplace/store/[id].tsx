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
// 2026-04-30 (rev 3): sidebar layout. Rev 2 still used a single hero
// row stacked above a listings grid, which left ~380px of dead space
// to the right of the speech bubble at xl, and ate ~530px of vertical
// space before the first listing on mobile (lion + identity stacked).
//
// Rev 3 turns the page into a CSS grid:
//   - lg+ : sticky LEFT sidebar (~320px) with the lion + identity +
//           speech bubble + owner action; listings flow into a
//           full-width RIGHT column. The lion stays in view while
//           the buyer scrolls the listings.
//   - <lg : the same sidebar block becomes a horizontal banner --
//           lion 140px on the left, identity inline on the right,
//           speech bubble + owner action below the row at full
//           width. Listings sit under the banner in a tight 2/3
//           col grid.
//
// We render TWO StoreCanvas instances (mobile 140px / desktop 260px)
// with hidden/lg:block toggles, identical otherwise. This avoids
// touching the StoreCanvas component just to add a responsive width.
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
        {/* --- AI-MODIFIED (2026-04-30) ---
            Reason: skeleton mirrors the new sidebar + listings grid so the
            page doesn't reflow when data lands. */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
            <Skeleton className="h-[420px] w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[240px]" />
              ))}
            </div>
          </div>
        </div>
        {/* --- END AI-MODIFIED --- */}
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

  // --- AI-MODIFIED (2026-04-30) ---
  // Reason: shared StoreCanvas props between the mobile + desktop instances
  // so the two renders stay in sync. The lion is stamped twice (different
  // widths) with hidden/lg:block toggles -- see file header for why.
  const canvasProps = {
    pet,
    speechBubble: null,
    shopkeeperName: undefined,
    hideSpeechBubble: true,
    showCaption: false,
    accentColor: store.accentColor,
    themeId: theme.id as StoreThemeId,
    animationId: animation.id as StoreAnimationId,
    animated: true,
  } as const
  // --- END AI-MODIFIED ---

  return (
    <FullBleedShell
      themeId={theme.id as StoreThemeId}
      animationId={animation.id as StoreAnimationId}
      pageBackground={theme.pageBackground}
      textColor={theme.textColor}
    >
      {/* --- AI-MODIFIED (2026-04-30) ---
          Reason: page width raised from max-w-7xl (1280px) to max-w-[1600px]
          so the listings grid has room to breathe at 2xl when the sidebar
          docks on the left. */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
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

        {/* --- AI-MODIFIED (2026-04-30) ---
            Reason: 2-column CSS grid -- sidebar (lion + identity + bubble)
            on the left, listings grid on the right. On <lg the grid
            collapses to a single column and the sidebar becomes a
            horizontal banner. */}
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          {/* SIDEBAR (lg+) / BANNER (<lg) */}
          <aside className="lg:sticky lg:top-4 self-start min-w-0">
            <PixelCard
              className="p-4 lg:p-5"
              corners
              borderColor={isPremiumSeller ? tierColors.border : undefined}
            >
              {/* Top row: lion (left on mobile, top on lg) + identity */}
              <div className="flex flex-row lg:flex-col gap-4 items-start lg:items-stretch">
                {/* Lion canvas -- two instances toggled by breakpoint */}
                <div className="flex-shrink-0 lg:self-center">
                  <div className="lg:hidden">
                    <StoreCanvas {...canvasProps} width={140} />
                  </div>
                  <div className="hidden lg:block">
                    <StoreCanvas {...canvasProps} width={260} />
                  </div>
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 w-full space-y-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Store size={18} className="text-[var(--pet-gold,#f0c040)] flex-shrink-0 mt-0.5" />
                    <h1
                      className="font-pixel text-lg sm:text-xl lg:text-[22px] leading-tight break-words flex-1 min-w-0"
                      style={{ color: theme.textColor }}
                    >
                      {store.effectiveName}
                    </h1>
                  </div>
                  {isPremiumSeller && (
                    <span
                      className="font-pixel text-[10px] px-2 py-1 border-2 inline-flex items-center gap-1"
                      style={{
                        borderColor: tierColors.border,
                        background: tierColors.bg,
                        color: tierColors.text,
                      }}
                    >
                      <Heart size={10} /> {seller.tierLabel}
                    </span>
                  )}
                  <p
                    className="font-pixel text-[11px] leading-relaxed"
                    style={{ color: theme.textDim }}
                  >
                    {store.displayName ? (
                      <>shopkeeper{" "}
                        <span style={{ color: theme.textColor }}>{seller.discordName}</span>
                      </>
                    ) : (
                      <>by <span style={{ color: theme.textColor }}>{seller.discordName}</span></>
                    )}
                  </p>
                  <p
                    className="font-pixel text-[11px] inline-flex items-center gap-1"
                    style={{ color: theme.textDim }}
                  >
                    <ShoppingBag size={11} /> {listings.length} active listing{listings.length === 1 ? "" : "s"}
                  </p>
                  {store.slug ? (
                    <p>
                      <code
                        className="font-pixel text-[10px] px-1.5 py-0.5 border inline-block break-all"
                        style={{
                          color: accent,
                          borderColor: `${accent}55`,
                          background: "rgba(0,0,0,0.25)",
                        }}
                      >
                        /store/{store.slug}
                      </code>
                    </p>
                  ) : null}
                  {pet ? (
                    <p
                      className="font-pixel text-[11px] leading-relaxed hidden lg:block"
                      style={{ color: `${theme.textDim}cc` }}
                    >
                      Tended by <span style={{ color: theme.textColor }}>{pet.name}</span>,
                      a level {pet.level} LionGotchi.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Mobile-only "tended by" -- kept on its own line below the row
                  so the identity column above stays compact on narrow phones. */}
              {pet ? (
                <p
                  className="font-pixel text-[11px] leading-relaxed mt-3 lg:hidden"
                  style={{ color: `${theme.textDim}cc` }}
                >
                  Tended by <span style={{ color: theme.textColor }}>{pet.name}</span>,
                  a level {pet.level} LionGotchi.
                </p>
              ) : null}

              {/* Speech bubble -- full-width row below the lion+identity */}
              {store.speechBubble ? (
                <div className="mt-4">
                  <SpeechBubble
                    tailSide="left"
                    accentColor={accent}
                    className="max-w-none"
                  >
                    {store.speechBubble}
                  </SpeechBubble>
                </div>
              ) : null}

              {/* Owner action -- list a new item, full-width inside the sidebar */}
              {isOwner && (
                <div className="mt-4">
                  <PixelLinkButton
                    href="/pet/marketplace/sell"
                    variant="primary"
                    className="w-full"
                  >
                    + List a new item
                  </PixelLinkButton>
                </div>
              )}
            </PixelCard>
          </aside>
          {/* --- END AI-MODIFIED --- */}

          {/* LISTINGS COLUMN -- right side on lg+, full-width below banner on <lg */}
          <section className="space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2
                className="font-pixel text-base inline-flex items-center gap-2"
                style={{ color: theme.textColor }}
              >
                <ShoppingBag size={16} className="text-[var(--pet-gold,#f0c040)]" />
                On sale
              </h2>
            </div>

            {listings.length === 0 ? (
              <PixelCard className="p-8 sm:p-12 text-center" corners>
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
              // --- AI-MODIFIED (2026-04-30) ---
              // Reason: grid density rebalanced for the sidebar layout.
              // The previous 2/3/4/5/6 progression assumed full page width;
              // now that the sidebar eats ~320px from lg+, lg drops to 3
              // cols (each ~220px) and 2xl pushes to 5 (each ~210px).
              <div
                className={cn(
                  "grid gap-3",
                  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
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
              // --- END AI-MODIFIED ---
            )}
          </section>
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
