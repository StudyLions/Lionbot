// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor member page — week timeline, sheet editor, dnd-kit drag/resize
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Pending edits model (save/reset) + visual week timeline + SessionEditSheet
// --- END AI-MODIFIED ---
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, SaveBar, toast, DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Clock, Plus, ChevronDown, Crown, Lock,
  CheckCircle2, Info, Server, Shield,
  Headphones, Camera, Radio,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import VoiceEditorWeekNav from "@/components/dashboard/voice-editor/VoiceEditorWeekNav"
import DayTimelineRow from "@/components/dashboard/voice-editor/DayTimelineRow"
import SessionEditSheet from "@/components/dashboard/voice-editor/SessionEditSheet"
// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Use shared Skeleton primitive for loading states
import { Skeleton } from "@/components/ui/skeleton"
// --- END AI-MODIFIED ---
import type { VoiceEditorSession } from "@/lib/voiceEditorTimeline"
import type { PendingEdit } from "@/lib/voiceEditorTimeline"
import {
  startOfWeekMonday,
  weekDaysFromMonday,
  endOfWeekSunday,
  localDayKey,
  deltaPixelsToMinutes,
  snapMinutesToGrid,
  minutesFromMidnightToDate,
  startMinutesFromMidnight,
  overlapsOtherSession,
  applyPendingEdits,
} from "@/lib/voiceEditorTimeline"

interface ServerInfo {
  guildId: string
  guildName: string
  isPremium: boolean
  isEnabled: boolean
  isAdmin: boolean
  monthlyLimit: number
  autoDisableDate: string | null
}

interface UsageInfo {
  used: number
  limit: number
}

interface VoiceEditorResponse {
  servers: ServerInfo[]
  sessions: VoiceEditorSession[] | null
  pagination: { page: number; pageSize: number; total: number; totalPages: number } | null
  usage: UsageInfo | null
  timelineRange?: { start: string; end: string; capped: boolean }
}

