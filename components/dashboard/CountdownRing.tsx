// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: SVG circular countdown timer for Pomodoro live timers
// ============================================================
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export interface CountdownRingProps {
  totalSeconds: number
  remainingSeconds: number
  stage: "focus" | "break" | null
  size?: number
  className?: string
  showLabel?: boolean
}

export default function CountdownRing({
  totalSeconds,
  remainingSeconds,
  stage,
  size = 120,
  className,
  showLabel = true,
}: CountdownRingProps) {
  const [remaining, setRemaining] = useState(remainingSeconds)
  const prevStageRef = useRef(stage)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setRemaining(remainingSeconds)
  }, [remainingSeconds])

  useEffect(() => {
    if (stage && remaining > 0) {
      const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
      return () => clearInterval(interval)
    }
  }, [stage, remaining > 0])

  useEffect(() => {
    if (prevStageRef.current !== stage && stage) {
      setTransitioning(true)
      const timeout = setTimeout(() => setTransitioning(false), 600)
      prevStageRef.current = stage
      return () => clearTimeout(timeout)
    }
    prevStageRef.current = stage
  }, [stage])

  const strokeWidth = Math.max(4, size * 0.05)
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const strokeDashoffset = circumference * (1 - progress)
  const urgentThreshold = totalSeconds > 0 ? remaining / totalSeconds < 0.1 : false

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const colors = {
    focus: { stroke: "#f59e0b", bg: "rgba(245,158,11,0.12)", glow: "rgba(245,158,11,0.3)", text: "text-amber-500" },
    break: { stroke: "#06b6d4", bg: "rgba(6,182,212,0.12)", glow: "rgba(6,182,212,0.3)", text: "text-cyan-500" },
    stopped: { stroke: "#64748b", bg: "rgba(100,116,139,0.08)", glow: "transparent", text: "text-muted-foreground" },
  }
  const c = colors[stage || "stopped"]

  const fontSize = size < 80 ? "text-base" : size < 140 ? "text-2xl" : "text-3xl"

  // --- AI-MODIFIED (2026-04-25) ---
  // Purpose: Premium polish -- aria-label communicates current stage + remaining
  // time to screen readers, decorative track ring is aria-hidden, glow + urgent
  // pulse wrapped in motion-safe so reduced-motion users don't get the throb,
  // STOPPED label uses semantic muted-foreground (was already), kept the amber
  // brand color (Pomodoro convention) rather than swapping to --primary
  const stageWord = stage === "focus" ? "Focus" : stage === "break" ? "Break" : "Stopped"
  const ariaLabel = stage
    ? `${stageWord} timer: ${minutes} minutes ${seconds} seconds remaining`
    : `Pomodoro timer stopped`

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-1.5", className)}
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
    >
      <div
        className={cn("relative", transitioning && "motion-safe:animate-[pulse_0.6s_ease-in-out]")}
        style={{
          width: size,
          height: size,
          filter: stage ? `drop-shadow(0 0 ${size * 0.08}px ${c.glow})` : undefined,
        }}
      >
        <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={c.bg} strokeWidth={strokeWidth} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={c.stroke} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-[stroke-dashoffset] duration-1000 ease-linear",
              urgentThreshold && stage && "motion-safe:animate-[pulse_1s_ease-in-out_infinite]"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(fontSize, "font-bold font-mono text-foreground tabular-nums leading-none")}>
            {formatted}
          </span>
          {!stage && (
            <span className="text-[10px] text-muted-foreground mt-1">STOPPED</span>
          )}
        </div>
      </div>
      {showLabel && stage && (
        <span className={cn("text-[11px] font-bold uppercase tracking-widest", c.text)} aria-hidden="true">
          {stage}
        </span>
      )}
    </div>
  )
  // --- END AI-MODIFIED ---
}
