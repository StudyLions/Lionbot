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
import PixelButton from "@/components/pet/ui/PixelButton"
import StoreCustomizer, { type MeApiResponse } from "@/components/pet/store/StoreCustomizer"

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
          <Link href="/pet/marketplace">
            <PixelButton variant="ghost" size="sm">Back to Marketplace</PixelButton>
          </Link>
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
          <Link href={previewHref}>
            <a>
              <PixelButton variant="ghost" size="sm">
                <Eye size={12} className="mr-1" /> View live store
              </PixelButton>
            </a>
          </Link>
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
