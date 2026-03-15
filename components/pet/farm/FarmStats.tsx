// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Farm statistics summary panel
// ============================================================
import { useMemo } from "react"
import { getUiIconUrl } from "@/utils/petAssets"
import { Sprout, Skull, Sparkles } from "lucide-react"
import type { FarmPlot } from "./FarmScene"

interface FarmStatsProps {
  plots: FarmPlot[]
  gold: number
}

export default function FarmStats({ plots, gold }: FarmStatsProps) {
  const stats = useMemo(() => {
    let active = 0
    let ready = 0
    let dead = 0
    let empty = 0
    let needsWater = 0
    const rarities: Record<string, number> = {}

    for (const p of plots) {
      if (p.empty) { empty++; continue }
      if (p.dead) { dead++; continue }
      active++
      if (p.readyToHarvest) ready++
      if (p.needsWater) needsWater++
      rarities[p.rarity] = (rarities[p.rarity] || 0) + 1
    }

    return { active, ready, dead, empty, needsWater, rarities, total: plots.length }
  }, [plots])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={<img src={getUiIconUrl("coin")} alt="Gold" className="w-5 h-5" style={{ imageRendering: "pixelated" }} />}
        label="Gold"
        value={gold.toLocaleString()}
        color="text-amber-400"
      />
      <StatCard
        icon={<Sprout size={18} className="text-emerald-400" />}
        label="Growing"
        value={`${stats.active}/${stats.total}`}
        sub={stats.needsWater > 0 ? `${stats.needsWater} thirsty` : undefined}
        color="text-emerald-400"
      />
      <StatCard
        icon={<Sparkles size={18} className="text-amber-400" />}
        label="Ready"
        value={String(stats.ready)}
        color="text-amber-400"
        highlight={stats.ready > 0}
      />
      <StatCard
        icon={<Skull size={18} className="text-red-400" />}
        label="Dead"
        value={String(stats.dead)}
        color="text-red-400"
      />
    </div>
  )
}

function StatCard({
  icon, label, value, sub, color, highlight
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string; highlight?: boolean
}) {
  return (
    <div className={`bg-gray-800/50 border rounded-lg p-3 ${highlight ? "border-amber-500/30 bg-amber-500/5" : "border-gray-700/30"}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-blue-400 mt-0.5">{sub}</p>}
    </div>
  )
}
