// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Private Rooms dashboard page - lists all rooms across servers
//          with health bars, deposit presets, study leaderboard, activity feed,
//          rename (owner), expired rooms history, and educational empty state
// ============================================================
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Migrated hardcoded gray-* Tailwind colors to semantic design tokens
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
// --- AI-MODIFIED (2026-04-01) ---
// Purpose: Import ConfirmModal for close room confirmation dialog
import { toast, DashboardShell, PageHeader, ConfirmModal } from "@/components/dashboard/ui"
// --- END AI-MODIFIED ---
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
  Volume2, Music, StopCircle,
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
        <span className="text-muted-foreground">{rentPrice}/day</span>
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
      <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
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
            <span className="ml-1 text-muted-foreground">= {p.days * rentPrice}</span>
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
          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:outline-none"
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
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-blue-500/50 focus:outline-none"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <button onClick={save} disabled={loading} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-accent">
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
      <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Trophy size={14} className="text-amber-400" /> Study Leaderboard
      </h4>
      <div className="space-y-1">
        {sorted.map((m, i) => (
          <div key={m.userId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/50">
            <span className={cn(
              "w-5 text-center text-xs font-bold",
              i === 0 ? "text-amber-400" : i === 1 ? "text-foreground" : i === 2 ? "text-orange-400" : "text-muted-foreground"
            )}>
              {i + 1}
            </span>
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                {m.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-sm text-foreground truncate">
              {m.displayName}
              {m.isOwner && <Crown size={12} className="inline ml-1 text-amber-400" />}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{formatDuration(m.totalStudySeconds)}</span>
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
      <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Activity size={14} className="text-blue-400" /> Recent Activity
      </h4>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {entries.map((e, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-card/50 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">
              {new Date(e.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="text-foreground">
              <span className="font-medium">{e.displayName}</span> studied for {formatDuration(e.durationSeconds)}
              {e.tag && <span className="text-muted-foreground ml-1">({e.tag})</span>}
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
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
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
          <p className="text-xs text-muted-foreground">No timer configured for this room</p>
        )}
      </div>
    )
  }

  if (creating) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Create Timer
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Focus (min)</label>
            <input type="number" min={1} max={1440} value={focus} onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Break (min)</label>
            <input type="number" min={1} max={1440} value={brk} onChange={(e) => setBrk(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={autoRestart} onChange={(e) => setAutoRestart(e.target.checked)}
            className="rounded border-border bg-muted text-purple-500 focus:ring-purple-500/30" />
          Auto-restart after break
        </label>
        <div className="flex gap-2">
          <button onClick={handleCreate} disabled={loading}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
            Create
          </button>
          <button onClick={() => setCreating(false)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Timer size={14} className="text-purple-400" /> Pomodoro Timer
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-semibold",
            timer!.isRunning ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"
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
              className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors" title="Edit">
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
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Focus: <span className="text-foreground">{timer!.focusMinutes}min</span></span>
          <span>Break: <span className="text-foreground">{timer!.breakMinutes}min</span></span>
          {timer!.autoRestart && <span className="text-purple-400">Auto-restart</span>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Focus (min)</label>
              <input type="number" min={1} max={1440} value={focus} onChange={(e) => setFocus(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Break (min)</label>
              <input type="number" min={1} max={1440} value={brk} onChange={(e) => setBrk(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-purple-500/50 focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={autoRestart} onChange={(e) => setAutoRestart(e.target.checked)}
              className="rounded border-border bg-muted text-purple-500 focus:ring-purple-500/30" />
            Auto-restart after break
          </label>
          <div className="flex gap-2">
            <button onClick={handleEdit} disabled={loading}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-01) ---
// Purpose: Close Room panel component for owners to permanently close their room
function CloseRoomPanel({ channelId, coinBalance, onClose }: {
  channelId: string; coinBalance: number; onClose: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleCloseRoom = async () => {
    setIsClosing(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${channelId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to close room")
      }
      const result = await res.json()
      toast.success(
        result.refunded > 0
          ? `Room closed. ${result.refunded.toLocaleString()} coins refunded to your wallet.`
          : "Room closed successfully."
      )
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Failed to close room")
    } finally {
      setIsClosing(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="pt-3 border-t border-border/50">
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isClosing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-colors disabled:opacity-50"
      >
        <Trash2 size={12} />
        Close Room
      </button>
      <ConfirmModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleCloseRoom}
        title="Close Private Room?"
        message={`This will permanently close your private room. The Discord channel will be cleaned up by the bot. ${coinBalance > 0 ? `Your remaining balance of ${coinBalance.toLocaleString()} coins will be refunded.` : "There are no coins to refund."}`}
        confirmLabel="Close Room"
        variant="danger"
        loading={isClosing}
      />
    </div>
  )
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-03) ---
// Purpose: Sound rental panel for members to rent, extend, and cancel sound bots in private rooms
const SOUND_OPTIONS: { value: string; label: string }[] = [
  { value: "rain", label: "Rain" },
  { value: "campfire", label: "Campfire" },
  { value: "ocean", label: "Ocean Waves" },
  { value: "brown_noise", label: "Brown Noise" },
  { value: "white_noise", label: "White Noise" },
  { value: "lofi", label: "LoFi Music" },
]

interface SoundRentalData {
  rental: {
    rental_id: number
    sound_type: string
    bot_number: number
    started_at: string
    expires_at: string
    total_cost: number
    userid: string
  } | null
  rentalEnabled: boolean
  hourlyRate: number
  isOwner: boolean
}

function SoundRentalPanel({ channelId, onMutate }: {
  channelId: string; onMutate: () => void
}) {
  const { data, isLoading, mutate: mutateSoundRental } = useDashboard<SoundRentalData>(
    `/api/dashboard/rooms/${channelId}/sound-rental`,
    { refreshInterval: 30000 }
  )
  const [renting, setRenting] = useState(false)
  const [selectedSound, setSelectedSound] = useState("rain")
  const [hours, setHours] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleRent = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/sound-rental`, {
        sound_type: selectedSound,
        hours,
      })
      toast.success(`Sound bot rented! Bot #${result.bot_number} will join shortly. Cost: ${result.total_cost} coins.`)
      setRenting(false)
      mutateSoundRental()
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to rent sound bot")
    } finally {
      setLoading(false)
    }
  }, [channelId, selectedSound, hours, mutateSoundRental, onMutate])

  const handleExtend = useCallback(async (extendHours: number) => {
    setLoading(true)
    try {
      const result = await dashboardMutate("PATCH", `/api/dashboard/rooms/${channelId}/sound-rental`, {
        hours: extendHours,
      })
      toast.success(`Extended! New expiry: ${new Date(result.new_expires_at).toLocaleTimeString()}. Cost: ${result.extend_cost} coins.`)
      mutateSoundRental()
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to extend rental")
    } finally {
      setLoading(false)
    }
  }, [channelId, mutateSoundRental, onMutate])

  const handleCancel = useCallback(async () => {
    setLoading(true)
    try {
      await dashboardMutate("DELETE", `/api/dashboard/rooms/${channelId}/sound-rental`, {})
      toast.success("Sound bot rental cancelled. The bot will disconnect shortly.")
      mutateSoundRental()
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel rental")
    } finally {
      setLoading(false)
    }
  }, [channelId, mutateSoundRental, onMutate])

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    )
  }

  if (!data || !data.rentalEnabled) return null

  const rental = data.rental
  const soundLabel = (st: string) => SOUND_OPTIONS.find((s) => s.value === st)?.label ?? st

  if (rental) {
    const remaining = Math.max(0, new Date(rental.expires_at).getTime() - Date.now())
    const hoursLeft = Math.floor(remaining / 3600_000)
    const minsLeft = Math.floor((remaining % 3600_000) / 60_000)
    const pct = Math.min(100, (remaining / (24 * 3600_000)) * 100)
    const barColor = hoursLeft >= 2 ? "bg-emerald-500" : hoursLeft >= 1 ? "bg-amber-500" : "bg-red-500"
    const textColor = hoursLeft >= 2 ? "text-emerald-400" : hoursLeft >= 1 ? "text-amber-400" : "text-red-400"

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Volume2 size={14} className="text-indigo-400" /> Sound Bot
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            Active
          </span>
        </h4>

        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Music size={14} className="text-indigo-300" />
              <span className="text-foreground font-medium">{soundLabel(rental.sound_type)}</span>
              <span className="text-xs text-muted-foreground">Bot #{rental.bot_number}</span>
            </div>
            <span className="text-xs text-muted-foreground">{rental.total_cost} coins spent</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={textColor}>
                {hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m remaining` : `${minsLeft}m remaining`}
              </span>
              <span className="text-muted-foreground">
                Expires {new Date(rental.expires_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {[1, 2, 4].map((h) => (
              <button
                key={h}
                disabled={loading}
                onClick={() => handleExtend(h)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20 transition-colors disabled:opacity-50"
              >
                +{h}h
                <span className="ml-1 text-muted-foreground">({data.hourlyRate * h})</span>
              </button>
            ))}
            <button
              disabled={loading}
              onClick={handleCancel}
              className="ml-auto px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <StopCircle size={10} /> Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (renting) {
    const totalCost = data.hourlyRate * hours

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Volume2 size={14} className="text-indigo-400" /> Rent Sound Bot
        </h4>
        <div className="space-y-3 p-3 rounded-lg bg-card/50 border border-border/50">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sound</label>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-indigo-500/50 focus:outline-none"
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration (hours)</label>
            <div className="flex gap-2">
              {[1, 2, 4, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    hours === h
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
            <span className="text-muted-foreground">
              {data.hourlyRate}/hr &times; {hours}h
            </span>
            <span className="text-amber-300 font-medium flex items-center gap-1">
              <Coins size={12} /> {totalCost} LionCoins
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRent}
              disabled={loading}
              className="flex-1 px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Rent Sound Bot
            </button>
            <button
              onClick={() => setRenting(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Volume2 size={14} className="text-indigo-400" /> Sound Bot
      </h4>
      <button
        onClick={() => setRenting(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20 transition-colors"
      >
        <Music size={12} /> Rent a Sound Bot
      </button>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Add ambient sounds or LoFi music to your room! A bot will join and play your chosen sound. Costs {data.hourlyRate} coins/hour.
      </p>
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
      <div className="mt-2 p-4 rounded-xl bg-card/50 border border-border/50 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted rounded w-2/5" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mt-2 p-4 rounded-xl bg-card/50 border border-border/50 space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} /> Created {formatDate(data.createdAt)}
            <span className="mx-1">|</span>
            <Clock size={12} /> Next rent {formatRelative(data.nextTick)}
          </div>
          {data.isOwner && (
            <RenamePanel channelId={channelId} currentName={data.name} onRename={handleMutate} />
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
          <X size={16} />
        </button>
      </div>

      <DepositPanel channelId={channelId} rentPrice={data.rentPrice} onDeposit={handleMutate} />

      {/* --- AI-MODIFIED (2026-03-22) --- */}
      {/* Purpose: Timer controls for room owners */}
      <TimerPanel channelId={channelId} timer={data.timer} isOwner={data.isOwner} onMutate={handleMutate} />
      {/* --- END AI-MODIFIED --- */}

      {/* --- AI-MODIFIED (2026-04-03) --- */}
      {/* Purpose: Sound bot rental panel for members */}
      <SoundRentalPanel channelId={channelId} onMutate={handleMutate} />
      {/* --- END AI-MODIFIED --- */}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Users size={14} className="text-blue-400" /> Members ({data.members.length}/{data.memberCap})
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card/50 text-xs">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                  {m.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-foreground">{m.displayName}</span>
              {m.isOwner && <Crown size={10} className="text-amber-400" />}
            </div>
          ))}
        </div>
      </div>

      <StudyLeaderboard members={data.members} />
      <ActivityFeed entries={data.activityFeed} />

      {/* --- AI-MODIFIED (2026-04-01) --- */}
      {/* Purpose: Close Room button for owners with confirmation dialog */}
      {data.isOwner && !data.deletedAt && (
        <CloseRoomPanel channelId={channelId} coinBalance={data.coinBalance} onClose={() => { handleMutate(); onClose(); }} />
      )}
      {/* --- END AI-MODIFIED --- */}
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
            ? "bg-card/50 border-border"
            : "bg-card/50 border-border/50 hover:bg-muted hover:border-border/50"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <DoorOpen size={16} className="text-blue-400" />
            <span className="font-medium text-foreground">{room.name || "Unnamed Room"}</span>
            {room.isOwner && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Crown size={10} /> Owner
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
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
        <div key={i} className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="h-4 bg-muted rounded w-1/3 mb-3" />
          <div className="h-3 bg-muted rounded w-1/2 mb-2" />
          <div className="h-2 bg-muted rounded w-full" />
        </div>
      ))}
    </div>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
        <DoorOpen size={40} className="text-blue-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No Private Rooms Yet</h2>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
        Private rooms are personal voice channels you rent in a server. You get your own space
        to study with friends, set timers, and manage who can join.
      </p>
      <div className="bg-card/50 rounded-xl p-5 max-w-sm w-full text-left space-y-3 border border-border/50">
        <h3 className="text-sm font-semibold text-foreground">How to get started</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
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
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><main className="flex-1 min-w-0"> */}
        <DashboardShell nav={<DashboardNav />}>
              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Migrated to shared PageHeader component for consistency */}
              {/* What the new code does better: Consistent page header styling with breadcrumbs */}
              {/* --- Original code (commented out for rollback) --- */}
              {/* <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <DoorOpen size={24} className="text-blue-400" /> My Rooms
                  </h1>
                  {data && data.totalActiveRooms > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.totalActiveRooms} active room{data.totalActiveRooms !== 1 ? "s" : ""} across {data.servers.length} server{data.servers.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div> */}
              {/* --- End original code --- */}
              <PageHeader
                title="My Rooms"
                description={
                  data && data.totalActiveRooms > 0
                    ? `${data.totalActiveRooms} active room${data.totalActiveRooms !== 1 ? "s" : ""} across ${data.servers.length} server${data.servers.length !== 1 ? "s" : ""}`
                    : undefined
                }
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "My Rooms" },
                ]}
              />
              {/* --- END AI-REPLACED --- */}

              {isLoading ? skeleton : !hasRooms ? emptyState : (
                <div className="space-y-8">
                  {data!.servers.map((server) => (
                    <div key={server.guildId}>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
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
                        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 hover:text-muted-foreground transition-colors"
                      >
                        <History size={14} />
                        Expired Rooms ({data!.expiredRooms.length})
                        {showExpired ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {showExpired && (
                        <div className="space-y-2 opacity-60">
                          {data!.expiredRooms.map((room) => (
                            <div key={room.channelId} className="p-3 rounded-xl bg-card/50 border border-border/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <DoorOpen size={14} className="text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{room.name || "Unnamed Room"}</span>
                                  <span className="text-xs text-muted-foreground">in {room.guildName}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
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
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
