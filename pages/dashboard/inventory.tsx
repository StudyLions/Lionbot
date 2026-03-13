// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Skin inventory page with activate/deactivate toggle
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface SkinItem {
  id: number
  active: boolean
  acquiredAt: string | null
  expiresAt: string | null
  skinName: string
  baseSkinId: number | null
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [skins, setSkins] = useState<SkinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/inventory")
      if (res.ok) setSkins((await res.json()).skins || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { if (session) fetchData() }, [session, fetchData])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const toggleActive = async (item: SkinItem) => {
    try {
      const res = await fetch("/api/dashboard/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, active: !item.active }),
      })
      if (res.ok) {
        if (!item.active) {
          setSkins(prev => prev.map(s => ({ ...s, active: s.id === item.id })))
        } else {
          setSkins(prev => prev.map(s => s.id === item.id ? { ...s, active: false } : s))
        }
        showToast(item.active ? "Skin deactivated" : "Skin activated")
      }
    } catch { showToast("Error toggling skin") }
  }

  const activeSkin = skins.find(s => s.active)

  return (
    <Layout SEO={{ title: "Inventory - LionBot Dashboard", description: "Your skin collection" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                  <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">My Inventory</h1>
              </div>

              {/* Active skin banner */}
              {activeSkin && (
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 bg-gray-800 rounded-2xl p-5 border border-purple-500/20 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400/70 text-xs uppercase tracking-wide mb-1">Active Skin</p>
                      <p className="text-xl font-bold text-white">{activeSkin.skinName}</p>
                    </div>
                    <span className="text-3xl">🎨</span>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse h-40" />)}
                </div>
              ) : skins.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                  <span className="text-5xl mb-4 block">🎨</span>
                  <p className="text-gray-400 text-lg mb-2">No skins in your inventory</p>
                  <p className="text-gray-500 text-sm mb-6">Browse the skin shop or earn gems to unlock custom profile cards!</p>
                  <Link href="/skins">
                    <span className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all cursor-pointer">
                      Browse Skins
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skins.map((item) => {
                    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date()
                    return (
                      <div key={item.id} className={`bg-gray-800 rounded-2xl border p-5 transition-all hover:shadow-lg ${
                        item.active ? "border-purple-500/50 shadow-purple-500/10" : "border-gray-700"
                      } ${isExpired ? "opacity-50" : ""}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-3xl">🖼️</div>
                          {item.active && (
                            <span className="text-xs font-medium bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg">
                              Active
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs font-medium bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg">
                              Expired
                            </span>
                          )}
                        </div>

                        <h3 className="text-white font-medium mb-2">{item.skinName}</h3>

                        <div className="space-y-1 mb-4">
                          {item.acquiredAt && (
                            <p className="text-gray-500 text-xs">
                              Acquired: {new Date(item.acquiredAt).toLocaleDateString()}
                            </p>
                          )}
                          {item.expiresAt && (
                            <p className={`text-xs ${isExpired ? "text-red-400" : "text-gray-500"}`}>
                              {isExpired ? "Expired" : "Expires"}: {new Date(item.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {!isExpired && (
                          <button onClick={() => toggleActive(item)}
                            className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                              item.active
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}>
                            {item.active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl border border-gray-700 text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </AdminGuard>
    </Layout>
  )
}
