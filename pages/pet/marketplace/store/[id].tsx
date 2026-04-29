// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- public personal store page. Shows
//          the seller's lion as their "shopkeeper" with a custom
//          speech bubble, the seller's tier badge, store name (or
//          Discord username fallback), and the grid of their
//          currently active listings. Owner-only "Customize Your
//          Store" CTA is rendered when the visitor IS the seller.
//
//          Buying re-uses the existing BuyDialog so behavior is
//          identical to the global marketplace.
// ============================================================
import { useCallback, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { ChevronLeft, Settings, Heart, Store } from "lucide-react"
import { toast } from "sonner"

import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import { Skeleton } from "@/components/ui/skeleton"
import StoreCanvas from "@/components/pet/store/StoreCanvas"
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
      <PetShell wide>
        <Skeleton className="h-12 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </PetShell>
    )
  }

  if (error || !data) {
    const isAuthError = (error as any)?.status === 401
    return (
      <PetShell>
        <PixelCard className="p-8 text-center" corners>
          <p className="font-pixel text-sm text-[var(--pet-red,#e04040)] mb-3">
            {isAuthError ? "Sign in to view stores." : (error as Error)?.message || "Store not found."}
          </p>
          <Link href="/pet/marketplace">
            <PixelButton variant="ghost" size="sm">Back to Marketplace</PixelButton>
          </Link>
        </PixelCard>
      </PetShell>
    )
  }

  const { seller, store, pet, listings, isOwner } = data
  const tierColors = TIER_BADGE_COLORS[seller.tier]
  const isPremiumSeller = seller.tier !== "FREE"

  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 2 -- resolve the active theme and
  // animation against the seller's tier, gracefully falling back to
  // default if they downgraded after picking a premium theme.
  const theme = resolveThemeForRender(store.themeId, seller.tier)
  const animation = resolveAnimationForRender(store.backgroundAnimation, seller.tier)
  // --- END AI-MODIFIED ---

  return (
    <PetShell wide>
      {/* --- AI-MODIFIED (2026-04-29) --- */}
      {/* Purpose: Marketplace 2.0 Phase 2 -- inject the seller's chosen theme
          font + animation keyframes into <head>. The wrapper below applies
          the theme background as a thin themed band so the lion shopkeeper
          stands out, without taking over the entire app chrome. */}
      <ThemeStyle themeId={theme.id as StoreThemeId} animationId={animation.id as StoreAnimationId} />
      <div
        className={cn(
          "space-y-5 lg-store-bg",
          animation.id !== "none" && "lg-store-anim",
          animation.id === "parallax-clouds" && "lg-store-anim-parallax-clouds",
          animation.id === "pulse" && "lg-store-anim-pulse",
          animation.id === "rainbow" && "lg-store-anim-rainbow",
          `lg-store-theme-${theme.id}`,
        )}
        style={{
          background: theme.pageBackground,
          backgroundSize: animation.id === "rainbow" ? "400% 400%" : undefined,
          padding: 16,
          margin: -16,
          borderRadius: 6,
          color: theme.textColor,
        }}
      >
      {/* --- END AI-MODIFIED --- */}
        {/* Top nav */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/pet/marketplace">
            <a className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] inline-flex items-center gap-1.5 transition-colors">
              <ChevronLeft size={14} /> Back to Marketplace
            </a>
          </Link>

          {isOwner && (
            <Link href="/pet/marketplace/store/customize">
              <a>
                <PixelButton variant="primary" size="sm">
                  <Settings size={12} className="mr-1" />
                  Customize Your Store
                </PixelButton>
              </a>
            </Link>
          )}
        </div>

        {/* Store header */}
        <PixelCard
          className="p-5"
          corners
          borderColor={isPremiumSeller ? tierColors.border : undefined}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Store size={18} className="text-[var(--pet-gold,#f0c040)]" />
                <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)] leading-tight break-words">
                  {store.effectiveName}
                </h1>
                {isPremiumSeller && (
                  <span
                    className="font-pixel text-[10px] px-2 py-0.5 border-2 inline-flex items-center gap-1"
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
              <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] mt-1.5">
                {store.displayName ? (
                  <>shopkeeper: {seller.discordName}</>
                ) : (
                  <>{seller.discordName}&apos;s personal store</>
                )}
                <span className="mx-2 text-[var(--pet-text-dim,#8899aa)]/50">&middot;</span>
                <span>{listings.length} active listing{listings.length === 1 ? "" : "s"}</span>
              </p>
            </div>
          </div>
        </PixelCard>

        {/* Lion shopkeeper + listings */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6 items-start">
          {/* Shopkeeper column */}
          <div className="flex flex-col items-center gap-4 lg:sticky lg:top-4">
            <StoreCanvas
              pet={pet}
              speechBubble={store.speechBubble}
              shopkeeperName={seller.discordName}
              accentColor={store.accentColor}
              themeId={theme.id as StoreThemeId}
              animationId={animation.id as StoreAnimationId}
              width={320}
              animated
            />
            {isOwner && (
              <Link href="/pet/marketplace/store/customize">
                <a className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-gold,#f0c040)] transition-colors inline-flex items-center gap-1">
                  <Settings size={10} /> Tap to customize this view
                </a>
              </Link>
            )}
          </div>

          {/* Listings column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="font-pixel text-base text-[var(--pet-text,#e2e8f0)]">
                On sale
              </h2>
              {isOwner && (
                <Link href="/pet/marketplace/sell">
                  <a>
                    <PixelButton variant="primary" size="sm">
                      + List a new item
                    </PixelButton>
                  </a>
                </Link>
              )}
            </div>

            {listings.length === 0 ? (
              <PixelCard className="p-10 text-center" corners>
                <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                  {isOwner
                    ? "Your shop is empty -- list an item to start selling!"
                    : `${seller.discordName} hasn't listed anything yet. Check back soon!`}
                </p>
                {isOwner && (
                  <Link href="/pet/marketplace/sell">
                    <a className="inline-block mt-4">
                      <PixelButton variant="primary" size="sm">
                        + List your first item
                      </PixelButton>
                    </a>
                  </Link>
                )}
              </PixelCard>
            ) : (
              <div className={cn(
                "grid gap-3",
                "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
              )}>
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
    </PetShell>
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
