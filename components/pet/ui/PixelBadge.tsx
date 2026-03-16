// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art rarity badge
// ============================================================
import { cn } from "@/lib/utils"

const rarityStyles: Record<string, string> = {
  COMMON: "border-[#6a7080] bg-[#6a7080]/15 text-[#a0a8b4]",
  UNCOMMON: "border-[#4080f0] bg-[#4080f0]/15 text-[#80b0ff]",
  RARE: "border-[#e04040] bg-[#e04040]/15 text-[#ff8080]",
  EPIC: "border-[#f0c040] bg-[#f0c040]/15 text-[#ffe080]",
  LEGENDARY: "border-[#d060f0] bg-[#d060f0]/15 text-[#e0a0ff]",
  MYTHICAL: "border-[#ff60a0] bg-[#ff60a0]/15 text-[#ffa0c0]",
}

interface PixelBadgeProps {
  rarity: string
  className?: string
}

export default function PixelBadge({ rarity, className }: PixelBadgeProps) {
  return (
    <span
      className={cn(
        "font-pixel inline-block px-2 py-0.5 text-[12px] border uppercase tracking-wide",
        rarityStyles[rarity] || rarityStyles.COMMON,
        className
      )}
    >
      {rarity}
    </span>
  )
}
