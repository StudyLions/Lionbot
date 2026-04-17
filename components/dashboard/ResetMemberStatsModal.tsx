// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-17
// Purpose: Admin-only modal for selectively resetting a member's
//          tracked stats in one server. Mirrors the look-and-feel of
//          the existing MemberActionModals (ModalShell + dark theme).
//          Includes:
//            - Time-frame selector (All / 24h / 7d / 30d / Custom)
//            - Per-category checkboxes with auto-disable for
//              non-time-framed items when a range is set
//            - Debounced dry-run preview that shows real row counts
//            - Active-session warning when relevant
//            - Required reason (>=3 chars) and typed-confirmation
//              that must exactly match the member name
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react"
import {
  RotateCcw,
  X,
  AlertTriangle,
  Loader2,
  Mic,
  MessageSquare,
  Sparkles,
  Timer,
  Trophy,
  Coins,
  Info,
} from "lucide-react"

export type ResetTimeFrame =
  | { kind: "all" }
  | { kind: "last"; hours: number }
  | { kind: "custom"; startISO: string; endISO: string }

export interface ResetSelections {
  voiceSessions?: boolean
  textSessions?: boolean
  voiceXp?: boolean
  textXp?: boolean
  pomodoroMilestones?: boolean
  seasonStats?: boolean
  coins?: boolean
}

export interface ResetPreview {
  counts: {
    voiceSessions: number
    voiceSessionsSeconds: number
    textSessions: number
    textSessionsSeconds: number
    voiceXp: number
    voiceXpAmount: number
    textXp: number
    textXpAmount: number
    pomodoroMilestones: number
    hasSeasonStats: boolean
    seasonStatsSnapshot: { voice_stats: number; xp_stats: number; message_stats: number } | null
  }
  currentCoins: number
  activeSession: { exists: boolean; startedAt: string | null; willBeDeleted: boolean }
}

interface Props {
  open: boolean
  onClose: () => void
  serverId: string
  serverName: string
  memberUserId: string
  memberName: string
  loading: boolean
  onConfirm: (payload: { selections: ResetSelections; timeFrame: ResetTimeFrame; reason: string }) => void
}

const TIME_FRAME_PRESETS: Array<{ id: string; label: string; build: () => ResetTimeFrame }> = [
  { id: "all", label: "All time", build: () => ({ kind: "all" }) },
  { id: "24h", label: "Last 24h", build: () => ({ kind: "last", hours: 24 }) },
  { id: "7d", label: "Last 7 days", build: () => ({ kind: "last", hours: 168 }) },
  { id: "30d", label: "Last 30 days", build: () => ({ kind: "last", hours: 720 }) },
  { id: "custom", label: "Custom", build: () => ({ kind: "custom", startISO: "", endISO: "" }) },
]

