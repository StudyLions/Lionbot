// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Mobile-first vertical setting row used inside Setup Checklist
//          drawers. Differs from `components/dashboard/ui/SettingRow.tsx`
//          (which is a horizontal full-page row sized for the Settings page)
//          by stacking label/help above the input and sizing for narrow
//          drawer widths on mobile.
//
//          - Label + optional JargonTip + optional RecommendedPill on top
//          - One-line help underneath
//          - Input slot below (any width)
//          - Optional footer slot for "configured" badges, perm warnings, etc.
// ============================================================
import { ReactNode } from "react"
import JargonTip, { type JargonTerm } from "./JargonTip"

interface Props {
  label: string
  htmlFor?: string
  help?: string
  jargon?: JargonTerm | JargonTerm[]
  recommended?: ReactNode
  required?: boolean
  children: ReactNode
  footer?: ReactNode
}

export default function SettingRow({
  label,
  htmlFor,
  help,
  jargon,
  recommended,
  required,
  children,
  footer,
}: Props) {
  const terms = jargon ? (Array.isArray(jargon) ? jargon : [jargon]) : []

  return (
    <div className="py-4 border-b border-border/40 last:border-b-0 first:pt-0 space-y-2">
      <div className="flex items-start gap-2 flex-wrap">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground/95 leading-tight"
        >
          {label}
          {required && <span className="ml-1 text-red-400" aria-label="required">*</span>}
        </label>
        {terms.map((t) => (
          <JargonTip key={t} term={t} size={13} />
        ))}
        {recommended && <div className="ml-auto">{recommended}</div>}
      </div>
      {help && (
        <p className="text-[13px] text-muted-foreground leading-relaxed">{help}</p>
      )}
      <div>{children}</div>
      {footer && <div className="pt-1">{footer}</div>}
    </div>
  )
}
