// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled card with optional corner decorations
// ============================================================
import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  borderColor?: string
  glow?: boolean
  corners?: boolean
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, borderColor, glow, corners, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)]",
        "shadow-[2px_2px_0_#060810]",
        glow && "shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]",
        className
      )}
      style={borderColor ? { borderColor } : undefined}
      {...props}
    >
      {corners && (
        <>
          <span className="absolute -top-[2px] -left-[2px] w-[6px] h-[6px] pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${borderColor || "var(--pet-border, #2a3a5c)"}`, clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          <span className="absolute -top-[2px] -right-[2px] w-[6px] h-[6px] pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${borderColor || "var(--pet-border, #2a3a5c)"}`, clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
          <span className="absolute -bottom-[2px] -left-[2px] w-[6px] h-[6px] pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${borderColor || "var(--pet-border, #2a3a5c)"}`, clipPath: "polygon(0 0, 0 100%, 100% 100%)" }} />
          <span className="absolute -bottom-[2px] -right-[2px] w-[6px] h-[6px] pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${borderColor || "var(--pet-border, #2a3a5c)"}`, clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
        </>
      )}
      {children}
    </div>
  )
)

PixelCard.displayName = "PixelCard"
export default PixelCard
