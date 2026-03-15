// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet inventory page - filterable item list with tabs
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Package, Swords, Leaf, ScrollText, Shield, Sparkles,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
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
    id: number
    name: string
    category: string
    slot: string | null
    rarity: string
    description: string
    assetPath: string
  }
}

interface InventoryData {
  items: InventoryItem[]
  counts: { equipment: number; materials: number; scrolls: number }
}

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400 border-gray-500/30",
  UNCOMMON: "text-green-400 border-green-500/30",
  RARE: "text-blue-400 border-blue-500/30",
  EPIC: "text-purple-400 border-purple-500/30",
  LEGENDARY: "text-amber-400 border-amber-500/30",
  MYTHICAL: "text-rose-400 border-rose-500/30",
}

const rarityBg: Record<string, string> = {
  COMMON: "bg-gray-500/5",
  UNCOMMON: "bg-green-500/5",
  RARE: "bg-blue-500/5",
  EPIC: "bg-purple-500/5",
  LEGENDARY: "bg-amber-500/5",
  MYTHICAL: "bg-rose-500/5",
}

type FilterTab = "equipment" | "materials" | "scrolls"

const tabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: "equipment", label: "Equipment", icon: <Swords size={14} /> },
  { key: "materials", label: "Materials", icon: <Leaf size={14} /> },
  { key: "scrolls", label: "Scrolls", icon: <ScrollText size={14} /> },
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
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package size={24} className="text-emerald-400" />
                  Inventory
                </h1>
                <p className="text-sm text-muted-foreground">
                  All your items, materials, and scrolls
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      filter === tab.key
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    {data?.counts && (
                      <span className="text-xs opacity-60">
                        ({data.counts[tab.key]})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Items */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : !data?.items.length ? (
                <div className="text-center py-16">
                  <div className="p-3 rounded-xl bg-muted/30 inline-block mb-3">
                    <Package size={32} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground">
                    No {filter} found. Earn items from Discord activity!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.items.map((inv) => {
                    const rColors = rarityColor[inv.item.rarity] ?? "text-gray-400 border-gray-500/30"
                    const rBg = rarityBg[inv.item.rarity] ?? "bg-gray-500/5"
                    const [textColor] = rColors.split(" ")
                    return (
                      <div
                        key={inv.inventoryId}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
                          rColors.split(" ").slice(1).join(" "),
                          rBg
                        )}
                      >
                        {(() => {
                          const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
                          return imgUrl ? (
                            <div className="w-10 h-10 rounded-md bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <img
                                src={imgUrl}
                                alt={inv.item.name}
                                className="w-full h-full object-contain"
                                style={{ imageRendering: "pixelated" }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0 text-lg">
                              {getCategoryPlaceholder(inv.item.category)}
                            </div>
                          )
                        })()}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium truncate", textColor)}>
                              {inv.item.name}
                              {inv.enhancementLevel > 0 && (
                                <span className="text-amber-400 ml-1">+{inv.enhancementLevel}</span>
                              )}
                            </p>
                            {inv.equipped && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-medium flex-shrink-0">
                                Equipped
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className={cn("font-medium", textColor)}>{inv.item.rarity}</span>
                            {inv.item.slot && <span>&middot; {inv.item.slot}</span>}
                            {inv.item.description && (
                              <span className="truncate">&middot; {inv.item.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {inv.quantity > 1 && (
                            <p className="text-sm font-bold text-foreground">x{inv.quantity}</p>
                          )}
                        </div>
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
