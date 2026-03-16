// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Buy confirmation dialog with quantity picker
// ============================================================
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

interface ListingData {
  listingId: number
  item: { id: number; name: string; category: string; rarity: string; assetPath: string }
  enhancementLevel: number
  quantityRemaining: number
  pricePerUnit: number
  currency: string
  sellerName: string
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

export default function BuyDialog({ listing, onClose, onConfirm }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalPrice = listing.pricePerUnit * quantity
  const imgUrl = getItemImageUrl(listing.item.assetPath, listing.item.category)
  const nameColor = RARITY_TEXT[listing.item.rarity] || RARITY_TEXT.COMMON

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
      {/* Outer border */}
      <div
        className="border-2 border-[#4a6090] p-[3px] shadow-[4px_4px_0_#060810] w-full max-w-sm mx-4"
        style={{ backgroundColor: "#0c1020" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner border */}
        <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-4 space-y-4">
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
              {imgUrl ? (
                <CroppedItemImage src={imgUrl} alt={listing.item.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl">{getCategoryPlaceholder(listing.item.category)}</span>
              )}
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
              <PixelBadge rarity={listing.item.rarity} />
              <span className="font-pixel text-[11px] text-[#4a5a70]">Sold by {listing.sellerName}</span>
            </div>
          </div>

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
