// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace browse page - stats banner, trending,
//          listing grid, buy dialog, filters, URL state sync
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Store, Search, Plus, Coins, Gem, ChevronLeft, ChevronRight, PackageOpen,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import RarityPills from "@/components/pet/wiki/RarityPills"
import CategoryChips from "@/components/pet/wiki/CategoryChips"
import ListingCard from "@/components/pet/marketplace/ListingCard"
import BuyDialog from "@/components/pet/marketplace/BuyDialog"
import MarketStats from "@/components/pet/marketplace/MarketStats"
import TrendingRow from "@/components/pet/marketplace/TrendingRow"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "price_asc", label: "Price Low-High" },
  { value: "price_desc", label: "Price High-Low" },
]

export default function MarketplacePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const q = router.query
  const [search, setSearch] = useState((q.q as string) || "")
  const [category, setCategory] = useState((q.cat as string) || "")
  const [selectedRarities, setSelectedRarities] = useState<Set<string>>(() => {
    const r = (q.rarity as string) || ""
    return new Set(r.split(",").filter(Boolean))
  })
  const [currency, setCurrency] = useState((q.currency as string) || "")
  const [sort, setSort] = useState((q.sort as string) || "newest")
  const [page, setPage] = useState(parseInt(q.page as string) || 1)
  const [buyTarget, setBuyTarget] = useState<any>(null)

  const queryStr = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set("search", search)
    if (category) p.set("category", category)
    if (selectedRarities.size) p.set("rarity", Array.from(selectedRarities).join(","))
    if (currency) p.set("currency", currency)
    p.set("sort", sort)
    p.set("page", String(page))
    return p.toString()
  }, [search, category, selectedRarities, currency, sort, page])

  const { data: statsData } = useDashboard<any>(session ? "/api/pet/marketplace/stats" : null)
  const { data: listingsData, isLoading } = useDashboard<any>(session ? `/api/pet/marketplace?${queryStr}` : null)
  const { data: metaData } = useDashboard<any>(session ? "/api/pet/wiki/meta" : null)

  const handleBuy = useCallback(async (listingId: number, quantity: number) => {
    const res = await fetch("/api/pet/marketplace/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, quantity }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Purchase failed")
    invalidatePrefix("/api/pet/marketplace")
    return data
  }, [])

  return (
    <Layout SEO={{ title: "Marketplace - LionGotchi", description: "Buy and sell items on the LionGotchi marketplace" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Store size={24} className="text-emerald-400" />
                    Marketplace
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Buy and sell items with other players
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/pet/marketplace/my-listings">
                    <button className="px-4 py-2 rounded-lg bg-muted/20 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/30">
                      My Listings
                    </button>
                  </Link>
                  <Link href="/pet/marketplace/sell">
                    <button className="px-4 py-2 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors flex items-center gap-1.5">
                      <Plus size={14} /> Sell Items
                    </button>
                  </Link>
                </div>
              </div>

              <MarketStats data={statsData} />
              {statsData?.trendingItems?.length > 0 && <TrendingRow items={statsData.trendingItems} />}

              {/* Filters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <input
                      type="text" value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Search items..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <div className="flex border border-border/30 rounded-lg overflow-hidden">
                    {[
                      { val: "", label: "All", icon: null },
                      { val: "GOLD", label: "", icon: <Coins size={12} className="text-amber-400" /> },
                      { val: "GEMS", label: "", icon: <Gem size={12} className="text-cyan-400" /> },
                    ].map((c) => (
                      <button
                        key={c.val}
                        onClick={() => { setCurrency(c.val); setPage(1) }}
                        className={`px-2.5 py-2 text-[10px] font-medium transition-colors flex items-center gap-1 ${
                          currency === c.val ? "bg-primary/15 text-primary" : "text-muted-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {c.icon}{c.label || (!c.icon ? "All" : "")}
                      </button>
                    ))}
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1) }}
                    className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground focus:outline-none"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <RarityPills selected={selectedRarities} onChange={(s) => { setSelectedRarities(s); setPage(1) }} />
                {metaData?.categories && (
                  <CategoryChips categories={metaData.categories} selected={category} onChange={(c) => { setCategory(c); setPage(1) }} />
                )}
              </div>

              {/* Listings Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
              ) : listingsData?.listings?.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {listingsData.listings.map((l: any) => (
                      <ListingCard key={l.listingId} listing={l} onBuy={setBuyTarget} />
                    ))}
                  </div>

                  {listingsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                        className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs text-muted-foreground/50">
                        Page {listingsData.pagination.page} of {listingsData.pagination.totalPages}
                      </span>
                      <button onClick={() => setPage(Math.min(listingsData.pagination.totalPages, page + 1))} disabled={page >= listingsData.pagination.totalPages}
                        className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <PackageOpen size={40} className="mx-auto text-muted-foreground/15 mb-3" />
                  <p className="text-sm text-muted-foreground/50">No listings found</p>
                  <p className="text-xs text-muted-foreground/30 mt-1">
                    {search || category || selectedRarities.size
                      ? "Try adjusting your filters"
                      : "The marketplace is empty -- be the first to list an item!"}
                  </p>
                  <Link href="/pet/marketplace/sell">
                    <button className="mt-4 px-4 py-2 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors">
                      Start Selling
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {buyTarget && (
          <BuyDialog listing={buyTarget} onClose={() => setBuyTarget(null)} onConfirm={handleBuy} />
        )}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
