// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Per-category collection progress bars
// ============================================================
import { cn } from "@/lib/utils"
import { getCategoryPlaceholder } from "@/utils/petAssets"

const CAT_COLORS: Record<string, string> = {
  HAT: "bg-amber-400", GLASSES: "bg-blue-400", COSTUME: "bg-purple-400",
  SHIRT: "bg-teal-400", WINGS: "bg-pink-400", FURNITURE: "bg-orange-400",
  MATERIAL: "bg-green-400", SCROLL: "bg-rose-400", FARM_SEED: "bg-lime-400",
}

interface Props {
  progress: Record<string, { owned: number; total: number }> | null
}

export default function CollectionTracker({ progress }: Props) {
  if (!progress) {
    return (
      <div className="rounded-xl border border-border/20 bg-muted/5 p-4 text-center text-xs text-muted-foreground/40">
        Sign in to track your collection progress
      </div>
    )
  }

  const entries = Object.entries(progress).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
      <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-3">Collection Progress</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {entries.map(([cat, { owned, total }]) => {
          const pct = total > 0 ? Math.round((owned / total) * 100) : 0
          const color = CAT_COLORS[cat] ?? "bg-gray-400"
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center">{getCategoryPlaceholder(cat)}</span>
              <span className="text-[10px] text-muted-foreground/60 w-16 truncate">{cat.replace("_", " ")}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground/50 w-16 text-right">{owned}/{total} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
