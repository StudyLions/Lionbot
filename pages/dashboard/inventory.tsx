// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Skin inventory - rebuilt with shared UI
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { PageHeader, Badge, ConfirmModal, EmptyState, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import { Palette, Star, Clock, ShoppingBag } from "lucide-react"

interface SkinItem {
  id: number
  active: boolean
  acquiredAt: string | null
  expiresAt: string | null
  skinName: string
  baseSkinId: number | null
}

export default function InventoryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [skins, setSkins] = useState<SkinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmItem, setConfirmItem] = useState<SkinItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null)
  const [loadingToggle, setLoadingToggle] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/inventory")
      if (res.ok) setSkins((await res.json()).skins || [])
    } catch {
      toast.error("Failed to load inventory")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchData()
  }, [session, fetchData])

  const handleToggle = async (item: SkinItem) => {
    setConfirmItem(null)
    setConfirmAction(null)
    setLoadingToggle(true)
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
          setSkins(prev => prev.map(s => (s.id === item.id ? { ...s, active: false } : s)))
        }
        toast.success(item.active ? "Skin deactivated" : "Skin activated")
      } else {
        toast.error("Failed to update skin")
      }
    } catch {
      toast.error("Error toggling skin")
    } finally {
      setLoadingToggle(false)
    }
  }

  const activeSkin = skins.find(s => s.active)

  return (
    <Layout SEO={{ title: "Inventory - LionBot Dashboard", description: "Your skin collection" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="My Skins"
                description="Your skin collection. Activate a skin to use it on your profile card across servers."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Inventory" },
                ]}
              />

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse h-44" />
                  ))}
                </div>
              ) : skins.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700">
                  <EmptyState
                    icon={<Palette size={48} className="text-gray-500" strokeWidth={1} />}
                    title="No skins in your inventory"
                    description="Browse the skin shop or earn gems to unlock custom profile cards."
                    action={{
                      label: "Browse Skins",
                      onClick: () => router.push("/skins"),
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skins.map((item) => {
                    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date()
                    const isActive = item.active
                    return (
                      <div
                        key={item.id}
                        className={`bg-gray-800 rounded-xl p-5 border transition-all ${
                          isActive ? "border-indigo-500 shadow-indigo-500/10" : "border-gray-700"
                        } ${isExpired ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 rounded-lg bg-gray-700/50">
                            <Palette size={20} className="text-gray-300" />
                          </div>
                          <div className="flex gap-2">
                            {isActive && <Badge variant="purple">Active</Badge>}
                            {isExpired && <Badge variant="error">Expired</Badge>}
                          </div>
                        </div>

                        <h3 className="text-white font-medium mb-1">{item.skinName}</h3>
                        <p className="text-gray-500 text-sm mb-3">
                          Custom profile card skin
                        </p>

                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                          {item.acquiredAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(item.acquiredAt).toLocaleDateString()}
                            </span>
                          )}
                          {item.expiresAt && !isExpired && (
                            <span className="flex items-center gap-1">
                              <Star size={12} />
                              Expires {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {!isExpired && (
                          <button
                            onClick={() => {
                              setConfirmItem(item)
                              setConfirmAction(isActive ? "deactivate" : "activate")
                            }}
                            className={`w-full py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                              isActive
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            <ShoppingBag size={14} />
                            {isActive ? "Deactivate" : "Activate"}
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

        <ConfirmModal
          open={!!confirmItem && !!confirmAction}
          onConfirm={() => confirmItem && handleToggle(confirmItem)}
          onCancel={() => {
            setConfirmItem(null)
            setConfirmAction(null)
          }}
          title={confirmAction === "deactivate" ? "Deactivate skin?" : "Activate skin?"}
          message={
            confirmAction === "deactivate"
              ? `This will deactivate "${confirmItem?.skinName}". You can reactivate it anytime.`
              : `Activate "${confirmItem?.skinName}" as your profile card skin?`
          }
          confirmLabel={confirmAction === "deactivate" ? "Deactivate" : "Activate"}
          variant={confirmAction === "deactivate" ? "warning" : "info"}
          loading={loadingToggle}
        />
      </AdminGuard>
    </Layout>
  )
}
