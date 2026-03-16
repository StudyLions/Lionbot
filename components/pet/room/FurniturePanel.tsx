// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Full item shop panel for browsing, purchasing, and
//          equipping room furniture across all slot categories
// ============================================================

'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { ROOM_LAYERS, type RoomLayer } from '@/utils/roomConstraints'
import { RARITY_COLORS, RARITY_BG_COLORS } from '@/utils/petAssets'

interface FurniturePanelProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  furniture: Record<string, string>
  availableItems: Array<{
    itemId: number
    name: string
    assetPath: string
    goldPrice: number | null
    gemPrice: number | null
    rarity: string
    owned: boolean
  }>
  gold: string
  gems: number
  onEquipItem: (slot: string, assetPath: string) => void
  onPurchaseItem: (itemId: number, slot: string, assetPath: string, price: number, currency: 'gold' | 'gems') => void
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

const SLOT_FILTERS: Record<RoomLayer, string[]> = {
  wall:    ['wall'],
  floor:   ['floor'],
  mat:     ['mat', 'carpet'],
  table:   ['table', 'desk', 'bench-table', 'teatable', 'computer-desk', 'drums', 'guitar', 'saxaphone'],
  chair:   ['chair', 'stool', 'benchchair'],
  bed:     ['bed', 'queensize', 'royalbed', 'bunk', 'cuved'],
  lamp:    ['lamp', 'plants', 'potplant'],
  picture: ['picture'],
  window:  ['window'],
}

function buildItemUrl(assetPath: string): string {
  if (assetPath.startsWith('rooms/')) {
    return `${BLOB_BASE}/pet-assets/${assetPath}`
  }
  return `${BLOB_BASE}/pet-assets/rooms/furniture/${assetPath}`
}

