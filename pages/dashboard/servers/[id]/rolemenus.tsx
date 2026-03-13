// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Role menus editor - rebuilt with RoleSelect, ConfirmModal, proper design
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, Badge, ConfirmModal, RoleSelect, EmptyState, SearchSelect, toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { ListChecks, Plus, ChevronDown, ChevronRight, Trash2, ToggleLeft, ToggleRight, Pin, RotateCcw, FileText } from "lucide-react"

interface RoleEntry {
  roleEntryId: number
  roleId: string
  label: string
  emoji: string | null
  description: string | null
  price: number | null
  duration: number | null
}

interface Menu {
  menuId: number
  name: string
  menuType: string
  enabled: boolean
  sticky: boolean
  refunds: boolean
  obtainable: number | null
  defaultPrice: number | null
  eventLog: boolean
  roles: RoleEntry[]
}

const MENU_TYPE_CONFIG: Record<string, { label: string; variant: "warning" | "info" | "success"; description: string }> = {
  REACTION: { label: "Reaction", variant: "warning", description: "Members click a reaction emoji to get the role" },
  BUTTON: { label: "Button", variant: "info", description: "Members click a button to get the role" },
  DROPDOWN: { label: "Dropdown", variant: "success", description: "Members pick from a dropdown list" },
}

