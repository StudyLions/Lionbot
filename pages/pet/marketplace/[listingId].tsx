// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Dedicated listing detail page -- MapleStory auction house
//          style with item preview, scroll trace, purchase panel,
//          price history chart, and other listings comparison.
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import dynamic from "next/dynamic"
// --- AI-MODIFIED (2026-03-31) ---
// Purpose: Add icons needed for wiki-sourced item info sections
import {
  ChevronLeft, Clock, User, ScrollText, Coins, Gem, ExternalLink,
  Users, Package, ShoppingCart, Sparkles, Droplets, Mic, MessageSquare,
} from "lucide-react"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
// --- AI-MODIFIED (2026-04-10) ---
// Purpose: Import RoomCanvas, GameboyFrame, and layout utils for Try On preview
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { mergeLayout } from "@/utils/roomConstraints"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Import calcLevelPenalty for new diminishing-returns formula
import {
  GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS, GLOW_COLORS,
  calcGlowTier, calcGlowIntensity, calcLevelPenalty,
} from "@/utils/gameConstants"
// --- END AI-MODIFIED ---
import { cn } from "@/lib/utils"
import type { ScrollSlot } from "@/components/pet/marketplace/ListingTooltip"

const PriceChart = dynamic(() => import("@/components/pet/marketplace/PriceChart"), { ssr: false })

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}
const RARITY_HEADER_BG: Record<string, string> = {
  COMMON: "rgba(106,112,128,0.12)", UNCOMMON: "rgba(64,128,240,0.12)",
  RARE: "rgba(224,64,64,0.12)", EPIC: "rgba(240,192,64,0.12)",
  LEGENDARY: "rgba(208,96,240,0.12)", MYTHICAL: "rgba(255,96,128,0.12)",
}
const BONUS_COLORS: [number, string][] = [
  [3.0, "text-purple-400"], [2.0, "text-cyan-300"],
  [1.5, "text-yellow-400"], [1.0, "text-green-400"], [0, "text-gray-400"],
]
function getBonusColor(v: number) {
  for (const [t, c] of BONUS_COLORS) { if (v >= t) return c }
  return "text-gray-400"
}

