// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Week prev/next navigation for Voice Time Editor timeline
// ============================================================
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { startOfWeekMonday } from "@/lib/voiceEditorTimeline"

interface VoiceEditorWeekNavProps {
  /** Monday 00:00 local of the displayed week */
  weekMonday: Date
  onWeekMondayChange: (d: Date) => void
  className?: string
}

export default function VoiceEditorWeekNav({
  weekMonday,
  onWeekMondayChange,
  className,
}: VoiceEditorWeekNavProps) {
  const sunday = new Date(weekMonday)
  sunday.setDate(sunday.getDate() + 6)

  const label = `${weekMonday.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`

  const thisWeekStart = startOfWeekMonday(new Date())

  const goPrev = () => {
    const d = new Date(weekMonday)
    d.setDate(d.getDate() - 7)
    onWeekMondayChange(d)
  }

  const goNext = () => {
    const d = new Date(weekMonday)
    d.setDate(d.getDate() + 7)
    onWeekMondayChange(d)
  }

  const goThisWeek = () => {
    onWeekMondayChange(thisWeekStart)
  }

  const isThisWeek =
    weekMonday.getFullYear() === thisWeekStart.getFullYear() &&
    weekMonday.getMonth() === thisWeekStart.getMonth() &&
    weekMonday.getDate() === thisWeekStart.getDate()

  return (
    <div className={cn("flex items-center justify-between gap-3 flex-wrap", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goPrev}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <p className="text-sm font-semibold text-foreground tabular-nums">{label}</p>
      <button
        type="button"
        onClick={goThisWeek}
        disabled={isThisWeek}
        className={cn(
          "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
          isThisWeek
            ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
            : "border-primary/40 text-primary hover:bg-primary/10"
        )}
      >
        This week
      </button>
    </div>
  )
}
