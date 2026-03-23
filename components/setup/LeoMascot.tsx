// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: LionGotchi pixel-art mascot for the setup wizard,
//          layered from real CDN sprites with 4-frame animation
//          and random outfit (shirt, boots, wings) per load
// ============================================================
// --- AI-REPLACED (2026-03-23) ---
// Reason: The original inline SVG lion looked rough. This version uses real
//         LionGotchi pixel-art sprites from the blob CDN, with proper layering,
//         4-frame animation, random equipment outfits, and crisp upscaling.
// What the new code does better: Authentic LionGotchi look with actual game
//         assets, animated frames, and randomized cosmetics per step.
// --- Original code (commented out for rollback) ---
// (entire 314-line SVG implementation removed -- see git history for rollback)
// --- End original code ---
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  getLionSpriteUrl,
  getLionExpressionUrl,
} from "@/utils/petAssets"

type LeoPose = "waving" | "pointing" | "thumbsUp" | "starEyed" | "mindBlown" | "celebrating"

interface LeoMascotProps {
  pose: LeoPose
  message: string
  hintMessage?: string
  className?: string
  compact?: boolean
}

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ""
function equipUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/equipment/${path}`
}

const EXPRESSION_MAP: Record<LeoPose, string> = {
  waving: "happy",
  pointing: "default",
  thumbsUp: "happy",
  starEyed: "happy",
  mindBlown: "eating",
  celebrating: "happy",
}

const SHIRTS = [
  "shirts/shirt_10_legendary.png",
  "shirts/shirt_11_legendary.png",
  "shirts/shirt_12_legendary.png",
  "shirts/shirt_13_legendary.png",
  "shirts/shirt_14_legendary.png",
  "shirts/shirt_15_legendary.png",
  "shirts/shirt_10_mythical.png",
  "shirts/shirt_11_mythical.png",
  "shirts/shirt_12_mythical.png",
  "shirts/shirt_13_mythical.png",
]

const WINGS = [
  "wings/angel_wings_gold.png",
  "wings/angel_wings_blue.png",
  "wings/angel_wings_white.png",
  "wings/angel_wings_purple.png",
  "wings/butterfly_wings_gold.png",
  "wings/butterfly_wings_purple.png",
  "wings/dragon_wings_gold.png",
  "wings/dragon_wings_purple.png",
  "wings/bat_wings.png",
  "wings/bat_wings_gold.png",
  "wings/demon_wings.png",
  "wings/fairy_wings.png",
]

const BOOTS = [
  "boots/boots_boots_legendary_.png",
]

const ANIMATION_INTERVAL = 400
const FRAME_COUNT = 4

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Outfit {
  shirt: string
  wings: string
  boots: string
}

function useRandomOutfit(): Outfit {
  const [outfit] = useState<Outfit>(() => ({
    shirt: pickRandom(SHIRTS),
    wings: pickRandom(WINGS),
    boots: pickRandom(BOOTS),
  }))
  return outfit
}

const pixelStyle: React.CSSProperties = {
  imageRendering: "pixelated",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
}

function LionGotchiSprite({ expression, outfit }: { expression: string; outfit: Outfit }) {
  const [frame, setFrame] = useState(0)
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % FRAME_COUNT)
    }, ANIMATION_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  function handleError(src: string) {
    setFailedSrcs((prev) => {
      const next = new Set(Array.from(prev))
      next.add(src)
      return next
    })
  }

  const bodyUrl = getLionSpriteUrl("body", frame)
  const headUrl = getLionSpriteUrl("head", frame)
  const hairUrl = getLionSpriteUrl("hair", frame)
  const faceUrl = getLionExpressionUrl(expression, frame)

  const shirtUrl = equipUrl(outfit.shirt)
  const bootsUrl = equipUrl(outfit.boots)
  const wingsUrl = equipUrl(outfit.wings)

  const layers: { src: string; zIndex: number; isWings?: boolean }[] = [
    { src: wingsUrl, zIndex: 0, isWings: true },
    { src: bodyUrl, zIndex: 1 },
    { src: bootsUrl, zIndex: 2 },
    { src: shirtUrl, zIndex: 3 },
    { src: headUrl, zIndex: 4 },
    { src: faceUrl, zIndex: 5 },
    { src: hairUrl, zIndex: 6 },
  ]

  return (
    <div className="relative w-full h-full overflow-visible">
      {layers.map((layer) => {
        if (failedSrcs.has(layer.src)) return null
        if (layer.isWings) {
          return (
            <img
              key="wings"
              src={layer.src}
              alt=""
              draggable={false}
              onError={() => handleError(layer.src)}
              style={{
                imageRendering: "pixelated",
                position: "absolute",
                width: "140%",
                height: "100%",
                left: "-20%",
                top: "0",
                zIndex: layer.zIndex,
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
          )
        }
        return (
          <img
            key={layer.src}
            src={layer.src}
            alt=""
            draggable={false}
            onError={() => handleError(layer.src)}
            style={{ ...pixelStyle, zIndex: layer.zIndex }}
          />
        )
      })}
    </div>
  )
}

function TypewriterText({ text, id, onComplete }: { text: string; id: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 18)
    return () => clearInterval(interval)
  }, [text, id])
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  )
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Added hintMessage cycling -- after intro typewriter finishes, waits 8s then swaps to hint
export default function LeoMascot({ pose, message, hintMessage, className = "", compact = false }: LeoMascotProps) {
  const outfit = useRandomOutfit()
  const expression = EXPRESSION_MAP[pose]
  const [showHint, setShowHint] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  useEffect(() => {
    setShowHint(false)
    setIntroComplete(false)
  }, [message])

  useEffect(() => {
    if (!introComplete || !hintMessage) return
    const timer = setTimeout(() => setShowHint(true), 8000)
    return () => clearTimeout(timer)
  }, [introComplete, hintMessage])

  const displayMessage = showHint && hintMessage ? hintMessage : message
  const messageKey = `${pose}-${showHint ? "hint" : "intro"}-${message.slice(0, 20)}`

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <motion.div
        className={compact ? "w-32 h-32" : "w-48 h-48 lg:w-64 lg:h-64"}
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
            <LionGotchiSprite expression={expression} outfit={outfit} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={`relative ${compact ? "max-w-xs" : "max-w-sm"} bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-lg`}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 border-l border-t border-gray-700 rotate-45" />
        <p className={`relative ${compact ? "text-xs" : "text-sm"} text-gray-200 leading-relaxed`}>
          <TypewriterText
            text={displayMessage}
            id={messageKey}
            onComplete={() => { if (!showHint) setIntroComplete(true) }}
          />
        </p>
      </motion.div>
    </div>
  )
}
// --- END AI-MODIFIED ---
// --- END AI-REPLACED ---
