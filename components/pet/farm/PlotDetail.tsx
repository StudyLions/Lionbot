// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: RPG inspection panel for farm plot details
// ============================================================
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getFarmPlantImageUrl, getFarmAnimationUrl } from "@/utils/petAssets"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import type { FarmPlot } from "./FarmScene"

const RARITY_GOLD_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.5, RARE: 2.0, EPIC: 3.0, LEGENDARY: 5.0,
}

const rarityBorderColors: Record<string, string> = {
  COMMON: "#3a4a6c",
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
  return <span className="font-pixel text-sm text-[var(--pet-blue,#4080f0)]">{text}</span>
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

  const bc = rarityBorderColors[plot.rarity] || "#3a4a6c"

  return (
    <div
      className="border-[3px] p-[3px]"
      style={{ borderColor: bc, boxShadow: `3px 3px 0 #060810` }}
    >
      <div className="border-2 bg-[#0c1020] p-4" style={{ borderColor: `${bc}60` }}>
        {/* Title bar */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#1a2a3c]">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-base text-[var(--pet-text,#e2e8f0)]">Plot #{plot.plotId + 1}</span>
            {!plot.empty && !plot.dead && <PixelBadge rarity={plot.rarity} />}
          </div>
          {!plot.empty && plot.seed && (
            <span className="font-pixel text-sm" style={{ color: bc }}>{plot.seed.name}</span>
          )}
        </div>

        <div className="flex items-start gap-5">
          {/* Plant thumbnail with decorative frame */}
          <div className="flex-shrink-0">
            <div
              className="w-20 h-20 border-[3px] bg-[#080c18] flex items-center justify-center"
              style={{ borderColor: `${bc}80`, boxShadow: "inset 0 0 8px rgba(0,0,0,0.5)" }}
            >
              {plot.empty ? (
                <span className="font-pixel text-[10px] text-[#3a4a5c]">EMPTY</span>
              ) : plot.dead ? (
                <img src={getFarmAnimationUrl("skull", 1)} alt="Dead" width={36} height={36}
                  style={{ imageRendering: "pixelated" }} className="animate-bob" />
              ) : imgUrl ? (
                <img src={imgUrl} alt={plot.seed?.name || ""} className="w-14 h-14 object-contain"
                  style={{ imageRendering: "pixelated" }} />
              ) : (
                <span className="font-pixel text-2xl text-[#40d870]/30">?</span>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex-1 min-w-0 space-y-3">
            {plot.empty ? (
              <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)]">
                Select a seed to plant in this plot!
              </p>
            ) : plot.dead ? (
              <p className="font-pixel text-[11px] text-[var(--pet-red,#e04040)]">
                This plant died from lack of water. Clear it to replant.
              </p>
            ) : (
              <>
                {/* Growth bar */}
                <div className="border-2 border-[#1a2a3c] p-1.5 bg-[#080c18]">
                  <PixelBar
                    value={plot.growthPoints}
                    max={plot.growthPointsNeeded}
                    label={`Stg ${plot.stage}`}
                    color={plot.readyToHarvest ? "gold" : "green"}
                    segments={12}
                  />
                </div>

                {/* 2-column stats */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <StatRow label="Growth" value={`${Math.round(plot.growthPoints)}/${plot.growthPointsNeeded}`} />
                  {plot.goldInvested > 0 && (
                    <StatRow label="Invested" value={<GoldDisplay amount={plot.goldInvested} size="sm" />} />
                  )}
                  {plot.readyToHarvest && (
                    <StatRow label="Harvest" value={
                      <span className="flex items-center gap-1">
                        <GoldDisplay amount={projectedHarvest} size="sm" showSign />
                        {plot.rarity !== "COMMON" && (
                          <span className="text-[11px]" style={{ color: bc }}>x{RARITY_GOLD_MULTIPLIER[plot.rarity]}</span>
                        )}
                      </span>
                    } />
                  )}
                  {plot.needsWater && (
                    <StatRow label="Water" value={<span className="text-[var(--pet-blue,#4080f0)]">Needs water!</span>} />
                  )}
                  {!plot.needsWater && !plot.readyToHarvest && plot.nextWaterAt && (
                    <StatRow label="Water in" value={<LiveTimer nextWaterAt={plot.nextWaterAt} />} />
                  )}
                  {((plot.voiceMinutesEarned || 0) > 0 || (plot.messagesEarned || 0) > 0) && (
                    <StatRow label="Activity" value={
                      <span className="text-[var(--pet-text-dim,#8899aa)]">
                        {(plot.voiceMinutesEarned || 0) > 0 ? `${Math.round(plot.voiceMinutesEarned || 0)}m VC` : ""}
                        {(plot.voiceMinutesEarned || 0) > 0 && (plot.messagesEarned || 0) > 0 ? " + " : ""}
                        {(plot.messagesEarned || 0) > 0 ? `${plot.messagesEarned} msgs` : ""}
                      </span>
                    } />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex gap-2 mt-4 pt-3 border-t-2 border-[#1a2a3c]">
          {plot.empty && (
            <PixelButton variant="primary" size="md" onClick={onPlantClick} className="flex-1">Plant Seed</PixelButton>
          )}
          {!plot.empty && plot.needsWater && !plot.dead && (
            <PixelButton variant="info" size="md" onClick={() => handle("water")} loading={acting} className="flex-1">Water</PixelButton>
          )}
          {plot.readyToHarvest && !plot.dead && (
            <PixelButton variant="gold" size="md" onClick={() => handle("harvest")} loading={acting} className="flex-1">Harvest</PixelButton>
          )}
          {!plot.empty && !plot.dead && !plot.readyToHarvest && plot.seed && (
            <PixelButton variant="ghost" size="md" onClick={handleRemove} loading={acting}>Remove (50%)</PixelButton>
          )}
          {plot.dead && (
            <PixelButton variant="danger" size="md" onClick={() => handle("clear")} loading={acting} className="flex-1">Clear Plot</PixelButton>
          )}
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between font-pixel text-[13px]">
      <span className="text-[var(--pet-text-dim,#8899aa)]">{label}</span>
      <span className="text-[var(--pet-text,#e2e8f0)]">{value}</span>
    </div>
  )
}
