// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Study session history with stats
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

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
  const [weeklyStats, setWeeklyStats] = useState({ totalMinutes: 0, sessionCount: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSessions = useCallback(async (p = 1) => {
    try {
      const res = await fetch(`/api/dashboard/sessions?page=${p}`)
      if (!res.ok) return
      const data = await res.json()
      setSessions(data.sessions)
      setWeeklyStats(data.weeklyStats)
      setTotalPages(data.pagination.totalPages)
      setPage(data.pagination.page)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchSessions()
  }, [session, fetchSessions])

  const weeklyHours = Math.round(weeklyStats.totalMinutes / 60 * 10) / 10

  return (
    <Layout SEO={{ title: "Study History - LionBot Dashboard", description: "Your study session history" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard">
                <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Study History</h1>
            </div>

            {/* Weekly summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 bg-gray-800 rounded-2xl p-5 border border-emerald-500/20">
                <p className="text-emerald-400/70 text-xs uppercase tracking-wide">This Week</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{weeklyHours}h</p>
                <p className="text-gray-500 text-sm mt-1">{weeklyStats.totalMinutes} minutes total</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 bg-gray-800 rounded-2xl p-5 border border-indigo-500/20">
                <p className="text-indigo-400/70 text-xs uppercase tracking-wide">Sessions This Week</p>
                <p className="text-3xl font-bold text-indigo-400 mt-1">{weeklyStats.sessionCount}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {weeklyStats.sessionCount > 0
                    ? `avg ${Math.round(weeklyStats.totalMinutes / weeklyStats.sessionCount)} min each`
                    : "No sessions yet"
                  }
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
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-12 bg-gray-700 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-4xl mb-4 block">🎧</span>
                  <p className="text-gray-400">No study sessions recorded yet</p>
                  <p className="text-gray-500 text-sm mt-1">Join a voice channel in a LionBot server to start tracking!</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-700/50">
                    {sessions.map((s) => (
                      <div key={s.id} className="px-5 py-4 flex items-center justify-between gap-4 sm:flex-col sm:items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📖</span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {new Date(s.startTime).toLocaleDateString(undefined, {
                                weekday: "short", month: "short", day: "numeric", year: "numeric"
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-gray-500 text-xs">
                                {new Date(s.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {s.tag && (
                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">{s.tag}</span>
                              )}
                              {s.liveDurationMinutes > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs">📹 Camera</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right sm:text-left">
                          <p className="text-white font-mono font-bold">{s.durationMinutes} min</p>
                          {s.rating && (
                            <p className="text-amber-400 text-xs">{"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-700">
                      <button
                        onClick={() => fetchSessions(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-30 transition-colors hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <span className="text-gray-400 text-sm">{page} / {totalPages}</span>
                      <button
                        onClick={() => fetchSessions(page + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-30 transition-colors hover:bg-gray-600"
                      >
                        Next
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
