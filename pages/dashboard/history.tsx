// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Study history - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign - activity chart, advanced filters, date-grouped expandable sessions,
//          ongoing session banner, infinite scroll, richer stats, CSV export, mobile UX
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, toast } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  History, Clock, Calendar, TrendingUp, Server, Download, ChevronDown,
  Camera, Radio, Headphones, Star, Filter, X, Activity,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- Types ---

interface Session {
  id: number
  guildId: string
  guildName: string
  startTime: string
  durationMinutes: number
  cameraDurationMinutes: number
  streamDurationMinutes: number
  liveDurationMinutes: number
  tag: string | null
  rating: number | null
}

interface SessionStats {
  totalSessions: number
  totalMinutes: number
  avgSessionMinutes: number
  longestSessionMinutes: number
  mostActiveDay: string | null
  uniqueServers: number
}

interface OngoingSession {
  guildId: string
  guildName: string
  startTime: string
  currentMinutes: number
  isCamera: boolean
  isStream: boolean
}

interface SessionsResponse {
  sessions: Session[]
  stats: SessionStats
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  ongoingSession: OngoingSession | null
}

interface ActivityDay {
  date: string
  minutes: number
  sessions: number
}

interface ActivityServer {
  guildId: string
  guildName: string
}

interface ActivityResponse {
  days: ActivityDay[]
  servers: ActivityServer[]
}

type DatePreset = "week" | "month" | "3months" | "all"
type SessionType = "all" | "voice" | "camera" | "stream"

// --- Helpers ---

function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function getDatePresetRange(preset: DatePreset): { from?: string; to?: string } {
  if (preset === "all") return {}
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  const from = new Date(now)
  switch (preset) {
    case "week": from.setUTCDate(from.getUTCDate() - 7); break
    case "month": from.setUTCMonth(from.getUTCMonth() - 1); break
    case "3months": from.setUTCMonth(from.getUTCMonth() - 3); break
  }
  return { from: from.toISOString().slice(0, 10), to }
}

function getSessionType(s: Session): "camera" | "stream" | "voice" {
  if (s.cameraDurationMinutes > 0) return "camera"
  if (s.streamDurationMinutes > 0) return "stream"
  return "voice"
}

function groupByDate(sessions: Session[]): Map<string, Session[]> {
  const map = new Map<string, Session[]>()
  for (const s of sessions) {
    const dateKey = new Date(s.startTime).toISOString().slice(0, 10)
    const arr = map.get(dateKey) || []
    arr.push(s)
    map.set(dateKey, arr)
  }
  return map
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z")
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (dateStr === todayStr) return "Today"
  if (dateStr === yesterdayStr) return "Yesterday"
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

function timeStr(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

// --- Chart Tooltip ---

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-foreground">{formatDuration(payload[0].value)}</p>
      {payload[0].payload.sessions > 0 && (
        <p className="text-muted-foreground">{payload[0].payload.sessions} session{payload[0].payload.sessions !== 1 ? "s" : ""}</p>
      )}
    </div>
  )
}

// --- Main Component ---

