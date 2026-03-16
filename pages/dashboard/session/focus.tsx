// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Focus Mode - immersive full-screen pomodoro timer with
//          Wake Lock API, pop-out window support, ambient backgrounds,
//          stopwatch mode for non-pomodoro rooms, ambient sounds,
//          room member presence, break wellness tips, notifications,
//          and pomodoro cycle counter
// ============================================================
import { useDashboard } from "@/hooks/useDashboard"
import { useStageNotifications } from "@/hooks/useStageNotifications"
import { useAmbientSound, SoundType } from "@/hooks/useAmbientSound"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import Head from "next/head"
import Link from "next/link"
import {
  ArrowLeft, ExternalLink, Clock, Maximize, Minimize,
  Bell, BellOff, Volume2, VolumeX, Waves, CloudRain, Users,
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
    cycleNumber: number
    lastStarted: string
  } | null
  roomMembers?: Array<{
    userId: string
    displayName: string
    avatarUrl: string | null
  }>
}

const BREAK_TIPS = [
  "Stand up and stretch your shoulders",
  "Drink a glass of water",
  "Look at something 20 feet away for 20 seconds",
  "Roll your neck gently side to side",
  "Take 3 deep breaths",
  "Wiggle your fingers and toes",
  "Close your eyes and relax your jaw",
  "Walk around the room for a moment",
  "Splash cold water on your face",
  "Do a quick shoulder roll",
  "Stretch your wrists and forearms",
  "Take a moment to appreciate your progress",
  "Straighten your posture",
  "Give your eyes a break from the screen",
  "Hydrate -- your brain needs water to focus",
]

