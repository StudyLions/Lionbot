// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Shared pagination component -- replaces 10+ custom
//          pagination implementations across dashboard pages
// ============================================================
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  showLabel?: boolean
  className?: string
}

export default function Pagination({ page, totalPages, onChange, showLabel = true, className }: PaginationProps) {
  if (totalPages <= 1) return null

  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- ensure 40px+ touch targets on mobile,
  // proper focus-visible rings for keyboard users, smoother transitions
  const buttonClass = cn(
    "inline-flex items-center justify-center min-h-10 min-w-10 sm:min-h-9 sm:min-w-9 rounded-lg",
    "text-muted-foreground hover:text-foreground hover:bg-accent",
    "disabled:opacity-40 disabled:pointer-events-none",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  )
  // --- END AI-MODIFIED ---

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={buttonClass}
        aria-label="Previous page"
        type="button"
      >
        <ChevronLeft size={16} />
      </button>
      {showLabel && (
        <span className="text-xs text-muted-foreground tabular-nums min-w-[80px] text-center">
          Page <span className="text-foreground font-medium">{page}</span> of {totalPages}
        </span>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={buttonClass}
        aria-label="Next page"
        type="button"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
