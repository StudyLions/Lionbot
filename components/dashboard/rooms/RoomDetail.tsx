// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Room detail panel (right side of two-panel layout).
//          Composes status header, deposit, members, sound, timer,
//          leaderboard, activity, and danger zone sections with
//          collapsible sections and freeze/auto-extend indicators.
// ============================================================
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Calendar, Clock, Pencil, Check, X, ChevronDown, ChevronRight,
  Snowflake, RefreshCw, Trash2, LogOut, ArrowLeft,
} from "lucide-react"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { toast, ConfirmModal } from "@/components/dashboard/ui"
import { formatDate, formatRelative, healthColor } from "./types"
import type { RoomDetailData } from "./types"
import DepositPanel from "./DepositPanel"
import MemberPanel from "./MemberPanel"
import SoundPanel from "./SoundPanel"
import TimerPanel from "./TimerPanel"
import LeaderboardPanel from "./LeaderboardPanel"
import ActivityPanel from "./ActivityPanel"

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (!title) return <>{children}</>

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {icon}
        {title}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

function RenameInline({
  channelId,
  currentName,
  onRename,
}: {
  channelId: string
  currentName: string | null
  onRename: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName || "")
  const [loading, setLoading] = useState(false)

  const save = useCallback(async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/rooms/${channelId}`, {
        name: name.trim(),
      })
      toast.success("Room renamed! Discord updates within a few minutes.")
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
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Rename"
      >
        <Pencil size={14} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className="flex-1 px-2.5 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:border-blue-500/50 focus:outline-none"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <button
        onClick={save}
        disabled={loading}
        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-accent"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function RoomDetail({
  channelId,
  onBack,
  onRoomClosed,
}: {
  channelId: string
  onBack?: () => void
  onRoomClosed: () => void
}) {
  const { data, isLoading, mutate: mutateDetail } = useDashboard<RoomDetailData>(
    `/api/dashboard/rooms/${channelId}`,
    { refreshInterval: 30000 }
  )
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleMutate = useCallback(() => {
    mutateDetail()
  }, [mutateDetail])

  const handleClose = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${channelId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to close room")
      }
      const result = await res.json()
      toast.success(
        result.refunded > 0
          ? `Room closed. ${result.refunded.toLocaleString()} coins refunded.`
          : "Room closed successfully."
      )
      onRoomClosed()
    } catch (e: any) {
      toast.error(e.message || "Failed to close room")
    } finally {
      setActionLoading(false)
      setShowCloseConfirm(false)
    }
  }

  const handleLeave = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/dashboard/rooms/${channelId}/leave`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to leave room")
      }
      toast.success("You have left the room.")
      onRoomClosed()
    } catch (e: any) {
      toast.error(e.message || "Failed to leave room")
    } finally {
      setActionLoading(false)
      setShowLeaveConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-card/30 border border-border/50 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-2/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="h-20 bg-muted rounded w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-5 rounded-xl bg-card/30 border border-border/50 text-center">
        <p className="text-muted-foreground">Room not found</p>
      </div>
    )
  }

  const colors = healthColor(data.daysRemaining, data.frozenAt)
  const maxDays = 30
  const pct = Math.min(100, Math.max(0, (data.daysRemaining / maxDays) * 100))

  return (
    <div className="rounded-xl bg-card/30 border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className="text-lg font-semibold text-foreground truncate flex-1">
            {data.name || "Unnamed Room"}
          </h3>
          {data.isOwner && (
            <RenameInline channelId={channelId} currentName={data.name} onRename={handleMutate} />
          )}
        </div>

        {/* Freeze banner */}
        {data.frozenAt && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <Snowflake size={14} className="flex-shrink-0" />
            <div>
              <span className="font-medium">Frozen by moderator</span>
              <span className="text-blue-300/70 ml-1">&mdash; rent payments paused</span>
            </div>
          </div>
        )}

        {/* Health bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={cn("font-medium", colors.text)}>
              {data.frozenAt
                ? "Frozen"
                : data.daysRemaining <= 0
                  ? "Expires next tick!"
                  : `${data.daysRemaining} day${data.daysRemaining !== 1 ? "s" : ""} remaining`}
            </span>
            <span className="text-muted-foreground">{data.rentPrice}/day</span>
          </div>
          <div className={cn("h-2 rounded-full overflow-hidden", colors.barBg)}>
            <div
              className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> Created {formatDate(data.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> Next rent {formatRelative(data.nextTick)}
          </span>
          {data.autoExtendEnabled && (
            <span className="flex items-center gap-1 text-emerald-400" title="When the room bank runs out, the owner's wallet will be charged automatically">
              <RefreshCw size={11} /> Auto-extend ON
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        <DepositPanel
          channelId={channelId}
          rentPrice={data.rentPrice}
          walletBalance={data.walletBalance ?? 0}
          coinBalance={data.coinBalance}
          onDeposit={handleMutate}
        />

        <div className="border-t border-border/30" />

        <MemberPanel
          channelId={channelId}
          members={data.members}
          memberCap={data.memberCap}
          isOwner={data.isOwner}
          onMutate={handleMutate}
        />

        <div className="border-t border-border/30" />

        <SoundPanel channelId={channelId} onMutate={handleMutate} />

        <div className="border-t border-border/30" />

        <TimerPanel
          channelId={channelId}
          timer={data.timer}
          isOwner={data.isOwner}
          onMutate={handleMutate}
        />

        <div className="border-t border-border/30" />

        <Section title="Leaderboard" defaultOpen={false}>
          <LeaderboardPanel members={data.members} />
        </Section>

        <Section title="Activity" defaultOpen={false}>
          <ActivityPanel entries={data.activityFeed} />
        </Section>

        {/* Danger zone */}
        {!data.deletedAt && (
          <>
            <div className="border-t border-border/30" />
            <div className="space-y-2">
              {data.isOwner ? (
                <button
                  onClick={() => setShowCloseConfirm(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} /> Close Room
                </button>
              ) : data.isMember ? (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-orange-400 hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/30 transition-colors disabled:opacity-50"
                >
                  <LogOut size={12} /> Leave Room
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={showCloseConfirm}
        onCancel={() => setShowCloseConfirm(false)}
        onConfirm={handleClose}
        title="Close Private Room?"
        message={`This will permanently close your private room. ${data.coinBalance > 0 ? `Your remaining balance of ${data.coinBalance.toLocaleString()} coins will be refunded.` : "There are no coins to refund."}`}
        confirmLabel="Close Room"
        variant="danger"
        loading={actionLoading}
      />

      <ConfirmModal
        open={showLeaveConfirm}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeave}
        title="Leave Private Room?"
        message="You will lose access until the owner invites you back. Discord permissions update within a few minutes."
        confirmLabel="Leave Room"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
