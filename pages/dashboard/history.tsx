// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Study history - rebuilt with shared UI
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: design system migration - color classes (bg-background, text-foreground, etc.)
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  Badge,
  EmptyState,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import { History, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface Session {
  id: number
  guildId: string
  startTime: string
  durationMinutes: number
  liveDurationMinutes: number
  tag: string | null
  rating: number | null
}

interface SessionsResponse {
  sessions: Session[]
  weeklyStats: { totalMinutes: number; sessionCount: number }
  pagination: { page: number; totalPages: number }
}

export default function HistoryPage() {
  const { data: session } = useSession()
  const [page, setPage] = useState(1)
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data, error, isLoading: loading, mutate } = useDashboard<SessionsResponse>(
    session ? `/api/dashboard/sessions?page=${page}` : null
  )
  const sessions = data?.sessions ?? []
  const weeklyStats = data?.weeklyStats ?? { totalMinutes: 0, sessionCount: 0 }
  const totalPages = data?.pagination?.totalPages ?? 1
  // --- END AI-MODIFIED ---

  const weeklyHours = Math.round((weeklyStats.totalMinutes / 60) * 10) / 10
  const avgSessionMinutes =
    weeklyStats.sessionCount > 0
      ? Math.round(weeklyStats.totalMinutes / weeklyStats.sessionCount)
      : 0

  const getSessionTypeBadge = (s: Session) => {
    if (s.liveDurationMinutes > 0) {
      return <Badge variant="success">Camera</Badge>
    }
    return <Badge variant="info">Voice</Badge>
  }

  return (
    <Layout
      SEO={{
        title: "Study History - LionBot Dashboard",
        description: "Your study session history",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-4xl">
              <PageHeader
                title="Study History"
                description="View your study session history and weekly progress."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Study History" },
                ]}
              />

              {/* Weekly summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock size={16} />
                    Total hours this week
                  </div>
                  <p className="text-2xl font-bold text-foreground">{weeklyHours}h</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <History size={16} />
                    Sessions this week
                  </div>
                  <p className="text-2xl font-bold text-foreground">{weeklyStats.sessionCount}</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar size={16} />
                    Avg session length
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {avgSessionMinutes > 0 ? `${avgSessionMinutes} min` : "—"}
                  </p>
                </div>
              </div>

              {/* Session list */}
              <div className="bg-card rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-foreground">Session Log</h3>
                </div>

                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-muted rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-5">
                    <p className="text-red-400">{error.message}</p>
                    <button
                      onClick={() => mutate()}
                      className="mt-2 text-primary hover:text-primary text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : sessions.length === 0 ? (
                  <EmptyState
                    icon={<History size={48} strokeWidth={1} className="text-muted-foreground" />}
                    title="No study sessions recorded yet"
                    description="Join a voice channel in a LionBot server to start tracking!"
                  />
                ) : (
                  <>
                    <div className="divide-y divide-border/50">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <History size={22} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium text-sm">
                                {new Date(s.startTime).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-muted-foreground text-xs">
                                  {new Date(s.startTime).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {getSessionTypeBadge(s)}
                                {s.tag && (
                                  <Badge variant="purple">{s.tag}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground font-mono font-bold">
                              {s.durationMinutes} min
                            </p>
                            {s.rating && (
                              <p className="text-warning text-xs mt-0.5">
                                {"★".repeat(s.rating)}
                                {"☆".repeat(5 - s.rating)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-700">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-4 py-2 bg-muted text-gray-300 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-muted/80 flex items-center gap-1"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <span className="text-gray-400 text-sm">
                          {page} / {totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className="px-4 py-2 bg-muted text-gray-300 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-muted/80 flex items-center gap-1"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
