// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-28
// Purpose: Page-title strip used at the top of every /pet page.
//          Replaces the half-hearted 3-bar golden underline pattern
//          with a real pixel-art title bar:
//            [▣] PAGE NAME · subtitle              [extras] [actions]
//          - 4-pixel ornament block on the left
//          - chunky pixel-font title with optional dim subtitle
//          - bevel + rivet corners + hard shadow so it reads as
//            actual hardware on the page
//          - right-side `actions` slot for icon-buttons (rename, help, etc.)
// ============================================================
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { PixelAccent } from "./PixelCard"

interface PixelTitleBarProps {
  title: string
  subtitle?: ReactNode
  /** Optional content rendered on the right side of the title bar (icon buttons etc). */
  actions?: ReactNode
  /** Drives ornament + title color. Defaults to gold. */
  accent?: Extract<PixelAccent, "gold" | "blue" | "green" | "red" | "purple">
  className?: string
}

const ACCENT: Record<NonNullable<PixelTitleBarProps["accent"]>, { ink: string; ornament: string; rim: string }> = {
  gold:   { ink: "#ffd860", ornament: "#f0c040", rim: "#6a5a1a" },
  blue:   { ink: "#80b0ff", ornament: "#4080f0", rim: "#1a3070" },
  green:  { ink: "#80e0a0", ornament: "#40d870", rim: "#1a4a2a" },
  red:    { ink: "#ff9090", ornament: "#e04040", rim: "#5c1a1a" },
  purple: { ink: "#e0a0ff", ornament: "#d060f0", rim: "#3a1a5c" },
}

export default function PixelTitleBar({
  title,
  subtitle,
  actions,
  accent = "gold",
  className,
}: PixelTitleBarProps) {
  const a = ACCENT[accent]
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 border-2",
        "bg-gradient-to-b from-[#0c1424] to-[#080c18]",
        className
      )}
      style={{
        borderColor: a.rim,
        boxShadow: `2px 2px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Left ornament: stack of 3 pixel blocks fading down (call-out the title) */}
      <span className="flex flex-col gap-[2px] flex-shrink-0" aria-hidden="true">
        <span className="block w-[6px] h-[6px]" style={{ background: a.ornament, boxShadow: "1px 1px 0 #060810" }} />
        <span className="block w-[4px] h-[4px] ml-px" style={{ background: a.ornament, opacity: 0.6 }} />
        <span className="block w-[2px] h-[2px] ml-[3px]" style={{ background: a.ornament, opacity: 0.3 }} />
      </span>

      <div className="min-w-0 flex-1">
        <h1
          className="font-pixel text-xl leading-tight truncate"
          style={{ color: a.ink, textShadow: "2px 2px 0 #060810" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>
      )}

      {/* Rivet corners (4x4 with 2-tone bevel) so the bar feels mounted */}
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className="absolute w-[6px] h-[6px] pointer-events-none"
          style={{
            background: a.ornament,
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.6)",
            top: pos.startsWith("top") ? -3 : "auto",
            bottom: pos.startsWith("bottom") ? -3 : "auto",
            left: pos.endsWith("left") ? -3 : "auto",
            right: pos.endsWith("right") ? -3 : "auto",
          }}
        />
      ))}
    </div>
  )
}
