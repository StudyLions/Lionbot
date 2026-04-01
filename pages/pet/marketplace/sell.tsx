// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Sell items page - inventory picker, quantity/price
//          form, price reference panel, confirm listing
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Complete redesign -- full-width inventory browser with
//   category tabs on top, three-column selected-item panel below
//   (detail + pricing + market intel), removed numbered steps
// --- Original code: see git history for pre-redesign version ---
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo } from "react"
import {
  Coins, Gem, Check, AlertCircle,
  TrendingUp, TrendingDown, Minus, ShoppingCart,
  BarChart2, Search,
} from "lucide-react"
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import dynamic from "next/dynamic"
import { GetServerSideProps } from "next"

const PriceChart = dynamic(() => import("@/components/pet/marketplace/PriceChart"), { ssr: false })
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelTabBar from "@/components/pet/ui/PixelTabBar"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import ItemTooltip, { type InventoryItem } from "@/components/pet/inventory/ItemTooltip"
import { GAME_CONSTANTS, GLOW_LABELS, GLOW_TEXT_COLORS } from "@/utils/gameConstants"
import { cn } from "@/lib/utils"

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7080", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff60a0",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Restructured to match PixelTabBar key/label interface
// --- Original code (commented out for rollback) ---
// const CATEGORY_TABS = ["All", "Equipment", "Scrolls", "Materials"] as const
// type CategoryTab = typeof CATEGORY_TABS[number]
// --- End original code ---
type CategoryTab = "All" | "Equipment" | "Scrolls" | "Materials"
const CATEGORY_TABS: { key: CategoryTab; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Equipment", label: "Equipment" },
  { key: "Scrolls", label: "Scrolls" },
  { key: "Materials", label: "Materials" },
]
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

function mapCategory(cat: string): CategoryTab {
  const lower = cat.toLowerCase()
  if (lower.includes("scroll")) return "Scrolls"
  if (lower.includes("material") || lower.includes("craft")) return "Materials"
  return "Equipment"
}

