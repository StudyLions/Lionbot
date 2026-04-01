// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-31
// Purpose: Simple color picker for boards and columns
// ============================================================
import { cn } from "@/lib/utils"

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e", "#ef4444",
  "#f59e0b", "#eab308", "#84cc16",
  "#10b981", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6b7280", "#78716c",
]

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
  className?: string
}

export default function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "w-7 h-7 rounded-full border-2 transition-all",
          !value ? "border-white ring-2 ring-white/30 scale-110" : "border-gray-600 hover:border-gray-400"
        )}
      >
        <span className="block w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800" />
      </button>
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "w-7 h-7 rounded-full border-2 transition-all",
            value === c ? "border-white ring-2 ring-white/30 scale-110" : "border-transparent hover:border-gray-400"
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
