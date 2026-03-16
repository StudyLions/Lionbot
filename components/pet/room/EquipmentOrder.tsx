// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Draggable equipment card panel for controlling render
//          z-index order of equipped items on the lion
// ============================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import { getItemImageUrl, RARITY_COLORS } from '@/utils/petAssets'

interface EquipmentOrderProps {
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string }>
  equipmentOrder: string[]
  onReorder: (newOrder: string[]) => void
}

const SLOT_LABELS: Record<string, string> = {
  HEAD: 'Head',
  FACE: 'Face',
  BODY: 'Body',
  BACK: 'Back',
  FEET: 'Feet',
}

const SLOT_ICONS: Record<string, string> = {
  HEAD: '🎩',
  FACE: '👓',
  BODY: '👕',
  BACK: '🪽',
  FEET: '👢',
}

const RARITY_ACCENT_BG: Record<string, string> = {
  COMMON: '#6b7280',
  UNCOMMON: '#3b82f6',
  RARE: '#ef4444',
  EPIC: '#eab308',
  LEGENDARY: '#ec4899',
}

export default function EquipmentOrder({
  equipment,
  equipmentOrder,
  onReorder,
}: EquipmentOrderProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const orderRef = useRef(equipmentOrder)
  orderRef.current = equipmentOrder

  const frontSlots = equipmentOrder.filter((s) => s !== 'BACK')
  const backSlot = equipmentOrder.includes('BACK') ? 'BACK' : null
  const backItem = backSlot ? equipment[backSlot] : null

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnter = useCallback((targetIdx: number) => {
    setOverIdx(targetIdx)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIdx: number) => {
      e.preventDefault()
      const sourceIdx = dragIdx
      if (sourceIdx === null || sourceIdx === targetIdx) {
        setDragIdx(null)
        setOverIdx(null)
        return
      }

      const newOrder = [...orderRef.current]
      const frontOnly = newOrder.filter((s) => s !== 'BACK')
      const [moved] = frontOnly.splice(sourceIdx, 1)
      frontOnly.splice(targetIdx, 0, moved)

      const hasBack = newOrder.includes('BACK')
      const result = hasBack ? ['BACK', ...frontOnly] : frontOnly
      onReorder(result)

      setDragIdx(null)
      setOverIdx(null)
    },
    [dragIdx, onReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDragIdx(null)
    setOverIdx(null)
  }, [])

  if (Object.keys(equipment).length === 0) {
    return (
      <div className="bg-[#111828] border border-[#3a4a6c] rounded-lg p-4 font-pixel">
        <h4 className="text-sm text-yellow-300 mb-2">Equipment Order</h4>
        <p className="text-[13px] text-[#6b7fa0] italic">
          No equipment worn. Equip items to arrange their render order.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#111828] border border-[#3a4a6c] rounded-lg p-3 font-pixel select-none">
      <h4 className="text-sm text-yellow-300 mb-1">Equipment Order</h4>
      <p className="text-[12px] text-[#6b7fa0] mb-2.5">
        Drag to reorder. Bottom = behind, Top = in front.
      </p>

      {/* Back slot -- always behind the lion, not draggable */}
      {backItem && (
        <div className="mb-2">
          <div className="text-[12px] text-[#6b7fa0] mb-1 flex items-center gap-1">
            <span>🔒</span>
            <span>Behind Lion (fixed)</span>
          </div>
          <EquipmentCard
            slot="BACK"
            item={backItem}
            isDragging={false}
            isOver={false}
            locked
          />
        </div>
      )}

      {/* Divider between back slot and front slots */}
      {backItem && frontSlots.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-[#3a4a6c]" />
          <span className="text-[11px] text-[#6b7fa0] uppercase tracking-wider">
            🦁 Lion Layer
          </span>
          <div className="flex-1 h-px bg-[#3a4a6c]" />
        </div>
      )}

      {/* Front slots -- draggable */}
      <div className="flex flex-col gap-1">
        {frontSlots.map((slot, idx) => {
          const item = equipment[slot]
          if (!item) return null
          return (
            <div
              key={slot}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <EquipmentCard
                slot={slot}
                item={item}
                isDragging={dragIdx === idx}
                isOver={overIdx === idx && dragIdx !== idx}
              />
            </div>
          )
        })}
      </div>

      {frontSlots.length > 0 && (
        <div className="flex items-center justify-between mt-2 text-[11px] text-[#6b7fa0]">
          <span>↑ Renders in front</span>
          <span>↓ Renders behind</span>
        </div>
      )}
    </div>
  )
}

function EquipmentCard({
  slot,
  item,
  isDragging,
  isOver,
  locked,
}: {
  slot: string
  item: { name: string; category: string; rarity: string; assetPath: string }
  isDragging: boolean
  isOver: boolean
  locked?: boolean
}) {
  const thumbUrl = getItemImageUrl(item.assetPath, item.category)
  const accentColor = RARITY_ACCENT_BG[item.rarity] || RARITY_ACCENT_BG.COMMON
  const rarityClass = RARITY_COLORS[item.rarity] || RARITY_COLORS.COMMON

  return (
    <div
      className={`
        relative flex items-center gap-2 bg-[#0c1020] border rounded overflow-hidden transition-all
        ${locked
          ? 'border-[#2a3a5c] opacity-60'
          : isDragging
            ? 'border-yellow-500/50 opacity-50 scale-95'
            : isOver
              ? 'border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-[1.02]'
              : 'border-[#3a4a6c] hover:border-[#5a6a8c] cursor-grab active:cursor-grabbing'
        }
      `}
    >
      {/* Rarity accent bar */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accentColor }} />

      {/* Thumbnail */}
      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center my-1">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={item.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex'
            }}
          />
        ) : null}
        <span
          className="text-lg items-center justify-center"
          style={{ display: thumbUrl ? 'none' : 'flex' }}
        >
          {SLOT_ICONS[slot] || '📦'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1.5 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#6b7fa0]">{SLOT_LABELS[slot] || slot}</span>
          <span className={`text-[11px] ${rarityClass} uppercase tracking-wider`}>
            {item.rarity}
          </span>
        </div>
        <div className="text-sm text-[#e2e8f0] truncate">{item.name}</div>
      </div>

      {/* Drag handle */}
      {!locked && (
        <div className="flex-shrink-0 pr-2 text-[#6b7fa0] text-sm">⠿</div>
      )}
    </div>
  )
}
