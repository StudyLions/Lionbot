// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: One day row — 24h track, tick labels, session blocks, ghost blocks
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Taller track (h-16), 3h ticks, ghost blocks for pending edits
// --- END AI-MODIFIED ---
// ============================================================
import { cn } from "@/lib/utils"
import type { VoiceEditorSession } from "@/lib/voiceEditorTimeline"
import { filterSessionsForDay, layoutSessionBar, localDayKey } from "@/lib/voiceEditorTimeline"
import SessionBlock from "./SessionBlock"

const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

interface DayTimelineRowProps {
  day: Date
  allSessions: VoiceEditorSession[]
  originalSessions: VoiceEditorSession[]
  pendingIds: Set<number>
  usageBlocked: boolean
  allowDragResize: boolean
  onTrackClick: (day: Date, clientX: number, trackEl: HTMLElement) => void
  onSessionClick: (s: VoiceEditorSession) => void
  onResizeCommit: (sessionId: number, newDurationSec: number) => void
}

export default function DayTimelineRow({
  day,
  allSessions,
  originalSessions,
  pendingIds,
  usageBlocked,
  allowDragResize,
  onTrackClick,
  onSessionClick,
  onResizeCommit,
}: DayTimelineRowProps) {
  const dayKey = localDayKey(day)
  const daySessions = filterSessionsForDay(allSessions, day)
  const label = day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
  const isToday = new Date().toDateString() === day.toDateString()

  const ghostSessions = pendingIds.size > 0
    ? filterSessionsForDay(originalSessions, day).filter((s) => pendingIds.has(s.id))
    : []

  return (
    <div className="flex gap-3 items-stretch min-h-[68px]">
      <div
        className={cn(
          "w-24 flex-shrink-0 pt-3 text-xs font-medium",
          isToday ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        {isToday && <span className="block text-[10px] text-primary/80 font-normal">Today</span>}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="relative h-5 flex text-[9px] text-muted-foreground/70 select-none">
          {TICKS.map((h) => (
            <div
              key={h}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h === 24 ? "" : `${h}`}
            </div>
          ))}
        </div>
        <div
          id={`voice-track-${dayKey}`}
          data-timeline-track
          className="relative h-16 rounded-lg bg-muted/30 border border-border overflow-visible cursor-crosshair"
          onClick={(e) => {
            const t = e.target as HTMLElement
            if (t.closest("[data-session-id]")) return
            onTrackClick(day, e.clientX, e.currentTarget)
          }}
          role="presentation"
        >
          {/* Faint hour grid lines */}
          {[3, 6, 9, 12, 15, 18, 21].map((h) => (
            <div
              key={`grid-${h}`}
              className="absolute top-0 bottom-0 w-px bg-border/30 pointer-events-none"
              style={{ left: `${(h / 24) * 100}%` }}
            />
          ))}

          {/* Ghost blocks at original positions for pending edits */}
          {ghostSessions.map((orig) => {
            const origLayout = layoutSessionBar(orig, day)
            if (!origLayout) return null
            return (
              <div
                key={`ghost-${orig.id}`}
                className="absolute top-2 bottom-2 rounded-md border border-dashed border-muted-foreground/25 bg-muted-foreground/5 pointer-events-none"
                style={{ left: `${origLayout.leftPct}%`, width: `${origLayout.widthPct}%` }}
              />
            )
          })}

          {/* Session blocks */}
          {daySessions.map((s) => {
            const layout = layoutSessionBar(s, day)
            if (!layout) return null
            return (
              <SessionBlock
                key={s.id}
                session={s}
                layout={layout}
                dayKey={dayKey}
                disabled={usageBlocked}
                isPending={pendingIds.has(s.id)}
                allowDragResize={allowDragResize}
                onSelect={() => onSessionClick(s)}
                onResizeCommit={onResizeCommit}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
