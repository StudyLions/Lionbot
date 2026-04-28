// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled card with optional corner decorations
// ============================================================
import { HTMLAttributes, ReactNode, forwardRef } from "react"
import { cn } from "@/lib/utils"

// --- AI-MODIFIED (2026-04-28) ---
// Purpose: Real pixel-art chrome upgrade. The original card was just a
// border + hard shadow with optional tiny clipped triangles in corners.
// Now it supports:
//   - `title`: a proper title bar across the top (dark strip + pixel font
//     + optional `titleRight` for actions/badges on the right). Replaces
//     the "icon + label + border-bottom" pattern repeated 12+ times across
//     /pet pages.
//   - `accent`: drives the title bar color and matches the locked 5-ink
//     action palette (gold/blue/green/red/purple). When no title is set,
//     this still tints the inset top highlight so the card has a hint of
//     personality.
//   - `corners`: now renders 4x4 "rivet" squares with a 2-tone bevel
//     instead of clipped triangles. Reads as actual hardware on the panel.
//   - inset top highlight on every card so they feel slightly raised,
//     matching real pixel-art panel chrome.
//   - `interactive` prop unchanged (premium polish -- hover translate +
//     focus ring for clickable rows like marketplace listings).
type PixelAccent = "gold" | "blue" | "green" | "red" | "purple" | "neutral"

const ACCENT_COLORS: Record<PixelAccent, { bar: string; text: string; rim: string; shadow: string }> = {
  gold:    { bar: "#1a1408", text: "#f0c040", rim: "#f0c040", shadow: "rgba(240,192,64,0.10)" },
  blue:    { bar: "#0a1226", text: "#80b0ff", rim: "#4080f0", shadow: "rgba(64,128,240,0.10)" },
  green:   { bar: "#0a1c12", text: "#80e0a0", rim: "#40d870", shadow: "rgba(64,216,112,0.10)" },
  red:     { bar: "#1c0a0a", text: "#ff9090", rim: "#e04040", shadow: "rgba(224,64,64,0.10)" },
  purple:  { bar: "#180a26", text: "#e0a0ff", rim: "#d060f0", shadow: "rgba(208,96,240,0.10)" },
  neutral: { bar: "#0a0e1a", text: "#c0d0e0", rim: "#3a4a6c", shadow: "rgba(120,140,180,0.06)" },
}

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  borderColor?: string
  glow?: boolean
  corners?: boolean
  interactive?: boolean
  /** Optional title bar across the top of the card. Plain text. */
  title?: string
  /** Optional content rendered on the right side of the title bar (badges, actions). */
  titleRight?: ReactNode
  /** Optional small icon before the title text. */
  titleIcon?: ReactNode
  /** Drives accent color of the title bar / inset highlight. Defaults to neutral. */
  accent?: PixelAccent
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, borderColor, glow, corners, interactive, title, titleIcon, titleRight, accent = "neutral", children, ...props }, ref) => {
    const a = ACCENT_COLORS[accent]
    const effectiveBorder = borderColor || a.rim
    return (
      <div
        ref={ref}
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
        style={{
          borderColor: borderColor ?? undefined,
          // Inset top highlight makes cards feel raised; tinted by accent.
          boxShadow: `2px 2px 0 #060810, inset 0 1px 0 ${a.shadow}`,
        }}
        {...props}
      >
        {title && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 -m-[2px] mb-0 border-2"
            style={{ background: a.bar, borderColor: effectiveBorder }}
          >
            {titleIcon && <span className="opacity-90 leading-none">{titleIcon}</span>}
            <span
              className="font-pixel text-[12px] uppercase tracking-wider truncate"
              style={{ color: a.text }}
            >
              {title}
            </span>
            {titleRight && <span className="ml-auto flex items-center gap-2">{titleRight}</span>}
          </div>
        )}
        {corners && (
          <>
            {/* 4x4 rivets in each corner with a 2-tone bevel for hardware feel */}
            <span
              className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] pointer-events-none"
              style={{
                background: effectiveBorder,
                boxShadow: `inset 1px 1px 0 ${a.shadow}, inset -1px -1px 0 rgba(0,0,0,0.5)`,
              }}
            />
            <span
              className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] pointer-events-none"
              style={{
                background: effectiveBorder,
                boxShadow: `inset 1px 1px 0 ${a.shadow}, inset -1px -1px 0 rgba(0,0,0,0.5)`,
              }}
            />
            <span
              className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] pointer-events-none"
              style={{
                background: effectiveBorder,
                boxShadow: `inset 1px 1px 0 ${a.shadow}, inset -1px -1px 0 rgba(0,0,0,0.5)`,
              }}
            />
            <span
              className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] pointer-events-none"
              style={{
                background: effectiveBorder,
                boxShadow: `inset 1px 1px 0 ${a.shadow}, inset -1px -1px 0 rgba(0,0,0,0.5)`,
              }}
            />
          </>
        )}
        {children}
      </div>
    )
  }
)
// --- END AI-MODIFIED ---

PixelCard.displayName = "PixelCard"
export default PixelCard
export type { PixelAccent }
