// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Full RPG item encyclopedia - browse page with
//          overview, collection tracker, global search, tabs
//          (Items/Recipes/Enhancement Guide), grid/list toggle,
//          rarity pills, category chips, sort, URL state sync
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/router"
import {
  Search, LayoutGrid, List, ChevronLeft, ChevronRight,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import GlobalSearch from "@/components/pet/wiki/GlobalSearch"
import WikiOverview from "@/components/pet/wiki/WikiOverview"
import CollectionTracker from "@/components/pet/wiki/CollectionTracker"
import RarityPills from "@/components/pet/wiki/RarityPills"
import CategoryChips from "@/components/pet/wiki/CategoryChips"
import ItemGrid from "@/components/pet/wiki/ItemGrid"
import ItemListView from "@/components/pet/wiki/ItemRow"
import RecipeCard from "@/components/pet/wiki/RecipeCard"
import EnhancementCalculator from "@/components/pet/wiki/EnhancementCalculator"
import PixelCard from "@/components/pet/ui/PixelCard"

type WikiTab = "items" | "recipes" | "enhancement"

const SORT_OPTIONS = [
  { value: "rarity_desc", label: "Rarity High-Low" },
  { value: "rarity_asc", label: "Rarity Low-High" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "price_desc", label: "Price High-Low" },
  { value: "price_asc", label: "Price Low-High" },
]

const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]

const RARITY_TEXT: Record<string, string> = {
  COMMON: "#a0a8b4", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ffa0c0",
}

const TABS: { key: WikiTab; label: string }[] = [
  { key: "items", label: "ITEMS" },
  { key: "recipes", label: "RECIPES" },
  { key: "enhancement", label: "ENHANCEMENT" },
]

