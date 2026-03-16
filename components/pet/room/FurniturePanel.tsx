// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Bottom panel with tabbed furniture selector for each
//          room layer slot (wall, floor, mat, table, etc.)
// ============================================================

'use client'

import { useMemo, useRef, useEffect } from 'react'
import { ROOM_LAYERS, type RoomLayer } from '@/utils/roomConstraints'

interface FurniturePanelProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  roomPrefix: string
  furniture: Record<string, string>
  onSelectItem: (slot: string, assetPath: string) => void
  rooms: Array<{
    roomId: number
    name: string
    assetPrefix: string
    owned: boolean
    gemPrice: number | null
  }>
}

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''

const TAB_ICONS: Record<RoomLayer, string> = {
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

const DEFAULT_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'black']
const PREMIUM_VARIANT_COUNT = 5

function buildItemUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

export default function FurniturePanel({
  activeTab,
  setActiveTab,
  roomPrefix,
  furniture,
  onSelectItem,
  rooms,
}: FurniturePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [activeTab])

  const currentRoom = useMemo(
    () => rooms.find((r) => r.assetPrefix === roomPrefix),
    [rooms, roomPrefix],
  )
  const isDefaultRoom = roomPrefix === 'default'

  const items = useMemo(() => {
    const layer = activeTab as RoomLayer
    const result: Array<{ assetPath: string; label: string; thumbnailUrl: string }> = []

    if (isDefaultRoom) {
      for (const color of DEFAULT_COLORS) {
        const path = `rooms/default/${layer}_${color}.png`
        result.push({
          assetPath: path,
          label: color,
          thumbnailUrl: buildItemUrl(path),
        })
      }
    } else {
      for (let i = 1; i <= PREMIUM_VARIANT_COUNT; i++) {
        const path = `rooms/${roomPrefix}/${layer}_${i}.png`
        result.push({
          assetPath: path,
          label: `Style ${i}`,
          thumbnailUrl: buildItemUrl(path),
        })
      }
    }

    return result
  }, [activeTab, roomPrefix, isDefaultRoom])

  const currentSelection = furniture[activeTab] || ''

  return (
    <div className="bg-[#111828] border-t border-[#3a4a6c] font-pixel select-none">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 pt-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3a4a6c]">
        {ROOM_LAYERS.map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveTab(layer)}
            className={`
              flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-t whitespace-nowrap transition-all
              ${activeTab === layer
                ? 'bg-[#1a2340] border border-b-0 border-[#3a4a6c] text-yellow-300'
                : 'text-[#6b7fa0] hover:text-[#e2e8f0] hover:bg-[#0c1020]/50'
              }
            `}
          >
            <span>{TAB_ICONS[layer]}</span>
            <span className="capitalize">{layer}</span>
          </button>
        ))}
      </div>

      {/* Item row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent"
      >
        {items.map((item) => {
          const selected = currentSelection === item.assetPath
          return (
            <button
              key={item.assetPath}
              onClick={() => onSelectItem(activeTab, item.assetPath)}
              title={item.label}
              className={`
                relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all
                ${selected
                  ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] scale-105'
                  : 'border-[#3a4a6c] hover:border-[#5a6a8c] hover:scale-102'
                }
              `}
            >
              <img
                src={item.thumbnailUrl}
                alt={item.label}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              {selected && (
                <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
              )}
              <span className="absolute bottom-0 inset-x-0 text-[8px] text-center bg-black/60 text-[#e2e8f0] py-0.5 capitalize truncate">
                {item.label}
              </span>
            </button>
          )
        })}

        {items.length === 0 && (
          <p className="text-[11px] text-[#6b7fa0] italic py-2">
            No items available for this slot.
          </p>
        )}
      </div>

      {/* Room info */}
      {currentRoom && (
        <div className="flex items-center gap-2 px-3 pb-1.5 text-[10px] text-[#6b7fa0]">
          <span>Room: {currentRoom.name}</span>
          {!currentRoom.owned && currentRoom.gemPrice != null && (
            <span className="text-yellow-500">💎 {currentRoom.gemPrice} gems</span>
          )}
        </div>
      )}
    </div>
  )
}
