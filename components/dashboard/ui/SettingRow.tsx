// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Standardized setting row with label, description, tooltip, and input
// ============================================================
import Tooltip from "./Tooltip"
import { ReactNode } from "react"

interface SettingRowProps {
  label: string
  description?: string
  tooltip?: string
  children: ReactNode
  htmlFor?: string
  defaultBadge?: string
}

export default function SettingRow({
  label,
  description,
  tooltip,
  children,
  htmlFor,
  defaultBadge,
}: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border/50 last:border-b-0 sm:flex-col sm:gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <label htmlFor={htmlFor} className="text-sm font-medium text-foreground/90 cursor-pointer">
            {label}
          </label>
          {tooltip && <Tooltip content={tooltip} />}
          {defaultBadge && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-mono">
              Default: {defaultBadge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-md">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 sm:w-full">{children}</div>
    </div>
  )
}
