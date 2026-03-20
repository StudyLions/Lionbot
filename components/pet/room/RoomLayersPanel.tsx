// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Room furniture layers panel for the room editor.
//          Shows all room items in z-order with drag reorder,
//          position/scale controls, and selection sync with canvas.
// ============================================================

'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import {
  ROOM_LAYERS,
  MIN_SCALE,
  MAX_SCALE,
  isMovable,
  isResizable,
} from '@/utils/roomConstraints'

interface RoomLayersPanelProps {
  layerOrder: string[]
  furniture: Record<string, string>
  furnitureOffsets: Record<string, [number, number]>
  furnitureScales: Record<string, number>
  lionPosition: [number, number]
  lionScale: number
  selectedLayer: string | null
  onSelectLayer: (layer: string | null) => void
  onReorder: (newOrder: string[]) => void
  onMoveLayer: (layer: string, offset: [number, number]) => void
  onScaleLayer: (layer: string, scale: number) => void
}

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''

const LAYER_ICONS: Record<string, string> = {
  wall:    '\u{1F9F1}',
  floor:   '\u{1F7EB}',
  mat:     '\u{1F7E9}',
  table:   '\u{1FA91}',
  chair:   '\u{1F4BA}',
  bed:     '\u{1F6CF}',
  lamp:    '\u{1F4A1}',
  picture: '\u{1F5BC}',
  window:  '\u{1FA9F}',
}

function thumbnailUrl(assetPath: string): string {
  return `${BLOB_BASE}/pet-assets/${assetPath}`
}

