// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-20
// Purpose: Admin-only modal for the new "Clear All Active
//          Blacklists" bulk action surfaced on the Video Channels
//          and Screen Channels dashboard pages.
//
//          Pardons every active STUDY_BAN and/or SCREEN_BAN
//          ticket in the guild AND removes the corresponding
//          blacklist role from each affected member via the
//          Discord REST API. Designed for support ticket #0037
//          ("Study Space - How to completely remove blacklists?")
//          where the only way to undo a server's accumulated
//          blacklists used to be one-by-one in the moderation
//          page.
// ============================================================
import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Loader2, ShieldOff, Video, MonitorPlay, X, Info } from "lucide-react"

export type BlacklistType = "STUDY_BAN" | "SCREEN_BAN"

export interface ClearAllResult {
  success: boolean
  perType: Array<{
    type: BlacklistType
    ticketsPardoned: number
    rolesRemoved: number
    rolesAlreadyMissing: number
    rolesFailed: number
    uniqueMembers: number
    roleConfigured: boolean
  }>
  totalUniqueMembers: number
  failures: Array<{ type: BlacklistType; userId: string; reason: string }>
  failuresTruncated: boolean
}

interface ActiveCounts {
  STUDY_BAN: number
  SCREEN_BAN: number
}

interface Props {
  open: boolean
  onClose: () => void
  serverId: string
  serverName: string
  defaultType: BlacklistType
  activeCounts: ActiveCounts
  onComplete?: (result: ClearAllResult) => void
}

const TYPE_LABELS: Record<BlacklistType, string> = {
  STUDY_BAN: "Video / Study blacklists",
  SCREEN_BAN: "Screen-share blacklists",
}

const TYPE_ICON: Record<BlacklistType, React.ReactNode> = {
  STUDY_BAN: <Video size={16} />,
  SCREEN_BAN: <MonitorPlay size={16} />,
}

export default function ClearBlacklistsModal({
  open,
  onClose,
  serverId,
  serverName,
  defaultType,
  activeCounts,
  onComplete,
}: Props) {
  const [selected, setSelected] = useState<Set<BlacklistType>>(new Set([defaultType]))
  const [reason, setReason] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ClearAllResult | null>(null)

  useEffect(() => {
    if (open) {
      setSelected(new Set([defaultType]))
      setReason("")
      setConfirmText("")
      setError(null)
      setResult(null)
      setSubmitting(false)
    }
  }, [open, defaultType])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose()
    }
    if (open) document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onClose, submitting])

  const totalSelectedActive = useMemo(() => {
    let n = 0
    for (const t of Array.from(selected)) n += activeCounts[t] ?? 0
    return n
  }, [selected, activeCounts])

  const reasonOk = reason.trim().length >= 3
  const confirmOk = confirmText.trim().toUpperCase() === "CLEAR"
  const canSubmit =
    !submitting && !result && selected.size > 0 && totalSelectedActive > 0 && reasonOk && confirmOk

  function toggleType(t: BlacklistType) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(t)) {
        if (next.size > 1) next.delete(t)
      } else {
        next.add(t)
      }
      return next
    })
  }

  async function handleConfirm() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/servers/${serverId}/blacklists/clear-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          types: Array.from(selected),
          reason: reason.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to clear blacklists")
      }
      setResult(data as ClearAllResult)
      onComplete?.(data as ClearAllResult)
    } catch (err: any) {
      setError(err?.message || "Failed to clear blacklists")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative w-full max-w-lg bg-card border border-red-500/30 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldOff size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Clear active blacklists</h3>
              <p className="text-xs text-muted-foreground">
                in <span className="text-foreground">{serverName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result && (
            <>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  This will <span className="font-semibold text-amber-100">pardon every active blacklist record</span>{" "}
                  for the selected types, and remove the configured blacklist role from each affected member in
                  Discord. The pardoned records stay visible in moderation history.
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Which blacklists?
                </div>
                <div className="space-y-2">
                  {(["STUDY_BAN", "SCREEN_BAN"] as BlacklistType[]).map((t) => {
                    const checked = selected.has(t)
                    const count = activeCounts[t] ?? 0
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleType(t)}
                        disabled={count === 0 && !checked}
                        className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors text-left ${
                          checked
                            ? "border-red-500/50 bg-red-500/5"
                            : "border-border/60 bg-background hover:border-border"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              checked ? "bg-red-500 border-red-500" : "border-border"
                            }`}
                          >
                            {checked && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="text-muted-foreground">{TYPE_ICON[t]}</span>
                          <span className="text-sm text-foreground truncate">{TYPE_LABELS[t]}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                          {count} active
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Reason (visible in moderation history)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Removing study-ban role per server policy change"
                  rows={2}
                  maxLength={500}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500/40 resize-none"
                />
                <div className="text-[10px] text-muted-foreground mt-1">
                  {reason.trim().length}/500 — minimum 3 characters
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  Type <span className="font-mono text-red-400">CLEAR</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CLEAR"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}
            </>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-200">
                Done. {result.totalUniqueMembers} member(s) processed across the selected types.
              </div>
              <div className="space-y-2">
                {result.perType.map((row) => (
                  <div
                    key={row.type}
                    className="rounded-lg border border-border/60 bg-background/40 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <span className="text-muted-foreground">{TYPE_ICON[row.type]}</span>
                      {TYPE_LABELS[row.type]}
                    </div>
                    <div className="text-muted-foreground">
                      {row.ticketsPardoned} record(s) pardoned
                      {" • "}
                      {row.rolesRemoved} role(s) removed
                      {row.rolesAlreadyMissing > 0 && ` • ${row.rolesAlreadyMissing} already gone`}
                      {row.rolesFailed > 0 && (
                        <span className="text-amber-300"> • {row.rolesFailed} failed</span>
                      )}
                    </div>
                    {!row.roleConfigured && row.uniqueMembers > 0 && (
                      <div className="text-amber-300/80 flex items-center gap-1.5">
                        <Info size={12} />
                        No blacklist role configured for this type, so no Discord roles needed removing.
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {result.failures.length > 0 && (
                <details className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                  <summary className="cursor-pointer text-amber-300 font-medium">
                    {result.failures.length} role removal(s) failed — click to see why
                  </summary>
                  <ul className="mt-2 space-y-1 text-amber-200/80">
                    {result.failures.map((f, i) => (
                      <li key={i}>
                        <span className="font-mono">{f.userId}</span> ({f.type}): {f.reason}
                      </li>
                    ))}
                    {result.failuresTruncated && <li>(more failures truncated)</li>}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border/60 px-5 py-4 flex justify-end gap-3">
          {!result ? (
            <>
              <button
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting
                  ? "Clearing…"
                  : totalSelectedActive === 0
                    ? "No active blacklists"
                    : `Clear ${totalSelectedActive} blacklist${totalSelectedActive === 1 ? "" : "s"}`}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
