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

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {showLabel && (
        <span className="text-xs text-muted-foreground tabular-nums min-w-[80px] text-center">
          Page {page} of {totalPages}
        </span>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
