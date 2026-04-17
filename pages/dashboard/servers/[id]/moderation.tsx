// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Moderation command center - stats overview, activity chart,
//          rich record cards, quick actions, bulk resolve, member panel
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full rewrite as moderation command center
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
import SearchInput from "@/components/dashboard/ui/SearchInput"
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
import MemberDetailPanel from "@/components/dashboard/MemberDetailPanel"
import { ResolveModal } from "@/components/dashboard/MemberActionModals"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect } from "react"
import {
  Shield, AlertTriangle, Ban, FileText, CheckCircle2, TrendingUp,
  ChevronDown, ChevronRight, Search, Clock, Users,
  Info,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface Ticket {
  id: number
  targetId: string
  targetDisplayName: string
  targetAvatarUrl: string
  type: string
  state: string
  moderatorId: string
  content: string | null
  context: string | null
  addendum: string | null
  duration: number | null
  auto: boolean
  createdAt: string
  expiry: string | null
  pardonedBy: string | null
  pardonedAt: string | null
  pardonedReason: string | null
  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Surface STUDY_BAN/SCREEN_BAN escalation context inline.
  offenseNumber: number | null
  totalTiers: number | null
  // --- END AI-MODIFIED ---
}

interface ModStats {
  summary: {
    totalActive: number; activeWarnings: number; activeRestrictions: number
    activeNotes: number; resolvedThisWeek: number; createdThisWeek: number
  }
  activity: Array<{ date: string; warnings: number; restrictions: number; notes: number; resolved: number }>
  topTargets: Array<{ userId: string; displayName: string; avatarUrl: string; activeCount: number }>
}

interface TicketsResponse {
  tickets: Ticket[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Add SCREEN_BAN type so the new screen-share blacklist ticket type
//   gets a proper label/variant in the moderation list (was missing).
const typeLabels: Record<string, { label: string; variant: "warning" | "info" | "error" | "purple" | "default" }> = {
  WARNING: { label: "Bot Warning", variant: "warning" },
  NOTE: { label: "Admin Note", variant: "info" },
  STUDY_BAN: { label: "Study Restriction", variant: "error" },
  SCREEN_BAN: { label: "Screen Restriction", variant: "error" },
  MESSAGE_CENSOR: { label: "Message Censor", variant: "purple" },
  INVITE_CENSOR: { label: "Invite Censor", variant: "purple" },
}
// --- END AI-MODIFIED ---

const stateLabels: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  OPEN: { label: "Active", variant: "error" },
  EXPIRING: { label: "Expiring", variant: "warning" },
  EXPIRED: { label: "Expired", variant: "default" },
  PARDONED: { label: "Resolved", variant: "success" },
}

// --- AI-MODIFIED (2026-04-17) ---
// Purpose: Add SCREEN_BAN to the resolve button + filter options for parity
//   with STUDY_BAN.
const resolveButtonLabels: Record<string, string> = {
  STUDY_BAN: "End Early",
  SCREEN_BAN: "End Early",
  WARNING: "Dismiss",
  NOTE: "Archive",
}

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "WARNING", label: "Bot Warnings" },
  { value: "NOTE", label: "Admin Notes" },
  { value: "STUDY_BAN", label: "Study Restrictions" },
  { value: "SCREEN_BAN", label: "Screen Restrictions" },
  { value: "MESSAGE_CENSOR", label: "Message Censors" },
  { value: "INVITE_CENSOR", label: "Invite Censors" },
]
// --- END AI-MODIFIED ---