function trackClickToTime(day: Date, clientX: number, track: HTMLElement): string {
  const rect = track.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const minutesFromMidnight = x * 24 * 60
  const snapped = Math.round(minutesFromMidnight / 15) * 15
  const capped = Math.min(snapped, 24 * 60 - 15)
  const d = new Date(day)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(capped)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

export default function VoiceEditorPage() {
  const { data: session } = useSession()
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [weekMonday, setWeekMonday] = useState(() => startOfWeekMonday(new Date()))
  const [showServerDropdown, setShowServerDropdown] = useState(false)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add")
  const [sheetInitialDay, setSheetInitialDay] = useState<Date | null>(null)
  const [editingSession, setEditingSession] = useState<VoiceEditorSession | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Pending edits — drag/resize writes here, not to the server
  const [pendingEdits, setPendingEdits] = useState<Map<number, PendingEdit>>(() => new Map())
  const [saving, setSaving] = useState(false)
  // --- END AI-MODIFIED ---

  const timelineStart = useMemo(() => startOfWeekMonday(weekMonday), [weekMonday])
  const timelineEnd = useMemo(() => endOfWeekSunday(timelineStart), [timelineStart])
  const weekDays = useMemo(() => weekDaysFromMonday(timelineStart), [timelineStart])

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (selectedGuild) {
      p.set("guild", selectedGuild)
      p.set("timelineStart", timelineStart.toISOString())
      p.set("timelineEnd", timelineEnd.toISOString())
    }
    return p.toString()
  }, [selectedGuild, timelineStart, timelineEnd])

  const { data, isLoading, mutate } = useDashboard<VoiceEditorResponse>(
    session ? `/api/dashboard/voice-editor${queryParams ? `?${queryParams}` : ""}` : null
  )

  const servers = data?.servers ?? []
  const sessions = data?.sessions ?? []
  const usage = data?.usage ?? null
  const selectedServer = servers.find((s) => s.guildId === selectedGuild)
  const usageBlocked = !!(usage && usage.used >= usage.limit)

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Effective sessions = server state + local pending edits applied
  const effectiveSessions = useMemo(
    () => applyPendingEdits(sessions, pendingEdits),
    [sessions, pendingEdits]
  )
  const pendingIds = useMemo(() => new Set(pendingEdits.keys()), [pendingEdits])
  const hasChanges = pendingEdits.size > 0
  // --- END AI-MODIFIED ---

  const [allowFinePointer, setAllowFinePointer] = useState(true)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(pointer: fine)")
    setAllowFinePointer(mq.matches)
    const fn = () => setAllowFinePointer(mq.matches)
    mq.addEventListener?.("change", fn)
    return () => mq.removeEventListener?.("change", fn)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  )

  useEffect(() => {
    if (servers.length > 0 && !selectedGuild) {
      const first = servers.find((s) => s.isEnabled) || servers[0]
      setSelectedGuild(first.guildId)
    }
  }, [servers, selectedGuild])

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Ctrl+S to save pending edits
  const handleSaveAll = useCallback(async () => {
    if (pendingEdits.size === 0) return
    setSaving(true)

    const entries = Array.from(pendingEdits.entries())
    const results = await Promise.allSettled(
      entries.map(([sessionId, edit]) => {
        const body: Record<string, any> = {}
        if (edit.newStartTime) body.startTime = edit.newStartTime
        if (edit.newDuration != null) body.duration = edit.newDuration
        return dashboardMutate("PATCH", `/api/dashboard/voice-editor/sessions/${sessionId}`, body)
      })
    )

    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    if (failed > 0) toast.error(`${failed} edit(s) failed`)
    if (succeeded > 0) toast.success(`${succeeded} edit(s) saved`)

    const successIndices = entries
      .map(([id], i) => (results[i].status === "fulfilled" ? id : null))
      .filter((id): id is number => id !== null)
    setPendingEdits((prev) => {
      const next = new Map(prev)
      successIndices.forEach((id) => next.delete(id))
      return next
    })

    mutate()
    setSaving(false)
  }, [pendingEdits, mutate])

  const handleResetAll = useCallback(() => {
    setPendingEdits(new Map())
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (pendingEdits.size > 0) handleSaveAll()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [pendingEdits.size, handleSaveAll])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pendingEdits.size > 0) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [pendingEdits.size])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: Drag/resize write to pendingEdits instead of calling PATCH immediately
  const resolveSessionDrag = useCallback(
    (event: Pick<DragEndEvent, "active" | "delta">) => {
      const idStr = String(event.active.id)
      if (!idStr.startsWith("session-")) return null
      const id = parseInt(idStr.replace("session-", ""), 10)
      const s = effectiveSessions.find((x) => x.id === id)
      if (!s || usageBlocked) return null

      const dayKey = localDayKey(new Date(s.startTime))
      const track = document.getElementById(`voice-track-${dayKey}`)
      const w = track?.offsetWidth ?? 1
      const deltaMin = deltaPixelsToMinutes(event.delta.x, w)
      let newMin = startMinutesFromMidnight(s.startTime) + deltaMin
      newMin = snapMinutesToGrid(newMin)
      const maxStartMin = 24 * 60 - s.duration / 60
      newMin = Math.max(0, Math.min(maxStartMin, newMin))

      const day = new Date(s.startTime)
      const newStart = minutesFromMidnightToDate(day, newMin)
      return { id, s, newStart, newStartMs: newStart.getTime() }
    },
    [effectiveSessions, usageBlocked]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const resolved = resolveSessionDrag(event)
      if (!resolved) return
      const { id, s, newStart } = resolved
      const newEndMs = newStart.getTime() + s.duration * 1000

      if (newEndMs > Date.now()) {
        toast.error("Session cannot end in the future")
        return
      }
      if (overlapsOtherSession(effectiveSessions, id, newStart.getTime(), s.duration)) {
        toast.error("Overlaps another session")
        return
      }

      setPendingEdits((prev) => {
        const next = new Map(prev)
        const existing = next.get(id) || {}
        next.set(id, { ...existing, newStartTime: newStart.toISOString() })
        return next
      })
    },
    [effectiveSessions, resolveSessionDrag]
  )

  const handleResizeCommit = useCallback(
    (sessionId: number, newDurationSec: number) => {
      const s = effectiveSessions.find((x) => x.id === sessionId)
      if (!s || usageBlocked) return
      const start = new Date(s.startTime)
      const newEndMs = start.getTime() + newDurationSec * 1000
      if (newEndMs > Date.now()) {
        toast.error("Session cannot end in the future")
        return
      }
      if (overlapsOtherSession(effectiveSessions, sessionId, start.getTime(), newDurationSec)) {
        toast.error("Overlaps another session")
        return
      }

      setPendingEdits((prev) => {
        const next = new Map(prev)
        const existing = next.get(sessionId) || {}
        next.set(sessionId, { ...existing, newDuration: newDurationSec })
        return next
      })
    },
    [effectiveSessions, usageBlocked]
  )
  // --- END AI-MODIFIED ---

  const openAdd = (day: Date) => {
    setPendingAddTime(null)
    setSheetMode("add")
    setSheetInitialDay(day)
    setEditingSession(null)
    setSheetOpen(true)
  }

  const openEdit = (s: VoiceEditorSession) => {
    setPendingAddTime(null)
    setSheetMode("edit")
    setEditingSession(s)
    setSheetInitialDay(null)
    setSheetOpen(true)
  }

  const [pendingAddTime, setPendingAddTime] = useState<string | null>(null)

  const onTrackClick = (day: Date, clientX: number, track: HTMLElement) => {
    if (usageBlocked) {
      toast.error("Monthly edit limit reached")
      return
    }
    const t = trackClickToTime(day, clientX, track)
    setSheetMode("add")
    setSheetInitialDay(day)
    setEditingSession(null)
    setPendingAddTime(t)
    setSheetOpen(true)
  }

  const handleDelete = async (sessionId: number) => {
    try {
      await dashboardMutate("DELETE", `/api/dashboard/voice-editor/sessions/${sessionId}`)
      toast.success("Session deleted")
      setDeletingId(null)
      setSheetOpen(false)
      // Clear any pending edit for the deleted session
      setPendingEdits((prev) => {
        if (!prev.has(sessionId)) return prev
        const next = new Map(prev)
        next.delete(sessionId)
        return next
      })
      mutate()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  // --- AI-MODIFIED (2026-03-23) ---
  // Purpose: After sheet save, clear that session's pending edit (sheet already committed it)
  const handleSheetSuccess = useCallback(() => {
    if (editingSession) {
      setPendingEdits((prev) => {
        if (!prev.has(editingSession.id)) return prev
        const next = new Map(prev)
        next.delete(editingSession.id)
        return next
      })
    }
    mutate()
  }, [editingSession, mutate])
  // --- END AI-MODIFIED ---

  // Discard pending edits when switching week or server
  const changeWeek = useCallback(
    (d: Date) => {
      if (pendingEdits.size > 0) {
        setPendingEdits(new Map())
        toast("Unsaved changes discarded")
      }
      setWeekMonday(d)
    },
    [pendingEdits.size]
  )

  const changeServer = useCallback(
    (guildId: string) => {
      if (pendingEdits.size > 0) {
        setPendingEdits(new Map())
        toast("Unsaved changes discarded")
      }
      setSelectedGuild(guildId)
      setShowServerDropdown(false)
    },
    [pendingEdits.size]
  )

  const renderServerStatus = () => {
    if (!selectedServer) return null
    if (!selectedServer.isPremium) {
      return (
        <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Crown size={24} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-1">
            Voice Time Editor requires a Server Premium subscription.
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Ask a server admin to upgrade from the server settings page.
          </p>
        </div>
      )
    }
    if (!selectedServer.isEnabled) {
      return (
        <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Lock size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Not Enabled</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-1">
            Voice Time Editor is not enabled on this server.
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            A server admin can turn it on from the server settings.
          </p>
        </div>
      )
    }
    return null
  }

  const saveLabel = `${pendingEdits.size} unsaved edit${pendingEdits.size !== 1 ? "s" : ""} — press Save to apply`

  return (
    <Layout SEO={{ title: "Voice Time Editor - LionBot Dashboard", description: "Add and edit your study sessions" }}>
      <AdminGuard>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0 max-w-4xl space-y-5"> */}
        <DashboardShell nav={<DashboardNav />} className="space-y-5">
              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated to shared PageHeader component for consistency */}
              {/* What the new code does better: Consistent page header styling with breadcrumbs */}
              {/* --- Original code (commented out for rollback) --- */}
              {/* <div>
                <h1 className="text-2xl font-bold text-foreground">Voice Time Editor</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Drag blocks to shift time, drag the right edge to resize. Changes are staged locally until you save.
                </p>
              </div> */}
              {/* --- End original code --- */}
              <PageHeader
                title="Voice Time Editor"
                description="Drag blocks to shift time, drag the right edge to resize. Changes are staged locally until you save."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Voice Time Editor" },
                ]}
              />
              {/* --- END AI-REPLACED --- */}

              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  Changes affect stats only (not coins, XP, or LionGotchi).{" "}
                  {!allowFinePointer && "On touch devices, use the form — drag works best with a mouse."}
                </p>
              </div>

              {isLoading && !servers.length ? (
                // --- AI-MODIFIED (2026-04-25) ---
                <Skeleton className="h-12 rounded-lg" />
                // --- END AI-MODIFIED ---
              ) : servers.length === 0 ? (
                <EmptyState
                  icon={<Server size={24} />}
                  title="No servers found"
                  description="Join a server with LionBot to start tracking your study time."
                />
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowServerDropdown(!showServerDropdown)}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Server size={16} className="text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedServer?.guildName ?? "Select a server"}
                        </p>
                        {selectedServer && (
                          <p className="text-[10px] text-muted-foreground">
                            {selectedServer.isEnabled ? (
                              <span className="text-emerald-400">Enabled</span>
                            ) : selectedServer.isPremium ? (
                              <span className="text-muted-foreground">Disabled by admin</span>
                            ) : (
                              <span className="text-amber-400">Premium required</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", showServerDropdown && "rotate-180")} />
                  </button>
                  {showServerDropdown && (
                    <div className="absolute z-30 mt-1 w-full bg-card border border-border rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
                      {servers.map((s) => (
                        <button
                          key={s.guildId}
                          type="button"
                          onClick={() => changeServer(s.guildId)}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between gap-2",
                            selectedGuild === s.guildId && "bg-primary/10"
                          )}
                        >
                          <span className="truncate">{s.guildName}</span>
                          <span className="flex-shrink-0">
                            {s.isEnabled ? (
                              <CheckCircle2 size={12} className="text-emerald-400" />
                            ) : s.isPremium ? (
                              <Lock size={12} className="text-muted-foreground" />
                            ) : (
                              <Crown size={12} className="text-amber-400" />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedServer && !selectedServer.isEnabled && renderServerStatus()}

              {selectedServer?.isEnabled && usage && (
                <>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Shield size={12} />
                        <span>
                          <span className={cn("font-medium", usage.used >= usage.limit ? "text-destructive" : "text-foreground")}>
                            {usage.used}
                          </span>
                          /{usage.limit} edits this month
                        </span>
                      </div>
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", usage.used >= usage.limit ? "bg-destructive" : "bg-primary")}
                          style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAdd(new Date())}
                      disabled={usage.used >= usage.limit}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        usage.used >= usage.limit
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Plus size={14} />
                      Add session
                    </button>
                  </div>

                  <VoiceEditorWeekNav weekMonday={timelineStart} onWeekMondayChange={changeWeek} />

                  {/* Color legend */}
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500/70" /><Headphones size={10} /> Voice</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/70" /><Camera size={10} /> Camera</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-500/70" /><Radio size={10} /> Stream</span>
                    {hasChanges && (
                      <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm border border-dashed border-amber-400/70 bg-amber-400/10" /> Unsaved</span>
                    )}
                  </div>

                  {data?.timelineRange?.capped && (
                    <p className="text-[10px] text-amber-400/90">Showing up to 200 sessions this week — some may be hidden.</p>
                  )}

                  {isLoading ? (
                    // --- AI-MODIFIED (2026-04-25) ---
                    // Purpose: Shared Skeleton primitive for week loading state
                    <div className="space-y-3 mt-4" aria-busy="true" aria-live="polite" aria-label="Loading sessions">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                    // --- END AI-MODIFIED ---
                  ) : (
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                      <div className="mt-2 space-y-2 rounded-xl border border-border bg-card/30 p-3 sm:p-4">
                        {weekDays.map((day) => (
                          <DayTimelineRow
                            key={localDayKey(day)}
                            day={day}
                            allSessions={effectiveSessions}
                            originalSessions={sessions}
                            pendingIds={pendingIds}
                            usageBlocked={usageBlocked}
                            allowDragResize={allowFinePointer && !usageBlocked}
                            onTrackClick={onTrackClick}
                            onSessionClick={openEdit}
                            onResizeCommit={handleResizeCommit}
                          />
                        ))}
                      </div>
                    </DndContext>
                  )}

                  {effectiveSessions.length === 0 && !isLoading && (
                    <EmptyState
                      icon={<Clock size={24} />}
                      title="No sessions this week"
                      description="Click empty space on a day or use Add session."
                    />
                  )}
                </>
              )}

              {deletingId !== null && (
                <div
                  className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50"
                  onClick={() => setDeletingId(null)}
                >
                  <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Delete session?</h3>
                    <p className="text-sm text-muted-foreground mb-5">This removes this manual session from your stats.</p>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(deletingId)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedServer && usage && sheetOpen && (
                <SessionEditSheet
                  key={`${sheetMode}-${editingSession?.id ?? "new"}-${pendingAddTime ?? ""}`}
                  open={sheetOpen}
                  mode={sheetMode}
                  onClose={() => {
                    setSheetOpen(false)
                    setPendingAddTime(null)
                  }}
                  guildId={selectedGuild}
                  guildName={selectedServer.guildName}
                  usage={usage}
                  initialDay={sheetInitialDay}
                  initialTimeHint={pendingAddTime}
                  weekSessions={effectiveSessions}
                  editingSession={editingSession}
                  emphasizeId={editingSession?.id}
                  onSuccess={handleSheetSuccess}
                  onDeleteRequest={(id) => setDeletingId(id)}
                />
              )}

              <SaveBar
                show={hasChanges}
                onSave={handleSaveAll}
                onReset={handleResetAll}
                saving={saving}
                label={saveLabel}
              />
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
