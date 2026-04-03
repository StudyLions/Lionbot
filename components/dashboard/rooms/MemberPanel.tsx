// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Member management panel for private room detail view.
//          Displays member list with voice indicators, and provides
//          invite, kick, and transfer ownership controls for owners.
// ============================================================
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Users, Crown, UserPlus, X, ArrowRightLeft, Mic,
} from "lucide-react"
import { dashboardMutate } from "@/hooks/useDashboard"
import { toast, ConfirmModal } from "@/components/dashboard/ui"
import { formatDuration } from "./types"
import type { RoomMember } from "./types"

export default function MemberPanel({
  channelId,
  members,
  memberCap,
  isOwner,
  onMutate,
}: {
  channelId: string
  members: RoomMember[]
  memberCap: number
  isOwner: boolean
  onMutate: () => void
}) {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteId, setInviteId] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [kickTarget, setKickTarget] = useState<RoomMember | null>(null)
  const [kickLoading, setKickLoading] = useState(false)
  const [transferTarget, setTransferTarget] = useState<RoomMember | null>(null)
  const [transferLoading, setTransferLoading] = useState(false)

  const handleInvite = useCallback(async () => {
    const trimmed = inviteId.trim()
    if (!trimmed) return
    setInviteLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/invite`, {
        userId: trimmed,
      })
      toast.success("Member invited! Discord permissions will update within a few minutes.")
      setInviteId("")
      setShowInvite(false)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member")
    } finally {
      setInviteLoading(false)
    }
  }, [channelId, inviteId, onMutate])

  const handleKick = useCallback(async () => {
    if (!kickTarget) return
    setKickLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/kick`, {
        userId: kickTarget.userId,
      })
      toast.success(`${kickTarget.displayName} has been removed. Discord permissions will update shortly.`)
      setKickTarget(null)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to kick member")
    } finally {
      setKickLoading(false)
    }
  }, [channelId, kickTarget, onMutate])

  const handleTransfer = useCallback(async () => {
    if (!transferTarget) return
    setTransferLoading(true)
    try {
      await dashboardMutate("POST", `/api/dashboard/rooms/${channelId}/transfer`, {
        userId: transferTarget.userId,
      })
      toast.success(`Ownership transferred to ${transferTarget.displayName}!`)
      setTransferTarget(null)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer ownership")
    } finally {
      setTransferLoading(false)
    }
  }, [channelId, transferTarget, onMutate])

  const nonOwnerMembers = members.filter((m) => !m.isOwner)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Users size={14} className="text-blue-400" /> Members ({members.length}/{memberCap})
        </h4>
        {isOwner && members.length < memberCap && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/20 transition-colors"
          >
            <UserPlus size={12} /> Invite
          </button>
        )}
      </div>

      {showInvite && (
        <div className="flex gap-2">
          <input
            value={inviteId}
            onChange={(e) => setInviteId(e.target.value)}
            placeholder="Discord User ID"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          <button
            onClick={handleInvite}
            disabled={inviteLoading || !inviteId.trim()}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowInvite(false)
              setInviteId("")
            }}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="space-y-1">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card/50 group"
          >
            <div className="relative flex-shrink-0">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
                  {m.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {m.isInVoice && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <Mic size={6} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-foreground truncate">{m.displayName}</span>
                {m.isOwner && <Crown size={11} className="text-amber-400 flex-shrink-0" />}
              </div>
            </div>

            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
              {formatDuration(m.totalStudySeconds)}
            </span>

            {isOwner && !m.isOwner && (
              <button
                onClick={() => setKickTarget(m)}
                className="p-1 rounded text-muted-foreground/0 group-hover:text-red-400 hover:bg-red-500/10 transition-all"
                title={`Remove ${m.displayName}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && nonOwnerMembers.length > 0 && (
        <TransferSection
          members={nonOwnerMembers}
          onSelect={setTransferTarget}
        />
      )}

      <ConfirmModal
        open={!!kickTarget}
        onCancel={() => setKickTarget(null)}
        onConfirm={handleKick}
        title="Remove Member?"
        message={`Remove ${kickTarget?.displayName} from this room? They will lose access until you invite them again. Discord permissions update within a few minutes.`}
        confirmLabel="Remove"
        variant="danger"
        loading={kickLoading}
      />

      <ConfirmModal
        open={!!transferTarget}
        onCancel={() => setTransferTarget(null)}
        onConfirm={handleTransfer}
        title="Transfer Ownership?"
        message={`Transfer room ownership to ${transferTarget?.displayName}? You will become a regular member and they will become the owner. This cannot be undone from the dashboard.`}
        confirmLabel="Transfer"
        variant="danger"
        loading={transferLoading}
      />
    </div>
  )
}

function TransferSection({
  members,
  onSelect,
}: {
  members: RoomMember[]
  onSelect: (m: RoomMember) => void
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRightLeft size={12} /> Transfer ownership...
      </button>
    )
  }

  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border/50 space-y-2">
      <p className="text-xs text-muted-foreground">Select the new owner:</p>
      <div className="space-y-1">
        {members.map((m) => (
          <button
            key={m.userId}
            onClick={() => onSelect(m)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                {m.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {m.displayName}
          </button>
        ))}
      </div>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
