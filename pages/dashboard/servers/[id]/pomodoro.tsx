// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Pomodoro Command Center - server analytics,
//          per-timer usage stats, heatmap, leaderboard,
//          and full timer CRUD with live status
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { cn } from "@/lib/utils"
import {
  PageHeader, SectionCard, SettingRow, RoleSelect, NumberInput,
  Toggle, EmptyState, FirstTimeBanner, ConfirmModal, ChannelSelect, toast,
} from "@/components/dashboard/ui"
import MemberDetailPanel from "@/components/dashboard/MemberDetailPanel"
import CountdownRing from "@/components/dashboard/CountdownRing"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useState, useCallback, useEffect, useMemo } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  Timer, Activity, BarChart3, Users, Clock, Award,
  TrendingUp, Zap, Settings, Sparkles, Lock,
} from "lucide-react"
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"

// ---- Types ----

interface PomodoroTimer {
  timerid: string
  guildid: string
  channelid: string
  notification_channelid: string | null
  focus_length: number
  break_length: number
  voice_alerts: boolean
  inactivity_threshold: number | null
  manager_roleid: string | null
  channel_name: string | null
  pretty_name: string | null
  auto_restart: boolean
  last_started: string | null
}

interface PomodoroData {
  timers: PomodoroTimer[]
  pomodoro_channel: string | null
}

interface TimerStatusItem {
  channelid: string
  channelName: string | null
  prettyName: string
  running: boolean
  stage: "focus" | "break" | null
  focusLength: number
  breakLength: number
  stageStartedAt: string | null
  stageEndsAt: string | null
  remainingSeconds: number
  stageDurationSeconds: number
  membersInChannel: number
  autoRestart: boolean
  voiceAlerts: boolean
}

interface PomodoroServerStats {
  summary: {
    totalSessions: number; totalHours: number; uniqueUsers: number
    avgSessionMinutes: number; sessionsThisWeek: number
    hoursThisWeek: number; activeThisWeek: number
  }
  perTimer: Array<{
    channelid: string; prettyName: string; totalSessions: number
    totalHours: number; uniqueUsers: number; hoursThisWeek: number
  }>
  dailyTrend: Array<{ date: string; minutes: number; sessions: number }>
  heatmap: Array<{ dayOfWeek: number; hour: number; count: number }>
  topUsers: Array<{
    userId: string; name: string; avatarUrl: string
    totalHours: number; sessions: number
  }>
}

// ---- Constants ----

// --- AI-MODIFIED (2026-03-19) ---
// Purpose: Add "Premium" as a dedicated third tab so it's easy to find
const TABS = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
  { id: "timers", label: "Timers", icon: <Timer size={14} /> },
  { id: "premium", label: "Premium", icon: <Sparkles size={14} /> },
] as const

type TabId = typeof TABS[number]["id"]
// --- END AI-MODIFIED ---

const PRESETS = [
  { label: "Classic", focus: 25, break: 5, description: "The original Pomodoro technique" },
  { label: "Long Focus", focus: 50, break: 10, description: "Deep work sessions" },
  { label: "Short Sprint", focus: 15, break: 3, description: "Quick study bursts" },
  { label: "Lecture", focus: 45, break: 10, description: "University-style blocks" },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ---- Helpers ----

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z")
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatHours(hours: number): string {
  if (hours >= 1) return `${hours}h`
  return `${Math.round(hours * 60)}m`
}

// ---- Stat Card ----

function StatCard({ label, value, sub, icon, color = "text-primary" }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color?: string
}) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-gray-800 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ---- Usage Heatmap ----

