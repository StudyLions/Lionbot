// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Interactive isometric farm scene with layered pixel
//          art rendering, hover tooltips, and click-to-select
// ============================================================
import { useState, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  getFarmBackgroundUrl,
  getFarmSoilUrl,
  getFarmPlantImageUrl,
  getFarmAnimationUrl,
  RARITY_GLOW,
} from "@/utils/petAssets"

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
  0: 0, 1: 12, 2: 18, 3: 24, 4: 30, 5: 36,
}

const STAGE_LABELS = ["", "Sprout", "Seedling", "Growing", "Budding", "Ready!"]

const RARITY_GLOW_CSS: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "drop-shadow(0 0 3px rgba(80,160,255,0.6))",
  RARE: "drop-shadow(0 0 4px rgba(255,60,60,0.7))",
  EPIC: "drop-shadow(0 0 5px rgba(255,215,0,0.8))",
  LEGENDARY: "drop-shadow(0 0 6px rgba(255,100,220,0.9)) drop-shadow(0 0 12px rgba(255,100,220,0.4))",
}

const RARITY_BORDER: Record<string, string> = {
  COMMON: "border-gray-500/30",
  UNCOMMON: "border-blue-400/50",
  RARE: "border-red-400/50",
  EPIC: "border-yellow-400/60",
  LEGENDARY: "border-pink-400/60",
}

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
  nextWaterAt: string | null
  estimatedSecondsRemaining: number | null
  plantedAt: string | null
  lastWatered: string | null
}

interface FarmSceneProps {
  plots: FarmPlot[]
  selectedPlot: number | null
  onSelectPlot: (plotId: number) => void
}

function formatTimer(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return ""
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h${Math.floor((seconds % 3600) / 60)}m`
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
  return (
    <span className="text-[6px] text-blue-300 whitespace-nowrap font-mono">
      {formatTimer(remaining)}
    </span>
  )
}

export default function FarmScene({ plots, selectedPlot, onSelectPlot }: FarmSceneProps) {
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative select-none"
        style={{
          width: SCENE_W * 3,
          height: SCENE_H * 3,
        }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: SCENE_W,
            height: SCENE_H,
            transform: "scale(3)",
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

          {/* Layer 2: Soil overlays */}
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

          {/* Layer 3: Plants */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || plot.empty || !plot.assetPrefix || plot.stage < 1) return null
            if (plot.dead) return null

            const h = STAGE_HEIGHTS[plot.stage] || 20
            const imgUrl = getFarmPlantImageUrl(
              plot.assetPrefix, plot.plantType || "tree",
              plot.typeId || 1, plot.stage, plot.rarity
            )
            if (!imgUrl) return null

            const isReady = plot.readyToHarvest
            const swayClass = plot.stage >= 2 ? "animate-sway" : ""
            const glowFilter = RARITY_GLOW_CSS[plot.rarity] || ""

            return (
              <img
                key={`plant-${plotNum}`}
                src={imgUrl}
                alt={plot.seed?.name || "Plant"}
                className={cn("absolute", swayClass, isReady && "animate-harvest-pulse")}
                style={{
                  left: cx - Math.round(h * 0.8) / 2,
                  top: cy - h + 2,
                  height: h,
                  width: "auto",
                  imageRendering: "pixelated",
                  filter: glowFilter || undefined,
                  zIndex: cy,
                }}
                draggable={false}
              />
            )
          })}

          {/* Layer 4: Dead skulls */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || !plot.dead) return null

            return (
              <img
                key={`skull-${plotNum}`}
                src={getFarmAnimationUrl("skull", 1)}
                alt="Dead"
                className="absolute animate-bob"
                style={{
                  left: cx - 6,
                  top: cy - 18,
                  width: 12,
                  height: 12,
                  imageRendering: "pixelated",
                  zIndex: cy + 1,
                }}
                draggable={false}
              />
            )
          })}

          {/* Layer 5: Harvest sparkles */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            if (!plot || !plot.readyToHarvest || plot.dead) return null

            return (
              <img
                key={`sparkle-${plotNum}`}
                src={getFarmAnimationUrl("sparkle", 1)}
                alt=""
                className="absolute animate-sparkle"
                style={{
                  left: cx - 8,
                  top: cy - (STAGE_HEIGHTS[5] || 36) - 6,
                  width: 16,
                  height: 10,
                  imageRendering: "pixelated",
                  zIndex: cy + 2,
                }}
                draggable={false}
              />
            )
          })}

          {/* Layer 6: Interaction zones */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            const isSelected = selectedPlot === plotNum
            const isHovered = hoveredPlot === plotNum

            return (
              <div
                key={`zone-${plotNum}`}
                className={cn(
                  "absolute cursor-pointer transition-all duration-150",
                  "rounded-sm border border-transparent",
                  isSelected && "border-amber-400/80 bg-amber-400/10",
                  isHovered && !isSelected && "border-white/40 bg-white/5",
                )}
                style={{
                  left: cx - 14,
                  top: cy - 30,
                  width: 28,
                  height: 34,
                  zIndex: 200 + plotNum,
                }}
                onClick={() => onSelectPlot(plotNum)}
                onMouseEnter={() => setHoveredPlot(plotNum)}
                onMouseLeave={() => setHoveredPlot(null)}
              />
            )
          })}

          {/* Layer 7: Floating labels */}
          {Object.entries(PLOT_CENTERS).map(([key, [cx, cy]]) => {
            const plotNum = Number(key)
            const plot = plotMap[plotNum]
            const isHovered = hoveredPlot === plotNum || selectedPlot === plotNum
            if (!isHovered || !plot) return null

            return (
              <div
                key={`label-${plotNum}`}
                className="absolute pointer-events-none"
                style={{
                  left: cx,
                  top: cy - 42,
                  transform: "translateX(-50%)",
                  zIndex: 300,
                }}
              >
                <div className="bg-black/80 rounded px-1 py-0.5 text-center whitespace-nowrap">
                  {plot.empty ? (
                    <span className="text-[6px] text-gray-400">Empty Plot</span>
                  ) : plot.dead ? (
                    <span className="text-[6px] text-red-400">Dead</span>
                  ) : (
                    <div className="flex flex-col items-center gap-0">
                      <span className={cn(
                        "text-[6px] font-bold",
                        plot.rarity === "LEGENDARY" ? "text-pink-400" :
                        plot.rarity === "EPIC" ? "text-yellow-400" :
                        plot.rarity === "RARE" ? "text-red-400" :
                        plot.rarity === "UNCOMMON" ? "text-blue-400" :
                        "text-white"
                      )}>
                        {plot.seed?.name}
                      </span>
                      <span className="text-[5px] text-emerald-400">
                        {STAGE_LABELS[plot.stage]} ({plot.progress}%)
                      </span>
                      {plot.needsWater && (
                        <span className="text-[5px] text-blue-400">Needs water!</span>
                      )}
                      {!plot.needsWater && !plot.readyToHarvest && plot.nextWaterAt && (
                        <WaterTimer nextWaterAt={plot.nextWaterAt} />
                      )}
                      {plot.readyToHarvest && (
                        <span className="text-[5px] text-amber-400">Ready to harvest!</span>
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
