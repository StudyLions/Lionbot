// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pixel art styled seed selection for planting
// ============================================================
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"

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
    try { await onPlant(plotId, selectedSeed) }
    finally { setPlanting(false) }
  }

  const selected = seeds.find((s) => s.id === selectedSeed)

  return (
    <PixelCard className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">
          Choose Seed - Plot #{plotId + 1}
        </h3>
        <PixelButton variant="ghost" size="sm" onClick={onCancel}>Cancel</PixelButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {seeds.map((seed) => {
          const affordable = gold >= seed.plantCost
          const imgUrl = getFarmPlantImageUrl(seed.assetPrefix, seed.plantType, seed.typeId, 5)

          return (
            <button
              key={seed.id}
              onClick={() => affordable && setSelectedSeed(seed.id)}
              disabled={!affordable}
              className={cn(
                "relative p-2.5 border-2 text-left transition-all",
                selectedSeed === seed.id
                  ? "border-[var(--pet-green,#40d870)] bg-[#40d870]/8 shadow-[2px_2px_0_#060810]"
                  : affordable
                  ? "border-[var(--pet-border,#2a3a5c)] bg-[#0a0e1a] hover:border-[var(--pet-border-light,#3a4a6c)]"
                  : "border-[#1a2030] bg-[#0a0e1a] opacity-40 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                {imgUrl ? (
                  <img src={imgUrl} alt={seed.name} className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <span className="font-pixel text-lg text-[#40d870]/40">🌱</span>
                )}
                <p className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)] truncate w-full text-center">{seed.name}</p>
                <span className={cn(
                  "font-pixel text-[9px]",
                  affordable ? "text-[var(--pet-gold,#f0c040)]" : "text-[var(--pet-red,#e04040)]"
                )}>
                  {seed.plantCost}G
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <PixelCard className="flex items-center justify-between px-3 py-2 border-[var(--pet-green,#40d870)]/40">
          <div className="flex items-center gap-3 font-pixel">
            <span className="text-[11px] text-[var(--pet-text,#e2e8f0)]">{selected.name}</span>
            <span className="text-[9px] text-[var(--pet-text-dim,#8899aa)]">
              Harvest: {selected.harvestGold}G | {selected.growthPointsNeeded} pts | Water: {selected.waterIntervalHours}h
            </span>
          </div>
          <PixelButton variant="primary" size="sm" onClick={handlePlant} loading={planting}>
            Plant ({selected.plantCost}G)
          </PixelButton>
        </PixelCard>
      )}
    </PixelCard>
  )
}
