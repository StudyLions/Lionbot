// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Side panel showing all 9 room layers + lion with
//          visibility toggles, selection, and drag reorder
// ============================================================

'use client'

import { useState, useRef, useCallback } from 'react'
import { ROOM_LAYERS } from '@/utils/roomConstraints'

interface LayersPanelProps {
  layerOrder: string[]
  furniture: Record<string, string>
  hiddenLayers: Set<string>
  onToggleVisibility: (layer: string) => void
  onReorder: (newOrder: string[]) => void
  selectedLayer: string | null
  onSelectLayer: (layer: string) => void
}

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''

const LAYER_ICONS: Record<string, string> = {
  wall:    '🧱',
  floor:   '🟫',
  mat:     '🟩',
  table:   '🪑',
  chair:   '💺',
  bed:     '🛏️',
  lamp:    '💡',
  picture: '🖼️',
  window:  '🪟',
}

function thumbnailUrl(assetPath: string): string {
  return `${BLOB_BASE}/pet-assets/${assetPath}`
}

export default function LayersPanel({
  layerOrder,
  furniture,
  hiddenLayers,
  onToggleVisibility,
  onReorder,
  selectedLayer,
  onSelectLayer,
}: LayersPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragNodeRef = useRef<HTMLDivElement | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    dragNodeRef.current = e.currentTarget as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4'
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1'
    setDragIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) return

    const newOrder = [...layerOrder]
    const [removed] = newOrder.splice(dragIndex, 1)
    newOrder.splice(dropIndex, 0, removed)
    onReorder(newOrder)

    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, layerOrder, onReorder])

  return (
    <div
      className="w-48 bg-[#111828] border border-[#3a4a6c] rounded-lg font-pixel select-none flex flex-col overflow-hidden"
      style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3a4a6c]">
        <span className="text-sm text-yellow-300 font-bold tracking-wide">☰ Layers</span>
        <span className="text-[12px] text-[#6b7fa0]">{layerOrder.length}</span>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent">
        {layerOrder.map((layer, index) => {
          const hidden = hiddenLayers.has(layer)
          const selected = selectedLayer === layer
          const asset = furniture[layer]
          const icon = LAYER_ICONS[layer] || '◻'
          const isDragOver = dragOverIndex === index && dragIndex !== index

          return (
            <div
              key={layer}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelectLayer(layer)}
              className={`
                flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-all border-l-2
                ${selected
                  ? 'border-l-yellow-500 bg-yellow-500/10'
                  : 'border-l-transparent hover:bg-[#0c1020]/60'
                }
                ${isDragOver ? 'border-t-2 border-t-yellow-400' : 'border-t border-t-transparent'}
                ${hidden ? 'opacity-40' : ''}
              `}
            >
              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(layer)
                }}
                title={hidden ? 'Show layer' : 'Hide layer'}
                className="w-5 h-5 flex items-center justify-center text-[13px] rounded hover:bg-[#3a4a6c]/50 transition-colors flex-shrink-0"
              >
                <span className={hidden ? 'text-[#6b7fa0]' : 'text-[#8b9dc3]'}>
                  {hidden ? '◻' : '◉'}
                </span>
              </button>

              {/* Thumbnail */}
              <div className="w-7 h-7 rounded border border-[#3a4a6c] bg-[#0c1020] overflow-hidden flex-shrink-0 flex items-center justify-center text-[13px]">
                {asset ? (
                  <img
                    src={thumbnailUrl(asset)}
                    alt={layer}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      const parent = img.parentElement
                      // --- AI-MODIFIED (2026-03-20) ---
                      // Purpose: Show fallback layer icon without innerHTML to prevent XSS if icon source ever changed
                      // --- Original code (commented out for rollback) ---
                      // img.style.display = 'none'
                      // img.parentElement!.innerHTML = `<span class="text-[13px]">${icon}</span>`
                      // --- End original code ---
                      if (parent) parent.textContent = icon
                      // --- END AI-MODIFIED ---
                    }}
                  />
                ) : (
                  <span className="text-[13px]">{icon}</span>
                )}
              </div>

              {/* Layer name */}
              <span className={`
                text-[13px] capitalize flex-1 truncate
                ${selected ? 'text-yellow-300' : 'text-[#e2e8f0]'}
              `}>
                {layer}
              </span>

              {/* Drag handle */}
              <span
                className="text-[13px] text-[#6b7fa0] hover:text-[#8b9dc3] cursor-grab active:cursor-grabbing flex-shrink-0"
                title="Drag to reorder"
              >
                ⠿
              </span>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#3a4a6c]" />

      {/* Lion entry (fixed at bottom, not draggable) */}
      <div
        onClick={() => onSelectLayer('lion')}
        className={`
          flex items-center gap-1.5 px-2 py-2 cursor-pointer transition-all border-l-2
          ${selectedLayer === 'lion'
            ? 'border-l-yellow-500 bg-yellow-500/10'
            : 'border-l-transparent hover:bg-[#0c1020]/60'
          }
        `}
      >
        <div className="w-5 h-5 flex items-center justify-center text-[13px] flex-shrink-0">
          <span className="text-[#8b9dc3]">◉</span>
        </div>

        <div className="w-7 h-7 rounded border border-[#3a4a6c] bg-[#0c1020] overflow-hidden flex-shrink-0 flex items-center justify-center">
          <span className="text-base">🦁</span>
        </div>

        <span className={`
          text-[13px] flex-1
          ${selectedLayer === 'lion' ? 'text-yellow-300' : 'text-[#e2e8f0]'}
        `}>
          Lion
        </span>

        <span className="text-sm text-[#6b7fa0] bg-[#0c1020] px-1 py-0.5 rounded border border-[#3a4a6c]">
          fixed
        </span>
      </div>
    </div>
  )
}