export default function WikiPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const q = router.query
  const [tab, setTab] = useState<WikiTab>((q.tab as WikiTab) || "items")
  const [search, setSearch] = useState((q.q as string) || "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [category, setCategory] = useState((q.cat as string) || "")
  const [selectedRarities, setSelectedRarities] = useState<Set<string>>(() => {
    const r = (q.rarity as string) || ""
    return new Set(r.split(",").filter(Boolean))
  })
  const [sort, setSort] = useState((q.sort as string) || "rarity_desc")
  const [page, setPage] = useState(parseInt(q.page as string) || 1)
  const [viewMode, setViewMode] = useState<"grid" | "list">((q.view as "grid" | "list") || "grid")
  const [recipeSearch, setRecipeSearch] = useState("")
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  const syncUrl = useCallback((overrides: Record<string, string>) => {
    const params: Record<string, string> = {
      tab, q: debouncedSearch, cat: category,
      rarity: Array.from(selectedRarities).join(","),
      sort, page: String(page), view: viewMode,
      ...overrides,
    }
    Object.keys(params).forEach((k) => { if (!params[k] || params[k] === "1" && k === "page") delete params[k] })
    router.replace({ query: params }, undefined, { shallow: true })
  }, [tab, debouncedSearch, category, selectedRarities, sort, page, viewMode, router])

  useEffect(() => { syncUrl({}) }, [tab, debouncedSearch, category, selectedRarities, sort, page, viewMode])

  const itemsQuery = useMemo(() => {
    const p = new URLSearchParams()
    if (debouncedSearch) p.set("search", debouncedSearch)
    if (category) p.set("category", category)
    if (selectedRarities.size) p.set("rarity", Array.from(selectedRarities).join(","))
    p.set("sort", sort)
    p.set("page", String(page))
    p.set("pageSize", "40")
    return p.toString()
  }, [debouncedSearch, category, selectedRarities, sort, page])

  const { data: metaData } = useDashboard<any>(session ? "/api/pet/wiki/meta" : null)
  const { data: itemsData, isLoading: itemsLoading } = useDashboard<any>(
    session && tab === "items" ? `/api/pet/wiki/items?${itemsQuery}` : null
  )
  const { data: recipesData, isLoading: recipesLoading } = useDashboard<any>(
    session && tab === "recipes" ? `/api/pet/wiki/recipes${recipeSearch ? `?search=${encodeURIComponent(recipeSearch)}` : ""}` : null
  )

  const enhancementScrolls = useMemo(() => {
    return metaData?.scrolls ?? []
  }, [metaData?.scrolls])

  const recipesByCategory = useMemo(() => {
    if (!recipesData?.recipes) return {}
    const groups: Record<string, any[]> = {}
    for (const r of recipesData.recipes) {
      const cat = r.resultItem.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(r)
    }
    return groups
  }, [recipesData?.recipes])

  function handleGlobalSearch(q: string) {
    setSearch(q)
    setTab("items")
    setPage(1)
  }

  return (
    <Layout SEO={{ title: "Item Wiki - LionGotchi", description: "Browse all items and recipes" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              {/* Title */}
              <div>
                <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)] flex items-center gap-3">
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                  ITEM WIKI
                  <span className="text-[var(--pet-gold,#f0c040)]">&#x2756;</span>
                </h1>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--pet-gold,#f0c040)] to-transparent mt-1" />
                <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Browse all {metaData?.totalItems ?? "..."} items, recipes, and enhancement info
                </p>
              </div>

              <GlobalSearch onSubmit={handleGlobalSearch} />
              {metaData && <WikiOverview data={metaData} />}
              <CollectionTracker progress={metaData?.collectionProgress ?? null} />

              {/* Tabs */}
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setPage(1) }}
                    className={`font-pixel text-[10px] px-3 py-1.5 border-2 transition-all ${
                      tab === t.key
                        ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
                        : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Items Tab ── */}
              {tab === "items" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <RarityPills
                      selected={selectedRarities}
                      onChange={(s) => { setSelectedRarities(s); setPage(1) }}
                    />
                    {metaData?.categories && (
                      <CategoryChips
                        categories={metaData.categories}
                        selected={category}
                        onChange={(c) => { setCategory(c); setPage(1) }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a6a]" />
                        <input
                          type="text" value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                          placeholder="Filter items..."
                          className="font-pixel text-[11px] w-full pl-9 pr-3 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a6a] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                        />
                      </div>
                      <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1) }}
                        className="font-pixel text-[11px] px-3 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                      >
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className="flex border-2 border-[#2a3a5c] overflow-hidden">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 transition-all ${viewMode === "grid"
                            ? "bg-[#101830] text-[var(--pet-blue,#4080f0)]"
                            : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"}`}
                        >
                          <LayoutGrid size={14} />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 transition-all border-l-2 border-[#2a3a5c] ${viewMode === "list"
                            ? "bg-[#101830] text-[var(--pet-blue,#4080f0)]"
                            : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"}`}
                        >
                          <List size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {itemsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="h-40 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                      ))}
                    </div>
                  ) : itemsData?.items?.length ? (
                    <>
                      {viewMode === "grid" ? (
                        <ItemGrid items={itemsData.items} />
                      ) : (
                        <ItemListView items={itemsData.items} />
                      )}
                      {itemsData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="font-pixel p-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          {Array.from({ length: Math.min(7, itemsData.pagination.totalPages) }, (_, i) => {
                            const totalPages = itemsData.pagination.totalPages
                            let p: number
                            if (totalPages <= 7) p = i + 1
                            else if (page <= 4) p = i + 1
                            else if (page >= totalPages - 3) p = totalPages - 6 + i
                            else p = page - 3 + i
                            return (
                              <button
                                key={p} onClick={() => setPage(p)}
                                className={`font-pixel w-8 h-8 text-[10px] border-2 transition-all ${
                                  p === page
                                    ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff] shadow-[2px_2px_0_#060810]"
                                    : "border-[#1a2a3c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
                                }`}
                              >
                                {p}
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setPage(Math.min(itemsData.pagination.totalPages, page + 1))}
                            disabled={page >= itemsData.pagination.totalPages}
                            className="font-pixel p-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa] disabled:opacity-30 transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <PixelCard className="p-12 text-center" corners>
                      <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                        NO ITEMS MATCH YOUR FILTERS
                      </p>
                      <p className="font-pixel text-[10px] text-[#4a5a6a] mt-1">
                        Try adjusting your search or rarity filter
                      </p>
                    </PixelCard>
                  )}
                </div>
              )}

              {/* ── Recipes Tab ── */}
              {tab === "recipes" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a6a]" />
                    <input
                      type="text" value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      placeholder="Search recipes..."
                      className="font-pixel text-[11px] w-full pl-9 pr-3 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a6a] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
                    />
                  </div>
                  {recipesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 border-2 border-[#1a2a3c] bg-[#0c1020] animate-pulse" />
                      ))}
                    </div>
                  ) : !recipesData?.recipes?.length ? (
                    <PixelCard className="p-12 text-center" corners>
                      <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">NO RECIPES FOUND</p>
                    </PixelCard>
                  ) : (
                    Object.entries(recipesByCategory).map(([cat, recipes]) => (
                      <div key={cat}>
                        <h3 className="font-pixel text-[10px] uppercase text-[var(--pet-gold,#f0c040)] mb-2 tracking-wide">
                          {cat.replace("_", " ")} Recipes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(recipes as any[]).map((r: any) => <RecipeCard key={r.recipeId} recipe={r} />)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Enhancement Guide Tab ── */}
              {tab === "enhancement" && (
                <div className="space-y-6">
                  <PixelCard className="p-5" corners>
                    <h3 className="font-pixel text-xs text-[var(--pet-gold,#f0c040)] mb-2">
                      &#x2756; HOW ENHANCEMENT WORKS
                    </h3>
                    <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
                      Use scrolls on equipment to increase its enhancement level. Each level gives +{((metaData?.gameConstants?.ENHANCEMENT_GOLD_BONUS ?? 0.02) * 100).toFixed(0)}% Gold and +{((metaData?.gameConstants?.ENHANCEMENT_XP_BONUS ?? 0.02) * 100).toFixed(0)}% XP bonuses from activity. Higher levels are harder to achieve -- scroll success rates decrease by {((metaData?.gameConstants?.LEVEL_PENALTY_FACTOR ?? 0.08) * 100).toFixed(0)}% per existing level. Failed enhancements may destroy the item.
                    </p>
                  </PixelCard>

                  {/* Scroll Comparison Table */}
                  {enhancementScrolls.length > 0 && (
                    <PixelCard className="p-4 overflow-x-auto" corners>
                      <h3 className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)] mb-3">SCROLL COMPARISON</h3>
                      <table className="w-full font-pixel text-[10px]">
                        <thead>
                          <tr className="text-left text-[9px] text-[#4a5a6a] uppercase">
                            <th className="pb-2 pr-4">Scroll</th>
                            <th className="pb-2 pr-4">Rarity</th>
                            <th className="pb-2">Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enhancementScrolls.map((s: any) => (
                            <tr key={s.itemId} className="border-t border-[#1a2a3c]">
                              <td className="py-2 pr-4 text-[var(--pet-text,#e2e8f0)]">{s.name}</td>
                              <td className="py-2 pr-4">
                                <span
                                  className="font-pixel px-1.5 py-0.5 text-[9px] border"
                                  style={{
                                    borderColor: RARITY_TEXT[s.rarity] || "#6a7080",
                                    color: RARITY_TEXT[s.rarity] || "#a0a8b4",
                                    backgroundColor: `${RARITY_TEXT[s.rarity] || "#6a7080"}15`,
                                  }}
                                >
                                  {s.rarity}
                                </span>
                              </td>
                              <td className="py-2 text-[#4a5a6a]">Enhancement scroll</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </PixelCard>
                  )}

                  {metaData?.gameConstants && enhancementScrolls.length > 0 && (
                    <EnhancementCalculator
                      gameConstants={metaData.gameConstants}
                      scrolls={enhancementScrolls}
                    />
                  )}

                  {/* Enhancement Bonus Table */}
                  {metaData?.gameConstants && (
                    <PixelCard className="p-4" corners>
                      <h3 className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)] mb-3">ENHANCEMENT BONUS BY RARITY</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {RARITY_ORDER.map((r) => {
                          const max = metaData.gameConstants.MAX_ENHANCEMENT_BY_RARITY[r] ?? 0
                          const bonus = max * (metaData.gameConstants.ENHANCEMENT_GOLD_BONUS ?? 0.02) * 100
                          return (
                            <div
                              key={r}
                              className="border-2 bg-[#0c1020] p-3 text-center"
                              style={{ borderColor: `${RARITY_TEXT[r] || "#6a7080"}40` }}
                            >
                              <span
                                className="font-pixel text-[10px]"
                                style={{ color: RARITY_TEXT[r] || "#a0a8b4" }}
                              >
                                {r}
                              </span>
                              <p className="font-pixel text-lg text-[var(--pet-text,#e2e8f0)] mt-1">+{max}</p>
                              <p className="font-pixel text-[9px] text-[#4a5a6a]">up to +{bonus.toFixed(0)}% Gold/XP</p>
                            </div>
                          )
                        })}
                      </div>
                    </PixelCard>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
