// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Floating contextual action bar for the room editor.
//          Appears when a furniture layer or lion is selected,
//          showing relevant actions (flip, color, resize, remove).
// ============================================================

'use client'

import { isFlippable, isResizable, MIN_SCALE, MAX_SCALE } from '@/utils/roomConstraints'

interface ContextualBarProps {
  layer: string
  currentScale: number
  hasColorVariants: boolean
  onFlip: () => void
  onColor: () => void
  onScale: (scale: number) => void
  onRemove: () => void
  onDeselect: () => void
}

export default function ContextualBar({
  layer,
  currentScale,
  hasColorVariants,
  onFlip,
  onColor,
  onScale,
  onRemove,
  onDeselect,
}: ContextualBarProps) {
  const canFlip = isFlippable(layer)
  const canResize = isResizable(layer)
  const canRemove = layer !== 'lion'

  return (
    <div className="flex items-center gap-1.5 bg-[#0c1020] border-2 border-[#4080f0] rounded px-2 py-1.5 font-pixel shadow-[0_0_12px_rgba(64,128,240,0.2)]">
      <button
        onClick={onDeselect}
        className="text-[13px] px-1.5 py-0.5 text-[#6b7fa0] hover:text-[#e2e8f0] transition-colors"
        title="Deselect (Esc)"
      >
        {'✕'}
      </button>

      <span className="text-[13px] text-[#93c5fd] capitalize font-bold tracking-wide">
        {layer}
      </span>

      <div className="w-px h-5 bg-[#3a4a6c] mx-0.5" />

      {canFlip && (
        <button
          onClick={onFlip}
          className="text-[13px] px-2 py-0.5 border border-[#3a4a6c] bg-[#111828] text-[#c8d4e8] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-colors"
          title="Flip"
        >
          {'⇔ Flip'}
        </button>
      )}

      {hasColorVariants && (
        <button
          onClick={onColor}
          className="text-[13px] px-2 py-0.5 border border-[#3a4a6c] bg-[#111828] text-[#c8d4e8] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-colors"
          title="Cycle color variant"
        >
          {'◐ Color'}
        </button>
      )}

      {canResize && (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[#6b7fa0]">{'⤡'}</span>
          <input
            type="range"
            min={MIN_SCALE * 100}
            max={MAX_SCALE * 100}
            value={Math.round(currentScale * 100)}
            onChange={(e) => onScale(Number(e.target.value) / 100)}
            className="w-20 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
            style={{ accentColor: '#4080f0' }}
          />
          <span className="text-[12px] text-[#e2e8f0] min-w-[3.5ch] text-right tabular-nums">
            {Math.round(currentScale * 100)}%
          </span>
          {currentScale !== 1 && (
            <button
              onClick={() => onScale(1)}
              className="text-[11px] px-1 py-0.5 text-[#6b7fa0] hover:text-[#e2e8f0] transition-colors"
              title="Reset size"
            >
              {'↺'}
            </button>
          )}
        </div>
      )}

      {canRemove && (
        <>
          <div className="w-px h-5 bg-[#3a4a6c] mx-0.5" />
          <button
            onClick={onRemove}
            className="text-[13px] px-2 py-0.5 border border-[#5a2020] bg-[#1a0808] text-[#e05050] hover:border-[#804040] hover:text-[#ff7070] transition-colors"
            title="Remove furniture (Del)"
          >
            {'🗑'}
          </button>
        </>
      )}
    </div>
  )
}
