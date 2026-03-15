// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Global search bar with grouped dropdown results
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}

interface SearchItem { id: number; name: string; category: string; rarity: string; assetPath: string | null }
interface SearchRecipe { recipeId: number; resultItem: SearchItem }
interface SearchResult { items: SearchItem[]; recipes: SearchRecipe[] }

interface Props {
  onSubmit: (q: string) => void
}

export default function GlobalSearch({ onSubmit }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/pet/wiki/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        setResults(await res.json())
        setOpen(true)
      }
    } finally { setLoading(false) }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false)
      onSubmit(query.trim())
    }
    if (e.key === "Escape") setOpen(false)
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  const hasResults = results && (results.items.length > 0 || results.recipes.length > 0)

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search items, recipes, scrolls..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
        />
        {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
      </div>

      {open && hasResults && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto">
          {results!.items.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-muted-foreground/50 bg-muted/10">Items</div>
              {results!.items.map((item) => {
                const imgUrl = getItemImageUrl(item.assetPath, item.category)
                return (
                  <Link key={item.id} href={`/pet/wiki/${item.id}`} onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/15 transition-colors cursor-pointer">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                        ) : (
                          <span className="text-lg">{getCategoryPlaceholder(item.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium truncate", rarityColor[item.rarity])}>{item.name}</p>
                        <p className="text-[10px] text-muted-foreground/40">{item.category}</p>
                      </div>
                      <ArrowRight size={12} className="text-muted-foreground/20" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          {results!.recipes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-muted-foreground/50 bg-muted/10 border-t border-border/20">Recipes</div>
              {results!.recipes.map((r) => {
                const imgUrl = getItemImageUrl(r.resultItem.assetPath, r.resultItem.category)
                return (
                  <Link key={r.recipeId} href={`/pet/wiki/${r.resultItem.id}`} onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/15 transition-colors cursor-pointer">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                        ) : (
                          <span className="text-lg">{getCategoryPlaceholder(r.resultItem.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium truncate", rarityColor[r.resultItem.rarity])}>{r.resultItem.name}</p>
                        <p className="text-[10px] text-muted-foreground/40">Recipe</p>
                      </div>
                      <ArrowRight size={12} className="text-muted-foreground/20" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
