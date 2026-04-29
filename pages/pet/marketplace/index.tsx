// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Marketplace browse page - stats banner, trending,
//          listing grid, buy dialog, filters, URL state sync
// ============================================================

// --- AI-MODIFIED (2026-03-21) ---
// Purpose: Complete redesign -- collapsible filter sidebar, compact
//   stats bar, grid/list toggle, larger cards (4-col max),
//   filter sidebar layout replacing scattered filter rows
// --- Original code: see git history for pre-redesign version ---
import Layout from "@/components/Layout/Layout"
import PetShell from "@/components/pet/PetShell"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard, invalidatePrefix } from "@/hooks/useDashboard"
import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, LayoutGrid, List, ShoppingCart, TrendingUp,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import FilterSidebar, { type FilterState } from "@/components/pet/marketplace/FilterSidebar"
import ListingCard from "@/components/pet/marketplace/ListingCard"
import ListingRow from "@/components/pet/marketplace/ListingRow"
import BuyDialog from "@/components/pet/marketplace/BuyDialog"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelCard from "@/components/pet/ui/PixelCard"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "enhancement_desc", label: "Enh ↓" },
  { value: "bonus_desc", label: "Bonus ↓" },
]

type ViewMode = "grid" | "list"

export default function MarketplacePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const q = router.query
  // --- AI-MODIFIED (2026-04-29) ---
  // Purpose: Marketplace 2.0 Phase 3 -- featuredOnly default false, parsed
  // from `?featured=true` query string so the filter is shareable / bookmarkable.
  const [filters, setFilters] = useState<FilterState>({
    search: (q.q as string) || "",
    category: (q.cat as string) || "",
    rarities: new Set(((q.rarity as string) || "").split(",").filter(Boolean)),
    currency: (q.currency as string) || "",
    minEnhancement: parseInt(q.minEnh as string) || 0,
    hasScrolls: q.scrolls === "true",
    featuredOnly: q.featured === "true",
  })
  // --- END AI-MODIFIED ---
  const [sort, setSort] = useState((q.sort as string) || "newest")
  const [page, setPage] = useState(parseInt(q.page as string) || 1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [buyTarget, setBuyTarget] = useState<any>(null)

  const updateFilters = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: "", category: "", rarities: new Set(), currency: "",
      minEnhancement: 0, hasScrolls: false,
      // --- AI-MODIFIED (2026-04-29) ---
      // Purpose: Marketplace 2.0 Phase 3 -- include in CLEAR ALL.
      featuredOnly: false,
      // --- END AI-MODIFIED ---
    })
    setPage(1)
  }, [])

  const queryStr = useMemo(() => {
    const p = new URLSearchParams()
    if (filters.search) p.set("search", filters.search)
    if (filters.category) p.set("category", filters.category)
    if (filters.rarities.size) p.set("rarity", Array.from(filters.rarities).join(","))
    if (filters.currency) p.set("currency", filters.currency)
    if (filters.minEnhancement > 0) p.set("minEnhancement", String(filters.minEnhancement))
    if (filters.hasScrolls) p.set("hasScrolls", "true")
    // --- AI-MODIFIED (2026-04-29) ---
    // Purpose: Marketplace 2.0 Phase 3 -- propagate to API.
    if (filters.featuredOnly) p.set("featured", "true")
    // --- END AI-MODIFIED ---
    p.set("sort", sort)
    p.set("page", String(page))
    return p.toString()
  }, [filters, sort, page])

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

              {/* Title + Actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                    MARKETPLACE
                    <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  </h1>
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/pet/marketplace/my-listings">
                    <PixelButton variant="ghost" size="sm">My Listings</PixelButton>
                  </Link>
                  <Link href="/pet/marketplace/sell">
                    <PixelButton variant="primary" size="sm">+ Sell</PixelButton>
                  </Link>
                </div>
              </div>

              {/* Compact Stats Bar */}
              {statsData && (
                <div className="flex items-center gap-4 flex-wrap border-2 border-[#2a3a5c] bg-[#0c1020] px-4 py-2 shadow-[2px_2px_0_#060810]">
                  <span className="font-pixel text-[10px] text-[#4a5a70] flex items-center gap-1">
                    <ShoppingCart size={11} /> <span className="text-[var(--pet-text,#e2e8f0)]">{statsData.activeListings}</span> active
                  </span>
                  <span className="w-px h-3 bg-[#2a3a5c]" />
                  <span className="font-pixel text-[10px] text-[#4a5a70] flex items-center gap-1">
                    <TrendingUp size={11} /> <span className="text-[var(--pet-text,#e2e8f0)]">{statsData.totalSalesEver}</span> trades
                  </span>
                  <span className="w-px h-3 bg-[#2a3a5c]" />
                  <span className="font-pixel text-[10px] text-[#4a5a70] flex items-center gap-1">
                    24h: <GoldDisplay amount={statsData.volume24h?.gold ?? 0} type="gold" size="sm" />
                  </span>
                  <span className="w-px h-3 bg-[#2a3a5c] hidden sm:block" />
                  <span className="font-pixel text-[10px] text-[#4a5a70] items-center gap-1 hidden sm:flex">
                    <GoldDisplay amount={statsData.volume24h?.gems ?? 0} type="gem" size="sm" />
                  </span>
                </div>
              )}

              {/* Main content: sidebar + listings */}
              <div className="flex gap-4">
                <FilterSidebar
                  filters={filters}
                  onChange={updateFilters}
                  onClear={clearFilters}
                  categories={metaData?.categories ?? []}
                />

                <div className="flex-1 min-w-0 space-y-3">
                  {/* Controls bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mobile filter trigger is rendered by FilterSidebar */}
                    <select
                      value={sort}
                      onChange={(e) => { setSort(e.target.value); setPage(1) }}
                      className="font-pixel text-[11px] px-2.5 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <div className="ml-auto flex border-2 border-[#2a3a5c] overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 transition-all ${viewMode === "grid" ? "bg-[#101830] text-[#80b0ff]" : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"}`}
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 border-l-2 border-[#2a3a5c] transition-all ${viewMode === "list" ? "bg-[#101830] text-[#80b0ff]" : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"}`}
                      >
                        <List size={14} />
                      </button>
                    </div>

                    {listingsData?.pagination && (
                      <span className="font-pixel text-[10px] text-[#4a5a70]">
                        {listingsData.pagination.totalItems} items
                      </span>
                    )}
                  </div>

                  {/* Listings */}
                  {isLoading ? (
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-56 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="h-14 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                        ))}
                      </div>
                    )
                  ) : listingsData?.listings?.length > 0 ? (
                    <>
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {listingsData.listings.map((l: any) => (
                            <ListingCard key={l.listingId} listing={l} onBuy={setBuyTarget} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {listingsData.listings.map((l: any) => (
                            <ListingRow key={l.listingId} listing={l} onBuy={setBuyTarget} />
                          ))}
                        </div>
                      )}

                      {listingsData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="font-pixel p-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="font-pixel text-[12px] text-[#4a5a6a] px-3">
                            {listingsData.pagination.page} / {listingsData.pagination.totalPages}
                          </span>
                          <button
                            onClick={() => setPage(Math.min(listingsData.pagination.totalPages, page + 1))}
                            disabled={page >= listingsData.pagination.totalPages}
                            className="font-pixel p-2.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <PixelCard className="py-16 text-center" corners>
                      <p className="font-pixel text-base text-[var(--pet-text-dim,#8899aa)]">
                        NO LISTINGS FOUND
                      </p>
                      <p className="font-pixel text-[12px] text-[#4a5a6a] mt-1">
                        {filters.search || filters.category || filters.rarities.size || filters.hasScrolls || filters.minEnhancement > 0
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

        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Original closing: </div></div></div> */}
        </PetShell>
        {/* --- END AI-REPLACED --- */}

        {buyTarget && (
          <BuyDialog listing={buyTarget} onClose={() => setBuyTarget(null)} onConfirm={handleBuy} />
        )}
      </AdminGuard>
    </Layout>
  )
}
// --- END AI-MODIFIED ---

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
