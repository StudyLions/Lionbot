// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Detail modal showing scroll trace for equipment.
//          Triggered by info icon on equipment list items.
// ============================================================

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, type GlowTier } from '@/utils/gameConstants'
import { getItemImageUrl } from '@/utils/petAssets'
import ItemGlow from '@/components/pet/ui/ItemGlow'
import PixelBadge from '@/components/pet/ui/PixelBadge'
import PixelButton from '@/components/pet/ui/PixelButton'

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

interface ScrollTraceModalProps {
  equip: EquipmentItem | null
  onClose: () => void
}

export default function ScrollTraceModal({ equip, onClose }: ScrollTraceModalProps) {
  if (!equip) return null

  const imgUrl = getItemImageUrl(equip.item.assetPath, equip.item.category)
  const totalGold = (equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)
  const totalDrop = (equip.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(1)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-md border-[3px] border-[#3a4a6c] bg-[#0c1020] z-10"
          style={{ boxShadow: '4px 4px 0 #060810' }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center gap-3">
            <ItemGlow rarity={equip.item.rarity} glowTier={equip.glowTier} glowIntensity={equip.glowIntensity}>
              <div className="w-12 h-12 border-2 border-[#3a4a6c] bg-[#080c18] flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt="" className="w-9 h-9 object-contain" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <span className="text-lg">{'\u2694\uFE0F'}</span>
                )}
              </div>
            </ItemGlow>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-base text-[var(--pet-text)] truncate">
                  {equip.item.name}
                  {equip.enhancementLevel > 0 && (
                    <span className="text-[var(--pet-gold)] ml-1">+{equip.enhancementLevel}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PixelBadge rarity={equip.item.rarity} />
                {equip.glowTier !== 'none' && (
                  <span className={cn('font-pixel text-[10px]', GLOW_TEXT_COLORS[equip.glowTier])}>
                    {GLOW_LABELS[equip.glowTier]} Glow
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Total bonus */}
          <div className="px-4 py-2 border-b border-[#1a2a3c] flex items-center justify-between">
            <span className="font-pixel text-[11px] text-[var(--pet-text-dim)]">Total Bonus</span>
            <span className="font-pixel text-[12px] text-[var(--pet-gold)]">
              +{totalGold}% Gold/XP, +{totalDrop}% Drop
            </span>
          </div>

          {/* Scroll trace */}
          <div className="px-4 py-3 space-y-1 max-h-[50vh] overflow-y-auto scrollbar-hide">
            <span className="font-pixel text-[11px] text-[#4a5a70] tracking-[0.15em] block mb-2">
              SCROLL TRACE
            </span>
            {Array.from({ length: equip.maxLevel }, (_, i) => i + 1).map((slotNum) => {
              const slot = equip.slots.find((s) => s.slotNumber === slotNum)
              if (slot) {
                const goldPct = (slot.bonusValue * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)
                return (
                  <div key={slotNum} className="flex items-center gap-2 px-2 py-1.5 bg-[#0a0e1a] border border-[#1a2a3c]">
                    <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] w-6">+{slotNum}</span>
                    <span className="font-pixel text-[11px] text-[var(--pet-text)] flex-1 truncate">{slot.scrollName}</span>
                    <span className="font-pixel text-[10px] text-[var(--pet-gold)]">+{goldPct}%</span>
                  </div>
                )
              }
              return (
                <div key={slotNum} className="flex items-center gap-2 px-2 py-1.5 bg-[#080c18] border border-[#141c2c] opacity-40">
                  <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] w-6">+{slotNum}</span>
                  <span className="font-pixel text-[11px] text-[var(--pet-text-dim)] flex-1 italic">empty</span>
                </div>
              )
            })}
          </div>

          {/* Close button */}
          <div className="px-4 py-3 border-t-2 border-[#1a2a3c] flex justify-center">
            <PixelButton variant="ghost" size="sm" onClick={onClose}>Close</PixelButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
