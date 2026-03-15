// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Multi-select rarity filter pills with glow effect
// ============================================================
import { cn } from "@/lib/utils"

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"] as const

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  COMMON:    { bg: "bg-gray-500/10",   border: "border-gray-500/30",   text: "text-gray-400",   glow: "shadow-gray-500/20" },
  UNCOMMON:  { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  glow: "shadow-green-500/20" },
  RARE:      { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   glow: "shadow-blue-500/20" },
  EPIC:      { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-purple-500/20" },
  LEGENDARY: { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  glow: "shadow-amber-500/20" },
  MYTHICAL:  { bg: "bg-rose-500/10",   border: "border-rose-500/30",   text: "text-rose-400",   glow: "shadow-rose-500/20" },
}

interface Props {
  selected: Set<string>
  onChange: (selected: Set<string>) => void
}

export default function RarityPills({ selected, onChange }: Props) {
  function toggle(r: string) {
    const next = new Set(selected)
    if (next.has(r)) next.delete(r)
    else next.add(r)
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {RARITIES.map((r) => {
        const s = RARITY_STYLES[r]
        const active = selected.has(r)
        return (
          <button
            key={r}
            onClick={() => toggle(r)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              active
                ? `${s.bg} ${s.border} ${s.text} shadow-md ${s.glow}`
                : "bg-muted/20 border-transparent text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
