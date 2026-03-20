// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Sell items page - inventory picker, quantity/price
//          form, price reference panel, confirm listing
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo } from "react"
import {
  Coins, Gem, Check, AlertCircle,
  TrendingUp, TrendingDown, Minus, ShoppingCart,
  BarChart2,
} from "lucide-react"
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import dynamic from "next/dynamic"
import { GetServerSideProps } from "next"

const PriceChart = dynamic(() => import("@/components/pet/marketplace/PriceChart"), { ssr: false })
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Import InventoryItem type and ItemTooltip for rich hover popups,
//          glow constants for detail panel rendering
import ItemTooltip, { type InventoryItem } from "@/components/pet/inventory/ItemTooltip"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS } from "@/utils/gameConstants"
import { cn } from "@/lib/utils"
// --- END AI-MODIFIED ---

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7080", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff60a0",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

// --- AI-REPLACED (2026-03-20) ---
// Reason: InvItem was a stripped-down type missing most inventory API fields
// What the new code does better: Uses the full InventoryItem type from ItemTooltip
//   which includes description, slots, glowTier, maxLevel, totalBonus, etc.
// --- Original code (commented out for rollback) ---
// interface InvItem {
//   id: number; name: string; category: string; rarity: string; assetPath: string
//   quantity: number; enhancementLevel: number; tradeable: boolean; inventoryId: number
// }
// --- End original code ---
// (Now using `InventoryItem` imported from ItemTooltip.tsx)
// --- END AI-REPLACED ---

function computeTrend(priceHistory: Array<{ avgPrice: number }>) {
  if (!priceHistory || priceHistory.length < 6) return "stable" as const
  const third = Math.floor(priceHistory.length / 3)
  const firstSlice = priceHistory.slice(0, third)
  const lastSlice = priceHistory.slice(-third)
  const firstAvg = firstSlice.reduce((s, d) => s + d.avgPrice, 0) / firstSlice.length
  const lastAvg = lastSlice.reduce((s, d) => s + d.avgPrice, 0) / lastSlice.length
  if (firstAvg === 0) return "stable" as const
  const diff = (lastAvg - firstAvg) / firstAvg
  if (diff > 0.03) return "rising" as const
  if (diff < -0.03) return "falling" as const
  return "stable" as const
}

