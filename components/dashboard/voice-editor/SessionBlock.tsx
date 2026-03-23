// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Draggable session bar on timeline + resize handle; uses @dnd-kit
// ============================================================
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { BarLayout, VoiceEditorSession } from "@/lib/voiceEditorTimeline"
import { sessionType, VIEW_RANGE_MIN } from "@/lib/voiceEditorTimeline"
import { Camera, Headphones, Radio } from "lucide-react"

const TYPE_STYLES = {
  voice: { bg: "bg-blue-500/70 border-blue-400/50", icon: Headphones },
  camera: { bg: "bg-emerald-500/70 border-emerald-400/50", icon: Camera },
  stream: { bg: "bg-purple-500/70 border-purple-400/50", icon: Radio },
}

interface SessionBlockProps {
  session: VoiceEditorSession
  layout: BarLayout
  dayKey: string
  disabled?: boolean
  overlapPreview?: boolean
  allowDragResize?: boolean
  /** Opens edit sheet when user clicks without dragging (use PointerSensor distance on DndContext) */
  onSelect?: () => void
  onResizeCommit?: (sessionId: number, newDurationSec: number) => void
}

export default function SessionBlock({
  session,
  layout,
  dayKey,
  disabled,
  overlapPreview,
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
        "absolute top-1 bottom-1 min-w-[4px] rounded-md border flex items-stretch overflow-hidden group/bar",
        TS.bg,
        overlapPreview && "ring-2 ring-destructive ring-offset-1 ring-offset-background",
        disabled && "opacity-40 cursor-not-allowed",
        isDragging && "opacity-90 shadow-lg"
      )}
      data-session-id={session.id}
    >
      <button
        type="button"
        className={cn(
          "flex-1 min-w-0 flex items-center justify-center gap-0.5 px-0.5 text-white/95",
          !disabled && allowDragResize && "cursor-grab active:cursor-grabbing touch-none"
        )}
        {...(disabled || !allowDragResize ? {} : listeners)}
        {...(disabled || !allowDragResize ? {} : attributes)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
        title={`${new Date(session.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} · ${Math.round(session.duration / 60)} min`}
      >
        <Icon size={10} className="flex-shrink-0 opacity-90" />
        {session.isManual && (
          <span className="text-[8px] font-bold uppercase tracking-tighter opacity-90">M</span>
        )}
      </button>
      {!disabled && allowDragResize && onResizeCommit && (
        <div
          role="slider"
          aria-label="Resize duration"
          className="w-1.5 flex-shrink-0 cursor-ew-resize bg-white/25 hover:bg-white/40 border-l border-white/20 touch-none"
          onPointerDown={onResizePointerDown}
        />
      )}
    </div>
  )
}
