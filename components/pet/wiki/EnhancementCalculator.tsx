// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Interactive enhancement calculator with curve graph
// ============================================================
import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"

interface GameConstants {
  LEVEL_PENALTY_FACTOR: number
  MAX_ENHANCEMENT_BY_RARITY: Record<string, number>
  ENHANCEMENT_GOLD_BONUS: number
  ENHANCEMENT_XP_BONUS: number
}

interface ScrollData {
  itemId: number; name: string; rarity: string
  successRate: number; destroyRate: number
}

interface Props {
  gameConstants: GameConstants
  scrolls: ScrollData[]
}

const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]
const SCROLL_COLORS = ["#4ade80", "#60a5fa", "#c084fc", "#fbbf24", "#fb7185"]

function calcRates(baseSuccess: number, baseDestroy: number, level: number, penalty: number) {
  const basePct = baseSuccess * 100
  const destroyPct = baseDestroy * 100
  const effectiveSuccess = Math.max(0, basePct - level * penalty * 100)
  const failRate = 100 - effectiveSuccess
  const effectiveDestroy = Math.min(failRate, destroyPct)
  const failNoDestroy = failRate - effectiveDestroy
  return { success: effectiveSuccess, fail: failNoDestroy, destroy: effectiveDestroy }
}

export default function EnhancementCalculator({ gameConstants, scrolls }: Props) {
  const [selectedRarity, setSelectedRarity] = useState("RARE")
  const [currentLevel, setCurrentLevel] = useState(0)

  const maxLevel = gameConstants.MAX_ENHANCEMENT_BY_RARITY[selectedRarity] ?? 10

  const curveData = useMemo(() => {
    const points = []
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      const point: Record<string, number | string> = { level: lvl }
      for (const scroll of scrolls) {
        const rates = calcRates(scroll.successRate, scroll.destroyRate, lvl, gameConstants.LEVEL_PENALTY_FACTOR)
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
          <label className="block text-[10px] text-muted-foreground/50 mb-1">Equipment Rarity</label>
          <select
            value={selectedRarity}
            onChange={(e) => { setSelectedRarity(e.target.value); setCurrentLevel(0) }}
            className="bg-muted/20 border border-border/30 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>{r} (max +{gameConstants.MAX_ENHANCEMENT_BY_RARITY[r] ?? "?"})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground/50 mb-1">Current Level: +{currentLevel}</label>
          <input
            type="range" min={0} max={maxLevel} value={currentLevel}
            onChange={(e) => setCurrentLevel(Number(e.target.value))}
            className="w-40 accent-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        {scrolls.map((scroll) => {
          const rates = calcRates(scroll.successRate, scroll.destroyRate, currentLevel, gameConstants.LEVEL_PENALTY_FACTOR)
          const total = rates.success + rates.fail + rates.destroy
          return (
            <div key={scroll.itemId} className="rounded-lg border border-border/20 bg-muted/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{scroll.name}</span>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-emerald-400">{rates.success.toFixed(1)}% success</span>
                  <span className="text-amber-400">{rates.fail.toFixed(1)}% fail</span>
                  <span className="text-red-400">{rates.destroy.toFixed(1)}% destroy</span>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-muted/20">
                <div className="bg-emerald-500 transition-all" style={{ width: `${(rates.success / total) * 100}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${(rates.fail / total) * 100}%` }} />
                <div className="bg-red-500 transition-all" style={{ width: `${(rates.destroy / total) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-border/20 bg-muted/5 p-4">
        <h4 className="text-[10px] uppercase font-semibold text-muted-foreground/50 mb-3">Success Rate Curve</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={curveData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="level" tick={{ fontSize: 10, fill: "#999" }} label={{ value: "Enhancement Level", fontSize: 10, fill: "#666", position: "insideBottomRight", offset: -5 }} />
            <YAxis tick={{ fontSize: 10, fill: "#999" }} domain={[0, 100]} label={{ value: "Success %", fontSize: 10, fill: "#666", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
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