function UsageHeatmap({ data }: { data: Array<{ dayOfWeek: number; hour: number; count: number }> }) {
  const grid = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    let max = 0
    for (const { dayOfWeek, hour, count } of data) {
      matrix[dayOfWeek][hour] = count
      if (count > max) max = count
    }
    return { matrix, max }
  }, [data])

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-800/50"
    const intensity = count / Math.max(grid.max, 1)
    if (intensity > 0.75) return "bg-amber-500"
    if (intensity > 0.5) return "bg-amber-500/70"
    if (intensity > 0.25) return "bg-amber-500/40"
    return "bg-amber-500/20"
  }

  const [tooltip, setTooltip] = useState<{ day: number; hour: number; count: number } | null>(null)

  return (
    <div className="relative">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pr-1 pt-6">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d} className="h-5 flex items-center text-[10px] text-muted-foreground font-medium">
              {DAY_LABELS[d]}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1 mb-1">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="w-5 text-center text-[9px] text-muted-foreground font-medium">{h}</div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d} className="flex gap-1 mb-1">
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className={`w-5 h-5 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/30 ${getColor(grid.matrix[d][h])}`}
                  onMouseEnter={() => setTooltip({ day: d, hour: h, count: grid.matrix[d][h] })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground shadow-lg pointer-events-none whitespace-nowrap z-10">
          {DAY_LABELS[tooltip.day]} {tooltip.hour}:00 &mdash; <span className="font-bold">{tooltip.count}</span> sessions
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        <div className="w-4 h-4 rounded-sm bg-gray-800/50" />
        <div className="w-4 h-4 rounded-sm bg-amber-500/20" />
        <div className="w-4 h-4 rounded-sm bg-amber-500/40" />
        <div className="w-4 h-4 rounded-sm bg-amber-500/70" />
        <div className="w-4 h-4 rounded-sm bg-amber-500" />
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

// ---- Member Avatar ----

function MemberAvatar({ url, name, size = 28 }: { url: string; name: string; size?: number }) {
  return (
    <img
      src={url} alt={name} width={size} height={size}
      className="rounded-full bg-gray-700 flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png" }}
    />
  )
}

// ---- Main Page ----

