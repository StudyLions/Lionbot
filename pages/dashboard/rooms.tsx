// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Private Rooms dashboard page - lists all rooms across servers
//          with health bars, deposit presets, study leaderboard, activity feed,
//          rename (owner), expired rooms history, and educational empty state
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { toast } from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added Timer, Play, Square, Trash2, Plus icons for timer controls
import {
  DoorOpen, Crown, Coins, Users, ChevronDown, ChevronRight,
  Clock, Calendar, Pencil, Check, X, ArrowRight, History,
  Trophy, Activity, MessageCircle, Timer, Play, Square, Trash2, Plus,
} from "lucide-react"
// --- END AI-MODIFIED ---
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface RoomCard {
  channelId: string
  guildId: string
  guildName: string
  name: string | null
  coinBalance: number
  rentPrice: number
  daysRemaining: number
  memberCount: number
  memberCap: number
  isOwner: boolean
  ownerId: string
  createdAt: string | null
  deletedAt: string | null
  nextTick: string | null
  isExpiring: boolean
}

interface ServerGroup {
  guildId: string
  guildName: string
  rooms: RoomCard[]
}

interface RoomsData {
  servers: ServerGroup[]
  expiredRooms: RoomCard[]
  hasExpiringRooms: boolean
  totalActiveRooms: number
}

interface RoomMember {
  userId: string
  displayName: string
  avatarUrl: string | null
  isOwner: boolean
  totalStudySeconds: number
  coinBalance: number
}

