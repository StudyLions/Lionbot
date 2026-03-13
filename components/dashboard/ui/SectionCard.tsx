// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Collapsible section card for grouping related settings
// ============================================================
import { ChevronDown } from "lucide-react"
import { useState, ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  badge?: string
}

export default function SectionCard({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  badge,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/30 transition-colors"
      >
        {icon && <span className="text-muted-foreground flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
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
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/50">{children}</div>}
    </div>
  )
}
