// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace browse page - stats banner, trending,
//          listing grid, buy dialog, filters, URL state sync
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Import ScrollText icon for "Has Scrolls" filter toggle
import {
  Search, Coins, Gem, ChevronLeft, ChevronRight, ScrollText,
} from "lucide-react"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import RarityPills from "@/components/pet/wiki/RarityPills"
import CategoryChips from "@/components/pet/wiki/CategoryChips"
import ListingCard from "@/components/pet/marketplace/ListingCard"
import BuyDialog from "@/components/pet/marketplace/BuyDialog"
import MarketStats from "@/components/pet/marketplace/MarketStats"
import TrendingRow from "@/components/pet/marketplace/TrendingRow"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelCard from "@/components/pet/ui/PixelCard"

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Add enhancement/bonus sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "price_asc", label: "Price Low-High" },
  { value: "price_desc", label: "Price High-Low" },
  { value: "enhancement_desc", label: "Enhancement High" },
  { value: "bonus_desc", label: "Bonus High" },
]
// --- END AI-MODIFIED ---

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
  // --- AI-MODIFIED (2026-03-21) ---
  // Purpose: Enhancement/scroll filter state
  const [minEnhancement, setMinEnhancement] = useState(parseInt(q.minEnh as string) || 0)
  const [hasScrolls, setHasScrolls] = useState(q.scrolls === "true")
  // --- END AI-MODIFIED ---

  const queryStr = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set("search", search)
    if (category) p.set("category", category)
    if (selectedRarities.size) p.set("rarity", Array.from(selectedRarities).join(","))
    if (currency) p.set("currency", currency)
    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Include enhancement/scroll filters in API query
    if (minEnhancement > 0) p.set("minEnhancement", String(minEnhancement))
    if (hasScrolls) p.set("hasScrolls", "true")
    // --- END AI-MODIFIED ---
    p.set("sort", sort)
    p.set("page", String(page))
    return p.toString()
  }, [search, category, selectedRarities, currency, sort, page, minEnhancement, hasScrolls])

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
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              {/* Title + Actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                    MARKETPLACE
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  </h1>
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
                  <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                    Buy and sell items with other players
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/pet/marketplace/my-listings">
                    <PixelButton variant="ghost" size="sm">My Listings</PixelButton>
                  </Link>
                  <Link href="/pet/marketplace/sell">
                    <PixelButton variant="primary" size="sm">+ Sell Items</PixelButton>
                  </Link>
                </div>
              </div>

              <MarketStats data={statsData} />
              {statsData?.trendingItems?.length > 0 && <TrendingRow items={statsData.trendingItems} />}

              {/* Filters */}
              <div className="space-y-3">
                {/* --- AI-MODIFIED (2026-03-21) --- */}
                {/* Purpose: Wrap filter row on mobile so search goes full-width */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 w-full sm:w-auto min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a6a]" />
                {/* --- END AI-MODIFIED --- */}
                    <input
                      type="text" value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Search items..."
                      className="font-pixel text-sm w-full pl-10 pr-3 py-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a6a] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    />
                  </div>
                  <div className="flex border-2 border-[#2a3a5c] overflow-hidden">
                    {[
                      { val: "", label: "ALL" },
                      { val: "GOLD", label: "", icon: <Coins size={16} className="text-[var(--pet-gold,#f0c040)]" /> },
                      { val: "GEMS", label: "", icon: <Gem size={16} className="text-[#a855f7]" /> },
                    ].map((c) => (
                      <button
                        key={c.val}
                        onClick={() => { setCurrency(c.val); setPage(1) }}
                        className={`font-pixel text-[13px] px-3 py-2.5 transition-all flex items-center gap-1.5 ${
                          currency === c.val
                            ? "bg-[#101830] text-[#80b0ff]"
                            : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                        } ${c.val !== "" ? "border-l-2 border-[#2a3a5c]" : ""}`}
                      >
                        {c.icon}{c.label || (!c.icon ? "ALL" : "")}
                      </button>
                    ))}
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1) }}
                    className="font-pixel text-sm px-3 py-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <RarityPills selected={selectedRarities} onChange={(s) => { setSelectedRarities(s); setPage(1) }} />
                {metaData?.categories && (
                  <CategoryChips categories={metaData.categories} selected={category} onChange={(c) => { setCategory(c); setPage(1) }} />
                )}

                {/* --- AI-MODIFIED (2026-03-21) --- */}
                {/* Purpose: Enhancement level and scroll filter controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setHasScrolls(!hasScrolls); setPage(1) }}
                    className={`font-pixel text-[12px] px-3 py-2 border-2 flex items-center gap-1.5 transition-all ${
                      hasScrolls
                        ? "border-[#6090e0] bg-[#4060a0]/20 text-[#c0d8ff]"
                        : "border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                    }`}
                  >
                    <ScrollText size={14} /> Has Scrolls
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[11px] text-[#4a5a6a]">Min +</span>
                    <select
                      value={minEnhancement}
                      onChange={(e) => { setMinEnhancement(parseInt(e.target.value)); setPage(1) }}
                      className="font-pixel text-[12px] px-2 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    >
                      <option value={0}>Any</option>
                      {[1, 2, 3, 5, 7, 10].map((v) => (
                        <option key={v} value={v}>+{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* --- END AI-MODIFIED --- */}
              </div>

              {/* Listings Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="h-48 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                  ))}
                </div>
              ) : listingsData?.listings?.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {listingsData.listings.map((l: any) => (
                      <ListingCard key={l.listingId} listing={l} onBuy={setBuyTarget} />
                    ))}
                  </div>

                  {listingsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="font-pixel p-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-pixel text-[13px] text-[#4a5a6a] px-3">
                        Page {listingsData.pagination.page} / {listingsData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(listingsData.pagination.totalPages, page + 1))}
                        disabled={page >= listingsData.pagination.totalPages}
                        className="font-pixel p-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <PixelCard className="py-16 text-center" corners>
                  <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">
                    NO LISTINGS FOUND
                  </p>
                  <p className="font-pixel text-[13px] text-[#4a5a6a] mt-1">
                    {search || category || selectedRarities.size || hasScrolls || minEnhancement > 0
                      ? "Try adjusting your filters"
                      : "The marketplace is empty -- be the first to list an item!"}
                  </p>
                  <Link href="/pet/marketplace/sell">
                    <PixelButton variant="primary" size="sm" className="mt-4">
                      START SELLING
                    </PixelButton>
                  </Link>
                </PixelCard>
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
