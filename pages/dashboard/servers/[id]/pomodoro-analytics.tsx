// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-18
// Purpose: Premium pomodoro analytics dashboard - streaks,
//          focus power leaderboard, milestones, and advanced stats
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, SectionCard, EmptyState } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { Trophy, Zap, Award, TrendingUp, Clock, Flame } from "lucide-react"

// ---- Types ----

interface AnalyticsData {
  streakLeaderboard: Array<{
    userid: string
    name: string | null
    avatar_url: string
    current_daily_streak: number
    longest_daily_streak: number
    total_cycles_completed: number
    focus_power: number
  }>
  focusPowerLeaderboard: Array<{
    userid: string
    name: string | null
    avatar_url: string
    focus_power: number
    total_focus_minutes: number
  }>
  recentMilestones: Array<{
    userid: string
    name: string | null
    milestone_type: string
    milestone_value: number
    achieved_at: string
  }>
  guildStats: {
    total_cycles: number
    total_focus_hours: number
    active_studiers: number
  }
}

// ---- Helpers ----

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function milestoneLabel(type: string, value: number): string {
  switch (type) {
    case "cycles": return `Completed ${value.toLocaleString()} cycles`
    case "streak": return `Reached a ${value}-day streak`
    case "focus_hours": return `Studied ${value.toLocaleString()} focus hours`
    case "focus_power": return `Achieved Focus Power level ${value}`
    default: return `${type}: ${value}`
  }
}

function focusPowerColor(power: number): string {
  if (power >= 5) return "bg-red-500/15 text-red-400"
  if (power >= 3) return "bg-orange-500/15 text-orange-400"
  if (power >= 1) return "bg-emerald-500/15 text-emerald-400"
  return "bg-gray-500/15 text-gray-400"
}

// ---- Skeleton ----

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
}

// ---- Stat Card ----

function StatCard({ label, value, icon, color = "text-primary" }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string
}) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-6 flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-gray-800 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ---- Member Avatar ----

function MemberAvatar({ url, name, size = 32 }: { url: string; name: string; size?: number }) {
  return (
    <img
      src={url} alt={name || "User"} width={size} height={size}
      className="rounded-full bg-gray-700 flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png" }}
    />
  )
}

// ---- Main Page ----

