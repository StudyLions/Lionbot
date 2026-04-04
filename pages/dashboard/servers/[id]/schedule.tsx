// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Schedule Command Center - analytics, session
//          history, member leaderboards, booking heatmap,
//          and configuration
// ============================================================
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Migrated hardcoded gray-* Tailwind colors to semantic design tokens
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import {
  PageHeader, SectionCard, SettingRow, ChannelSelect,
  RoleSelect, NumberInput, SaveBar, toast,
} from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
import MemberDetailPanel from "@/components/dashboard/MemberDetailPanel"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect, useMemo } from "react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  Calendar, Clock, Users, TrendingUp, TrendingDown, Coins,
  ChevronDown, ChevronUp,
  CheckCircle, XCircle, Settings, BarChart3, Award,
  AlertTriangle, ArrowRight, Zap,
} from "lucide-react"
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"

// ---- Types ----

interface ScheduleStats {
  summary: {
    totalSessions: number; totalBookings: number; totalAttended: number
    totalMissed: number; attendanceRate: number; uniqueMembers: number
    sessionsThisWeek: number; bookingsThisWeek: number
    attendedThisWeek: number; activeThisWeek: number
  }
  dailyTrend: Array<{ date: string; bookings: number; attended: number; missed: number; rate: number }>
  heatmap: Array<{ dayOfWeek: number; hour: number; count: number }>
  topMembers: {
    mostReliable: Array<{ userId: string; name: string; avatarUrl: string; totalBooked: number; totalAttended: number; rate: number }>
    mostActive: Array<{ userId: string; name: string; avatarUrl: string; totalBooked: number }>
    mostNoShows: Array<{ userId: string; name: string; avatarUrl: string; totalMissed: number; totalBooked: number }>
  }
  upcoming: Array<{
    slotid: number; slotTime: string; memberCount: number
    members: Array<{ userId: string; name: string; avatarUrl: string; bookedAt: string }>
  }>
  coinFlow: { totalSpent: number; totalEarned: number; netFlow: number }
}

interface SessionHistory {
  sessions: Array<{
    slotid: number; slotTime: string; openedAt: string | null; closedAt: string | null
    totalBooked: number; totalAttended: number; totalMissed: number; attendanceRate: number
    members: Array<{
      userId: string; name: string; avatarUrl: string
      attended: boolean; clock: number; bookedAt: string
    }>
  }>
  totalCount: number; page: number; pageSize: number
}

interface ScheduleConfig {
  lobby_channel: string | null; room_channel: string | null
  schedule_cost: number | null; reward: number | null
  bonus_reward: number | null; min_attendance: number | null
  blacklist_role: string | null; blacklist_after: number | null
  schedule_channels: { channelid: string }[]
}

// ---- Helpers ----

// --- AI-MODIFIED (2026-04-04) ---
// Purpose: Added Calendar tab for visual month-view session calendar
const TABS = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={14} /> },
  { id: "sessions", label: "Sessions", icon: <Calendar size={14} /> },
  { id: "members", label: "Members", icon: <Users size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
] as const
// --- END AI-MODIFIED ---

type TabId = typeof TABS[number]["id"]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z")
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

// ---- Stat Card ----

function StatCard({ label, value, sub, icon, color = "text-primary" }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color?: string
}) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-muted ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ---- Booking Heatmap ----

