// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Sticky save/reset bar for settings pages
// ============================================================
import { Save, RotateCcw } from "lucide-react"

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
        <div className="flex items-center justify-between gap-4 bg-gray-800 border border-indigo-500/30 rounded-xl px-5 py-3 shadow-xl shadow-black/30">
          <span className="text-sm text-gray-300">
            {label || "You have unsaved changes"}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
