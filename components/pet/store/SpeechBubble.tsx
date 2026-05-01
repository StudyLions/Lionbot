// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- pixel-art speech bubble shown next to
//          the lion shopkeeper on a personal store page. Tail points
//          back at the lion. Pure CSS, no JS animation, so it stays
//          cheap on the public store page.
// ============================================================
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SpeechBubbleProps {
  children: ReactNode
  /**
   * Which side of the bubble the tail sticks out from. Should point AT
   * the lion -- so if the lion is to the LEFT of the bubble, the tail
   * is on the LEFT side of the bubble.
   */
  tailSide?: "left" | "right" | "bottom"
  className?: string
  accentColor?: string | null
}

export default function SpeechBubble({
  children,
  tailSide = "left",
  className,
  accentColor,
}: SpeechBubbleProps) {
  const borderColor = accentColor ?? "var(--pet-gold, #f0c040)"

  return (
    <div className={cn("relative max-w-xs", className)}>
      <div
        className="relative px-4 py-3 bg-[#0c1020]/95 border-2 shadow-[3px_3px_0_rgba(0,0,0,0.6)] backdrop-blur-sm"
        style={{ borderColor }}
      >
        <p className="font-pixel text-[12px] leading-relaxed text-[var(--pet-text,#e2e8f0)] whitespace-pre-wrap break-words">
          {children}
        </p>
      </div>

      {tailSide === "left" && (
        <span
          aria-hidden
          className="absolute top-5 left-0 -translate-x-full"
          style={{
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: `12px solid ${borderColor}`,
          }}
        />
      )}
      {tailSide === "right" && (
        <span
          aria-hidden
          className="absolute top-5 right-0 translate-x-full"
          style={{
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: `12px solid ${borderColor}`,
          }}
        />
      )}
      {tailSide === "bottom" && (
        <span
          aria-hidden
          className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `12px solid ${borderColor}`,
          }}
        />
      )}
    </div>
  )
}
