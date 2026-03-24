// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Filter/sort toolbar for equipment list -- slot
//          filter pills, sort dropdown, text search, hide-maxed.
// ============================================================

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

const SLOT_FILTERS = [
  { key: 'ALL', label: 'All', icon: '\u2726' },
  { key: 'HAT', label: 'Hat', icon: '\uD83C\uDFA9' },
  { key: 'GLASSES', label: 'Glasses', icon: '\uD83D\uDC53' },
  { key: 'COSTUME', label: 'Costume', icon: '\uD83D\uDC57' },
  { key: 'SHIRT', label: 'Shirt', icon: '\uD83D\uDC55' },
  { key: 'WINGS', label: 'Wings', icon: '\uD83E\uDD8B' },
  { key: 'BOOTS', label: 'Boots', icon: '\uD83D\uDC62' },
]

type SortKey = 'level-desc' | 'level-asc' | 'rarity' | 'bonus' | 'name'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'level-desc', label: 'Level (high)' },
  { key: 'level-asc', label: 'Level (low)' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'bonus', label: 'Bonus %' },
  { key: 'name', label: 'Name' },
]

const RARITY_ORDER: Record<string, number> = {
  MYTHICAL: 6, LEGENDARY: 5, EPIC: 4, RARE: 3, UNCOMMON: 2, COMMON: 1,
}

export interface EquipmentFilterState {
  slotFilter: string
  sortKey: SortKey
  searchQuery: string
  hideMaxed: boolean
}

interface EquipmentFilterProps {
  state: EquipmentFilterState
  onChange: (state: EquipmentFilterState) => void
  totalCount: number
  filteredCount: number
}

export function EquipmentFilter({ state, onChange, totalCount, filteredCount }: EquipmentFilterProps) {
  const update = (partial: Partial<EquipmentFilterState>) =>
    onChange({ ...state, ...partial })

  return (
    <div className="space-y-2 px-2 py-2 border-b-2 border-[#1a2a3c] bg-[#0d1424]">
      {/* Slot filter pills */}
      <div className="flex flex-wrap gap-1">
        {SLOT_FILTERS.map((s) => (
          <button
            key={s.key}
            onClick={() => update({ slotFilter: s.key })}
            className={cn(
              'font-pixel text-[10px] px-2 py-1 border transition-all',
              state.slotFilter === s.key
                ? 'border-[var(--pet-gold)] bg-[var(--pet-gold)]/10 text-[var(--pet-gold)]'
                : 'border-[#1a2a3c] bg-[#080c18] text-[var(--pet-text-dim)] hover:bg-[#101828]'
            )}
          >
            <span className="mr-0.5">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Search + sort + hide maxed */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Search..."
            className="w-full font-pixel text-[11px] bg-[#080c18] border border-[#1a2a3c] px-2 py-1 text-[var(--pet-text)] placeholder:text-[var(--pet-text-dim)]/50 outline-none focus:border-[var(--pet-gold)]/50"
          />
        </div>
        <select
          value={state.sortKey}
          onChange={(e) => update({ sortKey: e.target.value as SortKey })}
          className="font-pixel text-[10px] bg-[#080c18] border border-[#1a2a3c] px-1.5 py-1 text-[var(--pet-text-dim)] outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={state.hideMaxed}
            onChange={(e) => update({ hideMaxed: e.target.checked })}
            className="w-3 h-3 accent-[var(--pet-gold)]"
          />
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim)] whitespace-nowrap">Hide MAX</span>
        </label>
      </div>

      {/* Count */}
      {filteredCount !== totalCount && (
        <p className="font-pixel text-[9px] text-[var(--pet-text-dim)]">
          Showing {filteredCount} of {totalCount}
        </p>
      )}
    </div>
  )
}

export function useEquipmentFilter() {
  const [state, setState] = useState<EquipmentFilterState>({
    slotFilter: 'ALL',
    sortKey: 'level-desc',
    searchQuery: '',
    hideMaxed: false,
  })

  return { filterState: state, setFilterState: setState }
}

export function applyEquipmentFilter<T extends {
  enhancementLevel: number
  maxLevel: number
  totalBonus: number
  item: { name: string; rarity: string; category: string }
}>(items: T[], state: EquipmentFilterState): T[] {
  let filtered = items

  if (state.slotFilter !== 'ALL') {
    filtered = filtered.filter(e => e.item.category === state.slotFilter)
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase()
    filtered = filtered.filter(e => e.item.name.toLowerCase().includes(q))
  }

  if (state.hideMaxed) {
    filtered = filtered.filter(e => e.enhancementLevel < e.maxLevel)
  }

  const sorted = [...filtered]
  switch (state.sortKey) {
    case 'level-desc':
      sorted.sort((a, b) => b.enhancementLevel - a.enhancementLevel)
      break
    case 'level-asc':
      sorted.sort((a, b) => a.enhancementLevel - b.enhancementLevel)
      break
    case 'rarity':
      sorted.sort((a, b) => (RARITY_ORDER[b.item.rarity] || 0) - (RARITY_ORDER[a.item.rarity] || 0))
      break
    case 'bonus':
      sorted.sort((a, b) => b.totalBonus - a.totalBonus)
      break
    case 'name':
      sorted.sort((a, b) => a.item.name.localeCompare(b.item.name))
      break
  }

  return sorted
}
