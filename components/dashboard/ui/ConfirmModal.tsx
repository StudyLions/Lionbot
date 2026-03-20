// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Confirmation modal replacing browser confirm() dialogs
// ============================================================
import { AlertTriangle, X } from "lucide-react"
import { useEffect, useRef } from "react"
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

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Play warning sound when modal opens
  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
      getUISoundEngine().play(variant === 'danger' ? 'warning' : 'open')
    }
  }, [open, variant])
  // --- END AI-MODIFIED ---

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    if (open) document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onCancel])

  if (!open) return null

  const colors = {
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", btn: "bg-red-600 hover:bg-red-700", icon: "text-red-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", btn: "bg-amber-600 hover:bg-amber-700", icon: "text-amber-400" },
    info: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", btn: "bg-primary hover:bg-primary/90", icon: "text-primary" },
  }[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className={`relative w-full max-w-md ${colors.bg} border ${colors.border} rounded-xl shadow-2xl`}>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
              <AlertTriangle size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>
          {/* --- AI-MODIFIED (2026-03-14) --- */}
          {customContent}
          {/* --- END AI-MODIFIED --- */}
          {!customContent && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => { getUISoundEngine().play('close'); onCancel() }}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            {confirmLabel && (
            <button
              ref={confirmRef}
              onClick={() => { getUISoundEngine().play(variant === 'danger' ? 'delete' : 'confirm'); onConfirm() }}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-foreground ${colors.btn} rounded-lg transition-colors disabled:opacity-50`}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
