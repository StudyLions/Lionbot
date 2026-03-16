// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory page - pixel art RPG style
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface InventoryItem {
  inventoryId: number
  quantity: number
  enhancementLevel: number
  source: string
  acquiredAt: string
  equipped: boolean
  item: {
    id: number; name: string; category: string; slot: string | null
    rarity: string; description: string; assetPath: string
  }
}

interface InventoryData {
  items: InventoryItem[]
  counts: { equipment: number; materials: number; scrolls: number }
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

type FilterTab = "equipment" | "materials" | "scrolls"

const tabs: { key: FilterTab; label: string }[] = [
  { key: "equipment", label: "Equipment" },
  { key: "materials", label: "Materials" },
  { key: "scrolls", label: "Scrolls" },
]

export default function InventoryPage() {
  const { data: session } = useSession()
  const [filter, setFilter] = useState<FilterTab>("equipment")
  const { data, error, isLoading } = useDashboard<InventoryData>(
    session ? `/api/pet/inventory?filter=${filter}` : null
  )

  return (
    <Layout SEO={{ title: "Inventory - LionGotchi", description: "Your pet inventory" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Inventory</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  All your items, materials, and scrolls
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <PixelButton
                    key={tab.key}
                    variant={filter === tab.key ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(tab.key)}
                  >
                    {tab.label}
                    {data?.counts && (
                      <span className="opacity-60 ml-1">({data.counts[tab.key]})</span>
                    )}
                  </PixelButton>
                ))}
              </div>

              {/* Items */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.items.length ? (
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">
                    No {filter} found. Earn items from Discord activity!
                  </p>
                </PixelCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.items.map((inv) => {
                    const bc = RARITY_BORDER[inv.item.rarity] || "#3a4a6c"
                    const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
                    return (
                      <div
                        key={inv.inventoryId}
                        className="flex items-center gap-3 px-3 py-2.5 border-2 bg-[#0c1020]"
                        style={{ borderColor: `${bc}60`, boxShadow: "2px 2px 0 #060810" }}
                      >
                        <div className="w-12 h-12 border border-[#1a2a3c] bg-[#080c18] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {imgUrl ? (
                            <CroppedItemImage src={imgUrl} alt={inv.item.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xl">{getCategoryPlaceholder(inv.item.category)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] truncate">
                              {inv.item.name}
                            </span>
                            {inv.enhancementLevel > 0 && (
                              <span className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)]">+{inv.enhancementLevel}</span>
                            )}
                            {inv.equipped && (
                              <span className="font-pixel text-sm px-1.5 py-0.5 border border-[var(--pet-green,#40d870)] text-[var(--pet-green,#40d870)] bg-[#1a3020]">
                                EQP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <PixelBadge rarity={inv.item.rarity} />
                            {inv.item.slot && (
                              <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">{inv.item.slot}</span>
                            )}
                          </div>
                        </div>
                        {inv.quantity > 1 && (
                          <span className="font-pixel text-base text-[var(--pet-text,#e2e8f0)] flex-shrink-0">x{inv.quantity}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
