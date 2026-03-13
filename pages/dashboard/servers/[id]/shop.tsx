// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shop editor for colour role items
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

interface ShopItem {
  id: number
  type: string
  price: number
  purchasable: boolean
  roleId: string | null
  createdAt: string | null
}

export default function ShopPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [toast, setToast] = useState("")
  const [saving, setSaving] = useState(false)
  const [addForm, setAddForm] = useState({ roleId: "", price: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState("")

  const fetchData = useCallback(async () => {
    if (!id || !session) return
    try {
      const [shopRes, serverRes] = await Promise.all([
        fetch(`/api/dashboard/servers/${id}/shop`),
        fetch(`/api/dashboard/servers/${id}`),
      ])
      if (shopRes.ok) {
        const d = await shopRes.json()
        setItems(d.items || [])
      }
      const serverData = await serverRes.json()
      setServerName(serverData.server?.name || "Server")
    } catch {}
    setLoading(false)
  }, [id, session])

  useEffect(() => { fetchData() }, [fetchData])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const addItem = async () => {
    if (!addForm.roleId || !addForm.price) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: addForm.roleId, price: parseInt(addForm.price) }),
      })
      if (res.ok) {
        showToast("Item added")
        setAddForm({ roleId: "", price: "" })
        fetchData()
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to add")
      }
    } catch { showToast("Error adding item") }
    setSaving(false)
  }

  const togglePurchasable = async (item: ShopItem) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, purchasable: !item.purchasable }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, purchasable: !i.purchasable } : i))
        showToast(item.purchasable ? "Disabled" : "Enabled")
      }
    } catch { showToast("Error toggling") }
  }

  const savePrice = async (itemId: number) => {
    const price = parseInt(editPrice)
    if (isNaN(price) || price < 0) return
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, price }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, price } : i))
        setEditingId(null)
        showToast("Price updated")
      }
    } catch { showToast("Error updating") }
  }

  const deleteItem = async (itemId: number) => {
    if (!confirm("Remove this shop item?")) return
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
      if (res.ok) { setItems(prev => prev.filter(i => i.id !== itemId)); showToast("Item removed") }
    } catch { showToast("Error removing") }
  }

  return (
    <Layout SEO={{ title: `Shop - ${serverName} - LionBot`, description: "Manage server shop" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse h-36" />)}
              </div>
            ) : (
              <>
                {/* Item grid */}
                {items.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 mb-6">
                    <span className="text-4xl block mb-3">🛍️</span>
                    <p className="text-gray-400">No shop items yet</p>
                    <p className="text-gray-500 text-sm mt-1">Add colour role items below</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className={`bg-gray-800 rounded-2xl border p-5 transition-all ${
                        item.purchasable ? "border-gray-700" : "border-red-500/20 opacity-70"
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-medium bg-pink-500/20 text-pink-300 px-2.5 py-1 rounded-lg">
                            Colour Role
                          </span>
                          <button onClick={() => deleteItem(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-all text-sm">✕</button>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-400 text-xs mb-1">Role ID</p>
                          <p className="text-white text-sm font-mono">{item.roleId || "—"}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-400 text-xs mb-1">Price</p>
                          {editingId === item.id ? (
                            <div className="flex gap-2">
                              <input type="number" value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                className="w-24 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                                onKeyDown={e => e.key === "Enter" && savePrice(item.id)} />
                              <button onClick={() => savePrice(item.id)} className="text-emerald-400 text-sm">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm">Cancel</button>
                            </div>
                          ) : (
                            <p className="text-amber-400 text-lg font-bold cursor-pointer hover:text-amber-300"
                              onClick={() => { setEditingId(item.id); setEditPrice(item.price.toString()) }}>
                              {item.price.toLocaleString()} coins
                            </p>
                          )}
                        </div>

                        <button onClick={() => togglePurchasable(item)}
                          className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                            item.purchasable
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}>
                          {item.purchasable ? "Purchasable" : "Disabled"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add item form */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                  <h3 className="text-white font-medium mb-4">Add Colour Role Item</h3>
                  <div className="flex gap-3 flex-wrap">
                    <input type="text" placeholder="Role ID" value={addForm.roleId}
                      onChange={e => setAddForm(f => ({ ...f, roleId: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none flex-1 min-w-[180px]" />
                    <input type="number" placeholder="Price" value={addForm.price}
                      onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none w-32" />
                    <button onClick={addItem} disabled={saving || !addForm.roleId || !addForm.price}
                      className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                      {saving ? "Adding..." : "Add Item"}
                    </button>
                  </div>
                </div>
              </>
            )}
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
