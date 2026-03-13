// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shop editor - rebuilt with RoleSelect, role color preview
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, Badge, ConfirmModal, RoleSelect, EmptyState, toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { ShoppingBag, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Coins } from "lucide-react"

interface ShopItem {
  itemId: number
  roleId: string
  price: number
  purchasable: boolean
  itemType: string
}

export default function ShopPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [addForm, setAddForm] = useState({ roleId: "", price: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null)

  const fetchData = useCallback(async () => {
    if (!id || !session) return
    try {
      const [shopRes, serverRes] = await Promise.all([
        fetch(`/api/dashboard/servers/${id}/shop`),
        fetch(`/api/dashboard/servers/${id}`),
      ])
      if (shopRes.ok) {
        const data = await shopRes.json()
        setItems(data.items || [])
      }
      const serverData = await serverRes.json()
      setServerName(serverData.server?.name || "Server")
    } catch {}
    setLoading(false)
  }, [id, session])

  useEffect(() => { fetchData() }, [fetchData])

  const togglePurchasable = async (item: ShopItem) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.itemId, purchasable: !item.purchasable }),
      })
      if (res.ok) { toast.success(item.purchasable ? "Item hidden from shop" : "Item visible in shop"); fetchData() }
    } catch { toast.error("Failed to update") }
  }

  const savePrice = async (itemId: number) => {
    const price = parseInt(editPrice)
    if (isNaN(price) || price < 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, price }),
      })
      if (res.ok) { toast.success("Price updated"); setEditingId(null); fetchData() }
    } catch { toast.error("Failed to update price") }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: deleteTarget.itemId }),
      })
      if (res.ok) { toast.success("Item removed"); fetchData() }
    } catch { toast.error("Failed to delete") }
    setDeleteTarget(null)
  }

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
        toast.success("Shop item added")
        setAddForm({ roleId: "", price: "" })
        fetchData()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add item")
      }
    } catch { toast.error("Error adding item") }
    setSaving(false)
  }

  return (
    <Layout SEO={{ title: `Shop - ${serverName} - LionBot`, description: "Manage shop items" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />

            <PageHeader
              title="Shop"
              description="Shop items let members spend their coins. Members can buy colour roles that change their name color in the server."
            />

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                {[1, 2, 3].map((i) => <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 animate-pulse h-24" />)}
              </div>
            ) : (
              <>
                {items.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag size={48} strokeWidth={1} />}
                    title="No shop items yet"
                    description="Add your first colour role item below. Members will be able to purchase it with their coins."
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {items.map((item) => (
                      <div key={item.itemId} className={`bg-gray-800/50 border rounded-xl p-4 flex items-center gap-4 transition-all sm:flex-col sm:items-start ${item.purchasable ? "border-gray-700" : "border-red-500/20 opacity-60"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={item.purchasable ? "success" : "error"}>{item.purchasable ? "Available" : "Hidden"}</Badge>
                            <Badge variant="info">Colour Role</Badge>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">Role ID: {item.roleId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {editingId === item.itemId ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                                className="w-24 bg-gray-700 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              <button onClick={() => savePrice(item.itemId)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg"><X size={16} /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingId(item.itemId); setEditPrice(String(item.price)) }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm text-amber-400 hover:bg-gray-700 transition-colors" title="Click to edit price">
                              <Coins size={14} /> {item.price} coins
                            </button>
                          )}
                          <button onClick={() => togglePurchasable(item)}
                            className={`p-1.5 rounded-lg transition-colors ${item.purchasable ? "text-emerald-400 hover:bg-emerald-400/10" : "text-gray-400 hover:bg-gray-700"}`}
                            title={item.purchasable ? "Hide from shop" : "Show in shop"}>
                            {item.purchasable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add item form */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Plus size={16} /> Add Shop Item
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Select a role and set its price. Members can then buy this role with their coins.</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                    <RoleSelect
                      guildId={guildId}
                      value={addForm.roleId}
                      onChange={(v) => setAddForm((f) => ({ ...f, roleId: (v as string) || "" }))}
                      label="Role"
                      placeholder="Select a role..."
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                      <input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="e.g. 5000"
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <button onClick={addItem} disabled={saving || !addForm.roleId || !addForm.price}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all">
                    <Plus size={16} /> {saving ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Remove Shop Item"
          message="This will remove this item from the shop. Members who already purchased the role will keep it."
          confirmLabel="Remove Item"
          variant="danger"
        />
      </AdminGuard>
    </Layout>
  )
}
