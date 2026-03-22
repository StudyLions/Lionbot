// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Dedicated listing detail page -- MapleStory auction house
//          style with item preview, scroll trace, purchase panel,
//          price history chart, and other listings comparison.
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ChevronLeft, Clock, User, ScrollText, Coins, Gem, ExternalLink,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemGlow from "@/components/pet/ui/ItemGlow"
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

  const [quantity, setQuantity] = useState(1)
  const [buying, setBuying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
  const avgPrice = historyData?.summary?.avgPrice ?? 0

  return (
    <Layout SEO={{ title: listing ? `${listing.item.name} - Marketplace` : "Listing Detail", description: "Marketplace listing detail" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

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
                              <div className="flex items-center gap-3 mt-2 font-pixel text-[11px] text-[#4a5a70]">
                                <span className="flex items-center gap-1"><User size={11} /> {listing.sellerName}</span>
                                <span className="flex items-center gap-1"><Clock size={11} /> {timeLeft(listing.expiresAt)}</span>
                              </div>
                            </div>
                            <Link href={`/pet/wiki/${listing.item.id}`}>
                              <a className="flex-shrink-0 font-pixel text-[10px] text-[#4a5a70] hover:text-[#80b0ff] border border-[#2a3a5c] px-2 py-1 flex items-center gap-1 transition-colors">
                                <ExternalLink size={10} /> Wiki
                              </a>
                            </Link>
                          </div>
                        </div>

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

                      {/* Price History */}
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
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
