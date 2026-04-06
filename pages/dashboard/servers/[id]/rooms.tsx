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
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Import shared SettingRow, NumberInput, Toggle instead of local duplicates
import { PageHeader, Badge, toast, ConfirmModal, NumberInput, SettingRow, Toggle } from "@/components/dashboard/ui"
import Pagination from "@/components/dashboard/ui/Pagination"
// --- END AI-MODIFIED ---
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added Timer, Play, Square icons for timer controls
import {
  DoorOpen, Coins, Users, Clock, TrendingUp, Activity, ChevronDown, ChevronUp,
  Search, Download, Snowflake, Trash2, PencilLine, ArrowRightLeft, Plus, Minus,
  Shield, ExternalLink, Settings, BarChart3, Crown, AlertTriangle, Eye,
  X, UserMinus, RefreshCw, History, Timer, Play, Square, Pencil,
} from "lucide-react"
// --- END AI-MODIFIED ---
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
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added hasTimer and timerRunning fields for timer badges
interface RoomCard {
  channelId: string; name: string | null; coinBalance: number; daysRemaining: number
  rentPrice: number; memberCount: number; totalContribution: number
  createdAt: string | null; deletedAt: string | null
  frozenAt: string | null; frozenBy: string | null
  // --- AI-MODIFIED (2026-04-06) ---
  // Purpose: Last activity timestamp for inactivity tracking display
  lastActivity: string | null
  // --- END AI-MODIFIED ---
  owner: RoomUser; liveUsers: RoomUser[]; isLive: boolean
  hasTimer?: boolean; timerRunning?: boolean
}
// --- END AI-MODIFIED ---
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
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added timer field to RoomDetailResponse for admin timer controls
interface AdminRoomTimer {
  focusMinutes: number; breakMinutes: number; autoRestart: boolean
  isRunning: boolean; lastStarted: string | null
  inactivityThreshold: number | null; voiceAlerts: boolean; ownerId: string | null
}

