// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard server list page
// ============================================================
import Layout from "@/components/Layout/Layout"
import { useSession, signIn } from "next-auth/react"
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

  if (status === "unauthenticated") {
    return (
      <Layout SEO={{ title: "Servers - LionBot Dashboard", description: "View your servers" }}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-6">
          <h1 className="text-3xl font-bold text-white">Sign in to continue</h1>
          <button onClick={() => signIn("discord")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-medium transition-colors">
            Sign in with Discord
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout SEO={{ title: "My Servers - LionBot Dashboard", description: "Your LionBot servers" }}>
      <div className="min-h-screen bg-gray-900 pt-8 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <span className="text-gray-400 hover:text-white cursor-pointer">&larr; Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">My Servers</h1>
          </div>

          {loading ? (
            <div className="text-gray-400 text-center py-20">Loading servers...</div>
          ) : servers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No servers found. Make sure LionBot is in your Discord server and you have some tracked activity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.map(server => (
                <Link key={server.guildId} href={`/dashboard/servers/${server.guildId}`}>
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer h-full">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{server.guildName}</h3>
                    {server.displayName && (
                      <p className="text-gray-500 text-sm mb-3">as {server.displayName}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase">Study Time</p>
                        <p className="text-white font-bold text-lg">{server.trackedTimeHours}h</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs uppercase">Coins</p>
                        <p className="text-amber-400 font-bold text-lg">{server.coins.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