export default function RoomLayersPanel({
  layerOrder,
  furniture,
  furnitureOffsets,
  furnitureScales,
  lionPosition,
  lionScale,
  selectedLayer,
  onSelectLayer,
  onReorder,
  onMoveLayer,
  onScaleLayer,
}: RoomLayersPanelProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const dragNodeRef = useRef<HTMLDivElement | null>(null)

  const displayLayers = useMemo(() => [...layerOrder].reverse(), [layerOrder])

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    dragNodeRef.current = e.currentTarget as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4'
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1'
    setDragIdx(null)
    setOverIdx(null)
    dragNodeRef.current = null
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null)
      setOverIdx(null)
      return
    }

    const newDisplay = [...displayLayers]
    const [moved] = newDisplay.splice(dragIdx, 1)
    newDisplay.splice(toIdx, 0, moved)
    onReorder([...newDisplay].reverse())

    setDragIdx(null)
    setOverIdx(null)
  }, [dragIdx, displayLayers, onReorder])

  const selectedOffset: [number, number] =
    selectedLayer === 'lion'
      ? lionPosition
      : selectedLayer
        ? (furnitureOffsets[selectedLayer] ?? [0, 0])
        : [0, 0]

  const selectedScale =
    selectedLayer === 'lion'
      ? lionScale
      : selectedLayer
        ? (furnitureScales[selectedLayer] ?? 1)
        : 1

  const canMove = selectedLayer ? isMovable(selectedLayer) : false
  const canResize = selectedLayer ? isResizable(selectedLayer) : false

  return (
    <div className="font-pixel select-none">
      <h4 className="text-sm text-yellow-300 mb-1">Room Layers</h4>
      <p className="text-[12px] text-[#6b7fa0] mb-2.5">
        Drag to reorder layers. Click to select and adjust.
      </p>

      <div className="flex flex-col gap-0.5">
        {displayLayers.map((layer, idx) => {
          const asset = furniture[layer]
          const icon = LAYER_ICONS[layer] || '\u25FB'
          const isSelected = selectedLayer === layer
          const isDragging = dragIdx === idx
          const isOver = overIdx === idx && dragIdx !== idx

          return (
            <div
              key={layer}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={() => setOverIdx(idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onClick={() => onSelectLayer(isSelected ? null : layer)}
              className={`
                relative flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all border
                ${isDragging
                  ? 'opacity-40 border-yellow-500/50 scale-95'
                  : isOver
                    ? 'border-yellow-400 bg-yellow-400/5 shadow-[0_0_8px_rgba(234,179,8,0.15)]'
                    : isSelected
                      ? 'border-[#4080f0] bg-[#4080f0]/10'
                      : 'border-transparent hover:bg-[#0c1020]/60'
                }
              `}
            >
              <div className="w-8 h-8 flex-shrink-0 rounded border border-[#3a4a6c] bg-[#0c1020] overflow-hidden flex items-center justify-center">
                {asset ? (
                  <img
                    src={thumbnailUrl(asset)}
                    alt={layer}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    draggable={false}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                      if (img.nextElementSibling) (img.nextElementSibling as HTMLElement).style.display = 'flex'
                    }}
                  />
                ) : null}
                <span
                  className="text-[14px] items-center justify-center"
                  style={{ display: asset ? 'none' : 'flex' }}
                >
                  {icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className={`text-[13px] capitalize ${isSelected ? 'text-[#93c5fd]' : 'text-[#e2e8f0]'}`}>
                  {layer}
                </span>
                {asset && (
                  <span className="text-[11px] text-[#4a8a4a] ml-1.5">{'\u2022'} equipped</span>
                )}
                {!asset && (
                  <span className="text-[11px] text-[#5a6a7c] ml-1.5">empty</span>
                )}
              </div>

              <span
                className="text-[#6b7fa0] hover:text-[#8b9dc3] cursor-grab active:cursor-grabbing flex-shrink-0 text-sm"
                title="Drag to reorder"
              >
                {'\u2807'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-1 pt-1 border-t border-[#3a4a6c]">
        <div
          onClick={() => onSelectLayer(selectedLayer === 'lion' ? null : 'lion')}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all border
            ${selectedLayer === 'lion'
              ? 'border-[#4080f0] bg-[#4080f0]/10'
              : 'border-transparent hover:bg-[#0c1020]/60'
            }
          `}
        >
          <div className="w-8 h-8 flex-shrink-0 rounded border border-[#3a4a6c] bg-[#0c1020] overflow-hidden flex items-center justify-center">
            <span className="text-base">{'\u{1F981}'}</span>
          </div>
          <span className={`text-[13px] flex-1 ${selectedLayer === 'lion' ? 'text-[#93c5fd]' : 'text-[#e2e8f0]'}`}>
            Lion
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-[#6b7fa0]">
        <span>{'\u2191'} Renders in front</span>
        <span>{'\u2193'} Renders behind</span>
      </div>

      {selectedLayer && (canMove || canResize) && (
        <div className="mt-3 pt-3 border-t border-[#3a4a6c] space-y-3">
          <h5 className="text-[12px] text-yellow-300 flex items-center gap-1.5">
            <span>{selectedLayer === 'lion' ? '\u{1F981}' : (LAYER_ICONS[selectedLayer] || '\u25FB')}</span>
            <span className="capitalize">{selectedLayer} &mdash; Adjust</span>
          </h5>

          {canMove && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#6b7fa0] uppercase tracking-wider">Position</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6b7fa0] w-4">X</span>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={selectedOffset[0]}
                  onChange={(e) => onMoveLayer(selectedLayer, [Number(e.target.value), selectedOffset[1]])}
                  className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
                />
                <span className="text-[12px] text-[#e2e8f0] w-8 text-right tabular-nums">
                  {selectedOffset[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6b7fa0] w-4">Y</span>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={selectedOffset[1]}
                  onChange={(e) => onMoveLayer(selectedLayer, [selectedOffset[0], Number(e.target.value)])}
                  className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
                />
                <span className="text-[12px] text-[#e2e8f0] w-8 text-right tabular-nums">
                  {selectedOffset[1]}
                </span>
              </div>
            </div>
          )}

          {canResize && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#6b7fa0] uppercase tracking-wider">Scale</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={MIN_SCALE * 100}
                  max={MAX_SCALE * 100}
                  value={Math.round(selectedScale * 100)}
                  onChange={(e) => onScaleLayer(selectedLayer, Number(e.target.value) / 100)}
                  className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
                />
                <span className="text-[12px] text-[#e2e8f0] w-10 text-right tabular-nums">
                  {Math.round(selectedScale * 100)}%
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (canMove) onMoveLayer(selectedLayer, [0, 0])
              if (canResize) onScaleLayer(selectedLayer, 1)
            }}
            className="text-[11px] px-2 py-1 border border-[#3a4a6c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors w-full"
          >
            Reset Position & Scale
          </button>
        </div>
      )}
    </div>
  )
}
