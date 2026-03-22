// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Private Rooms admin panel -- deep analytics, room listing
//          with management actions, bulk operations, and configuration
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, toast, ConfirmModal } from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import {
  DoorOpen, Coins, Users, Clock, TrendingUp, Activity, ChevronDown, ChevronUp,
  Search, Download, Snowflake, Trash2, PencilLine, ArrowRightLeft, Plus, Minus,
  Shield, ExternalLink, Settings, BarChart3, Crown, AlertTriangle, Eye,
  ChevronLeft, ChevronRight, X, UserMinus, RefreshCw, History,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

// ---- Types ----

interface RoomUser {
  userId: string; displayName: string; avatarUrl: string | null
}
interface RoomMember extends RoomUser {
  isOwner: boolean; totalStudySeconds: number; contribution: number
  coinBalance: number; isLive?: boolean
}
interface RoomCard {
  channelId: string; name: string | null; coinBalance: number; daysRemaining: number
  rentPrice: number; memberCount: number; totalContribution: number
  createdAt: string | null; deletedAt: string | null
  frozenAt: string | null; frozenBy: string | null
  owner: RoomUser; liveUsers: RoomUser[]; isLive: boolean
}
interface RoomListResponse {
  rooms: RoomCard[]; pagination: { page: number; pageSize: number; total: number; totalPages: number }
  rentPrice: number
}
interface StatsResponse {
  summary: {
    activeRooms: number; totalCoinsInBanks: number; avgLifespanDays: number
    createdThisWeek: number; liveOccupants: number; totalStudyHours: number
  }
  healthDistribution: { critical: number; low: number; medium: number; healthy: number }
  dailyTrend: Array<{ date: string; created: number; expired: number }>
  heatmap: Array<{ dow: number; hour: number; count: number }>
  topRooms: Array<{ channelId: string; name: string; ownerName: string; ownerAvatar: string | null; totalStudyHours: number }>
  efficiency: number
}
interface RoomDetailResponse {
  channelId: string; name: string | null; coinBalance: number; rentPrice: number
  daysRemaining: number; memberCap: number; ownerId: string
  totalContribution: number; createdAt: string | null; deletedAt: string | null
  frozenAt: string | null; frozenBy: string | null
  members: RoomMember[]
  activityFeed: Array<{ type: string; userId: string; displayName: string; timestamp: string; durationSeconds: number; tag: string | null }>
}
interface LogEntry {
  logId: number; action: string; details: any; adminId: string; adminName: string; createdAt: string
}
interface ServerConfig {
  renting_price: number | null; renting_cap: number | null; renting_visible: boolean | null
  renting_category: string | null; renting_sync_perms: boolean | null
  renting_max_per_user: number | null; renting_name_limit: number | null
  renting_min_deposit: number | null; renting_auto_extend: boolean | null
  renting_cooldown: number | null
}

// ---- Helpers ----

function formatDays(d: number): string {
  if (d <= 0) return "Expiring"
  if (d === 1) return "1 day"
  return `${d} days`
}
function formatStudyHours(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
const ACTION_LABELS: Record<string, string> = {
  force_close: "Force Closed", adjust_balance: "Balance Adjusted",
  rename: "Renamed", kick_member: "Kicked Member",
  transfer_ownership: "Transferred Ownership", freeze: "Frozen",
  unfreeze: "Unfrozen", extend_free: "Extended Free",
}

// ---- Stat Card ----

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="opacity-60">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ---- Health Bar ----

function HealthBar({ daysRemaining, maxDays = 30 }: { daysRemaining: number; maxDays?: number }) {
  const pct = Math.min(100, Math.max(0, (daysRemaining / maxDays) * 100))
  const color = daysRemaining <= 1 ? "bg-red-500" : daysRemaining <= 3 ? "bg-amber-500" : daysRemaining <= 7 ? "bg-yellow-500" : "bg-emerald-500"
  return (
    <div className="flex items-center gap-2 w-full max-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{formatDays(daysRemaining)}</span>
    </div>
  )
}

// ---- Usage Heatmap ----

function UsageHeatmap({ data }: { data: Array<{ dow: number; hour: number; count: number }> }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0))
  let max = 1
  for (const d of data) { grid[d.dow][d.hour] = d.count; if (d.count > max) max = d.count }
  return (
    <div className="space-y-1">
      <div className="flex gap-px">
        <div className="w-8" />
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="flex-1 text-center text-[8px] text-muted-foreground/60">
            {i % 3 === 0 ? `${i}` : ""}
          </div>
        ))}
      </div>
      {grid.map((row, di) => (
        <div key={di} className="flex gap-px items-center">
          <div className="w-8 text-[9px] text-muted-foreground/60 text-right pr-1">{days[di]}</div>
          {row.map((v, hi) => (
            <div
              key={hi}
              className="flex-1 aspect-square rounded-[2px] transition-colors"
              style={{ backgroundColor: v === 0 ? "hsl(var(--muted))" : `rgba(34,197,94,${Math.max(0.15, v / max)})` }}
              title={`${days[di]} ${hi}:00 — ${v} sessions`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---- Room Detail Panel ----

function RoomDetailPanel({ room, serverId, isAdmin, onMutate }: {
  room: RoomCard; serverId: string; isAdmin: boolean; onMutate: () => void
}) {
  const [tab, setTab] = useState<"members" | "activity" | "log" | "actions">("members")
  const { data: detail } = useDashboard<RoomDetailResponse>(
    `/api/dashboard/servers/${serverId}/rooms/${room.channelId}`
  )
  const { data: logData } = useDashboard<{ entries: LogEntry[] }>(
    tab === "log" ? `/api/dashboard/servers/${serverId}/rooms/${room.channelId}/log` : null
  )

  const [actionLoading, setActionLoading] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [showRename, setShowRename] = useState(false)
  const [balanceAdj, setBalanceAdj] = useState("")
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferTo, setTransferTo] = useState("")
  const [confirmKick, setConfirmKick] = useState<string | null>(null)

  const doAction = useCallback(async (action: string, body: Record<string, any> = {}) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/rooms/${room.channelId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      toast.success(`Action "${ACTION_LABELS[action] || action}" completed`)
      onMutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }, [serverId, room.channelId, onMutate])

  const doDelete = useCallback(async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/rooms/${room.channelId}`, { method: "DELETE" })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      toast.success("Room force closed")
      onMutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false); setShowConfirmClose(false) }
  }, [serverId, room.channelId, onMutate])

  const doKick = useCallback(async (userId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/rooms/${room.channelId}/kick`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      toast.success("Member kicked")
      onMutate()
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false); setConfirmKick(null) }
  }, [serverId, room.channelId, onMutate])

  const tabs = [
    { id: "members" as const, label: "Members" },
    { id: "activity" as const, label: "Activity" },
    { id: "log" as const, label: "Admin Log" },
    ...(isAdmin && !room.deletedAt ? [{ id: "actions" as const, label: "Actions" }] : []),
  ]

  return (
    <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
              tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}>{t.label}</button>
        ))}
      </div>

      {tab === "members" && (
        <div className="space-y-2">
          {!detail ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}</div>
          ) : detail.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/30">
              {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Users size={12} className="text-muted-foreground" /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground truncate">{m.displayName}</span>
                  {m.isOwner && <Crown size={10} className="text-amber-400" />}
                  {m.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>{formatStudyHours(m.totalStudySeconds)} studied</span>
                  {!m.isOwner && <span>{m.contribution.toLocaleString()} contributed</span>}
                </div>
              </div>
              {isAdmin && !m.isOwner && !room.deletedAt && (
                <button onClick={() => setConfirmKick(m.userId)} className="text-muted-foreground hover:text-red-400 p-1" title="Kick">
                  <UserMinus size={13} />
                </button>
              )}
            </div>
          ))}
          {confirmKick && (
            <ConfirmModal title="Kick Member?" description="Remove this member from the room? The bot will sync permissions on next tick."
              onConfirm={() => doKick(confirmKick)} onCancel={() => setConfirmKick(null)} loading={actionLoading} variant="destructive" />
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {!detail ? <Skeleton className="h-32" /> : detail.activityFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
          ) : detail.activityFeed.map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs">
              <Activity size={10} className="text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">{e.displayName}</span>
              <span className="text-muted-foreground">studied {formatStudyHours(e.durationSeconds)}</span>
              {e.tag && <Badge variant="default" className="text-[9px]">{e.tag}</Badge>}
              <span className="text-muted-foreground/60 ml-auto">{relativeTime(e.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "log" && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {!logData ? <Skeleton className="h-32" /> : logData.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No admin actions recorded</p>
          ) : logData.entries.map((e) => (
            <div key={e.logId} className="flex items-center gap-2 py-1.5 text-xs">
              <Shield size={10} className="text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-medium">{e.adminName}</span>
              <span className="text-muted-foreground">{ACTION_LABELS[e.action] || e.action}</span>
              <span className="text-muted-foreground/60 ml-auto">{relativeTime(e.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "actions" && isAdmin && !room.deletedAt && (
        <div className="space-y-4">
          {/* Rename */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Rename Room</label>
            <div className="flex gap-2">
              {showRename ? (
                <>
                  <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                    placeholder={room.name || "Room name"} maxLength={100}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground" />
                  <button disabled={actionLoading || !renameValue.trim()} onClick={() => { doAction("rename", { name: renameValue }); setShowRename(false) }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Save</button>
                  <button onClick={() => setShowRename(false)} className="text-muted-foreground hover:text-foreground p-1.5"><X size={14} /></button>
                </>
              ) : (
                <button onClick={() => { setRenameValue(room.name || ""); setShowRename(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-foreground hover:bg-accent/80">
                  <PencilLine size={12} /> Rename
                </button>
              )}
            </div>
          </div>
          {/* Adjust Balance */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Adjust Balance</label>
            <div className="flex gap-2">
              <input type="number" value={balanceAdj} onChange={(e) => setBalanceAdj(e.target.value)}
                placeholder="Amount (+ or -)" className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground" />
              <button disabled={actionLoading || !balanceAdj || Number(balanceAdj) === 0}
                onClick={() => { doAction("adjust_balance", { amount: Number(balanceAdj) }); setBalanceAdj("") }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white disabled:opacity-50">Apply</button>
            </div>
          </div>
          {/* Extend Free */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Extend Free (add coins without deducting from anyone)</label>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button key={d} disabled={actionLoading} onClick={() => doAction("extend_free", { amount: d * room.rentPrice })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 disabled:opacity-50">
                  +{d}d <span className="text-muted-foreground ml-1">({(d * room.rentPrice).toLocaleString()})</span>
                </button>
              ))}
            </div>
          </div>
          {/* Freeze / Unfreeze */}
          <div className="flex gap-2">
            {room.frozenAt ? (
              <button disabled={actionLoading} onClick={() => doAction("unfreeze")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/20 disabled:opacity-50">
                <Snowflake size={12} /> Unfreeze Room
              </button>
            ) : (
              <button disabled={actionLoading} onClick={() => doAction("freeze")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 disabled:opacity-50">
                <Snowflake size={12} /> Freeze Room
              </button>
            )}
          </div>
          {/* Transfer Ownership */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Transfer Ownership</label>
            {showTransfer ? (
              <div className="flex gap-2">
                <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground">
                  <option value="">Select new owner...</option>
                  {detail?.members.filter((m) => !m.isOwner).map((m) => (
                    <option key={m.userId} value={m.userId}>{m.displayName}</option>
                  ))}
                </select>
                <button disabled={actionLoading || !transferTo} onClick={() => { doAction("transfer_ownership", { newOwnerId: transferTo }); setShowTransfer(false); setTransferTo("") }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white disabled:opacity-50">Transfer</button>
                <button onClick={() => setShowTransfer(false)} className="text-muted-foreground hover:text-foreground p-1.5"><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setShowTransfer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-foreground hover:bg-accent/80">
                <ArrowRightLeft size={12} /> Transfer
              </button>
            )}
          </div>
          {/* Force Close */}
          <div className="pt-2 border-t border-border">
            <button onClick={() => setShowConfirmClose(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
              <Trash2 size={12} /> Force Close Room
            </button>
          </div>
          {showConfirmClose && (
            <ConfirmModal title="Force Close Room?" description={`This will mark "${room.name || 'this room'}" as deleted. The bot will destroy the Discord channel on next tick. This cannot be undone.`}
              onConfirm={doDelete} onCancel={() => setShowConfirmClose(false)} loading={actionLoading} variant="destructive" />
          )}
        </div>
      )}
    </div>
  )
}

// ---- Main Page ----

export default function AdminRoomsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const serverId = router.query.id as string

  const { data: serverData } = useDashboard<{ name: string }>(serverId ? `/api/dashboard/servers/${serverId}` : null)
  const { data: permsData } = useDashboard<{ isAdmin: boolean; isMod: boolean }>(serverId ? `/api/dashboard/servers/${serverId}/permissions` : null)
  const { data: configData, mutate: mutateConfig } = useDashboard<ServerConfig>(serverId ? `/api/dashboard/servers/${serverId}/config` : null)

  const [filter, setFilter] = useState<"active" | "expired" | "all">("active")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("created")
  const [page, setPage] = useState(1)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState<string | null>(null)
  const [bulkAmount, setBulkAmount] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)

  const [configDraft, setConfigDraft] = useState<Partial<ServerConfig>>({})
  const [savingConfig, setSavingConfig] = useState(false)
  const hasConfigChanges = Object.keys(configDraft).length > 0

  const listUrl = serverId ? `/api/dashboard/servers/${serverId}/rooms?filter=${filter}&search=${encodeURIComponent(search)}&sort=${sort}&page=${page}&pageSize=20` : null
  const { data: listData, mutate: mutateList } = useDashboard<RoomListResponse>(listUrl)
  const { data: stats } = useDashboard<StatsResponse>(serverId ? `/api/dashboard/servers/${serverId}/rooms/stats` : null)

  const isAdmin = permsData?.isAdmin ?? false
  const isMod = permsData?.isMod ?? false
  const serverName = serverData?.name || "Server"

  const toggleSelect = useCallback((channelId: string) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev)
      if (next.has(channelId)) next.delete(channelId)
      else next.add(channelId)
      return next
    })
  }, [])

  const doBulk = useCallback(async (action: string, amount?: number) => {
    setBulkLoading(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/rooms/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, channelIds: Array.from(selectedRooms), amount }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      toast.success(`Bulk action completed on ${d.affected} rooms`)
      setSelectedRooms(new Set()); mutateList()
    } catch (err: any) { toast.error(err.message) }
    finally { setBulkLoading(false); setShowBulkConfirm(null); setBulkAmount("") }
  }, [serverId, selectedRooms, mutateList])

  const saveConfig = useCallback(async () => {
    setSavingConfig(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/config`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configDraft),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      toast.success("Room settings saved")
      setConfigDraft({}); mutateConfig()
    } catch (err: any) { toast.error(err.message) }
    finally { setSavingConfig(false) }
  }, [serverId, configDraft, mutateConfig])

  const configVal = useCallback((key: keyof ServerConfig) => {
    if (key in configDraft) return configDraft[key]
    return configData?.[key] ?? null
  }, [configData, configDraft])

  const setConfigVal = useCallback((key: keyof ServerConfig, val: any) => {
    setConfigDraft((prev) => ({ ...prev, [key]: val }))
  }, [])

  return (
    <Layout SEO={{ title: `Private Rooms - ${serverName}`, description: "Manage private rooms" }}>
      <AdminGuard>
        <ServerGuard serverId={serverId} requiredLevel="moderator">
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-8">
              <ServerNav serverId={serverId} serverName={serverName} isAdmin={isAdmin} isMod={isMod} />
              <div className="flex-1 min-w-0 space-y-8">
                <PageHeader title="Private Rooms" description="Analytics, management, and configuration for private study rooms" icon={<DoorOpen size={20} />} />

                {/* ======== SECTION A: ANALYTICS ======== */}
                {!stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <StatCard label="Active Rooms" value={stats.summary.activeRooms} icon={<DoorOpen size={14} />} />
                      <StatCard label="Coins in Banks" value={stats.summary.totalCoinsInBanks.toLocaleString()} icon={<Coins size={14} />} />
                      <StatCard label="Avg Lifespan" value={`${stats.summary.avgLifespanDays}d`} icon={<Clock size={14} />} />
                      <StatCard label="Created This Week" value={stats.summary.createdThisWeek} icon={<TrendingUp size={14} />} />
                      <StatCard label="Live Now" value={stats.summary.liveOccupants} sub="users in rooms" icon={<Activity size={14} />} />
                      <StatCard label="Study Hours" value={stats.summary.totalStudyHours.toLocaleString()} sub="all-time" icon={<BarChart3 size={14} />} />
                    </div>

                    {/* Health Distribution */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Room Health Distribution</h3>
                      <div className="flex gap-2 h-6">
                        {[
                          { key: "critical", label: "Critical (0-1d)", color: "bg-red-500", count: stats.healthDistribution.critical },
                          { key: "low", label: "Low (1-3d)", color: "bg-amber-500", count: stats.healthDistribution.low },
                          { key: "medium", label: "Medium (3-7d)", color: "bg-yellow-500", count: stats.healthDistribution.medium },
                          { key: "healthy", label: "Healthy (7d+)", color: "bg-emerald-500", count: stats.healthDistribution.healthy },
                        ].map((b) => {
                          const total = stats.summary.activeRooms || 1
                          const pct = Math.max(0, (b.count / total) * 100)
                          if (b.count === 0) return null
                          return (
                            <div key={b.key} className={cn("rounded-md flex items-center justify-center text-[10px] font-medium text-white", b.color)}
                              style={{ width: `${Math.max(pct, 8)}%` }} title={`${b.label}: ${b.count} rooms`}>
                              {b.count}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: "Critical", color: "bg-red-500", count: stats.healthDistribution.critical },
                          { label: "Low", color: "bg-amber-500", count: stats.healthDistribution.low },
                          { label: "Medium", color: "bg-yellow-500", count: stats.healthDistribution.medium },
                          { label: "Healthy", color: "bg-emerald-500", count: stats.healthDistribution.healthy },
                        ].map((b) => (
                          <div key={b.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <div className={cn("w-2 h-2 rounded-sm", b.color)} /> {b.label}: {b.count}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Creation/Expiry Trend */}
                      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Room Creation / Expiry (30d)</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                              <RechartsTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                              <Area type="monotone" dataKey="created" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="Created" />
                              <Area type="monotone" dataKey="expired" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Expired" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Usage Heatmap */}
                      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Room Usage Heatmap (7d)</h3>
                        <UsageHeatmap data={stats.heatmap} />
                      </div>
                    </div>

                    {/* Top Rooms + Economy Link */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Top Rooms by Study Hours</h3>
                        {stats.topRooms.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No study data yet</p>
                        ) : stats.topRooms.map((r, i) => (
                          <div key={r.channelId} className="flex items-center gap-3 py-1">
                            <span className="text-xs text-muted-foreground w-4 text-right">#{i + 1}</span>
                            {r.ownerAvatar ? <img src={r.ownerAvatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-muted" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                              <p className="text-[10px] text-muted-foreground">{r.ownerName}</p>
                            </div>
                            <span className="text-sm font-semibold text-foreground tabular-nums">{r.totalStudyHours}h</span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-3 text-center">
                        <Coins size={24} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Economy Integration</p>
                          <p className="text-xs text-muted-foreground mt-1">Room bank stats are also visible on the Economy page for broader economic context.</p>
                        </div>
                        <Link href={`/dashboard/servers/${serverId}/economy`}>
                          <a className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium">
                            <ExternalLink size={12} /> View Economy Dashboard
                          </a>
                        </Link>
                        {stats.efficiency > 0 && (
                          <p className="text-[10px] text-muted-foreground">Room efficiency: {stats.efficiency} study hours per 1K coins spent</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ======== SECTION B: ROOM LIST ======== */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-lg font-semibold text-foreground">Rooms</h2>
                    <div className="flex items-center gap-2">
                      <a href={`/api/dashboard/servers/${serverId}/rooms/export?type=list`} download
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-foreground hover:bg-accent/80">
                        <Download size={12} /> Export CSV
                      </a>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {(["active", "expired", "all"] as const).map((f) => (
                        <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                          className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                            filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"
                          )}>{f}</button>
                      ))}
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Search by name or owner ID..."
                        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground" />
                    </div>
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground">
                      <option value="created">Newest</option>
                      <option value="balance">Balance</option>
                      <option value="members">Members</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  {/* Room Cards */}
                  {!listData ? (
                    <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                  ) : listData.rooms.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                      <DoorOpen size={32} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">No rooms found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {filter === "active" ? "No active private rooms in this server." : filter === "expired" ? "No expired rooms found." : "No rooms have been created in this server yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {listData.rooms.map((room) => (
                        <div key={room.channelId} className={cn("rounded-xl border bg-card overflow-hidden transition-colors",
                          room.frozenAt ? "border-blue-500/30" : room.deletedAt ? "border-border/50 opacity-60" : "border-border"
                        )}>
                          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/20"
                            onClick={() => setExpandedRoom(expandedRoom === room.channelId ? null : room.channelId)}>
                            {isAdmin && !room.deletedAt && (
                              <input type="checkbox" checked={selectedRooms.has(room.channelId)}
                                onChange={(e) => { e.stopPropagation(); toggleSelect(room.channelId) }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-border" />
                            )}
                            {room.isLive && <span className="relative flex h-2 w-2 flex-shrink-0"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>}
                            {room.owner.avatarUrl ? <img src={room.owner.avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">{room.name || "Private Room"}</span>
                                {room.frozenAt && <Badge variant="info" className="text-[9px]"><Snowflake size={8} className="mr-0.5" />Frozen</Badge>}
                                {room.deletedAt && <Badge variant="error" className="text-[9px]">Expired</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>Owner: {room.owner.displayName}</span>
                                <span><Users size={9} className="inline mr-0.5" />{room.memberCount}</span>
                                {room.createdAt && <span>{relativeTime(room.createdAt)}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {room.isLive && room.liveUsers.length > 0 && (
                                <div className="flex -space-x-1.5">
                                  {room.liveUsers.slice(0, 3).map((u) => (
                                    u.avatarUrl ? <img key={u.userId} src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full border border-card" title={u.displayName} />
                                    : <div key={u.userId} className="w-5 h-5 rounded-full bg-muted border border-card" title={u.displayName} />
                                  ))}
                                  {room.liveUsers.length > 3 && <span className="text-[9px] text-muted-foreground ml-1">+{room.liveUsers.length - 3}</span>}
                                </div>
                              )}
                              {!room.deletedAt && (
                                <div className="flex items-center gap-1.5">
                                  <span className={cn("text-xs font-medium tabular-nums",
                                    room.daysRemaining <= 1 ? "text-red-400" : room.daysRemaining <= 3 ? "text-amber-400" : "text-foreground"
                                  )}>{room.coinBalance.toLocaleString()}</span>
                                  <HealthBar daysRemaining={room.daysRemaining} />
                                </div>
                              )}
                              {expandedRoom === room.channelId ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                            </div>
                          </div>
                          {expandedRoom === room.channelId && (
                            <RoomDetailPanel room={room} serverId={serverId} isAdmin={isAdmin} onMutate={() => mutateList()} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {listData && listData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button disabled={page === 1} onClick={() => setPage(page - 1)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"><ChevronLeft size={16} /></button>
                      <span className="text-xs text-muted-foreground">Page {page} of {listData.pagination.totalPages}</span>
                      <button disabled={page >= listData.pagination.totalPages} onClick={() => setPage(page + 1)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                  )}

                  {/* Bulk Action Bar */}
                  {selectedRooms.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border shadow-xl">
                      <span className="text-sm font-medium text-foreground">{selectedRooms.size} selected</span>
                      <button onClick={() => setShowBulkConfirm("close")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        <Trash2 size={12} className="inline mr-1" />Close All
                      </button>
                      <button onClick={() => setShowBulkConfirm("adjust")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20">
                        <Coins size={12} className="inline mr-1" />Adjust Balance
                      </button>
                      <button onClick={() => setSelectedRooms(new Set())} className="text-muted-foreground hover:text-foreground p-1"><X size={14} /></button>
                    </div>
                  )}
                  {showBulkConfirm === "close" && (
                    <ConfirmModal title={`Close ${selectedRooms.size} Rooms?`} description="This will force-close all selected rooms. The bot will destroy the Discord channels on next tick."
                      onConfirm={() => doBulk("close")} onCancel={() => setShowBulkConfirm(null)} loading={bulkLoading} variant="destructive" />
                  )}
                  {showBulkConfirm === "adjust" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-card rounded-xl border border-border p-6 max-w-sm w-full space-y-4">
                        <h3 className="text-base font-semibold text-foreground">Adjust Balance ({selectedRooms.size} rooms)</h3>
                        <input type="number" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)}
                          placeholder="Amount (+ to add, - to subtract)" className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowBulkConfirm(null)} className="px-4 py-2 text-sm rounded-lg bg-accent text-foreground">Cancel</button>
                          <button disabled={bulkLoading || !bulkAmount || Number(bulkAmount) === 0}
                            onClick={() => doBulk("adjust_balance", Number(bulkAmount))}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white disabled:opacity-50">Apply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ======== SECTION C: CONFIGURATION ======== */}
                {isAdmin && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Settings size={18} /> Configuration
                      </h2>
                      <Link href={`/dashboard/servers/${serverId}/settings#rooms`}>
                        <a className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                          <ExternalLink size={10} /> Also in Settings
                        </a>
                      </Link>
                    </div>

                    {!configData ? (
                      <Skeleton className="h-64 rounded-xl" />
                    ) : (
                      <div className="rounded-xl border border-border bg-card divide-y divide-border">
                        <SettingRow label="Daily Rent Price" description="LionCoins charged per day for each room"
                          value={<NumberInput value={configVal("renting_price") as number | null} placeholder="1000" onChange={(v) => setConfigVal("renting_price", v)} />} />
                        <SettingRow label="Member Cap" description="Maximum members per room (owner + invited)"
                          value={<NumberInput value={configVal("renting_cap") as number | null} placeholder="25" onChange={(v) => setConfigVal("renting_cap", v)} />} />
                        <SettingRow label="Rooms Visible" description="New rooms visible to @everyone (but not connectable)"
                          value={<Toggle checked={configVal("renting_visible") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_visible", v)} />} />
                        <SettingRow label="Sync Permissions" description="Sync room permissions with server on creation"
                          value={<Toggle checked={configVal("renting_sync_perms") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_sync_perms", v)} />} />
                        <div className="px-4 py-2 bg-muted/20">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Advanced Settings</p>
                        </div>
                        <SettingRow label="Max Rooms Per User" description="Limit how many rooms one user can own (empty = unlimited)"
                          value={<NumberInput value={configVal("renting_max_per_user") as number | null} placeholder="No limit" onChange={(v) => setConfigVal("renting_max_per_user", v)} />} />
                        <SettingRow label="Name Character Limit" description="Max characters in room name (empty = no limit)"
                          value={<NumberInput value={configVal("renting_name_limit") as number | null} placeholder="No limit" onChange={(v) => setConfigVal("renting_name_limit", v)} />} />
                        <SettingRow label="Minimum Initial Deposit" description="Coins required upfront when renting a room (empty = 0)"
                          value={<NumberInput value={configVal("renting_min_deposit") as number | null} placeholder="0" onChange={(v) => setConfigVal("renting_min_deposit", v)} />} />
                        <SettingRow label="Auto-Extend" description="Automatically deduct from owner's balance when room runs out"
                          value={<Toggle checked={configVal("renting_auto_extend") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_auto_extend", v)} />} />
                        <SettingRow label="Creation Cooldown" description="Seconds between room creations per user (empty = no cooldown)"
                          value={<NumberInput value={configVal("renting_cooldown") as number | null} placeholder="No cooldown" onChange={(v) => setConfigVal("renting_cooldown", v)} />} />
                      </div>
                    )}

                    {hasConfigChanges && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setConfigDraft({})} className="px-4 py-2 text-sm rounded-lg bg-accent text-foreground">Discard</button>
                        <button onClick={saveConfig} disabled={savingConfig}
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                          {savingConfig ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

// ---- Setting Components ----

function SettingRow({ label, description, value }: { label: string; description: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex-shrink-0">{value}</div>
    </div>
  )
}

function NumberInput({ value, placeholder, onChange }: { value: number | null; placeholder: string; onChange: (v: number | null) => void }) {
  return (
    <input type="number" value={value ?? ""} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className="w-28 px-3 py-1.5 text-sm text-right rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground" />
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}>
      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-[18px]" : "translate-x-[3px]"
      )} />
    </button>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
