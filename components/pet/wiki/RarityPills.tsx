// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Multi-select rarity filter toggles - pixel art style
// ============================================================
import { cn } from "@/lib/utils"

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"] as const

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  COMMON:    { border: "#6a7a8a", bg: "#1a2030", text: "#8899aa" },
  UNCOMMON:  { border: "#4080f0", bg: "#101830", text: "#80b0ff" },
  RARE:      { border: "#e04040", bg: "#301018", text: "#ff8080" },
  EPIC:      { border: "#f0c040", bg: "#302818", text: "#ffe080" },
  LEGENDARY: { border: "#d060f0", bg: "#281030", text: "#e0a0ff" },
  MYTHICAL:  { border: "#ff6080", bg: "#301020", text: "#ff90a0" },
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

  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Grid layout -- 6 cols desktop (one per rarity), 3 cols mobile
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
      {RARITIES.map((r) => {
        const c = RARITY_COLORS[r]
        const active = selected.has(r)
        return (
          <button
            key={r}
            onClick={() => toggle(r)}
            className="font-pixel px-3 py-1.5 text-[12px] border-2 transition-all"
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
  )
  // --- END AI-MODIFIED ---
}