export default function PomodoroAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"

  const { data: permsData } = useDashboard(
    id && session ? `/api/dashboard/servers/${id}/permissions` : null
  )
  const isAdmin = (permsData as any)?.isAdmin ?? false

  const { data, isLoading } = useDashboard<AnalyticsData>(
    id && session ? `/api/dashboard/servers/${id}/pomodoro-analytics` : null
  )

  const gs = data?.guildStats

  return (
    <Layout SEO={{ title: `Premium Pomodoro Analytics - ${serverName} - LionBot`, description: "Advanced pomodoro analytics" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin={isAdmin} isMod={(permsData as any)?.isModerator} />
            <div className="flex-1 min-w-0 space-y-6">
              <PageHeader
                title="Premium Pomodoro Analytics"
                description="Streaks, focus power rankings, milestones, and advanced study stats for your server."
                breadcrumbs={[
                  { label: serverName, href: `/dashboard/servers/${id}` },
                  { label: "Pomodoro", href: `/dashboard/servers/${id}/pomodoro` },
                  { label: "Analytics" },
                ]}
              />

              {/* ============= Loading State ============= */}
              {isLoading && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
                  </div>
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-48" />
                </div>
              )}

              {/* ============= No Data State ============= */}
              {!isLoading && !data && (
                <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Trophy size={28} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Premium Analytics Unavailable</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Subscribe to Server Premium from the server settings page to unlock advanced pomodoro analytics including streaks, focus power rankings, and milestone tracking.
                  </p>
                </div>
              )}

              {/* ============= Data Loaded ============= */}
              {!isLoading && data && (
                <>
                  {/* Stats Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      label="Total Cycles"
                      value={gs ? gs.total_cycles.toLocaleString() : "0"}
                      icon={<Zap size={18} />}
                      color="text-amber-400"
                    />
                    <StatCard
                      label="Total Focus Hours"
                      value={gs ? gs.total_focus_hours.toLocaleString() : "0"}
                      icon={<Clock size={18} />}
                      color="text-blue-400"
                    />
                    <StatCard
                      label="Active Studiers"
                      value={gs ? gs.active_studiers.toLocaleString() : "0"}
                      icon={<TrendingUp size={18} />}
                      color="text-emerald-400"
                    />
                  </div>

                  {/* Streak Leaderboard */}
                  <SectionCard
                    title="Streak Champions"
                    description="Members ranked by their current daily study streak"
                    icon={<Flame size={18} />}
                    badge={`${data.streakLeaderboard.length}`}
                  >
                    {data.streakLeaderboard.length > 0 ? (
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                              {/* --- AI-MODIFIED (2026-03-21) --- */}
                              {/* Purpose: Hide less important columns on mobile */}
                              <th className="text-left py-2 px-2 w-12">Rank</th>
                              <th className="text-left py-2 px-2">Member</th>
                              <th className="text-right py-2 px-2">Current Streak</th>
                              <th className="text-right py-2 px-2 hidden sm:table-cell">Longest Streak</th>
                              <th className="text-right py-2 px-2 hidden sm:table-cell">Total Cycles</th>
                              {/* --- END AI-MODIFIED --- */}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {data.streakLeaderboard.slice(0, 20).map((user, i) => (
                              <tr key={user.userid} className="hover:bg-gray-800/30 transition-colors">
                                <td className="py-2.5 px-2">
                                  <span className={`text-xs font-bold ${
                                    i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                                  }`}>
                                    #{i + 1}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="flex items-center gap-2.5">
                                    <MemberAvatar url={user.avatar_url} name={user.name || "User"} />
                                    <span className="text-foreground truncate max-w-[180px]">
                                      {user.name || `User ...${user.userid.slice(-4)}`}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <span className="font-bold text-orange-400">
                                    {user.current_daily_streak} 🔥
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground hidden sm:table-cell">
                                  {user.longest_daily_streak}
                                </td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground hidden sm:table-cell">
                                  {user.total_cycles_completed.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No streak data yet</p>
                    )}
                  </SectionCard>

                  {/* Focus Power Leaderboard */}
                  <SectionCard
                    title="Focus Power Rankings"
                    description="Members ranked by their focus power score"
                    icon={<Zap size={18} />}
                    badge={`${data.focusPowerLeaderboard.length}`}
                  >
                    {data.focusPowerLeaderboard.length > 0 ? (
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                              <th className="text-left py-2 px-2 w-12">Rank</th>
                              <th className="text-left py-2 px-2">Member</th>
                              <th className="text-right py-2 px-2">Focus Power</th>
                              <th className="text-right py-2 px-2 hidden sm:table-cell">Total Focus Hours</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {data.focusPowerLeaderboard.slice(0, 20).map((user, i) => (
                              <tr key={user.userid} className="hover:bg-gray-800/30 transition-colors">
                                <td className="py-2.5 px-2">
                                  <span className={`text-xs font-bold ${
                                    i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                                  }`}>
                                    #{i + 1}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="flex items-center gap-2.5">
                                    <MemberAvatar url={user.avatar_url} name={user.name || "User"} />
                                    <span className="text-foreground truncate max-w-[180px]">
                                      {user.name || `User ...${user.userid.slice(-4)}`}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${focusPowerColor(user.focus_power)}`}>
                                    <Zap size={12} />
                                    {user.focus_power}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground hidden sm:table-cell">
                                  {Math.round(user.total_focus_minutes / 60).toLocaleString()}h
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No focus power data yet</p>
                    )}
                  </SectionCard>

                  {/* Recent Milestones */}
                  <SectionCard
                    title="Recent Achievements"
                    description="Latest milestones reached by server members"
                    icon={<Award size={18} />}
                    badge={`${data.recentMilestones.length}`}
                  >
                    {data.recentMilestones.length > 0 ? (
                      <div className="space-y-1">
                        {data.recentMilestones.map((m, i) => (
                          <div
                            key={`${m.userid}-${m.milestone_type}-${m.milestone_value}-${i}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/30 transition-colors"
                          >
                            <div className="p-1.5 rounded-lg bg-amber-500/10">
                              <Trophy size={16} className="text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">
                                <span className="font-medium">{m.name || `User ...${m.userid.slice(-4)}`}</span>
                                {" "}
                                <span className="text-muted-foreground">{milestoneLabel(m.milestone_type, m.milestone_value)}</span>
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {timeAgo(m.achieved_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={<Award size={48} strokeWidth={1} />}
                        title="No milestones achieved yet"
                        description="Milestones will appear here as members complete pomodoro goals."
                      />
                    )}
                  </SectionCard>
                </>
              )}
            </div>
          </div>
        </div>
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