interface CategoryDef {
  key: keyof ResetSelections
  label: string
  icon: React.ReactNode
  description: string
  timeFramed: boolean
  formatPreview: (p: ResetPreview, currentCoins: number) => string | null
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "voiceSessions",
    label: "Voice study sessions",
    icon: <Mic size={14} />,
    description: "Deletes tracked voice/study sessions in the selected range.",
    timeFramed: true,
    formatPreview: (p) => {
      if (p.counts.voiceSessions === 0) return "0 sessions"
      const hrs = Math.round((p.counts.voiceSessionsSeconds / 3600) * 10) / 10
      return `${p.counts.voiceSessions.toLocaleString()} session${p.counts.voiceSessions === 1 ? "" : "s"} (${hrs}h)`
    },
  },
  {
    key: "textSessions",
    label: "Text study sessions",
    icon: <MessageSquare size={14} />,
    description: "Deletes tracked text-channel study sessions.",
    timeFramed: true,
    formatPreview: (p) => {
      if (p.counts.textSessions === 0) return "0 sessions"
      const hrs = Math.round((p.counts.textSessionsSeconds / 3600) * 10) / 10
      return `${p.counts.textSessions.toLocaleString()} session${p.counts.textSessions === 1 ? "" : "s"} (${hrs}h)`
    },
  },
  {
    key: "voiceXp",
    label: "Voice XP",
    icon: <Sparkles size={14} />,
    description: "Removes XP earned from voice/study activity.",
    timeFramed: true,
    formatPreview: (p) =>
      p.counts.voiceXp === 0
        ? "0 entries"
        : `${p.counts.voiceXpAmount.toLocaleString()} XP across ${p.counts.voiceXp.toLocaleString()} entries`,
  },
  {
    key: "textXp",
    label: "Text XP",
    icon: <Sparkles size={14} />,
    description: "Removes XP earned from text-channel messages.",
    timeFramed: true,
    formatPreview: (p) =>
      p.counts.textXp === 0
        ? "0 entries"
        : `${p.counts.textXpAmount.toLocaleString()} XP across ${p.counts.textXp.toLocaleString()} entries`,
  },
  {
    key: "pomodoroMilestones",
    label: "Pomodoro milestones",
    icon: <Timer size={14} />,
    description: "Clears earned pomodoro milestone records.",
    timeFramed: true,
    formatPreview: (p) =>
      p.counts.pomodoroMilestones === 0
        ? "0 milestones"
        : `${p.counts.pomodoroMilestones.toLocaleString()} milestone${p.counts.pomodoroMilestones === 1 ? "" : "s"}`,
  },
  {
    key: "seasonStats",
    label: "Season stats",
    icon: <Trophy size={14} />,
    description: "Resets the cached season leaderboard row (recreated on next session).",
    timeFramed: false,
    formatPreview: (p) =>
      p.counts.hasSeasonStats
        ? `Will reset season totals${
            p.counts.seasonStatsSnapshot
              ? ` (voice ${p.counts.seasonStatsSnapshot.voice_stats}, xp ${p.counts.seasonStatsSnapshot.xp_stats})`
              : ""
          }`
        : "No season row to reset",
  },
  {
    key: "coins",
    label: "Coins (LionCoins)",
    icon: <Coins size={14} />,
    description: "Sets the member's coin balance to 0. Historical transactions are NOT deleted.",
    timeFramed: false,
    formatPreview: (_p, currentCoins) =>
      currentCoins > 0 ? `Will clear ${currentCoins.toLocaleString()} coins` : "Already at 0",
  },
]

function describeTimeFrame(tf: ResetTimeFrame): string {
  if (tf.kind === "all") return "all time"
  if (tf.kind === "last") {
    if (tf.hours === 24) return "the last 24 hours"
    if (tf.hours === 168) return "the last 7 days"
    if (tf.hours === 720) return "the last 30 days"
    return `the last ${tf.hours} hours`
  }
  return `${tf.startISO?.slice(0, 10) || "?"} to ${tf.endISO?.slice(0, 10) || "?"}`
}

function isTimeFrameValid(tf: ResetTimeFrame): boolean {
  if (tf.kind === "all" || tf.kind === "last") return true
  if (!tf.startISO || !tf.endISO) return false
  const s = new Date(tf.startISO).getTime()
  const e = new Date(tf.endISO).getTime()
  return !Number.isNaN(s) && !Number.isNaN(e) && e > s
}

