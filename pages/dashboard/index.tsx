// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Member dashboard overview - rich analytics with stats, charts, streaks, achievements
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign with hero greeting, trend stats, weekly insights, activity feed,
//          server cards, rank progress, gems CTA, improved chart and achievements
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  Clock,
  Server,
  Calendar,
  CheckSquare,
  History,
  Bell,
  Palette,
  User,
  Gem,
  Flame,
  CalendarDays,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  ChevronRight,
  Trophy,
  Heart,
  Sun,
  CalendarRange,
  Shield,
  Crown,
  Check,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useMemo, useEffect } from "react"
import { useRouter } from "next/router"

// --- Types ---

interface MeData {
  user: {
    id: string
    name: string | null
    gems: number | null
    firstSeen: string | null
    lastSeen: string | null
    timezone: string | null
    locale: string | null
  }
  stats: { totalStudyTimeHours: number; serverCount: number }
  recentSessions: Array<{
    id: number
    guildId: string
    guildName: string | null
    startTime: string
    durationMinutes: number
    liveDurationMinutes: number
    videoDurationMinutes: number
    streamDurationMinutes: number
    tag: string | null
    rating: number | null
  }>
}

interface StatsData {
  studyTime: {
    todayMinutes: number
    yesterdayMinutes: number
    thisWeekMinutes: number
    lastWeekMinutes: number
    thisMonthMinutes: number
    lastMonthMinutes: number
    allTimeMinutes: number
  }
  dailyStudy: Array<{ date: string; minutes: number }>
  streaks: {
    currentStreak: number
    longestStreak: number
    activeDays: string[]
  }
  achievements: Array<{
    id: string
    label: string
    current: number
    target: number
    unlocked: boolean
  }>
  voteCount: number
}

interface PomodoroStats {
  totalSessions: number
  totalFocusMinutes: number
  todayMinutes: number
  weekMinutes: number
  currentStreak: number
}

interface ServerItem {
  guildId: string
  guildName: string
  trackedTimeHours: number
  trackedTimeSeconds: number
  coins: number
  role: "admin" | "moderator" | "member"
  iconUrl: string | null
  botPresent: boolean
}

interface RankEntry {
  guildId: string
  guildName: string
  guildIcon: string | null
  rankType: string
  currentValue: number
  currentRankRole: string | null
  currentRankRequired: number
  nextRankRole: string | null
  nextRankRequired: number | null
  progress: number
}

// --- Helpers ---

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  VoiceHours: Clock,
  VoiceStreak: Flame,
  VoiceDays: CalendarDays,
  Workout: Dumbbell,
  TasksComplete: CheckSquare,
  ScheduledSessions: Calendar,
  MonthlyHours: TrendingUp,
  Voting: ThumbsUp,
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  return `${Math.round(hours * 10) / 10}h`
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return "Good night"
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function getTrend(current: number, previous: number): { pct: number; direction: "up" | "down" | "flat" } {
  if (previous === 0 && current === 0) return { pct: 0, direction: "flat" }
  if (previous === 0) return { pct: 100, direction: "up" }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct > 0) return { pct, direction: "up" }
  if (pct < 0) return { pct: Math.abs(pct), direction: "down" }
  return { pct: 0, direction: "flat" }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

function formatRankValue(value: number, rankType: string): string {
  if (rankType === "VOICE") return formatMinutes(Math.round(value / 60))
  return value.toLocaleString()
}

