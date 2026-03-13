// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server list page - shows all servers the user is in
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Server {
  guildId: string
  guildName: string
  displayName: string | null
  trackedTimeSeconds: number
  trackedTimeHours: number
  coins: number
  firstJoined: string | null
}

export default function Servers() {
  const { data: session, status } = useSession()
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/servers")
        .then(res => res.json())
        .then(data => setServers(data.servers || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  return (
    <Layout SEO={{ title: "My Servers - LionBot Dashboard", description: "Your LionBot servers" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">My Servers</h1>
              </div>
              <span className="text-gray-500 text-sm">{servers.length} servers</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-5 h-36 animate-pulse border border-gray-700" />
                ))}
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
                <span className="text-5xl block mb-4">🦁</span>
                <p className="text-gray-400 text-lg">No servers found</p>
                <p className="text-gray-500 text-sm mt-2">Make sure LionBot is in your Discord server and you have some tracked activity.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map(server => (
                  <Link key={server.guildId} href={`/dashboard/servers/${server.guildId}`}>
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-indigo-500/50 transition-all cursor-pointer h-full group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-indigo-300 transition-colors pr-2">
                          {server.guildName}
                        </h3>
                        <span className="text-gray-600 group-hover:text-indigo-400 transition-colors text-lg flex-shrink-0">&rarr;</span>
                      </div>
                      {server.displayName && (
                        <p className="text-gray-500 text-xs mb-3">as {server.displayName}</p>
                      )}
                      <div className="flex items-center gap-6 mt-auto">
                        <div>
                          <p className="text-gray-500 text-xs">Study</p>
                          <p className="text-emerald-400 font-bold">{server.trackedTimeHours}h</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Coins</p>
                          <p className="text-amber-400 font-bold">{server.coins.toLocaleString()}</p>
                        </div>
                        {server.firstJoined && (
                          <div>
                            <p className="text-gray-500 text-xs">Joined</p>
                            <p className="text-gray-400 text-sm">{new Date(server.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
