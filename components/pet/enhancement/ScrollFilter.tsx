// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Filter/sort toolbar for scroll list -- rarity
//          filter, sort options, text search.
// ============================================================

import { useState } from 'react'
import { cn } from '@/lib/utils'

const RARITY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'COMMON', label: 'C' },
  { key: 'UNCOMMON', label: 'U' },
  { key: 'RARE', label: 'R' },
  { key: 'EPIC', label: 'E' },
  { key: 'LEGENDARY', label: 'L' },
  { key: 'MYTHICAL', label: 'M' },
]

type ScrollSortKey = 'success' | 'bonus' | 'destroy' | 'quantity' | 'name'

const SORT_OPTIONS: { key: ScrollSortKey; label: string }[] = [
  { key: 'success', label: 'Success %' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'destroy', label: 'Destroy %' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'name', label: 'Name' },
]

export interface ScrollFilterState {
  rarityFilter: string
  sortKey: ScrollSortKey
  searchQuery: string
}

interface ScrollFilterProps {
  state: ScrollFilterState
  onChange: (state: ScrollFilterState) => void
  totalCount: number
  filteredCount: number
}

export function ScrollFilter({ state, onChange, totalCount, filteredCount }: ScrollFilterProps) {
  const update = (partial: Partial<ScrollFilterState>) =>
    onChange({ ...state, ...partial })

  return (
    <div className="space-y-2 px-2 py-2 border-b-2 border-[#1a2a3c] bg-[#0d1424]">
      <div className="flex flex-wrap gap-1">
        {RARITY_FILTERS.map((r) => (
          <button
            key={r.key}
            onClick={() => update({ rarityFilter: r.key })}
            className={cn(
              'font-pixel text-[10px] px-2 py-1 border transition-all',
              state.rarityFilter === r.key
                ? 'border-[var(--pet-gold)] bg-[var(--pet-gold)]/10 text-[var(--pet-gold)]'
                : 'border-[#1a2a3c] bg-[#080c18] text-[var(--pet-text-dim)] hover:bg-[#101828]'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Search scrolls..."
            className="w-full font-pixel text-[11px] bg-[#080c18] border border-[#1a2a3c] px-2 py-1 text-[var(--pet-text)] placeholder:text-[var(--pet-text-dim)]/50 outline-none focus:border-[var(--pet-gold)]/50"
          />
        </div>
        <select
          value={state.sortKey}
          onChange={(e) => update({ sortKey: e.target.value as ScrollSortKey })}
          className="font-pixel text-[10px] bg-[#080c18] border border-[#1a2a3c] px-1.5 py-1 text-[var(--pet-text-dim)] outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      {filteredCount !== totalCount && (
        <p className="font-pixel text-[9px] text-[var(--pet-text-dim)]">
          Showing {filteredCount} of {totalCount}
        </p>
      )}
    </div>
  )
}

export function useScrollFilter() {
  const [state, setState] = useState<ScrollFilterState>({
    rarityFilter: 'ALL',
    sortKey: 'success',
    searchQuery: '',
  })

  return { filterState: state, setFilterState: setState }
}

export function applyScrollFilter<T extends {
  quantity: number
  item: { name: string; rarity: string }
  properties: { successRate: number; destroyRate: number; bonusValue: number } | null
}>(items: T[], state: ScrollFilterState): T[] {
  let filtered = items

  if (state.rarityFilter !== 'ALL') {
    filtered = filtered.filter(s => s.item.rarity === state.rarityFilter)
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase()
    filtered = filtered.filter(s => s.item.name.toLowerCase().includes(q))
  }

  const sorted = [...filtered]
  switch (state.sortKey) {
    case 'success':
      sorted.sort((a, b) => (b.properties?.successRate || 0) - (a.properties?.successRate || 0))
      break
    case 'bonus':
      sorted.sort((a, b) => (b.properties?.bonusValue || 0) - (a.properties?.bonusValue || 0))
      break
    case 'destroy':
      sorted.sort((a, b) => (a.properties?.destroyRate || 0) - (b.properties?.destroyRate || 0))
      break
    case 'quantity':
      sorted.sort((a, b) => b.quantity - a.quantity)
      break
    case 'name':
      sorted.sort((a, b) => a.item.name.localeCompare(b.item.name))
      break
  }

  return sorted
}
