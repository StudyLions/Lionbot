// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Sell items page - inventory picker, quantity/price
//          form, price reference panel, confirm listing
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo } from "react"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Coins, Gem, Package, Check, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import PriceChart from "@/components/pet/marketplace/PriceChart"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/15", UNCOMMON: "border-green-500/15", RARE: "border-blue-500/15",
  EPIC: "border-purple-500/15", LEGENDARY: "border-amber-500/15", MYTHICAL: "border-rose-500/15",
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
  const CurrIcon = currency === "GOLD" ? Coins : Gem
  const currColor = currency === "GOLD" ? "text-amber-400" : "text-cyan-400"

  return (
    <Layout SEO={{ title: "Sell Items - Marketplace", description: "List items for sale on the marketplace" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <Link href="/pet/marketplace" className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
                <ArrowLeft size={12} /> Back to Marketplace
              </Link>

              <h1 className="text-xl font-bold flex items-center gap-2">
                <Package size={20} className="text-emerald-400" /> Sell Items
              </h1>

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2 text-xs text-emerald-400">
                  <Check size={14} /> {success}
                </div>
              )}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Step 1: Pick Item */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground/70">1. Select an item from your inventory</h3>

                  {invLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                    </div>
                  ) : !tradeableItems.length ? (
                    <div className="text-center py-8 text-xs text-muted-foreground/40">
                      No tradeable items in your inventory.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {tradeableItems.map((item: InvItem) => {
                        const imgUrl = getItemImageUrl(item.assetPath, item.category)
                        const isSelected = selectedItem?.inventoryId === item.inventoryId
                        return (
                          <button
                            key={item.inventoryId}
                            onClick={() => { setSelectedItem(item); setQuantity(1) }}
                            className={cn(
                              "rounded-xl border p-2 flex flex-col items-center gap-1 transition-all text-center",
                              isSelected
                                ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                                : `${rarityBorder[item.rarity]} bg-muted/5 hover:bg-muted/10`
                            )}
                          >
                            <div className="w-10 h-10 flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                              ) : (
                                <span className="text-lg">{getCategoryPlaceholder(item.category)}</span>
                              )}
                            </div>
                            <span className={cn("text-[10px] font-semibold truncate w-full", rarityColor[item.rarity])}>
                              {item.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground/40">
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
                      <h3 className="text-sm font-semibold text-muted-foreground/70">2. Set price and quantity</h3>

                      <div className="rounded-xl border border-border/20 bg-muted/5 p-4 space-y-4">
                        <div>
                          <label className="text-[10px] text-muted-foreground/50 block mb-1">Quantity (max {selectedItem.quantity})</label>
                          <input
                            type="range" min={1} max={selectedItem.quantity} value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground/40">
                            <span>1</span>
                            <span className="font-bold text-foreground">{quantity}</span>
                            <span>{selectedItem.quantity}</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground/50 block mb-1">Currency</label>
                          <div className="flex gap-2">
                            <button onClick={() => setCurrency("GOLD")}
                              className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                                currency === "GOLD" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-muted/20 text-muted-foreground/50 border border-transparent"}`}>
                              <Coins size={12} /> Gold
                            </button>
                            <button onClick={() => setCurrency("GEMS")}
                              className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                                currency === "GEMS" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-muted/20 text-muted-foreground/50 border border-transparent"}`}>
                              <Gem size={12} /> Gems
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground/50 block mb-1">Price per unit</label>
                          <input
                            type="number" min={1} value={pricePerUnit}
                            onChange={(e) => setPricePerUnit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full py-2 px-3 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                          />
                        </div>

                        <div className="rounded-lg bg-muted/10 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground/60">Total Revenue</span>
                            <span className={cn("text-lg font-bold flex items-center gap-1", currColor)}>
                              <CurrIcon size={16} /> {totalPrice.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground/30 mt-1">
                            {quantity}x {selectedItem.name} at {pricePerUnit} {currency} each. Expires in 7 days.
                          </p>
                        </div>

                        <button
                          onClick={handleList} disabled={loading}
                          className="w-full py-2.5 rounded-lg bg-primary/20 text-primary text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Listing..." : "List for Sale"}
                        </button>
                      </div>

                      {/* Price Reference */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50">Recent prices for {selectedItem.name}</h4>
                        <PriceChart data={historyData?.priceHistory ?? []} height={120} />
                        {historyData?.summary && (
                          <div className="flex gap-3 text-[10px] text-muted-foreground/40">
                            <span>Avg: {historyData.summary.avgPrice || "--"}</span>
                            <span>Trades: {historyData.summary.totalSales}</span>
                            <span>Listed: {historyData.summary.activeListings}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/30 p-8 text-center">
                      <Package size={24} className="mx-auto text-muted-foreground/15 mb-2" />
                      <p className="text-xs text-muted-foreground/30">Select an item from your inventory to list it for sale</p>
                    </div>
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
