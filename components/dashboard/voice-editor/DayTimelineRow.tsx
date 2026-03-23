// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: One day row — 24h track, tick labels, session blocks
// ============================================================
import { cn } from "@/lib/utils"
import type { VoiceEditorSession } from "@/lib/voiceEditorTimeline"
import { filterSessionsForDay, layoutSessionBar, localDayKey } from "@/lib/voiceEditorTimeline"
import SessionBlock from "./SessionBlock"

const TICKS = [0, 6, 12, 18, 24]

interface DayTimelineRowProps {
  day: Date
  allSessions: VoiceEditorSession[]
  usageBlocked: boolean
  allowDragResize: boolean
  overlapIds: Set<number>
  onTrackClick: (day: Date, clientX: number, trackEl: HTMLElement) => void
  onSessionClick: (s: VoiceEditorSession) => void
  onResizeCommit: (sessionId: number, newDurationSec: number) => void
}

export default function DayTimelineRow({
  day,
  allSessions,
  usageBlocked,
  allowDragResize,
  overlapIds,
  onTrackClick,
  onSessionClick,
  onResizeCommit,
}: DayTimelineRowProps) {
  const dayKey = localDayKey(day)
  const daySessions = filterSessionsForDay(allSessions, day)
  const label = day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
  const isToday = new Date().toDateString() === day.toDateString()

  return (
    <div className="flex gap-3 items-stretch min-h-[52px]">
      <div
        className={cn(
          "w-24 flex-shrink-0 pt-2 text-xs font-medium",
          isToday ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        {isToday && <span className="block text-[10px] text-primary/80 font-normal">Today</span>}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="relative h-8 flex text-[10px] text-muted-foreground select-none">
          {TICKS.map((h) => (
            <div
              key={h}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h === 24 ? "24:00" : `${h}:00`}
            </div>
          ))}
        </div>
        <div
          id={`voice-track-${dayKey}`}
          data-timeline-track
          className="relative h-10 rounded-lg bg-muted/40 border border-border overflow-visible cursor-crosshair"
          onClick={(e) => {
            const t = e.target as HTMLElement
            if (t.closest("[data-session-id]")) return
            onTrackClick(day, e.clientX, e.currentTarget)
          }}
          role="presentation"
        >
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
                overlapPreview={overlapIds.has(s.id)}
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
