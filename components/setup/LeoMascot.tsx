// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: SVG lion mascot with 6 animated pose variants for
//          the setup wizard "Leo's Welcome Tour"
// ============================================================
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"

interface LeoMascotProps {
  pose: LeoPose
  message: string
  className?: string
  compact?: boolean
}

function TypewriterText({ text, key }: { text: string; key: string }) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 18)
    return () => clearInterval(interval)
  }, [text, key])
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  )
}

const poseConfig: Record<LeoPose, {
  mouthPath: string
  leftArm: { rotate: number; x: number; y: number }
  rightArm: { rotate: number; x: number; y: number }
  eyeType: "normal" | "stars" | "wide"
  extras?: "sparkle" | "confetti"
}> = {
  waving: {
    mouthPath: "M 36,62 Q 44,70 52,62",
    leftArm: { rotate: -45, x: -4, y: -8 },
    rightArm: { rotate: 20, x: 0, y: 0 },
    eyeType: "normal",
    extras: "sparkle",
  },
  pointing: {
    mouthPath: "M 37,62 Q 44,68 51,62",
    leftArm: { rotate: 10, x: 0, y: 0 },
    rightArm: { rotate: -70, x: 8, y: -6 },
    eyeType: "normal",
  },
  thumbsUp: {
    mouthPath: "M 36,62 Q 44,72 52,62",
    leftArm: { rotate: -30, x: -2, y: -6 },
    rightArm: { rotate: 20, x: 0, y: 0 },
    eyeType: "normal",
  },
  starEyed: {
    mouthPath: "M 34,60 Q 44,74 54,60",
    leftArm: { rotate: -20, x: -2, y: -4 },
    rightArm: { rotate: 20, x: 2, y: -4 },
    eyeType: "stars",
    extras: "sparkle",
  },
  mindBlown: {
    mouthPath: "M 38,60 Q 44,72 50,60",
    leftArm: { rotate: -60, x: -6, y: -12 },
    rightArm: { rotate: 60, x: 6, y: -12 },
    eyeType: "wide",
    extras: "sparkle",
  },
  celebrating: {
    mouthPath: "M 34,60 Q 44,76 54,60",
    leftArm: { rotate: -70, x: -6, y: -14 },
    rightArm: { rotate: 70, x: 6, y: -14 },
    eyeType: "normal",
    extras: "confetti",
  },
}

function StarEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <polygon
        points={`${cx},${cy - 5} ${cx + 1.5},${cy - 1.5} ${cx + 5},${cy - 1} ${cx + 2.5},${cy + 1.5} ${cx + 3},${cy + 5} ${cx},${cy + 3} ${cx - 3},${cy + 5} ${cx - 2.5},${cy + 1.5} ${cx - 5},${cy - 1} ${cx - 1.5},${cy - 1.5}`}
        fill="#DDB21D"
      />
    </motion.g>
  )
}

