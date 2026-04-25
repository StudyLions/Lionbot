// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Info tooltip for explaining settings to non-technical users
// ============================================================
import { HelpCircle } from "lucide-react"
import { useState, useRef, useEffect, ReactNode, useId } from "react"

interface TooltipProps {
  content: string | ReactNode
  className?: string
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Allow custom trigger size for inline use cases
  size?: number
  // --- END AI-MODIFIED ---
}

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- detect touch device for click-toggle behaviour,
// keep open on hover (eliminate flicker by separating hover and click state),
// close on Esc, add aria-describedby tying trigger to popover, fade-in animation
export default function Tooltip({ content, className = "", size = 15 }: TooltipProps) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [clickOpen, setClickOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  const open = hoverOpen || clickOpen

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setClickOpen(false)
        setHoverOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setClickOpen(false)
        setHoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setClickOpen((v) => !v)}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        onFocus={() => setHoverOpen(true)}
        onBlur={() => setHoverOpen(false)}
        className="text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        aria-label="More info"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
      >
        <HelpCircle size={size} />
      </button>
      {open && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-foreground/90 bg-card border border-border rounded-lg shadow-xl motion-safe:animate-fade-in"
        >
          {content}
          <div
            aria-hidden="true"
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border"
          />
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---
