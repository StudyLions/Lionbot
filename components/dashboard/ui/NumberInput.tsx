// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Number input with validation, unit labels, and default value display
// ============================================================

interface NumberInputProps {
  value: number | null | undefined
  onChange: (value: number | null) => void
  label?: string
  unit?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number | null
  placeholder?: string
  disabled?: boolean
  id?: string
  allowNull?: boolean
}

// --- AI-MODIFIED (2026-04-02) ---
// Purpose: Allow free typing by using local draft state; only clamp to min/max on blur
// so users can type intermediate values (e.g. clearing "49" to type "120" without
// the empty/partial value being rejected for being below min)
import { useState, useEffect } from "react"

export default function NumberInput({
  value,
  onChange,
  label,
  unit,
  min,
  max,
  step = 1,
  defaultValue,
  placeholder,
  disabled = false,
  id,
  allowNull = false,
}: NumberInputProps) {
  const inputId = id || `num-${label?.replace(/\s+/g, "-").toLowerCase() || "default"}`
  const isDefault = defaultValue !== undefined && value === defaultValue

  const [draft, setDraft] = useState<string>(
    value === null || value === undefined ? "" : String(value)
  )

  useEffect(() => {
    setDraft(value === null || value === undefined ? "" : String(value))
  }, [value])

  function handleChange(raw: string) {
    setDraft(raw)
    if (raw === "" && allowNull) {
      onChange(null)
      return
    }
    const num = parseFloat(raw)
    if (isNaN(num)) return
    onChange(num)
  }

  function handleBlur() {
    if (draft === "" && allowNull) return
    const num = parseFloat(draft)
    if (isNaN(num) || draft === "") {
      const fallback = min ?? 0
      setDraft(String(fallback))
      onChange(fallback)
      return
    }
    let clamped = num
    if (min !== undefined && clamped < min) clamped = min
    if (max !== undefined && clamped > max) clamped = max
    if (clamped !== num) {
      setDraft(String(clamped))
      onChange(clamped)
    }
  }
  // --- END AI-MODIFIED ---

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      {/* --- AI-MODIFIED (2026-03-21) --- */}
      {/* Purpose: Fix fixed w-32 that overflows on mobile -- use flexible width with wrap */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          id={inputId}
          type="number"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder || (defaultValue !== undefined && defaultValue !== null ? `Default: ${defaultValue}` : undefined)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            w-full sm:w-32 px-3 py-2 bg-card border rounded-lg text-sm text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDefault ? "border-input" : "border-primary/50"}
          `}
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        {defaultValue !== undefined && defaultValue !== null && !isDefault && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors"
            title={`Reset to default (${defaultValue})`}
          >
            Default: {defaultValue}
          </button>
        )}
      </div>
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}
