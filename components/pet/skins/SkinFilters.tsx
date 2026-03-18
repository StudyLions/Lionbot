// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Filter bar for skin gallery -- filter by unlock type
//          and owned status, all client-side
// ============================================================
import { cn } from "@/lib/utils"
import { UnlockFilter, OwnedFilter, UNLOCK_BADGE } from "./skinTypes"

interface SkinFiltersProps {
  unlockFilter: UnlockFilter
  ownedFilter: OwnedFilter
  onUnlockChange: (f: UnlockFilter) => void
  onOwnedChange: (f: OwnedFilter) => void
  typeCounts: Record<string, number>
}

const UNLOCK_OPTIONS: { key: UnlockFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "FREE", label: "Free" },
  { key: "GOLD", label: "Gold" },
  { key: "GEMS", label: "Gems" },
  { key: "LEVEL", label: "Level" },
]

const OWNED_OPTIONS: { key: OwnedFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OWNED", label: "Owned" },
  { key: "UNOWNED", label: "Locked" },
]

export default function SkinFilters({
  unlockFilter,
  ownedFilter,
  onUnlockChange,
  onOwnedChange,
  typeCounts,
}: SkinFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {/* Unlock type toggles */}
      <div className="flex gap-px bg-[#0a0e1a] border border-[#1a2a3c] p-0.5">
        {UNLOCK_OPTIONS
          .filter((opt) => opt.key === "ALL" || (typeCounts[opt.key] ?? 0) > 0)
          .map((opt) => {
            const active = unlockFilter === opt.key
            const badge = opt.key !== "ALL" ? UNLOCK_BADGE[opt.key] : null
            return (
              <button
                key={opt.key}
                onClick={() => onUnlockChange(opt.key)}
                className={cn(
                  "font-pixel text-[11px] px-2.5 py-1 transition-colors",
                  active
                    ? "text-[var(--pet-text,#e2e8f0)]"
                    : "text-[#4a5a70] hover:text-[#8899aa]"
                )}
                style={active ? {
                  backgroundColor: badge ? `${badge.bg}18` : "#1a2438",
                  borderBottom: `2px solid ${badge?.color ?? "#8899aa"}`,
                } : { borderBottom: "2px solid transparent" }}
              >
                {opt.label}
              </button>
            )
          })}
      </div>

      <div className="w-px h-5 bg-[#1a2a3c] hidden sm:block" />

      {/* Owned toggles */}
      <div className="flex gap-px bg-[#0a0e1a] border border-[#1a2a3c] p-0.5">
        {OWNED_OPTIONS.map((opt) => {
          const active = ownedFilter === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onOwnedChange(opt.key)}
              className={cn(
                "font-pixel text-[11px] px-2.5 py-1 transition-colors",
                active
                  ? "bg-[#1a2438] text-[var(--pet-text,#e2e8f0)]"
                  : "text-[#4a5a70] hover:text-[#8899aa]"
              )}
              style={active ? { borderBottom: "2px solid #8899aa" } : { borderBottom: "2px solid transparent" }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
