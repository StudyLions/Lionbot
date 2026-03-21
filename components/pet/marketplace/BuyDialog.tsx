// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Buy confirmation dialog with quantity picker
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Two-column modal -- full item card with scroll trace on left,
//   price breakdown with avg price comparison on right
// --- Original code: see git history for pre-redesign version ---
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { ScrollText, ExternalLink } from "lucide-react"
import {
  GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS,
  calcGlowTier, calcGlowIntensity,
} from "@/utils/gameConstants"
import { cn } from "@/lib/utils"
import type { ScrollSlot } from "./ListingTooltip"
import Link from "next/link"

interface ListingData {
  listingId: number
  item: { id: number; name: string; category: string; rarity: string; assetPath: string; description?: string; slot?: string | null }
  enhancementLevel: number
  quantityRemaining: number
  pricePerUnit: number
  currency: string
  sellerName: string
  scrollData?: ScrollSlot[] | null
  totalBonus?: number
}

interface Props {
  listing: ListingData
  onClose: () => void
  onConfirm: (listingId: number, quantity: number) => Promise<void>
}

const RARITY_TEXT: Record<string, string> = {
  COMMON: "#8899aa", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ff90a0",
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

const BONUS_COLOR_THRESHOLDS: [number, string][] = [
  [3.0, "text-purple-400"], [2.0, "text-cyan-300"],
  [1.5, "text-yellow-400"], [1.0, "text-green-400"], [0, "text-gray-400"],
]
function getBonusColor(v: number): string {
  for (const [t, c] of BONUS_COLOR_THRESHOLDS) { if (v >= t) return c }
  return "text-gray-400"
}

const MARKETPLACE_FEE_PERCENT = 5

export default function BuyDialog({ listing, onClose, onConfirm }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalPrice = listing.pricePerUnit * quantity
  const imgUrl = getItemImageUrl(listing.item.assetPath, listing.item.category)
  const nameColor = RARITY_TEXT[listing.item.rarity] || RARITY_TEXT.COMMON
  const bc = RARITY_BORDER[listing.item.rarity] || RARITY_BORDER.COMMON

  const scrollData = listing.scrollData ?? []
  const totalBonus = listing.totalBonus ?? 0
  const glowTier = calcGlowTier(listing.enhancementLevel, totalBonus)
  const glowIntensity = calcGlowIntensity(listing.enhancementLevel)
  const goldBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100
  const dropBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100

  const hasDetail = totalBonus > 0 || scrollData.length > 0

  async function handleBuy() {
    setLoading(true)
    setError("")
    try {
      await onConfirm(listing.listingId, quantity)
      onClose()
    } catch (e: any) {
      setError(e.message || "Purchase failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="border-2 border-[#4a6090] p-[3px] shadow-[4px_4px_0_#060810] w-full max-w-lg mx-4"
        style={{ backgroundColor: "#0c1020" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-[#2a3a5c] bg-[#0c1020] max-h-[90vh] overflow-y-auto">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b-2 border-[#2a3a5c] px-4 py-2.5">
            <h3 className="font-pixel text-sm text-[#c0d0e0]">CONFIRM PURCHASE</h3>
            <button onClick={onClose} className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#ff8080] border border-[#3a4a6c] px-2 py-1 bg-[#111828] transition-colors">
              X
            </button>
          </div>

          <div className={cn("p-4", hasDetail ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4")}>
            {/* Left: Item Detail */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ItemGlow rarity={listing.item.rarity} glowTier={glowTier} glowIntensity={glowIntensity} className="flex-shrink-0">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#0a0e1a] border-2 overflow-hidden" style={{ borderColor: `${bc}60` }}>
                    {imgUrl ? (
                      <CroppedItemImage src={imgUrl} alt={listing.item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">{getCategoryPlaceholder(listing.item.category)}</span>
                    )}
                  </div>
                </ItemGlow>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-pixel text-sm" style={{ color: nameColor }}>
                      {listing.item.name}
                    </span>
                    {listing.enhancementLevel > 0 && (
                      <span className="font-pixel text-[11px] border border-[#40d870] bg-[#2a7a3a]/40 text-[#d0ffd8] px-1.5">
                        +{listing.enhancementLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PixelBadge rarity={listing.item.rarity} />
                    {glowTier !== "none" && (
                      <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[glowTier])}>{GLOW_LABELS[glowTier]}</span>
                    )}
                  </div>
                  <span className="font-pixel text-[10px] text-[#4a5a70]">Sold by {listing.sellerName}</span>
                </div>
              </div>

              {listing.item.description && (
                <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] italic leading-relaxed">{listing.item.description}</p>
              )}

              {/* Bonuses */}
              {totalBonus > 0 && (
                <div className="border-2 border-[#1a2a3c] bg-[#080c18] p-2.5 space-y-1">
                  <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] mb-1">BONUSES</p>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Gold</span>
                    <span className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)]">+{goldBonus.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">XP</span>
                    <span className="font-pixel text-[9px] text-[#40d870]">+{xpBonus.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
                    <span className="font-pixel text-[9px] text-[#4080f0]">+{dropBonus.toFixed(2)}%</span>
                  </div>
                </div>
              )}

              {/* Scroll trace */}
              {scrollData.length > 0 && (
                <div className="border-2 border-[#1a2a3c] bg-[#080c18] p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1">
                      <ScrollText size={10} /> SCROLL TRACE
                    </span>
                    <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">
                      {scrollData.length} upgrade{scrollData.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-thin">
                    {scrollData.map((slot) => (
                      <div key={slot.slotNumber} className="flex items-center gap-1.5 py-0.5">
                        <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] w-4 text-right flex-shrink-0">+{slot.slotNumber}</span>
                        <span className="w-px h-3 bg-[#2a3a5c] flex-shrink-0" />
                        <span className={cn("font-pixel text-[8px] truncate flex-1", getBonusColor(slot.bonusValue))}>{slot.scrollName}</span>
                        <span className={cn("font-pixel text-[8px] flex-shrink-0", getBonusColor(slot.bonusValue))}>+{slot.bonusValue.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/pet/marketplace/${listing.listingId}`}>
                <a className="font-pixel text-[9px] text-[#4a5a70] hover:text-[#80b0ff] flex items-center gap-1 transition-colors">
                  <ExternalLink size={9} /> View Full Details
                </a>
              </Link>
            </div>

            {/* Right: Price + Actions */}
            <div className="space-y-3">
              {/* Unit price */}
              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3 flex items-center justify-between">
                <span className="font-pixel text-[11px] text-[#4a5a70]">UNIT PRICE</span>
                <GoldDisplay amount={listing.pricePerUnit} type={listing.currency === "GOLD" ? "gold" : "gem"} size="lg" />
              </div>

              {/* Quantity picker */}
              <div>
                <label className="font-pixel text-[11px] text-[#4a5a70] block mb-1.5">
                  QTY (max {listing.quantityRemaining})
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">-</button>
                  <input type="number" min={1} max={listing.quantityRemaining} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantityRemaining, parseInt(e.target.value) || 1)))}
                    className="font-pixel w-14 text-center py-1.5 bg-[#0a0e1a] border-2 border-[#2a3a5c] text-[#c0d0e0] text-xs focus:outline-none focus:border-[#4080f0]" />
                  <button onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))}
                    className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">+</button>
                  {listing.quantityRemaining > 1 && (
                    <button onClick={() => setQuantity(listing.quantityRemaining)}
                      className="font-pixel px-2 py-1.5 border border-[#3a4a6c] bg-[#111828] text-[10px] text-[#4a5a70] hover:text-[#c0d0e0] transition-colors">MAX</button>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3 space-y-1.5">
                {quantity > 1 && (
                  <div className="flex justify-between">
                    <span className="font-pixel text-[10px] text-[#4a5a70]">{quantity} x {listing.pricePerUnit.toLocaleString()}</span>
                    <span className="font-pixel text-[10px] text-[#4a5a70]">{totalPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-[#1a2a3c]">
                  <span className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">TOTAL</span>
                  <GoldDisplay amount={totalPrice} type={listing.currency === "GOLD" ? "gold" : "gem"} size="lg" />
                </div>
              </div>

              {error && (
                <p className="font-pixel text-[11px] text-[#ff8080] border border-[#e04040]/30 bg-[#e04040]/10 px-2.5 py-1.5">{error}</p>
              )}

              <div className="flex gap-2">
                <PixelButton variant="ghost" size="md" onClick={onClose} className="flex-1">CANCEL</PixelButton>
                <PixelButton variant="primary" size="md" onClick={handleBuy} loading={loading} className="flex-1">
                  {loading ? "BUYING..." : "CONFIRM"}
                </PixelButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---
