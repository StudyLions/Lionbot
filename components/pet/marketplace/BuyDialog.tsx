// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Buy confirmation dialog with quantity picker
// ============================================================
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Coins, Gem, X } from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}

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

export default function BuyDialog({ listing, onClose, onConfirm }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalPrice = listing.pricePerUnit * quantity
  const CurrencyIcon = listing.currency === "GOLD" ? Coins : Gem
  const currencyColor = listing.currency === "GOLD" ? "text-amber-400" : "text-cyan-400"
  const imgUrl = getItemImageUrl(listing.item.assetPath, listing.item.category)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background border border-border/40 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Confirm Purchase</h3>
          <button onClick={onClose} className="text-muted-foreground/40 hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
            {imgUrl ? (
              <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
            ) : (
              <span className="text-2xl">{getCategoryPlaceholder(listing.item.category)}</span>
            )}
          </div>
          <div>
            <p className={cn("text-sm font-semibold", rarityColor[listing.item.rarity])}>
              {listing.item.name}
              {listing.enhancementLevel > 0 && <span className="text-primary ml-1">+{listing.enhancementLevel}</span>}
            </p>
            <p className="text-[10px] text-muted-foreground/50">Sold by {listing.sellerName}</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground/50 block mb-1">Quantity (max {listing.quantityRemaining})</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-muted/20 text-foreground flex items-center justify-center hover:bg-muted/30">-</button>
            <input
              type="number" min={1} max={listing.quantityRemaining}
              value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantityRemaining, parseInt(e.target.value) || 1)))}
              className="w-16 text-center py-1.5 rounded-lg bg-muted/20 border border-border/30 text-sm"
            />
            <button onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))} className="w-8 h-8 rounded-lg bg-muted/20 text-foreground flex items-center justify-center hover:bg-muted/30">+</button>
            {listing.quantityRemaining > 1 && (
              <button onClick={() => setQuantity(listing.quantityRemaining)} className="px-2 py-1.5 rounded-lg bg-muted/10 text-[10px] text-muted-foreground hover:text-foreground">Max</button>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-muted/10 p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">Total Cost</span>
          <span className={cn("text-lg font-bold flex items-center gap-1", currencyColor)}>
            <CurrencyIcon size={16} /> {totalPrice.toLocaleString()} {listing.currency}
          </span>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-muted/20 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleBuy} disabled={loading}
            className="flex-1 py-2 rounded-lg bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
          >
            {loading ? "Buying..." : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  )
}