export default function HistoryPage() {
  const { data: session } = useSession()

  // Filters
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [guildFilter, setGuildFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<SessionType>("all")
  const [chartPeriod, setChartPeriod] = useState<"30d" | "90d" | "year">("30d")
  const [showFilters, setShowFilters] = useState(false)

  // Infinite scroll
  const [page, setPage] = useState(1)
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Expanded session details
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Build query string
  const dateRange = useMemo(() => getDatePresetRange(datePreset), [datePreset])
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", "20")
    if (guildFilter) params.set("guild", guildFilter)
    if (dateRange.from) params.set("dateFrom", dateRange.from)
    if (dateRange.to) params.set("dateTo", dateRange.to)
    if (typeFilter !== "all") params.set("type", typeFilter)
    return params.toString()
  }, [page, guildFilter, dateRange, typeFilter])

  // Fetch sessions (page 1 initially)
  const { data: sessionsData, isLoading: loading } = useDashboard<SessionsResponse>(
    session ? `/api/dashboard/sessions?${queryParams}` : null
  )

  // Fetch activity chart data
  const { data: activityData } = useDashboard<ActivityResponse>(
    session ? `/api/dashboard/session-activity?period=${chartPeriod}` : null
  )

  const stats = sessionsData?.stats ?? null
  const ongoingSession = sessionsData?.ongoingSession ?? null
  const servers = activityData?.servers ?? []
  const chartData = activityData?.days ?? []

  // Reset accumulated sessions when filters change
  useEffect(() => {
    setPage(1)
    setAllSessions([])
    setHasMore(true)
  }, [guildFilter, datePreset, typeFilter])

  // Accumulate sessions for infinite scroll
  useEffect(() => {
    if (!sessionsData) return
    if (page === 1) {
      setAllSessions(sessionsData.sessions)
    } else {
      setAllSessions(prev => [...prev, ...sessionsData.sessions])
    }
    setHasMore(page < sessionsData.pagination.totalPages)
    setLoadingMore(false)
  }, [sessionsData])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          setPage(p => p + 1)
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore])

  // Ongoing session live timer
  const [liveMinutes, setLiveMinutes] = useState(0)
  useEffect(() => {
    if (!ongoingSession) return
    setLiveMinutes(ongoingSession.currentMinutes)
    const interval = setInterval(() => setLiveMinutes(m => m + 1), 60000)
    return () => clearInterval(interval)
  }, [ongoingSession])

  // Grouped sessions
  const grouped = useMemo(() => groupByDate(allSessions), [allSessions])
  const dateKeys = useMemo(() => Array.from(grouped.keys()), [grouped])

  // CSV export
  const exportCSV = useCallback(() => {
    const params = new URLSearchParams()
    params.set("format", "csv")
    if (guildFilter) params.set("guild", guildFilter)
    if (dateRange.from) params.set("dateFrom", dateRange.from)
    if (dateRange.to) params.set("dateTo", dateRange.to)
    if (typeFilter !== "all") params.set("type", typeFilter)
    window.open(`/api/dashboard/sessions?${params.toString()}`, "_blank")
    toast.success("Downloading CSV...")
  }, [guildFilter, dateRange, typeFilter])

  // Chart X-axis formatter
  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00Z")
    if (chartPeriod === "year") return d.toLocaleDateString(undefined, { month: "short" })
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  return (
    <Layout SEO={{ title: "Study History - LionBot Dashboard", description: "Your study session history" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-4xl space-y-5">

              {/* Page Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Study History</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  View your study sessions, track patterns, and export your data.
                </p>
              </div>

              {/* Ongoing Session Banner */}
              {ongoingSession && (
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Currently studying</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{ongoingSession.guildName}</span>
                        <span className="text-xs font-mono text-emerald-400">{formatDuration(liveMinutes)}</span>
                        {ongoingSession.isCamera && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><Camera size={10} /> Camera</span>
                        )}
                        {ongoingSession.isStream && (
                          <span className="flex items-center gap-0.5 text-[10px] text-purple-400"><Radio size={10} /> Stream</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <StatCard label="Sessions" value={String(stats.totalSessions)} icon={<History size={14} />} />
                  <StatCard label="Total Time" value={formatDuration(stats.totalMinutes)} icon={<Clock size={14} />} />
                  <StatCard label="Avg Session" value={formatDuration(stats.avgSessionMinutes)} icon={<TrendingUp size={14} />} />
                  <StatCard label="Longest" value={formatDuration(stats.longestSessionMinutes)} icon={<Star size={14} />} />
                  <StatCard label="Best Day" value={stats.mostActiveDay || "—"} icon={<Calendar size={14} />} />
                  <StatCard label="Servers" value={String(stats.uniqueServers)} icon={<Server size={14} />} />
                </div>
              )}

              {/* Activity Chart */}
              {chartData.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Study Activity</h3>
                    <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
                      {([
                        { key: "30d" as const, label: "30d" },
                        { key: "90d" as const, label: "90d" },
                        { key: "year" as const, label: "Year" },
                      ]).map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => setChartPeriod(opt.key)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                            chartPeriod === opt.key
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        interval={chartPeriod === "year" ? 29 : chartPeriod === "90d" ? 13 : 4}
                      />
                      <YAxis
                        tickFormatter={v => formatDuration(v)}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      <Bar dataKey="minutes" fill="url(#barGradient)" radius={[3, 3, 0, 0]} maxBarSize={chartPeriod === "year" ? 4 : 12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Filter Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {/* Date presets */}
                  <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
                    {([
                      { key: "week" as DatePreset, label: "Week" },
                      { key: "month" as DatePreset, label: "Month" },
                      { key: "3months" as DatePreset, label: "3 Mo" },
                      { key: "all" as DatePreset, label: "All" },
                    ]).map(p => (
                      <button
                        key={p.key}
                        onClick={() => setDatePreset(p.key)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                          datePreset === p.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Type filter */}
                  <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
                    {([
                      { key: "all" as SessionType, label: "All" },
                      { key: "voice" as SessionType, label: "Voice" },
                      { key: "camera" as SessionType, label: "Camera" },
                      { key: "stream" as SessionType, label: "Stream" },
                    ]).map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTypeFilter(t.key)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                          typeFilter === t.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Server filter */}
                  {servers.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1",
                          guildFilter
                            ? "bg-primary/15 text-primary font-medium"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Filter size={12} />
                        {guildFilter
                          ? servers.find(s => s.guildId === guildFilter)?.guildName || "Server"
                          : "Server"}
                        <ChevronDown size={10} className={cn("transition-transform", showFilters && "rotate-180")} />
                      </button>
                      {showFilters && (
                        <div className="absolute z-20 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] max-h-48 overflow-y-auto">
                          <button
                            onClick={() => { setGuildFilter(""); setShowFilters(false) }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors",
                              !guildFilter ? "text-primary font-medium" : "text-foreground"
                            )}
                          >
                            All Servers
                          </button>
                          {servers.map(s => (
                            <button
                              key={s.guildId}
                              onClick={() => { setGuildFilter(s.guildId); setShowFilters(false) }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors truncate",
                                guildFilter === s.guildId ? "text-primary font-medium" : "text-foreground"
                              )}
                            >
                              {s.guildName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clear filters */}
                  {(guildFilter || datePreset !== "all" || typeFilter !== "all") && (
                    <button
                      onClick={() => { setGuildFilter(""); setDatePreset("all"); setTypeFilter("all") }}
                      className="px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                    >
                      <X size={10} /> Clear
                    </button>
                  )}
                </div>

                {/* Export CSV */}
                <button
                  onClick={exportCSV}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <Download size={12} />
                  Export CSV
                </button>
              </div>

              {/* Session List */}
              {loading && page === 1 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded w-1/3" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                        <div className="h-4 bg-muted rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allSessions.length === 0 ? (
                <EmptyState
                  icon={<History size={48} strokeWidth={1} className="text-muted-foreground" />}
                  title={datePreset !== "all" || guildFilter || typeFilter !== "all"
                    ? "No sessions match your filters"
                    : "No study sessions recorded yet"}
                  description={datePreset !== "all" || guildFilter || typeFilter !== "all"
                    ? "Try a different date range, server, or session type."
                    : "Join a voice channel in a LionBot server to start tracking!"}
                />
              ) : (
                <div className="space-y-1">
                  {dateKeys.map(dateKey => {
                    const daySessions = grouped.get(dateKey)!
                    const dayTotal = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0)
                    return (
                      <div key={dateKey}>
                        {/* Date Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-sm border-l-2 border-primary/30 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{formatDateHeader(dateKey)}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {daySessions.length} session{daySessions.length !== 1 ? "s" : ""} &middot; {formatDuration(dayTotal)}
                          </span>
                        </div>

                        {/* Sessions for this day */}
                        <div className="space-y-0.5">
                          {daySessions.map(s => {
                            const type = getSessionType(s)
                            const isExpanded = expandedId === s.id
                            return (
                              <div key={s.id}>
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                  className="w-full text-left group"
                                >
                                  <div className={cn(
                                    "flex items-center gap-3 rounded-lg p-3 transition-colors",
                                    "hover:bg-muted/20",
                                    isExpanded && "bg-muted/20"
                                  )}>
                                    {/* Type Icon */}
                                    <div className={cn(
                                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                                      type === "camera" ? "bg-emerald-500/15 text-emerald-400"
                                        : type === "stream" ? "bg-purple-500/15 text-purple-400"
                                        : "bg-primary/15 text-primary"
                                    )}>
                                      {type === "camera" ? <Camera size={16} />
                                        : type === "stream" ? <Radio size={16} />
                                        : <Headphones size={16} />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground truncate">{s.guildName}</span>
                                        {s.tag && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-300">{s.tag}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">{timeStr(s.startTime)}</span>
                                    </div>

                                    {/* Duration + Rating */}
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-semibold text-foreground tabular-nums">{formatDuration(s.durationMinutes)}</p>
                                      {s.rating && s.rating > 0 && (
                                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                                          {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} size={8} className={i < s.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"} />
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <ChevronDown size={14} className={cn(
                                      "text-muted-foreground/40 transition-transform flex-shrink-0",
                                      isExpanded && "rotate-180"
                                    )} />
                                  </div>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                  <div className="ml-12 mr-3 mb-2 p-3 bg-muted/10 rounded-lg border border-border/50 space-y-3 animate-in slide-in-from-top-1">
                                    {/* Time breakdown bar */}
                                    {s.durationMinutes > 0 && (
                                      <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Session Breakdown</p>
                                        <div className="h-2.5 rounded-full overflow-hidden flex bg-muted/30">
                                          {(() => {
                                            const total = s.durationMinutes
                                            const cam = s.cameraDurationMinutes
                                            const str = s.streamDurationMinutes
                                            const voiceOnly = Math.max(0, total - cam - str)
                                            return (
                                              <>
                                                {voiceOnly > 0 && (
                                                  <div className="bg-primary/60 h-full" style={{ width: `${(voiceOnly / total) * 100}%` }} />
                                                )}
                                                {cam > 0 && (
                                                  <div className="bg-emerald-500/60 h-full" style={{ width: `${(cam / total) * 100}%` }} />
                                                )}
                                                {str > 0 && (
                                                  <div className="bg-purple-500/60 h-full" style={{ width: `${(str / total) * 100}%` }} />
                                                )}
                                              </>
                                            )
                                          })()}
                                        </div>
                                      </div>
                                    )}
                                    {/* Duration details */}
                                    <div className="flex gap-4 flex-wrap text-xs">
                                      <span className="flex items-center gap-1 text-primary">
                                        <Headphones size={10} /> Voice: {formatDuration(Math.max(0, s.durationMinutes - s.cameraDurationMinutes - s.streamDurationMinutes))}
                                      </span>
                                      {s.cameraDurationMinutes > 0 && (
                                        <span className="flex items-center gap-1 text-emerald-400">
                                          <Camera size={10} /> Camera: {formatDuration(s.cameraDurationMinutes)}
                                        </span>
                                      )}
                                      {s.streamDurationMinutes > 0 && (
                                        <span className="flex items-center gap-1 text-purple-400">
                                          <Radio size={10} /> Stream: {formatDuration(s.streamDurationMinutes)}
                                        </span>
                                      )}
                                    </div>
                                    {/* Full timestamp */}
                                    <p className="text-[10px] text-muted-foreground/60">
                                      {new Date(s.startTime).toLocaleString(undefined, {
                                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* Infinite scroll sentinel */}
                  {hasMore && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity size={14} className="animate-pulse" />
                        Loading more...
                      </div>
                    </div>
                  )}

                  {/* End message */}
                  {!hasMore && allSessions.length > 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground/50">
                        You&apos;ve seen all {sessionsData?.pagination.total ?? allSessions.length} sessions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

// --- Stat Card ---

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