function calcCumulativeProb(slots: ScrollSlot[]): number {
  if (!slots.length) return 1
  let p = 1
  for (const s of slots) {
    if (s.successRate == null) continue
    // --- AI-REPLACED (2026-03-22) ---
    // Reason: Old linear penalty replaced with diminishing-returns curve
    // --- Original code (commented out for rollback) ---
    // p *= s.successRate * Math.max(0.1, 1 - GAME_CONSTANTS.LEVEL_PENALTY_FACTOR * (s.slotNumber - 1))
    // --- End original code ---
    p *= s.successRate * calcLevelPenalty(s.slotNumber - 1)
    // --- END AI-REPLACED ---
  }
  return p
}
function fmtProb(p: number) {
  const pct = p * 100
  if (pct >= 10) return `${pct.toFixed(1)}%`
  if (pct >= 1) return `${pct.toFixed(2)}%`
  if (pct >= 0.01) return `${pct.toFixed(3)}%`
  return `${pct.toFixed(4)}%`
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d ${h % 24}h left`
}

const MARKETPLACE_FEE_PERCENT = 5
// --- AI-MODIFIED (2026-03-31) ---
// Purpose: Equipment categories for enhancement info display
const EQUIP_CATS = new Set(["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-10) ---
// Purpose: Slot resolution and overview type for Try On preview
const CATEGORY_TO_SLOT: Record<string, string> = {
  HAT: "HEAD", GLASSES: "FACE", COSTUME: "BODY",
  SHIRT: "BODY", WINGS: "BACK", BOOTS: "FEET",
}
interface OverviewData {
  hasPet: boolean
  pet: { name: string; expression: string; level: number } | null
  equipment: Record<string, { name: string; category: string; rarity: string; assetPath: string; glowTier?: string; glowIntensity?: number }>
  roomPrefix?: string
  furniture?: Record<string, string>
  roomLayout?: any
  gameboySkinPath?: string | null
}
// --- END AI-MODIFIED ---

export default function ListingDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const listingId = parseInt(router.query.listingId as string)

  const { data, isLoading } = useDashboard<any>(
    session && !isNaN(listingId) ? `/api/pet/marketplace/${listingId}` : null
  )
  const { data: historyData } = useDashboard<any>(
    data?.listing ? `/api/pet/marketplace/history?itemId=${data.listing.item.id}&days=30` : null
  )
  // --- AI-MODIFIED (2026-03-31) ---
  // Purpose: Fetch wiki item data for ownership, drop info, and enhancement info sections
  const { data: wikiData } = useDashboard<any>(
    data?.listing ? `/api/pet/wiki/${data.listing.item.id}` : null
  )
  // --- END AI-MODIFIED ---

  const [quantity, setQuantity] = useState(1)
  const [buying, setBuying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: Try On preview state
  const [showTryOn, setShowTryOn] = useState(false)
  const { data: tryOnOverview } = useDashboard<OverviewData>(
    showTryOn && session ? "/api/pet/overview" : null
  )
  // --- END AI-MODIFIED ---

  const handleBuy = useCallback(async () => {
    setBuying(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/pet/marketplace/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Purchase failed")
      setSuccess(d.message || "Purchase successful!")
      invalidatePrefix("/api/pet/marketplace")
    } catch (e: any) { setError(e.message) }
    finally { setBuying(false) }
  }, [listingId, quantity])

  const handleCancel = useCallback(async () => {
    setCancelling(true); setError("")
    try {
      const res = await fetch("/api/pet/marketplace/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        invalidatePrefix("/api/pet/marketplace")
        router.push("/pet/marketplace/my-listings")
      }
    } catch (e: any) { setError(e.message) }
    finally { setCancelling(false) }
  }, [listingId, router])

  const listing = data?.listing
  const recentSales: any[] = data?.recentSales ?? []
  const otherListings: any[] = data?.otherListings ?? []

  const scrollData: ScrollSlot[] = listing?.scrollData ?? []
  const totalBonus = listing?.totalBonus ?? 0
  const glowTier = listing ? calcGlowTier(listing.enhancementLevel, totalBonus) : "none" as const
  const glowIntensity = listing ? calcGlowIntensity(listing.enhancementLevel) : 0
  const bc = listing ? (RARITY_BORDER[listing.item.rarity] || "#3a4a6c") : "#3a4a6c"
  const headerBg = listing ? (RARITY_HEADER_BG[listing.item.rarity] || "rgba(58,74,108,0.12)") : ""
  const goldBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100
  const xpBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100
  const dropBonus = totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100
  const cumProb = calcCumulativeProb(scrollData)
  const totalPrice = listing ? listing.pricePerUnit * quantity : 0
  const fee = Math.floor(totalPrice * MARKETPLACE_FEE_PERCENT / 100)
  // --- AI-MODIFIED (2026-03-31) ---
  // Purpose: Use currency-specific average for the listing's currency, falling back to combined
  const avgPrice = listing?.currency === "GEMS"
    ? (historyData?.gemSummary?.avgPrice ?? historyData?.summary?.avgPrice ?? 0)
    : (historyData?.goldSummary?.avgPrice ?? historyData?.summary?.avgPrice ?? 0)
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-04-10) ---
  // Purpose: Try On preview equipment computation
  const itemSlot = listing ? (listing.item.slot || CATEGORY_TO_SLOT[listing.item.category] || null) : null
  const canTryOn = !!itemSlot && EQUIP_CATS.has(listing?.item?.category ?? "")

  const tryOnEquipment = useMemo(() => {
    if (!showTryOn || !tryOnOverview || !listing || !itemSlot) return null
    const merged = { ...tryOnOverview.equipment }
    merged[itemSlot] = {
      name: listing.item.name,
      category: listing.item.category,
      rarity: listing.item.rarity,
      assetPath: listing.item.assetPath,
      glowTier: calcGlowTier(listing.enhancementLevel, totalBonus),
      glowIntensity: calcGlowIntensity(listing.enhancementLevel),
    }
    return merged
  }, [showTryOn, tryOnOverview, listing, itemSlot, totalBonus])
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: listing ? `${listing.item.name} - Marketplace` : "Listing Detail", description: "Marketplace listing detail" }}>
      <AdminGuard variant="pet">
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to PetShell for consistent layout */}
        {/* --- Original code (commented out for rollback) ---
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">
        --- End original code --- */}
        <PetShell className="space-y-5">
        {/* --- END AI-REPLACED --- */}

              <Link href="/pet/marketplace">
                <a className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#8899aa] transition-colors inline-flex items-center gap-1.5">
                  <ChevronLeft size={14} /> Back to Marketplace
                </a>
              </Link>

              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3 h-96 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  <div className="lg:col-span-2 h-96 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                </div>
              ) : !listing ? (
                <PixelCard className="p-16 text-center" corners>
                  <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">LISTING NOT FOUND</p>
                  <Link href="/pet/marketplace">
                    <PixelButton variant="ghost" size="sm" className="mt-4">BROWSE MARKETPLACE</PixelButton>
                  </Link>
                </PixelCard>
              ) : (
                <>
                  {success && (
                    <div className="border-2 border-[#40d870] bg-[#40d87010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[13px] text-[#80ffb0]">{success}</span>
                    </div>
                  )}
                  {error && (
                    <div className="border-2 border-[#e04040] bg-[#e0404010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                      <span className="font-pixel text-[13px] text-[#ff8080]">{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* LEFT PANEL: Item Detail */}
                    <div className="lg:col-span-3 space-y-4">
                      <PixelCard borderColor={bc} corners className="overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-[#1a2a3c]" style={{ background: headerBg }}>
                          <div className="flex items-start gap-4">
                            <ItemGlow rarity={listing.item.rarity} glowTier={glowTier} glowIntensity={glowIntensity} className="flex-shrink-0">
                              <div className="w-20 h-20 border-2 bg-[#080c18] flex items-center justify-center overflow-hidden" style={{ borderColor: `${bc}60` }}>
                                {getItemImageUrl(listing.item.assetPath, listing.item.category) ? (
                                  <CroppedItemImage src={getItemImageUrl(listing.item.assetPath, listing.item.category)!} alt={listing.item.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-3xl">{getCategoryPlaceholder(listing.item.category)}</span>
                                )}
                              </div>
                            </ItemGlow>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)]">{listing.item.name}</h2>
                                {listing.enhancementLevel > 0 && (
                                  <span className="font-pixel text-lg text-[var(--pet-gold,#f0c040)]">+{listing.enhancementLevel}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <PixelBadge rarity={listing.item.rarity} />
                                {glowTier !== "none" && (
                                  <span className={cn("font-pixel text-[11px]", GLOW_TEXT_COLORS[glowTier])}>{GLOW_LABELS[glowTier]}</span>
                                )}
                                {listing.item.slot && (
                                  <span className="font-pixel text-[11px] text-[#4a5a70] border border-[#2a3a5c] px-1.5 py-0.5">{listing.item.slot}</span>
                                )}
                              </div>
                              {/* --- AI-MODIFIED (2026-04-29) --- */}
                              {/* Purpose: Marketplace 2.0 -- seller name now links to their
                                  personal store front when sellerId is present. Falls back
                                  to plain text for legacy listings without a sellerId. */}
                              <div className="flex items-center gap-3 mt-2 font-pixel text-[11px] text-[#4a5a70] flex-wrap">
                                {listing.sellerId ? (
                                  <Link href={`/pet/marketplace/store/${listing.sellerId}`}>
                                    <a className="flex items-center gap-1 hover:text-[var(--pet-gold,#f0c040)] transition-colors">
                                      <User size={11} /> Visit {listing.sellerName}&apos;s store
                                    </a>
                                  </Link>
                                ) : (
                                  <span className="flex items-center gap-1"><User size={11} /> {listing.sellerName}</span>
                                )}
                                <span className="flex items-center gap-1"><Clock size={11} /> {timeLeft(listing.expiresAt)}</span>
                              </div>
                              {/* --- END AI-MODIFIED --- */}
                            </div>
                            <Link href={`/pet/wiki/${listing.item.id}`}>
                              <a className="flex-shrink-0 font-pixel text-[10px] text-[#4a5a70] hover:text-[#80b0ff] border border-[#2a3a5c] px-2 py-1 flex items-center gap-1 transition-colors">
                                <ExternalLink size={10} /> Wiki
                              </a>
                            </Link>
                          </div>
                        </div>

                        {/* --- AI-MODIFIED (2026-04-10) --- */}
                        {/* Purpose: Try On preview panel in listing detail */}
                        {canTryOn && (
                          <div className="px-5 py-3 border-b border-[#1a2a3c]">
                            <button
                              onClick={() => setShowTryOn(!showTryOn)}
                              className={cn(
                                "w-full font-pixel text-[11px] py-2 border transition-all",
                                showTryOn
                                  ? "border-[#d060f0] text-[#e0a0ff] bg-[#d060f0]/15"
                                  : "border-[#d060f0]/40 text-[#d060f0]/70 bg-[#d060f0]/5 hover:bg-[#d060f0]/10 hover:text-[#e0a0ff]"
                              )}
                            >
                              {showTryOn ? "\u{1F457} Trying On — see how it looks!" : "\u{1F457} Try On This Item"}
                            </button>
                            {showTryOn && tryOnOverview?.hasPet && tryOnEquipment && (
                              <div className="mt-3 flex justify-center">
                                <GameboyFrame
                                  isFullscreen={false}
                                  skinAssetPath={tryOnOverview.gameboySkinPath ?? undefined}
                                  width={260}
                                >
                                  <RoomCanvas
                                    roomPrefix={tryOnOverview.roomPrefix ?? "rooms/default"}
                                    furniture={tryOnOverview.furniture ?? {}}
                                    layout={mergeLayout(tryOnOverview.roomLayout ?? {})}
                                    equipment={Object.fromEntries(
                                      Object.entries(tryOnEquipment).map(([slot, item]) => [
                                        slot,
                                        { assetPath: item.assetPath, category: item.category, glowTier: item.glowTier, glowIntensity: item.glowIntensity },
                                      ])
                                    )}
                                    expression={tryOnOverview.pet?.expression ?? "default"}
                                    size={190}
                                    animated
                                  />
                                </GameboyFrame>
                              </div>
                            )}
                            {showTryOn && !tryOnOverview && (
                              <div className="mt-3 flex justify-center">
                                <div className="w-[190px] h-[190px] border border-[#2a3a5c] bg-[#080c18] flex items-center justify-center">
                                  <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] animate-pulse">Loading pet...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* --- END AI-MODIFIED --- */}

                        {/* Description */}
                        {listing.item.description && (
                          <div className="px-5 py-3 border-b border-[#1a2a3c]">
                            <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] italic leading-relaxed">{listing.item.description}</p>
                          </div>
                        )}

                        {/* Stats */}
                        {(listing.enhancementLevel > 0 || totalBonus > 0) && (
                          <div className="px-5 py-3 border-b border-[#1a2a3c]">
                            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-2">ITEM STATS</h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                              <div className="flex justify-between">
                                <span className="font-pixel text-[11px] text-[#4a5a70]">Enhancement</span>
                                <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">+{listing.enhancementLevel}</span>
                              </div>
                              {totalBonus > 0 && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="font-pixel text-[11px] text-[#4a5a70]">Total Bonus</span>
                                    <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">+{totalBonus.toFixed(1)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-pixel text-[11px] text-[#4a5a70]">Gold Bonus</span>
                                    <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">+{goldBonus.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-pixel text-[11px] text-[#4a5a70]">XP Bonus</span>
                                    <span className="font-pixel text-[11px] text-[#40d870]">+{xpBonus.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-pixel text-[11px] text-[#4a5a70]">Drop Rate</span>
                                    <span className="font-pixel text-[11px] text-[#4080f0]">+{dropBonus.toFixed(2)}%</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Scroll Trace */}
                        {scrollData.length > 0 && (
                          <div className="px-5 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5">
                                <ScrollText size={12} /> SCROLL TRACE
                              </h4>
                              <span className="font-pixel text-[10px] text-[#4a5a70]">{scrollData.length} upgrade{scrollData.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="space-y-0.5">
                              {scrollData.map((slot) => {
                                // --- AI-REPLACED (2026-03-22) ---
                                // Reason: Old linear penalty replaced with diminishing-returns curve
                                // --- Original code (commented out for rollback) ---
                                // const effRate = slot.successRate != null
                                //   ? slot.successRate * Math.max(0.1, 1 - GAME_CONSTANTS.LEVEL_PENALTY_FACTOR * (slot.slotNumber - 1))
                                //   : null
                                // --- End original code ---
                                const effRate = slot.successRate != null
                                  ? slot.successRate * calcLevelPenalty(slot.slotNumber - 1)
                                  : null
                                // --- END AI-REPLACED ---
                                return (
                                  <div key={slot.slotNumber} className="flex items-center gap-2 py-1 px-2 border border-[#1a2a3c]/50 bg-[#080c18]/50">
                                    <span className="font-pixel text-[10px] text-[#4a5a70] w-5 text-right flex-shrink-0">+{slot.slotNumber}</span>
                                    <span className="w-px h-3.5 bg-[#2a3a5c] flex-shrink-0" />
                                    <span className={cn("font-pixel text-[10px] truncate flex-1", getBonusColor(slot.bonusValue))}>{slot.scrollName}</span>
                                    <span className={cn("font-pixel text-[10px] flex-shrink-0", getBonusColor(slot.bonusValue))}>+{slot.bonusValue.toFixed(1)}</span>
                                    {effRate != null && (
                                      <span className="font-pixel text-[9px] text-[#4a5a70] flex-shrink-0 w-8 text-right">{(effRate * 100).toFixed(0)}%</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {scrollData.some(s => s.successRate != null) && (
                              <div className="mt-2 pt-2 border-t border-[#1a2a3c]/50 flex justify-between">
                                <span className="font-pixel text-[10px] text-[#4a5a70]">Chance to reach +{listing.enhancementLevel}</span>
                                <span className={cn("font-pixel text-[10px]",
                                  cumProb < 0.01 ? "text-purple-400" : cumProb < 0.05 ? "text-cyan-300" : cumProb < 0.2 ? "text-yellow-400" : "text-green-400"
                                )}>{fmtProb(cumProb)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </PixelCard>

                      {/* --- AI-MODIFIED (2026-03-31) --- */}
                      {/* Purpose: Item Info grid, How to Obtain, and Enhancement Info from wiki data */}

                      {/* Item Info Stats */}
                      {wikiData && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                            <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1">
                              <Coins size={12} className="text-[var(--pet-gold,#f0c040)]" /> MARKET PRICE
                            </span>
                            {wikiData.marketplaceSummary?.avgPrice > 0 ? (
                              <GoldDisplay amount={wikiData.marketplaceSummary.avgPrice} size="md" className="mt-1" />
                            ) : (
                              <p className="font-pixel text-sm text-[#4a5a6a] mt-1">--</p>
                            )}
                            <p className="font-pixel text-[10px] text-[#3a4a5a]">30d avg</p>
                          </div>
                          <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                            <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1">
                              <ShoppingCart size={12} className="text-[#80b0ff]" /> TOTAL TRADED
                            </span>
                            <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{wikiData.marketplaceSummary?.totalVolume ?? 0}</p>
                            <p className="font-pixel text-[10px] text-[#3a4a5a]">units (30d)</p>
                          </div>
                          <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                            <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1">
                              <Users size={12} /> OWNERS
                            </span>
                            <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{wikiData.ownership?.count ?? 0}</p>
                            <p className="font-pixel text-[10px] text-[#4a5a6a]">{wikiData.ownership?.tier ?? ""}</p>
                          </div>
                          <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810]">
                            <span className="font-pixel text-[11px] text-[#4a5a6a] flex items-center gap-1">
                              <Package size={12} /> YOUR COLLECTION
                            </span>
                            <p className={`font-pixel text-sm mt-1 ${(wikiData.ownership?.userOwned ?? 0) > 0 ? "text-[var(--pet-green,#40d870)]" : "text-[#4a5a6a]"}`}>
                              {(wikiData.ownership?.userOwned ?? 0) > 0 ? `You own x${wikiData.ownership.userOwned}` : "Not owned"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* How to Obtain */}
                      {wikiData?.dropInfo && (
                        <PixelCard className="p-4" corners>
                          <h3 className="font-pixel text-[12px] text-[var(--pet-gold,#f0c040)] mb-3 flex items-center gap-2">
                            <Droplets size={14} /> HOW TO OBTAIN
                          </h3>
                          <div className="space-y-2 font-pixel text-[12px]">
                            <div className="flex items-center gap-2 text-[var(--pet-text-dim,#8899aa)]">
                              <Droplets size={14} className="text-[#80b0ff]" />
                              Drops from activity (chatting, voice, farm harvests)
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 ml-5 text-[11px] text-[#4a5a6a] flex-wrap">
                              <span className="flex items-center gap-1"><Mic size={11} /> {(wikiData.dropInfo.voiceChance * 100).toFixed(0)}% per voice session</span>
                              <span className="flex items-center gap-1"><MessageSquare size={11} /> {(wikiData.dropInfo.textChance * 100).toFixed(0)}% per 5 messages</span>
                            </div>
                            {wikiData.dropInfo.dropWeight != null && wikiData.dropInfo.itemsInTier && (
                              <div className="mt-2 border-t border-[#1a2a3c] pt-2 space-y-1">
                                {wikiData.dropInfo.dropWeight < 0.2 ? (
                                  <span className="font-pixel text-[11px] px-2 py-0.5 border border-[#ff60a0] text-[#ffa0c0] bg-[#ff60a010] inline-block">
                                    ULTRA RARE — {(wikiData.dropInfo.relativeChance * 100).toFixed(1)}% within {listing.item.rarity} drops
                                  </span>
                                ) : wikiData.dropInfo.dropWeight < 0.5 ? (
                                  <span className="font-pixel text-[11px] px-2 py-0.5 border border-[#d060f0] text-[#e0a0ff] bg-[#d060f010] inline-block">
                                    SUPER RARE — {(wikiData.dropInfo.relativeChance * 100).toFixed(1)}% within {listing.item.rarity} drops
                                  </span>
                                ) : wikiData.dropInfo.dropWeight < 1.0 ? (
                                  <span className="font-pixel text-[11px] px-2 py-0.5 border border-[#f0c040] text-[#ffe080] bg-[#f0c04010] inline-block">
                                    UNCOMMON DROP — {(wikiData.dropInfo.relativeChance * 100).toFixed(1)}% within {listing.item.rarity} drops
                                  </span>
                                ) : null}
                                <p className="font-pixel text-[10px] text-[#3a4a5a]">
                                  {wikiData.dropInfo.itemsInTier} {listing.item.rarity.toLowerCase()} {listing.item.category === "SCROLL" ? "scrolls" : "items"} in the drop pool
                                </p>
                              </div>
                            )}
                          </div>
                        </PixelCard>
                      )}

                      {/* Enhancement Info (generic) */}
                      {wikiData?.enhancement && EQUIP_CATS.has(listing.item.category) && (() => {
                        const e = wikiData.enhancement
                        const minPct = (e.minBonusPerLevel * 100).toFixed(1)
                        const maxPct = (e.maxBonusPerLevel * 100).toFixed(1)
                        const dropMin = (e.dropBonusRate * 1.0 * 100).toFixed(1)
                        const dropMax = (e.dropBonusRate * 7.0 * 100).toFixed(1)
                        const safePct = (e.safeBonus * 100).toFixed(0)
                        const perfectPct = (e.perfectBonus * 100).toFixed(0)
                        return (
                          <PixelCard className="p-4" corners>
                            <h3 className="font-pixel text-[12px] text-[var(--pet-gold,#f0c040)] mb-3 flex items-center gap-2">
                              <Sparkles size={14} /> ENHANCEMENT INFO
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-2.5">
                                <p className="font-pixel text-base text-[var(--pet-blue,#4080f0)]">+{e.maxLevel}</p>
                                <p className="font-pixel text-[10px] text-[#4a5a6a]">Max Level</p>
                              </div>
                              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-2.5">
                                <p className="font-pixel text-sm text-[var(--pet-green,#40d870)]">{minPct}% – {maxPct}%</p>
                                <p className="font-pixel text-[10px] text-[#4a5a6a]">Gold/XP per lvl</p>
                              </div>
                              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-2.5">
                                <p className="font-pixel text-sm text-[#80b0ff]">{dropMin}% – {dropMax}%</p>
                                <p className="font-pixel text-[10px] text-[#4a5a6a]">Drop Rate per lvl</p>
                              </div>
                              <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-2.5">
                                <p className="font-pixel text-[10px] text-[#4a5a6a] mb-0.5">Depends on scrolls</p>
                                <p className="font-pixel text-[10px] text-[#6a7a8a]">No fixed max</p>
                              </div>
                            </div>
                            <div className="mt-3 border-2 border-[#1a2a3c] bg-[#080c18] p-3">
                              <p className="font-pixel text-[10px] text-[#4a5a6a] mb-2">POTENTIAL AT +{e.maxLevel}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex justify-between font-pixel text-[10px] mb-1">
                                    <span className="text-[#6a8a6a]">Safe (Dusty)</span>
                                    <span className="text-[var(--pet-green,#40d870)]">+{safePct}% Gold/XP</span>
                                  </div>
                                  <div className="h-2 bg-[#0c1020] border border-[#1a2a3c] overflow-hidden">
                                    <div className="h-full bg-[#40d87060]" style={{ width: `${Math.min((Number(safePct) / Number(perfectPct)) * 100, 100)}%` }} />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between font-pixel text-[10px] mb-1">
                                    <span className="text-[#8a6a8a]">Perfect (Doom)</span>
                                    <span className="text-[#ff60a0]">+{perfectPct}% Gold/XP</span>
                                  </div>
                                  <div className="h-2 bg-[#0c1020] border border-[#1a2a3c] overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#d060f0] to-[#ff60a0]" style={{ width: "100%" }} />
                                  </div>
                                </div>
                              </div>
                              <p className="font-pixel text-[9px] text-[#3a4a5a] mt-2">Bonus depends on which scrolls are used — riskier scrolls yield higher bonuses per level</p>
                            </div>
                          </PixelCard>
                        )
                      })()}
                      {/* --- END AI-MODIFIED --- */}
                    </div>

                    {/* RIGHT PANEL: Purchase + Market Data */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Purchase Card */}
                      <PixelCard className="p-4 space-y-4" corners>
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)]">
                            {listing.status === "ACTIVE" ? "PURCHASE" : listing.status}
                          </span>
                          <span className="font-pixel text-[11px] text-[#4a5a70]">{listing.quantityRemaining} available</span>
                        </div>

                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3 flex items-center justify-between">
                          <span className="font-pixel text-[12px] text-[#4a5a70]">PRICE PER UNIT</span>
                          <GoldDisplay amount={listing.pricePerUnit} type={listing.currency === "GOLD" ? "gold" : "gem"} size="lg" />
                        </div>

                        {listing.status === "ACTIVE" && !listing.isMine && (
                          <>
                            <div>
                              <label className="font-pixel text-[11px] text-[#4a5a70] block mb-1.5">QUANTITY</label>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">-</button>
                                <input type="number" min={1} max={listing.quantityRemaining} value={quantity}
                                  onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantityRemaining, parseInt(e.target.value) || 1)))}
                                  className="font-pixel w-16 text-center py-1.5 bg-[#0a0e1a] border-2 border-[#2a3a5c] text-[#c0d0e0] text-xs focus:outline-none focus:border-[#4080f0]" />
                                <button onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))} className="font-pixel w-8 h-8 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] flex items-center justify-center hover:text-[#c0d0e0] shadow-[2px_2px_0_#060810] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">+</button>
                                {listing.quantityRemaining > 1 && (
                                  <button onClick={() => setQuantity(listing.quantityRemaining)} className="font-pixel px-2 py-1.5 border border-[#3a4a6c] bg-[#111828] text-[10px] text-[#4a5a70] hover:text-[#c0d0e0] transition-colors">MAX</button>
                                )}
                              </div>
                            </div>

                            <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3 space-y-1.5">
                              <div className="flex justify-between">
                                <span className="font-pixel text-[11px] text-[#4a5a70]">Subtotal</span>
                                <GoldDisplay amount={totalPrice} type={listing.currency === "GOLD" ? "gold" : "gem"} size="md" />
                              </div>
                              {avgPrice > 0 && (
                                <div className="flex justify-between">
                                  <span className="font-pixel text-[10px] text-[#4a5a70]">30d Avg</span>
                                  <span className={cn("font-pixel text-[10px]",
                                    listing.pricePerUnit > avgPrice * 1.1 ? "text-[#ff8080]" :
                                    listing.pricePerUnit < avgPrice * 0.9 ? "text-[#40d870]" : "text-[#4a5a70]"
                                  )}>
                                    {listing.pricePerUnit > avgPrice * 1.1 ? "Above avg" : listing.pricePerUnit < avgPrice * 0.9 ? "Below avg" : "Fair price"}
                                    {" "}({avgPrice.toLocaleString()})
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between pt-1.5 border-t border-[#1a2a3c]">
                                <span className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">TOTAL</span>
                                <GoldDisplay amount={totalPrice} type={listing.currency === "GOLD" ? "gold" : "gem"} size="lg" />
                              </div>
                            </div>

                            <PixelButton onClick={handleBuy} loading={buying} variant="primary" size="lg" className="w-full">
                              {buying ? "BUYING..." : "BUY NOW"}
                            </PixelButton>
                          </>
                        )}

                        {listing.isMine && listing.status === "ACTIVE" && (
                          <PixelButton onClick={handleCancel} loading={cancelling} variant="danger" size="lg" className="w-full">
                            {cancelling ? "CANCELLING..." : "CANCEL LISTING"}
                          </PixelButton>
                        )}

                        {listing.status !== "ACTIVE" && (
                          <div className="text-center py-2">
                            <span className="font-pixel text-[13px] text-[#4a5a70]">This listing is {listing.status.toLowerCase()}</span>
                          </div>
                        )}
                      </PixelCard>

                      {/* --- AI-REPLACED (2026-03-31) --- */}
                      {/* Reason: Split single price chart into separate gold and gem charts */}
                      {/* What the new code does better: Shows independent price history per currency */}
                      {/* --- Original code (commented out for rollback) ---
                      <PixelCard className="p-4 space-y-3" corners>
                        <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">PRICE HISTORY (30d)</h4>
                        <PriceChart data={historyData?.priceHistory ?? []} height={140} />
                        {historyData?.summary && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <p className="font-pixel text-[9px] text-[#4a5a70]">AVG</p>
                              <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.summary.avgPrice.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="font-pixel text-[9px] text-[#4a5a70]">VOLUME</p>
                              <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.summary.totalVolume}</p>
                            </div>
                            <div className="text-center">
                              <p className="font-pixel text-[9px] text-[#4a5a70]">LISTINGS</p>
                              <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.summary.activeListings}</p>
                            </div>
                          </div>
                        )}
                      </PixelCard>
                      --- End original code --- */}

                      {/* Gold Price History */}
                      {(historyData?.goldHistory?.length > 0 || !historyData?.gemHistory?.length) && (
                        <PixelCard className="p-4 space-y-3" corners>
                          <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5">
                            <Coins size={12} className="text-[#f0c040]" /> PRICE HISTORY — GOLD (30d)
                          </h4>
                          <PriceChart data={historyData?.goldHistory ?? []} height={140} currency="GOLD" />
                          {historyData?.goldSummary && (
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">AVG</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.goldSummary.avgPrice.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">VOLUME</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.goldSummary.totalVolume}</p>
                              </div>
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">LISTINGS</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.summary?.activeListings ?? 0}</p>
                              </div>
                            </div>
                          )}
                        </PixelCard>
                      )}

                      {/* Gem Price History */}
                      {historyData?.gemHistory?.length > 0 && (
                        <PixelCard className="p-4 space-y-3" corners>
                          <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5">
                            <Gem size={12} className="text-[#a060f0]" /> PRICE HISTORY — GEMS (30d)
                          </h4>
                          <PriceChart data={historyData.gemHistory} height={140} currency="GEMS" />
                          {historyData?.gemSummary && (
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">AVG</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.gemSummary.avgPrice.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">VOLUME</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.gemSummary.totalVolume}</p>
                              </div>
                              <div className="text-center">
                                <p className="font-pixel text-[9px] text-[#4a5a70]">LISTINGS</p>
                                <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{historyData.summary?.activeListings ?? 0}</p>
                              </div>
                            </div>
                          )}
                        </PixelCard>
                      )}
                      {/* --- END AI-REPLACED --- */}

                      {/* Other Listings */}
                      {otherListings.length > 0 && (
                        <PixelCard className="p-4 space-y-2" corners>
                          <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">OTHER LISTINGS</h4>
                          {otherListings.map((ol: any) => (
                            <Link key={ol.listingId} href={`/pet/marketplace/${ol.listingId}`}>
                              <a className="flex items-center justify-between px-3 py-2 border border-[#1a2a3c] bg-[#080c18] hover:bg-[#0f1628] transition-colors">
                                <GoldDisplay amount={ol.pricePerUnit} type={ol.currency === "GOLD" ? "gold" : "gem"} size="sm" />
                                <span className="font-pixel text-[10px] text-[#4a5a70]">x{ol.quantity}</span>
                              </a>
                            </Link>
                          ))}
                        </PixelCard>
                      )}

                      {/* Recent Sales */}
                      {recentSales.length > 0 && (
                        <PixelCard className="p-4 space-y-2" corners>
                          <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">RECENT SALES</h4>
                          {recentSales.slice(0, 5).map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between px-3 py-1.5 border border-[#1a2a3c]/50">
                              <div className="flex items-center gap-2">
                                <GoldDisplay amount={s.pricePerUnit} type={s.currency === "GOLD" ? "gold" : "gem"} size="sm" />
                                <span className="font-pixel text-[10px] text-[#4a5a70]">x{s.quantity}</span>
                              </div>
                              <span className="font-pixel text-[9px] text-[#4a5a70]">{new Date(s.soldAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </PixelCard>
                      )}
                    </div>
                  </div>
                </>
              )}
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
