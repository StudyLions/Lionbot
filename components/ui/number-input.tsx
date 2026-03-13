// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Number input with increment/decrement buttons and optional unit
// ============================================================
import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  allowNull?: boolean
  className?: string
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder,
  allowNull = false,
  className,
}: NumberInputProps) {
  const displayValue = value === null ? "" : String(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === "" && allowNull) {
      onChange(null)
      return
    }
    const parsed = parseFloat(raw)
    if (!Number.isNaN(parsed)) {
      let next = parsed
      if (min !== undefined && next < min) next = min
      if (max !== undefined && next > max) next = max
      onChange(next)
    }
  }

  const increment = () => {
    const current = value ?? min ?? 0
    const next = current + step
    const clamped =
      max !== undefined ? Math.min(next, max) : next
    onChange(clamped)
  }

  const decrement = () => {
    const current = value ?? max ?? 0
    const next = current - step
    const clamped =
      min !== undefined ? Math.max(next, min) : next
    onChange(clamped)
  }

  const canDecrement =
    value === null
      ? min === undefined || (min ?? 0) - step >= (min ?? -Infinity)
      : min === undefined || value > min

  const canIncrement =
    value === null
      ? max === undefined || (max ?? 0) + step <= (max ?? Infinity)
      : max === undefined || value < max

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-input bg-background",
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={!canDecrement}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-l-md text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={(e) => {
          if (allowNull && e.target.value === "") {
            onChange(null)
          }
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={cn(
          "h-10 min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-0",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
      />
      <button
        type="button"
        onClick={increment}
        disabled={!canIncrement}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-r-md text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
      {unit && (
        <span className="px-2 text-sm text-muted-foreground">{unit}</span>
      )}
    </div>
  )
}
