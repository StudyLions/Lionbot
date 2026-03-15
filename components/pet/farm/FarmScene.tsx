// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Interactive isometric farm scene with layered pixel
//          art, atmospheric effects, plant animations, tooltips
// ============================================================
import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  getFarmBackgroundUrl,
  getFarmSoilUrl,
  getFarmPlantImageUrl,
  getFarmAnimationUrl,
  getUiIconUrl,
} from "@/utils/petAssets"
import PixelTooltip from "@/components/pet/ui/PixelTooltip"
import PixelBadge from "@/components/pet/ui/PixelBadge"

const SCENE_W = 200
const SCENE_H = 200

const PLOT_CENTERS: Record<number, [number, number]> = {
  0: [40, 138], 1: [32, 154], 2: [22, 174],
  3: [71, 138], 4: [66, 154], 5: [60, 174],
  6: [100, 138], 7: [100, 154], 8: [100, 174],
  9: [128, 138], 10: [132, 154], 11: [139, 174],
  12: [158, 138], 13: [166, 154], 14: [176, 174],
}

const STAGE_HEIGHTS: Record<number, number> = {
  0: 0, 1: 16, 2: 22, 3: 28, 4: 34, 5: 42,
}

const STAGE_LABELS = ["", "Sprout", "Seedling", "Growing", "Budding", "Harvest!"]

const RARITY_GLOW_CSS: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "drop-shadow(0 0 3px rgba(64,128,240,0.6))",
  RARE: "drop-shadow(0 0 4px rgba(224,64,64,0.7))",
  EPIC: "drop-shadow(0 0 5px rgba(240,192,64,0.8))",
  LEGENDARY: "drop-shadow(0 0 6px rgba(208,96,240,0.9)) drop-shadow(0 0 12px rgba(208,96,240,0.4))",
}

const LEAF_PARTICLES = [
  { x: 18, y: 35 }, { x: 72, y: 28 }, { x: 145, y: 42 },
  { x: 55, y: 70 }, { x: 118, y: 52 }, { x: 35, y: 95 }, { x: 160, y: 85 },
]
const FIREFLY_POSITIONS = [
  { x: 28, y: 55 }, { x: 85, y: 40 }, { x: 155, y: 65 },
  { x: 65, y: 85 }, { x: 125, y: 48 }, { x: 40, y: 110 }, { x: 170, y: 100 },
]
const LEAF_COLORS = ["#6eaa3c", "#a0be32", "#829246", "#b4a028"]

export interface FarmPlot {
  plotId: number
  empty: boolean
  dead: boolean
  seed: {
    id: number; name: string; plantType: string; harvestGold: number
    growTimeHours: number; waterIntervalHours: number; growthPointsNeeded: number
  } | null
  stage: number
  progress: number
  readyToHarvest: boolean
  needsWater: boolean
  isWatered: boolean
  rarity: string
  growthPoints: number
  growthPointsNeeded: number
  goldInvested: number
  assetPrefix: string | null
  plantType: string | null
  typeId: number | null
  voiceMinutesEarned?: number
  messagesEarned?: number
  nextWaterAt: string | null
  estimatedSecondsRemaining: number | null
  plantedAt: string | null
  lastWatered: string | null
}

interface FarmSceneProps {
  plots: FarmPlot[]
  selectedPlot: number | null
  onSelectPlot: (plotId: number) => void
  justWatered?: boolean
  isFullscreen?: boolean
}

function WaterTimer({ nextWaterAt }: { nextWaterAt: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!nextWaterAt) { setRemaining(null); return }
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(nextWaterAt).getTime() - Date.now()) / 1000))
      setRemaining(diff)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [nextWaterAt])

  if (remaining === null || remaining <= 0) return null
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  return <span className="text-[6px] text-[#4080f0]">{m}:{String(s).padStart(2, "0")}</span>
}

