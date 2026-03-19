// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: MapleStory-style rich item tooltip with scroll trace,
//          stats, cumulative probability, and enhancement history
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier } from "@/utils/gameConstants"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"

export interface EnhancementSlot {
  slotNumber: number
  scrollName: string
  bonusValue: number
  enhancedAt: string
  successRate: number | null
}

export interface InventoryItem {
  inventoryId: number
  quantity: number
  enhancementLevel: number
  maxLevel: number
  source: string
  acquiredAt: string
  equipped: boolean
  totalBonus: number
  glowTier: GlowTier
  glowIntensity: number
  slots: EnhancementSlot[]
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

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c",
  UNCOMMON: "#4080f0",
  RARE: "#e04040",
  EPIC: "#f0c040",
  LEGENDARY: "#d060f0",
  MYTHICAL: "#ff6080",
}

const RARITY_HEADER_BG: Record<string, string> = {
  COMMON: "rgba(106, 112, 128, 0.15)",
  UNCOMMON: "rgba(64, 128, 240, 0.15)",
  RARE: "rgba(224, 64, 64, 0.15)",
  EPIC: "rgba(240, 192, 64, 0.15)",
  LEGENDARY: "rgba(208, 96, 240, 0.15)",
  MYTHICAL: "rgba(255, 96, 128, 0.15)",
}

const BONUS_COLOR_THRESHOLDS: [number, string][] = [
  [3.0, "text-purple-400"],
  [2.0, "text-cyan-300"],
  [1.5, "text-yellow-400"],
  [1.0, "text-green-400"],
  [0, "text-gray-400"],
]

function getBonusColor(bonusValue: number): string {
  for (const [threshold, color] of BONUS_COLOR_THRESHOLDS) {
    if (bonusValue >= threshold) return color
  }
  return "text-gray-400"
}

const SOURCE_LABELS: Record<string, string> = {
  SHOP: "Shop Purchase",
  DROP: "Activity Drop",
  LEVEL_REWARD: "Level Reward",
  FARM_HARVEST: "Farm Harvest",
  TRADE: "Trade",
  ADMIN: "Admin Grant",
  TUTORIAL: "Tutorial",
  CRAFT: "Crafted",
}

function calcCumulativeProbability(slots: EnhancementSlot[]): number {
  if (slots.length === 0) return 1
  let cumulative = 1
  for (const slot of slots) {
    if (slot.successRate == null) continue
    const levelAtRoll = slot.slotNumber - 1
    const penalty = Math.max(0.1, 1 - GAME_CONSTANTS.LEVEL_PENALTY_FACTOR * levelAtRoll)
    cumulative *= slot.successRate * penalty
  }
  return cumulative
}

function formatProbability(prob: number): string {
  const pct = prob * 100
  if (pct >= 10) return `${pct.toFixed(1)}%`
  if (pct >= 1) return `${pct.toFixed(2)}%`
  if (pct >= 0.01) return `${pct.toFixed(3)}%`
  return `${pct.toFixed(4)}%`
}

interface ItemTooltipProps {
  inv: InventoryItem
  children: React.ReactNode
  className?: string
}

