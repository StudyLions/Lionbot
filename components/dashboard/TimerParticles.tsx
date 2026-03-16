// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Lightweight particle renderer for focus timer themes.
//          Renders petals, embers, stars, bubbles, sparkles, or
//          shimmer particles using pure CSS animations.
// ============================================================
import { useMemo } from "react"
import type { ParticleConfig } from "@/constants/TimerThemes"

interface Props {
  config: ParticleConfig
  className?: string
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49397
  return x - Math.floor(x)
}

export default function TimerParticles({ config, className = "" }: Props) {
  const particles = useMemo(() => {
    return Array.from({ length: config.count }, (_, i) => {
      const r = seededRandom
      const color = config.colors[i % config.colors.length]
      const x = r(i * 7 + 1) * 100
      const y = r(i * 13 + 3) * 100
      const delay = r(i * 17 + 5) * 6
      const dur = (3 + r(i * 23 + 7) * 5) / config.speed
      const size = 2 + r(i * 29 + 11) * 6

      return { i, color, x, y, delay, dur, size }
    })
  }, [config])

  const animationName = `particle-${config.type}`

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <style jsx>{`
        @keyframes particle-petals {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.6; }
          100% { transform: translate(calc(var(--dx) * 1px), 100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes particle-embers {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translate(calc(var(--dx) * 1px), -120vh) scale(0.3); opacity: 0; }
        }
        @keyframes particle-stars {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50%      { opacity: 1; transform: scale(1.2); }
        }
        @keyframes particle-bubbles {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          15%  { opacity: 0.5; }
          85%  { opacity: 0.3; }
          100% { transform: translate(calc(var(--dx) * 1px), -80vh) scale(1); opacity: 0; }
        }
        @keyframes particle-sparkles {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50%      { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes particle-shimmer {
          0%, 100% { opacity: 0; }
          30%      { opacity: 0.7; }
          70%      { opacity: 0.5; }
        }
      `}</style>
      {particles.map(({ i, color, x, y, delay, dur, size }) => {
        const dx = (seededRandom(i * 31 + 13) - 0.5) * 120

        const shapeStyle: React.CSSProperties =
          config.type === "petals"
            ? { borderRadius: "50% 0 50% 0", transform: "rotate(45deg)" }
            : config.type === "stars"
            ? { clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }
            : config.type === "sparkles"
            ? { clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)" }
            : { borderRadius: "50%" }

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${x}%`,
              top: config.type === "embers" ? `${60 + y * 0.4}%` : `${y}%`,
              width: size,
              height: config.type === "petals" ? size * 1.4 : size,
              backgroundColor: color,
              "--dx": dx,
              animation: `${animationName} ${dur}s ${delay}s ease-in-out infinite`,
              ...shapeStyle,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}