export default function SellPage() {
  const { data: session } = useSession()

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Use full InventoryItem type instead of stripped InvItem
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  // --- END AI-MODIFIED ---
  const [quantity, setQuantity] = useState(1)
  const [pricePerUnit, setPricePerUnit] = useState<number>(10)
  const [currency, setCurrency] = useState<"GOLD" | "GEMS">("GOLD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { data: invData, isLoading: invLoading } = useDashboard<any>(
    session ? "/api/pet/inventory?includeAll=true" : null
  )
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Fetch 30 days of history instead of 7 for better market intelligence
  const { data: historyData } = useDashboard<any>(
    selectedItem ? `/api/pet/marketplace/history?itemId=${selectedItem.item.id}&days=30` : null
  )
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Filter out non-tradeable and equipped items, map to InventoryItem type
  const tradeableItems = useMemo((): InventoryItem[] => {
    if (!invData?.items) return []
    return invData.items
      .filter((i: any) => i.item.tradeable !== false && !i.equipped)
      .map((i: any) => ({
        inventoryId: i.inventoryId,
        quantity: i.quantity,
        enhancementLevel: i.enhancementLevel ?? 0,
        maxLevel: i.maxLevel ?? 5,
        source: i.source ?? "SHOP",
        acquiredAt: i.acquiredAt ?? new Date().toISOString(),
        equipped: false,
        totalBonus: i.totalBonus ?? 0,
        glowTier: i.glowTier ?? "none",
        glowIntensity: i.glowIntensity ?? 0,
        slots: i.slots ?? [],
        item: {
          id: i.item.id,
          name: i.item.name,
          category: i.item.category,
          slot: i.item.slot ?? null,
          rarity: i.item.rarity,
          description: i.item.description ?? "",
          assetPath: i.item.assetPath,
        },
      }))
  }, [invData])
  // --- END AI-MODIFIED ---

  async function handleList() {
    if (!selectedItem) return
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/pet/marketplace/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.item.id,
          quantity,
          pricePerUnit,
          currency,
          enhancementLevel: selectedItem.enhancementLevel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create listing")
      setSuccess(data.message || "Listing created!")
      invalidatePrefix("/api/pet")
      setSelectedItem(null)
      setQuantity(1)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = pricePerUnit * quantity

  const trend = useMemo(() => computeTrend(historyData?.priceHistory), [historyData])
  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus
  const trendColor = trend === "rising" ? "text-[#40d870]" : trend === "falling" ? "text-[#ff8080]" : "text-[#4a5a6a]"
  const trendLabel = trend === "rising" ? "Rising" : trend === "falling" ? "Falling" : "Stable"

  return (
    <Layout SEO={{ title: "Sell Items - Marketplace", description: "List items for sale on the marketplace" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <Link href="/pet/marketplace">
                <a className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#8899aa] transition-colors inline-flex items-center gap-1.5">
                  <span>&#x25C4;</span> Back to Marketplace
                </a>
              </Link>

              <div>
                  <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  SELL ITEMS
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                </h1>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
              </div>

              {success && (
                <div className="border-2 border-[#40d870] bg-[#40d87010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                  <Check size={16} className="text-[var(--pet-green,#40d870)]" />
                  <span className="font-pixel text-[13px] text-[#80ffb0]">{success}</span>
                </div>
              )}
              {error && (
                <div className="border-2 border-[#e04040] bg-[#e0404010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                  <AlertCircle size={16} className="text-[var(--pet-red,#e04040)]" />
                  <span className="font-pixel text-[13px] text-[#ff8080]">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Step 1: Pick Item */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)]">
                    1. SELECT AN ITEM FROM YOUR INVENTORY
                  </h3>

                  {invLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-28 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                      ))}
                    </div>
                  ) : !tradeableItems.length ? (
                    <PixelCard className="p-8 text-center" corners>
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                        No tradeable items in your inventory.
                      </p>
                    </PixelCard>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[450px] overflow-y-auto pr-1">
                      {/* --- AI-MODIFIED (2026-03-20) --- */}
                      {/* Purpose: Wrap each card in ItemTooltip, show rarity badge, enhancement badge, glow label */}
                      {tradeableItems.map((inv: InventoryItem) => {
                        const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
                        const isSelected = selectedItem?.inventoryId === inv.inventoryId
                        const bc = RARITY_BORDER[inv.item.rarity] || "#6a7080"
                        return (
                          <ItemTooltip key={inv.inventoryId} inv={inv}>
                            <button
                              onClick={() => { setSelectedItem(inv); setQuantity(1) }}
                              className={`border-2 p-2 flex flex-col items-center gap-1 transition-all text-center w-full ${
                                isSelected
                                  ? "bg-[#101830] shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]"
                                  : "bg-[#0c1020] hover:bg-[#0f1628]"
                              }`}
                              style={{ borderColor: isSelected ? "#4080f0" : bc }}
                            >
                              <div className="relative w-12 h-12 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                                {imgUrl ? (
                                  <CroppedItemImage src={imgUrl} alt={inv.item.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-lg">{getCategoryPlaceholder(inv.item.category)}</span>
                                )}
                                {inv.enhancementLevel > 0 && (
                                  <span className="font-pixel absolute -top-1.5 -right-1.5 px-1 py-0 text-[10px] border bg-[#2a7a3a]/80 border-[#40d870] text-[#d0ffd8]">
                                    +{inv.enhancementLevel}
                                  </span>
                                )}
                              </div>
                              <span
                                className="font-pixel text-[11px] truncate w-full"
                                style={{ color: RARITY_TEXT[inv.item.rarity] || "#a0a8b4" }}
                              >
                                {inv.item.name}
                              </span>
                              <PixelBadge rarity={inv.item.rarity} className="text-[8px] px-1 py-0" />
                              <div className="flex items-center gap-1">
                                <span className="font-pixel text-[10px] text-[#4a5a6a]">x{inv.quantity}</span>
                                {inv.glowTier !== "none" && (
                                  <span className={cn("font-pixel text-[8px]", GLOW_TEXT_COLORS[inv.glowTier])}>
                                    {GLOW_LABELS[inv.glowTier]}
                                  </span>
                                )}
                              </div>
                            </button>
                          </ItemTooltip>
                        )
                      })}
                      {/* --- END AI-MODIFIED --- */}
                    </div>
                  )}
                </div>

                {/* Step 2+3: Pricing & Market Intelligence */}
                <div className="space-y-4">
                  {selectedItem ? (
                    <>
                      {/* --- AI-MODIFIED (2026-03-20) --- */}
                      {/* Purpose: Inline selected item detail panel with full stats */}
                      <h3 className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)]">
                        SELECTED ITEM
                      </h3>
                      <PixelCard
                        className="p-3"
                        borderColor={RARITY_BORDER[selectedItem.item.rarity]}
                        corners
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-16 h-16 flex-shrink-0 flex items-center justify-center border-2 bg-[#080c18] overflow-hidden"
                            style={{ borderColor: `${RARITY_BORDER[selectedItem.item.rarity]}80` }}
                          >
                            {getItemImageUrl(selectedItem.item.assetPath, selectedItem.item.category) ? (
                              <CroppedItemImage
                                src={getItemImageUrl(selectedItem.item.assetPath, selectedItem.item.category)!}
                                alt={selectedItem.item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl">{getCategoryPlaceholder(selectedItem.item.category)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] truncate">
                                {selectedItem.item.name}
                              </span>
                              {selectedItem.enhancementLevel > 0 && (
                                <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">
                                  +{selectedItem.enhancementLevel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <PixelBadge rarity={selectedItem.item.rarity} className="text-[10px] px-1.5 py-0" />
                              {selectedItem.glowTier !== "none" && (
                                <span className={cn("font-pixel text-[10px]", GLOW_TEXT_COLORS[selectedItem.glowTier])}>
                                  {GLOW_LABELS[selectedItem.glowTier]}
                                </span>
                              )}
                            </div>
                            {selectedItem.item.description && (
                              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] italic leading-relaxed">
                                {selectedItem.item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#1a2a3c] space-y-1">
                          {selectedItem.item.slot && (
                            <div className="flex justify-between">
                              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Slot</span>
                              <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">{selectedItem.item.slot}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Enhancement</span>
                            <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">
                              +{selectedItem.enhancementLevel} / {selectedItem.maxLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Quantity</span>
                            <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">x{selectedItem.quantity}</span>
                          </div>
                          {selectedItem.totalBonus > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Gold Bonus</span>
                                <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                                  +{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">XP Bonus</span>
                                <span className="font-pixel text-[10px] text-[#40d870]">
                                  +{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
                                <span className="font-pixel text-[10px] text-[#4080f0]">
                                  +{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(2)}%
                                </span>
                              </div>
                            </>
                          )}
                          {selectedItem.slots.length > 0 && (
                            <div className="flex justify-between">
                              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Scroll Upgrades</span>
                              <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">
                                {selectedItem.slots.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </PixelCard>
                      {/* --- END AI-MODIFIED --- */}

                      <h3 className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)]">
                        2. SET PRICE AND QUANTITY
                      </h3>

                      <PixelCard className="p-4 space-y-4" corners>
                        <div>
                          <label className="font-pixel text-[12px] text-[#4a5a6a] block mb-1">
                            QUANTITY (max {selectedItem.quantity})
                          </label>
                          <input
                            type="range" min={1} max={selectedItem.quantity} value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full accent-[var(--pet-blue,#4080f0)]"
                          />
                          <div className="flex justify-between font-pixel text-[12px] text-[#4a5a6a]">
                            <span>1</span>
                            <span className="text-[var(--pet-text,#e2e8f0)]">{quantity}</span>
                            <span>{selectedItem.quantity}</span>
                          </div>
                        </div>

                        <div>
                          <label className="font-pixel text-[12px] text-[#4a5a6a] block mb-1">CURRENCY</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrency("GOLD")}
                              className={`font-pixel text-[13px] flex-1 py-2.5 border-2 flex items-center justify-center gap-1.5 transition-all ${
                                currency === "GOLD"
                                  ? "border-[var(--pet-gold,#f0c040)] bg-[#f0c04010] text-[var(--pet-gold,#f0c040)]"
                                  : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                              }`}
                            >
                              <Coins size={16} /> Gold
                            </button>
                            <button
                              onClick={() => setCurrency("GEMS")}
                              className={`font-pixel text-[13px] flex-1 py-2.5 border-2 flex items-center justify-center gap-1.5 transition-all ${
                                currency === "GEMS"
                                  ? "border-[#a855f7] bg-[#a855f710] text-[#a855f7]"
                                  : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                              }`}
                            >
                              <Gem size={16} /> Gems
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="font-pixel text-[12px] text-[#4a5a6a] block mb-1">PRICE PER UNIT</label>
                          <input
                            type="number" min={1} value={pricePerUnit}
                            onChange={(e) => setPricePerUnit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="font-pixel text-sm w-full py-2.5 px-3 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                          />
                          {historyData?.summary?.avgPrice > 0 && (
                            <p className="font-pixel text-[10px] text-[#4a5a6a] mt-1">
                              Suggested: ~{historyData.summary.avgPrice.toLocaleString()} (30d avg)
                            </p>
                          )}
                        </div>

                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-[12px] text-[#4a5a6a]">Total Revenue</span>
                            <GoldDisplay
                              amount={totalPrice}
                              size="lg"
                              type={currency === "GOLD" ? "gold" : "gem"}
                            />
                          </div>
                          <p className="font-pixel text-[11px] text-[#4a5a6a] mt-1">
                            {quantity}x {selectedItem.item.name} at {pricePerUnit} {currency} each. Expires in 7 days.
                          </p>
                        </div>

                        <PixelButton
                          onClick={handleList}
                          disabled={loading}
                          loading={loading}
                          variant="primary"
                          size="lg"
                          className="w-full"
                        >
                          {loading ? "LISTING..." : "LIST FOR SALE"}
                        </PixelButton>
                      </PixelCard>

                      {/* --- AI-MODIFIED (2026-03-20) --- */}
                      {/* Purpose: Expanded market intelligence with stats grid, trend, supply, chart */}
                      <h3 className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)] flex items-center gap-1.5">
                        <BarChart2 size={14} /> MARKET INTELLIGENCE
                      </h3>

                      <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-3 space-y-3 shadow-[2px_2px_0_#060810]">
                        {historyData?.summary && (historyData.summary.totalSales > 0 || historyData.summary.activeListings > 0) ? (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                                <p className="font-pixel text-[10px] text-[#4a5a70] uppercase">Avg Price (30d)</p>
                                <div className="mt-1">
                                  {historyData.summary.avgPrice > 0 ? (
                                    <GoldDisplay amount={historyData.summary.avgPrice} size="md" />
                                  ) : (
                                    <span className="font-pixel text-sm text-[#4a5a70]">--</span>
                                  )}
                                </div>
                              </div>
                              <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                                <p className="font-pixel text-[10px] text-[#4a5a70] uppercase">Trend</p>
                                <div className={cn("flex items-center justify-center gap-1 mt-1 font-pixel text-sm", trendColor)}>
                                  <TrendIcon size={14} /> {trendLabel}
                                </div>
                              </div>
                              <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                                <p className="font-pixel text-[10px] text-[#4a5a70] uppercase">Units Traded</p>
                                <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{historyData.summary.totalVolume}</p>
                              </div>
                              <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                                <p className="font-pixel text-[10px] text-[#4a5a70] uppercase">Active Listings</p>
                                <p className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] mt-1">{historyData.summary.activeListings}</p>
                              </div>
                            </div>

                            {historyData.summary.lowestPrice && (
                              <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 flex items-center justify-between">
                                <span className="font-pixel text-[10px] text-[#4a5a70]">LOWEST CURRENT LISTING</span>
                                <GoldDisplay
                                  amount={historyData.summary.lowestPrice.price}
                                  size="md"
                                  type={historyData.summary.lowestPrice.currency === "GOLD" ? "gold" : "gem"}
                                />
                              </div>
                            )}

                            <div>
                              <p className="font-pixel text-[10px] text-[#4a5a70] uppercase mb-1.5">Price History (30 days)</p>
                              <PriceChart data={historyData?.priceHistory ?? []} height={140} />
                            </div>

                            {historyData?.supply?.length > 0 && (
                              <div>
                                <p className="font-pixel text-[10px] text-[#4a5a70] uppercase mb-1">Supply Sources</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {historyData.supply.map((s: any) => (
                                    <span key={s.source} className="font-pixel px-2 py-0.5 border border-[#1a2a3c] bg-[#0f1628] text-[10px] text-[#4a5a70]">
                                      {s.source}: {s.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <ShoppingCart size={24} className="mx-auto text-[#1a2a3c] mb-2" />
                            <p className="font-pixel text-[13px] text-[#4a5a70]">
                              NO MARKET DATA YET
                            </p>
                            <p className="font-pixel text-[10px] text-[#3a4a60] mt-1">
                              Be the first to set the price for {selectedItem.item.name}!
                            </p>
                          </div>
                        )}
                      </div>
                      {/* --- END AI-MODIFIED --- */}
                    </>
                  ) : (
                    <PixelCard className="p-8 text-center" corners>
                      <ShoppingCart size={28} className="mx-auto text-[#2a3a5c] mb-3" />
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                        SELECT AN ITEM FROM YOUR INVENTORY TO LIST IT FOR SALE
                      </p>
                      <p className="font-pixel text-[10px] text-[#3a4a60] mt-2">
                        Hover over any item to see its full details
                      </p>
                    </PixelCard>
                  )}
                </div>
              </div>

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