const STATE_OPTIONS = [
  { value: "", label: "All States" },
  { value: "OPEN", label: "Active" },
  { value: "EXPIRING", label: "Expiring" },
  { value: "EXPIRED", label: "Expired" },
  { value: "PARDONED", label: "Resolved" },
]

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function ActivityChart({ data }: { data: ModStats["activity"] }) {
  const maxVal = Math.max(...data.map((d) => d.warnings + d.restrictions + d.notes + d.resolved), 1)

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Record Activity (30 days)</h3>
      <div className="flex items-end gap-[2px] h-24">
        {data.map((d) => {
          const total = d.warnings + d.restrictions + d.notes + d.resolved
          const heightPct = (total / maxVal) * 100
          const wPct = total > 0 ? (d.warnings / total) * 100 : 0
          const rPct = total > 0 ? (d.restrictions / total) * 100 : 0
          const nPct = total > 0 ? (d.notes / total) * 100 : 0
          return (
            <div key={d.date} className="flex-1 flex flex-col justify-end group relative" title={`${d.date}: ${total} records`}>
              <div className="rounded-t-sm overflow-hidden" style={{ height: `${Math.max(heightPct, total > 0 ? 4 : 0)}%` }}>
                {rPct > 0 && <div className="bg-red-500/70" style={{ height: `${rPct}%` }} />}
                {wPct > 0 && <div className="bg-amber-500/70" style={{ height: `${wPct}%` }} />}
                {nPct > 0 && <div className="bg-blue-500/50" style={{ height: `${nPct}%` }} />}
                {d.resolved > 0 && <div className="bg-emerald-500/50" style={{ height: `${(d.resolved / total) * 100}%` }} />}
              </div>
              {total === 0 && <div className="bg-muted/30 rounded-t-sm" style={{ height: "2%" }} />}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/70" /> Restrictions</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/70" /> Warnings</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/50" /> Notes</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/50" /> Resolved</span>
      </div>
    </div>
  )
}

export default function ModerationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query

  const [filterType, setFilterType] = useState("")
  const [filterState, setFilterState] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [resolveTarget, setResolveTarget] = useState<number[] | null>(null)
  // --- AI-MODIFIED (2026-04-17) ---
  // Purpose: Bumped after pardons complete; passed to MemberDetailPanel so the
  //          lazy-loaded Blacklist History tab can refetch its data.
  const [panelRefreshNonce, setPanelRefreshNonce] = useState(0)
  // --- END AI-MODIFIED ---
  const [actionLoading, setActionLoading] = useState(false)
  const [panelUserId, setPanelUserId] = useState<string | null>(null)

  const params = new URLSearchParams()
  if (filterType) params.set("type", filterType)
  if (filterState) params.set("state", filterState)
  if (search) params.set("search", search)
  params.set("page", String(currentPage))

  const ticketsKey = id && session ? `/api/dashboard/servers/${id}/tickets?${params}` : null
  const { data: ticketsData, error, isLoading: loading } = useDashboard<TicketsResponse>(ticketsKey)
  const { data: modStats } = useDashboard<ModStats>(
    id && session ? `/api/dashboard/servers/${id}/moderation-stats` : null
  )
  const { data: serverData } = useDashboard(id && session ? `/api/dashboard/servers/${id}` : null)
  const { data: permsData } = useDashboard(id && session ? `/api/dashboard/servers/${id}/permissions` : null)
  const panelDetailKey = panelUserId && id ? `/api/dashboard/servers/${id}/members/${panelUserId}` : null
  const { data: panelData, isLoading: panelLoading, error: panelError } = useDashboard(panelDetailKey)

  useEffect(() => {
    if (panelError && panelUserId) {
      toast.error("Could not load member details. This user may not have a profile in this server.")
      setPanelUserId(null)
    }
  }, [panelError, panelUserId])

  const tickets = ticketsData?.tickets ?? []
  const pagination = ticketsData?.pagination ?? null
  const serverName = (serverData as any)?.server?.name ?? "Server"
  const isAdmin = (permsData as any)?.isAdmin ?? false

  const refreshData = useCallback(() => {
    if (ticketsKey) invalidate(ticketsKey)
    invalidate(`/api/dashboard/servers/${id}/moderation-stats`)
  }, [ticketsKey, id])

  // --- AI-REPLACED (2026-03-24) ---
  // Reason: Enter-key search removed with SearchInput migration; debounce replaces it
  // --- Original code (commented out for rollback) ---
  // const handleSearch = () => { setSearch(searchInput); setCurrentPage(1) }
  // --- End original code ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])
  // --- END AI-REPLACED ---

  const toggleSelect = (ticketId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(ticketId) ? next.delete(ticketId) : next.add(ticketId)
      return next
    })
  }

  async function resolveTickets(ticketIds: number[], reason: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/tickets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketIds, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resolve")
      toast.success(data.message || "Resolved")
      refreshData()
      // --- AI-MODIFIED (2026-04-17) ---
      // Purpose: Notify the open MemberDetailPanel to refetch blacklist data
      //          and invalidate the panel's records tab data so it stays fresh.
      setPanelRefreshNonce((n) => n + 1)
      if (panelDetailKey) invalidate(panelDetailKey)
      // --- END AI-MODIFIED ---
      setSelectedIds(new Set())
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Layout SEO={{ title: `Moderation - ${serverName} - LionBot`, description: "Moderation command center" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="moderator">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-6xl mx-auto flex gap-8">
                <ServerNav serverId={id as string} serverName={serverName} isAdmin={isAdmin} isMod={...} />
                <div className="flex-1 min-w-0 space-y-6">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={id as string} serverName={serverName} isAdmin={isAdmin} isMod={(permsData as any)?.isModerator} />}>
              <PageHeader
                title="Moderation"
                description="LionBot moderation records and activity overview. These are bot records, not Discord moderation."
              />

              {/* Stats Overview */}
              {!modStats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-red-400/70 mb-1"><Shield size={14} /><span className="text-[10px] uppercase tracking-wider font-medium">Active Records</span></div>
                    <p className="text-2xl font-bold text-foreground">{modStats.summary.totalActive}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {modStats.summary.activeWarnings}W / {modStats.summary.activeRestrictions}R / {modStats.summary.activeNotes}N
                    </p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-amber-400/70 mb-1"><TrendingUp size={14} /><span className="text-[10px] uppercase tracking-wider font-medium">This Week</span></div>
                    <p className="text-2xl font-bold text-foreground">{modStats.summary.createdThisWeek}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">new records</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-emerald-400/70 mb-1"><CheckCircle2 size={14} /><span className="text-[10px] uppercase tracking-wider font-medium">Resolved</span></div>
                    <p className="text-2xl font-bold text-foreground">{modStats.summary.resolvedThisWeek}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">this week</p>
                  </div>
                  {modStats.topTargets[0] ? (
                    <div
                      className="bg-card rounded-2xl p-4 border border-border cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setPanelUserId(modStats.topTargets[0].userId)}
                    >
                      <div className="flex items-center gap-2 text-purple-400/70 mb-1"><Users size={14} /><span className="text-[10px] uppercase tracking-wider font-medium">Top Target</span></div>
                      <div className="flex items-center gap-2">
                        <img src={modStats.topTargets[0].avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-bold text-foreground truncate">{modStats.topTargets[0].displayName}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{modStats.topTargets[0].activeCount} active records</p>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                      <div className="flex items-center gap-2 text-purple-400/70 mb-1"><Users size={14} /><span className="text-[10px] uppercase tracking-wider font-medium">Top Target</span></div>
                      <p className="text-sm text-muted-foreground mt-2">No active records</p>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Chart */}
              {modStats && <ActivityChart data={modStats.activity} />}

              {/* Filters + Search */}
              <div className="flex items-center gap-3 flex-wrap">
                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }} className="appearance-none px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                  {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1) }} className="appearance-none px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                  {STATE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {/* --- AI-REPLACED (2026-03-24) ---
                    Reason: Replaced custom search input with shared SearchInput component
                    --- Original code (commented out for rollback) ---
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                      <input type="text" placeholder="Search member name or ID..." value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    --- End original code --- */}
                <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search member name or ID..." className="flex-1 min-w-[180px] max-w-xs" />
                {/* --- END AI-REPLACED --- */}
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => setResolveTarget(Array.from(selectedIds))}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm hover:bg-emerald-500/15 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Resolve {selectedIds.size} selected
                  </button>
                )}
              </div>

              {/* Records List */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">{error.message || "Failed to load records"}</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16">
                  <Shield size={48} strokeWidth={1} className="mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-lg font-medium text-foreground">No records found</p>
                  <p className="text-sm text-muted-foreground mt-1">Your server is clean! No moderation records match the current filters.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((t) => {
                    const tl = typeLabels[t.type] || { label: t.type, variant: "default" as const }
                    const sl = stateLabels[t.state] || { label: t.state, variant: "default" as const }
                    const isActive = t.state === "OPEN" || t.state === "EXPIRING"
                    const isExpanded = expandedId === t.id

                    return (
                      <div key={t.id} className={`rounded-xl border transition-colors ${isActive ? "border-red-500/20 bg-red-500/5" : "border-border bg-card"}`}>
                        <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                          {/* Checkbox */}
                          {isActive && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(t.id)}
                              onChange={() => toggleSelect(t.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-border accent-primary flex-shrink-0"
                            />
                          )}

                          {/* Member avatar + name */}
                          {/* --- AI-MODIFIED (2026-03-21) --- */}
                          {/* Purpose: Reduce fixed member column width on mobile to prevent overflow */}
                          <div
                            className="flex items-center gap-2.5 min-w-0 w-28 sm:w-40 flex-shrink-0 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setPanelUserId(t.targetId) }}
                          >
                          {/* --- END AI-MODIFIED --- */}
                            <img src={t.targetAvatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
                            <span className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">{t.targetDisplayName}</span>
                          </div>

                          {/* Type + State badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge variant={tl.variant} size="sm">{tl.label}</Badge>
                            <Badge variant={sl.variant} size="sm" dot>{sl.label}</Badge>
                            {t.auto && <Badge variant="default" size="sm">Auto</Badge>}
                            {/* --- AI-MODIFIED (2026-04-17) --- */}
                            {/* Purpose: Show "Offense #N/M" badge so mods see the
                                escalation tier without opening the record. */}
                            {t.offenseNumber !== null && (
                              <Badge variant="warning" size="sm">
                                {t.totalTiers
                                  ? `Offense #${t.offenseNumber}/${t.totalTiers}`
                                  : `Offense #${t.offenseNumber}`}
                              </Badge>
                            )}
                            {/* --- END AI-MODIFIED --- */}
                          </div>

                          {/* Content preview */}
                          <p className="text-xs text-muted-foreground truncate flex-1 min-w-0 hidden md:block">
                            {t.content || "--"}
                          </p>

                          {/* Date + expand */}
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">{formatDateTime(t.createdAt)}</span>
                          {isExpanded ? <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-3">
                            {t.content && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Content</p>
                                <p className="text-sm text-foreground">{t.content}</p>
                              </div>
                            )}
                            {t.context && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Context</p>
                                <p className="text-sm text-foreground/80">{t.context}</p>
                              </div>
                            )}
                            {t.addendum && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Addendum</p>
                                <p className="text-sm text-foreground/80">{t.addendum}</p>
                              </div>
                            )}
                            {t.type === "STUDY_BAN" && isActive && (
                              <p className="text-[10px] text-red-400/60">This prevents the member from earning coins/XP in voice channels</p>
                            )}
                            {t.expiry && isActive && (
                              <p className="text-xs text-muted-foreground"><Clock size={12} className="inline mr-1" />Expires: {formatDateTime(t.expiry)}</p>
                            )}
                            {t.duration != null && (
                              <p className="text-xs text-muted-foreground">Duration: {Math.round(t.duration / 3600)}h</p>
                            )}
                            {t.pardonedReason && (
                              <div className="bg-emerald-500/10 rounded-lg p-2.5 border border-emerald-500/20">
                                <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-0.5">Resolved</p>
                                <p className="text-sm text-emerald-300">{t.pardonedReason}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 pt-1">
                              <p className="text-[10px] text-muted-foreground/50">
                                Record #{t.id} &middot; Moderator: ...{t.moderatorId.slice(-4)} &middot; {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                              </p>
                              {isActive && (
                                <button
                                  onClick={() => setResolveTarget([t.id])}
                                  className="ml-auto text-xs px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/15 transition-colors flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={12} /> {resolveButtonLabels[t.type] || "Resolve"}
                                </button>
                              )}
                              {t.state === "EXPIRED" && (
                                <p className="ml-auto text-[10px] text-muted-foreground/50">Already expired</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {/* --- AI-REPLACED (2026-03-24) ---
                  Reason: Replaced custom Prev/Next pagination with shared Pagination component
                  --- Original code (commented out for rollback) ---
                  {!loading && pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)</span>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentPage((p) => p - 1)} ...>
                          <ChevronLeft size={14} /> Previous
                        </button>
                        <button onClick={() => setCurrentPage((p) => p + 1)} ...>
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  --- End original code --- */}
              {!loading && pagination && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setCurrentPage} showLabel />
              )}
              {/* --- END AI-REPLACED --- */}
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}

        {/* Member Detail Panel */}
        {/* --- AI-MODIFIED (2026-04-17) ---
            Purpose: Wire onResolve so the new Blacklist History tab actions actually pardon */}
        <MemberDetailPanel
          open={!!panelUserId}
          onClose={() => setPanelUserId(null)}
          data={panelData as any}
          loading={panelLoading}
          onWarn={() => {}}
          onNote={() => {}}
          onRestrict={() => {}}
          onResolve={(ticketIds) => setResolveTarget(ticketIds)}
          onAdjustCoins={() => {}}
          refreshNonce={panelRefreshNonce}
        />
        {/* --- END AI-MODIFIED --- */}

        {/* Resolve Modal */}
        <ResolveModal
          open={!!resolveTarget}
          onClose={() => setResolveTarget(null)}
          loading={actionLoading}
          ticketCount={resolveTarget?.length ?? 0}
          onConfirm={(reason) => {
            if (resolveTarget) {
              resolveTickets(resolveTarget, reason).then(() => setResolveTarget(null))
            }
          }}
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
