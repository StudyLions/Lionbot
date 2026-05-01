// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 2 -- owner-only store customizer
//          page.
//
// 2026-04-30 (rev 2): full-bleed studio. Page is now a thin shell --
// it fetches the seller's store config + their own pet visual data
// and hands EVERYTHING to <StoreCustomizer>, which renders the entire
// full-bleed studio (FullBleedShell, top nav, sidebar preview,
// tabbed controls, save bar). The previous version wrapped the
// studio in PetShell, which kept the Pet sidebar visible and capped
// the content at ~1024px -- it never felt like editing the actual
// store.
// ============================================================
import { useSession } from "next-auth/react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useDashboard } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import PixelCard from "@/components/pet/ui/PixelCard"
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
  const myDiscordId = (session as any)?.discordId ?? null

  const { data: meData, isLoading: meLoading, error: meError, mutate } = useDashboard<MeApiResponse>(
    session ? "/api/pet/marketplace/store/me" : null,
  )

  // The public store endpoint returns pet visual data + the seller's display
  // name in the exact shape the customizer's preview wants. We don't block
  // the studio render on this (the customizer handles `pet=null` gracefully).
  const { data: previewData } = useDashboard<OwnStorePreview>(
    myDiscordId ? `/api/pet/marketplace/store/${myDiscordId}` : null,
  )

  if (meError) {
    const isAuthError = (meError as any)?.status === 401
    return (
      <FullBleedFallback>
        <PixelCard className="p-8 text-center max-w-lg mx-auto" corners>
          <p className="font-pixel text-sm text-[var(--pet-red,#e04040)] mb-3">
            {isAuthError ? "Sign in to customize your store." : (meError as Error).message}
          </p>
          <Link href="/pet/marketplace">
            <a className="font-pixel inline-flex items-center gap-1.5 text-[12px] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)] no-underline">
              <ChevronLeft size={12} /> Back to Marketplace
            </a>
          </Link>
        </PixelCard>
      </FullBleedFallback>
    )
  }

  if (meLoading || !meData) {
    return (
      <FullBleedFallback>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
            <Skeleton className="h-[420px] w-full" />
            <Skeleton className="h-[480px] w-full" />
          </div>
        </div>
      </FullBleedFallback>
    )
  }

  return (
    <StoreCustomizer
      initial={meData}
      pet={previewData?.pet ?? null}
      shopkeeperName={previewData?.seller.discordName ?? "You"}
      myDiscordId={myDiscordId}
      onSaved={() => mutate()}
    />
  )
}

/**
 * Minimal fallback shell used by the loading + error states. The real studio
 * (StoreCustomizer) renders its own full-bleed shell painted with the
 * seller's chosen theme. This shell just paints the default pet section
 * background so the screen isn't a transparent void during data fetch.
 */
function FullBleedFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="pet-section pet-scanline min-h-[calc(100vh-80px)] py-6">
      {children}
    </div>
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
