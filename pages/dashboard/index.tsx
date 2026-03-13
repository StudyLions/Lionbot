// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard overview page - user profile and stats
// ============================================================
import Layout from "@/components/Layout/Layout"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/me")
        .then(res => {
          if (!res.ok) throw new Error(res.status === 404 ? "No LionBot data found for your account" : "Failed to load dashboard")
          return res.json()
        })
        .then(setData)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <Layout SEO={{ title: "Dashboard - LionBot", description: "Your LionBot dashboard" }}>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Layout SEO={{ title: "Dashboard - LionBot", description: "Sign in to view your dashboard" }}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-6">
          <h1 className="text-4xl font-bold text-white">LionBot Dashboard</h1>
          <p className="text-gray-400 text-lg">Sign in with Discord to view your study stats and manage your servers.</p>
          <button
            onClick={() => signIn("discord")}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Sign in with Discord
          </button>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout SEO={{ title: "Dashboard - LionBot", description: "Dashboard error" }}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-4">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout SEO={{ title: "Dashboard - LionBot", description: "Your LionBot study statistics" }}>
      <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex gap-8">
          <DashboardNav />
          <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {data?.user.name || session?.user?.name || "Studier"}
            </h1>
            <span className="text-amber-400 text-lg font-medium">
              {data?.user.gems || 0} Gems
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm uppercase tracking-wide">Total Study Time</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatDuration(data?.stats.totalStudyTimeHours || 0)}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm uppercase tracking-wide">Servers</p>
              <p className="text-3xl font-bold text-white mt-2">
                {data?.stats.serverCount || 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm uppercase tracking-wide">Member Since</p>
              <p className="text-3xl font-bold text-white mt-2">
                {data?.user.firstSeen
                  ? new Date(data.user.firstSeen).toLocaleDateString(undefined, { year: "numeric", month: "short" })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Link href="/dashboard/servers">
              <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 bg-gray-800 rounded-2xl p-5 border border-indigo-500/20 hover:border-indigo-400/40 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🏠</span>
                <h3 className="text-base font-semibold text-white">My Servers</h3>
                <p className="text-gray-500 text-xs mt-1">{data?.stats.serverCount || 0} servers</p>
              </div>
            </Link>
            <Link href="/dashboard/tasks">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 bg-gray-800 rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">✅</span>
                <h3 className="text-base font-semibold text-white">My Tasks</h3>
                <p className="text-gray-500 text-xs mt-1">Manage your to-do list</p>
              </div>
            </Link>
            <Link href="/dashboard/history">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 bg-gray-800 rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📖</span>
                <h3 className="text-base font-semibold text-white">Study History</h3>
                <p className="text-gray-500 text-xs mt-1">Session log & stats</p>
              </div>
            </Link>
            <Link href="/donate">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 bg-gray-800 rounded-2xl p-5 border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group">
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">💎</span>
                <h3 className="text-base font-semibold text-white">LionGems</h3>
                <p className="text-gray-500 text-xs mt-1">Premium & skins</p>
              </div>
            </Link>
          </div>

          {/* Recent Sessions */}
          {data?.recentSessions && data.recentSessions.length > 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Recent Study Sessions</h3>
              </div>
              <div className="divide-y divide-gray-700">
                {data.recentSessions.map(session => (
                  <div key={session.id} className="p-4 px-6 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">
                        {new Date(session.startTime).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </span>
                      {session.tag && (
                        <span className="ml-3 px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded text-xs">
                          {session.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-300 font-mono">
                      {session.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
