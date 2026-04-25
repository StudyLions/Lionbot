// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Action modals for member management with LionBot-specific
//          terminology and impact statements to avoid Discord confusion
// ============================================================
// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- give every member-action modal the same baseline
// dialog a11y as ConfirmModal:
//   - role="dialog" + aria-modal="true" + aria-labelledby
//   - Esc closes, Tab cycles focus inside the modal (focus trap)
//   - body scroll lock while open (prevents page scroll behind backdrop)
//   - entrance fade + scale animation (motion-safe; reduced-motion users get
//     an instant appearance)
//   - close X gets aria-label, focus-visible ring, type="button"
//   - backdrop gets aria-hidden so screen readers don't announce it
import { useEffect, useId, useRef, useState } from "react"
import {
  AlertTriangle, FileText, Ban, Coins, X, Check, XCircle, Users, RotateCcw,
} from "lucide-react"
// --- END AI-MODIFIED ---

interface ModalBaseProps {
  open: boolean
  onClose: () => void
  loading: boolean
}

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- ModalShell now matches ConfirmModal's a11y
// implementation (see top-of-file comment for the full list of additions).
function ModalShell({
  open, onClose, children, title, icon, variant,
}: ModalBaseProps & { children: React.ReactNode; title: string; icon: React.ReactNode; variant: "danger" | "warning" | "info" }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleEsc)
    document.addEventListener("keydown", handleTab)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.removeEventListener("keydown", handleTab)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  const colors = {
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400" },
    info: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", icon: "text-indigo-400" },
  }[variant]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md ${colors.bg} border ${colors.border} rounded-xl shadow-2xl motion-safe:animate-scale-in`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} />
        </button>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`} aria-hidden="true">{icon}</div>
            <h3 id={titleId} className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---

function ImpactList({ items }: { items: Array<{ text: string; positive: boolean }> }) {
  return (
    <div className="space-y-1.5 mb-4 p-3 bg-muted/30 rounded-lg">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">What happens</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          {item.positive ? (
            <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle size={14} className="text-red-400/50 flex-shrink-0 mt-0.5" />
          )}
          <span className={item.positive ? "text-foreground/80" : "text-muted-foreground/60"}>{item.text}</span>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// WARN MODAL
// ============================================================
interface WarnModalProps extends ModalBaseProps {
  memberName: string
  onConfirm: (reason: string) => void
}

export function WarnModal({ open, onClose, loading, memberName, onConfirm }: WarnModalProps) {
  const [reason, setReason] = useState("")
  const handleSubmit = () => { if (reason.trim()) { onConfirm(reason.trim()); setReason("") } }

  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title={`Add Bot Warning -- ${memberName}`} icon={<AlertTriangle size={20} />} variant="warning">
      <p className="text-sm text-muted-foreground mb-3">A bot warning will be added to this member's LionBot record. The member MAY receive a DM notification (depends on their DM settings). This does NOT affect their Discord account.</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for warning..."
        rows={3}
        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none mb-4"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={loading || !reason.trim()} className="px-4 py-2 text-sm font-medium text-foreground bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Adding..." : "Add Warning"}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// NOTE MODAL
// ============================================================
interface NoteModalProps extends ModalBaseProps {
  memberName: string
  onConfirm: (content: string) => void
}

export function NoteModal({ open, onClose, loading, memberName, onConfirm }: NoteModalProps) {
  const [content, setContent] = useState("")
  const handleSubmit = () => { if (content.trim()) { onConfirm(content.trim()); setContent("") } }

  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title={`Add Admin Note -- ${memberName}`} icon={<FileText size={20} />} variant="info">
      <p className="text-sm text-muted-foreground mb-3">A private admin note will be added. The member will <strong className="text-foreground">NOT</strong> be notified.</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content..."
        rows={3}
        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={loading || !content.trim()} className="px-4 py-2 text-sm font-medium text-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Adding..." : "Add Note"}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// RESTRICT MODAL
// ============================================================
interface RestrictModalProps extends ModalBaseProps {
  memberName: string
  priorRestrictions: number
  nextEscalationDuration: string
  onConfirm: (durationHours: number, reason: string) => void
}

const durationPresets = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
]

