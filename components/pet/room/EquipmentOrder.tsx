// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Updated: 2026-03-17
// Purpose: Render stack editor -- shows the full interleaved lion layer
//          + equipment stack. Equipment can be dragged to any position
//          between lion layer anchors. Per-item X/Y offset sliders let
//          users nudge equipment on the lion sprite.
// ============================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import { getItemImageUrl, RARITY_COLORS } from '@/utils/petAssets'
import {
  type RenderStep,
  LION_LAYER_KEYS,
  EQUIP_OFFSET_RANGE,
} from '@/utils/roomConstraints'

interface EquipmentOrderProps {
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string }>
  renderSequence: RenderStep[]
  equipmentOffsets: Record<string, [number, number]>
  selectedSlot: string | null
  onReorder: (newSequence: RenderStep[]) => void
  onSelectSlot: (slot: string | null) => void
  onOffsetChange: (slot: string, offset: [number, number]) => void
}

const SLOT_LABELS: Record<string, string> = {
  HEAD: 'Head',
  FACE: 'Face',
  BODY: 'Body',
  BACK: 'Back',
  FEET: 'Feet',
}

const SLOT_ICONS: Record<string, string> = {
  HEAD: '\u{1F3A9}',
  FACE: '\u{1F453}',
  BODY: '\u{1F455}',
  BACK: '\u{1FABD}',
  FEET: '\u{1F462}',
}

const LION_LAYER_LABELS: Record<string, string> = {
  body: 'Body',
  head: 'Head',
  expression: 'Expression',
  hair: 'Mane',
}

