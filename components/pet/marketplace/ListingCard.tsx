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
// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 Phase 3 -- Sparkles icon for the FEATURED badge.
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Theme catalog + discoverability rollout -- Store icon for the
// new "Visit shop" chip that replaces the tiny user-link.
import { Clock, ScrollText, ExternalLink, Sparkles, Store } from "lucide-react"
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---
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

// --- AI-MODIFIED (2026-04-29) ---
// Purpose: Marketplace 2.0 -- carry sellerId so the seller name can link
// to the seller's personal store front (/pet/marketplace/store/{sellerId}).
// Optional so legacy callers that don't supply it just don't render the
// link (graceful degradation).
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Theme catalog + discoverability rollout -- attach the seller's
// personal-store metadata so the card can render a tinted "Visit shop"
// chip and route via slug when set. All fields nullable so legacy callers
// can omit them.
export interface ListingData {
  listingId: number
  item: { id: number; name: string; category: string; rarity: string; assetPath: string; slot: string | null; description?: string }
  enhancementLevel: number
  quantityRemaining: number
  pricePerUnit: number
  currency: string
  sellerName: string
  sellerId?: string
  expiresAt: string
  scrollData?: ScrollSlot[] | null
  totalBonus?: number
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- featured listings show an animated
  // gradient border + FEATURED badge. Optional so non-marketplace callers
  // (e.g. legacy admin code) can omit it without ts errors.
  isFeatured?: boolean
  // --- END AI-MODIFIED ---
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Per-listing personal-store metadata -- nullable when the
  // seller has no lg_user_stores row.
  sellerStore?: {
    displayName: string | null
    slug: string | null
    themeId: string
    accentColor: string | null
  } | null
  // --- END AI-MODIFIED ---
}
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- when listing.isFeatured is true,
  // wrap the card in a glowing animated gradient frame and stamp a FEATURED
  // badge in the top-left corner. The gradient is a 4-color animated
  // background (`lg-featured-border` keyframes are in globals.css) and the
  // inner card sits 2px inside it, so it reads as a halo rather than
  // overpowering the rarity color.
  const featured = listing.isFeatured === true
  // --- END AI-MODIFIED ---

  return (
    <ListingTooltip listing={tooltipListing}>
      {/* --- AI-MODIFIED (2026-03-24) --- */}
      {/* Purpose: min-h for consistent card heights in browse grid */}
      {/* --- AI-MODIFIED (2026-04-29) --- */}
      {/* Purpose: Marketplace 2.0 Phase 3 -- featured wrapper. */}
      <div className={cn("relative h-full", featured && "lg-featured-frame p-[2px]")}>
        {featured && (
          <div className="absolute -top-[2px] left-2 z-10 px-2 py-0.5 bg-gradient-to-r from-[#f0c040] via-[#ff6b9d] to-[#a855f7] text-[#0a0a0a] font-pixel text-[8px] flex items-center gap-1 shadow-[2px_2px_0_#060810]">
            <Sparkles size={8} /> FEATURED
          </div>
        )}
        <PixelCard
          borderColor={borderColor}
          className={cn(
            "p-3 flex flex-col gap-2 group hover:brightness-110 active:brightness-110 transition-all h-full min-h-[240px]",
            featured && "pt-4",
          )}
        >
      {/* --- END AI-MODIFIED --- */}
      {/* --- END AI-MODIFIED --- */}
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
        {/* --- AI-MODIFIED (2026-03-24) --- */}
        {/* Purpose: Improved contrast for quantity/time text */}
        <div className="flex items-center justify-between font-pixel text-[10px] text-[var(--pet-text-dim,#7a8a9a)]">
          <span>x{listing.quantityRemaining}</span>
          <span className="flex items-center gap-0.5"><Clock size={10} /> {timeLeft(listing.expiresAt)}</span>
        </div>
        {/* --- END AI-MODIFIED --- */}

        {/* Seller */}
        {/* --- AI-MODIFIED (2026-03-24) --- */}
        {/* Purpose: Improved contrast for seller/link text (was #3a4a60) */}
        {/* --- AI-MODIFIED (2026-04-29) --- */}
        {/* Purpose: Marketplace 2.0 -- seller name now links to the seller's
            personal store page when sellerId is available. */}
        {/* --- AI-MODIFIED (2026-04-30) --- */}
        {/* Purpose: Theme catalog + discoverability -- promote the tiny 9px
            seller link to a proper "Visit shop" chip with a Store icon,
            border + bg tinted by the seller's accent colour, and routing
            via slug when available. Falls back to neutral chip + sellerId
            when the seller has no personal-store row. */}
        <div className="flex items-center justify-between gap-1">
          <SellerStoreChip listing={listing} fallbackBorder={borderColor} />
          <Link href={`/pet/wiki/${item.id}`}>
            <a
              className="text-[var(--pet-text-dim,#7a8a9a)] hover:text-[#80b0ff] transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${item.name} in the wiki`}
            >
              <ExternalLink size={11} />
            </a>
          </Link>
        </div>
        {/* --- END AI-MODIFIED --- */}
        {/* --- END AI-MODIFIED --- */}
        {/* --- END AI-MODIFIED --- */}

        {/* Buy button */}
        <button
          onClick={(e) => { e.preventDefault(); onBuy(listing) }}
          className="font-pixel w-full py-1.5 text-[12px] border-2 border-[#40d870] bg-[#2a7a3a] text-[#d0ffd8] shadow-[2px_2px_0_#060810] hover:bg-[#338844] hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          BUY
        </button>
        </PixelCard>
      </div>
    </ListingTooltip>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Shared "Visit shop" chip used by ListingCard (and re-exported
// for ListingRow). Renders a Store icon + the seller's display name (or
// fallback sellerName), border + bg tinted with the seller's accent color
// when available. Routes via slug when set, else discordId.
//
// Why a separate function: keeps the two listing renderers consistent
// without repeating the colour-normalization logic. Exported so
// ListingRow can import it and avoid drift.
function normaliseAccentHex(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith("#")) return null
  // Truncate to 7 chars (#RRGGBB) so we can safely append our own alpha.
  // The DB column is VarChar(9) so #RRGGBBAA is also valid; we prefer
  // recomputing alpha here for visual consistency.
  return trimmed.slice(0, 7)
}

export function SellerStoreChip({
  listing,
  fallbackBorder,
  size = "sm",
  compact = false,
}: {
  listing: ListingData
  /** Border color used when the seller has no accent set. Usually the
   *  rarity border so the chip "harmonises" with the listing card. */
  fallbackBorder: string
  /** "sm" = 10px (used inside the dense ListingCard), "md" = 11px (used
   *  in ListingRow which has more horizontal room). */
  size?: "sm" | "md"
  /** When true, the shop name is hidden below the md breakpoint so the
   *  chip collapses to an icon-only badge on mobile. Used by ListingRow
   *  where horizontal space is at a premium. */
  compact?: boolean
}) {
  const meta = listing.sellerStore ?? null
  const accent = normaliseAccentHex(meta?.accentColor ?? null)
  const borderHex = accent ?? fallbackBorder
  const bgHex = accent ? `${accent}1f` : "rgba(10,14,26,0.6)"
  const textColor = accent ? "#f3f6fb" : "#c8d2e0"
  const slugOrId = meta?.slug || listing.sellerId
  const shopName = (meta?.displayName?.trim() || listing.sellerName || "Player").slice(0, 24)
  const fontPx = size === "md" ? 11 : 10
  const iconPx = size === "md" ? 11 : 10

  const inner = (
    <>
      <Store size={iconPx} className="flex-shrink-0" />
      <span className={cn("truncate", compact && "hidden md:inline")}>{shopName}</span>
    </>
  )

  if (!slugOrId) {
    return (
      <span
        className="font-pixel inline-flex items-center gap-1 px-1.5 py-1 border-2 truncate transition-colors"
        style={{ borderColor: borderHex, background: bgHex, color: textColor, fontSize: `${fontPx}px` }}
        aria-label={`${shopName}'s shop (no longer available)`}
      >
        {inner}
      </span>
    )
  }

  return (
    <Link href={`/pet/marketplace/store/${slugOrId}`}>
      <a
        onClick={(e) => e.stopPropagation()}
        className="font-pixel inline-flex items-center gap-1 px-1.5 py-1 border-2 truncate transition-all hover:scale-[1.04] hover:brightness-110 cursor-pointer max-w-full"
        style={{ borderColor: borderHex, background: bgHex, color: textColor, fontSize: `${fontPx}px` }}
        aria-label={`Visit ${shopName}'s shop`}
      >
        {inner}
      </a>
    </Link>
  )
}
// --- END AI-MODIFIED ---
