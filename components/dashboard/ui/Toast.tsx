// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Toast notification system using react-hot-toast
// ============================================================
import { Toaster, toast as rawToast } from "react-hot-toast"
import { Info } from "lucide-react"
import React from "react"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Play 8-bit sounds on toast success/error notifications
import { getUISoundEngine } from "@/lib/uiSoundEngine"

type ToastMsg = Parameters<typeof rawToast>[0]
type ToastOpts = Parameters<typeof rawToast>[1]

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Premium polish -- add toast.info variant (lucide Info icon, blue accent)
// for non-success/non-error notifications instead of bare toast() calls
function infoToast(msg: ToastMsg, opts?: ToastOpts) {
  return rawToast(msg, {
    ...opts,
    icon: <Info size={18} className="text-blue-400" />,
  })
}
// --- END AI-MODIFIED ---

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
    // --- AI-MODIFIED (2026-04-25) ---
    // Purpose: Info variant for neutral notifications
    info: infoToast,
    // --- END AI-MODIFIED ---
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
      // --- AI-MODIFIED (2026-04-25) ---
      // Purpose: Premium polish -- safe-area inset for iOS notched devices,
      // slightly elevated default shadow to feel less flat
      containerStyle={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
      // --- END AI-MODIFIED ---
      toastOptions={{
        duration: 4000,
        // --- AI-MODIFIED (2026-03-24) ---
        // Purpose: Replace hex colors with CSS variable references for theming
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          // --- AI-MODIFIED (2026-04-25) ---
          // Purpose: Premium polish -- subtle shadow + slightly tighter padding
          boxShadow: "0 8px 24px -8px hsl(var(--background) / 0.6), 0 2px 6px -2px hsl(0 0% 0% / 0.2)",
          padding: "10px 14px",
          // --- END AI-MODIFIED ---
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "hsl(var(--card))" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "hsl(var(--card))" },
          duration: 6000,
        },
        // --- END AI-MODIFIED ---
      }}
    />
  )
}

export { toast }
