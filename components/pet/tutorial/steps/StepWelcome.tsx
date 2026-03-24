// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 0 -- Welcome hero with animated pet
//          demo, feature overview cards, and /pet command CTA
// ============================================================
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { ArrowRight, Heart, Swords, Sprout, Store } from "lucide-react"
import LeoMascot from "@/components/setup/LeoMascot"
import { getPetLeoMessage } from "../petLeoMessages"
import PixelCard from "@/components/pet/ui/PixelCard"

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ""
function blobUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

const FRAME_COUNT = 4
const FRAME_INTERVAL = 300
const GB_W = 260
const GB_H = 400
const GB_SCREEN_T = 36
const GB_SCREEN_L = 30
const GB_SCREEN_S = 200

const ROOM_LAYERS = [
  "rooms/castle/wall_1.png",
  "rooms/castle/floor_1.png",
  "rooms/castle/carpet_1.png",
  "rooms/castle/bed_1.png",
  "rooms/castle/chair_1.png",
  "rooms/castle/desk_1.png",
  "rooms/castle/lamp_1.png",
]

const LION_PARTS = ["body", "head", "hair"] as const

const features = [
  { icon: <Heart className="h-5 w-5" />, title: "Care & Nurture", description: "Feed, bathe, and rest your pet. Happy pets earn more gold!", accent: "text-rose-400" },
  { icon: <Swords className="h-5 w-5" />, title: "Collect Equipment", description: "Earn rare gear while studying. Hats, wings, boots, and more.", accent: "text-amber-400" },
  { icon: <Sprout className="h-5 w-5" />, title: "Grow a Farm", description: "Plant seeds, water daily, harvest crops for gold.", accent: "text-emerald-400" },
  { icon: <Store className="h-5 w-5" />, title: "Trade & Socialize", description: "Buy and sell items. Visit friends. Join a family.", accent: "text-cyan-400" },
]

function AnimatedPetDemo() {
  const [frame, setFrame] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesLoaded = useRef(false)
  const roomImgs = useRef<HTMLImageElement[]>([])
  const lionImgs = useRef<Record<string, HTMLImageElement[]>>({})
  const expressionImgs = useRef<HTMLImageElement[]>([])
  const gbFrame = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % FRAME_COUNT), FRAME_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (imagesLoaded.current) return
    imagesLoaded.current = true

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise(resolve => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = () => resolve(img)
        img.src = src
      })

    Promise.all([
      ...ROOM_LAYERS.map(l => loadImg(blobUrl(l))),
      ...LION_PARTS.flatMap(p => [1, 2, 3, 4].map(f => loadImg(blobUrl(`lion/${p}/${p}_${f}.png`)))),
      ...[1, 2, 3, 4].map(f => loadImg(blobUrl(`lion/expressions/happy/face_${f}.png`))),
      loadImg(blobUrl("gameboy/frames/gameboy-candy-01.png")),
    ]).then(imgs => {
      const roomCount = ROOM_LAYERS.length
      roomImgs.current = imgs.slice(0, roomCount)
      let idx = roomCount
      for (const p of LION_PARTS) {
        lionImgs.current[p] = imgs.slice(idx, idx + 4)
        idx += 4
      }
      expressionImgs.current = imgs.slice(idx, idx + 4)
      idx += 4
      gbFrame.current = imgs[idx]
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, GB_W, GB_H)

    for (const img of roomImgs.current) {
      if (img.complete && img.naturalWidth > 0)
        ctx.drawImage(img, GB_SCREEN_L, GB_SCREEN_T, GB_SCREEN_S, GB_SCREEN_S)
    }

    const petSize = 80
    const petX = GB_SCREEN_L + (GB_SCREEN_S - petSize) / 2
    const petY = GB_SCREEN_T + GB_SCREEN_S - petSize - 15
    for (const part of LION_PARTS) {
      const partImgs = lionImgs.current[part]
      if (partImgs?.[frame]?.complete && partImgs[frame].naturalWidth > 0)
        ctx.drawImage(partImgs[frame], petX, petY, petSize, petSize)
    }
    if (expressionImgs.current[frame]?.complete && expressionImgs.current[frame].naturalWidth > 0)
      ctx.drawImage(expressionImgs.current[frame], petX, petY, petSize, petSize)

    if (gbFrame.current?.complete && gbFrame.current.naturalWidth > 0)
      ctx.drawImage(gbFrame.current, 0, 0, GB_W, GB_H)
  }, [frame])

  return (
    <div className="relative" style={{ width: 280, maxWidth: "100%" }}>
      <canvas
        ref={canvasRef}
        width={GB_W}
        height={GB_H}
        className="w-full"
        style={{ imageRendering: "pixelated", height: "auto" }}
      />
    </div>
  )
}

interface StepWelcomeProps {
  onNext: () => void
  onSkipAll: () => void
}

export default function StepWelcome({ onNext, onSkipAll }: StepWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2"
      >
        <h1 className="font-pixel text-2xl sm:text-3xl lg:text-4xl text-[var(--pet-text,#e2e8f0)]">
          Welcome to <span className="text-[var(--pet-gold,#f0c040)]">LionGotchi</span>
        </h1>
        <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] max-w-lg mx-auto leading-relaxed">
          A virtual pet that grows alongside your study sessions.
          This tutorial will walk you through every feature.
        </p>
      </motion.div>

      <LeoMascot
        pose="waving"
        message={getPetLeoMessage("welcome", "intro")}
        hintMessage={getPetLeoMessage("welcome", "hint")}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <AnimatedPetDemo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <PixelCard className="p-3 h-full">
              <div className={`flex justify-center mb-2 ${f.accent}`}>{f.icon}</div>
              <h3 className={`font-pixel text-[11px] text-center ${f.accent}`}>{f.title}</h3>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] text-center mt-1 leading-relaxed">
                {f.description}
              </p>
            </PixelCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-[var(--pet-gold,#f0c040)] hover:bg-[var(--pet-gold,#f0c040)]/80 text-[var(--pet-bg,#0a0e1a)] font-pixel text-sm rounded transition-colors"
        >
          Start Tutorial
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkipAll}
          className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]/60 hover:text-[var(--pet-text-dim,#8899aa)] transition-colors"
        >
          Skip tutorial — I&apos;ll explore on my own
        </button>
      </motion.div>
    </motion.div>
  )
}
