// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard server detail page with leaderboard
// ============================================================
import Layout from "@/components/Layout/Layout"
import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"

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

export default function ServerDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetch(`/api/dashboard/servers/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Server not found or you're not a member")
          return res.json()
        })
        .then(setData)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [status, id])

  if (status === "unauthenticated") {
    return (
      <Layout SEO={{ title: "Server - LionBot Dashboard", description: "Server details" }}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-6">
          <button onClick={() => signIn("discord")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-medium transition-colors">
            Sign in with Discord
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout SEO={{ title: `${data?.server.name || "Server"} - LionBot Dashboard`, description: "Server study stats" }}>
      <div className="min-h-screen bg-gray-900 pt-8 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/servers">
              <span className="text-gray-400 hover:text-white cursor-pointer">&larr; Servers</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">{data?.server.name || "Loading..."}</h1>
          </div>

          {loading ? (
            <div className="text-gray-400 text-center py-20">Loading server data...</div>
          ) : error ? (
            <div className="text-red-400 text-center py-20">{error}</div>
          ) : data ? (
            <>
              {/* Your Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Your Study Time</p>
                  <p className="text-2xl font-bold text-white mt-1">{data.you.trackedTimeHours}h</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Your Coins</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{data.you.coins.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Workouts</p>
                  <p className="text-2xl font-bold text-white mt-1">{data.you.workoutCount || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Reward Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {data.server.settings?.studyHourlyReward || 0} <span className="text-sm text-gray-400">coins/hr</span>
                  </p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Study Time Leaderboard</h3>
                </div>
                <div className="divide-y divide-gray-700">
                  {data.leaderboard.map(entry => (
                    <div
                      key={entry.userId}
                      className={`p-4 px-6 flex items-center justify-between ${
                        entry.isYou ? "bg-indigo-900/20 border-l-2 border-indigo-500" : ""
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
                        <span className="text-white font-medium">
                          {entry.displayName || `User ${entry.userId.slice(-4)}`}
                          {entry.isYou && <span className="ml-2 text-xs text-indigo-400">(you)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-gray-300 font-mono">{entry.trackedTimeHours}h</span>
                        <span className="text-amber-400 font-mono w-20 text-right">{entry.coins.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}
