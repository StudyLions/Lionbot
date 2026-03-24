// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Sticky bottom action bar for mobile enhancement.
//          Shows selected equipment/scroll chips and enhance button.
// ============================================================

import { cn } from '@/lib/utils'
import { getItemImageUrl, getCategoryPlaceholder } from '@/utils/petAssets'
import PixelButton from '@/components/pet/ui/PixelButton'

interface MobileActionBarProps {
  equipName?: string
  equipImage?: string | null
  equipCategory?: string
  scrollName?: string
  scrollImage?: string | null
  effectiveSuccess: number
  effectiveDestroy: number
  canEnhance: boolean
  enhancing: boolean
  isMaxLevel: boolean
  onEnhance: () => void
  onJumpToStep3: () => void
  className?: string
}

export default function MobileActionBar({
  equipName, equipImage, equipCategory,
  scrollName, scrollImage,
  effectiveSuccess, effectiveDestroy,
  canEnhance, enhancing, isMaxLevel,
  onEnhance, onJumpToStep3, className,
}: MobileActionBarProps) {
  return (
    <div
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#3a4a6c] bg-[#0c1020] px-3 py-2',
        className
      )}
      style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-2 max-w-6xl mx-auto">
        {/* Equipment chip */}
        <div
          className="flex items-center gap-1.5 border border-[#1a2a3c] bg-[#080c18] px-2 py-1.5 flex-shrink-0 min-w-0"
          style={{ maxWidth: '35%' }}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {equipImage ? (
              <img src={equipImage} alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
            ) : equipCategory ? (
              <span className="text-[10px]">{getCategoryPlaceholder(equipCategory)}</span>
            ) : (
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">?</span>
            )}
          </div>
          <span className="font-pixel text-[9px] text-[var(--pet-text)] truncate">
            {equipName || 'None'}
          </span>
        </div>

        <span className="font-pixel text-[10px] text-[var(--pet-text-dim)] flex-shrink-0">+</span>

        {/* Scroll chip */}
        <div
          className="flex items-center gap-1.5 border border-[#1a2a3c] bg-[#080c18] px-2 py-1.5 flex-shrink-0 min-w-0"
          style={{ maxWidth: '35%' }}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {scrollImage ? (
              <img src={scrollImage} alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">?</span>
            )}
          </div>
          <span className="font-pixel text-[9px] text-[var(--pet-text)] truncate">
            {scrollName || 'None'}
          </span>
        </div>

        {/* Success indicator + enhance button */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {canEnhance && (
            <span className={cn(
              'font-pixel text-[10px] flex-shrink-0',
              effectiveSuccess >= 70 ? 'text-green-400' :
              effectiveSuccess >= 30 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {effectiveSuccess}%
            </span>
          )}
          {canEnhance ? (
            <PixelButton
              variant="gold"
              size="sm"
              onClick={onEnhance}
              disabled={enhancing || isMaxLevel}
              loading={enhancing}
            >
              Enhance
            </PixelButton>
          ) : (
            <PixelButton variant="ghost" size="sm" onClick={onJumpToStep3} disabled>
              Select both
            </PixelButton>
          )}
        </div>
      </div>
    </div>
  )
}
