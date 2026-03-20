// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Rich showcase component for authenticated users without
//          a pet. Replaces the dead-end "No pet yet!" card with an
//          animated demo, feature highlights, and how-to guide.
// ============================================================
import { useEffect, useRef, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Swords, Sprout, Home, Store, Heart, Sparkles, ArrowRight } from "lucide-react"
import PixelCard from "./ui/PixelCard"

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ""
function blobUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const FRAME_COUNT = 4
const FRAME_INTERVAL = 300
const GB_W = 260
const GB_H = 400
const GB_SCREEN_T = 36
const GB_SCREEN_L = 30
const GB_SCREEN_S = 200
const DISPLAY_W = 340

const ROOM_LAYERS: { path: string }[] = [
  { path: "rooms/castle/wall_1.png" },
  { path: "rooms/castle/floor_1.png" },
  { path: "rooms/castle/carpet_1.png" },
  { path: "rooms/castle/bed_1.png" },
  { path: "rooms/castle/chair_1.png" },
  { path: "rooms/castle/desk_1.png" },
  { path: "rooms/castle/lamp_1.png" },
]

const LION_PARTS = ["body", "head", "hair"] as const

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
  glow: string
}

const features: FeatureItem[] = [
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Adopt & Care",
    description: "Feed, bathe, and rest your pet. Happy pets earn more gold and XP!",
    accent: "text-rose-400",
    glow: "border-rose-500/30",
  },
  {
    icon: <Swords className="h-5 w-5" />,
    title: "Equipment Drops",
    description: "Earn rare gear while studying. Enhance with scrolls for powerful bonuses.",
    accent: "text-amber-400",
    glow: "border-amber-500/30",
  },
  {
    icon: <Sprout className="h-5 w-5" />,
    title: "Grow a Farm",
    description: "Plant seeds, water daily, and harvest crops for gold and bonus drops.",
    accent: "text-emerald-400",
    glow: "border-emerald-500/30",
  },
  {
    icon: <Store className="h-5 w-5" />,
    title: "Trade & Collect",
    description: "Browse the marketplace. Buy and sell items with other students.",
    accent: "text-cyan-400",
    glow: "border-cyan-500/30",
  },
]

const steps = [
  { num: "1", text: "Join any Discord server with LionBot" },
  { num: "2", text: 'Type /pet in any text channel' },
  { num: "3", text: "Name your pet and start earning!" },
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
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % FRAME_COUNT)
    }, FRAME_INTERVAL)
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
      ...ROOM_LAYERS.map(l => loadImg(blobUrl(l.path))),
      ...LION_PARTS.flatMap(p =>
        [1, 2, 3, 4].map(f => loadImg(blobUrl(`lion/${p}/${p}_${f}.png`)))
      ),
      ...[1, 2, 3, 4].map(f => loadImg(blobUrl(`lion/expressions/happy/face_${f}.png`))),
      loadImg(blobUrl("gameboy/frames/gameboy-candy-01.png")),
      loadImg(blobUrl("equipment/hats/crown.png")),
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
      if (partImgs && partImgs[frame]?.complete && partImgs[frame].naturalWidth > 0)
        ctx.drawImage(partImgs[frame], petX, petY, petSize, petSize)
    }
    if (expressionImgs.current[frame]?.complete && expressionImgs.current[frame].naturalWidth > 0)
      ctx.drawImage(expressionImgs.current[frame], petX, petY, petSize, petSize)

    if (gbFrame.current?.complete && gbFrame.current.naturalWidth > 0)
      ctx.drawImage(gbFrame.current, 0, 0, GB_W, GB_H)
  }, [frame])

  return (
    <div className="relative" style={{ width: DISPLAY_W }}>
      <canvas
        ref={canvasRef}
        width={GB_W}
        height={GB_H}
        className="w-full"
        style={{ imageRendering: "pixelated", height: "auto" }}
      />
      <div className="absolute -bottom-2 -right-3 flex gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="inline-block w-2 h-2 bg-amber-400/60 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  )
}

export default function NoPetShowcase() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Hero */}
      <motion.div variants={fadeUp} custom={0}>
        <PixelCard className="p-6 sm:p-8 overflow-hidden" corners>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left: animated pet demo */}
            <div className="shrink-0">
              <AnimatedPetDemo />
            </div>
            {/* Right: headline + CTA */}
            <div className="text-center lg:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-pixel text-[11px] text-amber-400 tracking-wide">NEW FEATURE</span>
              </div>
              <h2 className="font-pixel text-2xl sm:text-3xl text-[var(--pet-text,#e2e8f0)] leading-tight">
                Meet Your LionGotchi
              </h2>
              <p className="font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)] max-w-md leading-relaxed">
                A virtual pet that grows alongside your study sessions.
                Earn equipment, grow a farm, customize your room, and trade
                with other students — all while you study!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-pixel text-sm">
                  <ArrowRight className="h-4 w-4" />
                  Type /pet in Discord to adopt!
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </motion.div>

      {/* Feature grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((f, i) => (
          <motion.div key={f.title} variants={fadeUp} custom={i + 1}>
            <PixelCard className={`p-4 h-full hover:${f.glow} transition-colors duration-300`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-9 h-9 flex items-center justify-center rounded bg-[var(--pet-card,#0f1628)] border border-[var(--pet-border,#2a3a5c)] ${f.accent}`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className={`font-pixel text-sm ${f.accent}`}>{f.title}</h3>
                  <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            </PixelCard>
          </motion.div>
        ))}
      </motion.div>

      {/* How to get started */}
      <motion.div variants={fadeUp} custom={5}>
        <PixelCard className="p-6" corners>
          <h3 className="font-pixel text-base text-[var(--pet-text,#e2e8f0)] mb-4">
            How to Get Started
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {steps.map((s, i) => (
              <div key={i} className="flex-1 flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-amber-500/20 border border-amber-500/30 font-pixel text-sm text-amber-400">
                  {s.num}
                </span>
                <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed pt-1">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--pet-border,#2a3a5c)]">
            <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] text-center">
              LionGotchi is free for everyone. Your pet earns rewards passively while you study!
            </p>
          </div>
        </PixelCard>
      </motion.div>
    </motion.div>
  )
}
