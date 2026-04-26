// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Consistent empty state with icon, message, and CTA
// ============================================================
import { Inbox } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Allow tighter empty states inside cards/panels
  compact?: boolean
  // --- END AI-MODIFIED ---
}

export default function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- subtle icon halo, focus-visible ring on action,
  // type="button" to prevent accidental form submits, compact variant
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${compact ? "py-8" : "py-16"}`}
      role="status"
    >
      <div className="relative mb-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-primary/5 blur-xl scale-150"
        />
        <div className="text-muted-foreground/70">
          {icon || <Inbox size={48} strokeWidth={1.25} />}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {action.label}
        </button>
      )}
    </div>
  )
  // --- END AI-MODIFIED ---
}
