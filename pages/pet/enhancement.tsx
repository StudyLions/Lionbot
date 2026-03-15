// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement page - enhance equipment with scrolls
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Sparkles, Shield, ScrollText, AlertTriangle, Check, Skull, Loader2, ArrowRight,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface EquipmentItem {
  inventoryId: number
  enhancementLevel: number
  maxLevel: number
  item: { id: number; name: string; rarity: string; slot: string | null; category: string; assetPath: string }
}

interface ScrollItem {
  inventoryId: number
  quantity: number
  item: { id: number; name: string; rarity: string }
  properties: { successRate: number; destroyRate: number; targetSlot: string | null } | null
}

interface EnhancementData {
  equipment: EquipmentItem[]
  scrolls: ScrollItem[]
}

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
  MYTHICAL: "text-rose-400",
}

const LEVEL_PENALTY_FACTOR = 0.08

export default function EnhancementPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<EnhancementData>(
    session ? "/api/pet/enhancement" : null
  )

  const [selectedEquip, setSelectedEquip] = useState<number | null>(null)
  const [selectedScroll, setSelectedScroll] = useState<number | null>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [result, setResult] = useState<{
    outcome: "success" | "failed" | "destroyed"
    itemName: string
    newLevel?: number
    currentLevel?: number
  } | null>(null)

  const equip = data?.equipment.find((e) => e.inventoryId === selectedEquip)
  const scroll = data?.scrolls.find((s) => s.inventoryId === selectedScroll)

  let effectiveSuccess = 0
  let effectiveDestroy = 0
  if (equip && scroll?.properties) {
    const penalty = Math.max(0.1, 1 - LEVEL_PENALTY_FACTOR * equip.enhancementLevel)
    effectiveSuccess = Math.round(scroll.properties.successRate * penalty * 100)
    effectiveDestroy = Math.round(scroll.properties.destroyRate * 100)
  }

  async function handleEnhance() {
    if (!selectedEquip || !selectedScroll) return
    setEnhancing(true)
    setResult(null)
    try {
      const res = await fetch("/api/pet/enhancement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentInventoryId: selectedEquip,
          scrollInventoryId: selectedScroll,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setResult({ outcome: "failed", itemName: body.error || "Enhancement failed" })
      } else {
        setResult(body)
        if (body.outcome === "destroyed") {
          setSelectedEquip(null)
        }
      }
      mutate()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      invalidate("/api/pet/overview")
    } catch {
      setResult({ outcome: "failed", itemName: "Network error" })
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <Layout SEO={{ title: "Enhancement - LionGotchi", description: "Enhance your equipment" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={24} className="text-amber-400" />
                  Enhancement
                </h1>
                <p className="text-sm text-muted-foreground">
                  Use scrolls to upgrade equipment for Gold & XP bonuses
                </p>
              </div>

              {result && (
                <div className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2",
                  result.outcome === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : result.outcome === "destroyed"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                )}>
                  {result.outcome === "success" && <><Check size={16} /> {result.itemName} enhanced to +{result.newLevel}!</>}
                  {result.outcome === "failed" && <><AlertTriangle size={16} /> Enhancement failed. {result.itemName} is unchanged at +{result.currentLevel}.</>}
                  {result.outcome === "destroyed" && <><Skull size={16} /> {result.itemName} was destroyed!</>}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 rounded-lg" />
                  <Skeleton className="h-40 rounded-lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{(error as Error).message}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Equipment picker */}
                  <Card className="border-border">
                    <CardContent className="pt-5 pb-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Shield size={16} className="text-purple-400" />
                        Select Equipment
                      </p>
                      {!data?.equipment.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No equipment owned</p>
                      ) : (
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                          {data.equipment.map((e) => {
                            const imgUrl = getItemImageUrl(e.item.assetPath, e.item.category)
                            return (
                            <button
                              key={e.inventoryId}
                              onClick={() => setSelectedEquip(e.inventoryId)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                                selectedEquip === e.inventoryId
                                  ? "bg-primary/15 border border-primary/30"
                                  : "bg-muted/20 hover:bg-muted/40 border border-transparent"
                              )}
                            >
                              {imgUrl ? (
                                <div className="w-7 h-7 rounded bg-muted/20 flex-shrink-0 overflow-hidden">
                                  <img src={imgUrl} alt={e.item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded bg-muted/30 flex-shrink-0 flex items-center justify-center text-xs">
                                  {getCategoryPlaceholder(e.item.category)}
                                </div>
                              )}
                              <span className={cn("font-medium flex-1", rarityColor[e.item.rarity])}>
                                {e.item.name}
                                {e.enhancementLevel > 0 && <span className="text-amber-400 ml-1">+{e.enhancementLevel}</span>}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {e.enhancementLevel}/{e.maxLevel}
                              </span>
                            </button>
                          )})}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Scroll picker */}
                  <Card className="border-border">
                    <CardContent className="pt-5 pb-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ScrollText size={16} className="text-indigo-400" />
                        Select Scroll
                      </p>
                      {!data?.scrolls.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No scrolls owned. Craft some first!</p>
                      ) : (
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                          {data.scrolls.map((s) => (
                            <button
                              key={s.inventoryId}
                              onClick={() => setSelectedScroll(s.inventoryId)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                                selectedScroll === s.inventoryId
                                  ? "bg-primary/15 border border-primary/30"
                                  : "bg-muted/20 hover:bg-muted/40 border border-transparent"
                              )}
                            >
                              <span className={cn("font-medium", rarityColor[s.item.rarity])}>
                                {s.item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">x{s.quantity}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhancement preview */}
              {equip && scroll && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-center flex-1">
                        <p className={cn("font-semibold", rarityColor[equip.item.rarity])}>
                          {equip.item.name} +{equip.enhancementLevel}
                        </p>
                        <p className="text-xs text-muted-foreground">{equip.item.slot}</p>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ArrowRight size={16} />
                        <ScrollText size={16} className="text-indigo-400" />
                      </div>
                      <div className="text-center flex-1">
                        <p className={cn("font-semibold", rarityColor[scroll.item.rarity])}>
                          {scroll.item.name}
                        </p>
                        <div className="flex items-center justify-center gap-3 text-xs mt-1">
                          <span className="text-emerald-400">{effectiveSuccess}% success</span>
                          <span className="text-red-400">{effectiveDestroy}% destroy</span>
                        </div>
                      </div>
                      <button
                        onClick={handleEnhance}
                        disabled={enhancing || equip.enhancementLevel >= equip.maxLevel}
                        className={cn(
                          "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                          equip.enhancementLevel >= equip.maxLevel
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-400 text-black"
                        )}
                      >
                        {enhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Enhance
                      </button>
                    </div>
                  </CardContent>
                </Card>
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
