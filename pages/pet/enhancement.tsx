// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet enhancement page - pixel art RPG style
// ============================================================
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Full MapleStory-inspired overhaul -- cinematic anvil forge
//          ceremony, step wizard mobile, filters, batch mode, achievements
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier, calcLevelPenalty } from "@/utils/gameConstants"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import EnhancementCeremony, { type CeremonyOutcome } from "@/components/pet/enhancement/EnhancementCeremony"
import { EnhancementToastStack, useToastStack } from "@/components/pet/enhancement/EnhancementToast"
import { EquipmentFilter, useEquipmentFilter, applyEquipmentFilter } from "@/components/pet/enhancement/EquipmentFilter"
import { ScrollFilter, useScrollFilter, applyScrollFilter } from "@/components/pet/enhancement/ScrollFilter"
import ScrollTraceModal from "@/components/pet/enhancement/ScrollTraceModal"
import RiskIndicator from "@/components/pet/enhancement/RiskIndicator"
import ComparisonTooltip from "@/components/pet/enhancement/ComparisonTooltip"
import StepWizard, { type WizardStep } from "@/components/pet/enhancement/StepWizard"
import MobileActionBar from "@/components/pet/enhancement/MobileActionBar"
import { BatchEnhanceControls, useBatchEnhance } from "@/components/pet/enhancement/BatchEnhance"
import StreakBadge, { SessionStats } from "@/components/pet/enhancement/StreakBadge"
import AchievementBadges from "@/components/pet/enhancement/AchievementBadges"
import { useEnhancementStreak, getStreakMessage } from "@/hooks/useEnhancementStreak"

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

interface AchievementEntry { key: string; unlockedAt: string }

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const GLOW_BORDER: Record<GlowTier, string> = {
  none: "#3a4a6c", bronze: "#cd7f32", silver: "#c0d2f0",
  gold: "#ffd700", diamond: "#64c8ff", celestial: "#c864ff",
}

