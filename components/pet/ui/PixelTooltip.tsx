// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled tooltip for farm scene overlays
// ============================================================
import { cn } from "@/lib/utils"

interface PixelTooltipProps {
  children: React.ReactNode
  className?: string
  position?: "top" | "bottom"
}

export default function PixelTooltip({ children, className, position = "top" }: PixelTooltipProps) {
  // --- AI-MODIFIED (2026-03-24) ---
  // Purpose: Added relative so the absolute caret/arrow positions correctly
  return (
    <div
      className={cn(
        "relative font-pixel bg-[#0a0e1a] border-2 border-[#4080f0] px-2 py-1",
        "text-[var(--pet-text,#e2e8f0)] whitespace-nowrap max-w-[calc(100vw-2rem)]",
        "shadow-[2px_2px_0_#060810]",
        "pointer-events-none select-none",
        className
      )}
    >
    {/* --- END AI-MODIFIED --- */}
      {children}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-0 h-0",
          "border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent",
          position === "top"
            ? "bottom-[-7px] border-t-[5px] border-t-[#4080f0]"
            : "top-[-7px] border-b-[5px] border-b-[#4080f0]"
        )}
      />
    </div>
  )
}
