// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Full item shop panel for browsing, purchasing, and
//          equipping room furniture across all slot categories
//          with preview, persistent ownership, and room-theme variants
// ============================================================

'use client'

import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { ROOM_LAYERS, type RoomLayer } from '@/utils/roomConstraints'
import { RARITY_COLORS, RARITY_BG_COLORS } from '@/utils/petAssets'

interface RoomInfo {
  roomId: number
  name: string
  assetPrefix: string
  hasFurniture: boolean
  goldPrice: number | null
  gemPrice: number | null
  owned: boolean
}

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
  rooms: RoomInfo[]
  activeRoomPrefix: string
  onPreviewItem: (slot: string, assetPath: string) => void
  onCancelPreview: (slot: string) => void
  onEquipItem: (slot: string, assetPath: string) => void
  onPurchaseItem: (itemId: number, slot: string, assetPath: string, price: number, currency: 'gold' | 'gems') => void
  onPurchaseRoom: (roomId: number) => Promise<boolean>
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

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Room-theme specific variants for all 18 room themes
// Each room has numbered variants for wall, floor, and mat/carpet
const ROOM_VARIANT_COUNTS: Record<string, Record<string, { prefix: string; count: number }>> = {
  'rooms/castle':     { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/library':    { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/aquarium':   { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/beach':      { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/cage':       { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/church':     { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/circus':     { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/graveyard':  { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/hospital':   { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/river':      { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/savannah':   { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/school':     { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/volcano':    { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
  'rooms/zoo':        { wall: { prefix: 'wall', count: 5 }, floor: { prefix: 'floor', count: 5 }, mat: { prefix: 'carpet', count: 5 } },
}

const ROOMS_WITHOUT_ASSETS = new Set(['rooms/cave', 'rooms/futuristic', 'rooms/moon'])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Normalize furniture asset paths for the room canvas.
// Items in lg_items have two path formats:
//   - Full paths like "rooms/default/lamp_purple.png" → use as-is
//   - Raw filenames like "plants_01.png" → these only exist at rooms/furniture/ on the CDN
function buildItemUrl(assetPath: string): string {
  if (assetPath.startsWith('rooms/')) {
    return `${BLOB_BASE}/pet-assets/${assetPath}`
  }
  return `${BLOB_BASE}/pet-assets/rooms/furniture/${assetPath}`
}

function normalizeForRoom(assetPath: string): string {
  if (assetPath.startsWith('rooms/')) return assetPath
  return `rooms/furniture/${assetPath}`
}
// --- END AI-MODIFIED ---

function formatGold(gold: string): string {
  const num = parseInt(gold, 10)
  if (isNaN(num)) return gold
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

interface RoomVariantItem {
  id: string
  name: string
  assetPath: string
  roomName: string
  roomOwned: boolean
  gemPrice: number | null
}

type ShopItem = {
  itemId: number
  name: string
  assetPath: string
  goldPrice: number | null
  gemPrice: number | null
  rarity: string
  owned: boolean
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Extracted item tile rendering into a reusable component for sets and non-sets
function ItemTile({
  item,
  equippedPath,
  previewingItem,
  onPreview,
  onApply,
  onBuyClick,
}: {
  item: ShopItem
  equippedPath: string
  previewingItem: string | null
  onPreview: (assetPath: string, key: string) => void
  onApply: (assetPath: string) => void
  onBuyClick: (item: ShopItem) => void
}) {
  const normalized = normalizeForRoom(item.assetPath)
  const isEquipped = equippedPath === normalized || equippedPath === item.assetPath
  const isOwned = item.owned
  const isPreviewing = previewingItem === `item-${item.itemId}`

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Bumped tile size from 56px to 64px, increased text sizes for readability
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => onPreview(item.assetPath, `item-${item.itemId}`)}
        onDoubleClick={() => isOwned ? onApply(item.assetPath) : onBuyClick(item)}
        title={`${item.name}${isEquipped ? ' (equipped)' : isOwned ? ' (owned - double-click to equip)' : ' (click to preview)'}`}
        className={`
          relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all
          ${isPreviewing
            ? 'border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] scale-105'
            : isEquipped
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
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {isEquipped && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] leading-none px-0.5 py-px rounded-bl">✓</div>
        )}
        {isOwned && !isEquipped && (
          <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] leading-none px-0.5 py-px rounded-bl">✓</div>
        )}
        {!isOwned && (
          <div className="absolute bottom-0 inset-x-0 flex justify-center bg-black/70 py-0.5">
            {item.goldPrice != null ? (
              <span className="text-xs text-yellow-400 leading-none">🪙{item.goldPrice}</span>
            ) : item.gemPrice != null ? (
              <span className="text-xs text-cyan-300 leading-none">💎{item.gemPrice}</span>
            ) : null}
          </div>
        )}
        <div className={`absolute top-0 left-0 w-2 h-2 rounded-full m-0.5 ${(RARITY_COLORS[item.rarity] || 'text-gray-400').replace('text-', 'bg-')}`} />
      </button>
      {isPreviewing && (
        <div className="flex gap-0.5">
          {isOwned ? (
            <button
              onClick={() => onApply(item.assetPath)}
              className="text-[11px] px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
            >
              Apply
            </button>
          ) : (
            <button
              onClick={() => onBuyClick(item)}
              className="text-[11px] px-2 py-0.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
            >
              Buy
            </button>
          )}
        </div>
      )}
    </div>
  )
  // --- END AI-MODIFIED ---
}
// --- END AI-MODIFIED ---

export default function FurniturePanel({
  activeTab,
  setActiveTab,
  furniture,
  availableItems,
  gold,
  gems,
  rooms,
  activeRoomPrefix,
  onPreviewItem,
  onCancelPreview,
  onEquipItem,
  onPurchaseItem,
  onPurchaseRoom,
}: FurniturePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [previewingItem, setPreviewingItem] = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<{
    itemId: number
    name: string
    assetPath: string
    price: number
    currency: 'gold' | 'gems'
  } | null>(null)
  const [confirmRoom, setConfirmRoom] = useState<RoomInfo | null>(null)
  const [buyingRoom, setBuyingRoom] = useState(false)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
    setConfirmItem(null)
    setConfirmRoom(null)
    setPreviewingItem(null)
  }, [activeTab])

  const filteredItems = useMemo(() => {
    const layer = activeTab as RoomLayer
    const keywords = SLOT_FILTERS[layer] || []
    return availableItems.filter((item) => {
      const lower = item.assetPath.toLowerCase()
      return keywords.some((kw) => lower.includes(kw))
    })
  }, [activeTab, availableItems])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Group set items (those with "(Style N)" in name) by base name,
  // and keep non-set items separate for standard display
  const { setGroups, nonSetItems } = useMemo(() => {
    const sets = new Map<string, typeof filteredItems>()
    const singles: typeof filteredItems = []
    for (const item of filteredItems) {
      const match = item.name.match(/^(.+?)\s*\(Style\s*\d+\)$/i)
      if (match) {
        const baseName = match[1].trim()
        const list = sets.get(baseName) || []
        list.push(item)
        sets.set(baseName, list)
      } else {
        singles.push(item)
      }
    }
    return {
      setGroups: Array.from(sets.entries()).map(([name, items]) => ({ name, items })),
      nonSetItems: singles,
    }
  }, [filteredItems])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Generate room-theme variants for slots like wall/floor/mat
  const roomVariants = useMemo((): RoomVariantItem[] => {
    const layer = activeTab as RoomLayer
    if (!['wall', 'floor', 'mat'].includes(layer)) return []

    const variants: RoomVariantItem[] = []
    for (const room of rooms) {
      const prefix = room.assetPrefix
      const config = ROOM_VARIANT_COUNTS[prefix]
      if (!config || !config[layer]) continue
      if (prefix === 'rooms/default') continue

      const { prefix: filePrefix, count } = config[layer]
      for (let i = 1; i <= count; i++) {
        const assetPath = `${prefix}/${filePrefix}_${i}.png`
        variants.push({
          id: `${prefix}-${layer}-${i}`,
          name: `${room.name} ${layer} ${i}`,
          assetPath,
          roomName: room.name,
          roomOwned: room.owned,
          gemPrice: room.gemPrice,
        })
      }
    }
    return variants
  }, [activeTab, rooms])
  // --- END AI-MODIFIED ---

  const equippedPath = furniture[activeTab] || ''

  const handlePreview = useCallback((assetPath: string, itemKey: string) => {
    const normalized = normalizeForRoom(assetPath)
    if (previewingItem === itemKey) {
      setPreviewingItem(null)
      onCancelPreview(activeTab)
    } else {
      setPreviewingItem(itemKey)
      onPreviewItem(activeTab, normalized)
    }
  }, [activeTab, previewingItem, onPreviewItem, onCancelPreview])

  function handleApply(assetPath: string) {
    const normalized = normalizeForRoom(assetPath)
    onEquipItem(activeTab, normalized)
    setPreviewingItem(null)
    setConfirmItem(null)
  }

  function handleBuyClick(item: typeof availableItems[0]) {
    if (item.owned) {
      handleApply(item.assetPath)
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
    const normalized = normalizeForRoom(confirmItem.assetPath)
    onPurchaseItem(confirmItem.itemId, activeTab, normalized, confirmItem.price, confirmItem.currency)
    setConfirmItem(null)
    setPreviewingItem(null)
  }

  async function handleConfirmRoomPurchase() {
    if (!confirmRoom || buyingRoom) return
    setBuyingRoom(true)
    try {
      const ok = await onPurchaseRoom(confirmRoom.roomId)
      if (ok) setConfirmRoom(null)
    } finally {
      setBuyingRoom(false)
    }
  }

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Filter purchasable rooms (exclude default/free, rooms without CDN assets)
  const purchasableRooms = useMemo(() => {
    return rooms.filter(r =>
      r.assetPrefix !== 'rooms/default' &&
      !ROOMS_WITHOUT_ASSETS.has(r.assetPrefix) &&
      (r.goldPrice != null || r.gemPrice != null)
    )
  }, [rooms])

  return (
    <div className="bg-[#0c1020] font-pixel select-none flex flex-col">
      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Bumped header text sizes for readability */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-base text-[#e2e8f0] tracking-wide uppercase">Shop</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-yellow-400">
            <span>🪙</span>
            <span>{formatGold(gold)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-cyan-300">
            <span>💎</span>
            <span>{gems.toLocaleString()}</span>
          </span>
        </div>
      </div>
      {/* --- END AI-MODIFIED --- */}

      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Added Rooms as first tab for quick access to room themes, bumped tab text sizes */}
      <div className="flex items-center gap-0.5 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#3a4a6c]">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`
            flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-t whitespace-nowrap transition-all
            ${activeTab === 'rooms'
              ? 'bg-[#1a2340] border border-b-0 border-[#3a4a6c] text-yellow-300'
              : 'text-[#6b7fa0] hover:text-[#e2e8f0] hover:bg-[#1a2340]/50'
            }
          `}
        >
          <span>🏠</span>
          <span>Rooms</span>
          <span className="text-xs opacity-60">({purchasableRooms.length})</span>
        </button>
        {ROOM_LAYERS.map((layer) => {
          const count = availableItems.filter((item) => {
            const lower = item.assetPath.toLowerCase()
            return (SLOT_FILTERS[layer] || []).some((kw) => lower.includes(kw))
          }).length
          const variantCount = ['wall', 'floor', 'mat'].includes(layer)
            ? rooms.filter(r => r.assetPrefix !== 'rooms/default' && ROOM_VARIANT_COUNTS[r.assetPrefix]?.[layer]).reduce((sum, r) => sum + (ROOM_VARIANT_COUNTS[r.assetPrefix]?.[layer]?.count ?? 0), 0)
            : 0
          const total = count + variantCount
          return (
            <button
              key={layer}
              onClick={() => setActiveTab(layer)}
              className={`
                flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-t whitespace-nowrap transition-all
                ${activeTab === layer
                  ? 'bg-[#1a2340] border border-b-0 border-[#3a4a6c] text-yellow-300'
                  : 'text-[#6b7fa0] hover:text-[#e2e8f0] hover:bg-[#1a2340]/50'
                }
              `}
            >
              <span>{TAB_ICONS[layer]}</span>
              <span className="capitalize">{layer}</span>
              <span className="text-xs opacity-60">({total})</span>
            </button>
          )
        })}
      </div>
      {/* --- END AI-MODIFIED --- */}

      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Bumped text sizes in preview and confirmation bars */}
      {previewingItem && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2340] border-y border-[#4060c0] text-sm">
          <span className="text-[#93c5fd]">👁 Previewing</span>
          <div className="flex-1" />
          <button
            onClick={() => {
              setPreviewingItem(null)
              onCancelPreview(activeTab)
            }}
            className="px-2 py-0.5 bg-[#3a4a6c] hover:bg-[#5a6a8c] text-[#e2e8f0] rounded text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {confirmItem && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2340] border-y border-[#3a4a6c] text-sm">
          <span className="text-[#e2e8f0]">
            Buy <span className="text-yellow-300">{confirmItem.name}</span> for{' '}
            <span className={confirmItem.currency === 'gold' ? 'text-yellow-400' : 'text-cyan-300'}>
              {confirmItem.price.toLocaleString()} {confirmItem.currency === 'gold' ? '🪙' : '💎'}
            </span>
            ?
          </span>
          <button
            onClick={handleConfirmPurchase}
            className="px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors"
          >
            Buy
          </button>
          <button
            onClick={() => setConfirmItem(null)}
            className="px-2 py-0.5 bg-[#3a4a6c] hover:bg-[#5a6a8c] text-[#e2e8f0] rounded text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {confirmRoom && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2340] border-y border-[#4a60a0] text-sm">
          <span className="text-[#e2e8f0]">
            Unlock <span className="text-yellow-300">{confirmRoom.name}</span> room for{' '}
            <span className={confirmRoom.goldPrice ? 'text-yellow-400' : 'text-cyan-300'}>
              {(confirmRoom.goldPrice ?? confirmRoom.gemPrice ?? 0).toLocaleString()} {confirmRoom.goldPrice ? '🪙' : '💎'}
            </span>
            ?
          </span>
          <button
            onClick={handleConfirmRoomPurchase}
            disabled={buyingRoom}
            className="px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors disabled:opacity-50"
          >
            {buyingRoom ? '...' : 'Unlock'}
          </button>
          <button
            onClick={() => setConfirmRoom(null)}
            disabled={buyingRoom}
            className="px-2 py-0.5 bg-[#3a4a6c] hover:bg-[#5a6a8c] text-[#e2e8f0] rounded text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {/* --- END AI-MODIFIED --- */}

      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Rooms tab shows room themes as primary content; item tabs show furniture.
         Removed room themes from bottom of scroll area (now in dedicated Rooms tab).
         Bumped all text/tile/grid sizes for readability. */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-2 px-3 py-2 scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent"
      >
        {activeTab === 'rooms' ? (
          <>
            <p className="text-xs text-[#7a8a9a] tracking-widest uppercase mb-1">Room Themes</p>
            {purchasableRooms.length > 0 ? (
              {/* --- AI-MODIFIED (2026-03-21) --- */}
              {/* Purpose: Better mobile density -- 1 col on mobile (sidebar stacks), 2 on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* --- END AI-MODIFIED --- */}
                {purchasableRooms.map((room) => {
                  const isActive = room.assetPrefix === activeRoomPrefix
                  const previewUrl = `${BLOB_BASE}/pet-assets/${room.assetPrefix}/wall_1.png`
                  return (
                    <div
                      key={room.roomId}
                      className={`
                        relative rounded-lg border-2 p-2 transition-all
                        ${isActive
                          ? 'border-yellow-500 bg-[#1a2340]'
                          : room.owned
                            ? 'border-green-500/50 bg-[#0a1020] hover:border-green-400'
                            : 'border-[#2a3a5c] bg-[#0a1020] hover:border-[#4a5a7c]'
                        }
                      `}
                    >
                      <div className="w-full h-20 rounded overflow-hidden mb-1.5 bg-[#060810]">
                        <img
                          src={previewUrl}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm text-[#c8d4e8] truncate">{room.name}</span>
                        {room.owned ? (
                          <span className="text-xs text-green-400 whitespace-nowrap">OWNED</span>
                        ) : (
                          <button
                            onClick={() => setConfirmRoom(room)}
                            className="text-xs px-2 py-1 bg-[#2a3a5c] hover:bg-[#4a5a7c] text-cyan-300 rounded whitespace-nowrap transition-colors"
                          >
                            {room.goldPrice
                              ? `🪙 ${room.goldPrice.toLocaleString()}`
                              : `💎 ${(room.gemPrice ?? 0).toLocaleString()}`
                            }
                          </button>
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded-bl leading-none font-bold">
                          ACTIVE
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-[#6b7fa0] italic py-2 w-full text-center">
                No room themes available.
              </p>
            )}
          </>
        ) : (
          <>
            {nonSetItems.length > 0 && (
              <div>
                <p className="text-xs text-[#7a8a9a] tracking-widest uppercase mb-1">Default Styles</p>
                <div className="flex flex-wrap gap-2">
                  {nonSetItems.map((item) => (
                    <ItemTile
                      key={item.itemId}
                      item={item}
                      equippedPath={equippedPath}
                      previewingItem={previewingItem}
                      onPreview={handlePreview}
                      onApply={handleApply}
                      onBuyClick={handleBuyClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {setGroups.length > 0 && (
              <div>
                <p className="text-xs text-[#7a8a9a] tracking-widest uppercase mb-1">Premium Sets</p>
                <div className="flex flex-col gap-2">
                  {setGroups.map(({ name, items }) => (
                    <div key={name}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#8899aa]">{name}</span>
                        <span className="text-[11px] text-[#5a6a80]">({items.length} styles)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <ItemTile
                            key={item.itemId}
                            item={item}
                            equippedPath={equippedPath}
                            previewingItem={previewingItem}
                            onPreview={handlePreview}
                            onApply={handleApply}
                            onBuyClick={handleBuyClick}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roomVariants.length > 0 && (() => {
              const byRoom = new Map<string, RoomVariantItem[]>()
              for (const v of roomVariants) {
                const list = byRoom.get(v.roomName) || []
                list.push(v)
                byRoom.set(v.roomName, list)
              }
              return Array.from(byRoom.entries()).map(([roomName, variants]) => {
                const firstVariant = variants[0]
                const isOwned = firstVariant.roomOwned
                const gemPrice = firstVariant.gemPrice
                return (
                  <div key={roomName}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-[#7a8a9a] tracking-widest uppercase">{roomName}</p>
                      {isOwned ? (
                        <span className="text-[11px] text-green-400 border border-green-500/30 px-1 rounded">OWNED</span>
                      ) : gemPrice ? (
                        <span className="text-[11px] text-cyan-300 border border-cyan-500/30 px-1 rounded">💎 {gemPrice} (room)</span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isEquipped = equippedPath === v.assetPath
                        const isPreviewing = previewingItem === v.id
                        const canUse = isOwned
                        return (
                          <div key={v.id} className="flex flex-col items-center gap-0.5">
                            <button
                              onClick={() => handlePreview(v.assetPath, v.id)}
                              onDoubleClick={() => canUse ? handleApply(v.assetPath) : undefined}
                              title={`${v.name}${isEquipped ? ' (equipped)' : canUse ? ' (click to preview)' : ' (requires room purchase)'}`}
                              className={`
                                relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all
                                ${isPreviewing
                                  ? 'border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] scale-105'
                                  : isEquipped
                                    ? 'border-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                                    : canUse
                                      ? 'border-green-500/70 hover:border-green-400 hover:scale-105'
                                      : 'border-[#3a4a6c] hover:border-[#5a6a8c] hover:scale-105 brightness-50 hover:brightness-75'
                                }
                              `}
                            >
                              <img
                                src={`${BLOB_BASE}/pet-assets/${v.assetPath}`}
                                alt={v.name}
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              {isEquipped && (
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] leading-none px-0.5 py-px rounded-bl">✓</div>
                              )}
                              {!canUse && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <span className="text-xs text-cyan-300">🔒</span>
                                </div>
                              )}
                            </button>
                            {isPreviewing && canUse && (
                              <button
                                onClick={() => handleApply(v.assetPath)}
                                className="text-[11px] px-2 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}

            {filteredItems.length === 0 && roomVariants.length === 0 && (
              <p className="text-sm text-[#6b7fa0] italic py-2 w-full text-center">
                No items available for this slot.
              </p>
            )}
          </>
        )}
      </div>
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}
