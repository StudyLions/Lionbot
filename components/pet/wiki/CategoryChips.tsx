// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Category filter chip row with icons and counts
// ============================================================
import { cn } from "@/lib/utils"
import { getCategoryPlaceholder } from "@/utils/petAssets"

interface CategoryCount {
  category: string
  count: number
}

interface Props {
  categories: CategoryCount[]
  selected: string
  onChange: (category: string) => void
}

export default function CategoryChips({ categories, selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange("")}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
          !selected
            ? "bg-primary/15 text-primary border-primary/30"
            : "bg-muted/20 text-muted-foreground/60 border-transparent hover:text-muted-foreground"
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.category}
          onClick={() => onChange(c.category === selected ? "" : c.category)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5",
            selected === c.category
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-muted/20 text-muted-foreground/60 border-transparent hover:text-muted-foreground"
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
