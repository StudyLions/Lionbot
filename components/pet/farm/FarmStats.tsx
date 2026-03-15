// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Farm statistics with load indicator, rarity breakdown,
//          investment totals, and contextual growth tips
// ============================================================
import { useMemo } from "react"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import type { FarmPlot } from "./FarmScene"

interface FarmStatsProps {
  plots: FarmPlot[]
  gold: number
}

export default function FarmStats({ plots, gold }: FarmStatsProps) {
  const stats = useMemo(() => {
    let active = 0, ready = 0, dead = 0, empty = 0, needsWater = 0
    let totalInvested = 0
    const rarities: Record<string, number> = {}

    for (const p of plots) {
      if (p.empty && !p.dead) { empty++; continue }
      if (p.dead) { dead++; continue }
      active++
      if (p.readyToHarvest) ready++
      if (p.needsWater) needsWater++
      totalInvested += p.goldInvested || 0
      const r = p.rarity || "COMMON"
      rarities[r] = (rarities[r] || 0) + 1
    }

    const growingCount = active - ready
    let load: "EMPTY" | "LIGHT" | "MEDIUM" | "HEAVY" = "EMPTY"
    if (growingCount >= 10) load = "HEAVY"
    else if (growingCount >= 5) load = "MEDIUM"
    else if (growingCount >= 1) load = "LIGHT"

    return { active, ready, dead, empty, needsWater, totalInvested, rarities, total: plots.length, load, growingCount }
  }, [plots])

  const loadColors = {
    EMPTY: "text-[#6a7a8a]",
    LIGHT: "text-[var(--pet-green,#40d870)]",
    MEDIUM: "text-[#f0c040]",
    HEAVY: "text-[var(--pet-red,#e04040)]",
  }

  const tips = useMemo(() => {
    const t: string[] = []
    if (stats.ready > 0) t.push(`${stats.ready} plant${stats.ready > 1 ? "s" : ""} ready to harvest!`)
    if (stats.needsWater > 0) t.push(`${stats.needsWater} plant${stats.needsWater > 1 ? "s" : ""} need water or they'll die!`)
    if (stats.load === "HEAVY") t.push("Heavy load! Growth splits across all plants. Consider harvesting first.")
    if (stats.active === 0 && stats.empty > 0) t.push("Plant seeds and be active in VC or chat to grow them!")
    if (stats.growingCount > 0 && stats.growingCount < 5) {
      const avgPtsNeeded = 100
      const msgsPerPlot = Math.round(avgPtsNeeded / (2.0 / stats.growingCount * 1.5))
      t.push(`~${msgsPerPlot} messages or ~${Math.round(avgPtsNeeded / (1.0 / stats.growingCount * 1.5))}m VC per plant to fully grow`)
    }
    return t
  }, [stats])

  const hasRareOrAbove = Object.keys(stats.rarities).some(r => r !== "COMMON")

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="GOLD" value={gold.toLocaleString()} color="text-[var(--pet-gold,#f0c040)]" />
        <StatCard label="GROWING" value={`${stats.active}/${stats.total}`} color="text-[var(--pet-green,#40d870)]"
          sub={stats.needsWater > 0 ? `${stats.needsWater} thirsty` : undefined} />
        <StatCard label="HARVEST" value={String(stats.ready)} color="text-[var(--pet-gold,#f0c040)]"
          highlight={stats.ready > 0} />
        <StatCard label="DEAD" value={String(stats.dead)} color="text-[var(--pet-red,#e04040)]" />
      </div>

      <PixelCard className="px-3 py-2 flex flex-wrap items-center gap-3">
        <div className="font-pixel text-[10px] flex items-center gap-1.5">
          <span className="text-[var(--pet-text-dim,#8899aa)]">Load:</span>
          <span className={loadColors[stats.load]}>{stats.load}</span>
        </div>
        {stats.totalInvested > 0 && (
          <div className="font-pixel text-[10px] flex items-center gap-1.5">
            <span className="text-[var(--pet-text-dim,#8899aa)]">Invested:</span>
            <span className="text-[var(--pet-gold,#f0c040)]">{stats.totalInvested}G</span>
          </div>
        )}
        {hasRareOrAbove && (
          <div className="flex items-center gap-1">
            {(["LEGENDARY", "EPIC", "RARE", "UNCOMMON"] as const).map(r =>
              stats.rarities[r] ? (
                <span key={r} className="flex items-center gap-0.5">
                  <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">{stats.rarities[r]}x</span>
                  <PixelBadge rarity={r} />
                </span>
              ) : null
            )}
          </div>
        )}
      </PixelCard>

      {tips.length > 0 && (
        <PixelCard className="px-3 py-2 border-[#4080f0]/40">
          {tips.map((tip, i) => (
            <p key={i} className="font-pixel text-[10px] text-[var(--pet-blue,#4080f0)]">
              &gt; {tip}
            </p>
          ))}
        </PixelCard>
      )}
    </div>
  )
}

function StatCard({ label, value, color, sub, highlight }: {
  label: string; value: string; color: string; sub?: string; highlight?: boolean
}) {
  return (
    <PixelCard className={`p-2.5 ${highlight ? "border-[#f0c040]/50" : ""}`}>
      <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] tracking-widest mb-1">{label}</p>
      <p className={`font-pixel text-base ${color}`}>{value}</p>
      {sub && <p className="font-pixel text-[8px] text-[var(--pet-blue,#4080f0)] mt-0.5">{sub}</p>}
    </PixelCard>
  )
}
