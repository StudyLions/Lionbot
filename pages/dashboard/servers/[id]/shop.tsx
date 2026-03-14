// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shop editor - rebuilt with RoleSelect, role color preview
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: Phase 2C - replace RoleSelect with ColorPicker + role name; create role via API then add to shop
import {
  PageHeader, Badge, ConfirmModal, EmptyState, toast,
  clearRoleCache,
} from "@/components/dashboard/ui"
import { ColorPicker } from "@/components/ui/color-picker"
// --- END AI-MODIFIED ---
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import { ShoppingBag, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Coins } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

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
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: shopData, error, isLoading: loading, mutate } = useDashboard<{ items: ShopItem[] }>(
    id && session ? `/api/dashboard/servers/${id}/shop` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const items = shopData?.items || []
  const serverName = serverData?.server?.name || "Server"
  // --- END AI-MODIFIED ---
  const [addForm, setAddForm] = useState({ roleName: "", color: "#3b82f6", price: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const togglePurchasable = async (item: ShopItem) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.itemId, purchasable: !item.purchasable }),
      })
      if (res.ok) { toast.success(item.purchasable ? "Item hidden from shop" : "Item visible in shop"); mutate() }
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
      if (res.ok) { toast.success("Price updated"); setEditingId(null); mutate() }
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
      if (res.ok) { toast.success("Item removed"); mutate() }
    } catch { toast.error("Failed to delete") }
    setDeleteTarget(null)
  }

  const addItem = async () => {
    const name = addForm.roleName?.trim()
    const price = parseInt(addForm.price)
    if (!name || isNaN(price) || price < 0) return
    const colorNum = parseInt(addForm.color.slice(1), 16)
    if (isNaN(colorNum)) return
    setSaving(true)
    try {
      const roleRes = await fetch(`/api/discord/guild/${id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color: colorNum }),
      })
      if (!roleRes.ok) {
        const err = await roleRes.json()
        toast.error(err.error || "Failed to create role")
        setSaving(false)
        return
      }
      const createdRole = await roleRes.json()
      const shopRes = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: createdRole.id, price }),
      })
      if (shopRes.ok) {
        toast.success("Shop item added")
        setAddForm({ roleName: "", color: "#3b82f6", price: "" })
        clearRoleCache(guildId)
        mutate()
      } else {
        const err = await shopRes.json()
        toast.error(err.error || "Failed to add item to shop")
      }
    } catch { toast.error("Error adding item") }
    setSaving(false)
  }

  return (
    <Layout SEO={{ title: `Shop - ${serverName} - LionBot`, description: "Manage shop items" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
            <PageHeader
              title="Shop"
              description="Shop items let members spend their coins. Members can buy colour roles that change their name color in the server."
            />

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card/50 border border-border rounded-xl p-5 animate-pulse h-24" />)}
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
                      <div key={item.itemId} className={`bg-card/50 border rounded-xl p-4 flex items-center gap-4 transition-all sm:flex-col sm:items-start ${item.purchasable ? "border-border" : "border-red-500/20 opacity-60"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={item.purchasable ? "success" : "error"}>{item.purchasable ? "Available" : "Hidden"}</Badge>
                            <Badge variant="info">Colour Role</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">Role ID: {item.roleId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {editingId === item.itemId ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                                className="w-24 bg-muted border border-border text-foreground rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                              <button onClick={() => savePrice(item.itemId)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"><X size={16} /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingId(item.itemId); setEditPrice(String(item.price)) }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg text-sm text-warning hover:bg-muted transition-colors" title="Click to edit price">
                              <Coins size={14} /> {item.price} coins
                            </button>
                          )}
                          <button onClick={() => togglePurchasable(item)}
                            className={`p-1.5 rounded-lg transition-colors ${item.purchasable ? "text-emerald-400 hover:bg-emerald-400/10" : "text-muted-foreground hover:bg-muted"}`}
                            title={item.purchasable ? "Hide from shop" : "Show in shop"}>
                            {item.purchasable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add item form */}
                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Plus size={16} /> Add Shop Item
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Create a colour role and set its price. Members can then buy this role with their coins.</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                    <ColorPicker
                      value={addForm.color}
                      onChange={(c) => setAddForm((f) => ({ ...f, color: c }))}
                      label="Role colour"
                    />
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Role name</label>
                      <input type="text" value={addForm.roleName} onChange={(e) => setAddForm((f) => ({ ...f, roleName: e.target.value }))}
                        placeholder="e.g. Blue Member"
                        className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Price</label>
                      <input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="e.g. 5000"
                        className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <button onClick={addItem} disabled={saving || !addForm.roleName?.trim() || !addForm.price}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-sm font-medium transition-all">
                    <Plus size={16} /> {saving ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </>
            )}
            </div>
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
          loading={deleting}
        />
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
