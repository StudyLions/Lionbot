// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Member dashboard overview - rebuilt with shared UI
// ============================================================
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { PageHeader, Badge } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, Server, Calendar, CheckSquare, History, Bell, Palette, User, Gem } from "lucide-react"

interface DashboardData {
  user: {
    id: string
    timezone: string | null
    name: string | null
    gems: number | null
    firstSeen: string | null
    lastSeen: string | null
  }
  stats: {
    totalStudyTimeSeconds: number
    totalStudyTimeHours: number
    serverCount: number
  }
  recentSessions: Array<{
    id: number
    guildId: string
    startTime: string
    durationMinutes: number
    tag: string | null
    rating: number | null
  }>
}

function formatDuration(hours: number): string {
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}d ${remainingHours}h`
  }
  return `${hours}h`
}

function formatSessionDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

const quickLinks = [
  { href: "/dashboard/servers", label: "Servers", icon: Server, sub: "Your servers" },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare, sub: "Manage to-do list" },
  { href: "/dashboard/history", label: "History", icon: History, sub: "Session log" },
  { href: "/dashboard/inventory", label: "Inventory", icon: Palette, sub: "Skins & profile" },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell, sub: "Study reminders" },
  { href: "/dashboard/profile", label: "Profile", icon: User, sub: "Settings" },
]

export default function Dashboard() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/me")
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? "No LionBot data found for your account" : "Failed to load dashboard")
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const displayName = data?.user.name || session?.user?.name || "Studier"

  return (
    <Layout SEO={{ title: "Dashboard - LionBot", description: "Your LionBot study statistics" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-8">
                  <div className="h-8 bg-gray-800 rounded w-64 animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-6 h-24 animate-pulse" />)}
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <>
                  <PageHeader
                    title={displayName}
                    description="Your study stats and quick links"
                    actions={
                      <span className="flex items-center gap-2 text-amber-400 font-medium">
                        <Gem size={18} />
                        {data?.user.gems ?? 0} Gems
                      </span>
                    }
                  />

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gray-700/50">
                        <Clock size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm uppercase tracking-wide">Total Study Time</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {formatDuration(data?.stats.totalStudyTimeHours ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gray-700/50">
                        <Server size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm uppercase tracking-wide">Servers</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {data?.stats.serverCount ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gray-700/50">
                        <Calendar size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm uppercase tracking-wide">Member Since</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {data?.user.firstSeen
                            ? new Date(data.user.firstSeen).toLocaleDateString(undefined, { year: "numeric", month: "short" })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {quickLinks.map(({ href, label, icon: Icon, sub }) => (
                      <Link key={href} href={href}>
                        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-gray-700/50">
                            <Icon size={20} className="text-gray-300" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{label}</h3>
                            <p className="text-gray-500 text-sm">{sub}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Recent Sessions */}
                  {data?.recentSessions && data.recentSessions.length > 0 && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <div className="p-6 border-b border-gray-700">
                        <h3 className="text-xl font-semibold text-white">Recent Study Sessions</h3>
                      </div>
                      <div className="divide-y divide-gray-700">
                        {data.recentSessions.map(s => (
                          <div key={s.id} className="p-4 px-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">
                                {new Date(s.startTime).toLocaleDateString(undefined, {
                                  weekday: "short", month: "short", day: "numeric",
                                })}
                              </span>
                              {s.tag && <Badge variant="purple">{s.tag}</Badge>}
                            </div>
                            <span className="text-gray-300 font-mono text-sm">
                              {formatSessionDuration(s.durationMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
