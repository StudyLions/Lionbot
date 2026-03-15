// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Rich harvest summary modal with pixel art styling
// ============================================================
import { useEffect, useState } from "react"
import PixelButton from "@/components/pet/ui/PixelButton"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div
        className="relative border-[3px] border-[#f0c040] bg-[#0c1020] w-full max-w-md mx-4 p-[3px]"
        style={{ boxShadow: "4px 4px 0 #060810, 0 0 30px rgba(240,192,64,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-[#f0c040]/30 p-5 space-y-4">
          {/* Title */}
          <div className="text-center space-y-3">
            <h2 className="font-pixel text-lg text-[var(--pet-gold,#f0c040)]">HARVEST COMPLETE</h2>
            <div className="font-pixel text-3xl animate-harvest-pulse">
              <GoldDisplay amount={displayGold} size="xl" showSign />
            </div>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
              {result.count} plant{result.count !== 1 ? "s" : ""} harvested
            </p>
          </div>

          {/* Plant breakdown */}
          <div className="border-2 border-[#1a2a3c] bg-[#080c18] max-h-40 overflow-y-auto scrollbar-hide">
            {result.details.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5"
                style={{ backgroundColor: i % 2 === 0 ? "transparent" : "rgba(20,30,50,0.3)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)]">{d.name}</span>
                  {d.rarity !== "COMMON" && <PixelBadge rarity={d.rarity} />}
                </div>
                <span className="font-pixel text-[10px]">
                  <GoldDisplay amount={d.gold} size="sm" showSign />
                  {d.multiplier > 1 ? <span className="text-[8px] text-[var(--pet-text-dim,#8899aa)]"> x{d.multiplier}</span> : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t-2 border-[#1a2a3c] pt-3 space-y-1.5">
            <SummaryRow label="Invested" value={<GoldDisplay amount={result.totalInvested} size="sm" />} />
            <SummaryRow label="Earned" value={<GoldDisplay amount={result.totalGold} size="sm" />} />
            <div className="flex justify-between font-pixel text-xs pt-1 border-t border-[#1a2a3c]">
              <span className="text-[var(--pet-text-dim,#8899aa)]">Net Profit</span>
              <span style={{ color: result.netProfit >= 0 ? "var(--pet-green,#40d870)" : "var(--pet-red,#e04040)" }}>
                {result.netProfit >= 0 ? "+" : ""}{result.netProfit}G
              </span>
            </div>
            {(result.totalVoiceMinutes > 0 || result.totalMessages > 0) && (
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] pt-1">
                Growth: {result.totalVoiceMinutes > 0 ? `${result.totalVoiceMinutes}m voice` : ""}
                {result.totalVoiceMinutes > 0 && result.totalMessages > 0 ? " + " : ""}
                {result.totalMessages > 0 ? `${result.totalMessages} msgs` : ""}
              </p>
            )}
          </div>

          <div className="flex justify-center pt-1">
            <PixelButton variant="gold" size="lg" onClick={onClose}>Collect</PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between font-pixel text-[10px]">
      <span className="text-[var(--pet-text-dim,#8899aa)]">{label}</span>
      {value}
    </div>
  )
}
