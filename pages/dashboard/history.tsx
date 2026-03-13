// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Study history - rebuilt with shared UI
// ============================================================
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
import { useEffect, useState, useCallback } from "react"
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

export default function HistoryPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklyStats, setWeeklyStats] = useState({
    totalMinutes: 0,
    sessionCount: 0,
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSessions = useCallback(async (p = 1) => {
    try {
      const res = await fetch(`/api/dashboard/sessions?page=${p}`)
      if (!res.ok) {
        toast.error("Failed to load sessions")
        return
      }
      const data = await res.json()
      setSessions(data.sessions)
      setWeeklyStats(data.weeklyStats)
      setTotalPages(data.pagination.totalPages)
      setPage(data.pagination.page)
    } catch {
      toast.error("Failed to load sessions")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchSessions()
  }, [session, fetchSessions])

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
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
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
                <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock size={16} />
                    Total hours this week
                  </div>
                  <p className="text-2xl font-bold text-white">{weeklyHours}h</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <History size={16} />
                    Sessions this week
                  </div>
                  <p className="text-2xl font-bold text-white">{weeklyStats.sessionCount}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar size={16} />
                    Avg session length
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {avgSessionMinutes > 0 ? `${avgSessionMinutes} min` : "—"}
                  </p>
                </div>
              </div>

              {/* Session list */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white">Session Log</h3>
                </div>

                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-gray-700 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <EmptyState
                    icon={<History size={48} strokeWidth={1} className="text-gray-500" />}
                    title="No study sessions recorded yet"
                    description="Join a voice channel in a LionBot server to start tracking!"
                  />
                ) : (
                  <>
                    <div className="divide-y divide-gray-700/50">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <History size={22} className="text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                {new Date(s.startTime).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-gray-500 text-xs">
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
                            <p className="text-white font-mono font-bold">
                              {s.durationMinutes} min
                            </p>
                            {s.rating && (
                              <p className="text-amber-400 text-xs mt-0.5">
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
                          onClick={() => fetchSessions(page - 1)}
                          disabled={page <= 1}
                          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-gray-600 flex items-center gap-1"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <span className="text-gray-400 text-sm">
                          {page} / {totalPages}
                        </span>
                        <button
                          onClick={() => fetchSessions(page + 1)}
                          disabled={page >= totalPages}
                          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-gray-600 flex items-center gap-1"
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
