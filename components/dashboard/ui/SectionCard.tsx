// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Collapsible section card for grouping related settings
// ============================================================
import { ChevronDown } from "lucide-react"
import { useState, ReactNode, useId } from "react"

interface SectionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  badge?: string
  badgeVariant?: "primary" | "gray" | "amber" | "green"
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: support colored badge variants for setup progress indicators
const BADGE_STYLES: Record<string, string> = {
  primary: "bg-primary/20 text-primary",
  gray: "bg-gray-500/15 text-gray-400",
  amber: "bg-amber-500/15 text-amber-400",
  green: "bg-emerald-500/15 text-emerald-400",
}
// --- END AI-MODIFIED ---

export default function SectionCard({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  badge,
  badgeVariant = "primary",
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- aria-expanded + aria-controls on the disclosure
  // button, focus-visible ring, smoother bg transition on hover/active border
  const panelId = useId()

  return (
    <div className={`bg-card/50 border rounded-xl transition-colors ${open ? "border-border" : "border-border/60"}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${open ? "rounded-t-xl" : "rounded-xl"}`}
      >
        {icon && <span className="text-muted-foreground flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[badgeVariant] || BADGE_STYLES.primary}`}>
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{description}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={panelId} className="px-5 pb-5 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  )
  // --- END AI-MODIFIED ---
}
