// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Dropdown panel for try-before-buy cart, showing items
//          with prices, totals, and checkout actions
// ============================================================

'use client'

import { useMemo, useEffect, useRef } from 'react'

interface CartItem {
  slot: string
  assetPath: string
  name: string
  price: number
  currency: 'gold' | 'gems'
}

interface CartDropdownProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (index: number) => void
  onCheckout: () => void
  isCheckingOut: boolean
}

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''

const CURRENCY_ICONS: Record<string, string> = {
  gold: '🪙',
  gems: '💎',
}

function thumbnailUrl(assetPath: string): string {
  return `${BLOB_BASE}/pet-assets/${assetPath}`
}

function detectSetDiscount(items: CartItem[]): { isSet: boolean; discount: number; themeName: string } {
  if (items.length < 2) return { isSet: false, discount: 0, themeName: '' }

  const prefixes = items.map((item) => {
    const parts = item.assetPath.split('/')
    return parts.length >= 2 ? parts.slice(0, -1).join('/') : ''
  })

  const allSameTheme = prefixes.every((p) => p === prefixes[0] && p !== '')
  if (!allSameTheme) return { isSet: false, discount: 0, themeName: '' }

  const themeName = prefixes[0].split('/').pop() || 'Room'
  const discount = 0.15
  return { isSet: true, discount, themeName }
}

export default function CartDropdown({
  open,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
  isCheckingOut,
}: CartDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  const goldTotal = useMemo(
    () => items.filter((i) => i.currency === 'gold').reduce((sum, i) => sum + i.price, 0),
    [items],
  )
  const gemTotal = useMemo(
    () => items.filter((i) => i.currency === 'gems').reduce((sum, i) => sum + i.price, 0),
    [items],
  )

  const setInfo = useMemo(() => detectSetDiscount(items), [items])

  if (!open) return null

  return (
    <div
      ref={dropdownRef}
      {/* --- AI-MODIFIED (2026-03-21) --- */}
      {/* Purpose: Clamp dropdown width to viewport so it doesn't overflow left edge */}
      className="absolute top-full right-0 mt-1 w-64 max-w-[calc(100vw-2rem)] z-50 font-pixel"
      {/* --- END AI-MODIFIED --- */}
      style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}
    >
      <div className="bg-[#0c1020] border-2 border-[#3a4a6c] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#3a4a6c]">
          <span className="text-sm text-yellow-300 font-bold">🛒 Cart</span>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="text-[12px] text-[#6b7fa0]">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-[#6b7fa0] hover:text-[#e2e8f0] text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items or empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <span className="text-2xl mb-2 opacity-40">🛒</span>
            <span className="text-sm text-[#6b7fa0] text-center">
              Your cart is empty
            </span>
            <span className="text-[12px] text-[#4a5a7c] mt-1 text-center">
              Try items in the editor, then add to cart
            </span>
          </div>
        ) : (
          <>
            {/* Scrollable item list */}
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent" style={{ maxHeight: 200 }}>
              {items.map((item, index) => (
                <div
                  key={`${item.slot}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2340] hover:bg-[#111828]/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-8 h-8 rounded border border-[#3a4a6c] bg-[#111828] overflow-hidden flex-shrink-0">
                    <img
                      src={thumbnailUrl(item.assetPath)}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>

                  {/* Name & slot */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#e2e8f0] truncate">{item.name}</div>
                    <div className="text-[11px] text-[#6b7fa0] capitalize">{item.slot}</div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-0.5 text-[10px] text-[#8b9dc3] flex-shrink-0">
                    <span>{CURRENCY_ICONS[item.currency]}</span>
                    <span className="tabular-nums">{item.price.toLocaleString()}</span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveItem(index)}
                    title="Remove from cart"
                    className="w-5 h-5 flex items-center justify-center text-[13px] text-[#6b7fa0] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-3 py-2 border-t border-[#3a4a6c] space-y-1">
              {goldTotal > 0 && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6b7fa0]">Gold total:</span>
                  <span className="text-[#e2e8f0] tabular-nums">
                    🪙 {goldTotal.toLocaleString()}
                  </span>
                </div>
              )}
              {gemTotal > 0 && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6b7fa0]">Gem total:</span>
                  <span className="text-[#e2e8f0] tabular-nums">
                    💎 {gemTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Set discount */}
              {setInfo.isSet && (
                <div className="flex items-center justify-between text-[13px] pt-1 border-t border-[#1a2340]">
                  <span className="text-green-400">
                    ✨ {setInfo.themeName} set −{Math.round(setInfo.discount * 100)}%
                  </span>
                  <span className="text-green-400 tabular-nums">
                    {goldTotal > 0 && `🪙 ${Math.floor(goldTotal * (1 - setInfo.discount)).toLocaleString()}`}
                    {goldTotal > 0 && gemTotal > 0 && ' + '}
                    {gemTotal > 0 && `💎 ${Math.floor(gemTotal * (1 - setInfo.discount)).toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-3 py-2 border-t border-[#3a4a6c] space-y-1.5">
              <button
                onClick={onCheckout}
                disabled={isCheckingOut}
                className="w-full py-1.5 text-sm rounded border-2 border-yellow-500 bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
              >
                {isCheckingOut ? (
                  <span className="animate-spin inline-block">⟳</span>
                ) : (
                  'Buy All'
                )}
              </button>

              {setInfo.isSet && !isCheckingOut && (
                <button
                  onClick={onCheckout}
                  className="w-full py-1.5 text-[13px] rounded border border-green-500/60 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                >
                  ✨ Buy as {setInfo.themeName} Set (−{Math.round(setInfo.discount * 100)}%)
                </button>
              )}
            </div>
          </>
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
