// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Standardized setting row with label, description, tooltip, and input
// ============================================================
import Tooltip from "./Tooltip"
import { ReactNode } from "react"
import { RotateCcw } from "lucide-react"

interface SettingRowProps {
  label: string
  description?: string
  tooltip?: string
  children: ReactNode
  htmlFor?: string
  defaultBadge?: string
  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: add modified indicator, reset button, and impact context text
  isModified?: boolean
  onReset?: () => void
  impactText?: string
  // --- END AI-MODIFIED ---
}

export default function SettingRow({
  label,
  description,
  tooltip,
  children,
  htmlFor,
  defaultBadge,
  isModified,
  onReset,
  impactText,
}: SettingRowProps) {
  return (
    {/* --- AI-MODIFIED (2026-03-21) --- */}
    {/* Purpose: Fix reversed breakpoints -- stack vertically on mobile, row on sm+ */}
    <div className={`group flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 py-4 border-b border-border/50 last:border-b-0 transition-colors ${isModified ? "bg-amber-500/[0.03]" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isModified && (
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Modified from default" />
          )}
          <label htmlFor={htmlFor} className="text-sm font-medium text-foreground/90 cursor-pointer">
            {label}
          </label>
          {tooltip && <Tooltip content={tooltip} />}
          {defaultBadge && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-mono">
              Default: {defaultBadge}
            </span>
          )}
          {isModified && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
              title="Reset to default"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-full sm:max-w-md">{description}</p>
        )}
        {impactText && (
          <p className="mt-0.5 text-[11px] text-primary/60 leading-relaxed max-w-full sm:max-w-md">{impactText}</p>
        )}
      </div>
      <div className="w-full sm:w-auto sm:flex-shrink-0">{children}</div>
    </div>
    {/* --- END AI-MODIFIED --- */}
  )
}
