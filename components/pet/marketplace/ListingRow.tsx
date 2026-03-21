// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Compact horizontal row for marketplace list-view mode.
//          Shows all listing data inline with hover tooltip.
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import ListingTooltip, { type ListingForTooltip } from "./ListingTooltip"
import { calcGlowTier, calcGlowIntensity, GLOW_TEXT_COLORS, GLOW_LABELS } from "@/utils/gameConstants"
import { cn } from "@/lib/utils"
import { Clock, User, ScrollText } from "lucide-react"
import type { ListingData } from "./ListingCard"

const RARITY_TEXT: Record<string, string> = {
  COMMON: "#8899aa", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ff90a0",
}
const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d ${h % 24}h`
}

interface Props {
  listing: ListingData
  onBuy: (listing: ListingData) => void
}

export default function ListingRow({ listing, onBuy }: Props) {
  const { item } = listing
  const imgUrl = getItemImageUrl(item.assetPath, item.category)
  const scrollData = listing.scrollData ?? null
  const totalBonus = listing.totalBonus ?? 0
  const scrollCount = scrollData?.length ?? 0
  const glowTier = calcGlowTier(listing.enhancementLevel, totalBonus)
  const glowIntensity = calcGlowIntensity(listing.enhancementLevel)
  const bc = RARITY_BORDER[item.rarity] || RARITY_BORDER.COMMON

  const tooltipListing: ListingForTooltip = {
    ...listing,
    item: { ...item, description: item.description ?? "" },
    scrollData, totalBonus,
  }

  return (
    <ListingTooltip listing={tooltipListing}>
      <div className="flex items-center gap-3 px-3 py-2 border-2 border-[#1a2a3c] bg-[#0c1020] hover:bg-[#0f1628] transition-colors group">
        {/* Image */}
        <Link href={`/pet/marketplace/${listing.listingId}`}>
          <a className="flex-shrink-0">
            <ItemGlow rarity={item.rarity} glowTier={glowTier} glowIntensity={glowIntensity}>
              <div className="w-10 h-10 border flex items-center justify-center bg-[#080c18] overflow-hidden" style={{ borderColor: `${bc}60` }}>
                {imgUrl ? (
                  <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm">{getCategoryPlaceholder(item.category)}</span>
                )}
              </div>
            </ItemGlow>
          </a>
        </Link>

        {/* Name + badges */}
        <Link href={`/pet/marketplace/${listing.listingId}`}>
          <a className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="font-pixel text-[12px] truncate" style={{ color: RARITY_TEXT[item.rarity] || RARITY_TEXT.COMMON }}>
              {item.name}
            </span>
            {listing.enhancementLevel > 0 && (
              <span className="font-pixel text-[10px] border border-[#40d870] bg-[#2a7a3a]/40 text-[#d0ffd8] px-1 flex-shrink-0">
                +{listing.enhancementLevel}
              </span>
            )}
            {scrollCount > 0 && (
              <span className="font-pixel text-[9px] border border-[#6090e0] bg-[#4060a0]/40 text-[#c0d8ff] px-1 flex-shrink-0 flex items-center gap-0.5">
                <ScrollText size={8} />{scrollCount}
              </span>
            )}
            {glowTier !== "none" && (
              <span className={cn("font-pixel text-[9px] flex-shrink-0", GLOW_TEXT_COLORS[glowTier])}>
                {GLOW_LABELS[glowTier]}
              </span>
            )}
          </a>
        </Link>

        {/* Bonus */}
        <div className="w-12 text-right flex-shrink-0">
          {totalBonus > 0 ? (
            <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">+{totalBonus.toFixed(1)}</span>
          ) : (
            <span className="font-pixel text-[10px] text-[#2a3a5c]">-</span>
          )}
        </div>

        {/* Price */}
        <div className="w-24 flex-shrink-0">
          <GoldDisplay amount={listing.pricePerUnit} type={listing.currency === "GOLD" ? "gold" : "gem"} size="sm" />
        </div>

        {/* Qty */}
        <span className="font-pixel text-[10px] text-[#4a5a6a] w-8 text-center flex-shrink-0">x{listing.quantityRemaining}</span>

        {/* Time */}
        <span className="font-pixel text-[9px] text-[#4a5a6a] w-10 text-right flex-shrink-0 flex items-center gap-0.5 justify-end">
          <Clock size={9} /> {timeLeft(listing.expiresAt)}
        </span>

        {/* Seller */}
        <span className="font-pixel text-[9px] text-[#3a4a60] w-20 truncate flex-shrink-0 hidden md:block">
          {listing.sellerName}
        </span>

        {/* Buy */}
        <button
          onClick={(e) => { e.preventDefault(); onBuy(listing) }}
          className="font-pixel text-[10px] px-3 py-1.5 border-2 border-[#40d870] bg-[#2a7a3a] text-[#d0ffd8] shadow-[1px_1px_0_#060810] hover:bg-[#338844] active:shadow-none active:translate-x-px active:translate-y-px transition-all flex-shrink-0"
        >
          BUY
        </button>
      </div>
    </ListingTooltip>
  )
}
