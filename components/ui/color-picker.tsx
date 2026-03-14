// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Hex color picker with native picker, RGBA support
// ============================================================
import * as React from "react"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#6366f1", "#a855f7",
] as const

const HEX6_REGEX = /^#([A-Fa-f0-9]{6})$/
const HEX8_REGEX = /^#([A-Fa-f0-9]{8})$/

function isValidHex(v: string) {
  return HEX6_REGEX.test(v) || HEX8_REGEX.test(v)
}

function hexToRgb6(hex: string) {
  return hex.slice(0, 7)
}

function getAlpha(hex: string): number {
  if (hex.length === 9) {
    return parseInt(hex.slice(7, 9), 16) / 255
  }
  return 1
}

function setAlpha(hex: string, alpha: number): string {
  const base = hex.slice(0, 7)
  if (alpha >= 1) return base
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase()
  return `${base}${a}`
}

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  compact?: boolean
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  compact = false,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isValid, setIsValid] = React.useState(isValidHex(value))
  const nativeRef = React.useRef<HTMLInputElement>(null)

  const hasAlpha = value.length === 9
  const alpha = getAlpha(value)

  React.useEffect(() => {
    setInputValue(value)
    setIsValid(isValidHex(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    const valid = isValidHex(next)
    setIsValid(valid)
    if (valid) onChange(next)
  }

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value.toUpperCase()
    const result = hasAlpha ? setAlpha(color, alpha) : color
    setInputValue(result)
    setIsValid(true)
    onChange(result)
  }

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseFloat(e.target.value)
    const result = setAlpha(value.slice(0, 7), newAlpha)
    setInputValue(result)
    setIsValid(true)
    onChange(result)
  }

  const handlePresetClick = (color: string) => {
    const result = hasAlpha ? setAlpha(color, alpha) : color
    setInputValue(result)
    setIsValid(true)
    onChange(result)
  }

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: improved compact mode with larger swatch, better alignment, cleaner layout
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 py-0.5", className)}>
        <div className="relative">
          <div
            className="h-7 w-7 shrink-0 rounded-md border border-input cursor-pointer transition-all hover:scale-110 hover:shadow-md shadow-sm"
            style={{
              backgroundColor: isValid ? value : "#6b7280",
              backgroundImage: hasAlpha
                ? `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`
                : undefined,
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            }}
            onClick={() => nativeRef.current?.click()}
          >
            <div
              className="h-full w-full rounded-[5px]"
              style={{ backgroundColor: isValid ? value : "#6b7280" }}
            />
          </div>
          <input
            ref={nativeRef}
            type="color"
            value={isValid ? hexToRgb6(value) : "#6b7280"}
            onChange={handleNativeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
        </div>
        {label && (
          <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate leading-tight">{label}</span>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#FF5733"
          className={cn(
            "h-7 w-[5.5rem] rounded-md border bg-muted/50 px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background transition-colors",
            "border-input",
            !isValid && inputValue !== "" && "border-destructive"
          )}
        />
        {hasAlpha && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={alpha}
            onChange={handleAlphaChange}
            className="w-14 h-1 accent-primary"
            title={`Opacity: ${Math.round(alpha * 100)}%`}
          />
        )}
      </div>
    )
  }
  // --- END AI-MODIFIED ---

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <div
            className="h-8 w-8 shrink-0 rounded-md border border-input cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: isValid ? value : "#6b7280" }}
            onClick={() => nativeRef.current?.click()}
          />
          <input
            ref={nativeRef}
            type="color"
            value={isValid ? hexToRgb6(value) : "#6b7280"}
            onChange={handleNativeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#FF5733"
          className={cn(
            "h-10 w-28 rounded-md border bg-background px-3 py-2 text-sm font-mono text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "border-input",
            !isValid && inputValue !== "" && "border-destructive"
          )}
          aria-label={label ?? "Hex color"}
        />
        {hasAlpha && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={handleAlphaChange}
              className="w-20 h-1.5 accent-primary"
            />
            <span className="text-xs text-muted-foreground w-8">
              {Math.round(alpha * 100)}%
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className={cn(
                "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                hexToRgb6(value).toUpperCase() === color.toUpperCase()
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
