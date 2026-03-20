// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Toast notification system using react-hot-toast
// ============================================================
import { Toaster, toast as rawToast } from "react-hot-toast"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Play 8-bit sounds on toast success/error notifications
import { getUISoundEngine } from "@/lib/uiSoundEngine"

type ToastMsg = Parameters<typeof rawToast>[0]
type ToastOpts = Parameters<typeof rawToast>[1]

const toast = Object.assign(
  (msg: ToastMsg, opts?: ToastOpts) => rawToast(msg, opts),
  {
    success: (msg: ToastMsg, opts?: ToastOpts) => {
      getUISoundEngine().play('success')
      return rawToast.success(msg, opts)
    },
    error: (msg: ToastMsg, opts?: ToastOpts) => {
      getUISoundEngine().play('error')
      return rawToast.error(msg, opts)
    },
    loading: rawToast.loading,
    dismiss: rawToast.dismiss,
    remove: rawToast.remove,
    custom: rawToast.custom,
    promise: rawToast.promise,
  },
)
// --- END AI-MODIFIED ---

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1f2937",
          color: "#f3f4f6",
          border: "1px solid #374151",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#1f2937" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#1f2937" },
          duration: 6000,
        },
      }}
    />
  )
}

export { toast }
