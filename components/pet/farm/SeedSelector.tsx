// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: RPG shop-style seed selection for planting
// ============================================================
// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Show estimated voice-chat hours and nominal grow time on each
//          seed card and in the purchase summary, so users know how long
//          a sprout will take to grow before they spend gold on it.
// --- END AI-MODIFIED ---
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl } from "@/utils/petAssets"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Convert growth points needed into approximate Discord voice-chat
//          hours (1 growth point per voice minute -> 60 points per hour).
function formatVoiceHours(growthPointsNeeded: number): string {
  if (!growthPointsNeeded || growthPointsNeeded <= 0) return "?"
  const hours = growthPointsNeeded / 60
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60))
    return `${minutes}m`
  }
  if (hours < 10) {
    return `${(Math.round(hours * 10) / 10).toFixed(1)}h`
  }
  return `${Math.round(hours)}h`
}
// --- END AI-MODIFIED ---

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
    <div
      className="border-[3px] border-[#40d870] p-[3px]"
      style={{ boxShadow: "3px 3px 0 #060810" }}
    >
      <div className="border-2 border-[#40d870]/30 bg-[#0c1020]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a3020] border-b-2 border-[#40d870]/30">
          <span className="font-pixel text-sm text-[#40d870]">
            SEED SHOP - Plot #{plotId + 1}
          </span>
          <div className="flex items-center gap-3">
            <GoldDisplay amount={gold} size="sm" />
            <PixelButton variant="ghost" size="sm" onClick={onCancel}>X</PixelButton>
          </div>
        </div>

        {/* Seed grid */}
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {seeds.map((seed) => {
            const affordable = gold >= seed.plantCost
            const isSelected = selectedSeed === seed.id
            const imgUrl = getFarmPlantImageUrl(seed.assetPrefix, seed.plantType, seed.typeId, 5)

            return (
              <button
                key={seed.id}
                onClick={() => affordable && setSelectedSeed(seed.id)}
                disabled={!affordable}
                className={cn(
                  "relative p-3 border-2 text-left transition-all",
                  isSelected
                    ? "border-[#f0c040] bg-[#f0c040]/6 animate-harvest-pulse"
                    : affordable
                    ? "border-[#2a3a5c] bg-[#0a0e1a] hover:border-[#3a4a6c] hover:bg-[#101828]"
                    : "border-[#1a2030] bg-[#0a0e1a] opacity-30 cursor-not-allowed"
                )}
                style={isSelected ? { boxShadow: "0 0 8px rgba(240,192,64,0.2)" } : undefined}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#080c18] border border-[#1a2a3c]">
                    {imgUrl ? (
                      <img src={imgUrl} alt={seed.name} className="w-11 h-11 object-contain"
                        style={{ imageRendering: "pixelated" }} />
                    ) : (
                      <span className="font-pixel text-xl text-[#40d870]/20">?</span>
                    )}
                  </div>
                  <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate w-full text-center">
                    {seed.name}
                  </p>
                  <GoldDisplay amount={seed.plantCost} size="sm"
                    className={affordable ? "" : "!text-[var(--pet-red,#e04040)]"} />
                  {/* --- AI-MODIFIED (2026-04-23) --- */}
                  {/* Purpose: Approx. voice-chat hours needed to grow this seed */}
                  <span
                    className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] w-full text-center"
                    title={`Approx ${formatVoiceHours(seed.growthPointsNeeded)} of Discord voice chat (or about ${seed.growTimeHours}h nominal)`}
                  >
                    {"\u23F1"} ~{formatVoiceHours(seed.growthPointsNeeded)} voice
                  </span>
                  {/* --- END AI-MODIFIED --- */}
                </div>
              </button>
            )
          })}
        </div>

        {/* --- AI-MODIFIED (2026-03-16) --- */}
        {/* Purpose: Purchase summary with stage previews */}
        {selected && (
          <div className="border-t-2 border-[#2a3a5c] bg-[#111a28]">
            <div className="flex items-center gap-1 px-4 pt-2.5">
              {[1, 2, 3, 4, 5].map(stage => {
                const previewUrl = getFarmPlantImageUrl(selected.assetPrefix, selected.plantType, selected.typeId, stage)
                return previewUrl ? (
                  <div key={stage} className="flex flex-col items-center gap-0.5">
                    <img src={previewUrl} alt={`Stage ${stage}`}
                      className="w-8 h-8 object-contain" style={{ imageRendering: "pixelated" }} />
                    <span className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">{stage}</span>
                  </div>
                ) : null
              })}
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              {/* --- AI-MODIFIED (2026-03-21) --- */}
              {/* Purpose: Add flex-wrap so purchase summary wraps on narrow screens */}
              {/* --- AI-MODIFIED (2026-04-23) --- */}
              {/* Purpose: Add grow-time stat (voice hours + nominal hours) so users
                  know how long the sprout will take before they spend gold */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap font-pixel text-[13px] text-[var(--pet-text-dim,#8899aa)]">
                <span className="text-[var(--pet-text,#e2e8f0)]">{selected.name}</span>
                <span>Harvest: <GoldDisplay amount={selected.harvestGold} size="sm" /></span>
                <span
                  className="text-[var(--pet-blue,#4080f0)]"
                  title={`Earned through Discord activity. Each voice minute = 1 growth point, each text message = 2 growth points. Total ${selected.growthPointsNeeded} points needed (~${selected.growTimeHours}h nominal).`}
                >
                  {"\u23F1"} ~{formatVoiceHours(selected.growthPointsNeeded)} voice
                </span>
                <span className="text-[10px] opacity-70">({selected.growthPointsNeeded} pts)</span>
              </div>
              {/* --- END AI-MODIFIED --- */}
              {/* --- END AI-MODIFIED --- */}
              <PixelButton variant="primary" size="md" onClick={handlePlant} loading={planting}>
                Buy & Plant
              </PixelButton>
            </div>
          </div>
        )}
        {/* --- END AI-MODIFIED --- */}
      </div>
    </div>
  )
}
