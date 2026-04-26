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
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- interactive variant for clickable cards
  // (inventory rows, marketplace listings) -- adds hover translate + focus ring
  interactive?: boolean
  // --- END AI-MODIFIED ---
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, borderColor, glow, corners, interactive, children, ...props }, ref) => (
    <div
      ref={ref}
      // --- AI-MODIFIED (2026-04-25) ---
      // Purpose: Premium polish -- interactive cards translate on hover (matching
      // PixelButton press feel) and surface a focus-visible ring for keyboard nav
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "relative bg-[var(--pet-card,#0f1628)] border-2 border-[var(--pet-border,#2a3a5c)]",
        "shadow-[2px_2px_0_#060810]",
        glow && "shadow-[2px_2px_0_#060810,0_0_12px_rgba(64,128,240,0.15)]",
        interactive && [
          "cursor-pointer transition-all",
          "motion-safe:hover:shadow-[1px_1px_0_#060810,0_0_10px_rgba(64,128,240,0.2)]",
          "motion-safe:hover:translate-x-px motion-safe:hover:translate-y-px",
          "motion-safe:hover:border-[var(--pet-blue,#4080f0)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pet-blue,#4080f0)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0e1a]",
        ],
        className
      )}
      // --- END AI-MODIFIED ---
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