export default function ItemTooltip({ inv, children, className }: ItemTooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState<"right" | "left">("right")
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setShow(true), 200)
  }, [])

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShow(false)
  }, [])

  useEffect(() => {
    if (!show || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceRight = window.innerWidth - rect.right
    setPosition(spaceRight < 340 ? "left" : "right")
  }, [show])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const bc = RARITY_BORDER[inv.item.rarity] || "#3a4a6c"
  const headerBg = RARITY_HEADER_BG[inv.item.rarity] || "rgba(58, 74, 108, 0.15)"
  const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
  const goldBonus = inv.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpBonus = inv.totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100
  const dropBonus = inv.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100
  const cumulativeProb = calcCumulativeProbability(inv.slots)

  return (
    <div
      ref={triggerRef}
      className={cn("relative", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 w-[310px] pointer-events-none",
            position === "right" ? "left-full ml-2" : "right-full mr-2",
            "top-0"
          )}
        >
          <div
            className="border-2 bg-[#0a0e1a] shadow-[4px_4px_0_#060810]"
            style={{ borderColor: bc }}
          >
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-[#1a2a3c]" style={{ background: headerBg }}>
              <div className="flex items-start gap-2.5">
                <div
                  className="w-11 h-11 border bg-[#080c18] flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ borderColor: `${bc}80` }}
                >
                  {imgUrl ? (
                    <CroppedItemImage src={imgUrl} alt={inv.item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-lg">{getCategoryPlaceholder(inv.item.category)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] truncate">
                      {inv.item.name}
                    </span>
                    {inv.enhancementLevel > 0 && (
                      <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                        +{inv.enhancementLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PixelBadge rarity={inv.item.rarity} className="text-[10px] px-1.5 py-0" />
                    {inv.glowTier !== "none" && (
                      <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[inv.glowTier])}>
                        {GLOW_LABELS[inv.glowTier]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {inv.item.description && (
              <div className="px-3 py-2 border-b border-[#1a2a3c]">
                <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] italic leading-relaxed">
                  {inv.item.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="px-3 py-2 border-b border-[#1a2a3c] space-y-1">
              {inv.item.slot && (
                <div className="flex justify-between">
                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Slot</span>
                  <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">{inv.item.slot}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Enhancement</span>
                <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">
                  +{inv.enhancementLevel} / {inv.maxLevel}
                </span>
              </div>
              {inv.totalBonus > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Gold Bonus</span>
                    <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                      +{goldBonus.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">XP Bonus</span>
                    <span className="font-pixel text-[10px] text-[#40d870]">+{xpBonus.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
                    <span className="font-pixel text-[10px] text-[#4080f0]">+{dropBonus.toFixed(2)}%</span>
                  </div>
                </>
              )}
            </div>

            {/* Scroll Trace */}
            {inv.slots.length > 0 && (
              <div className="px-3 py-2 border-b border-[#1a2a3c]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">Scroll Trace</span>
                  <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                    {inv.slots.length} upgrade{inv.slots.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-0.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                  {inv.slots.map((slot) => {
                    const effRate = slot.successRate != null
                      ? slot.successRate * Math.max(0.1, 1 - GAME_CONSTANTS.LEVEL_PENALTY_FACTOR * (slot.slotNumber - 1))
                      : null
                    return (
                      <div
                        key={slot.slotNumber}
                        className="flex items-center gap-1.5 py-0.5"
                      >
                        <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] w-4 text-right flex-shrink-0">
                          +{slot.slotNumber}
                        </span>
                        <span className="w-px h-3 bg-[#2a3a5c] flex-shrink-0" />
                        <span className={cn("font-pixel text-[9px] truncate flex-1", getBonusColor(slot.bonusValue))}>
                          {slot.scrollName}
                        </span>
                        <span className={cn("font-pixel text-[9px] flex-shrink-0", getBonusColor(slot.bonusValue))}>
                          +{slot.bonusValue.toFixed(1)}
                        </span>
                        {effRate != null && (
                          <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] flex-shrink-0">
                            {(effRate * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Cumulative probability */}
                {inv.slots.some((s) => s.successRate != null) && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#1a2a3c]/50 flex justify-between">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                      Chance to reach +{inv.enhancementLevel}
                    </span>
                    <span className={cn(
                      "font-pixel text-[9px]",
                      cumulativeProb < 0.01 ? "text-purple-400" :
                      cumulativeProb < 0.05 ? "text-cyan-300" :
                      cumulativeProb < 0.2 ? "text-yellow-400" :
                      "text-green-400"
                    )}>
                      {formatProbability(cumulativeProb)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                {SOURCE_LABELS[inv.source] || inv.source}
              </span>
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                {new Date(inv.acquiredAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