function Sparkles() {
  return (
    <g>
      {[
        { x: 14, y: 18, delay: 0 },
        { x: 74, y: 12, delay: 0.4 },
        { x: 70, y: 50, delay: 0.8 },
        { x: 10, y: 55, delay: 1.2 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={2}
          fill="#DDB21D"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </g>
  )
}

function ConfettiParticles() {
  const colors = ["#DDB21D", "#f57c00", "#5865F2", "#43b581", "#ff6b6b"]
  return (
    <g>
      {colors.map((color, i) => (
        <motion.rect
          key={i}
          x={20 + i * 12}
          y={0}
          width={4}
          height={4}
          rx={1}
          fill={color}
          animate={{
            y: [0, 10 + i * 5, 25 + i * 3],
            x: [20 + i * 12, 15 + i * 14, 10 + i * 16],
            rotate: [0, 180 + i * 45, 360],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </g>
  )
}

function LeoSVG({ pose }: { pose: LeoPose }) {
  const cfg = poseConfig[pose]
  return (
    <svg viewBox="0 0 88 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {cfg.extras === "sparkle" && <Sparkles />}
      {cfg.extras === "confetti" && <ConfettiParticles />}

      {/* Mane */}
      <circle cx="44" cy="40" r="28" fill="#C4961A" />
      <circle cx="28" cy="28" r="8" fill="#B8860B" />
      <circle cx="60" cy="28" r="8" fill="#B8860B" />
      <circle cx="20" cy="40" r="7" fill="#B8860B" />
      <circle cx="68" cy="40" r="7" fill="#B8860B" />
      <circle cx="26" cy="52" r="6" fill="#B8860B" />
      <circle cx="62" cy="52" r="6" fill="#B8860B" />

      {/* Head */}
      <circle cx="44" cy="42" r="22" fill="#DDB21D" />

      {/* Ears */}
      <ellipse cx="28" cy="24" rx="6" ry="8" fill="#DDB21D" />
      <ellipse cx="28" cy="24" rx="3.5" ry="5" fill="#E8C84A" />
      <ellipse cx="60" cy="24" rx="6" ry="8" fill="#DDB21D" />
      <ellipse cx="60" cy="24" rx="3.5" ry="5" fill="#E8C84A" />

      {/* Eyes */}
      {cfg.eyeType === "stars" ? (
        <>
          <StarEye cx={36} cy={40} />
          <StarEye cx={52} cy={40} />
        </>
      ) : cfg.eyeType === "wide" ? (
        <>
          <circle cx={36} cy={40} r={5} fill="white" />
          <circle cx={52} cy={40} r={5} fill="white" />
          <circle cx={36} cy={40} r={3} fill="#2C1810" />
          <circle cx={52} cy={40} r={3} fill="#2C1810" />
          <circle cx={37} cy={39} r={1} fill="white" />
          <circle cx={53} cy={39} r={1} fill="white" />
        </>
      ) : (
        <>
          <circle cx={36} cy={40} r={4} fill="white" />
          <circle cx={52} cy={40} r={4} fill="white" />
          <circle cx={37} cy={40} r={2.5} fill="#2C1810" />
          <circle cx={53} cy={40} r={2.5} fill="#2C1810" />
          <circle cx={37.8} cy={39} r={0.8} fill="white" />
          <circle cx={53.8} cy={39} r={0.8} fill="white" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="44" cy="52" rx="5" ry="3.5" fill="#C4961A" />
      <ellipse cx="44" cy="51" rx="3" ry="2" fill="#A07818" />

      {/* Whiskers */}
      <line x1="20" y1="48" x2="33" y2="50" stroke="#A07818" strokeWidth="0.8" />
      <line x1="20" y1="54" x2="33" y2="53" stroke="#A07818" strokeWidth="0.8" />
      <line x1="55" y1="50" x2="68" y2="48" stroke="#A07818" strokeWidth="0.8" />
      <line x1="55" y1="53" x2="68" y2="54" stroke="#A07818" strokeWidth="0.8" />

      {/* Mouth */}
      <motion.path
        d={cfg.mouthPath}
        stroke="#8B6914"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={false}
        animate={{ d: cfg.mouthPath }}
        transition={{ duration: 0.3 }}
      />

      {/* Body */}
      <ellipse cx="44" cy="78" rx="14" ry="12" fill="#DDB21D" />
      <ellipse cx="44" cy="76" rx="10" ry="6" fill="#E8C84A" />

      {/* Left arm */}
      <motion.g
        animate={{
          rotate: cfg.leftArm.rotate,
          x: cfg.leftArm.x,
          y: cfg.leftArm.y,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ transformOrigin: "30px 72px" }}
      >
        <ellipse cx="24" cy="80" rx="5" ry="8" fill="#DDB21D" />
        {pose === "thumbsUp" && (
          <circle cx="22" cy="72" r="3.5" fill="#DDB21D" stroke="#C4961A" strokeWidth="0.5" />
        )}
      </motion.g>

      {/* Right arm */}
      <motion.g
        animate={{
          rotate: cfg.rightArm.rotate,
          x: cfg.rightArm.x,
          y: cfg.rightArm.y,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ transformOrigin: "58px 72px" }}
      >
        <ellipse cx="64" cy="80" rx="5" ry="8" fill="#DDB21D" />
        {pose === "waving" && (
          <motion.g
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "64px 72px" }}
          >
            <circle cx="64" cy="70" r="4" fill="#DDB21D" stroke="#C4961A" strokeWidth="0.5" />
          </motion.g>
        )}
      </motion.g>

      {/* Feet */}
      <ellipse cx="36" cy="92" rx="6" ry="4" fill="#C4961A" />
      <ellipse cx="52" cy="92" rx="6" ry="4" fill="#C4961A" />
    </svg>
  )
}

export default function LeoMascot({ pose, message, className = "", compact = false }: LeoMascotProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Leo character with idle bounce */}
      <motion.div
        className={compact ? "w-20 h-20" : "w-28 h-28 lg:w-36 lg:h-36"}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pose}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full h-full"
          >
            <LeoSVG pose={pose} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={`relative ${compact ? "max-w-xs" : "max-w-sm"} bg-card border border-border rounded-xl px-4 py-3 shadow-lg`}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
        <p className={`relative ${compact ? "text-xs" : "text-sm"} text-foreground/90 leading-relaxed`}>
          <TypewriterText text={message} key={`${pose}-${message.slice(0, 20)}`} />
        </p>
      </motion.div>
    </div>
  )
}