function formatGold(gold: string): string {
  const num = parseInt(gold, 10)
  if (isNaN(num)) return gold
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export default function FurniturePanel({
  activeTab,
  setActiveTab,
  furniture,
  availableItems,
  gold,
  gems,
  onEquipItem,
  onPurchaseItem,
}: FurniturePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [confirmItem, setConfirmItem] = useState<{
    itemId: number
    name: string
    assetPath: string
    price: number
    currency: 'gold' | 'gems'
  } | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
    setConfirmItem(null)
  }, [activeTab])

  const filteredItems = useMemo(() => {
    const layer = activeTab as RoomLayer
    const keywords = SLOT_FILTERS[layer] || []
    return availableItems.filter((item) => {
      const lower = item.assetPath.toLowerCase()
      return keywords.some((kw) => lower.includes(kw))
    })
  }, [activeTab, availableItems])

  const equippedPath = furniture[activeTab] || ''

  function handleItemClick(item: typeof availableItems[0]) {
    if (item.owned) {
      onEquipItem(activeTab, item.assetPath)
      return
    }
    const price = item.goldPrice ?? item.gemPrice
    const currency: 'gold' | 'gems' = item.goldPrice != null ? 'gold' : 'gems'
    if (price == null) return
    setConfirmItem({
      itemId: item.itemId,
      name: item.name,
      assetPath: item.assetPath,
      price,
      currency,
    })
  }

  function handleConfirmPurchase() {
    if (!confirmItem) return
    onPurchaseItem(confirmItem.itemId, activeTab, confirmItem.assetPath, confirmItem.price, confirmItem.currency)
    setConfirmItem(null)
  }

  return (
    <div className="bg-[#0c1020] border-t border-[#3a4a6c] font-pixel select-none flex flex-col">
      {/* Header: currency bar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-sm text-[#e2e8f0] tracking-wide uppercase">Shop</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-yellow-400">
            <span>🪙</span>
            <span>{formatGold(gold)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-cyan-300">
            <span>💎</span>
            <span>{gems.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3a4a6c]">
        {ROOM_LAYERS.map((layer) => {
          const count = availableItems.filter((item) => {
            const lower = item.assetPath.toLowerCase()
            return (SLOT_FILTERS[layer] || []).some((kw) => lower.includes(kw))
          }).length
          return (
            <button
              key={layer}
              onClick={() => setActiveTab(layer)}
              className={`
                flex items-center gap-1 px-2 py-1 text-[13px] rounded-t whitespace-nowrap transition-all
                ${activeTab === layer
                  ? 'bg-[#1a2340] border border-b-0 border-[#3a4a6c] text-yellow-300'
                  : 'text-[#6b7fa0] hover:text-[#e2e8f0] hover:bg-[#1a2340]/50'
                }
              `}
            >
              <span>{TAB_ICONS[layer]}</span>
              <span className="capitalize">{layer}</span>
              <span className="text-[11px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Purchase confirmation bar */}
      {confirmItem && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2340] border-y border-[#3a4a6c] text-[13px]">
          <span className="text-[#e2e8f0]">
            Buy <span className="text-yellow-300">{confirmItem.name}</span> for{' '}
            <span className={confirmItem.currency === 'gold' ? 'text-yellow-400' : 'text-cyan-300'}>
              {confirmItem.price.toLocaleString()} {confirmItem.currency === 'gold' ? '🪙' : '💎'}
            </span>
            ?
          </span>
          <button
            onClick={handleConfirmPurchase}
            className="px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded text-[10px] transition-colors"
          >
            Buy
          </button>
          <button
            onClick={() => setConfirmItem(null)}
            className="px-2 py-0.5 bg-[#3a4a6c] hover:bg-[#5a6a8c] text-[#e2e8f0] rounded text-[13px] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Item grid */}
      <div
        ref={scrollRef}
        className="flex flex-wrap gap-1.5 px-3 py-2 overflow-y-auto max-h-[180px] scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent"
      >
        {filteredItems.map((item) => {
          const isEquipped = equippedPath === item.assetPath
          const isOwned = item.owned
          const rarityColor = RARITY_COLORS[item.rarity] || 'text-gray-400'
          const rarityBg = RARITY_BG_COLORS[item.rarity] || ''

          return (
            <button
              key={item.itemId}
              onClick={() => handleItemClick(item)}
              title={`${item.name}${isEquipped ? ' (equipped)' : isOwned ? ' (owned)' : ''}`}
              className={`
                relative flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all
                ${isEquipped
                  ? 'border-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                  : isOwned
                    ? 'border-green-500/70 hover:border-green-400 hover:scale-105'
                    : 'border-[#3a4a6c] hover:border-[#5a6a8c] hover:scale-105 brightness-75 hover:brightness-100'
                }
              `}
            >
              <img
                src={buildItemUrl(item.assetPath)}
                alt={item.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />

              {/* Equipped checkmark */}
              {isEquipped && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[7px] leading-none px-0.5 py-px rounded-bl">
                  ✓
                </div>
              )}

              {/* Price badge for unowned items */}
              {!isOwned && (
                <div className="absolute bottom-0 inset-x-0 flex justify-center bg-black/70 py-px">
                  {item.goldPrice != null ? (
                    <span className="text-[10px] text-yellow-400 leading-none">
                      🪙{item.goldPrice}
                    </span>
                  ) : item.gemPrice != null ? (
                    <span className="text-[7px] text-cyan-300 leading-none">
                      💎{item.gemPrice}
                    </span>
                  ) : null}
                </div>
              )}

              {/* Rarity dot */}
              <div className={`absolute top-0 left-0 w-1.5 h-1.5 rounded-full m-0.5 ${rarityColor.replace('text-', 'bg-')}`} />
            </button>
          )
        })}

        {filteredItems.length === 0 && (
          <p className="text-sm text-[#6b7fa0] italic py-2 w-full text-center">
            No items available for this slot.
          </p>
        )}
      </div>
    </div>
  )
}
