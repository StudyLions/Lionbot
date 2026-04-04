// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-04
// Purpose: Member-facing scheduled sessions page with visual
//          calendar, upcoming sessions, personal stats, and
//          iCal sync across all servers
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { EmptyState, toast, DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useMemo, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import TabBar from "@/components/dashboard/ui/TabBar"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  Calendar, Clock, Trophy, Flame, Server, ChevronLeft, ChevronRight,
  Copy, ExternalLink, Check, CalendarPlus, TrendingUp, Coins,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface CalendarSession {
  slotid: number
  slotTime: string
  guildId: string
  guildName: string
  guildIcon: string | null
  attended: boolean
  clock: number
  bookedAt: string
  isClosed: boolean
  isUpcoming: boolean
}

interface UpcomingSession {
  slotid: number
  slotTime: string
  guildId: string
  guildName: string
  guildIcon: string | null
  bookedAt: string
  cost: number
  isLive: boolean
}

interface StatsData {
  summary: {
    totalBooked: number
    totalAttended: number
    attendanceRate: number
    totalClockSeconds: number
    coinsSpent: number
    coinsEarned: number
    currentStreak: number
    bestStreak: number
  }
  perServer: Array<{
    guildId: string
    guildName: string
    guildIcon: string | null
    totalBooked: number
    totalAttended: number
    attendanceRate: number
  }>
  monthlyTrend: Array<{ month: string; booked: number; attended: number }>
}

const TABS = [
  { key: "calendar", label: "Calendar" },
  { key: "upcoming", label: "Upcoming" },
  { key: "stats", label: "Stats" },
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const days: Array<{ date: Date; inMonth: boolean }> = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, inMonth: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), inMonth: true })
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false })
    }
  }
  return days
}

