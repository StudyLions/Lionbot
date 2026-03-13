// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server overview page with ServerNav for admin access
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

interface ServerData {
  server: {
    id: string
    name: string
    settings: {
      studyHourlyReward: number | null
      rankType: string | null
      timezone: string | null
    } | null
  }
  you: {
    trackedTimeSeconds: number
    trackedTimeHours: number
    coins: number
    displayName: string | null
    workoutCount: number | null
    firstJoined: string | null
    ranks: any
  }
  leaderboard: Array<{
    rank: number
    userId: string
    displayName: string | null
    trackedTimeHours: number
    coins: number
    isYou: boolean
  }>
}

interface Permissions {
  isMember: boolean
  isModerator: boolean
  isAdmin: boolean
}

export default function ServerDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<ServerData | null>(null)
  const [perms, setPerms] = useState<Permissions>({ isMember: false, isModerator: false, isAdmin: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && id) {
      Promise.all([
        fetch(`/api/dashboard/servers/${id}`).then(r => {
          if (!r.ok) throw new Error("Server not found or you're not a member")
          return r.json()
        }),
        fetch(`/api/dashboard/servers/${id}/permissions`).then(r => r.ok ? r.json() : { isMember: true, isModerator: false, isAdmin: false }),
      ])
        .then(([serverData, permData]) => {
          setData(serverData)
          setPerms(permData)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [status, id])

  return (
    <Layout SEO={{ title: `${data?.server.name || "Server"} - LionBot Dashboard`, description: "Server dashboard" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav
              serverId={id as string}
              serverName={data?.server.name || (loading ? "Loading..." : "Server")}
              isAdmin={perms.isAdmin}
              isMod={perms.isModerator}
            />

            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-gray-800 rounded-2xl p-5 h-24 animate-pulse" />
                  ))}
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 h-64 animate-pulse" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <span className="text-4xl block mb-4">😿</span>
                <p className="text-red-400 text-lg">{error}</p>
              </div>
            ) : data ? (
              <>
                {/* Your Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 bg-gray-800 rounded-2xl p-5 border border-emerald-500/20">
                    <p className="text-emerald-400/70 text-xs uppercase tracking-wide">Study Time</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{data.you.trackedTimeHours}h</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 bg-gray-800 rounded-2xl p-5 border border-amber-500/20">
                    <p className="text-amber-400/70 text-xs uppercase tracking-wide">Coins</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{data.you.coins.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 bg-gray-800 rounded-2xl p-5 border border-purple-500/20">
                    <p className="text-purple-400/70 text-xs uppercase tracking-wide">Workouts</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">{data.you.workoutCount || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 bg-gray-800 rounded-2xl p-5 border border-cyan-500/20">
                    <p className="text-cyan-400/70 text-xs uppercase tracking-wide">Reward Rate</p>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">
                      {data.server.settings?.studyHourlyReward || 0}<span className="text-sm text-gray-500 ml-1">/hr</span>
                    </p>
                  </div>
                </div>

                {/* Quick Admin Actions */}
                {(perms.isModerator || perms.isAdmin) && (
                  <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                    {perms.isAdmin && (
                      <button
                        onClick={() => router.push(`/dashboard/servers/${id}/settings`)}
                        className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-indigo-500/50 transition-all text-left group cursor-pointer"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform inline-block">⚙️</span>
                        <p className="text-white text-sm font-medium mt-1">Settings</p>
                        <p className="text-gray-500 text-xs">Configure bot</p>
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/members`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform inline-block">👥</span>
                      <p className="text-white text-sm font-medium mt-1">Members</p>
                      <p className="text-gray-500 text-xs">View & manage</p>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/moderation`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-rose-500/50 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform inline-block">🛡️</span>
                      <p className="text-white text-sm font-medium mt-1">Moderation</p>
                      <p className="text-gray-500 text-xs">Tickets & bans</p>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/economy`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-amber-500/50 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform inline-block">💰</span>
                      <p className="text-white text-sm font-medium mt-1">Economy</p>
                      <p className="text-gray-500 text-xs">Coins & shop</p>
                    </button>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🏆</span> Study Time Leaderboard
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {data.leaderboard.map(entry => (
                      <div
                        key={entry.userId}
                        className={`px-5 py-3 flex items-center justify-between ${
                          entry.isYou ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-bold w-8 ${
                            entry.rank === 1 ? "text-amber-400" :
                            entry.rank === 2 ? "text-gray-300" :
                            entry.rank === 3 ? "text-amber-700" :
                            "text-gray-500"
                          }`}>
                            #{entry.rank}
                          </span>
                          <span className="text-white font-medium text-sm">
                            {entry.displayName || `User ...${entry.userId.slice(-4)}`}
                            {entry.isYou && <span className="ml-2 text-xs text-indigo-400 font-normal">(you)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-emerald-400 font-mono text-sm">{entry.trackedTimeHours}h</span>
                          <span className="text-amber-400 font-mono text-sm w-20 text-right">{entry.coins.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {data.leaderboard.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No study activity yet
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