export default function FarmScene({ plots, selectedPlot, onSelectPlot, justWatered, isFullscreen }: FarmSceneProps) {
  const isNight = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 6 || hour >= 20
  }, [])

  const [hoveredPlot, setHoveredPlot] = useState<number | null>(null)

  const plotMap = useMemo(() => {
    const map: Record<number, FarmPlot> = {}
    plots.forEach((p) => { map[p.plotId] = p })
    return map
  }, [plots])

  const scale = isFullscreen ? 4 : 4

  const handlePlotClick = useCallback((plotId: number) => {
    onSelectPlot(plotId)
  }, [onSelectPlot])

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative select-none overflow-hidden"
        style={{ width: SCENE_W * scale, height: SCENE_H * scale }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: SCENE_W,
            height: SCENE_H,
            transform: `scale(${scale})`,
            imageRendering: "pixelated" as any,
          }}
        >
          {/* Layer 1: Background */}
          <img
            src={getFarmBackgroundUrl(isNight)}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />

          {/* Layer 2: Atmospheric particles */}
          {!isNight && LEAF_PARTICLES.map((leaf, i) => (
            <div
              key={`leaf-${i}`}
              className="absolute animate-drift"
              style={{
                left: leaf.x,
                top: leaf.y,
                width: 3,
                height: 2,
                backgroundColor: LEAF_COLORS[i % LEAF_COLORS.length],
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${6 + (i % 3) * 2}s`,
                zIndex: 5,
              }}
            />
          ))}
          {isNight && FIREFLY_POSITIONS.map((ff, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute animate-firefly"
              style={{
                left: ff.x,
                top: ff.y,
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,120,0.9)",
                boxShadow: "0 0 4px 2px rgba(255,255,100,0.3)",
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + (i % 3)}s`,
                zIndex: 5,
              }}
            />
          ))}

          {/* Layer 3: Soil overlays */}
          {Object.keys(PLOT_CENTERS).map((key) => {
            const plotNum = Number(key)
            const plotData = plotMap[plotNum]
            const watered = plotData?.isWatered ?? false
            return (
              <img
                key={`soil-${plotNum}`}
                src={getFarmSoilUrl(plotNum + 1, watered)}
                alt=""
                className="absolute inset-0 w-full h-full"
                style={{ imageRendering: "pixelated" }}
                draggable={false}
              />
            )
          })}

          {/* Layer 3b: Water shimmer on watered plots */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || plot.empty || !plot.isWatered || plot.dead) return null
            return (
              <div
                key={`shimmer-${plotNum}`}
                className="absolute animate-shimmer"
                style={{
                  left: cx - 7,
                  top: cy - 1,
                  width: 14,
                  height: 4,
                  backgroundColor: "rgba(100,170,255,0.25)",
                  zIndex: 10,
                  animationDelay: `${plotNum * 0.2}s`,
                }}
              />
            )
          })}

          {/* Layer 4: Plants */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || plot.empty || !plot.assetPrefix || plot.stage < 1 || plot.dead) return null

            const h = STAGE_HEIGHTS[plot.stage] || 20
            const imgUrl = getFarmPlantImageUrl(
              plot.assetPrefix, plot.plantType || "tree",
              plot.typeId || 1, plot.stage, plot.rarity
            )
            if (!imgUrl) return null

            const swayClass = plot.stage >= 4 ? "animate-sway-fast" : plot.stage >= 2 ? "animate-sway-slow" : ""
            const glowFilter = RARITY_GLOW_CSS[plot.rarity] || ""
            const hasGlow = plot.rarity !== "COMMON" && plot.stage >= 2

            return (
              <img
                key={`plant-${plotNum}`}
                src={imgUrl}
                alt={plot.seed?.name || "Plant"}
                className={cn("absolute", swayClass, plot.readyToHarvest && "animate-harvest-pulse")}
                style={{
                  left: cx - Math.round(h * 0.8) / 2,
                  top: cy - h + 2,
                  height: h,
                  width: "auto",
                  imageRendering: "pixelated",
                  filter: glowFilter || undefined,
                  zIndex: cy,
                  animationDelay: `${plotNum * 0.3}s`,
                  ...(hasGlow ? { ["--glow-color" as string]: plot.rarity === "LEGENDARY" ? "#d060f0" : plot.rarity === "EPIC" ? "#f0c040" : plot.rarity === "RARE" ? "#e04040" : "#4080f0" } : {}),
                }}
                draggable={false}
              />
            )
          })}

          {/* Layer 5: Harvest effects (sparkles + coins) */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || !plot.readyToHarvest || plot.dead) return null
            const h = STAGE_HEIGHTS[5] || 42

            return (
              <div key={`harvest-fx-${plotNum}`}>
                <img
                  src={getFarmAnimationUrl("sparkle", ((plotNum % 3) + 1))}
                  alt=""
                  className="absolute animate-sparkle"
                  style={{
                    left: cx - 10,
                    top: cy - h - 6,
                    width: 20,
                    height: 12,
                    imageRendering: "pixelated",
                    zIndex: cy + 2,
                    animationDelay: `${plotNum * 0.2}s`,
                  }}
                  draggable={false}
                />
                <img
                  src={getUiIconUrl("coin")}
                  alt=""
                  className="absolute animate-coin-bob"
                  style={{
                    left: cx + 6,
                    top: cy - h - 12,
                    width: 8,
                    height: 8,
                    imageRendering: "pixelated",
                    zIndex: cy + 3,
                    animationDelay: `${plotNum * 0.4}s`,
                  }}
                  draggable={false}
                />
              </div>
            )
          })}

          {/* Layer 6: Dead skulls */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || !plot.dead) return null
            return (
              <img
                key={`skull-${plotNum}`}
                src={getFarmAnimationUrl("skull", ((plotNum % 5) + 1))}
                alt="Dead"
                className="absolute animate-bob"
                style={{
                  left: cx - 8,
                  top: cy - 22,
                  width: 16,
                  height: 16,
                  imageRendering: "pixelated",
                  zIndex: cy + 1,
                  animationDelay: `${plotNum * 0.5}s`,
                }}
                draggable={false}
              />
            )
          })}

          {/* Layer 7: Rain drops (just watered) */}
          {justWatered && Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || plot.empty || plot.dead) return null
            return [-4, 3, -1, 5].map((dx, i) => (
              <div
                key={`rain-${plotNum}-${i}`}
                className="absolute animate-rain"
                style={{
                  left: cx + dx,
                  top: cy - 28 + i * 3,
                  width: 1,
                  height: 4,
                  backgroundColor: "rgba(100,160,255,0.8)",
                  zIndex: cy + 5,
                  animationDelay: `${i * 0.15 + plotNum * 0.1}s`,
                }}
              />
            ))
          })}

          {/* Layer 8: Interaction zones */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const isSelected = selectedPlot === plotNum
            const isHovered = hoveredPlot === plotNum

            return (
              <div
                key={`zone-${plotNum}`}
                className={cn(
                  "absolute cursor-pointer transition-all duration-100",
                  isSelected && "outline outline-2 outline-[#f0c040] bg-[#f0c040]/10",
                  isHovered && !isSelected && "outline outline-1 outline-[#4080f0]/60 bg-[#4080f0]/5",
                )}
                style={{
                  left: cx - 14,
                  top: cy - 34,
                  width: 28,
                  height: 38,
                  zIndex: 200 + plotNum,
                }}
                onClick={() => handlePlotClick(plotNum)}
                onMouseEnter={() => setHoveredPlot(plotNum)}
                onMouseLeave={() => setHoveredPlot(null)}
              />
            )
          })}

          {/* Layer 9: Floating pixel tooltips */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            const show = hoveredPlot === plotNum || selectedPlot === plotNum
            if (!show || !plot) return null

            return (
              <div
                key={`tip-${plotNum}`}
                className="absolute pointer-events-none"
                style={{
                  left: cx,
                  top: cy - 46,
                  transform: "translateX(-50%)",
                  zIndex: 300,
                }}
              >
                <div className="bg-[#0a0e1a]/95 border border-[#4080f0] px-1.5 py-0.5 font-pixel text-center whitespace-nowrap">
                  {plot.empty ? (
                    <span className="text-[5px] text-[#6a7a8a]">Empty Plot</span>
                  ) : plot.dead ? (
                    <span className="text-[5px] text-[#e04040]">Dead</span>
                  ) : (
                    <div className="flex flex-col items-center gap-0">
                      <span className={cn(
                        "text-[5px] font-bold",
                        plot.rarity === "LEGENDARY" ? "text-[#e0a0ff]" :
                        plot.rarity === "EPIC" ? "text-[#ffe080]" :
                        plot.rarity === "RARE" ? "text-[#ff8080]" :
                        plot.rarity === "UNCOMMON" ? "text-[#80b0ff]" :
                        "text-[#e2e8f0]"
                      )}>
                        {plot.seed?.name}
                      </span>
                      <span className="text-[4px] text-[#40d870]">
                        {STAGE_LABELS[plot.stage]} {plot.progress}%
                      </span>
                      {plot.needsWater && (
                        <span className="text-[4px] text-[#4080f0]">Needs water!</span>
                      )}
                      {!plot.needsWater && !plot.readyToHarvest && plot.nextWaterAt && (
                        <WaterTimer nextWaterAt={plot.nextWaterAt} />
                      )}
                      {plot.readyToHarvest && (
                        <span className="text-[4px] text-[#f0c040]">HARVEST!</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
