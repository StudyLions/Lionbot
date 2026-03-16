// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Floating info card that follows the cursor to display
//          details about the currently hovered room layer
// ============================================================

'use client'

import type { RoomLayout } from '@/utils/roomConstraints'

interface ItemInfoCardProps {
  layer: string | null
  position: { x: number; y: number }
  furniture: Record<string, string>
  layout: RoomLayout
  visible: boolean
}

export default function ItemInfoCard({
  layer,
  position,
  furniture,
  layout,
  visible,
}: ItemInfoCardProps) {
  if (!visible || !layer) return null

  const isLion = layer === 'lion'
  const currentAsset = isLion ? 'Lion Sprite' : (furniture[layer] || 'default')
  const offset: [number, number] = isLion
    ? layout.lionPosition
    : (layout.furnitureOffsets[layer] ?? [0, 0])
  const flipped = isLion ? false : (layout.furnitureFlips[layer] ?? false)

  const displayName = layer.charAt(0).toUpperCase() + layer.slice(1)
  const assetName = isLion ? 'Lion Sprite' : currentAsset.split('/').pop()?.replace('.png', '') || currentAsset

  return (
    <div
      className="fixed z-50 pointer-events-none font-pixel"
      style={{
        left: position.x + 16,
        top: position.y - 8,
      }}
    >
      <div className="bg-[#0c1020] border-2 border-[#3a4a6c] rounded px-2.5 py-2 shadow-lg min-w-[140px]"
        style={{
          boxShadow: '4px 4px 0 rgba(0,0,0,0.5), inset 1px 1px 0 rgba(58,74,108,0.3)',
        }}
      >
        {/* Layer name */}
        <div className="text-[11px] text-yellow-300 font-bold mb-1">
          {displayName}
        </div>

        {/* Asset */}
        <div className="flex items-center gap-1 text-[10px] text-[#8b9dc3] mb-0.5">
          <span className="text-[#6b7fa0]">Asset:</span>
          <span className="text-[#e2e8f0] truncate max-w-[120px]">{assetName}</span>
        </div>

        {/* Offset */}
        <div className="flex items-center gap-1 text-[10px] text-[#8b9dc3] mb-0.5">
          <span className="text-[#6b7fa0]">Offset:</span>
          <span className="text-[#e2e8f0] tabular-nums">
            ({offset[0]}, {offset[1]})
          </span>
        </div>

        {/* Flip status */}
        {!isLion && (
          <div className="flex items-center gap-1 text-[10px] text-[#8b9dc3]">
            <span className="text-[#6b7fa0]">Flipped:</span>
            <span className={flipped ? 'text-yellow-300' : 'text-[#e2e8f0]'}>
              {flipped ? 'Yes ⇔' : 'No'}
            </span>
          </div>
        )}

        {/* Pixel corner decorations */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-[#3a4a6c]" />
        <div className="absolute top-0 right-0 w-1 h-1 bg-[#3a4a6c]" />
        <div className="absolute bottom-0 left-0 w-1 h-1 bg-[#3a4a6c]" />
        <div className="absolute bottom-0 right-0 w-1 h-1 bg-[#3a4a6c]" />
      </div>
    </div>
  )
}
