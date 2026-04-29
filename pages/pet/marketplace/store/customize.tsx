// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 2 -- owner-only store customizer
//          page. Loads the seller's current store config + their
//          own pet visual data (so the live preview can render the
//          actual lion they'll show as shopkeeper), then hands
//          everything off to the StoreCustomizer split-pane studio.
//
//          Phase 1 sketched the same controls inline; Phase 2
//          replaces them with the full studio that includes theme,
//          animation, and accent color pickers.
// ============================================================
import Link from "next/link"
import { useSession } from "next-auth/react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { ChevronLeft, Eye, Heart } from "lucide-react"

import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useDashboard } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import PixelCard from "@/components/pet/ui/PixelCard"
import StoreCustomizer, { type MeApiResponse } from "@/components/pet/store/StoreCustomizer"
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: cn for the inline button-styled anchors below.
import { cn } from "@/lib/utils"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 polish -- the previous version wrapped a
// PixelButton inside <Link><a>...</a></Link>, producing <a><button>
// HTML which the button swallowed in some browsers, so the click never
// navigated. Use a flat styled anchor instead -- behaves identically
// to PixelButton visually but is a real link.
function PixelLinkButton({
  href, variant = "ghost", className, children,
}: {
  href: string
  variant?: "primary" | "ghost"
  className?: string
  children: React.ReactNode
}) {
  const variants = {
    primary: "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8] hover:bg-[#338844]",
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
// --- END AI-MODIFIED ---

interface OwnStorePreview {
  seller: { discordId: string; discordName: string }
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

function CustomizeInner() {
  const { data: session } = useSession()
  const myDiscordId = session?.user ? (session as any).user?.id : null

  const { data: meData, isLoading: meLoading, error: meError, mutate } = useDashboard<MeApiResponse>(
    session ? "/api/pet/marketplace/store/me" : null,
  )

  // We re-use the public store endpoint for our own ID -- it already returns
  // pet visual data + the seller's display name in exactly the shape the
  // customizer's preview wants.
  const { data: previewData, isLoading: previewLoading } = useDashboard<OwnStorePreview>(
    myDiscordId ? `/api/pet/marketplace/store/${myDiscordId}` : null,
  )

  const previewHref = myDiscordId
    ? `/pet/marketplace/store/${myDiscordId}`
    : "/pet/marketplace"

  if (meError) {
    const isAuthError = (meError as any)?.status === 401
    return (
      <PetShell wide>
        <PixelCard className="p-8 text-center" corners>
          <p className="font-pixel text-sm text-[var(--pet-red,#e04040)] mb-3">
            {isAuthError ? "Sign in to customize your store." : (meError as Error).message}
          </p>
          <PixelLinkButton href="/pet/marketplace">
            <ChevronLeft size={12} /> Back to Marketplace
          </PixelLinkButton>
        </PixelCard>
      </PetShell>
    )
  }

  if (meLoading || !meData || previewLoading) {
    return (
      <PetShell wide>
        <Skeleton className="h-12 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </PetShell>
    )
  }

  const isPremium = meData.gating.tier !== "FREE"

  return (
    <PetShell wide>
      <div className="space-y-5">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/pet/marketplace">
            <a className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] inline-flex items-center gap-1.5 transition-colors">
              <ChevronLeft size={14} /> Back to Marketplace
            </a>
          </Link>
          <PixelLinkButton href={previewHref} variant="ghost">
            <Eye size={12} /> View live store
          </PixelLinkButton>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">
            Customize your store
          </h1>
          <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] mt-1.5">
            Your current tier: <span className="text-[var(--pet-gold,#f0c040)]">{meData.gating.tierLabel}</span>
            {!isPremium && (
              <>
                {" "}&middot;{" "}
                <Link href="/donate">
                  <a className="text-[var(--pet-gold,#f0c040)] hover:underline">
                    upgrade for more options
                  </a>
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Free-tier guidance card */}
        {!isPremium && (
          <PixelCard className="p-4 flex items-start gap-3" corners borderColor="#f0c040">
            <Heart size={16} className="text-[var(--pet-gold,#f0c040)] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">
                Try anything below for free.
              </p>
              <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mt-1 leading-relaxed">
                Hitting Save on a premium feature opens an upgrade window -- we use the funds
                to make new items, animations, and themes for the bot. Free users can still
                edit the speech bubble (up to {meData.defaults.speechBubbleMaxLengthFree} characters).
              </p>
            </div>
          </PixelCard>
        )}

        <StoreCustomizer
          initial={meData}
          pet={previewData?.pet ?? null}
          shopkeeperName={previewData?.seller.discordName ?? "You"}
          onSaved={() => mutate()}
        />
      </div>
    </PetShell>
  )
}

export default function CustomizePage() {
  return (
    <Layout SEO={{ title: "Customize your store - LionGotchi", description: "Customize your personal LionGotchi store front." }}>
      <AdminGuard variant="pet">
        <CustomizeInner />
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
