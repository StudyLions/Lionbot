// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Confirmation modal replacing browser confirm() dialogs
// ============================================================
import { AlertTriangle, X, Loader2 } from "lucide-react"
import { useEffect, useRef, useId } from "react"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Play 8-bit sounds on modal open, confirm, and cancel
import { getUISoundEngine } from "@/lib/uiSoundEngine"
// --- END AI-MODIFIED ---

interface ConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "info"
  loading?: boolean
  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: allow custom body content for preset selection dialogs
  customContent?: React.ReactNode
  // --- END AI-MODIFIED ---
}

export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  customContent,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- ids for aria-labelledby/describedby, body scroll
  // lock while open, focus trap inside dialog, entrance animation, close X aria-label,
  // Loader2 spinner, role/aria-modal semantics
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
      getUISoundEngine().play(variant === 'danger' ? 'warning' : 'open')
    }
  }, [open, variant])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
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
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.addEventListener("keydown", handleTab)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleEsc)
        document.removeEventListener("keydown", handleTab)
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open, onCancel])

  if (!open) return null

  const colors = {
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", btn: "bg-red-600 hover:bg-red-700 text-white", icon: "text-red-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", btn: "bg-amber-600 hover:bg-amber-700 text-white", icon: "text-amber-400" },
    info: { bg: "bg-primary/10", border: "border-primary/30", btn: "bg-primary hover:bg-primary/90 text-primary-foreground", icon: "text-primary" },
  }[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`relative w-full max-w-md ${colors.bg} border ${colors.border} rounded-xl shadow-2xl motion-safe:animate-scale-in`}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
              <AlertTriangle size={22} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 id={titleId} className="text-base font-semibold text-foreground mb-1">{title}</h3>
              <p id={descId} className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>
          {customContent}
          {!customContent && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => { getUISoundEngine().play('close'); onCancel() }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {cancelLabel}
              </button>
              {confirmLabel && (
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={() => { getUISoundEngine().play(variant === 'danger' ? 'delete' : 'confirm'); onConfirm() }}
                  disabled={loading}
                  aria-busy={loading}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${colors.btn} rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60`}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Processing..." : confirmLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
  // --- END AI-MODIFIED ---
}
