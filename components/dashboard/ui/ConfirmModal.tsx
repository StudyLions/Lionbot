// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Confirmation modal replacing browser confirm() dialogs
// ============================================================
import { AlertTriangle, X } from "lucide-react"
import { useEffect, useRef } from "react"

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
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

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
    info: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", btn: "bg-indigo-600 hover:bg-indigo-700", icon: "text-indigo-400" },
  }[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className={`relative w-full max-w-md ${colors.bg} border ${colors.border} rounded-xl shadow-2xl`}>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
              <AlertTriangle size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white ${colors.btn} rounded-lg transition-colors disabled:opacity-50`}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
