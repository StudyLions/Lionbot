// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Full-screen modal for browsing, previewing, and
//          switching between owned and premium room themes
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { getRoomLayerVariantUrl } from '@/utils/petAssets'

interface RoomBrowserProps {
  open: boolean
  onClose: () => void
  rooms: Array<{
    roomId: number
    name: string
    assetPrefix: string
    hasFurniture: boolean
    goldPrice: number | null
    gemPrice: number | null
    owned: boolean
  }>
  activeRoomId: number | null
  onSwitchRoom: (roomId: number) => void
  gems: number
  gold: string
}

export default function RoomBrowser({
  open,
  onClose,
  rooms,
  activeRoomId,
  onSwitchRoom,
  gems,
  gold,
}: RoomBrowserProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const ownedRooms = rooms.filter((r) => r.owned)
  const shopRooms = rooms.filter((r) => !r.owned)

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center font-pixel">
      {/* Backdrop */}
      <div
        // --- AI-MODIFIED (2026-03-24) ---
        // Purpose: Standardize pet modal overlay to bg-black/70
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        // --- END AI-MODIFIED ---
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className="relative w-full max-w-4xl mx-4 mt-8 mb-8 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#0c1020] border-2 border-[#3a4a6c] rounded-lg shadow-2xl scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent"
        style={{
          boxShadow: '8px 8px 0 rgba(0,0,0,0.6), inset 1px 1px 0 rgba(58,74,108,0.3)',
        }}
      >
        {/* Pixel corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500 z-10" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500 z-10" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500 z-10 sticky" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500 z-10 sticky" />

        {/* Header */}
        {/* --- AI-MODIFIED (2026-03-21) --- */}
        {/* Purpose: Add flex-wrap + gap for mobile header layout */}
        <div className="sticky top-0 z-10 flex items-center justify-between flex-wrap gap-2 px-4 sm:px-5 py-4 bg-[#0c1020] border-b border-[#3a4a6c]">
        {/* --- END AI-MODIFIED --- */}
          <div>
            <h2 className="text-base text-yellow-300">Browse Rooms</h2>
            <p className="text-[13px] text-[#6b7fa0] mt-0.5">
              Switch between your rooms or preview premium themes
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Currency display */}
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-yellow-400">💰 {gold}</span>
              <span className="text-cyan-400">💎 {gems}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#3a4a6c] bg-[#111828] text-[#8b9dc3] hover:text-red-400 hover:border-red-400/50 transition-all text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Owned rooms section */}
          {ownedRooms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-[#e2e8f0] mb-3 flex items-center gap-1.5">
                <span>🏠</span>
                <span>Your Rooms</span>
                <span className="text-[12px] text-[#6b7fa0]">({ownedRooms.length})</span>
              </h3>
              {/* --- AI-MODIFIED (2026-03-21) --- */}
              {/* Purpose: Fix reversed breakpoints -- mobile-first 1 col, scale up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* --- END AI-MODIFIED --- */}
                {ownedRooms.map((room) => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    isActive={room.roomId === activeRoomId}
                    onSwitch={() => onSwitchRoom(room.roomId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shop rooms section */}
          {shopRooms.length > 0 && (
            <div>
              <h3 className="text-sm text-[#e2e8f0] mb-3 flex items-center gap-1.5">
                <span>🛍️</span>
                <span>Room Shop</span>
                <span className="text-[12px] text-[#6b7fa0]">({shopRooms.length})</span>
              </h3>
              {/* --- AI-MODIFIED (2026-03-21) --- */}
              {/* Purpose: Fix reversed breakpoints -- mobile-first 1 col, scale up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* --- END AI-MODIFIED --- */}
                {shopRooms.map((room) => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    isActive={false}
                    onSwitch={() => {}}
                    isShop
                  />
                ))}
              </div>
            </div>
          )}

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">🏚️</div>
              <p className="text-sm text-[#6b7fa0]">No rooms available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RoomCard({
  room,
  isActive,
  onSwitch,
  isShop,
}: {
  room: RoomBrowserProps['rooms'][number]
  isActive: boolean
  onSwitch: () => void
  isShop?: boolean
}) {
  const previewUrl = getRoomLayerVariantUrl(room.assetPrefix, 'wall', 1)

  return (
    <button
      onClick={isShop ? undefined : onSwitch}
      className={`
        relative group text-left rounded-lg border-2 overflow-hidden transition-all
        ${isActive
          ? 'border-yellow-500 shadow-[0_0_16px_rgba(234,179,8,0.3)]'
          : isShop
            ? 'border-[#3a4a6c] hover:border-[#5a6a8c] cursor-default'
            : 'border-[#3a4a6c] hover:border-[#5a6a8c] active:border-[#5a6a8c] hover:shadow-[0_0_8px_rgba(58,74,108,0.3)]'
        }
      `}
    >
      {/* Preview image */}
      <div className="relative aspect-[16/10] bg-[#111828] overflow-hidden">
        <img
          src={previewUrl}
          alt={room.name}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
          }}
        />

        {/* Active glow overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-yellow-500/5 border-b-2 border-yellow-500/30" />
        )}

        {/* Owned green check */}
        {room.owned && !isActive && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-green-600/90 text-white text-[13px] shadow-md">
            ✓
          </div>
        )}

        {/* Active badge */}
        {isActive && (
          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-yellow-500/90 text-black text-[12px] rounded-full font-bold shadow-md">
            ACTIVE
          </div>
        )}

        {/* Price badge for shop items */}
        {isShop && room.gemPrice != null && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-2 py-0.5 bg-[#0c1020]/90 border border-cyan-500/40 text-cyan-300 text-[12px] rounded-full shadow-md">
            💎 {room.gemPrice}
          </div>
        )}
        {isShop && room.gemPrice == null && room.goldPrice != null && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-2 py-0.5 bg-[#0c1020]/90 border border-yellow-500/40 text-yellow-300 text-[12px] rounded-full shadow-md">
            💰 {room.goldPrice}
          </div>
        )}

        {/* Furniture indicator */}
        {room.hasFurniture && (
          <div className="absolute bottom-1.5 left-1.5 text-[12px] text-[#8b9dc3] bg-[#0c1020]/80 px-1.5 py-0.5 rounded">
            🪑 Furnished
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="px-3 py-2.5 bg-[#111828]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#e2e8f0] truncate">{room.name}</span>
          {isShop && (
            <span className="text-[12px] text-[#6b7fa0] hover:text-cyan-400 transition-colors flex-shrink-0 ml-2">
              Preview →
            </span>
          )}
          {room.owned && !isActive && (
            // --- AI-MODIFIED (2026-03-21) ---
            // Purpose: Add active: feedback for touch devices
            // --- END AI-MODIFIED ---
            <span className="text-[12px] text-green-400/80 group-hover:text-green-300 active:text-green-200 transition-colors flex-shrink-0 ml-2">
              Switch →
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
