// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Visual badge that surfaces the bot's permission status for a
//          setting before the admin tries to save it. Three states:
//
//            ok       \u2014 green dot, "Looks good"
//            warning  \u2014 amber dot, "Some optional features won't work"
//            error    \u2014 red dot,  "The bot can't do this. [Show fix]"
//
//          Renders nothing while loading so it doesn't flicker into view.
// ============================================================
import { useState } from "react"
import { Check, AlertTriangle, AlertCircle, ChevronDown } from "lucide-react"

export type PermStatus = "ok" | "warning" | "error" | "unknown"

interface Props {
  status: PermStatus
  message?: string
  fix?: string[]
}

const VARIANT: Record<PermStatus, { dot: string; bg: string; border: string; text: string; Icon: typeof Check }> = {
  ok:      { dot: "bg-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/20", text: "text-emerald-400", Icon: Check },
  warning: { dot: "bg-amber-400",   bg: "bg-amber-500/10",    border: "border-amber-500/20",   text: "text-amber-400",   Icon: AlertTriangle },
  error:   { dot: "bg-red-400",     bg: "bg-red-500/10",      border: "border-red-500/20",     text: "text-red-400",     Icon: AlertCircle },
  unknown: { dot: "bg-muted-foreground", bg: "bg-muted/30", border: "border-border", text: "text-muted-foreground", Icon: AlertCircle },
}

export default function BotPermBadge({ status, message, fix }: Props) {
  const [open, setOpen] = useState(false)
  const v = VARIANT[status]

  if (status === "unknown") return null

  const defaultMessage =
    status === "ok"
      ? "Looks good \u2014 the bot can do everything it needs here."
      : status === "warning"
        ? "Some optional features won't work because the bot is missing a permission."
        : "The bot can't post here. Fix it in Discord first."

  return (
    <div className={`rounded-lg border ${v.border} ${v.bg} px-3 py-2 text-[13px] ${v.text}`}>
      <div className="flex items-start gap-2">
        <v.Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1 leading-relaxed">{message || defaultMessage}</div>
        {fix && fix.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded`}
            aria-expanded={open}
          >
            {open ? "Hide fix" : "Show fix"}
            <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        )}
      </div>
      {open && fix && fix.length > 0 && (
        <ol className={`mt-2 ml-6 list-decimal space-y-1 text-[12px] text-foreground/85`}>
          {fix.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
