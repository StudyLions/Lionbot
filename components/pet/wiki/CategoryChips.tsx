// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Category filter chips - pixel art style
// ============================================================
import { cn } from "@/lib/utils"
import { getCategoryPlaceholder } from "@/utils/petAssets"

interface CategoryCount { category: string; count: number }
interface Props { categories: CategoryCount[]; selected: string; onChange: (category: string) => void }

export default function CategoryChips({ categories, selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange("")}
        className={cn(
          "font-pixel px-2.5 py-1 text-[10px] border-2 transition-all",
          !selected
            ? "border-[var(--pet-blue,#4080f0)] bg-[#1a2a50] text-[var(--pet-blue,#4080f0)]"
            : "border-[#1a2a3c] bg-[#0a0e1a] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]"
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.category}
          onClick={() => onChange(c.category === selected ? "" : c.category)}
          className={cn(
            "font-pixel px-2.5 py-1 text-[10px] border-2 transition-all flex items-center gap-1",
            selected === c.category
              ? "border-[var(--pet-blue,#4080f0)] bg-[#1a2a50] text-[var(--pet-blue,#4080f0)]"
              : "border-[#1a2a3c] bg-[#0a0e1a] text-[var(--pet-text-dim,#8899aa)] hover:text-[var(--pet-text,#e2e8f0)]"
          )}
        >
          <span>{getCategoryPlaceholder(c.category)}</span>
          <span>{c.category.replace("_", " ")}</span>
          <span className="opacity-50">({c.count})</span>
        </button>
      ))}
    </div>
  )
}
