// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Focus Mode - immersive full-screen pomodoro timer with
//          Wake Lock API, pop-out window support, and ambient backgrounds
// ============================================================
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import Head from "next/head"
import Link from "next/link"
import {
  ArrowLeft, ExternalLink, Clock, Maximize, Minimize,
} from "lucide-react"
import InstallPrompt from "@/components/dashboard/InstallPrompt"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface LiveSessionData {
  active: boolean
  session?: {
    channelId: string
    guildId: string
    guildName: string
    startTime: string
    currentMinutes: number
    isCamera: boolean
    isStream: boolean
  }
  pomodoro?: {
    stage: "focus" | "break"
    focusLength: number
    breakLength: number
    stageStartedAt: string
    stageEndsAt: string
    remainingSeconds: number
    stageDurationSeconds: number
    channelName: string
  } | null
}

function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      }
    } catch {}
  }, [])

  const release = useCallback(async () => {
    try {
      await wakeLockRef.current?.release()
      wakeLockRef.current = null
    } catch {}
  }, [])

  useEffect(() => {
    request()
    const onVisibility = () => {
      if (document.visibilityState === "visible") request()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      release()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [request, release])
}

export default function FocusModePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isPopout = router.query.popout === "true"

  const { data } = useDashboard<LiveSessionData>(
    session ? "/api/dashboard/live-session" : null,
    { refreshInterval: 10000 }
  )

  useWakeLock()

  const [remaining, setRemaining] = useState<number>(0)
  const [totalSecs, setTotalSecs] = useState<number>(0)
  const [stage, setStage] = useState<"focus" | "break" | null>(null)
  const [elapsed, setElapsed] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const prevStageRef = useRef<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (!data?.pomodoro) {
      setStage(null)
      return
    }
    setRemaining(data.pomodoro.remainingSeconds)
    setTotalSecs(data.pomodoro.stageDurationSeconds)
    if (prevStageRef.current && prevStageRef.current !== data.pomodoro.stage) {
      setTransitioning(true)
      setTimeout(() => setTransitioning(false), 800)
    }
    prevStageRef.current = data.pomodoro.stage
    setStage(data.pomodoro.stage)
  }, [data?.pomodoro])

  useEffect(() => {
    if (stage && remaining > 0) {
      const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
      return () => clearInterval(interval)
    }
  }, [stage, remaining > 0])

  useEffect(() => {
    if (!data?.session?.startTime) return
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(data.session!.startTime).getTime()) / 1000)
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      setElapsed(h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [data?.session?.startTime])

  useEffect(() => {
    if (stage && remaining >= 0) {
      const mins = Math.floor(remaining / 60)
      const secs = remaining % 60
      document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - ${stage === "focus" ? "Focus" : "Break"}`
    }
    return () => { document.title = "LionBot" }
  }, [remaining, stage])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/dashboard/session")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const openPopout = () => {
    window.open(
      "/dashboard/session/focus?popout=true",
      "LionBotFocus",
      "width=420,height=560,menubar=no,toolbar=no,location=no,status=no"
    )
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const progress = totalSecs > 0 ? remaining / totalSecs : 0
  const urgent = totalSecs > 0 && remaining / totalSecs < 0.1

  const ringSize = isPopout ? 240 : 320
  const strokeWidth = isPopout ? 6 : 8
  const radius = (ringSize - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  if (!data?.active) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Head><title>Focus Mode - LionBot</title></Head>
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-400">No active session</p>
          <Link href="/dashboard/session">
            <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 justify-center">
              <ArrowLeft size={14} /> Back to Session
            </a>
          </Link>
        </div>
      </div>
    )
  }

  if (!data?.pomodoro) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Head><title>Focus Mode - LionBot</title></Head>
        <div className="text-center space-y-4">
          <Clock size={48} className="text-gray-600 mx-auto" />
          <p className="text-lg text-gray-400">You&apos;re in a voice channel, not a pomodoro room.</p>
          <p className="text-sm text-gray-500">Focus mode requires a pomodoro timer.</p>
          <Link href="/dashboard/session">
            <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 justify-center">
              <ArrowLeft size={14} /> Back to Session
            </a>
          </Link>
        </div>
      </div>
    )
  }

  const focusColors = {
    bg: "from-amber-950/40 via-gray-950 to-gray-950",
    stroke: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.15)",
    glowStrong: "rgba(245, 158, 11, 0.3)",
    text: "text-amber-400",
    label: "FOCUS",
    breathe: "animate-[breathe-warm_8s_ease-in-out_infinite]",
  }
  const breakColors = {
    bg: "from-cyan-950/40 via-gray-950 to-gray-950",
    stroke: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.15)",
    glowStrong: "rgba(6, 182, 212, 0.3)",
    text: "text-cyan-400",
    label: "BREAK",
    breathe: "animate-[breathe-cool_6s_ease-in-out_infinite]",
  }
  const c = stage === "focus" ? focusColors : breakColors

  return (
    <>
      <Head>
        <title>{formatted} - {c.label} | LionBot</title>
      </Head>

      <style jsx global>{`
        @keyframes breathe-warm {
          0%, 100% { background-position: 0% 50%; opacity: 0.6; }
          50% { background-position: 100% 50%; opacity: 1; }
        }
        @keyframes breathe-cool {
          0%, 100% { background-position: 0% 50%; opacity: 0.6; }
          50% { background-position: 100% 50%; opacity: 1; }
        }
        @keyframes stage-flash {
          0% { opacity: 0; transform: scale(1.1); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>

      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000",
          `bg-gradient-to-b ${c.bg}`
        )}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${c.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Stage transition flash */}
        {transitioning && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${c.glowStrong} 0%, transparent 60%)`,
              animation: "stage-flash 0.8s ease-out forwards",
            }}
          />
        )}

        {/* Top bar */}
        {!isPopout && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
            <Link href="/dashboard/session">
              <a className="text-gray-500 hover:text-gray-300 flex items-center gap-1.5 text-sm transition-colors"
                onClick={() => { if (isFullscreen) document.exitFullscreen().catch(() => {}) }}>
                <ArrowLeft size={14} /> Back
              </a>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={openPopout}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1.5"
                title="Pop out timer"
              >
                <ExternalLink size={16} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1.5"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div
            className={cn("relative", transitioning && "animate-[pulse_0.8s_ease-in-out]")}
            style={{
              width: ringSize,
              height: ringSize,
              filter: `drop-shadow(0 0 ${ringSize * 0.1}px ${c.glowStrong})`,
            }}
          >
            <svg width={ringSize} height={ringSize} className="transform -rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={c.stroke}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  "transition-[stroke-dashoffset] duration-1000 ease-linear",
                  urgent && "animate-[pulse_1s_ease-in-out_infinite]"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "font-mono font-bold tabular-nums leading-none tracking-tight",
                isPopout ? "text-5xl" : "text-7xl"
              )} style={{ color: "#f0f0f0" }}>
                {formatted}
              </span>
            </div>
          </div>

          {/* Stage label */}
          <div className="text-center space-y-2">
            <p className={cn("text-sm font-bold uppercase tracking-[0.3em]", c.text)}>
              {c.label}
            </p>
            <p className="text-xs text-gray-500">
              {Math.floor(data.pomodoro.focusLength / 60)}:{String(data.pomodoro.focusLength % 60).padStart(2, "0")} focus
              {" / "}
              {Math.floor(data.pomodoro.breakLength / 60)}:{String(data.pomodoro.breakLength % 60).padStart(2, "0")} break
            </p>
          </div>

          {/* Session info */}
          {!isPopout && (
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
              <span>{data.session?.guildName}</span>
              <span>&middot;</span>
              <span>{data.pomodoro.channelName}</span>
              {elapsed && (
                <>
                  <span>&middot;</span>
                  <span className="font-mono tabular-nums">{elapsed} session</span>
                </>
              )}
            </div>
          )}
        </div>

        {!isPopout && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 px-4">
            <InstallPrompt className="max-w-sm w-full" />
          </div>
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
