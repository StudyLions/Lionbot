// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Mobile-first slider with paired numeric input and 44\u00d744px thumb
//          (Apple HIG / WCAG touch-target minimum). Mobile audit found the
//          existing setup wizard slider thumb was 16-28px and impossible to
//          grab one-handed; the input pair gives precision without needing
//          tiny taps.
//
//          - Range slider: any value in [min, max] step `step`
//          - Numeric input: same range, clamps on blur, free typing
//          - Optional recommended tick mark on the track
//          - Font size 16px on the input (prevents iOS auto-zoom on focus)
// ============================================================
import { useEffect, useState } from "react"

interface Props {
  value: number | null | undefined
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  recommended?: number
  label?: string
  id?: string
  /** Hide the numeric input pair (slider-only). Defaults to false (input visible). */
  inputHidden?: boolean
}

export default function MobileSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  recommended,
  label,
  id,
  inputHidden = false,
}: Props) {
  const inputId = id || `mslider-${label?.replace(/\s+/g, "-").toLowerCase() || "v"}`
  const numeric = value ?? min

  // Keep a typed draft so users can clear and retype without the value snapping
  // back mid-edit (matches NumberInput behavior).
  const [draft, setDraft] = useState<string>(String(numeric))
  useEffect(() => setDraft(String(numeric)), [numeric])

  function commitDraft() {
    if (draft === "") {
      setDraft(String(min))
      onChange(min)
      return
    }
    const n = Number(draft)
    if (Number.isNaN(n)) {
      setDraft(String(numeric))
      return
    }
    const clamped = Math.max(min, Math.min(max, n))
    setDraft(String(clamped))
    onChange(clamped)
  }

  // Recommended tick: a small dot on the track at the recommended position.
  const recommendedPct =
    recommended !== undefined ? ((recommended - min) / (max - min)) * 100 : null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={numeric}
            onChange={(e) => {
              const n = Number(e.target.value)
              setDraft(String(n))
              onChange(n)
            }}
            className="setup-mobile-slider w-full"
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={numeric}
          />
          {recommendedPct !== null && (
            <span
              aria-hidden="true"
              title={`Recommended: ${recommended}`}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-3 rounded-sm bg-primary/60"
              style={{ left: `${recommendedPct}%` }}
            />
          )}
        </div>
        {!inputHidden && (
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            // 16px font prevents iOS Safari auto-zoom on focus; w-20 keeps it tight
            // but readable on small screens.
            className="w-20 px-2 py-2 text-base text-right bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground tabular-nums"
            aria-label={`${label} value`}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{min}{unit ? ` ${unit}` : ""}</span>
        <span>{max}{unit ? ` ${unit}` : ""}</span>
      </div>
    </div>
  )
}
