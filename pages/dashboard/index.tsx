// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Member dashboard overview - rich analytics with stats, charts, streaks, achievements
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: rebuilt with stats API, study chart, streak calendar, achievements, quick links
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { PageHeader, Badge } from "@/components/dashboard/ui"
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
  ThumbsUp,
} from "lucide-react"

interface MeData {
  user: {
    id: string
    name: string | null
    gems: number | null
    firstSeen: string | null
  }
  stats: { totalStudyTimeHours: number; serverCount: number }
}

interface StatsData {
  studyTime: {
    todayMinutes: number
    thisWeekMinutes: number
    thisMonthMinutes: number
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

const quickLinks = [
  { href: "/dashboard/servers", label: "Servers", icon: Server },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/inventory", label: "Skins", icon: Palette },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export default function Dashboard() {
  const { data: session } = useSession()
  const { data: meData, error: meError, isLoading: meLoading } = useDashboard<MeData>(
    session ? "/api/dashboard/me" : null
  )
  const { data: stats, error: statsError, isLoading: statsLoading } = useDashboard<StatsData>(
    session ? "/api/dashboard/stats" : null
  )

  const loading = meLoading || statsLoading
  const error = meError?.message ?? statsError?.message
  const displayName = meData?.user.name || session?.user?.name || "Studier"

  return (
    <Layout SEO={{ title: "Dashboard - LionBot", description: "Your LionBot study statistics" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-6">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-64" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="h-80 rounded-lg" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                  </div>
                </>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <>
                  <PageHeader
                    title={displayName}
                    description="Your study stats and analytics"
                    actions={
                      <span className="flex items-center gap-2 text-amber-400 font-medium">
                        <Gem size={18} />
                        {meData?.user.gems ?? 0} Gems
                      </span>
                    }
                  />

                  {/* Hero Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border bg-card">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Today</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {formatMinutes(stats?.studyTime.todayMinutes ?? 0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">This Week</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {formatMinutes(stats?.studyTime.thisWeekMinutes ?? 0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {formatMinutes(stats?.studyTime.thisMonthMinutes ?? 0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardContent className="pt-6">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">All Time</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {formatMinutes(stats?.studyTime.allTimeMinutes ?? 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Study Time Chart */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-foreground">Study Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.dailyStudy ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            />
                            <YAxis
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                              tickFormatter={(v) => `${v}m`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "hsl(var(--foreground))" }}
                              formatter={(value: number) => [`${value}m`, "Study time"]}
                              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                            />
                            <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Streak Calendar + Achievements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Streak Calendar */}
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-foreground">Streak Calendar</CardTitle>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Current: <strong className="text-foreground">{stats?.streaks.currentStreak ?? 0}</strong> days</span>
                          <span>Longest: <strong className="text-foreground">{stats?.streaks.longestStreak ?? 0}</strong> days</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <StreakCalendar activeDays={stats?.streaks.activeDays ?? []} />
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-foreground">Achievements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(stats?.achievements ?? []).map((a) => {
                          const Icon = ACHIEVEMENT_ICONS[a.id] ?? Clock
                          const pct = a.target > 0 ? Math.min(100, (a.current / a.target) * 100) : 0
                          return (
                            <div key={a.id} className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg flex-shrink-0",
                                a.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-sm">
                                  <span className="text-foreground font-medium">{a.label}</span>
                                  <span className="text-muted-foreground">{a.current} / {a.target}</span>
                                </div>
                                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      a.unlocked ? "bg-primary" : "bg-primary/60"
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

                  {/* Quick Links */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickLinks.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}>
                        <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <Icon size={18} className="text-foreground/80" />
                          </div>
                          <span className="font-medium text-foreground">{label}</span>
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

function StreakCalendar({ activeDays }: { activeDays: string[] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
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
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded flex items-center justify-center text-xs font-medium",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
