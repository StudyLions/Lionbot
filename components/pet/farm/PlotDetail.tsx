// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Plot detail panel with actions (water/harvest/plant/clear)
// ============================================================
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl, RARITY_COLORS, RARITY_BG_COLORS } from "@/utils/petAssets"
import { Droplets, Scissors, Trash2, Sprout, Loader2, Coins } from "lucide-react"
import type { FarmPlot } from "./FarmScene"

interface PlotDetailProps {
  plot: FarmPlot
  onAction: (plotId: number, action: string) => Promise<void>
  onPlantClick: () => void
}

function LiveTimer({ nextWaterAt }: { nextWaterAt: string | null }) {
  const [text, setText] = useState("")

  useEffect(() => {
    if (!nextWaterAt) { setText(""); return }
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(nextWaterAt).getTime() - Date.now()) / 1000))
      if (diff <= 0) { setText("Now!"); return }
      const m = Math.floor(diff / 60)
      const s = diff % 60
      setText(`${m}:${String(s).padStart(2, "0")}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [nextWaterAt])

  if (!text) return null
  return <span className="text-xs text-blue-400 font-mono">{text}</span>
}

export default function PlotDetail({ plot, onAction, onPlantClick }: PlotDetailProps) {
  const [acting, setActing] = useState(false)

  async function handle(action: string) {
    setActing(true)
    try { await onAction(plot.plotId, action) }
    finally { setActing(false) }
  }

  const imgUrl = plot.assetPrefix && plot.plantType && plot.typeId
    ? getFarmPlantImageUrl(plot.assetPrefix, plot.plantType, plot.typeId, plot.stage, plot.rarity)
    : null

  return (
    <div className={cn(
      "bg-gray-800/50 border rounded-xl p-4 transition-all",
      RARITY_BG_COLORS[plot.rarity] || "border-gray-700/30"
    )}>
      <div className="flex items-start gap-4">
        {/* Plant preview */}
        <div className="w-16 h-16 rounded-lg bg-gray-900/50 flex items-center justify-center flex-shrink-0 border border-gray-700/30">
          {plot.empty ? (
            <Sprout size={24} className="text-gray-600" />
          ) : plot.dead ? (
            <span className="text-2xl">💀</span>
          ) : imgUrl ? (
            <img
              src={imgUrl}
              alt={plot.seed?.name || "Plant"}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <Sprout size={24} className="text-emerald-500/40" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">
              Plot #{plot.plotId + 1}
            </h3>
            {!plot.empty && !plot.dead && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                RARITY_COLORS[plot.rarity] || "text-gray-400",
                "bg-gray-900/50"
              )}>
                {plot.rarity}
              </span>
            )}
          </div>

          {plot.empty ? (
            <p className="text-xs text-gray-500">Empty plot -- plant a seed!</p>
          ) : plot.dead ? (
            <p className="text-xs text-red-400">This plant has died. Clear it to plant again.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-300">{plot.seed?.name}</p>

              {/* Growth bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-900/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      plot.readyToHarvest ? "bg-amber-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${plot.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 w-8 text-right">
                  {plot.progress}%
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                <span>Stage {plot.stage}/5</span>
                <span>{Math.round(plot.growthPoints)}/{plot.growthPointsNeeded} pts</span>
                {plot.needsWater ? (
                  <span className="text-blue-400 font-medium">Needs water!</span>
                ) : plot.nextWaterAt ? (
                  <span className="flex items-center gap-1">
                    <Droplets size={10} className="text-blue-400" />
                    Next water in <LiveTimer nextWaterAt={plot.nextWaterAt} />
                  </span>
                ) : null}
                {plot.readyToHarvest && plot.seed && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Coins size={10} />
                    +{plot.seed.harvestGold}G
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {plot.empty && (
            <button
              onClick={onPlantClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            >
              <Sprout size={12} /> Plant
            </button>
          )}
          {!plot.empty && plot.needsWater && !plot.dead && (
            <button
              onClick={() => handle("water")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {acting ? <Loader2 size={12} className="animate-spin" /> : <Droplets size={12} />}
              Water
            </button>
          )}
          {plot.readyToHarvest && !plot.dead && (
            <button
              onClick={() => handle("harvest")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {acting ? <Loader2 size={12} className="animate-spin" /> : <Scissors size={12} />}
              Harvest
            </button>
          )}
          {plot.dead && (
            <button
              onClick={() => handle("clear")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {acting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
