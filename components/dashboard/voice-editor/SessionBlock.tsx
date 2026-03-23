// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Draggable session bar on timeline + resize handle; uses @dnd-kit
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Pending edit visual (dashed border + glow), time labels, richer tooltip
// --- END AI-MODIFIED ---
// ============================================================
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { BarLayout, VoiceEditorSession } from "@/lib/voiceEditorTimeline"
import { sessionType, VIEW_RANGE_MIN, formatTimeShort, formatDuration, sessionEndISO } from "@/lib/voiceEditorTimeline"
import { Camera, Headphones, Radio } from "lucide-react"

const TYPE_STYLES = {
  voice: { bg: "bg-blue-500/70", border: "border-blue-400/50", label: "Voice", icon: Headphones },
  camera: { bg: "bg-emerald-500/70", border: "border-emerald-400/50", label: "Camera", icon: Camera },
  stream: { bg: "bg-purple-500/70", border: "border-purple-400/50", label: "Stream", icon: Radio },
}

interface SessionBlockProps {
  session: VoiceEditorSession
  layout: BarLayout
  dayKey: string
  disabled?: boolean
  isPending?: boolean
  allowDragResize?: boolean
  onSelect?: () => void
  onResizeCommit?: (sessionId: number, newDurationSec: number) => void
}

export default function SessionBlock({
  session,
  layout,
  dayKey,
  disabled,
  isPending,
  allowDragResize = true,
  onSelect,
  onResizeCommit,
}: SessionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `session-${session.id}`,
    data: { session, dayKey },
    disabled: disabled || !allowDragResize,
  })

  const style: React.CSSProperties = {
    left: `${layout.leftPct}%`,
    width: `${layout.widthPct}%`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 20 : 10,
  }

  const st = sessionType(session)
  const TS = TYPE_STYLES[st]
  const Icon = TS.icon

  const startLabel = formatTimeShort(session.startTime)
  const endLabel = formatTimeShort(sessionEndISO(session))
  const durLabel = formatDuration(session.duration)
  const showStartLabel = layout.widthPct > 8
  const showRange = layout.widthPct > 18

  const pendingDurRef = useRef(session.duration)

  const onResizePointerDown = (e: React.PointerEvent) => {
    if (disabled || !allowDragResize || !onResizeCommit) return
    e.stopPropagation()
    e.preventDefault()
    const track = (e.target as HTMLElement).closest("[data-timeline-track]") as HTMLElement | null
    const trackW = track?.offsetWidth ?? 1
    const startX = e.clientX
    const startDur = session.duration
    const sid = session.id
    pendingDurRef.current = startDur

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const deltaMin = (dx / trackW) * VIEW_RANGE_MIN
      const deltaSec = Math.round(deltaMin * 60)
      const raw = startDur + deltaSec
      const snapped = Math.round(raw / (15 * 60)) * (15 * 60)
      pendingDurRef.current = Math.max(300, Math.min(43200, snapped))
    }

    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      onResizeCommit(sid, pendingDurRef.current)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute top-1.5 bottom-1.5 min-w-[6px] rounded-md border flex items-stretch overflow-visible group/bar",
        TS.bg, TS.border,
        isPending && "border-dashed border-amber-400/70 ring-1 ring-amber-400/30",
        disabled && "opacity-40 cursor-not-allowed",
        isDragging && "opacity-90 shadow-lg"
      )}
      data-session-id={session.id}
    >
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity duration-150 z-30">
        <div className="bg-popover border border-border rounded-md px-2.5 py-1.5 text-[11px] whitespace-nowrap shadow-lg">
          <div className="font-medium text-foreground">{startLabel} – {endLabel}</div>
          <div className="text-muted-foreground">
            {durLabel} · {TS.label}
            {session.isManual ? " · Manual" : ""}
            {isPending ? " · Unsaved" : ""}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "flex-1 min-w-0 flex items-center gap-1 px-1.5 text-white/95 overflow-hidden",
          !disabled && allowDragResize && "cursor-grab active:cursor-grabbing touch-none"
        )}
        {...(disabled || !allowDragResize ? {} : listeners)}
        {...(disabled || !allowDragResize ? {} : attributes)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
      >
        <Icon size={12} className="flex-shrink-0 opacity-90" />
        {session.isManual && (
          <span className="text-[9px] font-bold uppercase tracking-tight opacity-80 flex-shrink-0">M</span>
        )}
        {showStartLabel && (
          <span className="text-[10px] font-medium tabular-nums truncate opacity-90">
            {showRange ? `${startLabel}–${endLabel}` : startLabel}
          </span>
        )}
      </button>
      {!disabled && allowDragResize && onResizeCommit && (
        <div
          role="slider"
          aria-label="Resize duration"
          className="w-2 flex-shrink-0 cursor-ew-resize bg-white/20 hover:bg-white/40 border-l border-white/20 touch-none"
          onPointerDown={onResizePointerDown}
        />
      )}
    </div>
  )
}
