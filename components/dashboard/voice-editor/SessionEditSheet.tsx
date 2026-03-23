// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Slide-over panel for add/edit Voice Time Editor session
//          with mini day timeline preview
// ============================================================
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  type VoiceEditorSession,
  filterSessionsForDay,
  layoutSessionBar,
  localDayKey,
  sessionType,
} from "@/lib/voiceEditorTimeline"
import { dashboardMutate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import { AlertTriangle, Server, Trash2, X, Camera, Headphones, Radio } from "lucide-react"

const TYPE_ICONS = {
  voice: Headphones,
  camera: Camera,
  stream: Radio,
}

export interface UsageInfo {
  used: number
  limit: number
}

interface SessionEditSheetProps {
  open: boolean
  mode: "add" | "edit"
  onClose: () => void
  guildId: string
  guildName: string
  usage: UsageInfo
  /** For add: pre-filled calendar day (local) */
  initialDay: Date | null
  /** For add: pre-filled time HH:mm from timeline click */
  initialTimeHint?: string | null
  /** All sessions in the loaded week (for mini timeline) */
  weekSessions: VoiceEditorSession[]
  /** Session being edited */
  editingSession: VoiceEditorSession | null
  /** Highlight this id on the mini timeline */
  emphasizeId?: number | null
  onSuccess: () => void
  onDeleteRequest?: (sessionId: number) => void
}

export default function SessionEditSheet({
  open,
  mode,
  onClose,
  guildId,
  guildName,
  usage,
  initialDay,
  initialTimeHint,
  weekSessions,
  editingSession,
  emphasizeId,
  onSuccess,
  onDeleteRequest,
}: SessionEditSheetProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const previewDay = useMemo(() => {
    if (date) {
      const [y, m, d] = date.split("-").map(Number)
      return new Date(y, m - 1, d)
    }
    return initialDay ?? new Date()
  }, [date, initialDay])

  const daySessions = useMemo(() => filterSessionsForDay(weekSessions, previewDay), [weekSessions, previewDay])

  useEffect(() => {
    if (!open) return
    setError("")
    const today = new Date().toISOString().slice(0, 10)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    if (mode === "edit" && editingSession) {
      const st = new Date(editingSession.startTime)
      setDate(st.toISOString().slice(0, 10))
      setTime(st.toTimeString().slice(0, 5))
      setHours(Math.floor(editingSession.duration / 3600))
      setMinutes(Math.floor((editingSession.duration % 3600) / 60))
      setReason("")
    } else {
      const base = initialDay ?? new Date()
      const y = base.getFullYear()
      const m = String(base.getMonth() + 1).padStart(2, "0")
      const d = String(base.getDate()).padStart(2, "0")
      setDate(`${y}-${m}-${d}`)
      setTime(initialTimeHint && /^\d{2}:\d{2}$/.test(initialTimeHint) ? initialTimeHint : "12:00")
      setHours(0)
      setMinutes(30)
      setReason("")
    }
  }, [open, mode, editingSession, initialDay, initialTimeHint])

  const totalMinutes = hours * 60 + minutes
  const isValid = date && time && totalMinutes >= 5 && totalMinutes <= 720

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setError("")
    setSubmitting(true)
    const startTime = new Date(`${date}T${time}:00`).toISOString()
    const duration = totalMinutes * 60

    try {
      if (mode === "add") {
        await dashboardMutate("POST", "/api/dashboard/voice-editor/sessions", {
          guildId,
          startTime,
          duration,
          reason: reason.trim() || undefined,
        })
        toast.success("Session added")
      } else if (editingSession) {
        await dashboardMutate("PATCH", `/api/dashboard/voice-editor/sessions/${editingSession.id}`, {
          startTime,
          duration,
          reason: reason.trim() || undefined,
        })
        toast.success("Session updated")
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || "Request failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/50 sm:bg-black/40"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-[70] bg-card border-border shadow-2xl flex flex-col",
          "inset-x-0 bottom-0 top-[20%] rounded-t-xl border-t sm:top-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0"
        )}
        role="dialog"
        aria-labelledby="voice-editor-sheet-title"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <h2 id="voice-editor-sheet-title" className="text-lg font-semibold text-foreground">
            {mode === "add" ? "Add study session" : "Edit session"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <Server size={12} />
            <span>{guildName}</span>
            <span className="ml-auto text-primary font-medium">{usage.used}/{usage.limit} edits</span>
          </div>

          {/* Mini timeline for preview day */}
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
              {previewDay.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <div className="relative h-6 rounded bg-muted/50 border border-border/80 overflow-hidden">
              {daySessions.map((s) => {
                const layout = layoutSessionBar(s, previewDay)
                if (!layout) return null
                const st = sessionType(s)
                const Icon = TYPE_ICONS[st]
                const em = emphasizeId === s.id || editingSession?.id === s.id
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "absolute top-0.5 bottom-0.5 rounded flex items-center justify-center overflow-hidden",
                      st === "voice" && "bg-blue-500/60",
                      st === "camera" && "bg-emerald-500/60",
                      st === "stream" && "bg-purple-500/60",
                      em && "ring-2 ring-primary ring-offset-1 ring-offset-muted/50 z-10"
                    )}
                    style={{ left: `${layout.leftPct}%`, width: `${layout.widthPct}%` }}
                    title={`${new Date(s.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                  >
                    <Icon size={10} className="text-white/90" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={thirtyDaysAgo}
                max={today}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Start time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-xs text-muted-foreground">h</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-xs text-muted-foreground">m</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm"
              placeholder={mode === "add" ? "e.g. Bot offline…" : "Why edit?"}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle size={12} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 space-y-2">
          {mode === "edit" && editingSession?.isManual && onDeleteRequest && (
            <button
              type="button"
              onClick={() => onDeleteRequest(editingSession.id)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-destructive border border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 size={14} />
              Delete session
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || submitting || usage.used >= usage.limit}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium",
                isValid && submitting === false && usage.used < usage.limit
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {submitting ? "Saving…" : mode === "add" ? "Add" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
