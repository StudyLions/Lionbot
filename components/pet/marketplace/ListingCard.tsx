// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace listing card for browse grid
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Clock, User } from "lucide-react"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#8899aa", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ff90a0",
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
  const borderColor = RARITY_BORDER[item.rarity] || RARITY_BORDER.COMMON
  const textColor = RARITY_TEXT[item.rarity] || RARITY_TEXT.COMMON

  return (
    <PixelCard
      borderColor={borderColor}
      className="p-3 flex flex-col gap-2 group hover:brightness-110 transition-all"
    >
      <Link href={`/pet/wiki/${item.id}`} className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 flex items-center justify-center bg-[#0a0e1a] border border-[#1a2a3c]">
          {imgUrl ? (
            <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-2xl">
              {getCategoryPlaceholder(item.category)}
            </div>
          )}
          {listing.enhancementLevel > 0 && (
            <span
              className="font-pixel absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[11px] border bg-[#2a7a3a]/80 border-[#40d870] text-[#d0ffd8]"
            >
              +{listing.enhancementLevel}
            </span>
          )}
        </div>
        <p className="font-pixel text-[13px] text-center truncate w-full" style={{ color: textColor }}>
          {item.name}
        </p>
      </Link>

      <div className="flex items-center justify-center gap-1">
        <GoldDisplay
          amount={listing.pricePerUnit}
          type={listing.currency === "GOLD" ? "gold" : "gem"}
          size="md"
        />
        <span className="font-pixel text-[11px] text-[#4a5a70]">each</span>
      </div>

      <div className="flex items-center justify-between font-pixel text-[11px] text-[#4a5a70]">
        <span>{listing.quantityRemaining} avail</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {timeLeft(listing.expiresAt)}</span>
      </div>

      <div className="flex items-center gap-1 font-pixel text-[11px] text-[#3a4a60]">
        <User size={12} /> {listing.sellerName}
      </div>

      <button
        onClick={(e) => { e.preventDefault(); onBuy(listing) }}
        className="font-pixel mt-auto w-full py-2 text-[13px] border-2 border-[#40d870] bg-[#2a7a3a] text-[#d0ffd8] shadow-[2px_2px_0_#060810] hover:bg-[#338844] hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
      >
        BUY
      </button>
    </PixelCard>
  )
}
