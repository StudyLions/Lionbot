// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Toast notification system using react-hot-toast
// ============================================================
import { Toaster, toast } from "react-hot-toast"

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
