// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Sticky save/reset bar for settings pages
// ============================================================
import { Save, RotateCcw } from "lucide-react"
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 min-[1024px]:left-56">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {/* --- AI-MODIFIED (2026-03-21) --- */}
        {/* Purpose: Stack label and buttons on mobile for better fit */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-4 bg-card border border-indigo-500/30 rounded-xl px-4 sm:px-5 py-3 shadow-xl shadow-black/30">
          <span className="text-sm text-muted-foreground text-center sm:text-left">
            {label || "You have unsaved changes"}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { getUISoundEngine().play('undo'); onReset() }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={() => { getUISoundEngine().play('confirm'); onSave() }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {/* --- END AI-MODIFIED --- */}
      </div>
    </div>
  )
}
