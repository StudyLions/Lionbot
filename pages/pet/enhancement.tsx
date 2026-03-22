// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement page - pixel art RPG style
// ============================================================
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: MapleStory-style scroll system -- show bonus_value per scroll,
//          scroll trace per equipment slot, glow tier badges
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Import calcLevelPenalty for new diminishing-returns formula
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier, calcLevelPenalty } from "@/utils/gameConstants"
// --- END AI-MODIFIED ---
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface EnhancementSlot {
  slotNumber: number
  scrollName: string
  bonusValue: number
}

interface EquipmentItem {
  inventoryId: number
  enhancementLevel: number
  maxLevel: number
  totalBonus: number
  glowTier: GlowTier
  glowIntensity: number
  item: { id: number; name: string; rarity: string; slot: string | null; category: string; assetPath: string }
  slots: EnhancementSlot[]
}

interface ScrollItem {
  inventoryId: number
  quantity: number
  item: { id: number; name: string; rarity: string; assetPath: string }
  properties: { successRate: number; destroyRate: number; targetSlot: string | null; bonusValue: number } | null
}

interface EnhancementData {
  equipment: EquipmentItem[]
  scrolls: ScrollItem[]
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const GLOW_BORDER: Record<GlowTier, string> = {
  none: "#3a4a6c",
  bronze: "#cd7f32",
  silver: "#c0d2f0",
  gold: "#ffd700",
  diamond: "#64c8ff",
  celestial: "#c864ff",
}

// --- AI-REPLACED (2026-03-22) ---
// Reason: Old constant replaced with calcLevelPenalty() helper
// --- Original code (commented out for rollback) ---
// const LEVEL_PENALTY_FACTOR = GAME_CONSTANTS.LEVEL_PENALTY_FACTOR
// --- End original code ---
// --- END AI-REPLACED ---

export default function EnhancementPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<EnhancementData>(
    session ? "/api/pet/enhancement" : null
  )

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Pre-select scroll from query param when navigating from inventory
  const router = useRouter()
  const [selectedEquip, setSelectedEquip] = useState<number | null>(null)
  const [selectedScroll, setSelectedScroll] = useState<number | null>(null)
  const [enhancing, setEnhancing] = useState(false)

  useEffect(() => {
    if (router.query.scroll && data) {
      const scrollId = Number(router.query.scroll)
      if (data.scrolls.some((s) => s.inventoryId === scrollId)) {
        setSelectedScroll(scrollId)
      }
    }
  }, [router.query.scroll, data])
  // --- END AI-MODIFIED ---
  const [result, setResult] = useState<{
    outcome: "success" | "failed" | "destroyed"; itemName: string
    newLevel?: number; currentLevel?: number
    bonusGained?: number; goldGained?: number; dropGained?: number; glowTier?: GlowTier; scrollName?: string
  } | null>(null)

  const equip = data?.equipment.find((e) => e.inventoryId === selectedEquip)
  const scroll = data?.scrolls.find((s) => s.inventoryId === selectedScroll)

