// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Collapsible filter sidebar for marketplace browse page.
//          Consolidates search, category, rarity, currency,
//          enhancement, and scroll filters. Mobile slide-in drawer.
// ============================================================
import { useState, useCallback } from "react"
import { Search, X, SlidersHorizontal, ScrollText, Coins, Gem, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryPlaceholder } from "@/utils/petAssets"

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"] as const
const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  COMMON:    { border: "#6a7a8a", bg: "#1a2030", text: "#8899aa" },
  UNCOMMON:  { border: "#4080f0", bg: "#101830", text: "#80b0ff" },
  RARE:      { border: "#e04040", bg: "#301018", text: "#ff8080" },
  EPIC:      { border: "#f0c040", bg: "#302818", text: "#ffe080" },
  LEGENDARY: { border: "#d060f0", bg: "#281030", text: "#e0a0ff" },
  MYTHICAL:  { border: "#ff6080", bg: "#301020", text: "#ff90a0" },
}

export interface FilterState {
  search: string
  category: string
  rarities: Set<string>
  currency: string
  minEnhancement: number
  hasScrolls: boolean
}

interface CategoryCount { category: string; count: number }

interface Props {
  filters: FilterState
  onChange: (next: Partial<FilterState>) => void
  onClear: () => void
  categories: CategoryCount[]
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="font-pixel text-[10px] text-[#4a5a70] uppercase tracking-wider">{label}</h4>
      {children}
    </div>
  )
}

