// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled card container
// ============================================================
import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  borderColor?: string
  glow?: boolean
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, borderColor, glow, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)]",
        "shadow-[2px_2px_0_#060810]",
        glow && "shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]",
        className
      )}
      style={borderColor ? { borderColor } : undefined}
      {...props}
    >
      {children}
    </div>
  )
)

PixelCard.displayName = "PixelCard"
export default PixelCard
