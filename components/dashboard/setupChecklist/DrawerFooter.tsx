// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Sticky footer button row used by every Setup Checklist task drawer.
//          Standardizes the Skip / Save+Close action layout so admins build
//          muscle memory across drawers, and so the button heights and
//          spacing meet the 44x44 touch target rule everywhere.
// ============================================================
import { Loader2 } from "lucide-react"

interface Props {
  onSkip?: () => void
  onSave?: () => void
  onClose: () => void
  saving?: boolean
  dirty?: boolean
  // Override the primary action label (default: "Save and close" or "Close")
  primaryLabel?: string
  // Hide the skip button (used on already-done tasks)
  hideSkip?: boolean
}

export default function DrawerFooter({
  onSkip,
  onSave,
  onClose,
  saving = false,
  dirty = false,
  primaryLabel,
  hideSkip = false,
}: Props) {
  const label = primaryLabel || (dirty ? "Save and close" : "Close")

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
        onClick={() => {
          if (dirty && onSave) onSave()
          else onClose()
        }}
        disabled={saving}
        // Primary CTA: 44px tall, full saturation primary, prominent.
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving\u2026" : label}
      </button>
    </div>
  )
}
