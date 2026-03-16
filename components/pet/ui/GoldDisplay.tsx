// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Inline gold/gem display with pixel art coin sprite
// ============================================================
import { cn } from "@/lib/utils"
import { getUiIconUrl } from "@/utils/petAssets"

interface GoldDisplayProps {
  amount: number
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  type?: "gold" | "gem"
  showSign?: boolean
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Increased icon and text sizes for better readability
const sizeMap = {
  sm: { icon: 14, text: "text-[12px]" },
  md: { icon: 18, text: "text-sm" },
  lg: { icon: 22, text: "text-base" },
  xl: { icon: 28, text: "text-xl" },
}
// --- END AI-MODIFIED ---

export default function GoldDisplay({ amount, size = "md", className, type = "gold", showSign }: GoldDisplayProps) {
  const s = sizeMap[size]
  const color = type === "gold" ? "text-[var(--pet-gold,#f0c040)]" : "text-[#a855f7]"
  const icon = type === "gold" ? "coin" : "gem"
  const sign = showSign && amount > 0 ? "+" : showSign && amount < 0 ? "" : ""

  return (
    <span className={cn("inline-flex items-center gap-0.5 font-pixel", color, s.text, className)}>
      <img
        src={getUiIconUrl(icon)}
        alt=""
        width={s.icon}
        height={s.icon}
        className="inline-block flex-shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
      {sign}{Math.abs(amount).toLocaleString()}
    </span>
  )
}