interface ActivityEntry {
  type: string
  userId: string
  displayName: string
  timestamp: string
  durationSeconds: number
  tag: string | null
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Added timer field to RoomDetail for timer controls
interface RoomTimer {
  focusMinutes: number
  breakMinutes: number
  autoRestart: boolean
  isRunning: boolean
  lastStarted: string | null
  inactivityThreshold: number | null
  voiceAlerts: boolean
}

interface RoomDetail {
  channelId: string
  guildId: string
  guildName: string
  name: string | null
  coinBalance: number
  rentPrice: number
  daysRemaining: number
  memberCap: number
  isOwner: boolean
  isMember: boolean
  ownerId: string
  createdAt: string | null
  deletedAt: string | null
  nextTick: string | null
  members: RoomMember[]
  activityFeed: ActivityEntry[]
  timer: RoomTimer | null
}
// --- END AI-MODIFIED ---

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—"
  const diff = new Date(iso).getTime() - Date.now()
  const hours = Math.round(diff / 3600000)
  if (hours < 0) return "overdue"
  if (hours < 1) return "< 1 hour"
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

function HealthBar({ daysRemaining, rentPrice }: { daysRemaining: number; rentPrice: number }) {
  const maxDays = 30
  const pct = Math.min(100, Math.max(0, (daysRemaining / maxDays) * 100))
  const color =
    daysRemaining > 7 ? "bg-emerald-500" : daysRemaining > 3 ? "bg-amber-500" : "bg-red-500"
  const bgColor =
    daysRemaining > 7 ? "bg-emerald-500/20" : daysRemaining > 3 ? "bg-amber-500/20" : "bg-red-500/20"

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={cn(
          "font-medium",
          daysRemaining > 7 ? "text-emerald-400" : daysRemaining > 3 ? "text-amber-400" : "text-red-400"
        )}>
          {daysRemaining <= 0 ? "Expires next tick!" : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
        </span>
        <span className="text-gray-500">{rentPrice}/day</span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", bgColor)}>
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function DepositPanel({
  channelId, rentPrice, onDeposit,
}: {
  channelId: string; rentPrice: number; onDeposit: () => void
}) {
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const presets = [
    { days: 7, label: "+7 days" },
    { days: 14, label: "+14 days" },
    { days: 30, label: "+30 days" },
  ]

  const doDeposit = useCallback(async (payload: { days?: number; amount?: number }) => {
    setLoading(true)
    try {
      const result = await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/deposit`, payload)
      toast.success(`Deposited ${result.deposited} coins! Balance: ${result.newCoinBalance} (${result.newDaysRemaining} days)`)
      onDeposit()
    } catch (err: any) {
      toast.error(err.message || "Deposit failed")
    } finally {
      setLoading(false)
    }
  }, [channelId, onDeposit])

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
        <Coins size={14} className="text-amber-400" /> Deposit Coins
      </h4>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.days}
            disabled={loading}
            onClick={() => doDeposit({ days: p.days })}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20 transition-colors disabled:opacity-50"
          >
            {p.label}
            <span className="ml-1 text-gray-500">= {p.days * rentPrice}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
        />
        <button
          disabled={loading || !customAmount || Number(customAmount) <= 0}
          onClick={() => doDeposit({ amount: Number(customAmount) })}
          className="px-4 py-1.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
        >
          Deposit
        </button>
      </div>
    </div>
  )
}

function RenamePanel({ channelId, currentName, onRename }: {
  channelId: string; currentName: string | null; onRename: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName || "")
  const [loading, setLoading] = useState(false)

  const save = useCallback(async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/rooms/${channelId}`, { name: name.trim() })
      toast.success("Room renamed! Discord channel updates within a few minutes.")
      setEditing(false)
      onRename()
    } catch (err: any) {
      toast.error(err.message || "Rename failed")
    } finally {
      setLoading(false)
    }
  }, [channelId, name, onRename])

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
      >
        <Pencil size={12} /> Rename Room
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:border-blue-500/50 focus:outline-none"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <button onClick={save} disabled={loading} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
        <X size={14} />
      </button>
    </div>
  )
}

function StudyLeaderboard({ members }: { members: RoomMember[] }) {
  const sorted = useMemo(() => [...members].sort((a, b) => b.totalStudySeconds - a.totalStudySeconds), [members])
  if (sorted.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
        <Trophy size={14} className="text-amber-400" /> Study Leaderboard
      </h4>
      <div className="space-y-1">
        {sorted.map((m, i) => (
          <div key={m.userId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50">
            <span className={cn(
              "w-5 text-center text-xs font-bold",
              i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-500"
            )}>
              {i + 1}
            </span>
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                {m.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-sm text-gray-200 truncate">
              {m.displayName}
              {m.isOwner && <Crown size={12} className="inline ml-1 text-amber-400" />}
            </span>
            <span className="text-xs text-gray-400 font-mono">{formatDuration(m.totalStudySeconds)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
        <Activity size={14} className="text-blue-400" /> Recent Activity
      </h4>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {entries.map((e, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-gray-800/30 text-xs">
            <span className="text-gray-500 whitespace-nowrap">
              {new Date(e.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="text-gray-300">
              <span className="font-medium">{e.displayName}</span> studied for {formatDuration(e.durationSeconds)}
              {e.tag && <span className="text-gray-500 ml-1">({e.tag})</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Timer controls panel for room owners -- create, edit, start/stop, delete
function TimerPanel({ channelId, timer, isOwner, onMutate }: {
  channelId: string; timer: RoomTimer | null; isOwner: boolean; onMutate: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [focus, setFocus] = useState(timer?.focusMinutes ?? 25)
  const [brk, setBrk] = useState(timer?.breakMinutes ?? 5)
  const [autoRestart, setAutoRestart] = useState(timer?.autoRestart ?? false)
  const [loading, setLoading] = useState(false)

  const handleCreate = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/timer`, {
        focusMinutes: focus, breakMinutes: brk, autoRestart,
      })
      toast.success("Timer created!")
      setCreating(false)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to create timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, focus, brk, autoRestart, onMutate])

  const handleEdit = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/rooms/${channelId}/timer`, {
        focusMinutes: focus, breakMinutes: brk, autoRestart,
      })
      toast.success("Timer updated!")
      setEditing(false)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, focus, brk, autoRestart, onMutate])

  const handleStartStop = useCallback(async (action: "start" | "stop") => {
    setLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/timer`, { action })
      toast.success(action === "start" ? "Timer started!" : "Timer stopped!")
      onMutate()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} timer`)
    } finally {
      setLoading(false)
    }
  }, [channelId, onMutate])

  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this timer? This cannot be undone.")) return
    setLoading(true)
    try {
      await dashboardMutate("DELETE", `/api/dashboard/rooms/${channelId}/timer`, {})
      toast.success("Timer deleted")
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete timer")
    } finally {
      setLoading(false)
    }
  }, [channelId, onMutate])

  if (!isOwner && !timer) return null

  if (!timer && !creating) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Pomodoro Timer
        </h4>
        {isOwner ? (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20 transition-colors"
          >
            <Plus size={12} /> Add Timer
          </button>
        ) : (
          <p className="text-xs text-gray-500">No timer configured for this room</p>
        )}
      </div>
    )
  }

  if (creating) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Create Timer
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Focus (min)</label>
            <input type="number" min={1} max={1440} value={focus} onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:border-purple-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Break (min)</label>
            <input type="number" min={1} max={1440} value={brk} onChange={(e) => setBrk(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:border-purple-500/50 focus:outline-none" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={autoRestart} onChange={(e) => setAutoRestart(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/30" />
          Auto-restart after break
        </label>
        <div className="flex gap-2">
          <button onClick={handleCreate} disabled={loading}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
            Create
          </button>
          <button onClick={() => setCreating(false)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Pomodoro Timer
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-semibold",
            timer!.isRunning ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-gray-700 text-gray-400"
          )}>
            {timer!.isRunning ? "Running" : "Stopped"}
          </span>
        </h4>
        {isOwner && (
          <div className="flex gap-1">
            {timer!.isRunning ? (
              <button onClick={() => handleStartStop("stop")} disabled={loading}
                className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors" title="Stop">
                <Square size={12} />
              </button>
            ) : (
              <button onClick={() => handleStartStop("start")} disabled={loading}
                className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors" title="Start">
                <Play size={12} />
              </button>
            )}
            <button onClick={() => { setFocus(timer!.focusMinutes); setBrk(timer!.breakMinutes); setAutoRestart(timer!.autoRestart); setEditing(!editing) }}
              className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors" title="Edit">
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete} disabled={loading}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors" title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Focus: <span className="text-gray-200">{timer!.focusMinutes}min</span></span>
          <span>Break: <span className="text-gray-200">{timer!.breakMinutes}min</span></span>
          {timer!.autoRestart && <span className="text-purple-400">Auto-restart</span>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Focus (min)</label>
              <input type="number" min={1} max={1440} value={focus} onChange={(e) => setFocus(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:border-purple-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Break (min)</label>
              <input type="number" min={1} max={1440} value={brk} onChange={(e) => setBrk(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:border-purple-500/50 focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={autoRestart} onChange={(e) => setAutoRestart(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500/30" />
            Auto-restart after break
          </label>
          <div className="flex gap-2">
            <button onClick={handleEdit} disabled={loading}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---

function RoomDetailPanel({ channelId, onClose, onMutate }: {
  channelId: string; onClose: () => void; onMutate: () => void
}) {
  const { data, isLoading, mutate: mutateDetail } = useDashboard<RoomDetail>(
    `/api/dashboard/rooms/${channelId}`,
    { refreshInterval: 30000 }
  )

  const handleMutate = useCallback(() => {
    mutateDetail()
    onMutate()
  }, [mutateDetail, onMutate])

  if (isLoading) {
    return (
      <div className="mt-2 p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-2/5" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mt-2 p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={12} /> Created {formatDate(data.createdAt)}
            <span className="mx-1">|</span>
            <Clock size={12} /> Next rent {formatRelative(data.nextTick)}
          </div>
          {data.isOwner && (
            <RenamePanel channelId={channelId} currentName={data.name} onRename={handleMutate} />
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-700 text-gray-400">
          <X size={16} />
        </button>
      </div>

      <DepositPanel channelId={channelId} rentPrice={data.rentPrice} onDeposit={handleMutate} />

      {/* --- AI-MODIFIED (2026-03-22) --- */}
      {/* Purpose: Timer controls for room owners */}
      <TimerPanel channelId={channelId} timer={data.timer} isOwner={data.isOwner} onMutate={handleMutate} />
      {/* --- END AI-MODIFIED --- */}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          <Users size={14} className="text-blue-400" /> Members ({data.members.length}/{data.memberCap})
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-800/80 text-xs">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                  {m.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-200">{m.displayName}</span>
              {m.isOwner && <Crown size={10} className="text-amber-400" />}
            </div>
          ))}
        </div>
      </div>

      <StudyLeaderboard members={data.members} />
      <ActivityFeed entries={data.activityFeed} />
    </div>
  )
}

function RoomCardComponent({ room, expanded, onToggle, onMutate }: {
  room: RoomCard; expanded: boolean; onToggle: () => void; onMutate: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "w-full text-left p-4 rounded-xl border transition-all",
          expanded
            ? "bg-gray-800/80 border-gray-600"
            : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <DoorOpen size={16} className="text-blue-400" />
            <span className="font-medium text-gray-100">{room.name || "Unnamed Room"}</span>
            {room.isOwner && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Crown size={10} /> Owner
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="flex items-center gap-1 text-xs">
              <Users size={12} /> {room.memberCount}/{room.memberCap}
            </span>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-sm text-amber-300">
            <Coins size={14} /> {room.coinBalance.toLocaleString()}
          </span>
        </div>

        <HealthBar daysRemaining={room.daysRemaining} rentPrice={room.rentPrice} />
      </button>

      {expanded && (
        <RoomDetailPanel channelId={room.channelId} onClose={onToggle} onMutate={onMutate} />
      )}
    </div>
  )
}

export default function RoomsPage() {
  const { data: session } = useSession()
  const { data, isLoading, mutate } = useDashboard<RoomsData>(
    session ? "/api/dashboard/rooms" : null,
    { refreshInterval: 30000 }
  )
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
  const [showExpired, setShowExpired] = useState(false)

  const handleMutate = useCallback(() => { mutate() }, [mutate])

  const skeleton = (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-2 bg-gray-700 rounded w-full" />
        </div>
      ))}
    </div>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
        <DoorOpen size={40} className="text-blue-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-gray-100 mb-2">No Private Rooms Yet</h2>
      <p className="text-gray-400 max-w-md mb-6 leading-relaxed">
        Private rooms are personal voice channels you rent in a server. You get your own space
        to study with friends, set timers, and manage who can join.
      </p>
      <div className="bg-gray-800/60 rounded-xl p-5 max-w-sm w-full text-left space-y-3 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-gray-200">How to get started</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>Join a server that has private rooms enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>Use <code className="text-blue-300 bg-blue-500/10 px-1 rounded">/room rent</code> to create your room</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span>Invite friends, set timers, and manage everything here!</span>
          </div>
        </div>
      </div>
    </div>
  )

  const hasRooms = data && (data.servers.length > 0 || data.expiredRooms.length > 0)

  return (
    <Layout SEO={{ title: "My Rooms - LionBot Dashboard", description: "Manage your private rooms" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                    <DoorOpen size={24} className="text-blue-400" /> My Rooms
                  </h1>
                  {data && data.totalActiveRooms > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {data.totalActiveRooms} active room{data.totalActiveRooms !== 1 ? "s" : ""} across {data.servers.length} server{data.servers.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {isLoading ? skeleton : !hasRooms ? emptyState : (
                <div className="space-y-8">
                  {data!.servers.map((server) => (
                    <div key={server.guildId}>
                      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageCircle size={14} />
                        {server.guildName}
                      </h2>
                      <div className="space-y-3">
                        {server.rooms.map((room) => (
                          <RoomCardComponent
                            key={room.channelId}
                            room={room}
                            expanded={expandedRoom === room.channelId}
                            onToggle={() => setExpandedRoom(
                              expandedRoom === room.channelId ? null : room.channelId
                            )}
                            onMutate={handleMutate}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {data!.expiredRooms.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowExpired(!showExpired)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 hover:text-gray-400 transition-colors"
                      >
                        <History size={14} />
                        Expired Rooms ({data!.expiredRooms.length})
                        {showExpired ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {showExpired && (
                        <div className="space-y-2 opacity-60">
                          {data!.expiredRooms.map((room) => (
                            <div key={room.channelId} className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <DoorOpen size={14} className="text-gray-500" />
                                  <span className="text-sm text-gray-400">{room.name || "Unnamed Room"}</span>
                                  <span className="text-xs text-gray-600">in {room.guildName}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {formatDate(room.createdAt)} — {formatDate(room.deletedAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
