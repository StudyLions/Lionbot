// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Per-category collection progress bars
// ============================================================
import { getCategoryPlaceholder } from "@/utils/petAssets"
import PixelBar from "@/components/pet/ui/PixelBar"

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Replaced hardcoded #4a5a70 with var(--pet-text-dim) for better contrast (all instances)
// --- END AI-MODIFIED ---

const CAT_BAR_COLORS: Record<string, "green" | "gold" | "blue" | "red"> = {
  HAT: "gold", GLASSES: "blue", COSTUME: "blue",
  SHIRT: "green", WINGS: "red", FURNITURE: "gold",
  MATERIAL: "green", SCROLL: "red", FARM_SEED: "green",
}

interface Props {
  progress: Record<string, { owned: number; total: number }> | null
}

export default function CollectionTracker({ progress }: Props) {
  if (!progress) {
    return (
      <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-4 text-center shadow-[2px_2px_0_#060810]">
        <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#7a8a9a)]">Sign in to track your collection progress</p>
      </div>
    )
  }

  const entries = Object.entries(progress).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-4 shadow-[2px_2px_0_#060810]">
      <h4 className="font-pixel text-[13px] uppercase text-[var(--pet-text-dim,#7a8a9a)] mb-3">Collection Progress</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {entries.map(([cat, { owned, total }]) => {
          const barColor = CAT_BAR_COLORS[cat] ?? "green"
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-base w-5 text-center">{getCategoryPlaceholder(cat)}</span>
              {/* --- AI-MODIFIED (2026-03-24) --- */}
              {/* Purpose: Wider label so FURNITURE and MATERIAL aren't cropped */}
              <span className="font-pixel text-[12px] text-[var(--pet-text-dim,#7a8a9a)] w-20 truncate">{cat.replace("_", " ")}</span>
              {/* --- END AI-MODIFIED --- */}
              <div className="flex-1">
                <PixelBar
                  value={owned}
                  max={total}
                  segments={10}
                  color={barColor}
                  showText={false}
                />
              </div>
              <span className="font-pixel text-[12px] text-[var(--pet-text-dim,#7a8a9a)] w-20 text-right">
                {owned}/{total} ({total > 0 ? Math.round((owned / total) * 100) : 0}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
