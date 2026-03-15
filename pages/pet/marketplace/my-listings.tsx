// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Seller dashboard - active listings, sales history,
//          revenue summary
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ArrowLeft, Coins, Gem, Clock, X, ShoppingBag, History, DollarSign,
  CheckCircle, XCircle, AlertTriangle, Plus,
} from "lucide-react"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}

const STATUS_STYLE: Record<string, { icon: any; color: string; label: string }> = {
  SOLD: { icon: CheckCircle, color: "text-emerald-400", label: "Sold" },
  CANCELLED: { icon: XCircle, color: "text-muted-foreground/50", label: "Cancelled" },
  EXPIRED: { icon: AlertTriangle, color: "text-amber-400", label: "Expired" },
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expired"
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d ${h % 24}h left`
}

type DashTab = "active" | "history" | "sales"

export default function MyListingsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<DashTab>("active")
  const [cancelling, setCancelling] = useState<number | null>(null)

  const { data, isLoading, mutate } = useDashboard<any>(session ? "/api/pet/marketplace/my-listings" : null)

  async function handleCancel(listingId: number) {
    setCancelling(listingId)
    try {
      const res = await fetch("/api/pet/marketplace/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        invalidatePrefix("/api/pet/marketplace")
        mutate()
      }
    } finally {
      setCancelling(null)
    }
  }

  return (
    <Layout SEO={{ title: "My Listings - Marketplace", description: "Manage your marketplace listings" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <Link href="/pet/marketplace" className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
                <ArrowLeft size={12} /> Back to Marketplace
              </Link>

              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-400" /> My Listings
                </h1>
                <Link href="/pet/marketplace/sell">
                  <button className="px-4 py-2 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors flex items-center gap-1.5">
                    <Plus size={14} /> Sell More
                  </button>
                </Link>
              </div>

              {/* Revenue Summary */}
              {data?.revenue && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                    <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Coins size={10} /> Gold Earned</span>
                    <p className="text-lg font-bold text-amber-400 mt-1">{data.revenue.totalGold.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                    <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Gem size={10} /> Gems Earned</span>
                    <p className="text-lg font-bold text-cyan-400 mt-1">{data.revenue.totalGems.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                    <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><DollarSign size={10} /> Items Sold</span>
                    <p className="text-lg font-bold mt-1">{data.revenue.totalSales}</p>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2">
                {([
                  { key: "active" as DashTab, label: "Active Listings", icon: <ShoppingBag size={14} /> },
                  { key: "history" as DashTab, label: "Past Listings", icon: <History size={14} /> },
                  { key: "sales" as DashTab, label: "Sales Log", icon: <DollarSign size={14} /> },
                ]).map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      tab === t.key ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-transparent hover:text-foreground"}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : (
                <>
                  {/* Active */}
                  {tab === "active" && (
                    <div className="space-y-2">
                      {!data?.active?.length ? (
                        <div className="text-center py-12 text-xs text-muted-foreground/40">
                          No active listings.
                          <Link href="/pet/marketplace/sell" className="text-primary ml-1 hover:underline">List an item?</Link>
                        </div>
                      ) : data.active.map((l: any) => {
                        const imgUrl = getItemImageUrl(l.item.assetPath, l.item.category)
                        const CIcon = l.currency === "GOLD" ? Coins : Gem
                        const cColor = l.currency === "GOLD" ? "text-amber-400" : "text-cyan-400"
                        const sold = l.quantityListed - l.quantityRemaining
                        const pct = l.quantityListed > 0 ? Math.round((sold / l.quantityListed) * 100) : 0
                        return (
                          <div key={l.listingId} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/20 bg-muted/5">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                              {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                                : <span className="text-lg">{getCategoryPlaceholder(l.item.category)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-semibold truncate", rarityColor[l.item.rarity])}>{l.item.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 mt-0.5">
                                <span className={cn("flex items-center gap-0.5", cColor)}><CIcon size={9} /> {l.pricePerUnit} each</span>
                                <span>{l.quantityRemaining}/{l.quantityListed} remaining</span>
                                <span className="flex items-center gap-0.5"><Clock size={8} /> {timeLeft(l.expiresAt)}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted/20 mt-1 overflow-hidden w-32">
                                <div className="h-full rounded-full bg-primary/40" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <button onClick={() => handleCancel(l.listingId)} disabled={cancelling === l.listingId}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
                              {cancelling === l.listingId ? "..." : "Cancel"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Past Listings */}
                  {tab === "history" && (
                    <div className="space-y-2">
                      {!data?.past?.length ? (
                        <div className="text-center py-12 text-xs text-muted-foreground/40">No past listings.</div>
                      ) : data.past.map((l: any) => {
                        const st = STATUS_STYLE[l.status] ?? STATUS_STYLE.CANCELLED
                        const StatusIcon = st.icon
                        return (
                          <div key={l.listingId} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/10 bg-muted/3">
                            <StatusIcon size={14} className={st.color} />
                            <span className={cn("text-xs font-medium flex-1 truncate", rarityColor[l.item.rarity])}>{l.item.name}</span>
                            <span className="text-[10px] text-muted-foreground/40">{l.quantityListed - l.quantityRemaining}/{l.quantityListed} sold</span>
                            <span className={cn("text-[10px] font-semibold", st.color)}>{st.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Sales Log */}
                  {tab === "sales" && (
                    <div className="space-y-2">
                      {!data?.sales?.length ? (
                        <div className="text-center py-12 text-xs text-muted-foreground/40">No sales yet -- list some items!</div>
                      ) : data.sales.map((s: any, i: number) => {
                        const CIcon = s.currency === "GOLD" ? Coins : Gem
                        const cColor = s.currency === "GOLD" ? "text-amber-400" : "text-cyan-400"
                        return (
                          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/10 bg-muted/3">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                              <span className="text-xs truncate">
                                <span className="text-muted-foreground/60">{s.buyerName}</span> bought <span className="font-medium">{s.quantity}x {s.itemName}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={cn("text-xs font-bold flex items-center gap-0.5", cColor)}><CIcon size={10} /> {s.totalPrice.toLocaleString()}</span>
                              <span className="text-[9px] text-muted-foreground/30">{new Date(s.soldAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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