function useWakeLock() {
  const wakeLockRef = useRef<any>(null)

  const request = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
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

const SOUND_OPTIONS: { type: SoundType; label: string; Icon: typeof Volume2 }[] = [
  { type: "off", label: "Off", Icon: VolumeX },
  { type: "white", label: "White Noise", Icon: Waves },
  { type: "brown", label: "Brown Noise", Icon: Volume2 },
  { type: "rain", label: "Rain", Icon: CloudRain },
]

export default function FocusModePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isPopout = router.query.popout === "true"

  const { data } = useDashboard<LiveSessionData>(
    session ? "/api/dashboard/live-session" : null,
    { refreshInterval: 10000 }
  )

  useWakeLock()
  const notifications = useStageNotifications(data?.pomodoro?.stage ?? null)
  const ambient = useAmbientSound()

  const [remaining, setRemaining] = useState<number>(0)
  const [totalSecs, setTotalSecs] = useState<number>(0)
  const [stage, setStage] = useState<"focus" | "break" | null>(null)
  const [elapsed, setElapsed] = useState("")
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const prevStageRef = useRef<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [showSoundPanel, setShowSoundPanel] = useState(false)

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
      setElapsedSecs(secs)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [data?.session?.startTime])

  useEffect(() => {
    if (stage && remaining >= 0) {
      const mins = Math.floor(remaining / 60)
      const secs = remaining % 60
      document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - ${stage === "focus" ? "Focus" : "Break"}`
    } else if (elapsed && data?.active && !data?.pomodoro) {
      document.title = `${elapsed} - Study Session`
    }
    return () => { document.title = "LionBot" }
  }, [remaining, stage, elapsed, data?.active, data?.pomodoro])

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

  const breakTip = useMemo(() => {
    if (!data?.pomodoro || data.pomodoro.stage !== "break") return null
    const idx = (data.pomodoro.cycleNumber - 1) % BREAK_TIPS.length
    return BREAK_TIPS[idx]
  }, [data?.pomodoro?.stage, data?.pomodoro?.cycleNumber])

  const roomMembers = data?.roomMembers ?? []

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

  const isPomodoro = !!data.pomodoro

  const minutes = isPomodoro ? Math.floor(remaining / 60) : Math.floor(elapsedSecs / 60)
  const seconds = isPomodoro ? remaining % 60 : elapsedSecs % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const ringSize = isPopout ? 240 : 320
  const strokeWidth = isPopout ? 6 : 8
  const radius = (ringSize - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius

  let progress = 0
  let strokeDashoffset = circumference
  if (isPomodoro && totalSecs > 0) {
    progress = remaining / totalSecs
    strokeDashoffset = circumference * (1 - progress)
  } else if (!isPomodoro) {
    const maxRingSecs = 3600
    progress = Math.min(elapsedSecs / maxRingSecs, 1)
    strokeDashoffset = circumference * (1 - progress)
  }

  const urgent = isPomodoro && totalSecs > 0 && remaining / totalSecs < 0.1

  const focusColors = {
    bg: "from-amber-950/40 via-gray-950 to-gray-950",
    stroke: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.15)",
    glowStrong: "rgba(245, 158, 11, 0.3)",
    text: "text-amber-400",
    label: "FOCUS",
  }
  const breakColors = {
    bg: "from-cyan-950/40 via-gray-950 to-gray-950",
    stroke: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.15)",
    glowStrong: "rgba(6, 182, 212, 0.3)",
    text: "text-cyan-400",
    label: "BREAK",
  }
  const sessionColors = {
    bg: "from-violet-950/30 via-gray-950 to-gray-950",
    stroke: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.12)",
    glowStrong: "rgba(139, 92, 246, 0.25)",
    text: "text-violet-400",
    label: "SESSION",
  }

  const c = isPomodoro
    ? (stage === "focus" ? focusColors : breakColors)
    : sessionColors

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
            <div className="flex items-center gap-2">
              {isPomodoro && (
                <button
                  onClick={notifications.toggle}
                  className={cn(
                    "transition-colors p-1.5 rounded-lg",
                    notifications.enabled
                      ? "text-emerald-400 hover:text-emerald-300 bg-emerald-400/10"
                      : "text-gray-500 hover:text-gray-300"
                  )}
                  title={notifications.enabled ? "Disable alerts" : "Enable stage alerts"}
                >
                  {notifications.enabled ? <Bell size={15} /> : <BellOff size={15} />}
                </button>
              )}
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
            {isPomodoro && data.pomodoro && (
              <>
                <p className="text-xs text-gray-500">
                  {Math.floor(data.pomodoro.focusLength / 60)}:{String(data.pomodoro.focusLength % 60).padStart(2, "0")} focus
                  {" / "}
                  {Math.floor(data.pomodoro.breakLength / 60)}:{String(data.pomodoro.breakLength % 60).padStart(2, "0")} break
                </p>
                {/* Cycle counter */}
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {Array.from({ length: Math.min(data.pomodoro.cycleNumber, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i < data.pomodoro!.cycleNumber - 1
                          ? stage === "focus" ? "bg-amber-400/70" : "bg-cyan-400/70"
                          : stage === "focus"
                            ? "bg-amber-400 animate-pulse"
                            : "bg-cyan-400 animate-pulse"
                      )}
                    />
                  ))}
                  <span className="text-[10px] text-gray-600 ml-1 tabular-nums">
                    Cycle {data.pomodoro.cycleNumber}
                  </span>
                </div>
              </>
            )}
            {/* Break wellness tip */}
            {breakTip && (
              <p className="text-xs text-cyan-400/60 italic mt-2 max-w-xs mx-auto">
                {breakTip}
              </p>
            )}
          </div>

          {/* Session info */}
          {!isPopout && (
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
              <span>{data.session?.guildName}</span>
              {isPomodoro && data.pomodoro && (
                <>
                  <span>&middot;</span>
                  <span>{data.pomodoro.channelName}</span>
                </>
              )}
              {elapsed && (
                <>
                  <span>&middot;</span>
                  <span className="font-mono tabular-nums">{elapsed} session</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom area */}
        {!isPopout && (
          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 flex flex-col items-center gap-4">
            {/* Room member presence */}
            {roomMembers.length > 0 && (
              <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex -space-x-2">
                  {roomMembers.slice(0, 8).map((m) => (
                    m.avatarUrl ? (
                      <img
                        key={m.userId}
                        src={m.avatarUrl}
                        alt={m.displayName}
                        title={m.displayName}
                        className="w-7 h-7 rounded-full border-2 border-gray-950"
                      />
                    ) : (
                      <div
                        key={m.userId}
                        title={m.displayName}
                        className="w-7 h-7 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center"
                      >
                        <Users size={10} className="text-gray-500" />
                      </div>
                    )
                  ))}
                  {roomMembers.length > 8 && (
                    <div className="w-7 h-7 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-[9px] text-gray-400 font-medium">
                      +{roomMembers.length - 8}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-600">
                  {roomMembers.length} studying with you
                </p>
              </div>
            )}

            {/* Ambient sound controls */}
            <div className="relative">
              <button
                onClick={() => setShowSoundPanel(!showSoundPanel)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
                  ambient.playing
                    ? "bg-white/10 text-gray-300 hover:bg-white/15"
                    : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-400"
                )}
              >
                {ambient.playing ? <Volume2 size={13} /> : <VolumeX size={13} />}
                {ambient.playing
                  ? SOUND_OPTIONS.find(s => s.type === ambient.soundType)?.label ?? "Sound"
                  : "Ambient Sound"
                }
              </button>

              {showSoundPanel && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl p-3 min-w-[200px] space-y-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {SOUND_OPTIONS.map(({ type, label, Icon }) => (
                      <button
                        key={type}
                        onClick={() => {
                          if (type === "off") {
                            if (ambient.playing) ambient.toggle()
                            ambient.setSoundType("off")
                          } else {
                            ambient.setSoundType(type)
                            if (!ambient.playing) ambient.toggle()
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all",
                          (type === "off" && !ambient.playing) || (type !== "off" && ambient.soundType === type && ambient.playing)
                            ? "bg-white/15 text-white"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                  {ambient.playing && (
                    <div className="flex items-center gap-2 px-1">
                      <VolumeX size={10} className="text-gray-600 flex-shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(ambient.volume * 100)}
                        onChange={(e) => ambient.setVolume(parseInt(e.target.value) / 100)}
                        className="flex-1 h-1 accent-white/60 cursor-pointer"
                      />
                      <Volume2 size={10} className="text-gray-600 flex-shrink-0" />
                    </div>
                  )}
                </div>
              )}
            </div>

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
