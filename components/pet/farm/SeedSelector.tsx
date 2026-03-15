// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Seed selection panel for planting on empty farm plots
// ============================================================
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl } from "@/utils/petAssets"
import { Coins, Clock, Droplets, Sprout, Loader2 } from "lucide-react"

interface Seed {
  id: number
  name: string
  plantType: string
  growTimeHours: number
  waterIntervalHours: number
  harvestGold: number
  plantCost: number
  growthPointsNeeded: number
  assetPrefix: string
  typeId: number
}

interface SeedSelectorProps {
  seeds: Seed[]
  gold: number
  plotId: number
  onPlant: (plotId: number, seedId: number) => Promise<void>
  onCancel: () => void
}

export default function SeedSelector({ seeds, gold, plotId, onPlant, onCancel }: SeedSelectorProps) {
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null)
  const [planting, setPlanting] = useState(false)

  async function handlePlant() {
    if (!selectedSeed || planting) return
    setPlanting(true)
    try {
      await onPlant(plotId, selectedSeed)
    } finally {
      setPlanting(false)
    }
  }

  const selected = seeds.find((s) => s.id === selectedSeed)

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sprout size={16} className="text-emerald-400" />
          Choose a Seed for Plot #{plotId + 1}
        </h3>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {seeds.map((seed) => {
          const affordable = gold >= seed.plantCost
          const imgUrl = getFarmPlantImageUrl(
            seed.assetPrefix, seed.plantType, seed.typeId, 5
          )

          return (
            <button
              key={seed.id}
              onClick={() => affordable && setSelectedSeed(seed.id)}
              disabled={!affordable}
              className={cn(
                "relative p-3 rounded-lg border text-left transition-all",
                selectedSeed === seed.id
                  ? "border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/30"
                  : affordable
                  ? "border-gray-700/50 bg-gray-800/30 hover:border-gray-600/60 hover:bg-gray-700/30"
                  : "border-gray-800/30 bg-gray-900/30 opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={seed.name}
                    className="w-10 h-10 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <Sprout size={24} className="text-emerald-500/40" />
                )}
                <div className="text-center">
                  <p className="text-xs font-medium text-white truncate w-full">{seed.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Coins size={10} className="text-amber-400" />
                    <span className={cn(
                      "text-[10px] font-bold",
                      affordable ? "text-amber-400" : "text-red-400"
                    )}>
                      {seed.plantCost}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="text-sm text-white font-medium">{selected.name}</div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Coins size={10} className="text-amber-400" />
                Harvest: {selected.harvestGold}G
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {selected.growthPointsNeeded} pts
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={10} className="text-blue-400" />
                Every {selected.waterIntervalHours}h
              </span>
            </div>
          </div>
          <button
            onClick={handlePlant}
            disabled={planting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {planting ? <Loader2 size={14} className="animate-spin" /> : `Plant (${selected.plantCost}G)`}
          </button>
        </div>
      )}
    </div>
  )
}