  // --- AI-REPLACED (2026-03-22) ---
  // Reason: Old linear penalty replaced with diminishing-returns curve
  // --- Original code (commented out for rollback) ---
  // let effectiveSuccess = 0
  // let effectiveDestroy = 0
  // if (equip && scroll?.properties) {
  //   const penalty = Math.max(0.1, 1 - LEVEL_PENALTY_FACTOR * equip.enhancementLevel)
  //   effectiveSuccess = Math.round(scroll.properties.successRate * penalty * 100)
  //   effectiveDestroy = Math.round(scroll.properties.destroyRate * 100)
  // }
  // --- End original code ---
  let effectiveSuccess = 0
  let effectiveDestroy = 0
  if (equip && scroll?.properties) {
    effectiveSuccess = Math.round(scroll.properties.successRate * calcLevelPenalty(equip.enhancementLevel) * 100)
    effectiveDestroy = Math.round(scroll.properties.destroyRate * 100)
  }
  // --- END AI-REPLACED ---

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
      <AdminGuard variant="pet">
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
                  Use scrolls to upgrade equipment. Riskier scrolls give bigger bonuses!
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
                    <div className="flex-1">
                      <span className="font-pixel text-sm text-[var(--pet-green,#40d870)] block">
                        {result.itemName} enhanced to +{result.newLevel}!
                      </span>
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim)]">
                        {result.scrollName} added +{result.goldGained}% Gold/XP, +{result.dropGained}% Drop Rate
                        {result.glowTier && result.glowTier !== "none" && (
                          <span className={cn("ml-1", GLOW_TEXT_COLORS[result.glowTier as GlowTier])}>
                            [{GLOW_LABELS[result.glowTier as GlowTier]} Glow]
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {result.outcome === "failed" && (
                    <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                      Enhancement failed. {result.itemName} is unchanged at +{result.currentLevel}.
                    </span>
                  )}
                  {result.outcome === "destroyed" && (
                    <span className="font-pixel text-sm text-[var(--pet-red,#e04040)]">
                      {result.itemName} was destroyed!
                    </span>
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
                      <div className="p-2 space-y-1 max-h-72 overflow-y-auto scrollbar-hide">
                        {data.equipment.map((e) => {
                          const bc = e.glowTier !== "none" ? GLOW_BORDER[e.glowTier as GlowTier] : RARITY_BORDER[e.item.rarity] || "#3a4a6c"
                          const imgUrl = getItemImageUrl(e.item.assetPath, e.item.category)
                          const isSelected = selectedEquip === e.inventoryId
                          const totalGold = (e.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
                          return (
                            <ItemGlow key={e.inventoryId} rarity={e.item.rarity} glowTier={e.glowTier as GlowTier} glowIntensity={e.glowIntensity}>
                            <button
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
                                <div className="flex items-center gap-1.5">
                                  <PixelBadge rarity={e.item.rarity} />
                                  {e.glowTier !== "none" && (
                                    <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[e.glowTier as GlowTier])}>
                                      {GLOW_LABELS[e.glowTier as GlowTier]}
                                    </span>
                                  )}
                                  {totalGold > 0 && (
                                    <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
                                      +{totalGold.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-pixel text-[12px] text-[var(--pet-text-dim)] flex-shrink-0">
                                {e.enhancementLevel}/{e.maxLevel}
                              </span>
                            </button>
                            </ItemGlow>
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
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim)] py-6 text-center">No scrolls owned. Keep studying to earn scroll drops!</p>
                    ) : (
                      <div className="p-2 space-y-1 max-h-72 overflow-y-auto scrollbar-hide">
                        {data.scrolls.map((s) => {
                          const isSelected = selectedScroll === s.inventoryId
                          const bc = RARITY_BORDER[s.item.rarity] || "#3a4a6c"
                          const bv = s.properties?.bonusValue ?? 1
                          const goldPer = (bv * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
                          const dropPer = (bv * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100)
                          const imgUrl = getItemImageUrl(s.item.assetPath, "SCROLL")
                          return (
                            <ItemGlow key={s.inventoryId} rarity={s.item.rarity}>
                            <button
                              onClick={() => setSelectedScroll(s.inventoryId)}
                              className={cn(
                                "w-full text-left px-2.5 py-2 border-2 flex items-center gap-2 transition-all",
                                isSelected ? "bg-[#4080f0]/6" : "bg-[#0a0e1a] hover:bg-[#101828]"
                              )}
                              style={{ borderColor: isSelected ? bc : "#1a2a3c" }}
                            >
                              <div className="w-8 h-8 border border-[#1a2a3c] bg-[#080c18] flex items-center justify-center flex-shrink-0">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-6 h-6 object-contain" style={{ imageRendering: "pixelated" }} />
                                ) : (
                                  <span className="text-lg">{"\u{1F4DC}"}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate">{s.item.name}</span>
                                  <PixelBadge rarity={s.item.rarity} />
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-pixel text-[10px] text-green-400">
                                    {s.properties ? `${(s.properties.successRate * 100).toFixed(0)}% OK` : "?"}
                                  </span>
                                  {s.properties && s.properties.destroyRate > 0 && (
                                    <span className="font-pixel text-[10px] text-red-400">
                                      {(s.properties.destroyRate * 100).toFixed(0)}% Destroy
                                    </span>
                                  )}
                                  <span className="font-pixel text-[10px] text-[var(--pet-gold)]">
                                    +{goldPer.toFixed(1)}% G/XP
                                  </span>
                                </div>
                              </div>
                              <span className="font-pixel text-[13px] text-[var(--pet-text-dim)]">x{s.quantity}</span>
                            </button>
                            </ItemGlow>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhancement preview + scroll trace */}
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
                        {scroll.properties && (
                          <p className="font-pixel text-[11px] text-[var(--pet-gold)]">
                            +{(scroll.properties.bonusValue * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}% Gold/XP,
                            {" "}+{(scroll.properties.bonusValue * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(2)}% Drop Rate
                          </p>
                        )}
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

              {/* Scroll Trace for selected equipment */}
              {equip && equip.slots.length > 0 && (
                <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020]" style={{ boxShadow: "3px 3px 0 #060810" }}>
                  <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center justify-between">
                    <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">SCROLL TRACE</span>
                    {equip.glowTier !== "none" && (
                      <span className={cn("font-pixel text-[11px]", GLOW_TEXT_COLORS[equip.glowTier as GlowTier])}>
                        {GLOW_LABELS[equip.glowTier as GlowTier]} Glow
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {Array.from({ length: equip.maxLevel }, (_, i) => i + 1).map((slotNum) => {
                      const slot = equip.slots.find((s) => s.slotNumber === slotNum)
                      if (slot) {
                        const goldPct = (slot.bonusValue * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)
                        return (
                          <div key={slotNum} className="flex items-center gap-2 px-2 py-1 bg-[#0a0e1a] border border-[#1a2a3c]">
                            <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] w-6">+{slotNum}</span>
                            <span className="font-pixel text-[11px] text-[var(--pet-text)] flex-1">{slot.scrollName}</span>
                            <span className="font-pixel text-[10px] text-[var(--pet-gold)]">+{goldPct}%</span>
                          </div>
                        )
                      }
                      return (
                        <div key={slotNum} className="flex items-center gap-2 px-2 py-1 bg-[#080c18] border border-[#141c2c] opacity-40">
                          <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] w-6">+{slotNum}</span>
                          <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] flex-1 italic">empty</span>
                        </div>
                      )
                    })}
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-[#1a2a3c] mt-1">
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim)]">Total</span>
                      <span className="font-pixel text-[12px] text-[var(--pet-gold)]">
                        +{(equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}% Gold/XP,
                        {" "}+{(equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(1)}% Drop
                      </span>
                    </div>
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
// --- END AI-MODIFIED ---
