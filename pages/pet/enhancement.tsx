// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement page - pixel art RPG style
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder, getUiIconUrl, getFarmAnimationUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
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

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
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
    outcome: "success" | "failed" | "destroyed"; itemName: string
    newLevel?: number; currentLevel?: number
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentInventoryId: selectedEquip, scrollInventoryId: selectedScroll }),
      })
      const body = await res.json()
      if (!res.ok) {
        setResult({ outcome: "failed", itemName: body.error || "Enhancement failed" })
      } else {
        setResult(body)
        if (body.outcome === "destroyed") setSelectedEquip(null)
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
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Enhancement</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Use scrolls to upgrade equipment for Gold & XP bonuses
                </p>
              </div>

              {/* Result toast */}
              {result && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 border-2"
                  style={{
                    borderColor: result.outcome === "success" ? "var(--pet-green)" : result.outcome === "destroyed" ? "var(--pet-red)" : "var(--pet-gold)",
                    backgroundColor: result.outcome === "success" ? "rgba(40,100,60,0.15)" : result.outcome === "destroyed" ? "rgba(100,40,40,0.15)" : "rgba(100,80,20,0.15)",
                    boxShadow: "2px 2px 0 #060810",
                  }}
                >
                  {result.outcome === "success" && (
                    <>
                      <img src={getUiIconUrl("trophy")} alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} />
                      <span className="font-pixel text-sm text-[var(--pet-green,#40d870)]">
                        {result.itemName} enhanced to +{result.newLevel}!
                      </span>
                    </>
                  )}
                  {result.outcome === "failed" && (
                    <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                      Enhancement failed. {result.itemName} is unchanged at +{result.currentLevel}.
                    </span>
                  )}
                  {result.outcome === "destroyed" && (
                    <>
                      <img src={getFarmAnimationUrl("skull", 1)} alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} />
                      <span className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                        {result.itemName} was destroyed!
                      </span>
                    </>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Equipment picker */}
                  <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020]" style={{ boxShadow: "3px 3px 0 #060810" }}>
                    <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c]">
                      <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">SELECT EQUIPMENT</span>
                    </div>
                    {!data?.equipment.length ? (
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim)] py-6 text-center">No equipment owned</p>
                    ) : (
                      <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                        {data.equipment.map((e) => {
                          const bc = RARITY_BORDER[e.item.rarity] || "#3a4a6c"
                          const imgUrl = getItemImageUrl(e.item.assetPath, e.item.category)
                          const isSelected = selectedEquip === e.inventoryId
                          return (
                            <button
                              key={e.inventoryId}
                              onClick={() => setSelectedEquip(e.inventoryId)}
                              className={cn(
                                "w-full text-left px-2.5 py-2 border-2 flex items-center gap-2 transition-all",
                                isSelected ? "bg-[#f0c040]/6" : "bg-[#0a0e1a] hover:bg-[#101828]"
                              )}
                              style={{ borderColor: isSelected ? bc : "#1a2a3c" }}
                            >
                              <div className="w-8 h-8 border border-[#1a2a3c] bg-[#080c18] flex items-center justify-center flex-shrink-0">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-6 h-6 object-contain" style={{ imageRendering: "pixelated" }} />
                                ) : (
                                  <span className="text-xs">{getCategoryPlaceholder(e.item.category)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate block">
                                  {e.item.name}
                                  {e.enhancementLevel > 0 && <span className="text-[var(--pet-gold)] ml-1">+{e.enhancementLevel}</span>}
                                </span>
                                <PixelBadge rarity={e.item.rarity} />
                              </div>
                              <span className="font-pixel text-[12px] text-[var(--pet-text-dim)] flex-shrink-0">
                                {e.enhancementLevel}/{e.maxLevel}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Scroll picker */}
                  <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020]" style={{ boxShadow: "3px 3px 0 #060810" }}>
                    <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c]">
                      <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">SELECT SCROLL</span>
                    </div>
                    {!data?.scrolls.length ? (
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim)] py-6 text-center">No scrolls owned. Craft some first!</p>
                    ) : (
                      <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                        {data.scrolls.map((s) => {
                          const isSelected = selectedScroll === s.inventoryId
                          const bc = RARITY_BORDER[s.item.rarity] || "#3a4a6c"
                          return (
                            <button
                              key={s.inventoryId}
                              onClick={() => setSelectedScroll(s.inventoryId)}
                              className={cn(
                                "w-full text-left px-2.5 py-2 border-2 flex items-center justify-between transition-all",
                                isSelected ? "bg-[#4080f0]/6" : "bg-[#0a0e1a] hover:bg-[#101828]"
                              )}
                              style={{ borderColor: isSelected ? bc : "#1a2a3c" }}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)]">{s.item.name}</span>
                                <PixelBadge rarity={s.item.rarity} />
                              </div>
                              <span className="font-pixel text-[13px] text-[var(--pet-text-dim)]">x{s.quantity}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhancement preview */}
              {equip && scroll && (
                <div
                  className="border-[3px] border-[var(--pet-gold,#f0c040)] p-[3px]"
                  style={{ boxShadow: "3px 3px 0 #060810, 0 0 12px rgba(240,192,64,0.1)" }}
                >
                  <div className="border-2 border-[var(--pet-gold)]/30 bg-[#0c1020] p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-center flex-1">
                        <span className="font-pixel text-base text-[var(--pet-text,#e2e8f0)]">
                          {equip.item.name} +{equip.enhancementLevel}
                        </span>
                        <PixelBadge rarity={equip.item.rarity} />
                      </div>
                      <div className="font-pixel text-xl text-[var(--pet-text-dim)] px-2">+</div>
                      <div className="text-center flex-1 space-y-2">
                        <span className="font-pixel text-base text-[var(--pet-text,#e2e8f0)]">{scroll.item.name}</span>
                        <div className="space-y-1">
                          <PixelBar value={effectiveSuccess} max={100} label="Success" color="green" segments={10} />
                          <PixelBar value={effectiveDestroy} max={100} label="Destroy" color="red" segments={10} />
                        </div>
                      </div>
                      <PixelButton
                        variant="gold"
                        size="lg"
                        onClick={handleEnhance}
                        disabled={enhancing || equip.enhancementLevel >= equip.maxLevel}
                        loading={enhancing}
                      >
                        Enhance
                      </PixelButton>
                    </div>
                    {equip.enhancementLevel >= equip.maxLevel && (
                      <p className="font-pixel text-[13px] text-[var(--pet-gold)] text-center mt-2">MAX LEVEL REACHED</p>
                    )}
                  </div>
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
