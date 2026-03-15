// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Rich harvest summary modal with pixel art styling
// ============================================================
import { useEffect, useState } from "react"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"

interface HarvestDetail {
  name: string
  rarity: string
  gold: number
  multiplier: number
}

interface HarvestResult {
  count: number
  totalGold: number
  totalInvested: number
  netProfit: number
  totalVoiceMinutes: number
  totalMessages: number
  details: HarvestDetail[]
}

interface HarvestModalProps {
  result: HarvestResult
  onClose: () => void
}

export default function HarvestModal({ result, onClose }: HarvestModalProps) {
  const [displayGold, setDisplayGold] = useState(0)

  useEffect(() => {
    const target = result.totalGold
    const step = Math.max(1, Math.floor(target / 30))
    const id = setInterval(() => {
      setDisplayGold(prev => {
        const next = prev + step
        if (next >= target) { clearInterval(id); return target }
        return next
      })
    }, 30)
    return () => clearInterval(id)
  }, [result.totalGold])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <PixelCard
        className="w-full max-w-md p-6 space-y-4 mx-4"
        borderColor="#f0c040"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <h2 className="font-pixel text-lg text-[var(--pet-gold,#f0c040)]">HARVEST!</h2>
          <div className="font-pixel text-3xl text-[var(--pet-gold,#f0c040)] animate-harvest-pulse">
            +{displayGold}G
          </div>
          <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
            {result.count} plant{result.count !== 1 ? "s" : ""} harvested
          </p>
        </div>

        <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
          {result.details.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1 bg-[#0a0e1a]/50">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">{d.name}</span>
                {d.rarity !== "COMMON" && <PixelBadge rarity={d.rarity} />}
              </div>
              <span className="font-pixel text-[10px] text-[var(--pet-gold,#f0c040)]">
                +{d.gold}G {d.multiplier > 1 ? `(x${d.multiplier})` : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-[var(--pet-border,#2a3a5c)] pt-3 space-y-1">
          <div className="flex justify-between font-pixel text-[10px]">
            <span className="text-[var(--pet-text-dim,#8899aa)]">Invested</span>
            <span className="text-[var(--pet-text,#e2e8f0)]">{result.totalInvested}G</span>
          </div>
          <div className="flex justify-between font-pixel text-[10px]">
            <span className="text-[var(--pet-text-dim,#8899aa)]">Earned</span>
            <span className="text-[var(--pet-gold,#f0c040)]">{result.totalGold}G</span>
          </div>
          <div className="flex justify-between font-pixel text-xs">
            <span className="text-[var(--pet-text-dim,#8899aa)]">Net Profit</span>
            <span className={result.netProfit >= 0 ? "text-[var(--pet-green,#40d870)]" : "text-[var(--pet-red,#e04040)]"}>
              {result.netProfit >= 0 ? "+" : ""}{result.netProfit}G
            </span>
          </div>
          {(result.totalVoiceMinutes > 0 || result.totalMessages > 0) && (
            <div className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] pt-1">
              Growth from: {result.totalVoiceMinutes > 0 ? `${result.totalVoiceMinutes}m voice` : ""}
              {result.totalVoiceMinutes > 0 && result.totalMessages > 0 ? " + " : ""}
              {result.totalMessages > 0 ? `${result.totalMessages} msgs` : ""}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <PixelButton variant="gold" onClick={onClose}>OK</PixelButton>
        </div>
      </PixelCard>
    </div>
  )
}
