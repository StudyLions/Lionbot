// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor member page — week timeline, sheet editor, dnd-kit drag/resize
// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Visual week timeline + SessionEditSheet + date-range API
// --- END AI-MODIFIED ---
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, toast } from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Clock, Plus, ChevronDown, Crown, Lock,
  CheckCircle2, Info, Server, Shield,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import VoiceEditorWeekNav from "@/components/dashboard/voice-editor/VoiceEditorWeekNav"
import DayTimelineRow from "@/components/dashboard/voice-editor/DayTimelineRow"
import SessionEditSheet from "@/components/dashboard/voice-editor/SessionEditSheet"
import type { VoiceEditorSession } from "@/lib/voiceEditorTimeline"
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
  overlapPreviewIdsForMove,
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

  const [overlapPreviewIds, setOverlapPreviewIds] = useState(() => new Set<number>())

  useEffect(() => {
    if (servers.length > 0 && !selectedGuild) {
      const first = servers.find((s) => s.isEnabled) || servers[0]
      setSelectedGuild(first.guildId)
    }
  }, [servers, selectedGuild])

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  /** Shared math for drag move preview + drag end commit */
  const resolveSessionDrag = useCallback(
    (event: Pick<DragEndEvent, "active" | "delta">) => {
      const idStr = String(event.active.id)
      if (!idStr.startsWith("session-")) return null
      const id = parseInt(idStr.replace("session-", ""), 10)
      const s = sessions.find((x) => x.id === id)
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
    [sessions, usageBlocked]
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const resolved = resolveSessionDrag(event)
      if (!resolved) {
        setOverlapPreviewIds(new Set())
        return
      }
      const { id, s, newStartMs } = resolved
      if (newStartMs + s.duration * 1000 > Date.now()) {
        setOverlapPreviewIds(new Set([id]))
        return
      }
      setOverlapPreviewIds(overlapPreviewIdsForMove(sessions, id, newStartMs, s.duration))
    },
    [resolveSessionDrag, sessions]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setOverlapPreviewIds(new Set())
      const resolved = resolveSessionDrag(event)
      if (!resolved) return
      const { id, s, newStart } = resolved
      const newEndMs = newStart.getTime() + s.duration * 1000

      if (newEndMs > Date.now()) {
        toast.error("Session cannot end in the future")
        return
      }

      if (overlapsOtherSession(sessions, id, newStart.getTime(), s.duration)) {
        toast.error("Overlaps another session in this server")
        return
      }

      try {
        await dashboardMutate("PATCH", `/api/dashboard/voice-editor/sessions/${id}`, {
          startTime: newStart.toISOString(),
          duration: s.duration,
        })
        toast.success("Session moved")
        mutate()
      } catch (err: any) {
        toast.error(err?.message || "Could not move session")
      }
    },
    [sessions, resolveSessionDrag, mutate]
  )

  const handleResizeCommit = useCallback(
    async (sessionId: number, newDurationSec: number) => {
      const s = sessions.find((x) => x.id === sessionId)
      if (!s || usageBlocked) return
      const start = new Date(s.startTime)
      const newEndMs = start.getTime() + newDurationSec * 1000
      if (newEndMs > Date.now()) {
        toast.error("Session cannot end in the future")
        return
      }
      if (overlapsOtherSession(sessions, sessionId, start.getTime(), newDurationSec)) {
        toast.error("Overlaps another session")
        return
      }
      try {
        await dashboardMutate("PATCH", `/api/dashboard/voice-editor/sessions/${sessionId}`, {
          duration: newDurationSec,
        })
        toast.success("Duration updated")
        mutate()
      } catch (err: any) {
        toast.error(err?.message || "Could not resize")
      }
    },
    [sessions, usageBlocked, mutate]
  )

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
      mutate()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

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

  return (
    <Layout SEO={{ title: "Voice Time Editor - LionBot Dashboard", description: "Add and edit your study sessions" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-4xl space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Voice Time Editor</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Week view: drag blocks to shift time, drag the right edge to change length. Click a block to edit, or click empty space to add.
                </p>
              </div>

              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  Changes affect stats only (not coins, XP, or LionGotchi).{" "}
                  {!allowFinePointer && "On touch devices, use the form — drag is best with a mouse."}
                </p>
              </div>

              {isLoading && !servers.length ? (
                <div className="h-12 bg-card/50 rounded-lg animate-pulse" />
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
                          onClick={() => {
                            setSelectedGuild(s.guildId)
                            setShowServerDropdown(false)
                          }}
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

                  <VoiceEditorWeekNav weekMonday={timelineStart} onWeekMondayChange={setWeekMonday} />

                  {data?.timelineRange?.capped && (
                    <p className="text-[10px] text-amber-400/90">Showing up to 200 sessions this week — some may be hidden.</p>
                  )}

                  {isLoading ? (
                    <div className="space-y-3 mt-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-14 bg-card/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragCancel={() => setOverlapPreviewIds(new Set())}>
                      <div className="mt-4 space-y-3 rounded-xl border border-border bg-card/30 p-3 sm:p-4">
                        {weekDays.map((day) => (
                          <DayTimelineRow
                            key={localDayKey(day)}
                            day={day}
                            allSessions={sessions}
                            usageBlocked={usageBlocked}
                            allowDragResize={allowFinePointer && !usageBlocked}
                            overlapIds={overlapPreviewIds}
                            onTrackClick={onTrackClick}
                            onSessionClick={openEdit}
                            onResizeCommit={handleResizeCommit}
                          />
                        ))}
                      </div>
                    </DndContext>
                  )}

                  {sessions.length === 0 && !isLoading && (
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
                  weekSessions={sessions}
                  editingSession={editingSession}
                  emphasizeId={editingSession?.id}
                  onSuccess={handleRefresh}
                  onDeleteRequest={(id) => setDeletingId(id)}
                />
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? "en", ["common"])) },
})