export default function RoleMenusPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [newMenu, setNewMenu] = useState({ name: "", menuType: "BUTTON" })
  const [addRole, setAddRole] = useState({ menuId: 0, roleId: "", label: "", emoji: "", price: "", duration: "" })
  const [deleteMenuTarget, setDeleteMenuTarget] = useState<Menu | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleEntry | null>(null)

  const api = useCallback((method: string, body: any) =>
    fetch(`/api/dashboard/servers/${id}/rolemenus`, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), [id])

  const fetchData = useCallback(async () => {
    if (!id || !session) return
    try {
      const [menusRes, serverRes] = await Promise.all([
        fetch(`/api/dashboard/servers/${id}/rolemenus`),
        fetch(`/api/dashboard/servers/${id}`),
      ])
      if (menusRes.ok) setMenus((await menusRes.json()).menus || [])
      const serverData = await serverRes.json()
      setServerName(serverData.server?.name || "Server")
    } catch {}
    setLoading(false)
  }, [id, session])

  useEffect(() => { fetchData() }, [fetchData])

  const createMenu = async () => {
    if (!newMenu.name) return
    setSaving(true)
    const res = await api("POST", { action: "createMenu", ...newMenu })
    if (res.ok) { toast.success("Menu created"); setNewMenu({ name: "", menuType: "BUTTON" }); fetchData() }
    else toast.error("Failed to create menu")
    setSaving(false)
  }

  const toggleMenu = async (menu: Menu) => {
    const res = await api("PATCH", { action: "updateMenu", menuId: menu.menuId, enabled: !menu.enabled })
    if (res.ok) {
      setMenus((prev) => prev.map((m) => m.menuId === menu.menuId ? { ...m, enabled: !m.enabled } : m))
      toast.success(menu.enabled ? "Menu disabled" : "Menu enabled")
    }
  }

  const confirmDeleteMenu = async () => {
    if (!deleteMenuTarget) return
    const res = await api("DELETE", { action: "deleteMenu", menuId: deleteMenuTarget.menuId })
    if (res.ok) { setMenus((prev) => prev.filter((m) => m.menuId !== deleteMenuTarget.menuId)); toast.success("Menu deleted") }
    setDeleteMenuTarget(null)
  }

  const addRoleToMenu = async (menuId: number) => {
    if (!addRole.roleId || !addRole.label) return
    setSaving(true)
    const res = await api("POST", {
      action: "addRole",
      menuId,
      roleId: addRole.roleId,
      label: addRole.label,
      emoji: addRole.emoji || null,
      price: addRole.price ? parseInt(addRole.price) : null,
      duration: addRole.duration ? parseInt(addRole.duration) : null,
    })
    if (res.ok) { toast.success("Role added to menu"); setAddRole({ menuId: 0, roleId: "", label: "", emoji: "", price: "", duration: "" }); fetchData() }
    else toast.error("Failed to add role")
    setSaving(false)
  }

  const confirmDeleteRole = async () => {
    if (!deleteRoleTarget) return
    const res = await api("DELETE", { action: "deleteRole", roleEntryId: deleteRoleTarget.roleEntryId })
    if (res.ok) { toast.success("Role removed from menu"); fetchData() }
    setDeleteRoleTarget(null)
  }

  return (
    <Layout SEO={{ title: `Role Menus - ${serverName} - LionBot`, description: "Manage role menus" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />

            <PageHeader
              title="Role Menus"
              description="Role menus let members assign themselves roles. Create a menu, add roles to it, and members can pick the ones they want."
            />

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse h-20" />)}
              </div>
            ) : (
              <>
                {menus.length === 0 ? (
                  <EmptyState
                    icon={<ListChecks size={48} strokeWidth={1} />}
                    title="No role menus yet"
                    description="Create your first role menu below. You can add roles that members can assign to themselves."
                  />
                ) : (
                  <div className="space-y-3 mb-6">
                    {menus.map((menu) => {
                      const typeConfig = MENU_TYPE_CONFIG[menu.menuType] || MENU_TYPE_CONFIG.BUTTON
                      const isExpanded = expandedId === menu.menuId

                      return (
                        <div key={menu.menuId} className={`bg-gray-800/50 border rounded-xl overflow-hidden transition-all ${menu.enabled ? "border-gray-700" : "border-red-500/20 opacity-75"}`}>
                          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/20 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : menu.menuId)}>
                            <div className="flex items-center gap-3 min-w-0">
                              {isExpanded ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                              <h3 className="text-white font-medium truncate">{menu.name}</h3>
                              <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                              <span className="text-gray-500 text-xs">{menu.roles.length} role{menu.roles.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => toggleMenu(menu)}
                                className={`p-1.5 rounded-lg transition-colors ${menu.enabled ? "text-emerald-400 hover:bg-emerald-400/10" : "text-gray-400 hover:bg-gray-700"}`}
                                title={menu.enabled ? "Disable menu" : "Enable menu"}>
                                {menu.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                              </button>
                              <button onClick={() => setDeleteMenuTarget(menu)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete menu">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-gray-700">
                              <div className="px-4 py-2 bg-gray-800/30 flex flex-wrap gap-2 text-xs">
                                <span className="text-gray-400">{typeConfig.description}</span>
                                {menu.sticky && <Badge variant="purple">Sticky</Badge>}
                                {menu.refunds && <Badge variant="info">Refunds</Badge>}
                                {menu.eventLog && <Badge variant="default">Event Log</Badge>}
                                {menu.obtainable !== null && <Badge variant="default">{`Max: ${menu.obtainable}`}</Badge>}
                                {menu.defaultPrice !== null && <Badge variant="warning">{`Price: ${menu.defaultPrice}`}</Badge>}
                              </div>

                              {menu.roles.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-700 bg-gray-800/50">
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Label</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Emoji</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                                        <th className="px-4 py-2.5 w-12" />
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/30">
                                      {menu.roles.map((role) => (
                                        <tr key={role.roleEntryId} className="hover:bg-gray-800/30 transition-colors">
                                          <td className="px-4 py-2.5 text-white">{role.label}</td>
                                          <td className="px-4 py-2.5">{role.emoji || "—"}</td>
                                          <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{role.roleId}</td>
                                          <td className="px-4 py-2.5 text-amber-400">{role.price != null ? `${role.price} coins` : "Free"}</td>
                                          <td className="px-4 py-2.5 text-gray-400">{role.duration != null ? `${Math.round(role.duration / 3600)}h` : "Permanent"}</td>
                                          <td className="px-4 py-2.5">
                                            <button onClick={() => setDeleteRoleTarget(role)}
                                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                                              <Trash2 size={14} />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              <div className="p-4 border-t border-gray-700">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Add Role to Menu</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 mb-3">
                                  <RoleSelect
                                    guildId={guildId}
                                    value={addRole.menuId === menu.menuId ? addRole.roleId : ""}
                                    onChange={(v) => setAddRole((f) => ({ ...f, menuId: menu.menuId, roleId: (v as string) || "" }))}
                                    placeholder="Select role..."
                                  />
                                  <input type="text" placeholder="Button label (required)" value={addRole.menuId === menu.menuId ? addRole.label : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, label: e.target.value }))}
                                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 mb-3">
                                  <input type="text" placeholder="Emoji (optional)" value={addRole.menuId === menu.menuId ? addRole.emoji : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, emoji: e.target.value }))}
                                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  <input type="number" placeholder="Price (optional)" value={addRole.menuId === menu.menuId ? addRole.price : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, price: e.target.value }))}
                                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  <input type="number" placeholder="Duration in seconds (optional)" value={addRole.menuId === menu.menuId ? addRole.duration : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, duration: e.target.value }))}
                                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <button onClick={() => addRoleToMenu(menu.menuId)}
                                  disabled={saving || (addRole.menuId === menu.menuId ? !addRole.roleId || !addRole.label : true)}
                                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all">
                                  <Plus size={16} /> {saving ? "Adding..." : "Add Role"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Create menu form */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Plus size={16} /> Create New Role Menu
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Choose a name and type for your role menu. Button menus are the most common choice.</p>
                  <div className="flex gap-3 flex-wrap">
                    <input type="text" placeholder="Menu name" value={newMenu.name}
                      onChange={(e) => setNewMenu((f) => ({ ...f, name: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[180px]" />
                    <SearchSelect
                      options={[
                        { value: "BUTTON", label: "Button" },
                        { value: "DROPDOWN", label: "Dropdown" },
                        { value: "REACTION", label: "Reaction" },
                      ]}
                      value={newMenu.menuType}
                      onChange={(v) => setNewMenu((f) => ({ ...f, menuType: (v as string) || "BUTTON" }))}
                      placeholder="Type"
                      clearable={false}
                    />
                    <button onClick={createMenu} disabled={saving || !newMenu.name}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all">
                      <Plus size={16} /> {saving ? "Creating..." : "Create Menu"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <ConfirmModal
          open={!!deleteMenuTarget}
          onConfirm={confirmDeleteMenu}
          onCancel={() => setDeleteMenuTarget(null)}
          title="Delete Role Menu"
          message={`This will permanently delete "${deleteMenuTarget?.name}" and all its roles. Members who already have these roles will keep them.`}
          confirmLabel="Delete Menu"
          variant="danger"
        />

        <ConfirmModal
          open={!!deleteRoleTarget}
          onConfirm={confirmDeleteRole}
          onCancel={() => setDeleteRoleTarget(null)}
          title="Remove Role from Menu"
          message={`This will remove "${deleteRoleTarget?.label}" from the menu. Members who already have this role will keep it.`}
          confirmLabel="Remove Role"
          variant="warning"
        />
      </AdminGuard>
    </Layout>
  )
}