function formatRelativeFromNow(iso: string | null): string {
  if (!iso) return ""
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return "just now"
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function ResetMemberStatsModal({
  open, onClose, serverId, serverName, memberUserId, memberName, loading, onConfirm,
}: Props) {
  const [presetId, setPresetId] = useState("all")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [selections, setSelections] = useState<ResetSelections>({})
  const [reason, setReason] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [preview, setPreview] = useState<ResetPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const reqIdRef = useRef(0)

  const timeFrame: ResetTimeFrame = useMemo(() => {
    if (presetId === "custom") {
      const startISO = customStart ? new Date(customStart).toISOString() : ""
      const endISO = customEnd ? new Date(customEnd).toISOString() : ""
      return { kind: "custom", startISO, endISO }
    }
    return TIME_FRAME_PRESETS.find((p) => p.id === presetId)?.build() ?? { kind: "all" }
  }, [presetId, customStart, customEnd])

  const isAllTime = timeFrame.kind === "all"
  const tfValid = isTimeFrameValid(timeFrame)

  useEffect(() => {
    if (!open) {
      setPresetId("all")
      setCustomStart("")
      setCustomEnd("")
      setSelections({})
      setReason("")
      setConfirmText("")
      setPreview(null)
      setPreviewError(null)
      setPreviewLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!isAllTime) {
      setSelections((prev) => {
        if (!prev.seasonStats && !prev.coins) return prev
        return { ...prev, seasonStats: false, coins: false }
      })
    }
  }, [isAllTime])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const anySelected = Object.values(selections).some(Boolean)
    if (!anySelected || !tfValid) {
      setPreview(null)
      setPreviewError(null)
      setPreviewLoading(false)
      return
    }

    setPreviewLoading(true)
    setPreviewError(null)

    debounceRef.current = setTimeout(async () => {
      const myReqId = ++reqIdRef.current
      try {
        const res = await fetch(
          `/api/dashboard/servers/${serverId}/members/${memberUserId}/reset-stats?dryRun=true`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selections, timeFrame, reason: "preview-only" }),
          },
        )
        if (myReqId !== reqIdRef.current) return
        const data = await res.json()
        if (!res.ok) {
          setPreview(null)
          setPreviewError(data?.error || "Preview failed")
        } else {
          setPreview(data as ResetPreview)
        }
      } catch (e: any) {
        if (myReqId !== reqIdRef.current) return
        setPreview(null)
        setPreviewError(e?.message || "Preview failed")
      } finally {
        if (myReqId === reqIdRef.current) setPreviewLoading(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open, serverId, memberUserId, selections, timeFrame, tfValid])

  if (!open) return null

  const anySelected = Object.values(selections).some(Boolean)

  const previewHasAnyData = preview ? CATEGORIES.some((c) => {
    if (!selections[c.key]) return false
    if (c.key === "voiceSessions") return preview.counts.voiceSessions > 0 || preview.activeSession.willBeDeleted
    if (c.key === "textSessions") return preview.counts.textSessions > 0
    if (c.key === "voiceXp") return preview.counts.voiceXp > 0
    if (c.key === "textXp") return preview.counts.textXp > 0
    if (c.key === "pomodoroMilestones") return preview.counts.pomodoroMilestones > 0
    if (c.key === "seasonStats") return preview.counts.hasSeasonStats
    if (c.key === "coins") return preview.currentCoins > 0
    return false
  }) : false

  const reasonValid = reason.trim().length >= 3
  const confirmValid = confirmText.trim() === memberName.trim() && memberName.trim().length > 0
  const canSubmit =
    anySelected &&
    tfValid &&
    !previewLoading &&
    !!preview &&
    previewHasAnyData &&
    reasonValid &&
    confirmValid &&
    !loading

  const willClearBadge = !!(selections.voiceSessions || selections.voiceXp)
  const willClearVoiceRank = !!(selections.voiceSessions || selections.voiceXp)
  const willClearXpRank = !!(selections.voiceXp || selections.textXp)

  function toggle(key: keyof ResetSelections, value: boolean) {
    setSelections((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    onConfirm({ selections, timeFrame, reason: reason.trim() })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-red-500/[0.07] border border-red-500/30 rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <RotateCcw size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                Reset stats &mdash; {memberName} <span className="text-muted-foreground font-normal">in {serverName}</span>
              </h3>
              <p className="text-xs text-muted-foreground/70 mt-0.5">User ID: <span className="font-mono">{memberUserId}</span></p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200 mb-4">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              This permanently deletes the selected data for <strong>this member only</strong>, in <strong>this server only</strong>.
              It cannot be undone.
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Time frame</p>
            <div className="flex flex-wrap gap-2">
              {TIME_FRAME_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    presetId === p.id
                      ? "bg-red-500/20 border-red-500/40 text-red-200"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {presetId === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Start
                  <input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-2 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  End
                  <input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-2 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </label>
                {!tfValid && (customStart || customEnd) && (
                  <p className="sm:col-span-2 text-xs text-red-300">End must be after start.</p>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">What to reset</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const disabled = !cat.timeFramed && !isAllTime
                const checked = !!selections[cat.key] && !disabled
                const previewLine = preview ? cat.formatPreview(preview, preview.currentCoins) : null
                return (
                  <label
                    key={cat.key}
                    className={`flex items-start gap-2.5 p-2.5 border rounded-lg transition-colors cursor-pointer ${
                      disabled
                        ? "opacity-40 cursor-not-allowed bg-muted/30 border-border"
                        : checked
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-muted/30 border-border hover:border-red-500/30"
                    }`}
                    title={disabled ? "Only supports All time -- switch the time frame to All time to enable." : undefined}
                  >
                    <input
                      type="checkbox"
                      disabled={disabled || loading}
                      checked={checked}
                      onChange={(e) => toggle(cat.key, e.target.checked)}
                      className="mt-0.5 rounded border-border accent-red-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <span className="text-muted-foreground">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug">{cat.description}</p>
                      {selections[cat.key] && !disabled && (
                        <p className="text-[11px] text-red-300/80 mt-1 font-mono">
                          {previewLoading
                            ? "Loading..."
                            : previewLine ?? "--"}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Preview ({describeTimeFrame(timeFrame)})</p>
              {previewLoading && <Loader2 size={12} className="text-muted-foreground animate-spin" />}
            </div>
            {!anySelected ? (
              <p className="text-xs text-muted-foreground">Select at least one category above to see what will be deleted.</p>
            ) : previewError ? (
              <p className="text-xs text-red-300">{previewError}</p>
            ) : !preview ? (
              <p className="text-xs text-muted-foreground">{previewLoading ? "Calculating..." : "No preview yet."}</p>
            ) : (
              <div className="space-y-1">
                {!previewHasAnyData && (
                  <p className="text-xs text-muted-foreground">Nothing matches the current selection in this time frame.</p>
                )}
                {preview.activeSession.exists && selections.voiceSessions && (
                  <div
                    className={`flex items-start gap-2 text-xs p-2 rounded ${
                      preview.activeSession.willBeDeleted
                        ? "bg-red-500/10 text-red-200 border border-red-500/30"
                        : "bg-amber-500/10 text-amber-200 border border-amber-500/30"
                    }`}
                  >
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {preview.activeSession.willBeDeleted
                        ? `This member is currently in voice. Their active session (started ${formatRelativeFromNow(preview.activeSession.startedAt)}) will be deleted. The bot will start a fresh session if they stay in voice; ask them to leave and rejoin for a clean restart.`
                        : `Active session (started ${formatRelativeFromNow(preview.activeSession.startedAt)}) is OUTSIDE your time frame and will not be touched.`}
                    </span>
                  </div>
                )}
                {(willClearBadge || willClearVoiceRank || willClearXpRank) && (
                  <p className="text-[11px] text-muted-foreground/80">
                    Will also auto-clear:{" "}
                    {[
                      willClearBadge ? "last study badge" : null,
                      willClearVoiceRank ? "cached voice rank" : null,
                      willClearXpRank ? "cached XP rank" : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium block mb-1">Reason (required, logged for audit)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Member requested fresh start after fixing tracker issue"
              rows={2}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              maxLength={1000}
              disabled={loading}
            />
            {!reasonValid && reason.length > 0 && (
              <p className="text-[11px] text-red-300 mt-0.5">Reason must be at least 3 characters.</p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium block mb-1">
              Type <span className="font-mono text-foreground">{memberName}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={memberName}
              autoComplete="off"
              spellCheck={false}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-mono"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium text-foreground bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Resetting...
                </>
              ) : (
                <>
                  <RotateCcw size={14} /> Reset stats
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
