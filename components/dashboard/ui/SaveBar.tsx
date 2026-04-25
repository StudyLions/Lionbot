// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Sticky save/reset bar for settings pages
// ============================================================
import { Save, RotateCcw, Loader2 } from "lucide-react"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Play 8-bit sound on save and undo/reset actions
import { getUISoundEngine } from "@/lib/uiSoundEngine"
// --- END AI-MODIFIED ---

interface SaveBarProps {
  show: boolean
  onSave: () => void
  onReset: () => void
  saving?: boolean
  label?: string
}

export default function SaveBar({ show, onSave, onReset, saving = false, label }: SaveBarProps) {
  if (!show) return null

  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- safe-area inset for iOS, theme-aware primary border
  // (was hardcoded indigo), motion-safe slide-up entrance, focus-visible rings,
  // proper Loader2 spinner instead of just disabled state
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 min-[1024px]:left-56 motion-safe:animate-slide-up"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-4 bg-card border border-primary/30 rounded-xl px-4 sm:px-5 py-3 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground text-center sm:text-left flex items-center gap-2">
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden="true" />
            {label || "You have unsaved changes"}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => { getUISoundEngine().play('undo'); onReset() }}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              type="button"
              onClick={() => { getUISoundEngine().play('confirm'); onSave() }}
              disabled={saving}
              aria-busy={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  // --- END AI-MODIFIED ---
}