export default function SellPage() {
  const { data: session } = useSession()

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  // --- AI-MODIFIED (2026-03-26) ---
  // Purpose: Use string state for price input so the field can be cleared while typing
  // (number state with || 1 fallback forced the value to 1 on empty, preventing prices not starting with 1)
  const [priceInput, setPriceInput] = useState("10")
  const pricePerUnit = parseInt(priceInput) || 0
  // --- END AI-MODIFIED ---
  const [currency, setCurrency] = useState<"GOLD" | "GEMS">("GOLD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("All")
  const [invSearch, setInvSearch] = useState("")

  const { data: invData, isLoading: invLoading } = useDashboard<any>(
    session ? "/api/pet/inventory?includeAll=true" : null
  )
  const { data: historyData } = useDashboard<any>(
    selectedItem ? `/api/pet/marketplace/history?itemId=${selectedItem.item.id}&days=30` : null
  )

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

  const filteredItems = useMemo(() => {
    let items = tradeableItems
    if (categoryTab !== "All") {
      items = items.filter((i) => mapCategory(i.item.category) === categoryTab)
    }
    if (invSearch) {
      const q = invSearch.toLowerCase()
      items = items.filter((i) => i.item.name.toLowerCase().includes(q))
    }
    return items
  }, [tradeableItems, categoryTab, invSearch])

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
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to PetShell for consistent layout */}
        {/* --- Original code (commented out for rollback) ---
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
        --- End original code --- */}
        <PetShell>
        {/* --- END AI-REPLACED --- */}

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

              {/* Inventory Browser */}
              <div className="border-2 border-[#2a3a5c] bg-[#0c1020] shadow-[2px_2px_0_#060810]">
                {/* Tab bar + search */}
                <div className="flex items-center gap-2 border-b-2 border-[#1a2a3c] px-3 py-2 flex-wrap">
                  {/* --- AI-REPLACED (2026-03-24) --- */}
                  {/* Reason: Migrated category tabs to shared PixelTabBar component */}
                  {/* --- Original code (commented out for rollback) ---
                  {CATEGORY_TABS.map((tab) => (
                    <button key={tab} onClick={() => setCategoryTab(tab)}
                      className={cn("font-pixel text-[11px] px-3 py-1.5 border-2 transition-all",
                        categoryTab === tab ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff]"
                          : "border-transparent text-[#4a5a6a] hover:text-[#8899aa]"
                      )}>{tab}</button>
                  ))}
                  --- End original code --- */}
                  <PixelTabBar tabs={CATEGORY_TABS} active={categoryTab} onChange={(k) => setCategoryTab(k as CategoryTab)} />
                  <div className="ml-auto relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#4a5a6a]" />
                    <input
                      type="text" value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      placeholder="Search..."
                      className="font-pixel text-[10px] pl-7 pr-2 py-1.5 w-36 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a6a] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    />
                  </div>
                </div>

                {/* Item grid */}
                <div className="p-3 max-h-[320px] overflow-y-auto">
                  {invLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-24 border-2 border-[#1a2a3c] bg-[#080c18] animate-pulse" />
                      ))}
                    </div>
                  ) : !filteredItems.length ? (
                    <div className="text-center py-8">
                      <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                        {tradeableItems.length === 0 ? "No tradeable items in your inventory." : "No items match this filter."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {filteredItems.map((inv) => {
                        const imgUrl = getItemImageUrl(inv.item.assetPath, inv.item.category)
                        const isSelected = selectedItem?.inventoryId === inv.inventoryId
                        const bc = RARITY_BORDER[inv.item.rarity] || "#6a7080"
                        return (
                          <ItemTooltip key={inv.inventoryId} inv={inv}>
                            <button
                              onClick={() => { setSelectedItem(inv); setQuantity(1) }}
                              className={cn(
                                "border-2 p-2 flex flex-col items-center gap-1 transition-all text-center w-full",
                                isSelected
                                  ? "bg-[#101830] shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]"
                                  : "bg-[#080c18] hover:bg-[#0f1628]"
                              )}
                              style={{ borderColor: isSelected ? "#4080f0" : bc }}
                            >
                              <div className="relative w-11 h-11 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                                {imgUrl ? (
                                  <CroppedItemImage src={imgUrl} alt={inv.item.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-base">{getCategoryPlaceholder(inv.item.category)}</span>
                                )}
                                {inv.enhancementLevel > 0 && (
                                  <span className="font-pixel absolute -top-1.5 -right-1.5 px-1 py-0 text-[9px] border bg-[#2a7a3a]/80 border-[#40d870] text-[#d0ffd8]">
                                    +{inv.enhancementLevel}
                                  </span>
                                )}
                              </div>
                              <span className="font-pixel text-[10px] truncate w-full"
                                style={{ color: RARITY_TEXT[inv.item.rarity] || "#a0a8b4" }}>
                                {inv.item.name}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-pixel text-[9px] text-[#4a5a6a]">x{inv.quantity}</span>
                                {inv.glowTier !== "none" && (
                                  <span className={cn("font-pixel text-[7px]", GLOW_TEXT_COLORS[inv.glowTier])}>{GLOW_LABELS[inv.glowTier]}</span>
                                )}
                              </div>
                            </button>
                          </ItemTooltip>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Item Panel */}
              {selectedItem ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Detail */}
                  <PixelCard borderColor={RARITY_BORDER[selectedItem.item.rarity]} corners className="p-3 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-2 bg-[#080c18] overflow-hidden"
                        style={{ borderColor: `${RARITY_BORDER[selectedItem.item.rarity]}80` }}>
                        {getItemImageUrl(selectedItem.item.assetPath, selectedItem.item.category) ? (
                          <CroppedItemImage src={getItemImageUrl(selectedItem.item.assetPath, selectedItem.item.category)!}
                            alt={selectedItem.item.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl">{getCategoryPlaceholder(selectedItem.item.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)] truncate">{selectedItem.item.name}</span>
                          {selectedItem.enhancementLevel > 0 && (
                            <span className="font-pixel text-sm text-[var(--pet-gold,#f0c040)]">+{selectedItem.enhancementLevel}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <PixelBadge rarity={selectedItem.item.rarity} className="text-[9px] px-1.5 py-0" />
                          {selectedItem.glowTier !== "none" && (
                            <span className={cn("font-pixel text-[9px]", GLOW_TEXT_COLORS[selectedItem.glowTier])}>{GLOW_LABELS[selectedItem.glowTier]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedItem.item.description && (
                      <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] italic leading-relaxed">{selectedItem.item.description}</p>
                    )}
                    <div className="border-t border-[#1a2a3c] pt-2 space-y-1">
                      {selectedItem.item.slot && (
                        <div className="flex justify-between">
                          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Slot</span>
                          <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)]">{selectedItem.item.slot}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Enhancement</span>
                        <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)]">+{selectedItem.enhancementLevel} / {selectedItem.maxLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Quantity</span>
                        <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)]">x{selectedItem.quantity}</span>
                      </div>
                      {selectedItem.totalBonus > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Gold Bonus</span>
                            <span className="font-pixel text-[9px] text-[var(--pet-gold,#f0c040)]">+{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_GOLD_BONUS * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">XP Bonus</span>
                            <span className="font-pixel text-[9px] text-[#40d870]">+{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_XP_BONUS * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Drop Rate</span>
                            <span className="font-pixel text-[9px] text-[#4080f0]">+{(selectedItem.totalBonus * GAME_CONSTANTS.ENHANCEMENT_DROP_BONUS * 100).toFixed(2)}%</span>
                          </div>
                        </>
                      )}
                      {selectedItem.slots.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Scroll Upgrades</span>
                          <span className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)]">{selectedItem.slots.length}</span>
                        </div>
                      )}
                    </div>
                  </PixelCard>

                  {/* Pricing */}
                  <PixelCard className="p-3 space-y-3" corners>
                    <div>
                      <label className="font-pixel text-[11px] text-[#4a5a6a] block mb-1">QTY (max {selectedItem.quantity})</label>
                      <input type="range" min={1} max={selectedItem.quantity} value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full accent-[var(--pet-blue,#4080f0)]" />
                      <div className="flex justify-between font-pixel text-[11px] text-[#4a5a6a]">
                        <span>1</span>
                        <span className="text-[var(--pet-text,#e2e8f0)]">{quantity}</span>
                        <span>{selectedItem.quantity}</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-pixel text-[11px] text-[#4a5a6a] block mb-1">CURRENCY</label>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrency("GOLD")}
                          className={cn("font-pixel text-[12px] flex-1 py-2 border-2 flex items-center justify-center gap-1.5 transition-all",
                            currency === "GOLD" ? "border-[var(--pet-gold,#f0c040)] bg-[#f0c04010] text-[var(--pet-gold,#f0c040)]" : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]")}>
                          <Coins size={14} /> Gold
                        </button>
                        <button onClick={() => setCurrency("GEMS")}
                          className={cn("font-pixel text-[12px] flex-1 py-2 border-2 flex items-center justify-center gap-1.5 transition-all",
                            currency === "GEMS" ? "border-[#a855f7] bg-[#a855f710] text-[#a855f7]" : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]")}>
                          <Gem size={14} /> Gems
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-pixel text-[11px] text-[#4a5a6a] block mb-1">PRICE PER UNIT</label>
                      {/* --- AI-MODIFIED (2026-03-26) --- */}
                      {/* Purpose: Allow free typing in price field; validate on blur instead of every keystroke */}
                      <input type="number" min={1} value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        onBlur={() => { if (!priceInput || parseInt(priceInput) < 1) setPriceInput("1") }}
                        className="font-pixel text-sm w-full py-2 px-3 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]" />
                      {/* --- END AI-MODIFIED --- */}
                      {historyData?.summary?.avgPrice > 0 && (
                        <p className="font-pixel text-[9px] text-[#4a5a6a] mt-1">
                          Suggested: ~{historyData.summary.avgPrice.toLocaleString()} (30d avg)
                        </p>
                      )}
                    </div>

                    <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[11px] text-[#4a5a6a]">Revenue</span>
                        <GoldDisplay amount={totalPrice} size="lg" type={currency === "GOLD" ? "gold" : "gem"} />
                      </div>
                      <p className="font-pixel text-[9px] text-[#4a5a6a] mt-1">
                        {quantity}x at {pricePerUnit} {currency} each. 7-day expiry.
                      </p>
                    </div>

                    <PixelButton onClick={handleList} disabled={loading} loading={loading} variant="primary" size="lg" className="w-full">
                      {loading ? "LISTING..." : "LIST FOR SALE"}
                    </PixelButton>
                  </PixelCard>

                  {/* Market Intel */}
                  <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-3 space-y-3 shadow-[2px_2px_0_#060810]">
                    <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5">
                      <BarChart2 size={12} /> MARKET INTEL
                    </h4>
                    {historyData?.summary && (historyData.summary.totalSales > 0 || historyData.summary.activeListings > 0) ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                            <p className="font-pixel text-[9px] text-[#4a5a70] uppercase">Avg (30d)</p>
                            <div className="mt-0.5">
                              {historyData.summary.avgPrice > 0
                                ? <GoldDisplay amount={historyData.summary.avgPrice} size="sm" />
                                : <span className="font-pixel text-xs text-[#4a5a70]">--</span>}
                            </div>
                          </div>
                          <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                            <p className="font-pixel text-[9px] text-[#4a5a70] uppercase">Trend</p>
                            <div className={cn("flex items-center justify-center gap-1 mt-0.5 font-pixel text-xs", trendColor)}>
                              <TrendIcon size={12} /> {trendLabel}
                            </div>
                          </div>
                          <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                            <p className="font-pixel text-[9px] text-[#4a5a70] uppercase">Traded</p>
                            <p className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)] mt-0.5">{historyData.summary.totalVolume}</p>
                          </div>
                          <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 text-center">
                            <p className="font-pixel text-[9px] text-[#4a5a70] uppercase">Active</p>
                            <p className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)] mt-0.5">{historyData.summary.activeListings}</p>
                          </div>
                        </div>

                        {historyData.summary.lowestPrice && (
                          <div className="border-2 border-[#1a2a3c] bg-[#0f1628] p-2 flex items-center justify-between">
                            <span className="font-pixel text-[9px] text-[#4a5a70]">LOWEST</span>
                            <GoldDisplay amount={historyData.summary.lowestPrice.price} size="sm"
                              type={historyData.summary.lowestPrice.currency === "GOLD" ? "gold" : "gem"} />
                          </div>
                        )}

                        <div>
                          <p className="font-pixel text-[9px] text-[#4a5a70] uppercase mb-1">Price History</p>
                          <PriceChart data={historyData?.priceHistory ?? []} height={120} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <ShoppingCart size={20} className="mx-auto text-[#1a2a3c] mb-2" />
                        <p className="font-pixel text-[12px] text-[#4a5a70]">NO DATA YET</p>
                        <p className="font-pixel text-[9px] text-[#3a4a60] mt-1">Be the first to set the price!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <PixelCard className="p-8 text-center" corners>
                  <ShoppingCart size={28} className="mx-auto text-[#2a3a5c] mb-3" />
                  <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                    SELECT AN ITEM ABOVE TO LIST IT FOR SALE
                  </p>
                  <p className="font-pixel text-[10px] text-[#3a4a60] mt-2">
                    Hover over items for full details
                  </p>
                </PixelCard>
              )}

        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}
// --- END AI-MODIFIED ---

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