const LION_LAYER_ICONS: Record<string, string> = {
  body: '\u{1F9B4}',
  head: '\u{1F981}',
  expression: '\u{1F60A}',
  hair: '\u{1F981}',
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
  renderSequence,
  equipmentOffsets,
  selectedSlot,
  onReorder,
  onSelectSlot,
  onOffsetChange,
}: EquipmentOrderProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const seqRef = useRef(renderSequence)
  seqRef.current = renderSequence

  const backItem = equipment['BACK'] || equipment['back']

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

      const seq = [...seqRef.current]
      const [moved] = seq.splice(sourceIdx, 1)
      seq.splice(targetIdx, 0, moved)
      onReorder(seq)
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
      <div className="font-pixel">
        <h4 className="text-sm text-yellow-300 mb-2">Render Stack</h4>
        <p className="text-[13px] text-[#6b7fa0] italic">
          No equipment worn. Equip items in Discord to arrange their layers.
        </p>
      </div>
    )
  }

  const selectedItem = selectedSlot ? (equipment[selectedSlot] || null) : null
  const selectedOffset = selectedSlot ? (equipmentOffsets[selectedSlot] ?? [0, 0]) : [0, 0]

  return (
    <div className="font-pixel select-none">
      <h4 className="text-sm text-yellow-300 mb-1">Render Stack</h4>
      <p className="text-[12px] text-[#6b7fa0] mb-2.5">
        Drag equipment between lion layers. Click to select and adjust position.
      </p>

      {backItem && (
        <div className="mb-2">
          <div className="text-[12px] text-[#6b7fa0] mb-1 flex items-center gap-1">
            <span>{'\u{1F512}'}</span>
            <span>Behind Lion (scene level)</span>
          </div>
          <div
            onClick={() => onSelectSlot(selectedSlot === 'BACK' ? null : 'BACK')}
            className="cursor-pointer"
          >
            <EquipmentCard
              slot="BACK"
              item={backItem}
              isDragging={false}
              isOver={false}
              isSelected={selectedSlot === 'BACK'}
              locked
            />
          </div>
        </div>
      )}

      {backItem && renderSequence.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-[#3a4a6c]" />
          <span className="text-[11px] text-[#6b7fa0] uppercase tracking-wider">
            Lion Sprite
          </span>
          <div className="flex-1 h-px bg-[#3a4a6c]" />
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {renderSequence.map((step, idx) => {
          if (step.type === 'lion') {
            return (
              <div
                key={`lion_${step.key}`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded transition-all
                  ${overIdx === idx && dragIdx !== null
                    ? 'bg-yellow-400/10 border border-yellow-400/30'
                    : 'border border-transparent'
                  }
                `}
              >
                <span className="text-[14px] opacity-50">
                  {LION_LAYER_ICONS[step.key] || '\u{1F981}'}
                </span>
                <span className="text-[12px] text-[#5a6a7c] uppercase tracking-wider flex-1">
                  {LION_LAYER_LABELS[step.key] || step.key}
                </span>
                <span className="text-[10px] text-[#3a4a5c]">anchor</span>
              </div>
            )
          }

          const slot = step.key
          const item = equipment[slot]
          if (!item) return null

          return (
            <div
              key={`equip_${slot}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectSlot(selectedSlot === slot ? null : slot)}
              className="cursor-pointer"
            >
              <EquipmentCard
                slot={slot}
                item={item}
                isDragging={dragIdx === idx}
                isOver={overIdx === idx && dragIdx !== idx}
                isSelected={selectedSlot === slot}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-[#6b7fa0]">
        <span>{'\u2191'} Renders in front</span>
        <span>{'\u2193'} Renders behind</span>
      </div>

      {selectedSlot && selectedItem && (
        <div className="mt-3 pt-3 border-t border-[#3a4a6c]">
          <h5 className="text-[12px] text-yellow-300 mb-2 flex items-center gap-1.5">
            <span>{SLOT_ICONS[selectedSlot] || '\u{1F4E6}'}</span>
            <span>{selectedItem.name} - Position</span>
          </h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#6b7fa0] w-6">X</span>
              <input
                type="range"
                min={-EQUIP_OFFSET_RANGE}
                max={EQUIP_OFFSET_RANGE}
                value={selectedOffset[0]}
                onChange={(e) => onOffsetChange(selectedSlot, [Number(e.target.value), selectedOffset[1]])}
                className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
              />
              <span className="text-[12px] text-[#e2e8f0] w-8 text-right tabular-nums">
                {selectedOffset[0]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#6b7fa0] w-6">Y</span>
              <input
                type="range"
                min={-EQUIP_OFFSET_RANGE}
                max={EQUIP_OFFSET_RANGE}
                value={selectedOffset[1]}
                onChange={(e) => onOffsetChange(selectedSlot, [selectedOffset[0], Number(e.target.value)])}
                className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
              />
              <span className="text-[12px] text-[#e2e8f0] w-8 text-right tabular-nums">
                {selectedOffset[1]}
              </span>
            </div>
            <button
              onClick={() => onOffsetChange(selectedSlot, [0, 0])}
              className="text-[11px] px-2 py-1 border border-[#3a4a6c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors w-full"
            >
              Reset Position
            </button>
          </div>
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
  isSelected,
  locked,
}: {
  slot: string
  item: { name: string; category: string; rarity: string; assetPath: string }
  isDragging: boolean
  isOver: boolean
  isSelected?: boolean
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
              : isSelected
                ? 'border-[#4080f0] shadow-[0_0_8px_rgba(64,128,240,0.3)]'
                : 'border-[#3a4a6c] hover:border-[#5a6a8c] cursor-grab active:cursor-grabbing'
        }
      `}
    >
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accentColor }} />

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
          {SLOT_ICONS[slot] || '\u{1F4E6}'}
        </span>
      </div>

      <div className="flex-1 min-w-0 py-1.5 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#6b7fa0]">{SLOT_LABELS[slot] || slot}</span>
          <span className={`text-[11px] ${rarityClass} uppercase tracking-wider`}>
            {item.rarity}
          </span>
        </div>
        <div className="text-sm text-[#e2e8f0] truncate">{item.name}</div>
      </div>

      {!locked && (
        <div className="flex-shrink-0 pr-2 text-[#6b7fa0] text-sm">{'\u2807'}</div>
      )}
    </div>
  )
}
