// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor member page - browse servers, add/edit/delete sessions
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
  Clock, Pencil, Trash2, Plus, ChevronDown, Crown, Lock,
  AlertTriangle, Calendar, CheckCircle2, Info, X, Server,
  Headphones, Camera, Radio, Shield,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface ServerInfo {
  guildId: string
  guildName: string
  isPremium: boolean
  isEnabled: boolean
  isAdmin: boolean
  monthlyLimit: number
  autoDisableDate: string | null
}

interface SessionItem {
  id: number
  startTime: string
  duration: number
  durationMinutes: number
  liveDurationMinutes: number
  streamDurationMinutes: number
  videoDurationMinutes: number
  tag: string | null
  rating: number | null
  isManual: boolean
}

interface UsageInfo {
  used: number
  limit: number
}

interface VoiceEditorResponse {
  servers: ServerInfo[]
  sessions: SessionItem[] | null
  pagination: { page: number; pageSize: number; total: number; totalPages: number } | null
  usage: UsageInfo | null
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function getSessionType(s: SessionItem): "camera" | "stream" | "voice" {
  if (s.videoDurationMinutes > 0) return "camera"
  if (s.streamDurationMinutes > 0) return "stream"
  return "voice"
}

const TYPE_ICONS = {
  voice: { icon: Headphones, label: "Voice", color: "text-blue-400" },
  camera: { icon: Camera, label: "Camera", color: "text-emerald-400" },
  stream: { icon: Radio, label: "Stream", color: "text-purple-400" },
}

function AddSessionModal({ guildId, guildName, usage, onClose, onSuccess }: {
  guildId: string
  guildName: string
  usage: UsageInfo
  onClose: () => void
  onSuccess: () => void
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  const totalMinutes = hours * 60 + minutes
  const isValid = date && time && totalMinutes >= 5 && totalMinutes <= 720

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setError("")
    setSubmitting(true)

    const startTime = new Date(`${date}T${time}:00`).toISOString()
    const duration = totalMinutes * 60

    try {
      const resp = await dashboardMutate("POST", "/api/dashboard/voice-editor/sessions", {
        guildId,
        startTime,
        duration,
        reason: reason.trim() || undefined,
      })
      if (resp.error) {
        setError(resp.error)
      } else {
        toast.success("Session added successfully")
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add session")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">Add Study Session</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <Server size={12} />
          <span>{guildName}</span>
          <span className="ml-auto text-primary font-medium">{usage.used}/{usage.limit} edits used</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={thirtyDaysAgo}
                max={today}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
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
                  onChange={e => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">min</span>
              </div>
            </div>
            {totalMinutes > 0 && totalMinutes < 5 && (
              <p className="text-[10px] text-destructive mt-1">Minimum 5 minutes</p>
            )}
            {totalMinutes > 720 && (
              <p className="text-[10px] text-destructive mt-1">Maximum 12 hours</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Bot was offline, studied at library..."
              maxLength={500}
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle size={12} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
              isValid && !submitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {submitting ? "Adding..." : "Add Session"}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditSessionModal({ session, guildId, guildName, usage, onClose, onSuccess }: {
  session: SessionItem
  guildId: string
  guildName: string
  usage: UsageInfo
  onClose: () => void
  onSuccess: () => void
}) {
  const startDate = new Date(session.startTime)
  const [date, setDate] = useState(startDate.toISOString().slice(0, 10))
  const [time, setTime] = useState(startDate.toTimeString().slice(0, 5))
  const [hours, setHours] = useState(Math.floor(session.duration / 3600))
  const [minutes, setMinutes] = useState(Math.floor((session.duration % 3600) / 60))
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  const totalMinutes = hours * 60 + minutes
  const isValid = date && time && totalMinutes >= 5 && totalMinutes <= 720

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setError("")
    setSubmitting(true)

    const startTime = new Date(`${date}T${time}:00`).toISOString()
    const duration = totalMinutes * 60

    try {
      const resp = await dashboardMutate("PATCH", `/api/dashboard/voice-editor/sessions/${session.id}`, {
        startTime,
        duration,
        reason: reason.trim() || undefined,
      })
      if (resp.error) {
        setError(resp.error)
      } else {
        toast.success("Session updated")
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update session")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">Edit Session</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <Server size={12} />
          <span>{guildName}</span>
          {session.isManual && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium">Manual</span>
          )}
          <span className="ml-auto text-primary font-medium">{usage.used}/{usage.limit} edits used</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={thirtyDaysAgo}
                max={today}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
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
                  onChange={e => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">min</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why are you editing this session?"
              maxLength={500}
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle size={12} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
              isValid && !submitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VoiceEditorPage() {
  const { data: session } = useSession()
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showServerDropdown, setShowServerDropdown] = useState(false)

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    if (selectedGuild) {
      p.set("guild", selectedGuild)
      p.set("page", String(page))
      p.set("pageSize", "20")
    }
    return p.toString()
  }, [selectedGuild, page])

  const { data, isLoading, mutate } = useDashboard<VoiceEditorResponse>(
    session ? `/api/dashboard/voice-editor${queryParams ? `?${queryParams}` : ""}` : null
  )

  const servers = data?.servers ?? []
  const sessions = data?.sessions ?? null
  const pagination = data?.pagination ?? null
  const usage = data?.usage ?? null
  const selectedServer = servers.find(s => s.guildId === selectedGuild)

  useEffect(() => {
    if (servers.length > 0 && !selectedGuild) {
      const first = servers.find(s => s.isEnabled) || servers[0]
      setSelectedGuild(first.guildId)
    }
  }, [servers, selectedGuild])

  useEffect(() => { setPage(1) }, [selectedGuild])

  const handleRefresh = useCallback(() => { mutate() }, [mutate])

  const handleDelete = async (sessionId: number) => {
    try {
      const resp = await dashboardMutate("DELETE", `/api/dashboard/voice-editor/sessions/${sessionId}`)
      if (resp.error) {
        toast.error(resp.error)
      } else {
        toast.success("Session deleted")
        setDeletingId(null)
        mutate()
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete session")
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
                  Add missed study sessions or edit existing ones. Changes affect stats only &mdash; not coins, XP, or LionGotchi.
                </p>
              </div>

              {/* Info callout */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  Sessions you add or edit here count toward your study stats, leaderboard position, and streaks.
                  They do <strong>not</strong> earn coins, XP, or affect your LionGotchi.
                </p>
              </div>

              {/* Server Selector */}
              {isLoading ? (
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
                      {servers.map(s => (
                        <button
                          key={s.guildId}
                          onClick={() => { setSelectedGuild(s.guildId); setShowServerDropdown(false) }}
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

              {/* Server status messages (not premium / not enabled) */}
              {selectedServer && !selectedServer.isEnabled && renderServerStatus()}

              {/* Session editor (when enabled) */}
              {selectedServer?.isEnabled && (
                <>
                  {/* Usage bar + Add button */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {usage && (
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
                            className={cn(
                              "h-full rounded-full transition-all",
                              usage.used >= usage.limit ? "bg-destructive" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setShowAddModal(true)}
                      disabled={usage ? usage.used >= usage.limit : false}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        usage && usage.used >= usage.limit
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Plus size={14} />
                      Add Session
                    </button>
                  </div>

                  {/* Session List */}
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-card/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : sessions && sessions.length > 0 ? (
                    <div className="space-y-1.5">
                      {sessions.map(s => {
                        const sType = getSessionType(s)
                        const TypeIcon = TYPE_ICONS[sType].icon
                        return (
                          <div
                            key={s.id}
                            className="group flex items-center gap-3 bg-card/50 border border-border rounded-lg px-4 py-3 hover:border-border/80 transition-colors"
                          >
                            <div className={cn("flex-shrink-0", TYPE_ICONS[sType].color)}>
                              <TypeIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">
                                  {formatDuration(s.durationMinutes)}
                                </span>
                                {s.isManual && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                                    Manual
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(s.startTime)} at {formatTime(s.startTime)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingSession(s)}
                                disabled={usage ? usage.used >= usage.limit : false}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30"
                                title="Edit session"
                              >
                                <Pencil size={14} />
                              </button>
                              {s.isManual && (
                                <button
                                  onClick={() => setDeletingId(s.id)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Delete session"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* Pagination */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-3">
                          <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-muted-foreground">
                            Page {page} of {pagination.totalPages}
                          </span>
                          <button
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page >= pagination.totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : sessions && sessions.length === 0 ? (
                    <EmptyState
                      icon={<Clock size={24} />}
                      title="No sessions yet"
                      description="You don't have any study sessions in this server. Add one above!"
                    />
                  ) : null}
                </>
              )}

              {/* Delete confirmation */}
              {deletingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeletingId(null)}>
                  <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Delete Session?</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      This will permanently remove this manually-added session from your stats.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(deletingId)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit modals */}
              {showAddModal && selectedServer && usage && (
                <AddSessionModal
                  guildId={selectedGuild}
                  guildName={selectedServer.guildName}
                  usage={usage}
                  onClose={() => setShowAddModal(false)}
                  onSuccess={handleRefresh}
                />
              )}
              {editingSession && selectedServer && usage && (
                <EditSessionModal
                  session={editingSession}
                  guildId={selectedGuild}
                  guildName={selectedServer.guildName}
                  usage={usage}
                  onClose={() => setEditingSession(null)}
                  onSuccess={handleRefresh}
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