export default function EnhancementPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<EnhancementData>(
    session ? "/api/pet/enhancement" : null
  )
  const { data: achieveData, mutate: mutateAchievements } = useDashboard<{ achievements: AchievementEntry[] }>(
    session ? "/api/pet/enhancement/achievements" : null
  )

  const router = useRouter()
  const [selectedEquip, setSelectedEquip] = useState<number | null>(null)
  const [selectedScroll, setSelectedScroll] = useState<number | null>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [traceEquip, setTraceEquip] = useState<EquipmentItem | null>(null)
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([])

  const [ceremonyActive, setCeremonyActive] = useState(false)
  const [ceremonyResult, setCeremonyResult] = useState<{
    outcome: CeremonyOutcome; itemName: string
    newLevel?: number; currentLevel?: number
    bonusGained?: number; goldGained?: number; dropGained?: number
    glowTier?: GlowTier; scrollName?: string; newAchievements?: string[]
  } | null>(null)

  const { toasts, addToast, dismissToast } = useToastStack()
  const { filterState: equipFilter, setFilterState: setEquipFilter } = useEquipmentFilter()
  const { filterState: scrollFilter, setFilterState: setScrollFilter } = useScrollFilter()
  const { streak, recordOutcome, getMessage } = useEnhancementStreak()
  const {
    batchEnabled, setBatchEnabled, batchState,
    startBatch, recordBatchAttempt, stopBatch, resetBatch,
  } = useBatchEnhance()

  useEffect(() => {
    if (router.query.scroll && data) {
      const scrollId = Number(router.query.scroll)
      if (data.scrolls.some((s) => s.inventoryId === scrollId)) {
        setSelectedScroll(scrollId)
      }
    }
  }, [router.query.scroll, data])

  const equip = data?.equipment.find((e) => e.inventoryId === selectedEquip) ?? null
  const scroll = data?.scrolls.find((s) => s.inventoryId === selectedScroll) ?? null

  let effectiveSuccess = 0
  let effectiveDestroy = 0
  if (equip && scroll?.properties) {
    effectiveSuccess = Math.round(scroll.properties.successRate * calcLevelPenalty(equip.enhancementLevel) * 100)
    effectiveDestroy = Math.round(scroll.properties.destroyRate * 100)
  }

  const filteredEquipment = useMemo(() =>
    data?.equipment ? applyEquipmentFilter(data.equipment, equipFilter) : [],
  [data?.equipment, equipFilter])

  const filteredScrolls = useMemo(() =>
    data?.scrolls ? applyScrollFilter(data.scrolls, scrollFilter) : [],
  [data?.scrolls, scrollFilter])

  const unlockedAchievementKeys = useMemo(() =>
    achieveData?.achievements?.map(a => a.key) ?? [],
  [achieveData])

  const handleCeremonyComplete = useCallback(() => {
    setCeremonyActive(false)

    if (ceremonyResult) {
      recordOutcome(ceremonyResult.outcome as 'success' | 'failed' | 'destroyed')
      const streakMsg = getMessage(ceremonyResult.outcome as 'success' | 'failed' | 'destroyed')

      addToast({
        outcome: ceremonyResult.outcome,
        itemName: ceremonyResult.itemName,
        newLevel: ceremonyResult.newLevel,
        currentLevel: ceremonyResult.currentLevel,
        goldGained: ceremonyResult.goldGained,
        dropGained: ceremonyResult.dropGained,
        glowTier: ceremonyResult.glowTier,
        scrollName: ceremonyResult.scrollName,
        streakMessage: streakMsg,
      })

      if (ceremonyResult.newAchievements?.length) {
        setNewlyUnlockedAchievements(prev => [...prev, ...ceremonyResult.newAchievements!])
        mutateAchievements()
      }

      if (ceremonyResult.outcome === "destroyed") {
        setSelectedEquip(null)
        resetBatch()
      }

      mutate()
      invalidate("/api/pet/inventory?filter=equipment")
      invalidate("/api/pet/inventory?filter=scrolls")
      invalidate("/api/pet/overview")

      if (batchState.active && ceremonyResult.outcome === 'failed') {
        const scrollsLeft = scroll ? scroll.quantity - 1 : 0
        const shouldContinue = recordBatchAttempt('failed', scrollsLeft)
        if (shouldContinue) {
          setTimeout(() => doEnhance(), 300)
        }
      }
    }
  }, [ceremonyResult, recordOutcome, getMessage, addToast, mutate, mutateAchievements, batchState, scroll, recordBatchAttempt, resetBatch])

  const doEnhance = useCallback(async () => {
    if (!selectedEquip || !selectedScroll) return
    setEnhancing(true)
    setCeremonyResult(null)
    setCeremonyActive(true)

    try {
      const res = await fetch("/api/pet/enhancement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentInventoryId: selectedEquip, scrollInventoryId: selectedScroll }),
      })
      const body = await res.json()

      if (!res.ok) {
        setCeremonyResult({ outcome: "failed", itemName: body.error || "Enhancement failed" })
      } else {
        setCeremonyResult(body)
      }
    } catch {
      setCeremonyResult({ outcome: "failed", itemName: "Network error" })
    } finally {
      setEnhancing(false)
    }
  }, [selectedEquip, selectedScroll])

  function handleEnhance() {
    if (batchEnabled && scroll) {
      startBatch(scroll.quantity)
    }
    doEnhance()
  }

  function handleSelectEquip(id: number) {
    setSelectedEquip(id)
    setWizardStep(2)
  }

  function handleSelectScroll(id: number) {
    setSelectedScroll(id)
    setWizardStep(3)
  }

  const equipImage = equip ? getItemImageUrl(equip.item.assetPath, equip.item.category) : null
  const scrollImage = scroll ? getItemImageUrl(scroll.item.assetPath, "SCROLL") : null

  const renderEquipmentList = () => (
    <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020]" style={{ boxShadow: "3px 3px 0 #060810" }}>
      <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center justify-between">
        <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">
          EQUIPMENT ({filteredEquipment.length})
        </span>
      </div>
      <EquipmentFilter
        state={equipFilter}
        onChange={setEquipFilter}
        totalCount={data?.equipment.length || 0}
        filteredCount={filteredEquipment.length}
      />
      {!filteredEquipment.length ? (
        <div className="py-6 text-center">
          <p className="font-pixel text-[13px] text-[var(--pet-text-dim)]">
            {data?.equipment.length ? "No equipment matches filters" : "No equipment owned"}
          </p>
          {data?.equipment.length ? (
            <button
              onClick={() => setEquipFilter({ slotFilter: "ALL", sortKey: "level-desc", searchQuery: "", hideMaxed: false })}
              className="font-pixel text-[11px] text-[var(--pet-gold)] mt-1 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="p-2 space-y-1 max-h-[28rem] lg:max-h-[28rem] overflow-y-auto scrollbar-hide">
          {filteredEquipment.map((e) => {
            const bc = e.glowTier !== "none" ? GLOW_BORDER[e.glowTier as GlowTier] : RARITY_BORDER[e.item.rarity] || "#3a4a6c"
            const imgUrl = getItemImageUrl(e.item.assetPath, e.item.category)
            const isSelected = selectedEquip === e.inventoryId
            const totalGold = (e.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
            const isMaxed = e.enhancementLevel >= e.maxLevel

            return (
              <ComparisonTooltip key={e.inventoryId} equip={e} scroll={scroll}>
                <ItemGlow rarity={e.item.rarity} glowTier={e.glowTier as GlowTier} glowIntensity={e.glowIntensity}>
                  <button
                    onClick={() => handleSelectEquip(e.inventoryId)}
                    className={cn(
                      "w-full text-left px-2.5 py-3 border-2 flex items-center gap-2 transition-all active:scale-[0.98]",
                      isSelected ? "bg-[#f0c040]/6" : "bg-[#0a0e1a] hover:bg-[#101828]",
                      isMaxed && !isSelected && "opacity-60"
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
                        {isMaxed && <span className="text-[var(--pet-gold)] ml-1">{"\u2713"}</span>}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <PixelBadge rarity={e.item.rarity} />
                        {e.glowTier !== "none" && (
                          <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[e.glowTier as GlowTier])}>
                            {GLOW_LABELS[e.glowTier as GlowTier]}
                          </span>
                        )}
                        {totalGold > 0 && (
                          <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">+{totalGold.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-pixel text-[12px] text-[var(--pet-text-dim)]">
                        {e.enhancementLevel}/{e.maxLevel}
                      </span>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setTraceEquip(e) }}
                        className="w-5 h-5 border border-[#3a4a6c] bg-[#080c18] flex items-center justify-center text-[10px] text-[var(--pet-text-dim)] hover:text-[var(--pet-gold)] hover:border-[var(--pet-gold)] transition-colors"
                        title="View scroll trace"
                      >
                        i
                      </button>
                    </div>
                  </button>
                </ItemGlow>
              </ComparisonTooltip>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderScrollList = () => (
    <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020]" style={{ boxShadow: "3px 3px 0 #060810" }}>
      <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center justify-between">
        <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">
          SCROLLS ({filteredScrolls.length})
        </span>
      </div>
      <ScrollFilter
        state={scrollFilter}
        onChange={setScrollFilter}
        totalCount={data?.scrolls.length || 0}
        filteredCount={filteredScrolls.length}
      />
      {!filteredScrolls.length ? (
        <div className="py-6 text-center">
          <p className="font-pixel text-[13px] text-[var(--pet-text-dim)]">
            {data?.scrolls.length ? "No scrolls match filters" : "No scrolls owned. Keep studying!"}
          </p>
        </div>
      ) : (
        <div className="p-2 space-y-1 max-h-[28rem] lg:max-h-[28rem] overflow-y-auto scrollbar-hide">
          {filteredScrolls.map((s) => {
            const isSelected = selectedScroll === s.inventoryId
            const bc = RARITY_BORDER[s.item.rarity] || "#3a4a6c"
            const bv = s.properties?.bonusValue ?? 1
            const goldPer = (bv * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
            const imgUrl = getItemImageUrl(s.item.assetPath, "SCROLL")
            return (
              <ItemGlow key={s.inventoryId} rarity={s.item.rarity}>
                <button
                  onClick={() => handleSelectScroll(s.inventoryId)}
                  className={cn(
                    "w-full text-left px-2.5 py-3 border-2 flex items-center gap-2 transition-all active:scale-[0.98]",
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
                      <span className="font-pixel text-[10px] text-[var(--pet-gold)]">+{goldPer.toFixed(1)}%</span>
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
  )

  const renderPreview = () => {
    if (!equip || !scroll) return null

    return (
      <RiskIndicator effectiveSuccess={effectiveSuccess} effectiveDestroy={effectiveDestroy}>
        <div className="bg-[#0c1020] p-4">
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
                  {" "}+{(scroll.properties.bonusValue * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(2)}% Drop
                </p>
              )}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-3">
              <BatchEnhanceControls
                batchEnabled={batchEnabled}
                onToggleBatch={setBatchEnabled}
                batchState={batchState}
                onStop={stopBatch}
              />
              <StreakBadge streak={streak} />
            </div>
            <PixelButton
              variant="gold"
              size="lg"
              onClick={handleEnhance}
              disabled={enhancing || equip.enhancementLevel >= equip.maxLevel}
              loading={enhancing}
            >
              {batchState.active ? "Enhancing..." : "Enhance"}
            </PixelButton>
          </div>

          {equip.enhancementLevel >= equip.maxLevel && (
            <p className="font-pixel text-[13px] text-[var(--pet-gold)] text-center mt-2">MAX LEVEL REACHED</p>
          )}

          <SessionStats streak={streak} className="mt-2" />
        </div>
      </RiskIndicator>
    )
  }

  return (
    <Layout SEO={{ title: "Enhancement - LionGotchi", description: "Enhance your equipment" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div className="flex items-center justify-between">
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
                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fastMode}
                    onChange={(e) => setFastMode(e.target.checked)}
                    className="w-3 h-3 accent-[var(--pet-gold)]"
                  />
                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">Fast</span>
                </label>
              </div>

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
                <>
                  {/* Desktop: side-by-side columns */}
                  <div className="hidden lg:grid grid-cols-2 gap-4">
                    {renderEquipmentList()}
                    {renderScrollList()}
                  </div>

                  {/* Mobile: step wizard */}
                  <StepWizard
                    currentStep={wizardStep}
                    onStepChange={setWizardStep}
                    hasEquipment={!!selectedEquip}
                    hasScroll={!!selectedScroll}
                  >
                    {wizardStep === 1 && renderEquipmentList()}
                    {wizardStep === 2 && renderScrollList()}
                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        {renderPreview()}
                        <button
                          onClick={() => setWizardStep(1)}
                          className="font-pixel text-[11px] text-[var(--pet-text-dim)] hover:text-[var(--pet-gold)] transition-colors"
                        >
                          {"\u2190"} Change selection
                        </button>
                      </div>
                    )}
                  </StepWizard>

                  {/* Desktop: preview */}
                  <div className="hidden lg:block">
                    {renderPreview()}
                  </div>

                  {/* Achievements section */}
                  <AchievementBadges
                    unlockedKeys={unlockedAchievementKeys}
                    newlyUnlocked={newlyUnlockedAchievements}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ceremony overlay */}
        <EnhancementCeremony
          active={ceremonyActive}
          result={ceremonyResult}
          equipImage={equipImage}
          scrollImage={scrollImage}
          equipName={equip?.item.name}
          scrollRarity={scroll?.item.rarity}
          destroyRate={scroll?.properties?.destroyRate ?? 0}
          fastMode={fastMode || batchState.active}
          onComplete={handleCeremonyComplete}
        />

        {/* Toast stack */}
        <EnhancementToastStack toasts={toasts} onDismiss={dismissToast} />

        {/* Scroll trace detail modal */}
        {traceEquip && (
          <ScrollTraceModal equip={traceEquip} onClose={() => setTraceEquip(null)} />
        )}

        {/* Mobile action bar */}
        <MobileActionBar
          equipName={equip?.item.name}
          equipImage={equipImage}
          equipCategory={equip?.item.category}
          scrollName={scroll?.item.name}
          scrollImage={scrollImage}
          effectiveSuccess={effectiveSuccess}
          effectiveDestroy={effectiveDestroy}
          canEnhance={!!(equip && scroll)}
          enhancing={enhancing}
          isMaxLevel={!!equip && equip.enhancementLevel >= equip.maxLevel}
          onEnhance={handleEnhance}
          onJumpToStep3={() => setWizardStep(3)}
        />
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
