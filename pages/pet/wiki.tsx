// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet wiki page - browse all items and crafting recipes
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import {
  BookOpen, Search, Swords, Leaf, ScrollText, Hammer,
  Coins, ChevronDown, ChevronUp, Filter,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface WikiItem {
  id: number
  name: string
  category: string
  slot: string | null
  rarity: string
  assetPath: string
  goldPrice: number | null
  gemPrice: number | null
  tradeable: boolean
  description: string
}

interface WikiRecipe {
  recipeId: number
  resultItem: { id: number; name: string; category: string; rarity: string }
  resultQuantity: number
  goldCost: number
  description: string
  ingredients: Array<{ item: { id: number; name: string; rarity: string }; quantity: number }>
}

interface ScrollProp {
  itemId: number
  successRate: number
  destroyRate: number
  targetSlot: string | null
}

interface WikiData {
  items: WikiItem[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  recipes: WikiRecipe[]
  scrollProperties: ScrollProp[]
  categories: Array<{ category: string; count: number }>
}

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
  MYTHICAL: "text-rose-400",
}

const rarityBadgeBg: Record<string, string> = {
  COMMON: "bg-gray-500/10 text-gray-400",
  UNCOMMON: "bg-green-500/10 text-green-400",
  RARE: "bg-blue-500/10 text-blue-400",
  EPIC: "bg-purple-500/10 text-purple-400",
  LEGENDARY: "bg-amber-500/10 text-amber-400",
  MYTHICAL: "bg-rose-500/10 text-rose-400",
}

const rarities = ["", "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]

type WikiTab = "items" | "recipes" | "scrolls"

export default function WikiPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<WikiTab>("items")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [page, setPage] = useState(1)
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null)

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set("search", search)
    if (category) p.set("category", category)
    if (rarity) p.set("rarity", rarity)
    p.set("page", String(page))
    return p.toString()
  }, [search, category, rarity, page])

  const { data, error, isLoading } = useDashboard<WikiData>(
    session ? `/api/pet/wiki?${queryParams}` : null
  )

  const scrollPropsMap = useMemo(() => {
    const m: Record<number, ScrollProp> = {}
    data?.scrollProperties.forEach((sp) => { m[sp.itemId] = sp })
    return m
  }, [data?.scrollProperties])

  const categoryIcon = (cat: string) => {
    if (cat === "MATERIAL") return <Leaf size={14} className="text-emerald-400" />
    if (cat === "SCROLL") return <ScrollText size={14} className="text-indigo-400" />
    return <Swords size={14} className="text-purple-400" />
  }

  return (
    <Layout SEO={{ title: "Item Wiki - LionGotchi", description: "Browse all items and recipes" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={24} className="text-indigo-400" />
                  Item Wiki
                </h1>
                <p className="text-sm text-muted-foreground">
                  Browse all {data?.pagination.total ?? "..."} items and crafting recipes
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {([
                  { key: "items" as WikiTab, label: "All Items", icon: <Swords size={14} /> },
                  { key: "recipes" as WikiTab, label: "Recipes", icon: <Hammer size={14} /> },
                  { key: "scrolls" as WikiTab, label: "Scroll Stats", icon: <ScrollText size={14} /> },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      tab === t.key
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Items Tab */}
              {tab === "items" && (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                      className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground"
                    >
                      <option value="">All Categories</option>
                      {data?.categories.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category} ({c.count})
                        </option>
                      ))}
                    </select>
                    <select
                      value={rarity}
                      onChange={(e) => { setRarity(e.target.value); setPage(1) }}
                      className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground"
                    >
                      <option value="">All Rarities</option>
                      {rarities.filter(Boolean).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        {data?.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center flex-shrink-0">
                              {categoryIcon(item.category)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-sm font-medium truncate", rarityColor[item.rarity])}>
                                {item.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {item.category}{item.slot ? ` · ${item.slot}` : ""}
                                {item.description ? ` · ${item.description}` : ""}
                              </p>
                            </div>
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0", rarityBadgeBg[item.rarity])}>
                              {item.rarity}
                            </span>
                            {item.goldPrice && (
                              <span className="text-xs text-amber-400 flex items-center gap-0.5 flex-shrink-0">
                                <Coins size={10} /> {item.goldPrice}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {data && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-md text-sm bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            Prev
                          </button>
                          <span className="text-sm text-muted-foreground">
                            Page {data.pagination.page} of {data.pagination.totalPages}
                          </span>
                          <button
                            onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                            disabled={page >= data.pagination.totalPages}
                            className="px-3 py-1.5 rounded-md text-sm bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Recipes Tab */}
              {tab === "recipes" && (
                <div className="space-y-3">
                  {!data?.recipes.length ? (
                    <p className="text-muted-foreground text-center py-8">No recipes loaded yet.</p>
                  ) : data.recipes.map((recipe) => (
                    <Card key={recipe.recipeId} className="border-border">
                      <CardContent className="pt-4 pb-3">
                        <button
                          className="w-full text-left flex items-center justify-between"
                          onClick={() => setExpandedRecipe(expandedRecipe === recipe.recipeId ? null : recipe.recipeId)}
                        >
                          <div className="flex items-center gap-2">
                            <Hammer size={14} className="text-orange-400" />
                            <span className={cn("font-medium text-sm", rarityColor[recipe.resultItem.rarity])}>
                              {recipe.resultItem.name}
                              {recipe.resultQuantity > 1 && <span className="text-muted-foreground"> x{recipe.resultQuantity}</span>}
                            </span>
                            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", rarityBadgeBg[recipe.resultItem.rarity])}>
                              {recipe.resultItem.rarity}
                            </span>
                          </div>
                          {expandedRecipe === recipe.recipeId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {expandedRecipe === recipe.recipeId && (
                          <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                            {recipe.description && (
                              <p className="text-xs text-muted-foreground">{recipe.description}</p>
                            )}
                            <div className="space-y-1">
                              {recipe.ingredients.map((ing) => (
                                <div key={ing.item.id} className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground font-mono text-xs w-6 text-right">{ing.quantity}x</span>
                                  <span className={rarityColor[ing.item.rarity]}>{ing.item.name}</span>
                                </div>
                              ))}
                              {recipe.goldCost > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Coins size={12} className="text-amber-400" />
                                  <span className="text-amber-400">{recipe.goldCost.toLocaleString()} Gold</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Scroll Stats Tab */}
              {tab === "scrolls" && (
                <div className="space-y-2">
                  {!data?.scrollProperties.length ? (
                    <p className="text-muted-foreground text-center py-8">No scroll data loaded.</p>
                  ) : data.items.filter((i) => i.category === "SCROLL").map((scrollItem) => {
                    const props = scrollPropsMap[scrollItem.id]
                    if (!props) return null
                    return (
                      <div key={scrollItem.id} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-muted/10">
                        <ScrollText size={18} className="text-indigo-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm font-medium", rarityColor[scrollItem.rarity])}>
                            {scrollItem.name}
                          </p>
                          {scrollItem.description && (
                            <p className="text-[11px] text-muted-foreground">{scrollItem.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                          <span className="text-emerald-400 font-medium">{Math.round(props.successRate * 100)}% success</span>
                          <span className="text-red-400 font-medium">{Math.round(props.destroyRate * 100)}% destroy</span>
                        </div>
                      </div>
                    )
                  })}
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
