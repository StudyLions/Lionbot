// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace listing card for browse grid
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Complete rewrite -- bigger cards, more info at a glance,
//   click goes to detail page instead of wiki, bonus stats visible,
//   scroll count and glow tier always shown (not just hover)
// --- Original code: see git history for pre-redesign version ---
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { Clock, User, ScrollText, ExternalLink } from "lucide-react"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import ListingTooltip, { type ListingForTooltip, type ScrollSlot } from "./ListingTooltip"
import { GAME_CONSTANTS, calcGlowTier, calcGlowIntensity, GLOW_TEXT_COLORS, GLOW_LABELS } from "@/utils/gameConstants"
import { cn } from "@/lib/utils"

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
  return `${d}d ${h % 24}h`
}

export interface ListingData {
  listingId: number
  item: { id: number; name: string; category: string; rarity: string; assetPath: string; slot: string | null; description?: string }
  enhancementLevel: number
  quantityRemaining: number
  pricePerUnit: number
  currency: string
  sellerName: string
  expiresAt: string
  scrollData?: ScrollSlot[] | null
  totalBonus?: number
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
  const scrollData = listing.scrollData ?? null
  const totalBonus = listing.totalBonus ?? 0
  const scrollCount = scrollData?.length ?? 0
  const glowTier = calcGlowTier(listing.enhancementLevel, totalBonus)
  const glowIntensity = calcGlowIntensity(listing.enhancementLevel)
  const goldBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100

  const tooltipListing: ListingForTooltip = {
    ...listing,
    item: { ...item, description: item.description ?? "" },
    scrollData, totalBonus,
  }

  return (
    <ListingTooltip listing={tooltipListing}>
      <PixelCard
        borderColor={borderColor}
        className="p-3 flex flex-col gap-2 group hover:brightness-110 active:brightness-110 transition-all h-full"
      >
        {/* Item image + link to detail page */}
        <Link href={`/pet/marketplace/${listing.listingId}`}>
          <a className="flex flex-col items-center gap-2">
            <div className="relative w-[72px] h-[72px] flex items-center justify-center bg-[#0a0e1a] border border-[#1a2a3c]">
              <ItemGlow rarity={item.rarity} glowTier={glowTier} glowIntensity={glowIntensity}>
                {imgUrl ? (
                  <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center text-2xl">
                    {getCategoryPlaceholder(item.category)}
                  </div>
                )}
              </ItemGlow>
              {listing.enhancementLevel > 0 && (
                <span className="font-pixel absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[11px] border bg-[#2a7a3a]/80 border-[#40d870] text-[#d0ffd8]">
                  +{listing.enhancementLevel}
                </span>
              )}
              {scrollCount > 0 && (
                <span className="font-pixel absolute -bottom-1 -left-1 px-1 py-0 text-[9px] border bg-[#4060a0]/80 border-[#6090e0] text-[#c0d8ff] flex items-center gap-0.5">
                  <ScrollText size={8} />{scrollCount}
                </span>
              )}
            </div>

            {/* Name */}
            <p className="font-pixel text-[12px] text-center truncate w-full leading-tight" style={{ color: textColor }}>
              {item.name}
            </p>
          </a>
        </Link>

        {/* Rarity + Glow tier */}
        <div className="flex items-center justify-center gap-1.5 -mt-0.5 min-h-[16px]">
          <PixelBadge rarity={item.rarity} className="text-[8px] px-1.5 py-0" />
          {glowTier !== "none" && (
            <span className={cn("font-pixel text-[8px]", GLOW_TEXT_COLORS[glowTier])}>
              {GLOW_LABELS[glowTier]}
            </span>
          )}
        </div>

        {/* Bonus stats row */}
        {totalBonus > 0 && (
          <div className="flex items-center justify-center gap-2 font-pixel text-[8px]">
            <span className="text-[var(--pet-gold,#f0c040)]">+{goldBonus.toFixed(1)}%G</span>
            <span className="text-[#40d870]">+{xpBonus.toFixed(1)}%X</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-center gap-1 mt-auto">
          <GoldDisplay amount={listing.pricePerUnit} type={listing.currency === "GOLD" ? "gold" : "gem"} size="md" />
        </div>

        {/* Quantity + Time */}
        <div className="flex items-center justify-between font-pixel text-[10px] text-[#4a5a70]">
          <span>x{listing.quantityRemaining}</span>
          <span className="flex items-center gap-0.5"><Clock size={10} /> {timeLeft(listing.expiresAt)}</span>
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[9px] text-[#3a4a60] flex items-center gap-0.5 truncate">
            <User size={9} /> {listing.sellerName}
          </span>
          <Link href={`/pet/wiki/${item.id}`}>
            <a className="text-[#3a4a60] hover:text-[#80b0ff] transition-colors" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={9} />
            </a>
          </Link>
        </div>

        {/* Buy button */}
        <button
          onClick={(e) => { e.preventDefault(); onBuy(listing) }}
          className="font-pixel w-full py-1.5 text-[12px] border-2 border-[#40d870] bg-[#2a7a3a] text-[#d0ffd8] shadow-[2px_2px_0_#060810] hover:bg-[#338844] hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          BUY
        </button>
      </PixelCard>
    </ListingTooltip>
  )
}
// --- END AI-MODIFIED ---
