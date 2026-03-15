// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Segmented pixel art progress bar
// ============================================================
import { cn } from "@/lib/utils"

interface PixelBarProps {
  value: number
  max: number
  segments?: number
  label?: string
  showText?: boolean
  color?: "green" | "gold" | "blue" | "red"
  className?: string
}

const barColors = {
  green: { filled: "#40d870", empty: "#1a2a20" },
  gold: { filled: "#f0c040", empty: "#2a2518" },
  blue: { filled: "#4080f0", empty: "#1a2030" },
  red: { filled: "#e04040", empty: "#2a1a1a" },
}

export default function PixelBar({
  value, max, segments = 10, label, showText = true, color = "green", className,
}: PixelBarProps) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const filledSegments = Math.round(pct * segments)
  const colors = barColors[color]

  const autoColor = pct >= 1 ? "gold" : pct >= 0.6 ? "green" : color
  const activeColors = barColors[autoColor]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] min-w-[3rem]">{label}</span>}
      <div className="flex gap-px flex-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-4 flex-1 border border-[#1a2030]"
            style={{
              backgroundColor: i < filledSegments ? activeColors.filled : activeColors.empty,
              minWidth: 4,
            }}
          />
        ))}
      </div>
      {showText && (
        <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] min-w-[3rem] text-right">
          {Math.round(pct * 100)}%
        </span>
      )}
    </div>
  )
}
