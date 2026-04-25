// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Shop page - dual-mode: member browse view + admin editor
//          Supports colour roles and room rental packages
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import {
  PageHeader, Badge, ConfirmModal, EmptyState, toast,
  clearRoleCache,
} from "@/components/dashboard/ui"
import { ColorPicker } from "@/components/ui/color-picker"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useMemo, useEffect } from "react"
import {
  ShoppingBag, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight,
  Coins, DoorOpen, Palette, Clock, Settings, ChevronDown, ChevronRight,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface ShopItem {
  itemId: number
  roleId: string | null
  duration: number | null
  price: number
  purchasable: boolean
  itemType: string
  owned: boolean
}

interface ShopData {
  items: ShopItem[]
  roomConfig: {
    enabled: boolean
    dailyRent: number
    memberCap: number
  }
  userBalance: number
  permissions: {
    isMod: boolean
    isAdmin: boolean
  }
}

interface DiscordRole {
  id: string
  name: string
  color: number
}

export default function ShopPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: shopData, error, isLoading: loading, mutate } = useDashboard<ShopData>(
    id && session ? `/api/dashboard/servers/${id}/shop` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )

  const items = shopData?.items || []
  const serverName = serverData?.server?.name || "Server"
  const isAdmin = shopData?.permissions?.isAdmin ?? false
  const isMod = shopData?.permissions?.isMod ?? false
  const userBalance = shopData?.userBalance ?? 0
  const roomConfig = shopData?.roomConfig ?? { enabled: false, dailyRent: 1000, memberCap: 25 }

  const colourItems = useMemo(() => items.filter((i) => i.itemType === "COLOUR_ROLE"), [items])
  const roomItems = useMemo(() => items.filter((i) => i.itemType === "ROOM_RENTAL"), [items])

  const [addColourForm, setAddColourForm] = useState({ roleName: "", color: "#3b82f6", price: "" })
  const [addRoomForm, setAddRoomForm] = useState({ duration: "", price: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showAdminSection, setShowAdminSection] = useState(false)

  const [roles, setRoles] = useState<DiscordRole[]>([])
  const [rolesLoaded, setRolesLoaded] = useState(false)

  const loadRoles = async () => {
    if (rolesLoaded || !id) return
    try {
      const res = await fetch(`/api/discord/guild/${id}/roles`)
      if (res.ok) {
        const data = await res.json()
        setRoles(data)
        setRolesLoaded(true)
      }
    } catch {}
  }

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role?.name || `Role ${roleId}`
  }

  const getRoleColor = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role || role.color === 0) return "#99aab5"
    return `#${role.color.toString(16).padStart(6, "0")}`
  }

  // --- AI-REPLACED (2026-03-24) ---
  // Reason: useState initializer runs once and returns undefined; loadRoles() is an async
  // side-effect that belongs in useEffect so it re-runs when id changes.
  // What the new code does better: Properly triggers role loading as a side-effect
  // --- Original code (commented out for rollback) ---
  // useState(() => { if (id) loadRoles() })
  // --- End original code ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (id) loadRoles() }, [id])
  // --- END AI-REPLACED ---

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
      if (res.ok) { toast.success("Price updated — allow 1-2 min to take effect"); setEditingId(null); mutate() }
    } catch { toast.error("Failed to update price") }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: deleteTarget.itemId }),
      })
      if (res.ok) { toast.success("Item removed"); mutate() }
    } catch { toast.error("Failed to delete") }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const addColourItem = async () => {
    const name = addColourForm.roleName?.trim()
    const price = parseInt(addColourForm.price)
    if (!name || isNaN(price) || price < 0) return
    const colorNum = parseInt(addColourForm.color.slice(1), 16)
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
        body: JSON.stringify({ roleId: createdRole.id, price, itemType: "COLOUR_ROLE" }),
      })
      if (shopRes.ok) {
        toast.success("Colour role added to shop")
        setAddColourForm({ roleName: "", color: "#3b82f6", price: "" })
        clearRoleCache(guildId)
        setRolesLoaded(false)
        loadRoles()
        mutate()
      } else {
        const err = await shopRes.json()
        toast.error(err.error || "Failed to add item to shop")
      }
    } catch { toast.error("Error adding item") }
    setSaving(false)
  }

  const addRoomItem = async () => {
    const duration = parseInt(addRoomForm.duration)
    const price = parseInt(addRoomForm.price)
    if (isNaN(duration) || duration < 1 || duration > 30 || isNaN(price) || price < 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/shop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "ROOM_RENTAL", duration, price }),
      })
      if (res.ok) {
        toast.success("Room rental package added")
        setAddRoomForm({ duration: "", price: "" })
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add package")
      }
    } catch { toast.error("Error adding package") }
    setSaving(false)
  }

  return (
    <Layout SEO={{ title: `Shop - ${serverName} - LionBot`, description: "Server shop" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="member">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-5xl mx-auto flex gap-8">
                <ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod={isMod} />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod={isMod} />}>
        {/* --- END AI-REPLACED --- */}
            <PageHeader
              title="Shop"
              description="Browse items available for purchase with LionCoins."
            />

            {/* User Balance */}
            {!loading && (
              <div className="mb-6 flex items-center gap-3 bg-card/50 border border-border rounded-xl px-5 py-3">
                <Coins size={20} className="text-amber-400" />
                <span className="text-sm text-muted-foreground">Your balance:</span>
                <span className="text-lg font-bold text-warning">{userBalance.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">coins</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card/50 border border-border rounded-xl p-5 animate-pulse h-24" />)}
              </div>
            ) : (
              <>
                {/* Colour Roles Section */}
                <div className="mb-8">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Palette size={18} className="text-purple-400" />
                    Colour Roles
                  </h2>
                  {colourItems.length === 0 ? (
                    // --- AI-MODIFIED (2026-04-25) ---
                    // Purpose: Use shared EmptyState for consistent zero-state look
                    <div className="bg-card/30 border border-border/50 rounded-xl">
                      <EmptyState
                        compact
                        icon={<Palette size={36} strokeWidth={1.25} />}
                        title="No colour roles yet"
                        description="Add some colour role items so members can buy a vibe."
                      />
                    </div>
                    // --- END AI-MODIFIED ---
                  ) : (
                    // --- AI-MODIFIED (2026-04-25) ---
                    // Purpose: Subtle hover-lift on shop item rows for a more tactile feel
                    <div className="grid grid-cols-1 gap-3">
                      {colourItems.filter((i) => i.purchasable).map((item) => (
                        <div key={item.itemId} className="bg-card/50 border border-border rounded-xl p-4 flex items-center gap-4 transition-all motion-safe:hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md">
                    {/* --- END AI-MODIFIED --- */}
                          <div
                            className="w-8 h-8 rounded-full flex-shrink-0 border border-border/50"
                            style={{ backgroundColor: item.roleId ? getRoleColor(item.roleId) : "#99aab5" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.roleId ? getRoleName(item.roleId) : "Unknown Role"}
                            </p>
                            {item.owned && (
                              <Badge variant="success">Owned</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg text-sm text-warning">
                            <Coins size={14} /> {item.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Rentals Section */}
                {(roomItems.length > 0 || roomConfig.enabled) && (
                  <div className="mb-8">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                      <DoorOpen size={18} className="text-teal-400" />
                      Room Rentals
                      {roomConfig.enabled && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          Daily rent: {roomConfig.dailyRent.toLocaleString()} coins &middot; Max {roomConfig.memberCap} members
                        </span>
                      )}
                    </h2>
                    {roomItems.filter((i) => i.purchasable).length === 0 ? (
                      <div className="bg-card/30 border border-border/50 rounded-xl p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          {roomConfig.enabled
                            ? "No room rental packages available yet."
                            : "Private rooms are not enabled on this server."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roomItems.filter((i) => i.purchasable).map((item) => (
                          <div key={item.itemId} className="bg-card/50 border border-border rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                  <Clock size={16} className="text-teal-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {item.duration === 1 ? "1 Day" : `${item.duration} Days`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Private voice room</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center gap-1.5 text-warning text-sm font-medium">
                                <Coins size={14} /> {item.price.toLocaleString()} coins
                              </div>
                              {!roomConfig.enabled && (
                                <Badge variant="warning">Rooms Disabled</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Purchase CTA */}
                {items.some((i) => i.purchasable) && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center mb-8">
                    <p className="text-sm text-foreground">
                      Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/shop open</code> in Discord to purchase items
                    </p>
                  </div>
                )}

                {/* Admin Management Section */}
                {isAdmin && (
                  <div className="mt-8 border-t border-border pt-6">
                    <button
                      onClick={() => setShowAdminSection(!showAdminSection)}
                      className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                      <Settings size={16} />
                      Shop Management
                      {showAdminSection ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {showAdminSection && (
                      <div className="space-y-6">
                        {/* Admin: Colour Roles */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <Palette size={14} className="text-purple-400" /> Manage Colour Roles
                          </h3>

                          {colourItems.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 mb-4">
                              {colourItems.map((item) => (
                                <div key={item.itemId} className={`bg-card/50 border rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 transition-all ${item.purchasable ? "border-border" : "border-red-500/20 opacity-60"}`}>
                                  <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <Badge variant={item.purchasable ? "success" : "error"}>{item.purchasable ? "Visible" : "Hidden"}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono truncate">
                                      {item.roleId ? getRoleName(item.roleId) : `ID: ${item.roleId}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {editingId === item.itemId ? (
                                      <div className="flex items-center gap-1">
                                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                                          className="w-20 bg-muted border border-border text-foreground rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                                        <button onClick={() => savePrice(item.itemId)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={14} /></button>
                                        <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg"><X size={14} /></button>
                                      </div>
                                    ) : (
                                      <button onClick={() => { setEditingId(item.itemId); setEditPrice(String(item.price)) }}
                                        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg text-xs text-warning hover:bg-muted transition-colors">
                                        <Coins size={12} /> {item.price}
                                      </button>
                                    )}
                                    <button onClick={() => togglePurchasable(item)}
                                      className={`p-1 rounded-lg transition-colors ${item.purchasable ? "text-emerald-400 hover:bg-emerald-400/10" : "text-muted-foreground hover:bg-muted"}`}>
                                      {item.purchasable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                    </button>
                                    <button onClick={() => setDeleteTarget(item)}
                                      className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-card/50 border border-border rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                              <Plus size={14} /> Add Colour Role
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <ColorPicker
                                value={addColourForm.color}
                                onChange={(c) => setAddColourForm((f) => ({ ...f, color: c }))}
                                label="Role colour"
                              />
                              <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Role name</label>
                                <input type="text" value={addColourForm.roleName} onChange={(e) => setAddColourForm((f) => ({ ...f, roleName: e.target.value }))}
                                  placeholder="e.g. Blue Member"
                                  className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Price</label>
                                <input type="number" value={addColourForm.price} onChange={(e) => setAddColourForm((f) => ({ ...f, price: e.target.value }))}
                                  placeholder="e.g. 5000"
                                  className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              </div>
                            </div>
                            <button onClick={addColourItem} disabled={saving || !addColourForm.roleName?.trim() || !addColourForm.price}
                              className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-xs font-medium transition-all">
                              <Plus size={14} /> {saving ? "Adding..." : "Add Colour Role"}
                            </button>
                          </div>
                        </div>

                        {/* Admin: Room Rentals */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <DoorOpen size={14} className="text-teal-400" /> Manage Room Rentals
                            {!roomConfig.enabled && (
                              <Badge variant="warning">Rooms not configured</Badge>
                            )}
                          </h3>

                          {!roomConfig.enabled && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-3">
                              <p className="text-xs text-yellow-200/80">
                                Private rooms are not configured. Set a room category with <code className="bg-muted px-1 rounded">/admin config rooms</code> in Discord to enable room rentals.
                              </p>
                            </div>
                          )}

                          {roomItems.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 mb-4">
                              {roomItems.map((item) => (
                                <div key={item.itemId} className={`bg-card/50 border rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 transition-all ${item.purchasable ? "border-border" : "border-red-500/20 opacity-60"}`}>
                                  <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <Badge variant={item.purchasable ? "success" : "error"}>{item.purchasable ? "Visible" : "Hidden"}</Badge>
                                    <span className="text-xs text-foreground font-medium">
                                      {item.duration === 1 ? "1-Day" : `${item.duration}-Day`} Room
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {editingId === item.itemId ? (
                                      <div className="flex items-center gap-1">
                                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                                          className="w-20 bg-muted border border-border text-foreground rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                                        <button onClick={() => savePrice(item.itemId)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Check size={14} /></button>
                                        <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg"><X size={14} /></button>
                                      </div>
                                    ) : (
                                      <button onClick={() => { setEditingId(item.itemId); setEditPrice(String(item.price)) }}
                                        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg text-xs text-warning hover:bg-muted transition-colors">
                                        <Coins size={12} /> {item.price}
                                      </button>
                                    )}
                                    <button onClick={() => togglePurchasable(item)}
                                      className={`p-1 rounded-lg transition-colors ${item.purchasable ? "text-emerald-400 hover:bg-emerald-400/10" : "text-muted-foreground hover:bg-muted"}`}>
                                      {item.purchasable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                    </button>
                                    <button onClick={() => setDeleteTarget(item)}
                                      className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-card/50 border border-border rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                              <Plus size={14} /> Add Room Rental Package
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Duration (days)</label>
                                <input type="number" min="1" max="30" value={addRoomForm.duration}
                                  onChange={(e) => setAddRoomForm((f) => ({ ...f, duration: e.target.value }))}
                                  placeholder="e.g. 7"
                                  className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Price (coins)</label>
                                <input type="number" min="0" value={addRoomForm.price}
                                  onChange={(e) => setAddRoomForm((f) => ({ ...f, price: e.target.value }))}
                                  placeholder="e.g. 3000"
                                  className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              </div>
                            </div>
                            <button onClick={addRoomItem} disabled={saving || !addRoomForm.duration || !addRoomForm.price}
                              className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-xs font-medium transition-all">
                              <Plus size={14} /> {saving ? "Adding..." : "Add Room Package"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state when no items at all */}
                {items.length === 0 && !isAdmin && (
                  <EmptyState
                    icon={<ShoppingBag size={48} strokeWidth={1} />}
                    title="Shop is empty"
                    description="This server hasn't set up any shop items yet."
                  />
                )}

                {items.length === 0 && isAdmin && !showAdminSection && (
                  <EmptyState
                    icon={<ShoppingBag size={48} strokeWidth={1} />}
                    title="No shop items yet"
                    description="Open Shop Management below to add colour roles or room rental packages."
                  />
                )}
              </>
            )}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Remove Shop Item"
          message={deleteTarget?.itemType === "ROOM_RENTAL"
            ? "This will remove this room rental package from the shop."
            : "This will remove this item from the shop. Members who already purchased the role will keep it."
          }
          confirmLabel="Remove Item"
          variant="danger"
          loading={deleting}
        />
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
