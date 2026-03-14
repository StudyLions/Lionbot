// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Members list with slide-out detail panel, moderation
//          actions, economy editing, and bulk operations
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign with checkboxes, detail panel, action modals, filters, bulk bar
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
import MemberDetailPanel from "@/components/dashboard/MemberDetailPanel"
import {
  WarnModal, NoteModal, RestrictModal, CoinAdjustModal,
  BulkActionModal, ResolveModal,
} from "@/components/dashboard/MemberActionModals"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Users, Download, MoreHorizontal, AlertTriangle, Coins,
  Eye, ChevronLeft, ChevronRight, Search, Filter,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface Member {
  userId: string
  displayName: string | null
  trackedTimeHours: number
  coins: number
  workoutCount: number
  firstJoined: string | null
  lastLeft: string | null
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface MembersResponse {
  members: Member[]
  pagination: Pagination
}

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sort, setSort] = useState("tracked_time")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [panelUserId, setPanelUserId] = useState<string | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const [warnTarget, setWarnTarget] = useState<{ userId: string; name: string } | null>(null)
  const [noteTarget, setNoteTarget] = useState<{ userId: string; name: string } | null>(null)
  const [restrictTarget, setRestrictTarget] = useState<{ userId: string; name: string; priorRestrictions: number; nextDuration: string } | null>(null)
  const [coinTarget, setCoinTarget] = useState<{ userId: string; name: string; balance: number } | null>(null)
  const [resolveTarget, setResolveTarget] = useState<{ userId: string; ticketIds: number[] } | null>(null)
  const [bulkOp, setBulkOp] = useState<"coins" | "warn" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const membersKey = id && session
    ? `/api/dashboard/servers/${id}/members?page=${currentPage}&sort=${sort}&order=${order}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    : null
  const { data: membersData, error, isLoading: loading } = useDashboard<MembersResponse>(membersKey)
  const { data: serverData } = useDashboard(id && session ? `/api/dashboard/servers/${id}` : null)
  const { data: permsData } = useDashboard(id && session ? `/api/dashboard/servers/${id}/permissions` : null)

  const panelDetailKey = panelUserId && id ? `/api/dashboard/servers/${id}/members/${panelUserId}` : null
  const { data: panelData, isLoading: panelLoading } = useDashboard(panelDetailKey)

  const members = membersData?.members ?? []
  const pagination = membersData?.pagination ?? null
  const serverName = (serverData as any)?.server?.name ?? "Server"
  const isAdmin = (permsData as any)?.isAdmin ?? false

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchInput])

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(members.map((m) => m.userId)))
    }
  }

  const refreshData = useCallback(() => {
    if (membersKey) invalidate(membersKey)
    if (panelDetailKey) invalidate(panelDetailKey)
  }, [membersKey, panelDetailKey])

  async function apiAction(url: string, method: string, body?: any) {
    setActionLoading(true)
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Action failed")
      toast.success(data.message || "Done")
      refreshData()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  const exportCSV = () => {
    const header = "User ID,Display Name,Study Hours,Coins,Workouts,First Joined\n"
    const rows = members.map((m) =>
      `${m.userId},"${(m.displayName || "").replace(/"/g, '""')}",${m.trackedTimeHours},${m.coins},${m.workoutCount},${m.firstJoined || ""}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `members-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  const openMemberPanel = (userId: string) => {
    setPanelUserId(userId)
    setActionMenuId(null)
  }

  return (
    <Layout SEO={{ title: `Members - ${serverName} - LionBot`, description: "Server members" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={id as string} serverName={serverName} isAdmin={isAdmin} isMod={(permsData as any)?.isModerator} />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Members"
                description="View, search, and manage server members. Click any member for full details."
                actions={pagination && <Badge variant="info" size="md">{`${pagination.total.toLocaleString()} members`}</Badge>}
              />

              {/* Search + Actions Bar */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <input
                    type="text"
                    placeholder="Search by name or user ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Members Table */}
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-14" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">{error.message || "Failed to load members"}</div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="w-10 py-3 px-3">
                          <input
                            type="checkbox"
                            checked={members.length > 0 && selectedIds.size === members.length}
                            onChange={toggleAll}
                            className="rounded border-border accent-primary"
                          />
                        </th>
                        <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                        <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Study</th>
                        <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Coins</th>
                        <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Joined</th>
                        <th className="w-10 py-3 px-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">{search ? "No members match your search" : "No members found"}</td></tr>
                      ) : (
                        members.map((m) => (
                          <tr
                            key={m.userId}
                            onClick={() => openMemberPanel(m.userId)}
                            className={`border-b border-border/30 last:border-0 cursor-pointer transition-colors ${
                              selectedIds.has(m.userId) ? "bg-primary/10" : "hover:bg-accent"
                            }`}
                          >
                            <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(m.userId)}
                                onChange={() => toggleSelect(m.userId)}
                                className="rounded border-border accent-primary"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-foreground font-medium">{m.displayName || `User ...${m.userId.slice(-4)}`}</span>
                            </td>
                            <td className="py-3 px-3 text-right hidden sm:table-cell">
                              <span className="text-success font-mono text-sm">{m.trackedTimeHours}h</span>
                            </td>
                            <td className="py-3 px-3 text-right hidden sm:table-cell">
                              <span className="text-warning font-mono text-sm">{m.coins.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-3 text-right hidden md:table-cell">
                              <span className="text-muted-foreground text-sm">{m.firstJoined ? new Date(m.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "--"}</span>
                            </td>
                            <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                              <div className="relative">
                                <button
                                  onClick={() => setActionMenuId(actionMenuId === m.userId ? null : m.userId)}
                                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal size={16} />
                                </button>
                                {actionMenuId === m.userId && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setActionMenuId(null)} />
                                    <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-card border border-border rounded-lg shadow-xl py-1">
                                      <button onClick={() => { openMemberPanel(m.userId); setActionMenuId(null) }} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"><Eye size={14} /> View Profile</button>
                                      <button onClick={() => { setWarnTarget({ userId: m.userId, name: m.displayName || m.userId }); setActionMenuId(null) }} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-accent flex items-center gap-2"><AlertTriangle size={14} /> Add Warning</button>
                                      <button onClick={() => { setCoinTarget({ userId: m.userId, name: m.displayName || m.userId, balance: m.coins }); setActionMenuId(null) }} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-accent flex items-center gap-2"><Coins size={14} /> Adjust Coins</button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage((p) => p - 1)} disabled={pagination.page <= 1} className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button onClick={() => setCurrentPage((p) => p + 1)} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Bulk Action Bar */}
              {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-card border border-border rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
                  <div className="w-px h-6 bg-border" />
                  <button onClick={() => setBulkOp("coins")} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm hover:bg-amber-500/15 transition-colors">
                    <Coins size={14} /> Adjust Coins
                  </button>
                  {isAdmin && (
                    <button onClick={() => setBulkOp("warn")} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/15 transition-colors">
                      <AlertTriangle size={14} /> Add Warning
                    </button>
                  )}
                  <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Member Detail Panel */}
        <MemberDetailPanel
          open={!!panelUserId}
          onClose={() => setPanelUserId(null)}
          data={panelData as any}
          loading={panelLoading}
          onWarn={() => {
            if (panelData) setWarnTarget({ userId: (panelData as any).member.userId, name: (panelData as any).member.displayName || (panelData as any).member.userId })
          }}
          onNote={() => {
            if (panelData) setNoteTarget({ userId: (panelData as any).member.userId, name: (panelData as any).member.displayName || (panelData as any).member.userId })
          }}
          onRestrict={() => {
            if (panelData) setRestrictTarget({
              userId: (panelData as any).member.userId,
              name: (panelData as any).member.displayName || (panelData as any).member.userId,
              priorRestrictions: (panelData as any).restrictionEscalation.priorRestrictions,
              nextDuration: (panelData as any).restrictionEscalation.nextDuration,
            })
          }}
          onResolve={(ticketIds) => {
            if (panelData) setResolveTarget({ userId: (panelData as any).member.userId, ticketIds })
          }}
          onAdjustCoins={() => {
            if (panelData) setCoinTarget({ userId: (panelData as any).member.userId, name: (panelData as any).member.displayName || (panelData as any).member.userId, balance: (panelData as any).member.coins })
          }}
        />

        {/* Action Modals */}
        <WarnModal
          open={!!warnTarget}
          onClose={() => setWarnTarget(null)}
          loading={actionLoading}
          memberName={warnTarget?.name || ""}
          onConfirm={(reason) => {
            apiAction(`/api/dashboard/servers/${id}/members/${warnTarget?.userId}/warn`, "POST", { reason })
              .then(() => setWarnTarget(null))
          }}
        />
        <NoteModal
          open={!!noteTarget}
          onClose={() => setNoteTarget(null)}
          loading={actionLoading}
          memberName={noteTarget?.name || ""}
          onConfirm={(content) => {
            apiAction(`/api/dashboard/servers/${id}/members/${noteTarget?.userId}/note`, "POST", { content })
              .then(() => setNoteTarget(null))
          }}
        />
        <RestrictModal
          open={!!restrictTarget}
          onClose={() => setRestrictTarget(null)}
          loading={actionLoading}
          memberName={restrictTarget?.name || ""}
          priorRestrictions={restrictTarget?.priorRestrictions ?? 0}
          nextEscalationDuration={restrictTarget?.nextDuration ?? "N/A"}
          onConfirm={(durationHours, reason) => {
            apiAction(`/api/dashboard/servers/${id}/members/${restrictTarget?.userId}/restrict`, "POST", { durationHours, reason })
              .then(() => setRestrictTarget(null))
          }}
        />
        <CoinAdjustModal
          open={!!coinTarget}
          onClose={() => setCoinTarget(null)}
          loading={actionLoading}
          memberName={coinTarget?.name || ""}
          currentBalance={coinTarget?.balance ?? 0}
          onConfirm={(action, amount) => {
            apiAction(`/api/dashboard/servers/${id}/members/${coinTarget?.userId}/coins`, "PATCH", { action, amount })
              .then(() => setCoinTarget(null))
          }}
        />
        <ResolveModal
          open={!!resolveTarget}
          onClose={() => setResolveTarget(null)}
          loading={actionLoading}
          ticketCount={resolveTarget?.ticketIds.length ?? 0}
          onConfirm={(reason) => {
            apiAction(`/api/dashboard/servers/${id}/members/${resolveTarget?.userId}/resolve`, "PATCH", { ticketIds: resolveTarget?.ticketIds, reason })
              .then(() => setResolveTarget(null))
          }}
        />
        <BulkActionModal
          open={!!bulkOp}
          onClose={() => setBulkOp(null)}
          loading={actionLoading}
          selectedCount={selectedIds.size}
          operation={bulkOp || "coins"}
          onConfirm={(data) => {
            apiAction(`/api/dashboard/servers/${id}/members/bulk`, "PATCH", {
              userIds: Array.from(selectedIds),
              operation: bulkOp,
              ...data,
            }).then(() => { setBulkOp(null); setSelectedIds(new Set()) })
          }}
        />
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
