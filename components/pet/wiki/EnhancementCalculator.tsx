// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Interactive enhancement calculator with curve graph
// ============================================================
import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Import calcLevelPenalty for new diminishing-returns formula
import { calcLevelPenalty } from "@/utils/gameConstants"

interface GameConstants {
  MAX_ENHANCEMENT_BY_RARITY: Record<string, number>
  ENHANCEMENT_GOLD_BONUS: number
  ENHANCEMENT_XP_BONUS: number
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Add bonusValue to scroll data for bonus power display
interface ScrollData {
  itemId: number; name: string; rarity: string
  successRate: number; destroyRate: number
  bonusValue?: number
}
// --- END AI-MODIFIED ---

interface Props {
  gameConstants: GameConstants
  scrolls: ScrollData[]
}

const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]
const SCROLL_COLORS = ["#40e070", "#4080f0", "#d060f0", "#f0c040", "#ff6080"]

const TOOLTIP_STYLE = {
  backgroundColor: "#0f1628",
  border: "2px solid #2a3a5c",
  borderRadius: 0,
  fontSize: 18,
  fontFamily: "var(--font-pixel, monospace)",
}

// --- AI-REPLACED (2026-03-22) ---
// Reason: Old formula used wrong linear subtraction and unconditional destroy; didn't match bot
// What the new code does better: Uses diminishing-returns calcLevelPenalty + conditional destroy (matches bot)
// --- Original code (commented out for rollback) ---
// function calcRates(baseSuccess: number, baseDestroy: number, level: number, penalty: number) {
//   const basePct = baseSuccess * 100
//   const destroyPct = baseDestroy * 100
//   const effectiveSuccess = Math.max(0, basePct - level * penalty * 100)
//   const failRate = 100 - effectiveSuccess
//   const effectiveDestroy = Math.min(failRate, destroyPct)
//   const failNoDestroy = failRate - effectiveDestroy
//   return { success: effectiveSuccess, fail: failNoDestroy, destroy: effectiveDestroy }
// }
// --- End original code ---
function calcRates(baseSuccess: number, baseDestroy: number, level: number) {
  const effectiveSuccess = baseSuccess * calcLevelPenalty(level) * 100
  const failRate = 100 - effectiveSuccess
  const effectiveDestroy = failRate * baseDestroy
  const failNoDestroy = failRate - effectiveDestroy
  return { success: effectiveSuccess, fail: failNoDestroy, destroy: effectiveDestroy }
}
// --- END AI-REPLACED ---

export default function EnhancementCalculator({ gameConstants, scrolls }: Props) {
  const [selectedRarity, setSelectedRarity] = useState("RARE")
  const [currentLevel, setCurrentLevel] = useState(0)

  const maxLevel = gameConstants.MAX_ENHANCEMENT_BY_RARITY[selectedRarity] ?? 10

  const curveData = useMemo(() => {
    const points = []
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      const point: Record<string, number | string> = { level: lvl }
      for (const scroll of scrolls) {
        const rates = calcRates(scroll.successRate, scroll.destroyRate, lvl)
        point[`${scroll.name}`] = Math.round(rates.success * 10) / 10
      }
      points.push(point)
    }
    return points
  }, [selectedRarity, maxLevel, scrolls, gameConstants])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block font-pixel text-[12px] text-[#4a5a70] mb-1">Equipment Rarity</label>
          <select
            value={selectedRarity}
            onChange={(e) => { setSelectedRarity(e.target.value); setCurrentLevel(0) }}
            className="font-pixel bg-[#0a0e1a] border-2 border-[#2a3a5c] px-3 py-1.5 text-[13px] text-[#c0d0e0] focus:outline-none focus:border-[#4080f0] appearance-none cursor-pointer shadow-[2px_2px_0_#060810]"
          >
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>{r} (max +{gameConstants.MAX_ENHANCEMENT_BY_RARITY[r] ?? "?"})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-pixel text-[12px] text-[#4a5a70] mb-1">Current Level: +{currentLevel}</label>
          <input
            type="range" min={0} max={maxLevel} value={currentLevel}
            onChange={(e) => setCurrentLevel(Number(e.target.value))}
            className="w-40 accent-[#40e070]"
          />
        </div>
      </div>

      <div className="space-y-2">
        {scrolls.map((scroll) => {
          const rates = calcRates(scroll.successRate, scroll.destroyRate, currentLevel)
          const total = rates.success + rates.fail + rates.destroy
          const successW = total > 0 ? (rates.success / total) * 100 : 0
          const failW = total > 0 ? (rates.fail / total) * 100 : 0
          const destroyW = total > 0 ? (rates.destroy / total) * 100 : 0
          // --- AI-MODIFIED (2026-03-17) ---
          // Purpose: Show bonus_value multiplier + Gold/XP per level alongside success rates
          const bv = scroll.bonusValue ?? 1
          const goldPct = (bv * 0.02 * 100).toFixed(1)
          return (
            <div key={scroll.itemId} className="border-2 border-[#1a2a3c] bg-[#0f1628] p-3">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[13px] text-[#c0d0e0]">{scroll.name}</span>
                  <span className="font-pixel text-[12px] px-1.5 py-0.5 border border-[#4080f040] text-[#80b0ff] bg-[#4080f008]">{bv}x</span>
                  <span className="font-pixel text-[11px] text-[#6a8a6a]">+{goldPct}%/lvl</span>
                </div>
                <div className="flex gap-3 font-pixel text-[12px]">
                  <span className="text-[#40e070]">{rates.success.toFixed(1)}% success</span>
                  <span className="text-[#f0c040]">{rates.fail.toFixed(1)}% fail</span>
                  <span className="text-[#e04040]">{rates.destroy.toFixed(1)}% destroy</span>
                </div>
              </div>
              <div className="h-4 flex overflow-hidden border border-[#1a2030]">
                <div className="bg-[#40e070] transition-all" style={{ width: `${successW}%` }} />
                <div className="bg-[#f0c040] transition-all" style={{ width: `${failW}%` }} />
                <div className="bg-[#e04040] transition-all" style={{ width: `${destroyW}%` }} />
              </div>
            </div>
          )
          // --- END AI-MODIFIED ---
        })}
      </div>

      <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-4 shadow-[2px_2px_0_#060810]">
        <h4 className="font-pixel text-[12px] uppercase text-[#4a5a70] mb-3">Success Rate Curve</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={curveData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3c" />
            <XAxis dataKey="level" tick={{ fontSize: 16, fill: "#4a5a70" }} label={{ value: "Enhancement Level", fontSize: 16, fill: "#4a5a70", position: "insideBottomRight", offset: -5 }} />
            <YAxis tick={{ fontSize: 16, fill: "#4a5a70" }} domain={[0, 100]} label={{ value: "Success %", fontSize: 16, fill: "#4a5a70", angle: -90, position: "insideLeft" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: 16, fontFamily: "var(--font-pixel, monospace)" }} />
            {scrolls.map((scroll, i) => (
              <Line
                key={scroll.itemId} type="monotone" dataKey={scroll.name}
                stroke={SCROLL_COLORS[i % SCROLL_COLORS.length]}
                strokeWidth={2} dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