function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ScheduledSessionsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState("calendar")
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [icalCopied, setIcalCopied] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const fromDate = new Date(year, month - 1, 1)
  const toDate = new Date(year, month + 2, 0)

  const { data: calendarData, isLoading: calLoading } = useDashboard<{
    sessions: CalendarSession[]
    timezone: string | null
  }>(
    session && tab === "calendar"
      ? `/api/dashboard/scheduled-sessions?mode=calendar&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      : null
  )

  const { data: upcomingData, isLoading: upLoading } = useDashboard<{
    sessions: UpcomingSession[]
  }>(
    session && tab === "upcoming"
      ? "/api/dashboard/scheduled-sessions?mode=upcoming"
      : null
  )

  const { data: statsData, isLoading: statsLoading } = useDashboard<StatsData>(
    session && tab === "stats"
      ? "/api/dashboard/scheduled-sessions?mode=stats"
      : null
  )

  const { data: icalData } = useDashboard<{ icalUrl: string }>(
    session ? "/api/dashboard/scheduled-sessions/token" : null
  )

  const sessionsByDay = useMemo(() => {
    if (!calendarData?.sessions) return new Map<string, CalendarSession[]>()
    const map = new Map<string, CalendarSession[]>()
    for (const s of calendarData.sessions) {
      const d = new Date(s.slotTime)
      const key = dateKey(d)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [calendarData?.sessions])

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month])

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }, [year, month])

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }, [year, month])

  const todayKey = dateKey(new Date())

  const copyIcalUrl = useCallback(async () => {
    if (!icalData?.icalUrl) return
    try {
      await navigator.clipboard.writeText(icalData.icalUrl)
      setIcalCopied(true)
      toast.success("Calendar link copied!")
      setTimeout(() => setIcalCopied(false), 3000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [icalData?.icalUrl])

  const upcomingByDay = useMemo(() => {
    if (!upcomingData?.sessions) return new Map<string, UpcomingSession[]>()
    const map = new Map<string, UpcomingSession[]>()
    for (const s of upcomingData.sessions) {
      const key = formatDate(s.slotTime)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [upcomingData?.sessions])

  return (
    <Layout SEO={{ title: "Scheduled Sessions", description: "Your study session calendar" }}>
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />}>
          <PageHeader
            title="Scheduled Sessions"
            description="Track your booked study sessions across all servers"
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Scheduled Sessions" },
            ]}
            actions={
              icalData?.icalUrl ? (
                <button
                  onClick={copyIcalUrl}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    "border border-border hover:border-primary/40",
                    icalCopied
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {icalCopied ? <Check size={13} /> : <CalendarPlus size={13} />}
                  {icalCopied ? "Copied!" : "Sync to Calendar"}
                </button>
              ) : undefined
            }
          />

          <TabBar tabs={TABS} active={tab} onChange={setTab} />

          {/* --- Calendar Tab --- */}
          {tab === "calendar" && (
            <div className="space-y-4">
              {calLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-[340px] w-full rounded-xl" />
                </div>
              ) : (
                <>
                  {/* Month nav */}
                  <div className="flex items-center justify-between px-1">
                    <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <ChevronLeft size={18} className="text-muted-foreground" />
                    </button>
                    <h3 className="text-sm font-semibold text-foreground">
                      {viewDate.toLocaleDateString([], { month: "long", year: "numeric" })}
                    </h3>
                    <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Calendar grid */}
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-7">
                      {WEEKDAYS.map((d) => (
                        <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 border-t border-border/50">
                      {monthDays.map(({ date, inMonth }, i) => {
                        const key = dateKey(date)
                        const daySessions = sessionsByDay.get(key) || []
                        const isToday = key === todayKey
                        const isSelected = key === selectedDay
                        const hasAttended = daySessions.some((s) => s.attended && s.isClosed)
                        const hasMissed = daySessions.some((s) => !s.attended && s.isClosed)
                        const hasUpcoming = daySessions.some((s) => s.isUpcoming)

                        return (
                          <button
                            key={i}
                            onClick={() => daySessions.length > 0 ? setSelectedDay(isSelected ? null : key) : undefined}
                            className={cn(
                              "relative min-h-[52px] p-1.5 border-b border-r border-border/30 transition-colors text-left",
                              inMonth ? "bg-card" : "bg-muted/30",
                              daySessions.length > 0 && "cursor-pointer hover:bg-accent/50",
                              isSelected && "bg-primary/10 ring-1 ring-primary/30",
                            )}
                          >
                            <span className={cn(
                              "text-xs tabular-nums",
                              !inMonth && "text-muted-foreground/30",
                              isToday && "text-primary font-bold",
                              inMonth && !isToday && "text-foreground/70",
                            )}>
                              {date.getDate()}
                            </span>
                            {daySessions.length > 0 && (
                              <div className="flex gap-0.5 mt-1 flex-wrap">
                                {hasAttended && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                {hasMissed && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                {hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                {daySessions.length > 1 && (
                                  <span className="text-[8px] text-muted-foreground/60 ml-0.5">{daySessions.length}</span>
                                )}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 px-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Attended</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Missed</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Upcoming</span>
                    {calendarData?.timezone && (
                      <span className="ml-auto text-muted-foreground/40">Timezone: {calendarData.timezone}</span>
                    )}
                  </div>

                  {/* Expanded day detail */}
                  {selectedDay && sessionsByDay.has(selectedDay) && (
                    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {new Date(selectedDay + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                      </h4>
                      {sessionsByDay.get(selectedDay)!
                        .sort((a, b) => a.slotid - b.slotid)
                        .map((s) => (
                          <div key={`${s.guildId}-${s.slotid}`} className="flex items-center gap-3 py-2 border-t border-border/30 first:border-0">
                            {s.guildIcon ? (
                              <img src={s.guildIcon} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Server size={12} className="text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{s.guildName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatTime(s.slotTime)} — {formatTime(new Date(new Date(s.slotTime).getTime() + 3600000).toISOString())}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {s.isClosed && s.clock > 0 && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock size={10} /> {formatClock(s.clock)}
                                </span>
                              )}
                              <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                s.isUpcoming && "bg-blue-500/15 text-blue-400",
                                s.isClosed && s.attended && "bg-emerald-500/15 text-emerald-400",
                                s.isClosed && !s.attended && "bg-red-500/15 text-red-400",
                              )}>
                                {s.isUpcoming ? "Booked" : s.attended ? "Attended" : "Missed"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {calendarData?.sessions.length === 0 && (
                    <EmptyState
                      icon={<Calendar size={32} />}
                      title="No sessions found"
                      description="Book a scheduled session in any server to see it here."
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* --- Upcoming Tab --- */}
          {tab === "upcoming" && (
            <div className="space-y-4">
              {upLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : !upcomingData?.sessions?.length ? (
                <EmptyState
                  icon={<Calendar size={32} />}
                  title="No upcoming sessions"
                  description="Book a session using /schedule in any server."
                />
              ) : (
                <>
                  {Array.from(upcomingByDay.entries()).map(([day, sessions]) => (
                    <div key={day}>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-1">{day}</h4>
                      <div className="space-y-2">
                        {sessions.map((s) => {
                          const start = new Date(s.slotTime)
                          const end = new Date(start.getTime() + 3600000)
                          const diffMs = start.getTime() - Date.now()
                          const diffH = Math.floor(diffMs / 3600000)
                          const diffM = Math.floor((diffMs % 3600000) / 60000)
                          const untilStr = diffMs < 0
                            ? "Live now"
                            : diffH > 0
                              ? `in ${diffH}h ${diffM}m`
                              : `in ${diffM}m`

                          return (
                            <div key={`${s.guildId}-${s.slotid}`} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                              {s.guildIcon ? (
                                <img src={s.guildIcon} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <Server size={14} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{s.guildName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(s.slotTime)} — {formatTime(end.toISOString())}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={cn(
                                  "text-xs font-medium",
                                  s.isLive ? "text-emerald-400" : "text-blue-400"
                                )}>
                                  {untilStr}
                                </p>
                                {s.cost > 0 && (
                                  <p className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5 justify-end">
                                    <Coins size={9} /> {s.cost}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* --- Stats Tab --- */}
          {tab === "stats" && (
            <div className="space-y-4">
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                  </div>
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              ) : !statsData?.summary ? (
                <EmptyState
                  icon={<TrendingUp size={32} />}
                  title="No stats yet"
                  description="Complete some scheduled sessions to see your stats."
                />
              ) : (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatCard
                      label="Attended"
                      value={`${statsData.summary.totalAttended} / ${statsData.summary.totalBooked}`}
                      icon={<Trophy size={12} />}
                    />
                    <StatCard
                      label="Attendance Rate"
                      value={`${statsData.summary.attendanceRate}%`}
                      icon={<TrendingUp size={12} />}
                    />
                    <StatCard
                      label="Current Streak"
                      value={String(statsData.summary.currentStreak)}
                      icon={<Flame size={12} />}
                      sub={`Best: ${statsData.summary.bestStreak}`}
                    />
                    <StatCard
                      label="Total Study Time"
                      value={formatClock(statsData.summary.totalClockSeconds)}
                      icon={<Clock size={12} />}
                    />
                  </div>

                  {/* Coin flow */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card rounded-xl border border-border p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Coins Spent (Bookings)</p>
                      <p className="text-lg font-bold text-red-400 flex items-center gap-1">
                        <Coins size={14} /> {statsData.summary.coinsSpent.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Coins Earned (Rewards)</p>
                      <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                        <Coins size={14} /> {statsData.summary.coinsEarned.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Monthly trend */}
                  {statsData.monthlyTrend.length > 1 && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Monthly Trend</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={statsData.monthlyTrend} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v: string) => v.slice(5)}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            width={30}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="booked" name="Booked" fill="hsl(var(--primary) / 0.3)" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="attended" name="Attended" fill="hsl(142 71% 45%)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Per-server breakdown */}
                  {statsData.perServer.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Per Server</h4>
                      <div className="space-y-2">
                        {statsData.perServer.map((s) => (
                          <div key={s.guildId} className="flex items-center gap-3 py-1.5">
                            {s.guildIcon ? (
                              <img src={s.guildIcon} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Server size={10} className="text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-xs font-medium text-foreground flex-1 truncate">{s.guildName}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {s.totalAttended}/{s.totalBooked}
                            </span>
                            <span className={cn(
                              "text-[10px] font-medium tabular-nums min-w-[36px] text-right",
                              s.attendanceRate >= 80 ? "text-emerald-400" : s.attendanceRate >= 50 ? "text-amber-400" : "text-red-400",
                            )}>
                              {s.attendanceRate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
