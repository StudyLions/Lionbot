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

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full",
        "shadow-lg backdrop-blur cursor-pointer transition-all hover:scale-105",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        stage === "focus"
          ? "bg-amber-950/90 border border-amber-500/30 text-amber-200"
          : stage === "break"
            ? "bg-cyan-950/90 border border-cyan-500/30 text-cyan-200"
            : "bg-gray-900/90 border border-gray-700 text-gray-200"
      )}
      onClick={() => router.push("/dashboard/session")}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs font-medium">{stageLabel}</span>
      <span className="font-mono text-sm font-bold tabular-nums">{timerText}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
        className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors text-current opacity-50 hover:opacity-100"
      >
        <X size={11} />
      </button>
    </div>
  )
}