export default function PomodoroPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const [tab, setTab] = useState<TabId>("overview")
  const [panelUserId, setPanelUserId] = useState<string | null>(null)

  // Data fetching
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"

  const { data, isLoading: loading, mutate } = useDashboard<PomodoroData>(
    id && session ? `/api/dashboard/servers/${id}/pomodoro` : null
  )
  const { data: timerStatus, mutate: mutateTimerStatus } = useDashboard<{ timers: TimerStatusItem[] }>(
    id && session ? `/api/dashboard/servers/${id}/timer-status` : null,
    { refreshInterval: 15000 }
  )
  const { data: stats, isLoading: statsLoading } = useDashboard<PomodoroServerStats>(
    id && session ? `/api/dashboard/servers/${id}/pomodoro-server-stats` : null
  )
  const { data: panelData, isLoading: panelLoading, error: panelError } = useDashboard(
    panelUserId && id ? `/api/dashboard/servers/${id}/members/${panelUserId}` : null
  )

  useEffect(() => {
    if (panelError && panelUserId) {
      toast.error("Could not load member details")
      setPanelUserId(null)
    }
  }, [panelError, panelUserId])

  // Per-timer stats lookup
  const perTimerMap = useMemo(() => {
    const map = new Map<string, PomodoroServerStats["perTimer"][0]>()
    if (stats?.perTimer) {
      for (const pt of stats.perTimer) map.set(pt.channelid, pt)
    }
    return map
  }, [stats])

  // Timer editing state
  const [editingTimers, setEditingTimers] = useState<Record<string, Partial<PomodoroTimer>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [createForm, setCreateForm] = useState({
    channelid: "" as string | null,
    focus_length: 25, break_length: 5, pretty_name: "",
    notification_channelid: null as string | null,
    voice_alerts: true, auto_restart: true,
    inactivity_threshold: "" as string | number,
    manager_roleid: null as string | null, channel_name: "",
  })
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PomodoroTimer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pomodoroChannel, setPomodoroChannel] = useState<string | null>(null)
  // --- AI-MODIFIED (2026-03-18) ---
  // Purpose: Premium pomodoro feature state
  const [premConfig, setPremConfig] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [premLoading, setPremLoading] = useState(true)
  const [savingPrem, setSavingPrem] = useState(false)
  const [themes] = useState(["default", "neon", "forest", "ocean", "sunset", "midnight", "sakura", "retro", "minimal", "seasonal"])
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (data) setPomodoroChannel(data.pomodoro_channel)
  }, [data])

  // --- AI-REPLACED (2026-03-19) ---
  // Reason: When a premium guild has no config row yet, premConfig was null and the settings form
  // rendered nothing. Now we initialize with sensible defaults so the form always appears.
  // --- Original code (commented out for rollback) ---
  // useEffect(() => {
  //   if (!guildId) return
  //   fetch(`/api/dashboard/servers/${guildId}/premium-pomodoro`)
  //     .then(r => r.json())
  //     .then(data => {
  //       setPremConfig(data.config)
  //       setIsPremium(data.isPremium)
  //       setPremLoading(false)
  //     })
  //     .catch(() => setPremLoading(false))
  // }, [guildId])
  // --- End original code ---
  useEffect(() => {
    if (!guildId) return
    fetch(`/api/dashboard/servers/${guildId}/premium-pomodoro`)
      .then(r => r.json())
      .then(data => {
        const defaults = {
          animated_timer: false,
          timer_theme: "default",
          focus_roleid: null,
          session_summary: true,
          coin_multiplier: true,
          group_goal_hours: null,
          golden_hour_start: null,
          golden_hour_end: null,
        }
        setPremConfig(data.config ?? (data.isPremium ? defaults : null))
        setIsPremium(data.isPremium)
        setPremLoading(false)
      })
      .catch(() => setPremLoading(false))
  }, [guildId])
  // --- END AI-REPLACED ---

  const handleSavePremium = useCallback(async () => {
    if (!guildId || !premConfig) return
    setSavingPrem(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${guildId}/premium-pomodoro`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(premConfig),
      })
      if (res.ok) {
        const data = await res.json()
        setPremConfig(data.config)
        toast.success('Premium settings saved!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } catch { toast.error('Failed to save') }
    finally { setSavingPrem(false) }
  }, [guildId, premConfig])
  // --- END AI-MODIFIED ---

  // Timer control
  const controlTimer = async (channelid: string, action: string) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/timer-control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelid, action }),
      })
      if (res.ok) {
        toast.success(action === "start" ? "Timer started" : "Timer stopped")
        mutateTimerStatus()
      } else {
        const err = await res.json()
        toast.error(err.reason || err.error || `Failed to ${action} timer`)
      }
    } catch { toast.error(`Failed to ${action} timer`) }
  }

  const handleSetPomodoroChannel = async (channelId: string | null) => {
    setPomodoroChannel(channelId)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pomodoro_channel: channelId }),
      })
      if (res.ok) { toast.success("Default notification channel updated"); mutate() }
      else toast.error("Failed to update")
    } catch { toast.error("Failed to update") }
  }

  const setTimerField = useCallback((timerId: string, field: keyof PomodoroTimer, value: unknown) => {
    setEditingTimers((prev) => ({ ...prev, [timerId]: { ...prev[timerId], [field]: value } }))
  }, [])

  const getTimerValue = (timer: PomodoroTimer, field: keyof PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    if (edit && field in edit) return (edit as Record<string, unknown>)[field]
    return (timer as unknown as Record<string, unknown>)[field]
  }

  const hasChanges = (timer: PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    return edit && Object.keys(edit).length > 0
  }

  const handleSave = async (timer: PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    if (!edit || Object.keys(edit).length === 0) return
    setSaving((prev) => ({ ...prev, [timer.timerid]: true }))
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerId: timer.timerid, ...edit }),
      })
      if (!res.ok) throw new Error("Save failed")
      setEditingTimers((prev) => { const next = { ...prev }; delete next[timer.timerid]; return next })
      mutate()
      toast.success("Timer settings saved")
    } catch { toast.error("Failed to save. Check your permissions.") }
    setSaving((prev) => ({ ...prev, [timer.timerid]: false }))
  }

  const handleReset = (timer: PomodoroTimer) => {
    setEditingTimers((prev) => { const next = { ...prev }; delete next[timer.timerid]; return next })
  }

  const handleCreate = async () => {
    if (!createForm.channelid) return
    setCreating(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelid: createForm.channelid,
          focus_length: createForm.focus_length, break_length: createForm.break_length,
          pretty_name: createForm.pretty_name || null,
          notification_channelid: createForm.notification_channelid,
          voice_alerts: createForm.voice_alerts, auto_restart: createForm.auto_restart,
          inactivity_threshold: createForm.inactivity_threshold || null,
          manager_roleid: createForm.manager_roleid, channel_name: createForm.channel_name || null,
        }),
      })
      if (res.ok) {
        toast.success("Timer created")
        const channelToReload = createForm.channelid
        setCreateForm({
          channelid: null, focus_length: 25, break_length: 5, pretty_name: "",
          notification_channelid: null, voice_alerts: true, auto_restart: true,
          inactivity_threshold: "", manager_roleid: null, channel_name: "",
        })
        mutate()
        fetch(`/api/dashboard/servers/${id}/timer-control`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelid: channelToReload, action: "reload" }),
        }).catch(() => {})
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create timer")
      }
    } catch { toast.error("Failed to create timer") }
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const channelidToUnload = deleteTarget.channelid
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelid: deleteTarget.channelid }),
      })
      if (res.ok) {
        toast.success("Timer deleted"); setDeleteTarget(null); mutate()
        fetch(`/api/dashboard/servers/${id}/timer-control`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelid: channelidToUnload, action: "unload" }),
        }).catch(() => {})
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete timer")
      }
    } catch { toast.error("Failed to delete timer") }
    setDeleting(false)
  }

  const noTimers = data && data.timers.length === 0
  const hasStats = stats && stats.summary.totalSessions > 0

  return (
    <Layout SEO={{ title: `Pomodoro - ${serverName} - LionBot`, description: "Pomodoro command center" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Pomodoro Timers"
                description="Manage study timers, view usage analytics, and configure focus/break cycles for your server."
              />

              <FirstTimeBanner
                title="What are Pomodoro timers?"
                description="Pomodoro timers help your members study in focused blocks. A timer runs in a voice channel: members join to study, and the bot cycles between focus periods (e.g. 25 minutes) and short breaks (e.g. 5 minutes)."
                icon={<Timer size={22} />}
                storageKey="pomodoro_intro"
              />

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-card/30 border border-border rounded-xl p-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      tab === t.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-800/50"
                    }`}
                  >
                    {t.icon} <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* ============= OVERVIEW TAB ============= */}
              {tab === "overview" && (
                <div className="space-y-4">
                  {noTimers ? (
                    <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Timer size={28} className="text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No timers configured</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        Create a Pomodoro timer on a voice channel to start tracking study sessions and viewing analytics.
                      </p>
                      <button
                        onClick={() => setTab("timers")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Settings size={14} /> Go to Timers
                      </button>
                    </div>
                  ) : statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                          <div className="h-12 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : stats ? (
                    <>
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <StatCard
                          label="Total Hours"
                          value={stats.summary.totalHours.toLocaleString()}
                          sub={`${stats.summary.hoursThisWeek}h this week`}
                          icon={<Clock size={18} />}
                          color="text-amber-400"
                        />
                        <StatCard
                          label="Total Sessions"
                          value={stats.summary.totalSessions.toLocaleString()}
                          sub={`${stats.summary.sessionsThisWeek} this week`}
                          icon={<Activity size={18} />}
                          color="text-blue-400"
                        />
                        <StatCard
                          label="Unique Users"
                          value={stats.summary.uniqueUsers.toLocaleString()}
                          sub={`${stats.summary.activeThisWeek} active this week`}
                          icon={<Users size={18} />}
                          color="text-emerald-400"
                        />
                        <StatCard
                          label="Avg Session"
                          value={`${stats.summary.avgSessionMinutes}m`}
                          icon={<Timer size={18} />}
                          color="text-indigo-400"
                        />
                        <StatCard
                          label="Active This Week"
                          value={stats.summary.activeThisWeek}
                          sub={`${stats.summary.hoursThisWeek}h studied`}
                          icon={<Zap size={18} />}
                          color="text-cyan-400"
                        />
                      </div>

                      {/* Usage Trend Chart */}
                      <SectionCard title="Study Trend" description="Daily pomodoro usage over the last 30 days" icon={<TrendingUp size={18} />}>
                        {hasStats ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={stats.dailyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 10, fill: "#9ca3af" }} interval="preserveStartEnd" />
                                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <RechartsTooltip
                                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                                  labelStyle={{ color: "#9ca3af" }}
                                  labelFormatter={formatDateShort}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Area yAxisId="left" dataKey="minutes" fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeWidth={2} name="Minutes Studied" />
                                <Bar yAxisId="right" dataKey="sessions" fill="#6366f1" opacity={0.5} name="Sessions" radius={[2, 2, 0, 0]} />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">No session data in the last 30 days</p>
                        )}
                      </SectionCard>

                      {/* Heatmap + Per-Timer side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard title="Peak Study Times" description="When members use pomodoro timers (UTC)" icon={<Clock size={18} />}>
                          {stats.heatmap.length > 0 ? (
                            <UsageHeatmap data={stats.heatmap} />
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No usage data yet</p>
                          )}
                        </SectionCard>

                        <SectionCard title="Timer Breakdown" description="Usage by individual timer" icon={<Timer size={18} />} badge={`${stats.perTimer.length}`}>
                          {stats.perTimer.length > 0 ? (
                            <div className="space-y-2">
                              {stats.perTimer.sort((a, b) => b.totalHours - a.totalHours).map((pt) => {
                                const maxHours = stats.perTimer.reduce((m, p) => Math.max(m, p.totalHours), 1)
                                const pct = Math.round((pt.totalHours / maxHours) * 100)
                                return (
                                  <div key={pt.channelid} className="bg-gray-800/40 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-foreground truncate">{pt.prettyName}</span>
                                      <span className="text-xs font-bold text-amber-400 ml-2 flex-shrink-0">{pt.totalHours}h</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1.5">
                                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                                      <span>{pt.totalSessions} sessions</span>
                                      <span>{pt.uniqueUsers} users</span>
                                      <span>{pt.hoursThisWeek}h this week</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">No timer usage data</p>
                          )}
                        </SectionCard>
                      </div>

                      {/* Top Users */}
                      <SectionCard title="Top Pomodoro Users" description="Members who study the most with timers" icon={<Award size={18} />} badge={`${stats.topUsers.length}`}>
                        {stats.topUsers.length > 0 ? (
                          <div className="space-y-1">
                            {stats.topUsers.map((u, i) => (
                              <button
                                key={u.userId}
                                onClick={() => setPanelUserId(u.userId)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/40 transition-colors text-left"
                              >
                                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                <MemberAvatar url={u.avatarUrl} name={u.name} />
                                <span className="text-sm text-foreground truncate flex-1">{u.name}</span>
                                <span className="text-xs text-muted-foreground">{u.sessions} sessions</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                                  {u.totalHours}h
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">No pomodoro usage yet</p>
                        )}
                      </SectionCard>
                    </>
                  ) : null}
                </div>
              )}

              {/* ============= TIMERS TAB ============= */}
              {tab === "timers" && (
                <div className="space-y-6">
                  {/* Guild Default Channel */}
                  {data && (
                    <div className="bg-card/50 border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-1">Default Notification Channel</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Fallback channel for timer notifications when a timer doesn&apos;t have its own notification channel set.
                      </p>
                      <ChannelSelect
                        guildId={guildId}
                        value={pomodoroChannel}
                        onChange={(v) => handleSetPomodoroChannel((v as string) || null)}
                        channelTypes={[0, 5]}
                        placeholder="No default (use voice channel)"
                      />
                    </div>
                  )}

                  {/* Live Timers */}
                  {timerStatus?.timers && timerStatus.timers.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Activity size={20} className="text-success" />
                        Live Timers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {timerStatus.timers.map((t) => (
                          <div key={t.channelid} className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-start gap-5">
                              <CountdownRing
                                totalSeconds={t.stageDurationSeconds}
                                remainingSeconds={t.remainingSeconds}
                                stage={t.stage}
                                size={100}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground truncate">{t.prettyName}</h4>
                                <p className="text-sm text-muted-foreground">{t.channelName}</p>
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                  <span className="text-muted-foreground">{t.membersInChannel} studying</span>
                                  <span className="text-muted-foreground">{t.focusLength}/{t.breakLength} min</span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  {t.running ? (
                                    <button
                                      onClick={() => controlTimer(t.channelid, "stop")}
                                      className="px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                                    >
                                      Stop
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => controlTimer(t.channelid, "start")}
                                      className="px-3 py-1.5 text-xs font-medium text-success bg-success/10 hover:bg-success/20 rounded-md transition-colors"
                                    >
                                      Start
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timer Config Cards */}
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                          <div className="space-y-3">
                            <div className="h-10 bg-muted rounded" />
                            <div className="h-10 bg-muted rounded w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !data ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">Unable to load Pomodoro settings.</p>
                    </div>
                  ) : data.timers.length === 0 ? (
                    <EmptyState
                      icon={<Timer size={48} strokeWidth={1} />}
                      title="No Pomodoro timers configured"
                      description="Create one below by selecting a voice channel and setting focus/break durations."
                    />
                  ) : (
                    <div className="space-y-4">
                      {data.timers.map((timer) => {
                        const timerStats = perTimerMap.get(timer.channelid)
                        return (
                          <SectionCard
                            key={timer.timerid}
                            title={timer.pretty_name || timer.channel_name || `Timer #${timer.timerid.slice(-6)}`}
                            description={`Focus: ${timer.focus_length} min · Break: ${timer.break_length} min`}
                            icon={<Timer size={18} />}
                            badge={hasChanges(timer) ? "Unsaved" : undefined}
                          >
                            {/* Per-timer stat banner */}
                            {timerStats && timerStats.totalSessions > 0 && (
                              <div className="flex flex-wrap gap-4 px-1 py-2 mb-2 text-xs text-muted-foreground border-b border-border/30">
                                <span><span className="font-bold text-amber-400">{timerStats.totalHours}h</span> studied</span>
                                <span><span className="font-bold text-foreground">{timerStats.totalSessions}</span> sessions</span>
                                <span><span className="font-bold text-foreground">{timerStats.uniqueUsers}</span> unique users</span>
                                <span><span className="font-bold text-foreground">{timerStats.hoursThisWeek}h</span> this week</span>
                              </div>
                            )}

                            <div className="space-y-0">
                              <SettingRow label="Timer name" description="Display name shown in the timer card and channel name">
                                <input
                                  type="text"
                                  value={(getTimerValue(timer, "pretty_name") as string | null) ?? timer.pretty_name ?? ""}
                                  onChange={(e) => setTimerField(timer.timerid, "pretty_name", e.target.value || null)}
                                  placeholder="e.g. Main Study Timer"
                                  maxLength={100}
                                  className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </SettingRow>
                              <SettingRow
                                label="Channel name format"
                                description="Variables: {name}, {stage}, {remaining}, {pattern}, {members}"
                                tooltip="The bot updates the voice channel name with this format."
                              >
                                <input
                                  type="text"
                                  value={(getTimerValue(timer, "channel_name") as string | null) ?? timer.channel_name ?? ""}
                                  onChange={(e) => setTimerField(timer.timerid, "channel_name", e.target.value || null)}
                                  placeholder="{name} {pattern} - {stage}"
                                  maxLength={100}
                                  className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </SettingRow>
                              <SettingRow label="Focus length" description="Duration of each focus period" tooltip="Common values: 25 (classic), 45, or 50 minutes.">
                                <NumberInput value={(getTimerValue(timer, "focus_length") as number) ?? timer.focus_length} onChange={(v) => setTimerField(timer.timerid, "focus_length", v)} unit="min" min={1} max={120} />
                              </SettingRow>
                              <SettingRow label="Break length" description="Duration of each break" tooltip="Typically 5 minutes for classic Pomodoro.">
                                <NumberInput value={(getTimerValue(timer, "break_length") as number) ?? timer.break_length} onChange={(v) => setTimerField(timer.timerid, "break_length", v)} unit="min" min={1} max={60} />
                              </SettingRow>
                              <SettingRow label="Auto restart" description="Automatically cycle without manual start" tooltip="When enabled, the timer cycles continuously.">
                                <Toggle checked={(getTimerValue(timer, "auto_restart") as boolean) ?? timer.auto_restart} onChange={(v) => setTimerField(timer.timerid, "auto_restart", v)} />
                              </SettingRow>
                              <SettingRow label="Inactivity cycles" description="Cycles before removing inactive members" tooltip="Leave empty for no limit.">
                                <NumberInput value={(getTimerValue(timer, "inactivity_threshold") as number | null) ?? timer.inactivity_threshold} onChange={(v) => setTimerField(timer.timerid, "inactivity_threshold", v)} unit="cycles" min={1} max={64} allowNull placeholder="No limit" />
                              </SettingRow>
                              <SettingRow label="Voice alerts" description="Play sounds when focus/break periods change" tooltip="Helps members who are tabbed out.">
                                <Toggle checked={(getTimerValue(timer, "voice_alerts") as boolean) ?? timer.voice_alerts} onChange={(v) => setTimerField(timer.timerid, "voice_alerts", v)} />
                              </SettingRow>
                              <SettingRow label="Manager role" description="Role that can start, pause, and control the timer" tooltip="Leave empty for anyone to control.">
                                <RoleSelect guildId={guildId} value={(getTimerValue(timer, "manager_roleid") as string | null) ?? timer.manager_roleid} onChange={(v) => setTimerField(timer.timerid, "manager_roleid", Array.isArray(v) ? v[0] ?? null : v)} placeholder="Anyone" />
                              </SettingRow>
                              <SettingRow label="Notification channel" description="Channel where timer status cards are posted" tooltip="Leave empty to use the server's default or the voice channel.">
                                <ChannelSelect guildId={guildId} value={(getTimerValue(timer, "notification_channelid") as string | null) ?? timer.notification_channelid} onChange={(v) => setTimerField(timer.timerid, "notification_channelid", (v as string) || null)} channelTypes={[0, 5]} placeholder="Default channel" />
                              </SettingRow>
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 flex-wrap">
                              {hasChanges(timer) && (
                                <>
                                  <button onClick={() => handleSave(timer)} disabled={saving[timer.timerid]} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
                                    {saving[timer.timerid] ? "Saving..." : "Save changes"}
                                  </button>
                                  <button onClick={() => handleReset(timer)} className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-white rounded-lg transition-colors">
                                    Reset
                                  </button>
                                </>
                              )}
                              <button type="button" onClick={() => setDeleteTarget(timer)} className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                Delete
                              </button>
                            </div>
                          </SectionCard>
                        )
                      })}
                    </div>
                  )}

                  {/* Create Timer Form */}
                  {data && (
                    <div className="bg-card/50 border border-border rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-1">Create Timer</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Add a new Pomodoro timer to a voice channel.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCreateForm((f) => ({ ...f, focus_length: p.focus, break_length: p.break }))}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm border transition-colors",
                              createForm.focus_length === p.focus && createForm.break_length === p.break
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                          >
                            <span className="font-medium">{p.label}</span>
                            <span className="text-xs ml-1.5 opacity-70">{p.focus}/{p.break}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ChannelSelect guildId={guildId} value={createForm.channelid} onChange={(v) => setCreateForm((f) => ({ ...f, channelid: (v as string) || null }))} channelTypes={[2]} label="Voice channel" placeholder="Select voice channel..." />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">Focus (min)</label>
                            <input type="number" value={createForm.focus_length} onChange={(e) => setCreateForm((f) => ({ ...f, focus_length: parseInt(e.target.value, 10) || 25 }))} min={1} max={120} className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">Break (min)</label>
                            <input type="number" value={createForm.break_length} onChange={(e) => setCreateForm((f) => ({ ...f, break_length: parseInt(e.target.value, 10) || 5 }))} min={1} max={60} className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-1">Timer name</label>
                          <input type="text" value={createForm.pretty_name} onChange={(e) => setCreateForm((f) => ({ ...f, pretty_name: e.target.value }))} placeholder="e.g. Main Study Timer" maxLength={100} className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <ChannelSelect guildId={guildId} value={createForm.notification_channelid} onChange={(v) => setCreateForm((f) => ({ ...f, notification_channelid: (v as string) || null }))} channelTypes={[0, 5]} label="Notification channel" placeholder="Default (voice channel)" />
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 text-sm text-foreground/80">
                            <Toggle checked={createForm.voice_alerts} onChange={(v) => setCreateForm((f) => ({ ...f, voice_alerts: v }))} />
                            Voice alerts
                          </label>
                          <label className="flex items-center gap-2 text-sm text-foreground/80">
                            <Toggle checked={createForm.auto_restart} onChange={(v) => setCreateForm((f) => ({ ...f, auto_restart: v }))} />
                            Auto restart
                          </label>
                        </div>
                        <RoleSelect guildId={guildId} value={createForm.manager_roleid} onChange={(v) => setCreateForm((f) => ({ ...f, manager_roleid: (v as string) || null }))} label="Manager role" placeholder="Anyone can control" />
                      </div>
                      <button onClick={handleCreate} disabled={creating || !createForm.channelid} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {creating ? "Creating..." : "Create Timer"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- AI-REPLACED (2026-03-19) --- */}
              {/* Reason: Premium section was buried at page bottom; moved into its own tab */}
              {tab === "premium" && (
                <div className="space-y-6">
                  {premLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                          <div className="h-10 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  ) : !isPremium ? (
                    <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Lock size={28} className="text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Premium Pomodoro Features</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                        Unlock custom timer themes, focus roles, session summaries, economy bonuses, streaks, and advanced analytics for your server.
                      </p>
                      {/* --- AI-MODIFIED (2026-03-22) --- */}
                      {/* Purpose: Fixed broken /premium link to point to server settings */}
                      <Link href={`/dashboard/servers/${id}/settings`}>
                        <a className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                          <Sparkles size={14} /> Upgrade to Premium
                        </a>
                      </Link>
                      {/* --- END AI-MODIFIED --- */}
                    </div>
                  ) : premConfig ? (
                    <>
                      <SectionCard
                        title="Timer Customization"
                        description="Customize how your pomodoro timer looks and behaves"
                        icon={<Sparkles size={18} />}
                      >
                        <div className="space-y-0">
                          <SettingRow label="Timer theme" description="Color theme applied to the timer card (progress bar, header, footer)">
                            <select
                              value={premConfig.timer_theme ?? "default"}
                              onChange={(e) => setPremConfig((c: any) => ({ ...c, timer_theme: e.target.value }))}
                              className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {themes.map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                              ))}
                            </select>
                          </SettingRow>
                          <SettingRow label="Focus role" description="Role granted to members while in a focus session">
                            <RoleSelect
                              guildId={guildId}
                              value={premConfig.focus_roleid ?? null}
                              onChange={(v) => setPremConfig((c: any) => ({ ...c, focus_roleid: Array.isArray(v) ? v[0] ?? null : v }))}
                              placeholder="None"
                            />
                          </SettingRow>
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Economy & Gamification"
                        description="Reward members for focused study sessions"
                        icon={<Zap size={18} />}
                      >
                        <div className="space-y-0">
                          <SettingRow label="Session summaries" description="Post a summary after each completed focus session">
                            <Toggle
                              checked={premConfig.session_summary ?? false}
                              onChange={(v) => setPremConfig((c: any) => ({ ...c, session_summary: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Coin multiplier" description="Bonus coins for pomodoro focus sessions">
                            <Toggle
                              checked={premConfig.coin_multiplier ?? false}
                              onChange={(v) => setPremConfig((c: any) => ({ ...c, coin_multiplier: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Group goal" description="Weekly study hours goal for the server" tooltip="Set to 0 to disable">
                            <NumberInput
                              value={premConfig.group_goal_hours ?? 0}
                              onChange={(v) => setPremConfig((c: any) => ({ ...c, group_goal_hours: v }))}
                              unit="hours/week"
                              min={0}
                              max={1000}
                            />
                          </SettingRow>
                        </div>
                      </SectionCard>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleSavePremium}
                          disabled={savingPrem}
                          className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {savingPrem ? "Saving..." : "Save Premium Settings"}
                        </button>
                        <Link href={`/dashboard/servers/${guildId}/pomodoro-analytics`}>
                          <a className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                            <TrendingUp size={14} /> View Premium Analytics
                          </a>
                        </Link>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
              {/* --- END AI-REPLACED --- */}
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete Timer"
          message="This will remove the Pomodoro timer from this voice channel. The timer will stop and members will need to re-create it via the bot."
          confirmLabel="Delete Timer"
          variant="danger"
          loading={deleting}
        />

        {/* Member Detail Panel */}
        <MemberDetailPanel
          open={!!panelUserId}
          onClose={() => setPanelUserId(null)}
          data={panelData as any}
          loading={panelLoading}
          onWarn={() => {}}
          onNote={() => {}}
          onRestrict={() => {}}
          onResolve={() => {}}
          onAdjustCoins={() => {}}
        />
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
