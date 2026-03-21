// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Role menus editor - rebuilt with RoleSelect, ConfirmModal, proper design
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader, Badge, ConfirmModal, RoleSelect, EmptyState, SearchSelect, toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback } from "react"
import { ListChecks, Plus, ChevronDown, ChevronRight, Trash2, ToggleLeft, ToggleRight, Pin, RotateCcw, FileText } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

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
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: menusData, error, isLoading: loading, mutate } = useDashboard<{ menus: Menu[] }>(
    id && session ? `/api/dashboard/servers/${id}/rolemenus` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const menus = menusData?.menus || []
  const serverName = serverData?.server?.name || "Server"
  // --- END AI-MODIFIED ---
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [newMenu, setNewMenu] = useState({ name: "", menuType: "BUTTON" })
  const [addRole, setAddRole] = useState({ menuId: 0, roleId: "", label: "", emoji: "", price: "", duration: "" })
  const [deleteMenuTarget, setDeleteMenuTarget] = useState<Menu | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleEntry | null>(null)
  const [deletingMenu, setDeletingMenu] = useState(false)
  const [deletingRole, setDeletingRole] = useState(false)

  const api = useCallback((method: string, body: any) =>
    fetch(`/api/dashboard/servers/${id}/rolemenus`, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), [id])

  const createMenu = async () => {
    if (!newMenu.name) return
    setSaving(true)
    const res = await api("POST", { action: "createMenu", ...newMenu })
    if (res.ok) { toast.success("Menu created"); setNewMenu({ name: "", menuType: "BUTTON" }); mutate() }
    else toast.error("Failed to create menu")
    setSaving(false)
  }

  const toggleMenu = async (menu: Menu) => {
    const res = await api("PATCH", { action: "updateMenu", menuId: menu.menuId, enabled: !menu.enabled })
    if (res.ok) {
      toast.success(menu.enabled ? "Menu disabled" : "Menu enabled")
      mutate()
    }
  }

  const confirmDeleteMenu = async () => {
    if (!deleteMenuTarget) return
    setDeletingMenu(true)
    const res = await api("DELETE", { action: "deleteMenu", menuId: deleteMenuTarget.menuId })
    if (res.ok) { toast.success("Menu deleted"); mutate() }
    setDeleteMenuTarget(null)
    setDeletingMenu(false)
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
    if (res.ok) { toast.success("Role added to menu"); setAddRole({ menuId: 0, roleId: "", label: "", emoji: "", price: "", duration: "" }); mutate() }
    else toast.error("Failed to add role")
    setSaving(false)
  }

  const confirmDeleteRole = async () => {
    if (!deleteRoleTarget) return
    setDeletingRole(true)
    const res = await api("DELETE", { action: "deleteRole", roleEntryId: deleteRoleTarget.roleEntryId })
    if (res.ok) { toast.success("Role removed from menu"); mutate() }
    setDeleteRoleTarget(null)
    setDeletingRole(false)
  }

  return (
    <Layout SEO={{ title: `Role Menus - ${serverName} - LionBot`, description: "Manage role menus" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
            <PageHeader
              title="Role Menus"
              description="Role menus let members assign themselves roles. Create a menu, add roles to it, and members can pick the ones they want."
            />

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse h-20" />)}
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
                        <div key={menu.menuId} className={`bg-card/50 border rounded-xl overflow-hidden transition-all ${menu.enabled ? "border-border" : "border-red-500/20 opacity-75"}`}>
                          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : menu.menuId)}>
                            <div className="flex items-center gap-3 min-w-0">
                              {isExpanded ? <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />}
                              <h3 className="text-foreground font-medium truncate">{menu.name}</h3>
                              <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                              <span className="text-muted-foreground text-xs">{menu.roles.length} role{menu.roles.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => toggleMenu(menu)}
                                className={`p-1.5 rounded-lg transition-colors ${menu.enabled ? "text-emerald-400 hover:bg-emerald-400/10" : "text-muted-foreground hover:bg-accent"}`}
                                title={menu.enabled ? "Disable menu" : "Enable menu"}>
                                {menu.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                              </button>
                              <button onClick={() => setDeleteMenuTarget(menu)}
                                className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete menu">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-border">
                              <div className="px-4 py-2 bg-card/30 flex flex-wrap gap-2 text-xs">
                                <span className="text-muted-foreground">{typeConfig.description}</span>
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
                                      <tr className="border-b border-border bg-card/50">
                                        {/* --- AI-MODIFIED (2026-03-21) --- */}
                                        {/* Purpose: Hide non-essential columns on mobile */}
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Label</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Emoji</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Price</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Duration</th>
                                        <th className="px-4 py-2.5 w-12" />
                                        {/* --- END AI-MODIFIED --- */}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                      {menu.roles.map((role) => (
                                        <tr key={role.roleEntryId} className="hover:bg-card/30 transition-colors">
                                          {/* --- AI-MODIFIED (2026-03-21) --- */}
                                          {/* Purpose: Hide non-essential columns on mobile (matching hidden th above) */}
                                          <td className="px-4 py-2.5 text-foreground">{role.label}</td>
                                          <td className="px-4 py-2.5 hidden sm:table-cell">{role.emoji || "—"}</td>
                                          <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{role.roleId}</td>
                                          <td className="px-4 py-2.5 text-warning hidden sm:table-cell">{role.price != null ? `${role.price} coins` : "Free"}</td>
                                          <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{role.duration != null ? `${Math.round(role.duration / 3600)}h` : "Permanent"}</td>
                                          {/* --- END AI-MODIFIED --- */}
                                          <td className="px-4 py-2.5">
                                            <button onClick={() => setDeleteRoleTarget(role)}
                                              className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                                              <Trash2 size={14} />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              <div className="p-4 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Add Role to Menu</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 mb-3">
                                  <RoleSelect
                                    guildId={guildId}
                                    value={addRole.menuId === menu.menuId ? addRole.roleId : ""}
                                    onChange={(v) => setAddRole((f) => ({ ...f, menuId: menu.menuId, roleId: (v as string) || "" }))}
                                    placeholder="Select role..."
                                  />
                                  <input type="text" placeholder="Button label (required)" value={addRole.menuId === menu.menuId ? addRole.label : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, label: e.target.value }))}
                                    className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 mb-3">
                                  <input type="text" placeholder="Emoji (optional)" value={addRole.menuId === menu.menuId ? addRole.emoji : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, emoji: e.target.value }))}
                                    className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                  <input type="number" placeholder="Price (optional)" value={addRole.menuId === menu.menuId ? addRole.price : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, price: e.target.value }))}
                                    className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                  <input type="number" placeholder="Duration in seconds (optional)" value={addRole.menuId === menu.menuId ? addRole.duration : ""}
                                    onChange={(e) => setAddRole((f) => ({ ...f, menuId: menu.menuId, duration: e.target.value }))}
                                    className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <button onClick={() => addRoleToMenu(menu.menuId)}
                                  disabled={saving || (addRole.menuId === menu.menuId ? !addRole.roleId || !addRole.label : true)}
                                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-sm font-medium transition-all">
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
                <div className="bg-card/50 border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Plus size={16} /> Create New Role Menu
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Choose a name and type for your role menu. Button menus are the most common choice.</p>
                  <div className="flex gap-3 flex-wrap">
                    <input type="text" placeholder="Menu name" value={newMenu.name}
                      onChange={(e) => setNewMenu((f) => ({ ...f, name: e.target.value }))}
                      className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-0" />
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
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg text-sm font-medium transition-all">
                      <Plus size={16} /> {saving ? "Creating..." : "Create Menu"}
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
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
          loading={deletingMenu}
        />

        <ConfirmModal
          open={!!deleteRoleTarget}
          onConfirm={confirmDeleteRole}
          onCancel={() => setDeleteRoleTarget(null)}
          title="Remove Role from Menu"
          message={`This will remove "${deleteRoleTarget?.label}" from the menu. Members who already have this role will keep it.`}
          confirmLabel="Remove Role"
          variant="warning"
          loading={deletingRole}
        />
      </ServerGuard>
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
