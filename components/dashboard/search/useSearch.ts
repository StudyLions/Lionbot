// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Shared search hook for command palette and sidebar
//          search. Filters and ranks SearchItems by query match.
// ============================================================
import { useMemo } from "react"
import type { SearchItem, SearchCategory } from "./searchRegistry"

export interface SearchResult extends SearchItem {
  /** Higher = better match. Used to sort results. */
  score: number
}

export interface GroupedResults {
  pages: SearchResult[]
  settings: SearchResult[]
  features: SearchResult[]
}

function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase()
  const title = item.title.toLowerCase()
  const desc = item.description.toLowerCase()

  if (title === q) return 100
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60

  if (desc.includes(q)) return 40

  const words = q.split(/\s+/)
  const keywordMatch = words.every((w) =>
    item.keywords.some((k) => k.includes(w)) ||
    title.includes(w) ||
    desc.includes(w) ||
    item.page.toLowerCase().includes(w)
  )
  if (keywordMatch) return 30

  const partialKeyword = words.some((w) =>
    item.keywords.some((k) => k.includes(w)) ||
    title.includes(w)
  )
  if (partialKeyword) return 10

  return 0
}

export function useSearch(query: string, items: SearchItem[]): GroupedResults {
  return useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return { pages: [], settings: [], features: [] }
    }

    const scored = items
      .map((item) => ({ ...item, score: scoreItem(item, trimmed) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)

    const categoryMap: Record<SearchCategory, SearchResult[]> = {
      page: [],
      setting: [],
      feature: [],
    }
    for (const r of scored) {
      categoryMap[r.category].push(r)
    }

    return {
      pages: categoryMap.page,
      settings: categoryMap.setting,
      features: categoryMap.feature,
    }
  }, [query, items])
}

export function flatResults(grouped: GroupedResults): SearchResult[] {
  return [...grouped.pages, ...grouped.settings, ...grouped.features]
}

export function hasResults(grouped: GroupedResults): boolean {
  return grouped.pages.length > 0 || grouped.settings.length > 0 || grouped.features.length > 0
}
