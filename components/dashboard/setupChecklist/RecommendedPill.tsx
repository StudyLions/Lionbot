// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Small clickable pill shown next to a slider/input that snaps the
//          value to the recommended default in one tap.
//          Tap target is at least 32px tall to stay finger-friendly without
//          dominating the row.
// ============================================================
import { Sparkles, Check } from "lucide-react"

interface Props {
  value: number | string
  current?: number | string | null
  onSnap: () => void
  label?: string
}

export default function RecommendedPill({ value, current, onSnap, label = "Recommended" }: Props) {
  const isAtRecommended =
    current !== undefined && current !== null && String(current) === String(value)

  if (isAtRecommended) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-1">
        <Check size={11} />
        Using {label.toLowerCase()}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onSnap}
      className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-full text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${label} value: ${value}. Click to use.`}
    >
      <Sparkles size={11} aria-hidden="true" />
      {label}: {value}
    </button>
  )
}