function BookingHeatmap({ data }: { data: Array<{ dayOfWeek: number; hour: number; count: number }> }) {
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
    if (count === 0) return "bg-card/50"
    const intensity = count / Math.max(grid.max, 1)
    if (intensity > 0.75) return "bg-indigo-500"
    if (intensity > 0.5) return "bg-indigo-500/70"
    if (intensity > 0.25) return "bg-indigo-500/40"
    return "bg-indigo-500/20"
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
              <div key={h} className="w-5 text-center text-[9px] text-muted-foreground font-medium">
                {h}
              </div>
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground shadow-lg pointer-events-none whitespace-nowrap z-10">
          {DAY_LABELS[tooltip.day]} {tooltip.hour}:00 &mdash; <span className="font-bold">{tooltip.count}</span> bookings
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        <div className="w-4 h-4 rounded-sm bg-card/50" />
        <div className="w-4 h-4 rounded-sm bg-indigo-500/20" />
        <div className="w-4 h-4 rounded-sm bg-indigo-500/40" />
        <div className="w-4 h-4 rounded-sm bg-indigo-500/70" />
        <div className="w-4 h-4 rounded-sm bg-indigo-500" />
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

// ---- Member Avatar ----

function MemberAvatar({ url, name, size = 28 }: { url: string; name: string; size?: number }) {
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded-full bg-muted flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/0.png` }}
    />
  )
}

// ---- Main Page ----

export default function SchedulePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const [tab, setTab] = useState<TabId>("overview")
  const [panelUserId, setPanelUserId] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())
  // --- AI-MODIFIED (2026-04-04) ---
  // Purpose: Calendar tab state
  const [calViewDate, setCalViewDate] = useState(() => new Date())
  const [calSelectedDay, setCalSelectedDay] = useState<string | null>(null)
  // --- END AI-MODIFIED ---

  // Data fetching
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"

  const { data: stats, isLoading: statsLoading } = useDashboard<ScheduleStats>(
    id && session ? `/api/dashboard/servers/${id}/schedule-stats` : null
  )

  const { data: history, isLoading: historyLoading } = useDashboard<SessionHistory>(
    id && session && tab === "sessions"
      ? `/api/dashboard/servers/${id}/schedule-history?page=${historyPage}&pageSize=20`
      : null
  )

  const { data: configData, isLoading: configLoading, mutate: mutateConfig } = useDashboard<ScheduleConfig>(
    id && session ? `/api/dashboard/servers/${id}/schedule` : null
  )

  const { data: panelData, isLoading: panelLoading, error: panelError } = useDashboard(
    panelUserId && id ? `/api/dashboard/servers/${id}/members/${panelUserId}` : null
  )

  // --- AI-MODIFIED (2026-04-04) ---
  // Purpose: Calendar tab data fetching with date range filtering
  const calYear = calViewDate.getFullYear()
  const calMonth = calViewDate.getMonth()
  const calFrom = new Date(calYear, calMonth - 1, 1)
  const calTo = new Date(calYear, calMonth + 2, 0)

  const { data: calHistory, isLoading: calLoading } = useDashboard<SessionHistory>(
    id && session && tab === "calendar"
      ? `/api/dashboard/servers/${id}/schedule-history?from=${calFrom.toISOString()}&to=${calTo.toISOString()}&pageSize=50`
      : null
  )
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (panelError && panelUserId) {
      toast.error("Could not load member details")
      setPanelUserId(null)
    }
  }, [panelError, panelUserId])

  // Config editing state
  const [config, setConfig] = useState<ScheduleConfig | null>(null)
  const [origConfig, setOrigConfig] = useState<ScheduleConfig | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (configData) {
      setConfig(configData)
      setOrigConfig({ ...configData })
    }
  }, [configData])

  const setField = useCallback((key: keyof ScheduleConfig, value: unknown) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const configChanged = config && origConfig && JSON.stringify(config) !== JSON.stringify(origConfig)

  const handleSave = async () => {
    if (!config || !origConfig || !configChanged) return
    setSaving(true)
    const changes: Record<string, unknown> = {}
    for (const key of Object.keys(config) as (keyof ScheduleConfig)[]) {
      if (key === "schedule_channels") {
        if (JSON.stringify(config[key]) !== JSON.stringify(origConfig[key])) {
          changes.schedule_channels = config.schedule_channels
        }
        continue
      }
      if (JSON.stringify(config[key]) !== JSON.stringify(origConfig[key])) {
        changes[key] = config[key]
      }
    }
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error("Save failed")
      const updated = await res.json()
      setConfig(updated)
      setOrigConfig({ ...updated })
      mutateConfig()
      toast.success("Schedule settings saved")
    } catch {
      toast.error("Failed to save settings")
    }
    setSaving(false)
  }

  const handleReset = () => { if (origConfig) setConfig({ ...origConfig }) }

  const toggleSession = (slotid: number) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(slotid)) next.delete(slotid)
      else next.add(slotid)
      return next
    })
  }

  const isEmpty = stats && stats.summary.totalSessions === 0
  const totalHistoryPages = history ? Math.ceil(history.totalCount / history.pageSize) : 0

  return (
    <Layout SEO={{ title: `Schedule - ${serverName} - LionBot`, description: "Schedule command center" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-5xl mx-auto flex gap-8">
                <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />}>
        {/* --- END AI-REPLACED --- */}
              <PageHeader
                title="Schedule"
                description="Manage scheduled study sessions. Track attendance, view analytics, and configure session rules."
              />

              {/* Tabs */}
              {/* --- AI-REPLACED (2026-03-24) ---
                  Reason: Migrated from custom tab row to shared TabBar component
                  --- Original code (commented out for rollback) ---
                  <div className="flex gap-1 mb-6 bg-card/30 border border-border rounded-xl p-1">
                    {TABS.map((t) => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex-1 ... ${tab === t.id ? "bg-primary ..." : "text-muted-foreground ..."}`}>
                        {t.icon} <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  --- End original code --- */}
              <div className="mb-6">
                <TabBar
                  tabs={TABS.map((t) => ({ key: t.id, label: t.label, icon: t.icon }))}
                  active={tab}
                  onChange={(k) => setTab(k as TabId)}
                  variant="pills"
                />
              </div>
              {/* --- END AI-REPLACED --- */}

              {/* Empty state */}
              {isEmpty && tab !== "settings" && (
                <div className="bg-card/50 border border-border rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Calendar size={28} className="text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    Scheduled study sessions let members book hourly time slots in advance. They pay coins to reserve,
                    then earn rewards for showing up. Configure the lobby and room channels to get started.
                  </p>
                  <button
                    onClick={() => setTab("settings")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Settings size={14} /> Go to Settings
                  </button>
                </div>
              )}

              {/* ============= OVERVIEW TAB ============= */}
              {tab === "overview" && !isEmpty && (
                <div className="space-y-4">
                  {statsLoading ? (
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
                          label="Total Sessions"
                          value={stats.summary.totalSessions.toLocaleString()}
                          sub={`${stats.summary.sessionsThisWeek} this week`}
                          icon={<Calendar size={18} />}
                          color="text-indigo-400"
                        />
                        <StatCard
                          label="Total Bookings"
                          value={stats.summary.totalBookings.toLocaleString()}
                          sub={`${stats.summary.bookingsThisWeek} this week`}
                          icon={<Users size={18} />}
                          color="text-blue-400"
                        />
                        <StatCard
                          label="Attendance Rate"
                          value={`${stats.summary.attendanceRate}%`}
                          sub={`${stats.summary.totalAttended} attended, ${stats.summary.totalMissed} missed`}
                          icon={<CheckCircle size={18} />}
                          color={stats.summary.attendanceRate >= 70 ? "text-emerald-400" : stats.summary.attendanceRate >= 40 ? "text-amber-400" : "text-red-400"}
                        />
                        <StatCard
                          label="Active This Week"
                          value={stats.summary.activeThisWeek}
                          sub={`${stats.summary.uniqueMembers} all-time members`}
                          icon={<Zap size={18} />}
                          color="text-amber-400"
                        />
                        <StatCard
                          label="Net Coin Flow"
                          value={`${stats.coinFlow.netFlow >= 0 ? "+" : ""}${stats.coinFlow.netFlow.toLocaleString()}`}
                          sub={`${stats.coinFlow.totalSpent.toLocaleString()} spent, ${stats.coinFlow.totalEarned.toLocaleString()} earned`}
                          icon={stats.coinFlow.netFlow >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          color={stats.coinFlow.netFlow >= 0 ? "text-emerald-400" : "text-red-400"}
                        />
                      </div>

                      {/* Attendance Trend Chart */}
                      <SectionCard title="Attendance Trend" description="Bookings and attendance over the last 30 days" icon={<BarChart3 size={18} />}>
                        {stats.dailyTrend.some((d) => d.bookings > 0) ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={stats.dailyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 10, fill: "#9ca3af" }} interval="preserveStartEnd" />
                                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${v}%`} />
                                <RechartsTooltip
                                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                                  labelStyle={{ color: "#9ca3af" }}
                                  labelFormatter={formatDateShort}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Bar yAxisId="left" dataKey="bookings" fill="#6366f1" opacity={0.3} name="Bookings" radius={[2, 2, 0, 0]} />
                                <Bar yAxisId="left" dataKey="attended" fill="#22c55e" opacity={0.6} name="Attended" radius={[2, 2, 0, 0]} />
                                <Line yAxisId="right" dataKey="rate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Rate (%)" />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">No session data in the last 30 days</p>
                        )}
                      </SectionCard>

                      {/* Heatmap + Upcoming side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard title="Booking Heatmap" description="When members prefer to study (UTC)" icon={<Clock size={18} />}>
                          {stats.heatmap.length > 0 ? (
                            <BookingHeatmap data={stats.heatmap} />
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No booking data yet</p>
                          )}
                        </SectionCard>

                        <SectionCard title="Upcoming Sessions" description="Sessions in the next 24 hours" icon={<Calendar size={18} />}>
                          {stats.upcoming.length > 0 ? (
                            <div className="space-y-3">
                              {stats.upcoming.map((s) => (
                                <div key={s.slotid} className="bg-card/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-foreground">{formatSlotTime(s.slotTime)}</span>
                                    <span className="text-xs text-muted-foreground">{s.memberCount} booked</span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {s.members.slice(0, 8).map((m) => (
                                      <button key={m.userId} onClick={() => setPanelUserId(m.userId)} title={m.name}>
                                        <MemberAvatar url={m.avatarUrl} name={m.name} size={24} />
                                      </button>
                                    ))}
                                    {s.members.length > 8 && (
                                      <span className="text-xs text-muted-foreground ml-1">+{s.members.length - 8}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Calendar size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                              <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                            </div>
                          )}
                        </SectionCard>
                      </div>

                      {/* Coin Flow Summary */}
                      <SectionCard title="Coin Flow" description="How coins move through the schedule system" icon={<Coins size={18} />}>
                        {/* --- AI-MODIFIED (2026-03-21) --- */}
                        {/* Purpose: Stack coin flow on mobile */}
                        <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-3 sm:gap-0">
                        {/* --- END AI-MODIFIED --- */}
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Booking Costs</p>
                            <p className="text-2xl font-bold text-red-400">{stats.coinFlow.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">coins collected</p>
                          </div>
                          <ArrowRight size={24} className="text-muted-foreground/40" />
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rewards Paid</p>
                            <p className="text-2xl font-bold text-emerald-400">{stats.coinFlow.totalEarned.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">coins distributed</p>
                          </div>
                          <ArrowRight size={24} className="text-muted-foreground/40" />
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Flow</p>
                            <p className={`text-2xl font-bold ${stats.coinFlow.netFlow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {stats.coinFlow.netFlow >= 0 ? "+" : ""}{stats.coinFlow.netFlow.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{stats.coinFlow.netFlow >= 0 ? "members earn more" : "coin sink"}</p>
                          </div>
                        </div>
                      </SectionCard>
                    </>
                  ) : null}
                </div>
              )}

              {/* ============= CALENDAR TAB ============= */}
              {/* --- AI-GENERATED (2026-04-04) --- */}
              {/* Purpose: Visual month calendar view for server scheduled sessions */}
              {tab === "calendar" && (
                <div className="space-y-4">
                  {calLoading ? (
                    <div className="space-y-3">
                      <div className="h-8 bg-muted rounded w-48 mx-auto animate-pulse" />
                      <div className="h-[340px] bg-card border border-border rounded-xl animate-pulse" />
                    </div>
                  ) : (() => {
                    const WDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                    const firstDay = new Date(calYear, calMonth, 1)
                    const lastDay = new Date(calYear, calMonth + 1, 0)
                    const startPad = firstDay.getDay()
                    const cells: Array<{ date: Date; inMonth: boolean }> = []
                    for (let i = startPad - 1; i >= 0; i--) cells.push({ date: new Date(calYear, calMonth, -i), inMonth: false })
                    for (let i = 1; i <= lastDay.getDate(); i++) cells.push({ date: new Date(calYear, calMonth, i), inMonth: true })
                    const rem = 7 - (cells.length % 7)
                    if (rem < 7) for (let i = 1; i <= rem; i++) cells.push({ date: new Date(calYear, calMonth + 1, i), inMonth: false })

                    const sessionsByDay = new Map<string, typeof calHistory.sessions>()
                    if (calHistory?.sessions) {
                      for (const s of calHistory.sessions) {
                        const d = new Date(s.slotTime)
                        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
                        if (!sessionsByDay.has(k)) sessionsByDay.set(k, [])
                        sessionsByDay.get(k)!.push(s)
                      }
                    }

                    const todayK = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}` })()

                    return (
                      <>
                        <div className="flex items-center justify-between px-1">
                          <button onClick={() => { setCalViewDate(new Date(calYear, calMonth - 1, 1)); setCalSelectedDay(null) }}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                            <ChevronDown size={18} className="rotate-90 text-muted-foreground" />
                          </button>
                          <h3 className="text-sm font-semibold text-foreground">
                            {calViewDate.toLocaleDateString([], { month: "long", year: "numeric" })}
                          </h3>
                          <button onClick={() => { setCalViewDate(new Date(calYear, calMonth + 1, 1)); setCalSelectedDay(null) }}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                            <ChevronDown size={18} className="-rotate-90 text-muted-foreground" />
                          </button>
                        </div>
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                          <div className="grid grid-cols-7">
                            {WDAYS.map((d) => (
                              <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 border-t border-border/50">
                            {cells.map(({ date, inMonth }, i) => {
                              const k = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
                              const daySessions = sessionsByDay.get(k) || []
                              const isToday = k === todayK
                              const isSelected = k === calSelectedDay
                              const totalBooked = daySessions.reduce((a, s) => a + s.totalBooked, 0)
                              const totalAttended = daySessions.reduce((a, s) => a + s.totalAttended, 0)
                              const rate = totalBooked > 0 ? Math.round((totalAttended / totalBooked) * 100) : -1
                              return (
                                <button key={i}
                                  onClick={() => daySessions.length > 0 ? setCalSelectedDay(isSelected ? null : k) : undefined}
                                  className={[
                                    "relative min-h-[52px] p-1.5 border-b border-r border-border/30 transition-colors text-left",
                                    inMonth ? "bg-card" : "bg-muted/30",
                                    daySessions.length > 0 ? "cursor-pointer hover:bg-accent/50" : "",
                                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "",
                                  ].join(" ")}>
                                  <span className={[
                                    "text-xs tabular-nums",
                                    !inMonth ? "text-muted-foreground/30" : isToday ? "text-primary font-bold" : "text-foreground/70",
                                  ].join(" ")}>
                                    {date.getDate()}
                                  </span>
                                  {daySessions.length > 0 && (
                                    <div className="flex items-center gap-0.5 mt-1">
                                      <span className={[
                                        "w-1.5 h-1.5 rounded-full",
                                        rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : rate >= 0 ? "bg-red-500" : "bg-blue-500",
                                      ].join(" ")} />
                                      <span className="text-[8px] text-muted-foreground/60">{daySessions.length}</span>
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 px-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 80%+</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 50-79%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &lt;50%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Upcoming</span>
                        </div>
                        {calSelectedDay && sessionsByDay.has(calSelectedDay) && (
                          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">
                              {new Date(calSelectedDay + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                            </h4>
                            {sessionsByDay.get(calSelectedDay)!.map((s) => {
                              const start = new Date(s.slotTime)
                              const end = new Date(start.getTime() + 3600000)
                              return (
                                <div key={s.slotid} className="flex items-center gap-3 py-2 border-t border-border/30 first:border-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">
                                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">
                                    {s.totalAttended}/{s.totalBooked} attended
                                  </span>
                                  <span className={[
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    s.closedAt ? (s.attendanceRate >= 80 ? "bg-emerald-500/15 text-emerald-400" : s.attendanceRate >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400") : "bg-blue-500/15 text-blue-400",
                                  ].join(" ")}>
                                    {s.closedAt ? `${s.attendanceRate}%` : "Open"}
                                  </span>
                                  <div className="flex -space-x-1.5">
                                    {s.members.slice(0, 5).map((m) => (
                                      <img key={m.userId} src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full ring-1 ring-card" />
                                    ))}
                                    {s.members.length > 5 && (
                                      <span className="w-5 h-5 rounded-full bg-muted text-[8px] font-medium flex items-center justify-center ring-1 ring-card text-muted-foreground">
                                        +{s.members.length - 5}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {(!calHistory?.sessions || calHistory.sessions.length === 0) && (
                          <div className="text-center py-12">
                            <Calendar size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground">No sessions in this month</p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
              {/* --- END AI-GENERATED --- */}

              {/* ============= SESSIONS TAB ============= */}
              {tab === "sessions" && !isEmpty && (
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-5 animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : history && history.sessions.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">{history.totalCount} total sessions</p>
                      {history.sessions.map((s) => {
                        const expanded = expandedSessions.has(s.slotid)
                        const rateColor = s.attendanceRate === 100 ? "text-emerald-400" : s.attendanceRate >= 50 ? "text-amber-400" : "text-red-400"
                        const barColor = s.attendanceRate === 100 ? "bg-emerald-500" : s.attendanceRate >= 50 ? "bg-amber-500" : "bg-red-500"
                        const isOpen = !s.closedAt
                        return (
                          <div key={s.slotid} className="bg-card/50 border border-border rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleSession(s.slotid)}
                              className="w-full p-4 flex items-center gap-4 hover:bg-accent transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">{formatSlotTime(s.slotTime)}</span>
                                  {isOpen && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">LIVE</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{s.totalBooked} booked</span>
                                  <span className="text-emerald-400">{s.totalAttended} attended</span>
                                  {s.totalMissed > 0 && <span className="text-red-400">{s.totalMissed} missed</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-20">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-bold ${rateColor}`}>{s.attendanceRate}%</span>
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s.attendanceRate}%` }} />
                                  </div>
                                </div>
                                {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                              </div>
                            </button>
                            {expanded && (
                              <div className="border-t border-border px-4 py-3 bg-muted/20">
                                {s.members.length > 0 ? (
                                  <div className="space-y-2">
                                    {s.members.map((m) => (
                                      <div key={m.userId} className="flex items-center gap-3 py-1">
                                        <button onClick={() => setPanelUserId(m.userId)} className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 text-left">
                                          <MemberAvatar url={m.avatarUrl} name={m.name} size={24} />
                                          <span className="text-sm text-foreground truncate">{m.name}</span>
                                        </button>
                                        <span className="text-xs text-muted-foreground">{formatClock(m.clock)}</span>
                                        {m.attended ? (
                                          <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={12} /> Attended</span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-xs text-red-400"><XCircle size={12} /> Missed</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No members booked for this session</p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Pagination */}
                      {/* --- AI-REPLACED (2026-03-24) ---
                          Reason: Replaced custom session history pagination with shared Pagination component
                          --- Original code (commented out for rollback) ---
                          {totalHistoryPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage <= 1} ...>
                                <ChevronLeft size={16} />
                              </button>
                              <span>Page {historyPage} of {totalHistoryPages}</span>
                              <button onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))} disabled={historyPage >= totalHistoryPages} ...>
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          )}
                          --- End original code --- */}
                      <Pagination page={historyPage} totalPages={totalHistoryPages} onChange={setHistoryPage} showLabel className="pt-2" />
                      {/* --- END AI-REPLACED --- */}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground">No session history found</p>
                    </div>
                  )}
                </div>
              )}

              {/* ============= MEMBERS TAB ============= */}
              {tab === "members" && !isEmpty && (
                <div className="space-y-4">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                          <div className="space-y-3">
                            <div className="h-8 bg-muted rounded" />
                            <div className="h-8 bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stats ? (
                    <>
                      {/* Most Reliable */}
                      <SectionCard title="Most Reliable" description="Highest attendance rate (minimum 3 sessions)" icon={<Award size={18} />} badge={`${stats.topMembers.mostReliable.length}`}>
                        {stats.topMembers.mostReliable.length > 0 ? (
                          <div className="space-y-1">
                            {stats.topMembers.mostReliable.map((m, i) => (
                              <button
                                key={m.userId}
                                onClick={() => setPanelUserId(m.userId)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left"
                              >
                                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                <MemberAvatar url={m.avatarUrl} name={m.name} />
                                <span className="text-sm text-foreground truncate flex-1">{m.name}</span>
                                <span className="text-xs text-muted-foreground">{m.totalAttended}/{m.totalBooked} sessions</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  m.rate === 100 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                                }`}>
                                  {m.rate}%
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">No members with 3+ sessions yet</p>
                        )}
                      </SectionCard>

                      {/* Most Active */}
                      <SectionCard title="Most Active Bookers" description="Members who book the most sessions" icon={<TrendingUp size={18} />} badge={`${stats.topMembers.mostActive.length}`}>
                        {stats.topMembers.mostActive.length > 0 ? (
                          <div className="space-y-1">
                            {stats.topMembers.mostActive.map((m, i) => (
                              <button
                                key={m.userId}
                                onClick={() => setPanelUserId(m.userId)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left"
                              >
                                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                <MemberAvatar url={m.avatarUrl} name={m.name} />
                                <span className="text-sm text-foreground truncate flex-1">{m.name}</span>
                                <span className="text-xs font-bold text-primary">{m.totalBooked} bookings</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
                        )}
                      </SectionCard>

                      {/* Biggest No-Shows */}
                      <SectionCard title="Most No-Shows" description="Members who missed the most sessions" icon={<AlertTriangle size={18} />} badge={`${stats.topMembers.mostNoShows.length}`}>
                        {stats.topMembers.mostNoShows.length > 0 ? (
                          <div className="space-y-1">
                            {stats.topMembers.mostNoShows.map((m, i) => (
                              <button
                                key={m.userId}
                                onClick={() => setPanelUserId(m.userId)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors text-left"
                              >
                                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                <MemberAvatar url={m.avatarUrl} name={m.name} />
                                <span className="text-sm text-foreground truncate flex-1">{m.name}</span>
                                <span className="text-xs text-muted-foreground">{m.totalBooked} booked</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                                  {m.totalMissed} missed
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">No missed sessions</p>
                        )}
                      </SectionCard>

                      {/* Blacklist Info */}
                      {config?.blacklist_role && (
                        <SectionCard title="Blacklist Settings" description="Auto-restriction for repeated no-shows" icon={<AlertTriangle size={18} />}>
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-200/80">
                            Members who miss <span className="font-bold text-amber-400">{config.blacklist_after || "?"}</span> sessions
                            within 24 hours will automatically receive the blacklist role and be blocked from future bookings.
                          </div>
                        </SectionCard>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* ============= SETTINGS TAB ============= */}
              {tab === "settings" && (
                <div className="space-y-4">
                  {configLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                          <div className="space-y-3">
                            <div className="h-10 bg-muted rounded" />
                            <div className="h-10 bg-muted rounded w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !config ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">Unable to load schedule settings.</p>
                    </div>
                  ) : (
                    <>
                      <SectionCard
                        title="Session Channels"
                        description="Where members wait and where sessions are held"
                        icon={<Clock size={18} />}
                      >
                        <SettingRow
                          label="Lobby Channel"
                          description="Text channel for session announcements and status updates"
                          impactText={stats && stats.summary.sessionsThisWeek > 0 ? `${stats.summary.sessionsThisWeek} sessions announced this week` : undefined}
                        >
                          <ChannelSelect
                            guildId={guildId}
                            value={config.lobby_channel}
                            onChange={(v) => setField("lobby_channel", (v as string) || null)}
                            channelTypes={[0, 2]}
                            placeholder="Select lobby channel"
                          />
                        </SettingRow>
                        <SettingRow
                          label="Session Room"
                          description="Voice channel (or category) for the study session"
                          impactText={config.room_channel ? undefined : "Not set -- sessions cannot run without a room"}
                        >
                          <ChannelSelect
                            guildId={guildId}
                            value={config.room_channel}
                            onChange={(v) => setField("room_channel", (v as string) || null)}
                            channelTypes={[2, 4]}
                            placeholder="Select session room"
                          />
                        </SettingRow>
                        <SettingRow
                          label="Schedule Channels"
                          description="Voice channels that count for attendance tracking"
                        >
                          <ChannelSelect
                            guildId={guildId}
                            value={config.schedule_channels.map((ch) => ch.channelid)}
                            onChange={(v) => {
                              const ids = Array.isArray(v) ? v : v ? [v] : []
                              setField("schedule_channels", ids.map((channelid: string) => ({ channelid })))
                            }}
                            channelTypes={[2]}
                            multiple
                            placeholder="Select schedule channels"
                          />
                        </SettingRow>
                      </SectionCard>

                      <SectionCard
                        title="Rewards"
                        description="Coins for booking and attending sessions"
                        icon={<Coins size={18} />}
                      >
                        <SettingRow
                          label="Booking Cost"
                          description="Coins deducted when a member books a slot"
                          impactText={stats ? `${stats.coinFlow.totalSpent.toLocaleString()} coins collected from bookings all-time` : undefined}
                        >
                          <NumberInput
                            value={config.schedule_cost}
                            onChange={(v) => setField("schedule_cost", v)}
                            unit="coins"
                            min={0}
                            allowNull
                          />
                        </SettingRow>
                        <SettingRow
                          label="Attendance Reward"
                          description="Coins earned for attending a booked session"
                          impactText={stats ? `${stats.coinFlow.totalEarned.toLocaleString()} coins paid in rewards all-time` : undefined}
                        >
                          <NumberInput
                            value={config.reward}
                            onChange={(v) => setField("reward", v)}
                            unit="coins"
                            min={0}
                            allowNull
                          />
                        </SettingRow>
                        <SettingRow
                          label="Full Group Bonus"
                          description="Extra coins when every booked member attends"
                        >
                          <NumberInput
                            value={config.bonus_reward}
                            onChange={(v) => setField("bonus_reward", v)}
                            unit="coins"
                            min={0}
                            allowNull
                          />
                        </SettingRow>
                      </SectionCard>

                      <SectionCard
                        title="Attendance Rules"
                        description="Minimum attendance and no-show penalties"
                        icon={<Clock size={18} />}
                      >
                        <SettingRow
                          label="Minimum Attendance"
                          description="Minutes in voice to count as attended (1-60)"
                        >
                          <NumberInput
                            value={config.min_attendance}
                            onChange={(v) => setField("min_attendance", v)}
                            unit="minutes"
                            min={1}
                            max={60}
                            allowNull
                            placeholder="e.g. 10"
                          />
                        </SettingRow>
                        <SettingRow
                          label="Blacklist Role"
                          description="Role assigned after too many no-shows, blocking future bookings"
                        >
                          <RoleSelect
                            guildId={guildId}
                            value={config.blacklist_role}
                            onChange={(v) => setField("blacklist_role", (v as string) || null)}
                            placeholder="Select blacklist role"
                          />
                        </SettingRow>
                        <SettingRow
                          label="Blacklist After"
                          description="Missed sessions within 24 hours before auto-blacklist"
                        >
                          <NumberInput
                            value={config.blacklist_after}
                            onChange={(v) => setField("blacklist_after", v)}
                            min={1}
                            max={24}
                            allowNull
                            placeholder="e.g. 3"
                          />
                        </SettingRow>
                      </SectionCard>
                    </>
                  )}

                  <SaveBar
                    show={!!configChanged}
                    onSave={handleSave}
                    onReset={handleReset}
                    saving={saving}
                  />
                </div>
              )}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

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
