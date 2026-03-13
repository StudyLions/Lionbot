// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Role menus editor with expandable menu list
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"

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

const menuTypeBadge: Record<string, { label: string; cls: string }> = {
  REACTION: { label: "Reaction", cls: "bg-amber-500/20 text-amber-300" },
  BUTTON: { label: "Button", cls: "bg-indigo-500/20 text-indigo-300" },
  DROPDOWN: { label: "Dropdown", cls: "bg-emerald-500/20 text-emerald-300" },
}

export default function RoleMenusPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [saving, setSaving] = useState(false)
  const [newMenu, setNewMenu] = useState({ name: "", menuType: "BUTTON" })
  const [addRole, setAddRole] = useState({ menuId: 0, roleId: "", label: "", emoji: "", description: "", price: "", duration: "" })

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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const createMenu = async () => {
    if (!newMenu.name) return
    setSaving(true)
    const res = await api("POST", { action: "createMenu", ...newMenu })
    if (res.ok) { showToast("Menu created"); setNewMenu({ name: "", menuType: "BUTTON" }); fetchData() }
    else showToast("Failed to create menu")
    setSaving(false)
  }

  const toggleMenu = async (menu: Menu) => {
    const res = await api("PATCH", { action: "updateMenu", menuId: menu.menuId, enabled: !menu.enabled })
    if (res.ok) {
      setMenus(prev => prev.map(m => m.menuId === menu.menuId ? { ...m, enabled: !m.enabled } : m))
      showToast(menu.enabled ? "Menu disabled" : "Menu enabled")
    }
  }

  const deleteMenu = async (menuId: number) => {
    if (!confirm("Delete this role menu and all its roles?")) return
    const res = await api("DELETE", { action: "deleteMenu", menuId })
    if (res.ok) { setMenus(prev => prev.filter(m => m.menuId !== menuId)); showToast("Menu deleted") }
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
      description: addRole.description || null,
      price: addRole.price ? parseInt(addRole.price) : null,
      duration: addRole.duration ? parseInt(addRole.duration) : null,
    })
    if (res.ok) { showToast("Role added"); setAddRole({ menuId: 0, roleId: "", label: "", emoji: "", description: "", price: "", duration: "" }); fetchData() }
    else showToast("Failed to add role")
    setSaving(false)
  }

  const deleteRole = async (roleEntryId: number) => {
    if (!confirm("Remove this role from the menu?")) return
    const res = await api("DELETE", { action: "deleteRole", roleEntryId })
    if (res.ok) { showToast("Role removed"); fetchData() }
  }

  return (
    <Layout SEO={{ title: `Role Menus - ${serverName} - LionBot`, description: "Manage role menus" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin isMod />

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse h-20" />)}
              </div>
            ) : (
              <>
                {/* Menu list */}
                {menus.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 mb-6">
                    <span className="text-4xl block mb-3">📋</span>
                    <p className="text-gray-400">No role menus configured yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {menus.map((menu) => {
                      const badge = menuTypeBadge[menu.menuType] || menuTypeBadge.BUTTON
                      const isExpanded = expandedId === menu.menuId

                      return (
                        <div key={menu.menuId} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                          {/* Menu header */}
                          <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-750/50"
                            onClick={() => setExpandedId(isExpanded ? null : menu.menuId)}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-lg">{isExpanded ? "▾" : "▸"}</span>
                              <h3 className="text-white font-medium truncate">{menu.name}</h3>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <span className="text-gray-500 text-xs">{menu.roles.length} role{menu.roles.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); toggleMenu(menu) }}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  menu.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                {menu.enabled ? "Enabled" : "Disabled"}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); deleteMenu(menu.menuId) }}
                                className="text-gray-500 hover:text-red-400 text-sm px-2">✕</button>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="border-t border-gray-700">
                              {/* Menu settings */}
                              <div className="p-4 bg-gray-800/50 flex flex-wrap gap-3 text-xs">
                                {menu.sticky && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Sticky</span>}
                                {menu.refunds && <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Refunds</span>}
                                {menu.eventLog && <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Event Log</span>}
                                {menu.obtainable !== null && <span className="text-gray-400">Max: {menu.obtainable}</span>}
                                {menu.defaultPrice !== null && <span className="text-gray-400">Default price: {menu.defaultPrice}</span>}
                              </div>

                              {/* Roles table */}
                              {menu.roles.length > 0 && (
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-700 text-left">
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500">Label</th>
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500">Emoji</th>
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500">Role ID</th>
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500">Price</th>
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500">Duration</th>
                                      <th className="px-5 py-2 text-xs uppercase tracking-wide text-gray-500 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-700/30">
                                    {menu.roles.map((role) => (
                                      <tr key={role.roleEntryId} className="hover:bg-gray-750/30">
                                        <td className="px-5 py-2.5 text-sm text-white">{role.label}</td>
                                        <td className="px-5 py-2.5 text-sm">{role.emoji || "—"}</td>
                                        <td className="px-5 py-2.5 text-xs text-gray-400 font-mono">{role.roleId}</td>
                                        <td className="px-5 py-2.5 text-sm text-amber-400">{role.price != null ? `${role.price} coins` : "—"}</td>
                                        <td className="px-5 py-2.5 text-sm text-gray-400">{role.duration != null ? `${role.duration}s` : "Permanent"}</td>
                                        <td className="px-5 py-2.5 text-right">
                                          <button onClick={() => deleteRole(role.roleEntryId)}
                                            className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}

                              {/* Add role form */}
                              <div className="p-4 border-t border-gray-700">
                                <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Add Role</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                  <input type="text" placeholder="Role ID *" value={addRole.menuId === menu.menuId ? addRole.roleId : ""}
                                    onFocus={() => setAddRole(f => ({ ...f, menuId: menu.menuId }))}
                                    onChange={e => setAddRole(f => ({ ...f, menuId: menu.menuId, roleId: e.target.value }))}
                                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                                  <input type="text" placeholder="Label *" value={addRole.menuId === menu.menuId ? addRole.label : ""}
                                    onChange={e => setAddRole(f => ({ ...f, menuId: menu.menuId, label: e.target.value }))}
                                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                                  <input type="text" placeholder="Emoji" value={addRole.menuId === menu.menuId ? addRole.emoji : ""}
                                    onChange={e => setAddRole(f => ({ ...f, menuId: menu.menuId, emoji: e.target.value }))}
                                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                                  <input type="number" placeholder="Price" value={addRole.menuId === menu.menuId ? addRole.price : ""}
                                    onChange={e => setAddRole(f => ({ ...f, menuId: menu.menuId, price: e.target.value }))}
                                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                                  <button onClick={() => addRoleToMenu(menu.menuId)}
                                    disabled={saving || (addRole.menuId === menu.menuId ? !addRole.roleId || !addRole.label : true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all">
                                    {saving ? "..." : "Add"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Create menu form */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                  <h3 className="text-white font-medium mb-4">Create New Role Menu</h3>
                  <div className="flex gap-3 flex-wrap">
                    <input type="text" placeholder="Menu name" value={newMenu.name}
                      onChange={e => setNewMenu(f => ({ ...f, name: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none flex-1 min-w-[180px]" />
                    <select value={newMenu.menuType} onChange={e => setNewMenu(f => ({ ...f, menuType: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none">
                      <option value="BUTTON">Button</option>
                      <option value="DROPDOWN">Dropdown</option>
                      <option value="REACTION">Reaction</option>
                    </select>
                    <button onClick={createMenu} disabled={saving || !newMenu.name}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                      {saving ? "Creating..." : "Create Menu"}
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