function FilterContent({ filters, onChange, onClear, categories }: Props) {
  const toggleRarity = useCallback((r: string) => {
    const next = new Set(filters.rarities)
    if (next.has(r)) next.delete(r); else next.add(r)
    onChange({ rarities: next })
  }, [filters.rarities, onChange])

  const hasAnyFilter = filters.search || filters.category || filters.rarities.size > 0 ||
    filters.currency || filters.minEnhancement > 0 || filters.hasScrolls

  return (
    <div className="space-y-4">
      {/* Search */}
      <SidebarSection label="Search">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4a5a6a]" />
          <input
            type="text" value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Item name..."
            className="font-pixel text-[11px] w-full pl-8 pr-3 py-2 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] placeholder:text-[#4a5a6a] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
          />
        </div>
      </SidebarSection>

      {/* Category */}
      <SidebarSection label="Category">
        <div className="space-y-0.5">
          <button
            onClick={() => onChange({ category: "" })}
            className={cn(
              "font-pixel text-[11px] w-full text-left px-2.5 py-1.5 border transition-all",
              !filters.category
                ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff]"
                : "border-transparent text-[#4a5a6a] hover:text-[#8899aa] hover:bg-[#0f1628]"
            )}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => onChange({ category: filters.category === c.category ? "" : c.category })}
              className={cn(
                "font-pixel text-[11px] w-full text-left px-2.5 py-1.5 border transition-all flex items-center gap-1.5",
                filters.category === c.category
                  ? "border-[var(--pet-blue,#4080f0)] bg-[#101830] text-[#80b0ff]"
                  : "border-transparent text-[#4a5a6a] hover:text-[#8899aa] hover:bg-[#0f1628]"
              )}
            >
              <span className="text-[10px]">{getCategoryPlaceholder(c.category)}</span>
              <span className="flex-1 truncate">{c.category.replace("_", " ")}</span>
              <span className="opacity-40">{c.count}</span>
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* Rarity */}
      <SidebarSection label="Rarity">
        <div className="grid grid-cols-2 gap-1">
          {RARITIES.map((r) => {
            const c = RARITY_COLORS[r]
            const active = filters.rarities.has(r)
            return (
              <button
                key={r}
                onClick={() => toggleRarity(r)}
                className="font-pixel px-2 py-1 text-[10px] border-2 transition-all truncate"
                style={{
                  borderColor: active ? c.border : "#1a2a3c",
                  backgroundColor: active ? c.bg : "#0a0e1a",
                  color: active ? c.text : "#4a5a6a",
                  boxShadow: active ? `0 0 6px ${c.border}30` : "none",
                }}
              >
                {r}
              </button>
            )
          })}
        </div>
      </SidebarSection>

      {/* Currency */}
      <SidebarSection label="Currency">
        <div className="flex border-2 border-[#2a3a5c] overflow-hidden">
          {[
            { val: "", label: "ALL", icon: null },
            { val: "GOLD", label: "", icon: <Coins size={12} className="text-[var(--pet-gold,#f0c040)]" /> },
            { val: "GEMS", label: "", icon: <Gem size={12} className="text-[#a855f7]" /> },
          ].map((c) => (
            <button
              key={c.val}
              onClick={() => onChange({ currency: c.val })}
              className={cn(
                "font-pixel text-[10px] flex-1 py-1.5 flex items-center justify-center gap-1 transition-all",
                filters.currency === c.val
                  ? "bg-[#101830] text-[#80b0ff]"
                  : "bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]",
                c.val !== "" && "border-l-2 border-[#2a3a5c]"
              )}
            >
              {c.icon}{c.label || (!c.icon ? "ALL" : "")}
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* Enhancement & Scrolls */}
      <SidebarSection label="Enhancement">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[10px] text-[#4a5a6a]">Min +</span>
            <select
              value={filters.minEnhancement}
              onChange={(e) => onChange({ minEnhancement: parseInt(e.target.value) })}
              className="font-pixel text-[10px] flex-1 px-2 py-1.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[var(--pet-text,#e2e8f0)] focus:outline-none focus:border-[var(--pet-blue,#4080f0)]"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 5, 7, 10].map((v) => <option key={v} value={v}>+{v}</option>)}
            </select>
          </div>
          <button
            onClick={() => onChange({ hasScrolls: !filters.hasScrolls })}
            className={cn(
              "font-pixel text-[10px] w-full px-2.5 py-1.5 border-2 flex items-center gap-1.5 transition-all",
              filters.hasScrolls
                ? "border-[#6090e0] bg-[#4060a0]/20 text-[#c0d8ff]"
                : "border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#8899aa]"
            )}
          >
            <ScrollText size={12} /> Has Scrolls
          </button>
        </div>
      </SidebarSection>

      {/* Clear */}
      {hasAnyFilter && (
        <button
          onClick={onClear}
          className="font-pixel text-[10px] w-full py-1.5 border-2 border-[#2a3a5c] bg-[#0a0e1a] text-[#4a5a6a] hover:text-[#ff8080] hover:border-[#e04040]/30 transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={10} /> CLEAR ALL FILTERS
        </button>
      )}
    </div>
  )
}

export default function FilterSidebar(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-52 flex-shrink-0 space-y-2">
        <div className="border-2 border-[#2a3a5c] bg-[#0c1020] p-3 shadow-[2px_2px_0_#060810] sticky top-6">
          <h3 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1a2a3c]">
            <SlidersHorizontal size={12} /> FILTERS
          </h3>
          <FilterContent {...props} />
        </div>
      </div>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden font-pixel text-[12px] px-3 py-2 border-2 border-[#2a3a5c] bg-[#0c1020] text-[#4a5a6a] hover:text-[#8899aa] flex items-center gap-1.5 transition-colors shadow-[2px_2px_0_#060810]"
      >
        <SlidersHorizontal size={14} /> Filters
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0c1020] border-r-2 border-[#2a3a5c] overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1a2a3c]">
              <h3 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] flex items-center gap-1.5">
                <SlidersHorizontal size={12} /> FILTERS
              </h3>
              <button onClick={() => setMobileOpen(false)} className="font-pixel text-[13px] text-[#4a5a70] hover:text-[#ff8080] border border-[#3a4a6c] px-2 py-1 bg-[#111828] transition-colors">
                <X size={12} />
              </button>
            </div>
            <FilterContent {...props} />
          </div>
        </div>
      )}
    </>
  )
}
