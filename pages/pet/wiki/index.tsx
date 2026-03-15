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
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/router"
import {
  BookOpen, Search, LayoutGrid, List, ChevronLeft, ChevronRight,
  Hammer, Shield, Sparkles,
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
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-5">

              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={24} className="text-indigo-400" />
                  Item Wiki
                </h1>
                <p className="text-sm text-muted-foreground">
                  Browse all {metaData?.totalItems ?? "..."} items, recipes, and enhancement info
                </p>
              </div>

              <GlobalSearch onSubmit={handleGlobalSearch} />

              {metaData && <WikiOverview data={metaData} />}
              <CollectionTracker progress={metaData?.collectionProgress ?? null} />

              {/* Tabs */}
              <div className="flex gap-2">
                {([
                  { key: "items" as WikiTab, label: "Items", icon: <LayoutGrid size={14} /> },
                  { key: "recipes" as WikiTab, label: "Recipes", icon: <Hammer size={14} /> },
                  { key: "enhancement" as WikiTab, label: "Enhancement Guide", icon: <Shield size={14} /> },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setPage(1) }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      tab === t.key
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"
                    }`}
                  >
                    {t.icon} {t.label}
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
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                        <input
                          type="text" value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                          placeholder="Filter items..."
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      </div>
                      <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1) }}
                        className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground focus:outline-none"
                      >
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className="flex border border-border/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground/40 hover:text-foreground"}`}
                        >
                          <LayoutGrid size={14} />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground/40 hover:text-foreground"}`}
                        >
                          <List size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {itemsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                    </div>
                  ) : itemsData?.items?.length ? (
                    <>
                      {viewMode === "grid" ? (
                        <ItemGrid items={itemsData.items} />
                      ) : (
                        <ItemListView items={itemsData.items} />
                      )}
                      {itemsData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
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
                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                  p === page ? "bg-primary/20 text-primary" : "text-muted-foreground/50 hover:text-foreground"
                                }`}
                              >
                                {p}
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setPage(Math.min(itemsData.pagination.totalPages, page + 1))}
                            disabled={page >= itemsData.pagination.totalPages}
                            className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground/40 text-sm">
                      No items match your filters.
                    </div>
                  )}
                </div>
              )}

              {/* ── Recipes Tab ── */}
              {tab === "recipes" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <input
                      type="text" value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      placeholder="Search recipes..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  {recipesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                  ) : !recipesData?.recipes?.length ? (
                    <div className="text-center py-12 text-muted-foreground/40 text-sm">No recipes found.</div>
                  ) : (
                    Object.entries(recipesByCategory).map(([cat, recipes]) => (
                      <div key={cat}>
                        <h3 className="text-xs uppercase font-semibold text-muted-foreground/50 mb-2">{cat.replace("_", " ")} Recipes</h3>
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
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-5">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" /> How Enhancement Works
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      Use scrolls on equipment to increase its enhancement level. Each level gives +{((metaData?.gameConstants?.ENHANCEMENT_GOLD_BONUS ?? 0.02) * 100).toFixed(0)}% Gold and +{((metaData?.gameConstants?.ENHANCEMENT_XP_BONUS ?? 0.02) * 100).toFixed(0)}% XP bonuses from activity. Higher levels are harder to achieve -- scroll success rates decrease by {((metaData?.gameConstants?.LEVEL_PENALTY_FACTOR ?? 0.08) * 100).toFixed(0)}% per existing level. Failed enhancements may destroy the item.
                    </p>
                  </div>

                  {/* Scroll Comparison Table */}
                  {enhancementScrolls.length > 0 && (
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4 overflow-x-auto">
                      <h3 className="text-sm font-semibold mb-3">Scroll Comparison</h3>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] text-muted-foreground/50 uppercase">
                            <th className="pb-2 pr-4">Scroll</th>
                            <th className="pb-2 pr-4">Rarity</th>
                            <th className="pb-2">Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enhancementScrolls.map((s: any) => (
                            <tr key={s.itemId} className="border-t border-border/10">
                              <td className="py-2 pr-4 font-medium">{s.name}</td>
                              <td className="py-2 pr-4">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  { COMMON: "bg-gray-500/15 text-gray-400", UNCOMMON: "bg-green-500/15 text-green-400",
                                    RARE: "bg-blue-500/15 text-blue-400", EPIC: "bg-purple-500/15 text-purple-400",
                                    LEGENDARY: "bg-amber-500/15 text-amber-400", MYTHICAL: "bg-rose-500/15 text-rose-400",
                                  }[s.rarity] ?? ""
                                }`}>{s.rarity}</span>
                              </td>
                              <td className="py-2 text-muted-foreground/60">Enhancement scroll</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {metaData?.gameConstants && enhancementScrolls.length > 0 && (
                    <EnhancementCalculator
                      gameConstants={metaData.gameConstants}
                      scrolls={enhancementScrolls}
                    />
                  )}

                  {/* Enhancement Bonus Table */}
                  {metaData?.gameConstants && (
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                      <h3 className="text-sm font-semibold mb-3">Enhancement Bonus by Rarity</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {RARITY_ORDER.map((r) => {
                          const max = metaData.gameConstants.MAX_ENHANCEMENT_BY_RARITY[r] ?? 0
                          const bonus = max * (metaData.gameConstants.ENHANCEMENT_GOLD_BONUS ?? 0.02) * 100
                          return (
                            <div key={r} className="rounded-lg bg-muted/10 border border-border/15 p-3 text-center">
                              <span className={`text-[10px] font-bold ${
                                { COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
                                  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
                                }[r]
                              }`}>{r}</span>
                              <p className="text-lg font-bold mt-1">+{max}</p>
                              <p className="text-[10px] text-muted-foreground/50">up to +{bonus.toFixed(0)}% Gold/XP</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
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
