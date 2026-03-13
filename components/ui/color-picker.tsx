// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Hex color picker for shop page color role creation
// ============================================================
import * as React from "react"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
  "#6366f1",
  "#a855f7",
] as const

const HEX_REGEX = /^#([A-Fa-f0-9]{6})$/

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isValid, setIsValid] = React.useState(HEX_REGEX.test(value))

  React.useEffect(() => {
    setInputValue(value)
    setIsValid(HEX_REGEX.test(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    const valid = HEX_REGEX.test(next)
    setIsValid(valid)
    if (valid) {
      onChange(next)
    }
  }

  const handlePresetClick = (color: string) => {
    setInputValue(color)
    setIsValid(true)
    onChange(color)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="h-8 w-8 shrink-0 rounded-md border border-input"
          style={{ backgroundColor: isValid ? value : "#6b7280" }}
          aria-hidden
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#FF5733"
          className={cn(
            "h-10 w-28 rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "border-input",
            !isValid && inputValue !== "" && "border-destructive"
          )}
          aria-label={label ?? "Hex color"}
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className={cn(
                "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                value === color
                  ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "border-input hover:border-muted-foreground"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