export function RestrictModal({ open, onClose, loading, memberName, priorRestrictions, nextEscalationDuration, onConfirm }: RestrictModalProps) {
  const [hours, setHours] = useState<number>(24)
  const [customHours, setCustomHours] = useState("")
  const [useCustom, setUseCustom] = useState(false)
  const [reason, setReason] = useState("")

  const effectiveHours = useCustom ? parseFloat(customHours) || 0 : hours

  const handleSubmit = () => {
    if (reason.trim() && effectiveHours > 0) {
      onConfirm(effectiveHours, reason.trim())
      setReason("")
      setHours(24)
      setCustomHours("")
      setUseCustom(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title={`Study Restriction -- ${memberName}`} icon={<Ban size={20} />} variant="danger">
      {priorRestrictions > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 mb-3">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{priorRestrictions} prior restriction{priorRestrictions !== 1 ? "s" : ""}. Auto-escalation would be: <strong>{nextEscalationDuration}</strong></span>
        </div>
      )}

      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium mb-2">Duration</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {durationPresets.map((p) => (
          <button
            key={p.label}
            onClick={() => { setHours(p.hours); setUseCustom(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              !useCustom && hours === p.hours
                ? "bg-red-500/20 border-red-500/40 text-red-300"
                : "bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setUseCustom(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            useCustom ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-muted border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Custom
        </button>
      </div>
      {useCustom && (
        <input
          type="number"
          value={customHours}
          onChange={(e) => setCustomHours(e.target.value)}
          placeholder="Hours..."
          min="0.5"
          step="0.5"
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-3"
        />
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for restriction..."
        rows={2}
        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-3"
      />

      <ImpactList items={[
        { text: "Member cannot earn coins in voice channels", positive: true },
        { text: "Member cannot gain XP in voice channels", positive: true },
        { text: "A record is added to their bot history", positive: true },
        { text: "Member is NOT removed from the server", positive: false },
        { text: "Member can still use text channels", positive: false },
      ]} />

      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={loading || !reason.trim() || effectiveHours <= 0} className="px-4 py-2 text-sm font-medium text-foreground bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Applying..." : "Apply Restriction"}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// COIN ADJUST MODAL
// ============================================================
interface CoinAdjustModalProps extends ModalBaseProps {
  memberName: string
  currentBalance: number
  onConfirm: (action: "add" | "set" | "reset", amount?: number) => void
}

export function CoinAdjustModal({ open, onClose, loading, memberName, currentBalance, onConfirm }: CoinAdjustModalProps) {
  const [action, setAction] = useState<"add" | "set" | "reset">("add")
  const [amount, setAmount] = useState("")

  const numAmount = parseFloat(amount) || 0
  const newBalance = action === "reset" ? 0 : action === "set" ? numAmount : currentBalance + numAmount

  const handleSubmit = () => {
    onConfirm(action, action === "reset" ? undefined : numAmount)
    setAmount("")
    setAction("add")
  }

  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title={`Adjust Coins -- ${memberName}`} icon={<Coins size={20} />} variant="warning">
      <div className="flex gap-2 mb-4">
        {(["add", "set", "reset"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
              action === a ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {a === "reset" ? "Reset to 0" : a}
          </button>
        ))}
      </div>

      {action !== "reset" && (
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={action === "add" ? "Amount to add (use negative to subtract)..." : "New balance..."}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3"
        />
      )}

      <p className="text-[10px] text-muted-foreground/60 mb-2">This change will be logged in the transaction history with a full audit trail.</p>
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4 text-sm">
        <span className="text-muted-foreground">Balance change:</span>
        <span>
          <span className="text-foreground font-mono">{currentBalance.toLocaleString()}</span>
          <span className="text-muted-foreground mx-2">→</span>
          <span className="text-warning font-mono font-bold">{Math.max(0, newBalance).toLocaleString()}</span>
        </span>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={loading || (action !== "reset" && numAmount === 0)}
          className="px-4 py-2 text-sm font-medium text-foreground bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Adjusting..." : "Adjust Coins"}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// BULK ACTION MODAL
// ============================================================
interface BulkActionModalProps extends ModalBaseProps {
  selectedCount: number
  operation: "coins" | "warn"
  onConfirm: (data: { amount?: number; reason?: string }) => void
}

export function BulkActionModal({ open, onClose, loading, selectedCount, operation, onConfirm }: BulkActionModalProps) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    onConfirm({
      amount: operation === "coins" ? parseFloat(amount) || 0 : undefined,
      reason: reason.trim() || undefined,
    })
    setAmount("")
    setReason("")
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      loading={loading}
      title={operation === "coins" ? "Bulk Coin Adjustment" : "Bulk Warning"}
      icon={operation === "coins" ? <Coins size={20} /> : <AlertTriangle size={20} />}
      variant={operation === "coins" ? "warning" : "danger"}
    >
      <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 mb-4">
        <Users size={14} className="flex-shrink-0" />
        <span>This will affect <strong>{selectedCount}</strong> member{selectedCount !== 1 ? "s" : ""}</span>
      </div>

      {operation === "coins" && (
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to add (use negative to subtract)..."
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3"
        />
      )}

      {operation === "warn" && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for warning (required)..."
          rows={3}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-3"
        />
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={loading || (operation === "coins" && !amount) || (operation === "warn" && !reason.trim())}
          className={`px-4 py-2 text-sm font-medium text-foreground rounded-lg transition-colors disabled:opacity-50 ${
            operation === "coins" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Processing..." : `Apply to ${selectedCount} members`}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// RESOLVE MODAL
// ============================================================
interface ResolveModalProps extends ModalBaseProps {
  ticketCount: number
  onConfirm: (reason: string) => void
}

export function ResolveModal({ open, onClose, loading, ticketCount, onConfirm }: ResolveModalProps) {
  const [reason, setReason] = useState("")
  const handleSubmit = () => { onConfirm(reason.trim() || "Resolved via dashboard"); setReason("") }

  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title={`Resolve ${ticketCount} Record${ticketCount !== 1 ? "s" : ""}`} icon={<Check size={20} />} variant="info">
      <p className="text-sm text-muted-foreground mb-3">Mark the selected record{ticketCount !== 1 ? "s" : ""} as resolved. For study restrictions, this will end the restriction and allow the member to earn coins/XP again.</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Resolution reason (optional)..."
        rows={2}
        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-medium text-foreground bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Resolving..." : "Resolve"}
        </button>
      </div>
    </ModalShell>
  )
}

// ============================================================
// REFUND MODAL
// ============================================================
interface RefundModalProps extends ModalBaseProps {
  transactionAmount: number
  onConfirm: () => void
}

export function RefundModal({ open, onClose, loading, transactionAmount, onConfirm }: RefundModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} loading={loading} title="Refund Transaction" icon={<RotateCcw size={20} />} variant="warning">
      <p className="text-sm text-muted-foreground mb-3">
        This will reverse the transaction of <strong className="text-foreground">{transactionAmount} coins</strong> and adjust the member's balance accordingly. A refund record will be created in the transaction history.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-foreground bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Refunding..." : "Confirm Refund"}
        </button>
      </div>
    </ModalShell>
  )
}
