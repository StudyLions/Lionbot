// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Persistent mini-timer widget that appears on all dashboard
//          pages when the user has an active voice/pomodoro session.
//          Shows countdown or elapsed time, clickable to go to session page.
// ============================================================
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface MiniSessionData {
  active: boolean
  session?: { startTime: string; guildName: string }
  pomodoro?: {
    stage: "focus" | "break"
    remainingSeconds: number
    stageDurationSeconds: number
  } | null
}

const HIDDEN_ROUTES = ["/dashboard/session", "/dashboard/session/focus"]

export default function MiniSessionTimer() {
  const { data: session } = useSession()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const { data } = useDashboard<MiniSessionData>(
    session ? "/api/dashboard/live-session" : null,
    { refreshInterval: 30000 }
  )

  const [remaining, setRemaining] = useState(0)
  const [elapsed, setElapsed] = useState("")
  const [stage, setStage] = useState<"focus" | "break" | null>(null)

  useEffect(() => {
    if (!data?.pomodoro) { setStage(null); return }
    setRemaining(data.pomodoro.remainingSeconds)
    setStage(data.pomodoro.stage)
  }, [data?.pomodoro])

  useEffect(() => {
    if (stage && remaining > 0) {
      const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
      return () => clearInterval(interval)
    }
  }, [stage, remaining > 0])

  useEffect(() => {
    if (!data?.session?.startTime || data?.pomodoro) return
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(data.session!.startTime).getTime()) / 1000)
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      setElapsed(h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m}m`)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [data?.session?.startTime, data?.pomodoro])

  useEffect(() => { setDismissed(false) }, [data?.active])

  const isHiddenRoute = HIDDEN_ROUTES.some((r) => router.pathname.startsWith(r))
  const isDashboard = router.pathname.startsWith("/dashboard") || router.pathname.startsWith("/pet")

  if (!isDashboard || isHiddenRoute || !data?.active || dismissed) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timerText = stage
    ? `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : elapsed

  const stageLabel = stage === "focus" ? "Focus" : stage === "break" ? "Break" : "Session"

  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- main pill is now a real <button> for keyboard
  // a11y (was a div with onClick), the X dismiss is a sibling button outside
  // the main pill (no invalid nested-interactive), with a proper 32px hit area
  // (was 11px icon in p-0.5). Motion-safe on hover-scale and animate-ping so
  // reduced-motion users don't get surprised, focus-visible rings on both
  // buttons, safe-area inset for iOS notched bottoms.
  const pillColor = stage === "focus"
    ? "bg-amber-950/90 border border-amber-500/30 text-amber-200"
    : stage === "break"
      ? "bg-cyan-950/90 border border-cyan-500/30 text-cyan-200"
      : "bg-card/90 border border-border text-foreground"

  return (
    <div
      className="fixed z-50 flex items-center gap-1"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/dashboard/session")}
        aria-label={`${stageLabel} -- ${timerText}. Open session view`}
        className={cn(
          "flex items-center gap-2.5 pl-3.5 pr-3 py-2 rounded-full",
          "shadow-lg backdrop-blur transition-all duration-200",
          "motion-safe:hover:scale-105 motion-safe:animate-fade-in",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          pillColor,
        )}
      >
        <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-medium">{stageLabel}</span>
        <span className="font-mono text-sm font-bold tabular-nums">{timerText}</span>
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss session timer"
        className={cn(
          "inline-flex items-center justify-center h-8 w-8 rounded-full",
          "shadow-lg backdrop-blur transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "opacity-70 hover:opacity-100",
          pillColor,
        )}
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  )
  // --- END AI-MODIFIED ---
}
