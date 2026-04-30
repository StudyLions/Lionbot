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
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Add retryable + onRetry props for the "bot not in server" false-
//          negative case. Discord transiently 404s the bot member lookup,
//          and even with the new 5s cache TTL on the API, an admin who
//          re-invites the bot wants a "Try again" button right where the
//          error is shown rather than having to refresh the page or wait.
// --- END AI-MODIFIED ---
// ============================================================
import { useState } from "react"
import { Check, AlertTriangle, AlertCircle, ChevronDown, RotateCw } from "lucide-react"

export type PermStatus = "ok" | "warning" | "error" | "unknown"

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Canonical Leo invite URL (same one used in constants/Footer.ts
// line 46). Fall back to env var so this works on staging vs prod if/when
// we move it. Hard-coding here only because we don't want a network round-
// trip just to surface a Re-invite link.
const LEO_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands"
// --- END AI-MODIFIED ---

interface Props {
  status: PermStatus
  message?: string
  fix?: string[]
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: When `retryable` is true (parents pass this for the bot-not-in-
  // server case specifically), show a "Try again" link inside the badge.
  // Clicking calls onRetry, which the parent uses to re-fetch the perms
  // endpoint with ?refresh=true so the API skips its short cache TTL.
  retryable?: boolean
  onRetry?: () => void
  retrying?: boolean
  // --- END AI-MODIFIED ---
}

const VARIANT: Record<PermStatus, { dot: string; bg: string; border: string; text: string; Icon: typeof Check }> = {
  ok:      { dot: "bg-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/20", text: "text-emerald-400", Icon: Check },
  warning: { dot: "bg-amber-400",   bg: "bg-amber-500/10",    border: "border-amber-500/20",   text: "text-amber-400",   Icon: AlertTriangle },
  error:   { dot: "bg-red-400",     bg: "bg-red-500/10",      border: "border-red-500/20",     text: "text-red-400",     Icon: AlertCircle },
  unknown: { dot: "bg-muted-foreground", bg: "bg-muted/30", border: "border-border", text: "text-muted-foreground", Icon: AlertCircle },
}

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Accept retryable/onRetry/retrying. Render a "Try again" link
// inside the badge when retryable=true, plus a softer error message that
// admits this is sometimes a transient Discord glitch (with a re-invite
// link as the second fallback).
export default function BotPermBadge({ status, message, fix, retryable = false, onRetry, retrying = false }: Props) {
  // --- END AI-MODIFIED ---
  const [open, setOpen] = useState(false)
  const v = VARIANT[status]

  if (status === "unknown") return null

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Soften the default error copy from a definitive "the bot can't
  // post here, fix it" to something that reflects reality: the lookup
  // sometimes 404s transiently right after a fresh invite. The retryable
  // flag also swaps in a more specific bot-presence message.
  const defaultMessage =
    status === "ok"
      ? "Looks good \u2014 the bot can do everything it needs here."
      : status === "warning"
        ? "Some optional features won't work because the bot is missing a permission."
        : retryable
          ? "We couldn't see the bot in this server right now. Wait a few seconds and try again."
          : "The bot can't post here. Fix it in Discord first."
  // --- END AI-MODIFIED ---

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
      {/* --- AI-MODIFIED (2026-04-30) ---
          Purpose: Action row for the retryable error state. "Try again" hits
          the API with ?refresh=true; "Re-invite the bot" deep-links to the
          Discord oauth2 URL in case the bot was actually kicked. Both are
          inline-laid-out so they don't dominate the badge.
          Min-h 32 keeps the touch target reasonable on mobile without being
          gigantic next to the rest of the body copy. */}
      {status === "error" && retryable && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1 min-h-[32px] px-2 -ml-2 font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md disabled:opacity-60"
            >
              <RotateCw
                size={12}
                aria-hidden="true"
                className={retrying ? "motion-safe:animate-spin" : ""}
              />
              {retrying ? "Checking\u2026" : "Try again"}
            </button>
          )}
          <a
            href={LEO_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-[32px] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md text-foreground/85"
          >
            Re-invite the bot
          </a>
        </div>
      )}
      {/* --- END AI-MODIFIED --- */}
    </div>
  )
}
