// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Global leaderboard page - user stats hero + placeholder for global leaderboard
// ============================================================
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { PageHeader } from "@/components/dashboard/ui"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/dashboard/ui/EmptyState"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import { cn } from "@/lib/utils"
import { Trophy, Clock, Flame, ThumbsUp } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface StatsData {
  studyTime: {
    todayMinutes: number
    thisWeekMinutes: number
    thisMonthMinutes: number
    allTimeMinutes: number
  }
  streaks: {
    currentStreak: number
    longestStreak: number
  }
  voteCount: number
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const { data: stats, error, isLoading } = useDashboard<StatsData>(
    session ? "/api/dashboard/stats" : null
  )

  return (
    <Layout SEO={{ title: "Leaderboard - LionBot", description: "Global study leaderboard" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 space-y-6">
              <PageHeader
                title="Global Leaderboard"
                description="Compare your study stats with others"
              />

              {isLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-28 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-destructive">{error?.message}</p>
                </div>
              ) : (
                <>
                  {/* User Stats Hero */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Trophy size={20} />
                        Your Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Clock size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Study Time</p>
                            <p className="text-xl font-bold text-foreground">
                              {formatMinutes(stats?.studyTime.allTimeMinutes ?? 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Flame size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Streak</p>
                            <p className="text-xl font-bold text-foreground">
                              {stats?.streaks.currentStreak ?? 0} days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Flame size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Longest Streak</p>
                            <p className="text-xl font-bold text-foreground">
                              {stats?.streaks.longestStreak ?? 0} days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <ThumbsUp size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Top.gg Votes</p>
                            <p className="text-xl font-bold text-foreground">
                              {stats?.voteCount ?? 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Leaderboard Placeholder */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-foreground">Global Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmptyState
                        icon={<Trophy size={48} className="text-muted-foreground" />}
                        title="Global leaderboard coming soon"
                        description="We're building a global leaderboard so you can compare your study time with others. Stay tuned!"
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
