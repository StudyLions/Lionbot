// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace listing card for browse grid
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Coins, Gem, Clock, User } from "lucide-react"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/15", UNCOMMON: "border-green-500/15", RARE: "border-blue-500/15",
  EPIC: "border-purple-500/15", LEGENDARY: "border-amber-500/15", MYTHICAL: "border-rose-500/15",
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h left`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h left`
}

interface ListingData {
  listingId: number
  item: { id: number; name: string; category: string; rarity: string; assetPath: string; slot: string | null }
  enhancementLevel: number
  quantityRemaining: number
  pricePerUnit: number
  currency: string
  sellerName: string
  expiresAt: string
}

interface Props {
  listing: ListingData
  onBuy: (listing: ListingData) => void
}

export default function ListingCard({ listing, onBuy }: Props) {
  const { item } = listing
  const imgUrl = getItemImageUrl(item.assetPath, item.category)
  const CurrencyIcon = listing.currency === "GOLD" ? Coins : Gem
  const currencyColor = listing.currency === "GOLD" ? "text-amber-400" : "text-cyan-400"

  return (
    <div className={cn("rounded-xl border p-3.5 bg-muted/5 flex flex-col gap-2 group hover:shadow-lg transition-all", rarityBorder[item.rarity])}>
      <Link href={`/pet/wiki/${item.id}`} className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {imgUrl ? (
            <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-2xl">
              {getCategoryPlaceholder(item.category)}
            </div>
          )}
          {listing.enhancementLevel > 0 && (
            <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
              +{listing.enhancementLevel}
            </span>
          )}
        </div>
        <p className={cn("text-xs font-semibold text-center truncate w-full", rarityColor[item.rarity])}>
          {item.name}
        </p>
      </Link>

      <div className="flex items-center justify-center gap-1">
        <CurrencyIcon size={12} className={currencyColor} />
        <span className={cn("text-sm font-bold", currencyColor)}>
          {listing.pricePerUnit.toLocaleString()}
        </span>
        <span className="text-[9px] text-muted-foreground/40">each</span>
      </div>

      <div className="flex items-center justify-between text-[9px] text-muted-foreground/40">
        <span>{listing.quantityRemaining} available</span>
        <span className="flex items-center gap-0.5"><Clock size={8} /> {timeLeft(listing.expiresAt)}</span>
      </div>

      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/30">
        <User size={8} /> {listing.sellerName}
      </div>

      <button
        onClick={(e) => { e.preventDefault(); onBuy(listing) }}
        className="mt-auto w-full py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
      >
        Buy
      </button>
    </div>
  )
}
