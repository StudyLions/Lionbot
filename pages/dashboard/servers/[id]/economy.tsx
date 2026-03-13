// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Economy overview page with stats and transactions
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

interface EconomyData {
  overview: { totalCoins: number; memberCount: number }
  topHolders: Array<{ userId: string; displayName: string | null; coins: number }>
  recentTransactions: Array<{
    id: number; type: string; actorId: string; amount: number
    fromAccount: string | null; toAccount: string | null; createdAt: string
  }>
  shopItems: Array<{ id: number; type: string; price: number; purchasable: boolean }>
}

const txTypeLabels: Record<string, { label: string; color: string }> = {
  VOICE_SESSION: { label: "Study", color: "text-emerald-400" },
  TEXT_SESSION: { label: "Chat", color: "text-blue-400" },
  TRANSFER: { label: "Transfer", color: "text-purple-400" },
  TASKS: { label: "Task", color: "text-cyan-400" },
  SHOP_PURCHASE: { label: "Shop", color: "text-pink-400" },
  ADMIN: { label: "Admin", color: "text-amber-400" },
  REFUND: { label: "Refund", color: "text-gray-400" },
  SCHEDULE_BOOK: { label: "Book", color: "text-indigo-400" },
  SCHEDULE_REWARD: { label: "Attend", color: "text-emerald-400" },
  OTHER: { label: "Other", color: "text-gray-400" },
}

export default function EconomyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<EconomyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")

  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}/economy`)
        .then(r => r.ok ? r.json() : null)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false))
      fetch(`/api/dashboard/servers/${id}`)
        .then(r => r.json())
        .then(d => setServerName(d.server?.name || "Server"))
        .catch(() => {})
    }
  }, [id, session])

  return (
    <Layout SEO={{ title: `Economy - ${serverName} - LionBot`, description: "Server economy" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse h-40" />
                ))}
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-gray-400">Unable to load economy data</div>
            ) : (
              <>
                {/* Overview cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 bg-gray-800 rounded-2xl p-6 border border-amber-500/20">
                    <p className="text-amber-400/70 text-xs uppercase tracking-wide mb-1">Total Coins in Circulation</p>
                    <p className="text-3xl font-bold text-amber-400">{data.overview.totalCoins.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm mt-1">across {data.overview.memberCount} members</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 bg-gray-800 rounded-2xl p-6 border border-indigo-500/20">
                    <p className="text-indigo-400/70 text-xs uppercase tracking-wide mb-1">Shop Items</p>
                    <p className="text-3xl font-bold text-indigo-400">{data.shopItems.length}</p>
                    <p className="text-gray-500 text-sm mt-1">{data.shopItems.filter(s => s.purchasable).length} purchasable</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top holders */}
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🏆</span> Top Coin Holders
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                      {data.topHolders.map((holder, i) => (
                        <div key={holder.userId} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold w-6 ${
                              i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-gray-500"
                            }`}>#{i + 1}</span>
                            <span className="text-white text-sm">{holder.displayName || `...${holder.userId.slice(-4)}`}</span>
                          </div>
                          <span className="text-amber-400 font-mono text-sm">{(holder.coins || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>📜</span> Recent Transactions
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto">
                      {data.recentTransactions.map((tx) => {
                        const info = txTypeLabels[tx.type] || txTypeLabels.OTHER
                        return (
                          <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`text-xs font-medium ${info.color} bg-gray-700/50 px-2 py-1 rounded-lg whitespace-nowrap`}>
                                {info.label}
                              </span>
                              <span className="text-gray-400 text-xs truncate">
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <span className={`font-mono text-sm font-medium whitespace-nowrap ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {tx.amount >= 0 ? "+" : ""}{tx.amount}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