interface RoomDetailResponse {
  channelId: string; name: string | null; coinBalance: number; rentPrice: number
  daysRemaining: number; memberCap: number; ownerId: string
  totalContribution: number; createdAt: string | null; deletedAt: string | null
  frozenAt: string | null; frozenBy: string | null
  members: RoomMember[]
  activityFeed: Array<{ type: string; userId: string; displayName: string; timestamp: string; durationSeconds: number; tag: string | null }>
  timer: AdminRoomTimer | null
}
// --- END AI-MODIFIED ---
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
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added edit_timer and delete_timer action labels
const ACTION_LABELS: Record<string, string> = {
  force_close: "Force Closed", adjust_balance: "Balance Adjusted",
  rename: "Renamed", kick_member: "Kicked Member",
  transfer_ownership: "Transferred Ownership", freeze: "Frozen",
  unfreeze: "Unfrozen", extend_free: "Extended Free",
  edit_timer: "Timer Edited", delete_timer: "Timer Deleted",
}
// --- END AI-MODIFIED ---

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
  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Added "timer" tab option for admin timer management
  const [tab, setTab] = useState<"members" | "activity" | "log" | "actions" | "timer">("members")
  // --- END AI-MODIFIED ---
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

  // --- AI-MODIFIED (2026-03-22) ---
  // Purpose: Added Timer tab alongside existing tabs
  const [timerFocus, setTimerFocus] = useState(detail?.timer?.focusMinutes ?? 25)
  const [timerBreak, setTimerBreak] = useState(detail?.timer?.breakMinutes ?? 5)
  const [timerAutoRestart, setTimerAutoRestart] = useState(detail?.timer?.autoRestart ?? false)
  const [timerLoading, setTimerLoading] = useState(false)

  const doTimerAction = useCallback(async (action: string, body: Record<string, any> = {}) => {
    setTimerLoading(true)
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
    finally { setTimerLoading(false) }
  }, [serverId, room.channelId, onMutate])

  const tabs = [
    { id: "members" as const, label: "Members" },
    { id: "activity" as const, label: "Activity" },
    { id: "timer" as const, label: "Timer" },
    { id: "log" as const, label: "Admin Log" },
    ...(isAdmin && !room.deletedAt ? [{ id: "actions" as const, label: "Actions" }] : []),
  ]
  // --- END AI-MODIFIED ---

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
            <ConfirmModal open={true} title="Kick Member?" message="Remove this member from the room? The bot will sync permissions on next tick."
              onConfirm={() => doKick(confirmKick)} onCancel={() => setConfirmKick(null)} loading={actionLoading} variant="danger" />
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
              {e.tag && <Badge variant="default" size="sm">{e.tag}</Badge>}
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

      {/* --- AI-MODIFIED (2026-03-22) --- */}
      {/* Purpose: Timer management tab for admin room detail panel */}
      {tab === "timer" && (
        <div className="space-y-4">
          {!detail ? (
            <Skeleton className="h-24" />
          ) : !detail.timer ? (
            <div className="text-center py-6">
              <Timer size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No timer configured for this room</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">The room owner can add a timer from their dashboard</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-purple-400" />
                  <span className="text-sm font-medium text-foreground">Pomodoro Timer</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold",
                    detail.timer.isRunning ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-700 text-gray-400"
                  )}>{detail.timer.isRunning ? "Running" : "Stopped"}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => doTimerAction("delete_timer")} disabled={timerLoading}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    <Trash2 size={10} /> Delete
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Focus</span>
                  <p className="text-foreground font-medium">{detail.timer.focusMinutes} min</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Break</span>
                  <p className="text-foreground font-medium">{detail.timer.breakMinutes} min</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Auto-restart</span>
                  <p className="text-foreground font-medium">{detail.timer.autoRestart ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Voice Alerts</span>
                  <p className="text-foreground font-medium">{detail.timer.voiceAlerts ? "On" : "Off"}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Edit Timer Settings</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">Focus (min)</label>
                      <input type="number" min={1} max={1440} value={timerFocus} onChange={(e) => setTimerFocus(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5">Break (min)</label>
                      <input type="number" min={1} max={1440} value={timerBreak} onChange={(e) => setTimerBreak(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={timerAutoRestart} onChange={(e) => setTimerAutoRestart(e.target.checked)}
                      className="rounded border-border bg-background text-purple-500" />
                    Auto-restart after break
                  </label>
                  <button onClick={() => doTimerAction("edit_timer", { focusMinutes: timerFocus, breakMinutes: timerBreak, autoRestart: timerAutoRestart })}
                    disabled={timerLoading}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50">
                    Save Timer Settings
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* --- END AI-MODIFIED --- */}

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
            <ConfirmModal open={true} title="Force Close Room?" message={`This will mark "${room.name || 'this room'}" as deleted. The bot will destroy the Discord channel on next tick. This cannot be undone.`}
              onConfirm={doDelete} onCancel={() => setShowConfirmClose(false)} loading={actionLoading} variant="danger" />
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
      toast.success("Room settings saved — allow 1-2 min for changes to take effect")
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
        <ServerGuard requiredLevel="moderator">
          {/* --- AI-REPLACED (2026-03-24) ---
              Reason: Migrate to DashboardShell for consistent layout
              --- Original code (commented out for rollback) ---
              <div className="min-h-screen bg-background pt-6 pb-20 px-4">
                <div className="max-w-6xl mx-auto flex gap-8">
                  <ServerNav serverId={serverId} serverName={serverName} isAdmin={isAdmin} isMod={isMod} />
                  <div className="flex-1 min-w-0 space-y-8">
              --- End original code --- */}
          <DashboardShell nav={<ServerNav serverId={serverId} serverName={serverName} isAdmin={isAdmin} isMod={isMod} />} className="space-y-8">
          {/* --- END AI-REPLACED --- */}
                <PageHeader title="Private Rooms" description="Analytics, management, and configuration for private study rooms" />

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
                      <option value="activity">Last Active</option>
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
                                {room.frozenAt && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-blue-500/15 text-blue-400 font-medium"><Snowflake size={8} />Frozen</span>}
                                {room.deletedAt && <Badge variant="error" size="sm">Expired</Badge>}
                                {/* --- AI-MODIFIED (2026-03-22) --- */}
                                {/* Purpose: Timer status badge */}
                                {room.hasTimer && (
                                  <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium",
                                    room.timerRunning ? "bg-purple-500/15 text-purple-400" : "bg-gray-500/15 text-gray-400"
                                  )}><Timer size={8} />{room.timerRunning ? "Timer" : "Timer (off)"}</span>
                                )}
                                {/* --- END AI-MODIFIED --- */}
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>Owner: {room.owner.displayName}</span>
                                <span><Users size={9} className="inline mr-0.5" />{room.memberCount}</span>
                                {room.createdAt && <span>{relativeTime(room.createdAt)}</span>}
                                {/* --- AI-MODIFIED (2026-04-06) --- */}
                                {/* Purpose: Show last activity timestamp for inactivity tracking */}
                                {room.lastActivity && !room.deletedAt && <span title={`Last activity: ${new Date(room.lastActivity).toLocaleString()}`}>Active {relativeTime(room.lastActivity)}</span>}
                                {/* --- END AI-MODIFIED --- */}
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
                  {/* --- AI-REPLACED (2026-03-24) --- Reason: Replaced custom pagination with shared Pagination component. Original: custom ChevronLeft/Right page buttons --- */}
                  {listData && (
                    <Pagination page={page} totalPages={listData.pagination.totalPages} onChange={setPage} showLabel className="pt-2" />
                  )}
                  {/* --- END AI-REPLACED --- */}

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
                    <ConfirmModal open={true} title={`Close ${selectedRooms.size} Rooms?`} message="This will force-close all selected rooms. The bot will destroy the Discord channels on next tick."
                      onConfirm={() => doBulk("close")} onCancel={() => setShowBulkConfirm(null)} loading={bulkLoading} variant="danger" />
                  )}
                  {/* --- AI-MODIFIED (2026-03-24) --- Purpose: Standardize overlay to bg-black/60 + blur for consistency --- */}
                  {showBulkConfirm === "adjust" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    {/* --- END AI-MODIFIED --- */}
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
                      // --- AI-REPLACED (2026-03-24) ---
                      // Reason: Switch from local SettingRow (value= prop) to shared SettingRow (children prop)
                      // What the new code does better: Uses shared UI components with responsive layout, accessibility, consistent styling
                      // --- Original code: <div> with local SettingRow value= API and local Toggle/NumberInput ---
                      <div className="rounded-xl border border-border bg-card">
                        <SettingRow label="Daily Rent Price" description="LionCoins charged per day for each room">
                          <NumberInput value={configVal("renting_price") as number | null} placeholder="1000" onChange={(v) => setConfigVal("renting_price", v)} allowNull />
                        </SettingRow>
                        <SettingRow label="Member Cap" description="Maximum members per room (owner + invited)">
                          <NumberInput value={configVal("renting_cap") as number | null} placeholder="25" onChange={(v) => setConfigVal("renting_cap", v)} allowNull />
                        </SettingRow>
                        <SettingRow label="Rooms Visible" description="New rooms visible to @everyone (but not connectable)">
                          <Toggle checked={configVal("renting_visible") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_visible", v)} />
                        </SettingRow>
                        <SettingRow label="Sync Permissions" description="Sync room permissions with server on creation">
                          <Toggle checked={configVal("renting_sync_perms") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_sync_perms", v)} />
                        </SettingRow>
                        <div className="px-4 py-2 bg-muted/20">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Advanced Settings</p>
                        </div>
                        <SettingRow label="Max Rooms Per User" description="Limit how many rooms one user can own (empty = unlimited)">
                          <NumberInput value={configVal("renting_max_per_user") as number | null} placeholder="No limit" onChange={(v) => setConfigVal("renting_max_per_user", v)} allowNull />
                        </SettingRow>
                        <SettingRow label="Name Character Limit" description="Max characters in room name (empty = no limit)">
                          <NumberInput value={configVal("renting_name_limit") as number | null} placeholder="No limit" onChange={(v) => setConfigVal("renting_name_limit", v)} allowNull />
                        </SettingRow>
                        <SettingRow label="Minimum Initial Deposit" description="Coins required upfront when renting a room (empty = 0)">
                          <NumberInput value={configVal("renting_min_deposit") as number | null} placeholder="0" onChange={(v) => setConfigVal("renting_min_deposit", v)} allowNull />
                        </SettingRow>
                        <SettingRow label="Auto-Extend" description="Automatically deduct from owner's balance when room runs out">
                          <Toggle checked={configVal("renting_auto_extend") as boolean | null ?? false} onChange={(v) => setConfigVal("renting_auto_extend", v)} />
                        </SettingRow>
                        <SettingRow label="Creation Cooldown" description="Seconds between room creations per user (empty = no cooldown)">
                          <NumberInput value={configVal("renting_cooldown") as number | null} placeholder="No cooldown" onChange={(v) => setConfigVal("renting_cooldown", v)} allowNull />
                        </SettingRow>
                        {/* --- END AI-REPLACED --- */}
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
          {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
          </DashboardShell>
          {/* --- END AI-REPLACED --- */}
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

// --- AI-REPLACED (2026-03-24) ---
// Reason: Local SettingRow, NumberInput, Toggle were duplicates of shared @/components/dashboard/ui
// What the new code does better: Eliminates duplicate code; shared versions have responsive layout, accessibility, sound effects
// --- Original code (commented out for rollback) ---
// function SettingRow({ label, description, value }: { label: string; description: string; value: React.ReactNode }) {
//   return (
//     <div className="flex items-center justify-between gap-4 px-4 py-3">
//       <div className="min-w-0">
//         <p className="text-sm font-medium text-foreground">{label}</p>
//         <p className="text-[11px] text-muted-foreground">{description}</p>
//       </div>
//       <div className="flex-shrink-0">{value}</div>
//     </div>
//   )
// }
// function NumberInput({ value, placeholder, onChange }: { ... }) { <input type="number" .../> }
// function Toggle({ checked, onChange }: { ... }) { <button .../> }
// --- End original code ---
// Now imported from "@/components/dashboard/ui"
// --- END AI-REPLACED ---

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
