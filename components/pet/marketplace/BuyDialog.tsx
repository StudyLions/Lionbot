// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Buy confirmation dialog with quantity picker
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Show full scroll trace, Gold/XP/Drop bonuses, and glow tier
// in the purchase confirmation so buyers know exactly what they're getting
// --- Original code: see git history for pre-scroll-data version ---
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { ScrollText } from "lucide-react"
import {
  GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS,
  calcGlowTier, calcGlowIntensity,
} from "@/utils/gameConstants"
import { cn } from "@/lib/utils"
import type { ScrollSlot } from "./ListingTooltip"

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

const BONUS_COLOR_THRESHOLDS: [number, string][] = [
  [3.0, "text-purple-400"],
  [2.0, "text-cyan-300"],
  [1.5, "text-yellow-400"],
  [1.0, "text-green-400"],
  [0, "text-gray-400"],
]

function getBonusColor(v: number): string {
  for (const [t, c] of BONUS_COLOR_THRESHOLDS) { if (v >= t) return c }
  return "text-gray-400"
}

export default function BuyDialog({ listing, onClose, onConfirm }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalPrice = listing.pricePerUnit * quantity
  const imgUrl = getItemImageUrl(listing.item.assetPath, listing.item.category)
  const nameColor = RARITY_TEXT[listing.item.rarity] || RARITY_TEXT.COMMON

  const scrollData = listing.scrollData ?? []
  const totalBonus = listing.totalBonus ?? 0
  const glowTier = calcGlowTier(listing.enhancementLevel, totalBonus)
  const glowIntensity = calcGlowIntensity(listing.enhancementLevel)
  const goldBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100
  const dropBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100

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
        className="border-2 border-[#4a6090] p-[3px] shadow-[4px_4px_0_#060810] w-full max-w-sm mx-4"
        style={{ backgroundColor: "#0c1020" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b-2 border-[#2a3a5c] pb-2">
            <h3 className="font-pixel text-sm text-[#c0d0e0]">CONFIRM PURCHASE</h3>
            <button
              onClick={onClose}
              className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#ff8080] border border-[#3a4a6c] px-2 py-1 bg-[#111828] transition-colors"
            >
              X
            </button>
          </div>

          {/* Item preview */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-[#0a0e1a] border-2 border-[#1a2a3c]">
              <ItemGlow rarity={listing.item.rarity} glowTier={glowTier} glowIntensity={glowIntensity}>
                {imgUrl ? (
                  <CroppedItemImage src={imgUrl} alt={listing.item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">{getCategoryPlaceholder(listing.item.category)}</span>
                )}
              </ItemGlow>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm" style={{ color: nameColor }}>
                  {listing.item.name}
                </span>
                {listing.enhancementLevel > 0 && (
                  <span className="font-pixel text-[12px] border border-[#40d870] bg-[#2a7a3a]/40 text-[#d0ffd8] px-1.5">
                    +{listing.enhancementLevel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <PixelBadge rarity={listing.item.rarity} />
                {glowTier !== "none" && (
                  <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[glowTier])}>
                    {GLOW_LABELS[glowTier]}
                  </span>
                )}
              </div>
              <span className="font-pixel text-[11px] text-[#4a5a70]">Sold by {listing.sellerName}</span>
            </div>
          </div>

          {/* Bonuses */}
          {totalBonus > 0 && (
            <div className="border-2 border-[#1a2a3c] bg-[#080c18] p-2.5 space-y-1">
              <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mb-1">ITEM BONUSES</p>
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Gold Bonus</span>
                <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">+{goldBonus.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">XP Bonus</span>
                <span className="font-pixel text-[10px] text-[#40d870]">+{xpBonus.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
                <span className="font-pixel text-[10px] text-[#4080f0]">+{dropBonus.toFixed(2)}%</span>
              </div>
            </div>
          )}

          {/* Scroll trace */}
          {scrollData.length > 0 && (
            <div className="border-2 border-[#1a2a3c] bg-[#080c18] p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1">
                  <ScrollText size={10} /> SCROLL TRACE
                </span>
                <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                  {scrollData.length} upgrade{scrollData.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-0.5 max-h-[100px] overflow-y-auto scrollbar-thin">
                {scrollData.map((slot) => (
                  <div key={slot.slotNumber} className="flex items-center gap-1.5 py-0.5">
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] w-4 text-right flex-shrink-0">
                      +{slot.slotNumber}
                    </span>
                    <span className="w-px h-3 bg-[#2a3a5c] flex-shrink-0" />
                    <span className={cn("font-pixel text-[9px] truncate flex-1", getBonusColor(slot.bonusValue))}>
                      {slot.scrollName}
                    </span>
                    <span className={cn("font-pixel text-[9px] flex-shrink-0", getBonusColor(slot.bonusValue))}>
                      +{slot.bonusValue.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity picker */}
          <div>
            <label className="font-pixel text-[12px] text-[#4a5a70] block mb-1.5">
              QTY (MAX {listing.quantityRemaining})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:bg-[#1a2438] hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                -
              </button>
              <input
                type="number" min={1} max={listing.quantityRemaining}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantityRemaining, parseInt(e.target.value) || 1)))}
                className="font-pixel w-16 text-center py-1.5 bg-[#0a0e1a] border-2 border-[#2a3a5c] text-[#c0d0e0] text-xs focus:outline-none focus:border-[#4080f0]"
              />
              <button
                onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))}
                className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:bg-[#1a2438] hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                +
              </button>
              {listing.quantityRemaining > 1 && (
                <button
                  onClick={() => setQuantity(listing.quantityRemaining)}
                  className="font-pixel px-2.5 py-1.5 border border-[#3a4a6c] bg-[#111828] text-[11px] text-[#4a5a70] hover:text-[#c0d0e0] transition-colors"
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Total cost */}
          <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-3 flex items-center justify-between">
            <span className="font-pixel text-[12px] text-[#4a5a70]">TOTAL COST</span>
            <GoldDisplay
              amount={totalPrice}
              type={listing.currency === "GOLD" ? "gold" : "gem"}
              size="lg"
            />
          </div>

          {error && (
            <p className="font-pixel text-[12px] text-[#ff8080] border border-[#e04040]/30 bg-[#e04040]/10 px-2.5 py-1.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <PixelButton variant="ghost" size="md" onClick={onClose} className="flex-1">
              CANCEL
            </PixelButton>
            <PixelButton variant="primary" size="md" onClick={handleBuy} loading={loading} className="flex-1">
              {loading ? "BUYING..." : "CONFIRM"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---
