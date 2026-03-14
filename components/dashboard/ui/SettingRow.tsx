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
    <div className={`group flex items-start justify-between gap-6 py-4 border-b border-border/50 last:border-b-0 sm:flex-col sm:gap-3 transition-colors ${isModified ? "bg-amber-500/[0.03]" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
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
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
              title="Reset to default"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-md">{description}</p>
        )}
        {impactText && (
          <p className="mt-0.5 text-[11px] text-primary/60 leading-relaxed max-w-md">{impactText}</p>
        )}
      </div>
      <div className="flex-shrink-0 sm:w-full">{children}</div>
    </div>
  )
}
