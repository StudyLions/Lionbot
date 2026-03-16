// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Global search bar with dropdown - pixel art style
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import PixelBadge from "@/components/pet/ui/PixelBadge"

interface SearchItem { id: number; name: string; category: string; rarity: string; assetPath: string | null }
interface SearchRecipe { recipeId: number; resultItem: SearchItem }
interface SearchResult { items: SearchItem[]; recipes: SearchRecipe[] }

interface Props { onSubmit: (q: string) => void }

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
      if (res.ok) { setResults(await res.json()); setOpen(true) }
    } finally { setLoading(false) }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) { setOpen(false); onSubmit(query.trim()) }
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-pixel text-[13px] text-[#4a5a70]">&#x25B6;</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search items, recipes, scrolls..."
          className="w-full pl-8 pr-4 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] font-pixel text-sm text-[var(--pet-text,#e2e8f0)] placeholder:text-[#3a4a5c] focus:outline-none focus:border-[var(--pet-blue,#4080f0)] transition-colors"
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[var(--pet-blue)]/30 border-t-[var(--pet-blue)] animate-spin" />}
      </div>

      {open && hasResults && (
        <div
          className="absolute z-50 mt-1 w-full border-2 border-[#2a3a5c] bg-[#0c1020] overflow-hidden max-h-[360px] overflow-y-auto scrollbar-hide"
          style={{ boxShadow: "3px 3px 0 #060810" }}
        >
          {results!.items.length > 0 && (
            <div>
              <div className="px-3 py-1.5 font-pixel text-[11px] text-[#4a5a70] tracking-[0.15em] bg-[#111828] border-b border-[#1a2a3c]">ITEMS</div>
              {results!.items.map((item) => {
                const imgUrl = getItemImageUrl(item.assetPath, item.category)
                return (
                  <Link key={item.id} href={`/pet/wiki/${item.id}`} onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#141e30] transition-colors cursor-pointer">
                      <div className="w-7 h-7 border border-[#1a2a3c] bg-[#080c18] flex items-center justify-center flex-shrink-0">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-5 h-5 object-contain" style={{ imageRendering: "pixelated" }} />
                        ) : (
                          <span className="text-sm">{getCategoryPlaceholder(item.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate block">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <PixelBadge rarity={item.rarity} />
                          <span className="font-pixel text-sm text-[#4a5a70]">{item.category}</span>
                        </div>
                      </div>
                      <span className="font-pixel text-[13px] text-[#3a4a5c]">&#x25B6;</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          {results!.recipes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 font-pixel text-sm text-[#4a5a70] tracking-[0.15em] bg-[#111828] border-y border-[#1a2a3c]">RECIPES</div>
              {results!.recipes.map((r) => {
                const imgUrl = getItemImageUrl(r.resultItem.assetPath, r.resultItem.category)
                return (
                  <Link key={r.recipeId} href={`/pet/wiki/${r.resultItem.id}`} onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#141e30] transition-colors cursor-pointer">
                      <div className="w-7 h-7 border border-[#1a2a3c] bg-[#080c18] flex items-center justify-center flex-shrink-0">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-5 h-5 object-contain" style={{ imageRendering: "pixelated" }} />
                        ) : (
                          <span className="text-sm">{getCategoryPlaceholder(r.resultItem.category)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-pixel text-[13px] text-[var(--pet-text,#e2e8f0)] truncate block">{r.resultItem.name}</span>
                        <span className="font-pixel text-sm text-[#4a5a70]">Recipe</span>
                      </div>
                      <span className="font-pixel text-[13px] text-[#3a4a5c]">&#x25B6;</span>
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
