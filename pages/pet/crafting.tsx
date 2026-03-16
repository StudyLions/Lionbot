// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting page - pixel art RPG style
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { getItemImageUrl, getCategoryPlaceholder, getUiIconUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface Ingredient {
  item: { id: number; name: string; rarity: string }
  required: number
  owned: number
}

interface Recipe {
  recipeId: number
  resultItem: { id: number; name: string; category: string; rarity: string; description: string; assetPath: string }
  resultQuantity: number
  goldCost: number
  description: string
  ingredients: Ingredient[]
  canCraft: boolean
}

interface CraftingData {
  recipes: Recipe[]
  gold: string
  totalCount: number
  page: number
  totalPages: number
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: Add category/rarity/search filters and pagination
const CRAFT_CATEGORIES = [
  { key: "", label: "All" },
  { key: "SCROLL", label: "Scroll" },
  { key: "HAT", label: "Hat" },
  { key: "GLASSES", label: "Glasses" },
  { key: "SHIRT", label: "Shirt" },
  { key: "BOOTS", label: "Boots" },
  { key: "WINGS", label: "Wings" },
]
const CRAFT_RARITIES = ["", "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]
// --- END AI-MODIFIED ---

export default function CraftingPage() {
  const { data: session } = useSession()
  const [category, setCategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [crafting, setCrafting] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  // --- AI-MODIFIED (2026-03-15) ---
  // Purpose: Debounce search input so we don't fire on every keystroke
  const searchTimer = useState<ReturnType<typeof setTimeout> | null>(null)
  function handleSearch(val: string) {
    setSearch(val)
    if (searchTimer[0]) clearTimeout(searchTimer[0])
    searchTimer[1] = setTimeout(() => { setDebouncedSearch(val); setPage(1) }, 400)
  }
  // --- END AI-MODIFIED ---

  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (rarity) params.set("rarity", rarity)
  if (debouncedSearch) params.set("search", debouncedSearch)
  params.set("page", String(page))
  const qs = params.toString()

  const { data, error, isLoading, mutate } = useDashboard<CraftingData>(
    session ? `/api/pet/crafting?${qs}` : null
  )

  async function handleCraft(recipeId: number) {
    setCrafting(recipeId)
    setMessage(null)
    try {
      const res = await fetch("/api/pet/crafting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ text: body.error || "Craft failed", type: "error" })
      } else {
        setMessage({ text: `Crafted ${body.quantity}x ${body.craftedItem}!`, type: "success" })
        mutate()
        invalidate("/api/pet/inventory?filter=equipment")
        invalidate("/api/pet/inventory?filter=materials")
        invalidate("/api/pet/inventory?filter=scrolls")
        invalidate("/api/pet/overview")
      }
    } catch {
      setMessage({ text: "Network error", type: "error" })
    } finally {
      setCrafting(null)
    }
  }

  return (
    <Layout SEO={{ title: "Crafting - LionGotchi", description: "Craft items from materials" }}>
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="font-pixel text-xl text-[var(--pet-text,#e2e8f0)]">Crafting</h1>
                  {data && <GoldDisplay amount={Number(data.gold)} size="md" />}
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
                <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  Combine materials to create scrolls and equipment
                </p>
              </div>

              {/* --- AI-MODIFIED (2026-03-15) --- */}
              {/* Filters */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {CRAFT_CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => { setCategory(c.key); setPage(1) }}
                      className={cn(
                        "font-pixel text-[9px] px-2.5 py-1 border-2 transition-colors",
                        category === c.key
                          ? "border-[var(--pet-gold,#f0c040)] bg-[var(--pet-gold,#f0c040)]/10 text-[var(--pet-gold,#f0c040)]"
                          : "border-[#1a2040] bg-[#0c1020] text-[var(--pet-text-dim,#8899aa)] hover:border-[#2a3060]"
                      )}
                      style={{ boxShadow: "2px 2px 0 #060810" }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="font-pixel text-[10px] px-2.5 py-1.5 border-2 border-[#1a2040] bg-[#0c1020] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a70] flex-1 outline-none focus:border-[var(--pet-gold,#f0c040)]/40"
                    style={{ boxShadow: "2px 2px 0 #060810" }}
                  />
                  <select
                    value={rarity}
                    onChange={(e) => { setRarity(e.target.value); setPage(1) }}
                    className="font-pixel text-[9px] px-2 py-1 border-2 border-[#1a2040] bg-[#0c1020] text-[var(--pet-text-dim,#8899aa)] outline-none cursor-pointer"
                    style={{ boxShadow: "2px 2px 0 #060810" }}
                  >
                    <option value="">All Rarities</option>
                    {CRAFT_RARITIES.filter(Boolean).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {data && (
                  <p className="font-pixel text-[8px] text-[#4a5a70]">
                    {data.totalCount} recipe{data.totalCount !== 1 && "s"} found
                    {data.totalPages > 1 && ` \u2022 Page ${data.page} of ${data.totalPages}`}
                  </p>
                )}
              </div>
              {/* --- END AI-MODIFIED --- */}

              {/* Toast */}
              {message && (
                <div
                  className="flex items-center gap-2 px-3 py-2 border-2"
                  style={{
                    borderColor: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)",
                    backgroundColor: message.type === "success" ? "rgba(40,100,60,0.15)" : "rgba(100,40,40,0.15)",
                    boxShadow: "2px 2px 0 #060810",
                  }}
                >
                  <img src={getUiIconUrl(message.type === "success" ? "trophy" : "liongotchi_heart")}
                    alt="" width={14} height={14} style={{ imageRendering: "pixelated" }} />
                  <span className="font-pixel text-[10px]"
                    style={{ color: message.type === "success" ? "var(--pet-green)" : "var(--pet-red)" }}>
                    {message.text}
                  </span>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-xs text-[var(--pet-red,#e04040)]">{(error as Error).message}</p>
                </PixelCard>
              ) : !data?.recipes.length ? (
                <PixelCard className="p-12 text-center" corners>
                  <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">No recipes available yet.</p>
                </PixelCard>
              ) : (
                <div className="space-y-3">
                  {data.recipes.length === 0 && data.totalCount === 0 && (
                    <PixelCard className="p-8 text-center" corners>
                      <p className="font-pixel text-xs text-[var(--pet-text-dim,#8899aa)]">No recipes match your filters.</p>
                    </PixelCard>
                  )}
                  {data.recipes.map((recipe) => {
                    const bc = RARITY_BORDER[recipe.resultItem.rarity] || "#3a4a6c"
                    const imgUrl = getItemImageUrl(recipe.resultItem.assetPath, recipe.resultItem.category)
                    return (
                      <div
                        key={recipe.recipeId}
                        className="border-[3px] p-[3px]"
                        style={{ borderColor: bc, boxShadow: "3px 3px 0 #060810" }}
                      >
                        <div className="border-2 bg-[#0c1020] p-4 space-y-3" style={{ borderColor: `${bc}40` }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 border-2 bg-[#080c18] flex items-center justify-center flex-shrink-0"
                                style={{ borderColor: `${bc}60` }}>
                                {imgUrl ? (
                                  <img src={imgUrl} alt={recipe.resultItem.name} className="w-9 h-9 object-contain"
                                    style={{ imageRendering: "pixelated" }} />
                                ) : (
                                  <span className="text-lg">{getCategoryPlaceholder(recipe.resultItem.category)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
                                    {recipe.resultItem.name}
                                    {recipe.resultQuantity > 1 && <span className="text-[var(--pet-text-dim)] ml-1">x{recipe.resultQuantity}</span>}
                                  </span>
                                  <PixelBadge rarity={recipe.resultItem.rarity} />
                                </div>
                                <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] mt-0.5">
                                  {recipe.resultItem.category}
                                  {recipe.description && <span> &middot; {recipe.description}</span>}
                                </p>
                              </div>
                            </div>
                            <PixelButton
                              variant={recipe.canCraft ? "primary" : "ghost"}
                              size="md"
                              onClick={() => handleCraft(recipe.recipeId)}
                              disabled={!recipe.canCraft || crafting !== null}
                              loading={crafting === recipe.recipeId}
                            >
                              Craft
                            </PixelButton>
                          </div>

                          <div className="space-y-1">
                            <p className="font-pixel text-[8px] text-[#4a5a70] tracking-[0.15em] uppercase">Ingredients</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {recipe.ingredients.map((ing) => {
                                const ok = ing.owned >= ing.required
                                return (
                                  <div
                                    key={ing.item.id}
                                    className="flex items-center gap-2 px-2.5 py-1.5 border"
                                    style={{
                                      borderColor: ok ? "rgba(64,216,112,0.2)" : "rgba(224,64,64,0.2)",
                                      backgroundColor: ok ? "rgba(64,216,112,0.04)" : "rgba(224,64,64,0.04)",
                                    }}
                                  >
                                    <span className="w-2 h-2 flex-shrink-0"
                                      style={{ backgroundColor: ok ? "#40d870" : "#e04040" }} />
                                    <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate flex-1">
                                      {ing.item.name}
                                    </span>
                                    <span className="font-pixel text-[10px] flex-shrink-0"
                                      style={{ color: ok ? "#40d870" : "#e04040" }}>
                                      {ing.owned}/{ing.required}
                                    </span>
                                  </div>
                                )
                              })}
                              {recipe.goldCost > 0 && (
                                <div
                                  className="flex items-center gap-2 px-2.5 py-1.5 border"
                                  style={{
                                    borderColor: Number(data.gold) >= recipe.goldCost ? "rgba(64,216,112,0.2)" : "rgba(224,64,64,0.2)",
                                    backgroundColor: Number(data.gold) >= recipe.goldCost ? "rgba(64,216,112,0.04)" : "rgba(224,64,64,0.04)",
                                  }}
                                >
                                  <GoldDisplay amount={recipe.goldCost} size="sm" />
                                  <span className="font-pixel text-[10px] flex-shrink-0 ml-auto"
                                    style={{ color: Number(data.gold) >= recipe.goldCost ? "#40d870" : "#e04040" }}>
                                    {Number(data.gold).toLocaleString()}/{recipe.goldCost.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* --- AI-MODIFIED (2026-03-15) --- */}
                  {data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="font-pixel text-[9px] px-3 py-1 border-2 border-[#1a2040] bg-[#0c1020] text-[var(--pet-text-dim)] disabled:opacity-30"
                        style={{ boxShadow: "2px 2px 0 #060810" }}
                      >
                        Prev
                      </button>
                      <span className="font-pixel text-[9px] text-[var(--pet-text-dim)]">
                        {data.page} / {data.totalPages}
                      </span>
                      <button
                        disabled={page >= data.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="font-pixel text-[9px] px-3 py-1 border-2 border-[#1a2040] bg-[#0c1020] text-[var(--pet-text-dim)] disabled:opacity-30"
                        style={{ boxShadow: "2px 2px 0 #060810" }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                  {/* --- END AI-MODIFIED --- */}
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
