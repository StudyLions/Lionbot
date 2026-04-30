// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Sticky footer button row used by every Setup Checklist task drawer.
//          Standardizes the Skip / Save+Close action layout so admins build
//          muscle memory across drawers, and so the button heights and
//          spacing meet the 44x44 touch target rule everywhere.
//
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Three-state primary button (was two-state). Fixes the "I had to
//          make a fake change to mark this task done" bug where admins who
//          were happy with the existing settings couldn't complete the task
//          without dirtying the form first.
//
//          State transitions of the primary button:
//
//            dirty=true                  -> "Save and close"
//                                         (calls onSave; existing behavior)
//            dirty=false && hasValue     -> "Looks good \u2014 mark as done"
//                                         (calls onComplete + onClose)
//            dirty=false && !hasValue    -> "Close"
//                                         (calls onClose only; no completion
//                                         because there's nothing to confirm)
// --- END AI-MODIFIED ---
// ============================================================
import { Loader2 } from "lucide-react"

interface Props {
  onSkip?: () => void
  onSave?: () => void
  onClose: () => void
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: New props that unlock the three-state primary button. onComplete
  // marks the task done WITHOUT a network write (used when the admin is
  // happy with the existing/default settings and just wants to confirm).
  // hasValue is the per-task signal for whether there's anything meaningful
  // to confirm (e.g. Welcome has a greeting_channel set, or Rewards which
  // always has sensible defaults so this is always true).
  onComplete?: () => void
  hasValue?: boolean
  // --- END AI-MODIFIED ---
  saving?: boolean
  dirty?: boolean
  // Override the primary action label (default: "Save and close" / "Looks good \u2014 mark as done" / "Close")
  primaryLabel?: string
  // Hide the skip button (used on already-done tasks)
  hideSkip?: boolean
}

export default function DrawerFooter({
  onSkip,
  onSave,
  onClose,
  // --- AI-MODIFIED (2026-04-30) ---
  onComplete,
  hasValue = false,
  // --- END AI-MODIFIED ---
  saving = false,
  dirty = false,
  primaryLabel,
  hideSkip = false,
}: Props) {
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Pick the label + click handler based on the three states.
  // The primaryLabel override still wins so callers can force a specific
  // word (kept for the existing "Close" already-done-state usage pattern,
  // which now passes primaryLabel="Close" explicitly).
  const computedLabel =
    primaryLabel ||
    (dirty
      ? "Save and close"
      : hasValue && onComplete
        ? "Looks good \u2014 mark as done"
        : "Close")

  function handlePrimary() {
    if (dirty && onSave) {
      onSave()
    } else if (!dirty && hasValue && onComplete) {
      onComplete()
      onClose()
    } else {
      onClose()
    }
  }
  // --- END AI-MODIFIED ---

  return (
    <div className="flex items-center justify-between gap-3">
      {!hideSkip && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          disabled={saving}
          className="min-h-[44px] px-3 text-sm text-muted-foreground hover:text-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          Skip for now
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={handlePrimary}
        disabled={saving}
        // Primary CTA: 44px tall, full saturation primary, prominent.
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving\u2026" : computedLabel}
      </button>
    </div>
  )
}
