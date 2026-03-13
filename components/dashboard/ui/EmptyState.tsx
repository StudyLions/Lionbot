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
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-muted-foreground mb-4">
        {icon || <Inbox size={48} strokeWidth={1} />}
      </div>
      <h3 className="text-base font-semibold text-muted-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
