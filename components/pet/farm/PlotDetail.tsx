// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Plot detail panel with pixel art UI, activity tracking,
//          investment/return display, and remove/uproot action
// ============================================================
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl } from "@/utils/petAssets"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import type { FarmPlot } from "./FarmScene"

const RARITY_GOLD_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.5, RARE: 2.0, EPIC: 3.0, LEGENDARY: 5.0,
}

const rarityBorderColors: Record<string, string> = {
  COMMON: "#2a3a5c",
  UNCOMMON: "#4080f0",
  RARE: "#e04040",
  EPIC: "#f0c040",
  LEGENDARY: "#d060f0",
}

interface PlotDetailProps {
  plot: FarmPlot
  onAction: (plotId: number, action: string) => Promise<void>
  onPlantClick: () => void
  onRemove: (plotId: number) => Promise<void>
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
  return <span className="font-pixel text-[10px] text-[var(--pet-blue,#4080f0)]">{text}</span>
}

export default function PlotDetail({ plot, onAction, onPlantClick, onRemove }: PlotDetailProps) {
  const [acting, setActing] = useState(false)

  async function handle(action: string) {
    setActing(true)
    try { await onAction(plot.plotId, action) }
    finally { setActing(false) }
  }

  async function handleRemove() {
    setActing(true)
    try { await onRemove(plot.plotId) }
    finally { setActing(false) }
  }

  const imgUrl = plot.assetPrefix && plot.plantType && plot.typeId
    ? getFarmPlantImageUrl(plot.assetPrefix, plot.plantType, plot.typeId, Math.max(plot.stage, 3), plot.rarity)
    : null

  const projectedHarvest = plot.seed
    ? Math.round(plot.seed.harvestGold * (RARITY_GOLD_MULTIPLIER[plot.rarity] || 1.0))
    : 0

  return (
    <PixelCard
      className="p-4 transition-all"
      borderColor={rarityBorderColors[plot.rarity] || "#2a3a5c"}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 bg-[#0a0e1a] border-2 border-[var(--pet-border,#2a3a5c)] flex items-center justify-center flex-shrink-0"
        >
          {plot.empty ? (
            <span className="font-pixel text-[10px] text-[#4a5a70]">EMPTY</span>
          ) : plot.dead ? (
            <span className="text-2xl">💀</span>
          ) : imgUrl ? (
            <img src={imgUrl} alt={plot.seed?.name || "Plant"} className="w-12 h-12 object-contain" style={{ imageRendering: "pixelated" }} />
          ) : (
            <span className="font-pixel text-[10px] text-[#40d870]">🌱</span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-pixel text-xs text-[var(--pet-text,#e2e8f0)]">
              Plot #{plot.plotId + 1}
            </h3>
            {!plot.empty && !plot.dead && <PixelBadge rarity={plot.rarity} />}
          </div>

          {plot.empty ? (
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Plant a seed to start growing!</p>
          ) : plot.dead ? (
            <p className="font-pixel text-[10px] text-[var(--pet-red,#e04040)]">This plant died. Clear it to plant again.</p>
          ) : (
            <div className="space-y-2">
              <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">{plot.seed?.name}</p>

              <PixelBar
                value={plot.growthPoints}
                max={plot.growthPointsNeeded}
                label={`Stg ${plot.stage}`}
                color={plot.readyToHarvest ? "gold" : "green"}
              />

              <div className="flex flex-wrap items-center gap-3 font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                <span>{Math.round(plot.growthPoints)}/{plot.growthPointsNeeded} pts</span>
                {plot.goldInvested > 0 && (
                  <span>Invested: <span className="text-[var(--pet-gold,#f0c040)]">{plot.goldInvested}G</span></span>
                )}
                {plot.readyToHarvest && (
                  <span>Harvest: <span className="text-[var(--pet-gold,#f0c040)]">+{projectedHarvest}G</span>
                    {plot.rarity !== "COMMON" ? ` (x${RARITY_GOLD_MULTIPLIER[plot.rarity]})` : ""}
                  </span>
                )}
                {plot.needsWater ? (
                  <span className="text-[var(--pet-blue,#4080f0)]">Needs water!</span>
                ) : plot.nextWaterAt && !plot.readyToHarvest ? (
                  <span className="flex items-center gap-1">
                    Water in <LiveTimer nextWaterAt={plot.nextWaterAt} />
                  </span>
                ) : null}
              </div>

              {((plot.voiceMinutesEarned || 0) > 0 || (plot.messagesEarned || 0) > 0) && (
                <div className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">
                  Grew from:
                  {(plot.voiceMinutesEarned || 0) > 0 ? ` ${Math.round(plot.voiceMinutesEarned || 0)}m voice` : ""}
                  {(plot.messagesEarned || 0) > 0 ? ` ${plot.messagesEarned} msgs` : ""}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {plot.empty && (
            <PixelButton variant="primary" size="sm" onClick={onPlantClick}>Plant</PixelButton>
          )}
          {!plot.empty && plot.needsWater && !plot.dead && (
            <PixelButton variant="info" size="sm" onClick={() => handle("water")} loading={acting}>Water</PixelButton>
          )}
          {plot.readyToHarvest && !plot.dead && (
            <PixelButton variant="gold" size="sm" onClick={() => handle("harvest")} loading={acting}>Harvest</PixelButton>
          )}
          {!plot.empty && !plot.dead && !plot.readyToHarvest && plot.seed && (
            <PixelButton variant="ghost" size="sm" onClick={handleRemove} loading={acting}>Remove</PixelButton>
          )}
          {plot.dead && (
            <PixelButton variant="danger" size="sm" onClick={() => handle("clear")} loading={acting}>Clear</PixelButton>
          )}
        </div>
      </div>
    </PixelCard>
  )
}
