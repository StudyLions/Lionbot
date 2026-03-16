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
import { useRouter } from "next/router"
import {
  Coins, Gem, Check, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import dynamic from "next/dynamic"
import { GetServerSideProps } from "next"

const PriceChart = dynamic(() => import("@/components/pet/marketplace/PriceChart"), { ssr: false })
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7080", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff60a0",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

interface InvItem {
  id: number; name: string; category: string; rarity: string; assetPath: string
  quantity: number; enhancementLevel: number; tradeable: boolean; inventoryId: number
}

export default function SellPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [selectedItem, setSelectedItem] = useState<InvItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [pricePerUnit, setPricePerUnit] = useState<number>(10)
  const [currency, setCurrency] = useState<"GOLD" | "GEMS">("GOLD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { data: invData, isLoading: invLoading } = useDashboard<any>(
    session ? "/api/pet/inventory?includeAll=true" : null
  )
  const { data: historyData } = useDashboard<any>(
    selectedItem ? `/api/pet/marketplace/history?itemId=${selectedItem.id}&days=7` : null
  )

  const tradeableItems = useMemo(() => {
    if (!invData?.items) return []
    return invData.items.map((i: any) => ({
      id: i.item.id, name: i.item.name, category: i.item.category, rarity: i.item.rarity,
      assetPath: i.item.assetPath, quantity: i.quantity, enhancementLevel: i.enhancementLevel ?? 0,
      tradeable: true, inventoryId: i.inventoryId,
    }))
  }, [invData])

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
          itemId: selectedItem.id,
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

  return (
    <Layout SEO={{ title: "Sell Items - Marketplace", description: "List items for sale on the marketplace" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <Link href="/pet/marketplace" className="font-pixel text-[10px] text-[#4a5a70] hover:text-[#8899aa] transition-colors inline-flex items-center gap-1.5">
                <span>&#x25C4;</span> Back to Marketplace
              </Link>

              <div>
                <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  SELL ITEMS
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                </h1>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
              </div>

              {success && (
                <div className="border-2 border-[#40d870] bg-[#40d87010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                  <Check size={14} className="text-[var(--pet-green,#40d870)]" />
                  <span className="font-pixel text-[10px] text-[#80ffb0]">{success}</span>
                </div>
              )}
              {error && (
                <div className="border-2 border-[#e04040] bg-[#e0404010] p-3 flex items-center gap-2 shadow-[2px_2px_0_#060810]">
                  <AlertCircle size={14} className="text-[var(--pet-red,#e04040)]" />
                  <span className="font-pixel text-[10px] text-[#ff8080]">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Step 1: Pick Item */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                    1. SELECT AN ITEM FROM YOUR INVENTORY
                  </h3>

                  {invLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-24 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                      ))}
                    </div>
                  ) : !tradeableItems.length ? (
                    <PixelCard className="p-8 text-center" corners>
                      <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                        No tradeable items in your inventory.
                      </p>
                    </PixelCard>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {tradeableItems.map((item: InvItem) => {
                        const imgUrl = getItemImageUrl(item.assetPath, item.category)
                        const isSelected = selectedItem?.inventoryId === item.inventoryId
                        const bc = RARITY_BORDER[item.rarity] || "#6a7080"
                        return (
                          <button
                            key={item.inventoryId}
                            onClick={() => { setSelectedItem(item); setQuantity(1) }}
                            className={`border-2 p-2 flex flex-col items-center gap-1 transition-all text-center ${
                              isSelected
                                ? "bg-[#101830] shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]"
                                : "bg-[#0c1020] hover:bg-[#0f1628]"
                            }`}
                            style={{ borderColor: isSelected ? "#4080f0" : `${bc}40` }}
                          >
                            <div className="w-10 h-10 flex items-center justify-center border border-[#1a2a3c] bg-[#080c18]">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                              ) : (
                                <span className="text-lg">{getCategoryPlaceholder(item.category)}</span>
                              )}
                            </div>
                            <span
                              className="font-pixel text-[9px] truncate w-full"
                              style={{ color: RARITY_TEXT[item.rarity] || "#a0a8b4" }}
                            >
                              {item.name}
                            </span>
                            <span className="font-pixel text-[8px] text-[#4a5a6a]">
                              x{item.quantity}
                              {item.enhancementLevel > 0 && ` +${item.enhancementLevel}`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Step 2+3: Pricing */}
                <div className="space-y-4">
                  {selectedItem ? (
                    <>
                      <h3 className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                        2. SET PRICE AND QUANTITY
                      </h3>

                      <PixelCard className="p-4 space-y-4" corners>
                        <div>
                          <label className="font-pixel text-[9px] text-[#4a5a6a] block mb-1">
                            QUANTITY (max {selectedItem.quantity})
                          </label>
                          <input
                            type="range" min={1} max={selectedItem.quantity} value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full accent-[var(--pet-blue,#4080f0)]"
                          />
                          <div className="flex justify-between font-pixel text-[9px] text-[#4a5a6a]">
                            <span>1</span>
                            <span className="text-[var(--pet-text,#e2e8f0)]">{quantity}</span>
                            <span>{selectedItem.quantity}</span>
                          </div>
                        </div>

                        <div>
                          <label className="font-pixel text-[9px] text-[#4a5a6a] block mb-1">CURRENCY</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrency("GOLD")}
                              className={`font-pixel text-[10px] flex-1 py-2 border-2 flex items-center justify-center gap-1 transition-all ${
                                currency === "GOLD"
                                  ? "border-[var(--pet-gold,#f0c040)] bg-[#f0c04010] text-[var(--pet-gold,#f0c040)]"
                                  : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                              }`}
                            >
                              <Coins size={12} /> Gold
                            </button>
                            <button
                              onClick={() => setCurrency("GEMS")}
                              className={`font-pixel text-[10px] flex-1 py-2 border-2 flex items-center justify-center gap-1 transition-all ${
                                currency === "GEMS"
                                  ? "border-[#a855f7] bg-[#a855f710] text-[#a855f7]"
                                  : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                              }`}
                            >
                              <Gem size={12} /> Gems
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="font-pixel text-[9px] text-[#4a5a6a] block mb-1">PRICE PER UNIT</label>
                          <input
                            type="number" min={1} value={pricePerUnit}
                            onChange={(e) => setPricePerUnit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="font-pixel text-[11px] w-full py-2 px-3 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                          />
                        </div>

                        <div className="border-2 border-[#2a3a5c] bg-[#080c18] p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-[9px] text-[#4a5a6a]">Total Revenue</span>
                            <GoldDisplay
                              amount={totalPrice}
                              size="lg"
                              type={currency === "GOLD" ? "gold" : "gem"}
                            />
                          </div>
                          <p className="font-pixel text-[8px] text-[#4a5a6a] mt-1">
                            {quantity}x {selectedItem.name} at {pricePerUnit} {currency} each. Expires in 7 days.
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

                      {/* Price Reference */}
                      <div className="space-y-2">
                        <h4 className="font-pixel text-[9px] uppercase text-[var(--pet-gold,#f0c040)]">
                          RECENT PRICES FOR {selectedItem.name}
                        </h4>
                        <PriceChart data={historyData?.priceHistory ?? []} height={120} />
                        {historyData?.summary && (
                          <div className="flex gap-3 font-pixel text-[9px] text-[#4a5a6a]">
                            <span>Avg: {historyData.summary.avgPrice || "--"}</span>
                            <span>Trades: {historyData.summary.totalSales}</span>
                            <span>Listed: {historyData.summary.activeListings}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <PixelCard className="p-8 text-center" corners>
                      <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
                        SELECT AN ITEM FROM YOUR INVENTORY TO LIST IT FOR SALE
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
