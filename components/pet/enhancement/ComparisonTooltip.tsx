// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Before-vs-after comparison tooltip for equipment.
//          Shows current stats and potential gains on next enhance.
// ============================================================

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CONSTANTS, calcLevelPenalty, calcGlowTier, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier } from '@/utils/gameConstants'

interface EquipmentForTooltip {
  enhancementLevel: number
  maxLevel: number
  totalBonus: number
  glowTier: GlowTier
  item: { rarity: string }
}

interface ScrollForTooltip {
  properties: { bonusValue: number; successRate: number } | null
}

interface ComparisonTooltipProps {
  equip: EquipmentForTooltip
  scroll?: ScrollForTooltip | null
  children: React.ReactNode
}

const GLOW_THRESHOLDS: [number, GlowTier, string][] = [
  [6.0, 'celestial', 'Celestial'],
  [4.0, 'diamond', 'Diamond'],
  [2.5, 'gold', 'Gold'],
  [1.5, 'silver', 'Silver'],
  [0.01, 'bronze', 'Bronze'],
]

function getNextGlowInfo(level: number, totalBonus: number, maxLevel: number): string | null {
  if (level <= 0) return null
  const currentAvg = totalBonus / level

  for (const [threshold, , name] of GLOW_THRESHOLDS) {
    if (currentAvg < threshold) {
      const needed = threshold * (level + 1) - totalBonus
      if (needed > 0 && level < maxLevel) {
        return `Need avg ${threshold.toFixed(1)} bonus/slot for ${name} Glow`
      }
    }
  }
  return null
}

export default function ComparisonTooltip({ equip, scroll, children }: ComparisonTooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState<'above' | 'below'>('above')
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleEnter = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPosition(rect.top < 200 ? 'below' : 'above')
      }
      setShow(true)
    }, 300)
  }, [])

  const handleLeave = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setShow(false)
  }, [])

  const currentGold = (equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
  const currentDrop = (equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100)

  const scrollBonus = scroll?.properties?.bonusValue ?? 0
  const afterGold = ((equip.totalBonus + scrollBonus) * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100)
  const afterDrop = ((equip.totalBonus + scrollBonus) * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100)

  const nextGlowInfo = getNextGlowInfo(equip.enhancementLevel, equip.totalBonus, equip.maxLevel)
  const isMaxed = equip.enhancementLevel >= equip.maxLevel

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
    >
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute z-40 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)]"
            style={position === 'above' ? { bottom: '100%', marginBottom: 8 } : { top: '100%', marginTop: 8 }}
            initial={{ opacity: 0, y: position === 'above' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'above' ? 6 : -6 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="border-2 border-[#3a4a6c] bg-[#0c1020] px-3 py-2 min-w-[200px]"
              style={{ boxShadow: '2px 2px 0 #060810' }}
            >
              <span className="font-pixel text-[10px] text-[#4a5a70] tracking-[0.15em] block mb-1.5">
                {isMaxed ? 'MAX LEVEL' : 'ENHANCEMENT PREVIEW'}
              </span>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">Level</span>
                  <span className="font-pixel text-[10px] text-[var(--pet-text)]">
                    +{equip.enhancementLevel}
                    {!isMaxed && scroll && <span className="text-[var(--pet-green)]"> {'\u2192'} +{equip.enhancementLevel + 1}</span>}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">Gold/XP</span>
                  <span className="font-pixel text-[10px] text-[var(--pet-text)]">
                    +{currentGold.toFixed(1)}%
                    {!isMaxed && scroll && (
                      <span className="text-[var(--pet-green)]">
                        {' \u2192 '}+{afterGold.toFixed(1)}%
                        <span className="text-[var(--pet-gold)] ml-0.5">(+{(afterGold - currentGold).toFixed(1)}%)</span>
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">Drop Rate</span>
                  <span className="font-pixel text-[10px] text-[var(--pet-text)]">
                    +{currentDrop.toFixed(2)}%
                    {!isMaxed && scroll && (
                      <span className="text-[var(--pet-green)]">
                        {' \u2192 '}+{afterDrop.toFixed(2)}%
                      </span>
                    )}
                  </span>
                </div>

                {equip.glowTier !== 'none' && (
                  <div className="flex justify-between">
                    <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">Glow</span>
                    <span className={`font-pixel text-[10px] ${GLOW_TEXT_COLORS[equip.glowTier]}`}>
                      {GLOW_LABELS[equip.glowTier]}
                    </span>
                  </div>
                )}

                {nextGlowInfo && (
                  <p className="font-pixel text-[9px] text-[var(--pet-text-dim)] mt-1 pt-1 border-t border-[#1a2a3c]">
                    {nextGlowInfo}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