const quickLinks = [
  { href: "/dashboard/servers", label: "Servers", icon: Server },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/inventory", label: "Skins", icon: Palette },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

// --- Stat Card ---

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string
  value: string
  icon: React.ElementType
  trend?: { pct: number; direction: "up" | "down" | "flat" }
}) {
  return (
    <Card className="border-border bg-card hover:shadow-md hover:border-primary/20 transition-all group">
      <CardContent className="pt-5 pb-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <Icon size={14} />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && trend.direction !== "flat" && (
          <div className={cn(
            "flex items-center gap-1 mt-1.5 text-xs font-medium",
            trend.direction === "up" ? "text-emerald-400" : "text-red-400"
          )}>
            {trend.direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trend.pct}% vs prev</span>
          </div>
        )}
        {trend && trend.direction === "flat" && (
          <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-muted-foreground">
            <Minus size={12} />
            <span>no change</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Streak Calendar ---

function StreakCalendar({ activeDays }: { activeDays: string[] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const todayDate = now.getDate()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const days: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  while (days.length < totalCells) days.push(null)

  const activeSet = new Set(activeDays)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground font-medium">
        {weekDays.map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
          const isActive = activeSet.has(dateStr)
          const isToday = d === todayDate
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                isActive && isToday && "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
                isActive && !isToday && "bg-primary/80 text-primary-foreground",
                !isActive && isToday && "bg-muted text-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-background",
                !isActive && !isToday && "bg-muted/50 text-muted-foreground"
              )}
            >
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Weekly Insight ---

function WeeklyInsight({ stats, pomStats }: { stats: StatsData; pomStats: PomodoroStats | null }) {
  const insights = useMemo(() => {
    const list: { text: string; icon: React.ElementType }[] = []
    const weekDiff = stats.studyTime.thisWeekMinutes - stats.studyTime.lastWeekMinutes
    if (weekDiff > 0) {
      list.push({
        text: `You studied ${formatMinutes(weekDiff)} more this week than last week!`,
        icon: TrendingUp,
      })
    } else if (weekDiff < 0) {
      list.push({
        text: `You studied ${formatMinutes(Math.abs(weekDiff))} less this week than last week. You got this!`,
        icon: Lightbulb,
      })
    }
    if (stats.streaks.currentStreak >= 2) {
      list.push({
        text: `You're on a ${stats.streaks.currentStreak}-day streak -- keep it going!`,
        icon: Flame,
      })
    }
    if (pomStats && pomStats.totalSessions > 0) {
      list.push({
        text: `${pomStats.totalSessions} pomodoro sessions completed. ${pomStats.currentStreak > 1 ? `${pomStats.currentStreak}-day focus streak!` : ""}`,
        icon: Timer,
      })
    }
    const nearComplete = stats.achievements.find(a => !a.unlocked && a.current / a.target >= 0.8)
    if (nearComplete) {
      list.push({
        text: `Almost there! "${nearComplete.label}" is ${Math.round((nearComplete.current / nearComplete.target) * 100)}% complete.`,
        icon: Trophy,
      })
    }
    if (list.length === 0) {
      list.push({
        text: "Start a study session to see your weekly insights here!",
        icon: Lightbulb,
      })
    }
    return list
  }, [stats, pomStats])

  const insight = insights[0]
  const InsightIcon = insight.icon

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/15 text-primary flex-shrink-0">
          <InsightIcon size={18} />
        </div>
        <p className="text-sm text-foreground font-medium">{insight.text}</p>
      </div>
      {insights.length > 1 && (
        <div className="flex gap-1 mt-3 ml-11">
          {insights.slice(1, 3).map((ins, i) => (
            <span key={i} className="text-xs text-muted-foreground">{ins.text}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Custom chart tooltip ---

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">
        {new Date(label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      </p>
      <p className="text-sm font-semibold text-foreground">{formatMinutes(payload[0].value)}</p>
    </div>
  )
}

// --- Main Component ---

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: meData, error: meError, isLoading: meLoading } = useDashboard<MeData>(
    session ? "/api/dashboard/me" : null
  )
  const { data: stats, error: statsError, isLoading: statsLoading } = useDashboard<StatsData>(
    session ? "/api/dashboard/stats" : null
  )
  const { data: pomStats } = useDashboard<PomodoroStats>(
    session ? "/api/dashboard/pomodoro-stats" : null
  )
  const { data: serversData } = useDashboard<{ servers: ServerItem[] }>(
    session ? "/api/dashboard/servers" : null
  )
  const { data: rankData } = useDashboard<{ ranks: RankEntry[] }>(
    session ? "/api/dashboard/rank-summary" : null
  )
  const { data: gemsData } = useDashboard<{ gemBalance: number }>(
    session ? "/api/dashboard/gems" : null
  )
  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: auto-redirect to live session page when user has an active voice session
  const { data: liveData } = useDashboard<{ active: boolean }>(
    session ? "/api/dashboard/live-session" : null
  )
  useEffect(() => {
    if (liveData?.active && !sessionStorage.getItem("dismissed-session-redirect")) {
      router.replace("/dashboard/session")
    }
    if (liveData && !liveData.active) {
      sessionStorage.removeItem("dismissed-session-redirect")
    }
  }, [liveData, router])
  // --- END AI-MODIFIED ---

  const loading = meLoading || statsLoading
  const error = meError?.message ?? statsError?.message
  const displayName = meData?.user.name || session?.user?.name || "Studier"
  const servers = serversData?.servers ?? []
  const ranks = rankData?.ranks ?? []

  const todayTrend = stats ? getTrend(stats.studyTime.todayMinutes, stats.studyTime.yesterdayMinutes) : undefined
  const weekTrend = stats ? getTrend(stats.studyTime.thisWeekMinutes, stats.studyTime.lastWeekMinutes) : undefined
  const monthTrend = stats ? getTrend(stats.studyTime.thisMonthMinutes, stats.studyTime.lastMonthMinutes) : undefined

  return (
    <Layout SEO={{ title: "Dashboard - LionBot", description: "Your LionBot study statistics" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-6">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <>
                  {/* Hero Greeting */}
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {getGreeting()}, {displayName}!
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm text-muted-foreground">
                        {stats && stats.studyTime.todayMinutes > 0
                          ? `You've studied ${formatMinutes(stats.studyTime.todayMinutes)} today`
                          : "Ready to start studying?"}
                      </p>
                      {stats && stats.streaks.currentStreak > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium">
                          <Flame size={12} />
                          {stats.streaks.currentStreak}-day streak
                        </span>
                      )}
                      {meData?.user.firstSeen && (
                        <span className="text-xs text-muted-foreground/60">
                          Member since {new Date(meData.user.firstSeen).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                      label="Today"
                      value={formatMinutes(stats?.studyTime.todayMinutes ?? 0)}
                      icon={Sun}
                      trend={todayTrend}
                    />
                    <StatCard
                      label="This Week"
                      value={formatMinutes(stats?.studyTime.thisWeekMinutes ?? 0)}
                      icon={Calendar}
                      trend={weekTrend}
                    />
                    <StatCard
                      label="This Month"
                      value={formatMinutes(stats?.studyTime.thisMonthMinutes ?? 0)}
                      icon={CalendarRange}
                      trend={monthTrend}
                    />
                    <StatCard
                      label="All Time"
                      value={formatMinutes(stats?.studyTime.allTimeMinutes ?? 0)}
                      icon={Clock}
                    />
                  </div>

                  {/* Weekly Insight */}
                  {stats && <WeeklyInsight stats={stats} pomStats={pomStats ?? null} />}

                  {/* Study Activity Chart */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-foreground text-base">Study Activity</CardTitle>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.dailyStudy ?? []} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                            <defs>
                              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                              tickFormatter={(v) => `${v}m`}
                              width={40}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                            <Bar dataKey="minutes" fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Streak Calendar + Achievements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-foreground text-base">Streak Calendar</CardTitle>
                          {stats && stats.streaks.currentStreak > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-orange-400">
                              <Flame size={14} />
                              {stats.streaks.currentStreak}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Current: <strong className="text-foreground">{stats?.streaks.currentStreak ?? 0}</strong></span>
                          <span>Longest: <strong className="text-foreground">{stats?.streaks.longestStreak ?? 0}</strong></span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <StreakCalendar activeDays={stats?.streaks.activeDays ?? []} />
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-base">Achievements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(stats?.achievements ?? []).map((a) => {
                          const Icon = ACHIEVEMENT_ICONS[a.id] ?? Clock
                          const pct = a.target > 0 ? Math.min(100, (a.current / a.target) * 100) : 0
                          return (
                            <div key={a.id} className="flex items-center gap-3">
                              <div className={cn(
                                "p-1.5 rounded-md flex-shrink-0",
                                a.unlocked ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                              )}>
                                {a.unlocked ? <Check size={14} /> : <Icon size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-xs">
                                  <span className={cn("font-medium", a.unlocked ? "text-amber-400" : "text-foreground")}>{a.label}</span>
                                  <span className="text-muted-foreground">{a.current} / {a.target}</span>
                                </div>
                                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      a.unlocked ? "bg-amber-400" : "bg-primary/70"
                                    )}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pomodoro Focus (if data) */}
                  {pomStats && pomStats.totalSessions > 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="pt-5 pb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Timer size={16} className="text-primary" />
                          Pomodoro Focus
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xl font-bold text-foreground">{Math.round(pomStats.todayMinutes)}m</p>
                            <p className="text-xs text-muted-foreground">today</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{pomStats.totalSessions}</p>
                            <p className="text-xs text-muted-foreground">sessions</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{Math.round(pomStats.weekMinutes / 60 * 10) / 10}h</p>
                            <p className="text-xs text-muted-foreground">this week</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{pomStats.currentStreak}</p>
                            <p className="text-xs text-muted-foreground">day streak</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Activity + Server Quick Access */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Activity */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-foreground text-base">Recent Activity</CardTitle>
                          <Link href="/dashboard/history">
                            <a className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5">
                              View all <ChevronRight size={12} />
                            </a>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {(!meData?.recentSessions || meData.recentSessions.length === 0) ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No recent sessions. Start studying in any voice channel!
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {meData.recentSessions.slice(0, 5).map((s) => {
                              const serverMatch = servers.find(sv => sv.guildId === s.guildId)
                              const hasVideo = s.videoDurationMinutes > 0
                              const hasStream = s.streamDurationMinutes > 0
                              return (
                                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                  {serverMatch?.iconUrl ? (
                                    <img src={serverMatch.iconUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                      <Server size={14} className="text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {s.guildName || serverMatch?.guildName || "Unknown Server"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{formatMinutes(s.durationMinutes)}</span>
                                      {hasVideo && (
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-medium">Video</span>
                                      )}
                                      {hasStream && (
                                        <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[10px] font-medium">Stream</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                                    {timeAgo(s.startTime)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Server Quick Access */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-foreground text-base">Your Servers</CardTitle>
                          <Link href="/dashboard/servers">
                            <a className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5">
                              View all <ChevronRight size={12} />
                            </a>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {servers.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No servers found. Join a server with LionBot!
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {servers.slice(0, 4).map((sv) => {
                              const href = (sv.role === "admin" || sv.role === "moderator")
                                ? `/dashboard/servers/${sv.guildId}`
                                : "/dashboard/servers"
                              return (
                                <Link key={sv.guildId} href={href}>
                                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                    {sv.iconUrl ? (
                                      <img src={sv.iconUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Server size={14} className="text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{sv.guildName}</p>
                                      <p className="text-xs text-muted-foreground">{formatHours(sv.trackedTimeHours)} studied</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {sv.role === "admin" && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium flex items-center gap-0.5">
                                          <Crown size={10} /> Admin
                                        </span>
                                      )}
                                      {sv.role === "moderator" && (
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-medium flex items-center gap-0.5">
                                          <Shield size={10} /> Mod
                                        </span>
                                      )}
                                      <ChevronRight size={14} className="text-muted-foreground/40" />
                                    </div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rank Progress */}
                  {ranks.length > 0 && (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-base flex items-center gap-2">
                          <Trophy size={16} className="text-amber-400" />
                          Rank Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {ranks.slice(0, 2).map((r) => (
                          <div key={r.guildId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {r.guildIcon ? (
                                  <img src={r.guildIcon} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                  <Server size={14} className="text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium text-foreground">{r.guildName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  {r.rankType}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatRankValue(r.currentValue, r.rankType)}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${r.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{r.progress}% to next rank</span>
                              {r.nextRankRequired != null && (
                                <span>{formatRankValue(r.nextRankRequired - r.currentValue, r.rankType)} remaining</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Gems / Supporter CTA */}
                  <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-orange-500/5 p-5">
                    <div className="flex items-start gap-4 sm:flex-col">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 flex-shrink-0">
                        <Heart size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">Support LionBot</h3>
                          {gemsData && (
                            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                              <Gem size={12} />
                              {gemsData.gemBalance.toLocaleString()} gems
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                          LionBot is free and open source. LionGems help keep the project running and unlock cosmetic perks like custom skins and server branding.
                        </p>
                      </div>
                      <Link href="/dashboard/gems">
                        <a className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-sm font-medium transition-colors cursor-pointer">
                          <Gem size={14} />
                          Get Gems
                        </a>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {quickLinks.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}>
                        <div className="bg-card rounded-xl p-3.5 border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group">
                          <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Icon size={16} className="text-foreground/70 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="font-medium text-sm text-foreground">{label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

// --- Loading Skeleton ---

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-56 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
