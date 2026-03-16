// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Modal dialog shown when leaving the room editor
//          with unsaved layout changes
// ============================================================

'use client'

interface UnsavedModalProps {
  open: boolean
  onSaveAndLeave: () => void
  onLeaveWithout: () => void
  onStay: () => void
  isSaving: boolean
}

export default function UnsavedModal({
  open,
  onSaveAndLeave,
  onLeaveWithout,
  onStay,
  isSaving,
}: UnsavedModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-pixel">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onStay}
      />

      {/* Modal */}
      <div
        className="relative bg-[#0c1020] border-2 border-[#3a4a6c] rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl"
        style={{
          boxShadow: '6px 6px 0 rgba(0,0,0,0.6), inset 1px 1px 0 rgba(58,74,108,0.3)',
        }}
      >
        {/* Pixel corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500" />

        {/* Icon */}
        <div className="text-center text-3xl mb-3">⚠️</div>

        {/* Title */}
        <h3 className="text-base text-yellow-300 text-center mb-2">
          Unsaved Changes
        </h3>

        {/* Message */}
        <p className="text-sm text-[#8b9dc3] text-center mb-5 leading-relaxed">
          You have unsaved changes to your room layout. What would you like to do?
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="w-full py-2 px-3 text-sm rounded border-2 border-green-500 bg-green-500/10 text-green-300 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="animate-spin">⟳</span> Saving...
              </span>
            ) : (
              '💾 Save & Leave'
            )}
          </button>

          <button
            onClick={onLeaveWithout}
            disabled={isSaving}
            className="w-full py-2 px-3 text-sm rounded border-2 border-red-500/50 bg-red-500/5 text-red-400 hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            🚪 Leave Without Saving
          </button>

          <button
            onClick={onStay}
            disabled={isSaving}
            className="w-full py-2 px-3 text-sm rounded border border-[#3a4a6c] bg-[#111828] text-[#e2e8f0] hover:border-[#5a6a8c] hover:bg-[#1a2340] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ✏️ Stay & Keep Editing
          </button>
        </div>
      </div>
    </div>
  )
}
