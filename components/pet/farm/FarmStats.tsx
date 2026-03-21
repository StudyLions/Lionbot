// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: RPG-style HUD bar with icon sprites, farm load,
//          rarity breakdown, and speech bubble tips
// ============================================================
import { useMemo } from "react"
import { getUiIconUrl, getFarmAnimationUrl } from "@/utils/petAssets"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import type { FarmPlot } from "./FarmScene"

interface FarmStatsProps {
  plots: FarmPlot[]
  gold: number
}

function PixelIcon({ name, size = 16, alt = "" }: { name: string; size?: number; alt?: string }) {
  return (
    <img
      src={getUiIconUrl(name)}
      alt={alt}
      width={size}
      height={size}
      className="inline-block flex-shrink-0"
      style={{ imageRendering: "pixelated" }}
    />
  )
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

  const tips = useMemo(() => {
    const t: string[] = []
    if (stats.ready > 0) t.push(`${stats.ready} plant${stats.ready > 1 ? "s" : ""} ready to harvest!`)
    if (stats.needsWater > 0) t.push(`${stats.needsWater} plant${stats.needsWater > 1 ? "s" : ""} need water!`)
    if (stats.load === "HEAVY") t.push("Heavy load! Growth splits thin.")
    if (stats.active === 0 && stats.empty > 0) t.push("Plant seeds and be active to grow them!")
    return t
  }, [stats])

  const loadColors: Record<string, { bg: string; text: string }> = {
    EMPTY: { bg: "#1a2030", text: "#6a7a8a" },
    LIGHT: { bg: "#1a3020", text: "#40d870" },
    MEDIUM: { bg: "#302a18", text: "#f0c040" },
    HEAVY: { bg: "#301a1a", text: "#e04040" },
  }
  const lc = loadColors[stats.load]

  const hasRareOrAbove = Object.keys(stats.rarities).some(r => r !== "COMMON")

  return (
    <div className="space-y-2">
      {/* Main HUD bar */}
      <div
        className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020] px-4 py-3"
        style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Gold */}
          <GoldDisplay amount={gold} size="lg" />

          {/* Growing / Harvest / Dead */}
          {/* --- AI-MODIFIED (2026-03-21) --- */}
          {/* Purpose: Add flex-wrap so HUD stats wrap on narrow screens */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* --- END AI-MODIFIED --- */}
            <HudStat icon={<PixelIcon name="liongotchi_greenpot" size={18} />} value={`${stats.active}/${stats.total}`} color="#40d870"
              sub={stats.needsWater > 0 ? `${stats.needsWater} thirsty` : undefined} subColor="#4080f0" />
            <div className="w-px h-6 bg-[#2a3a5c]" />
            <HudStat icon={<PixelIcon name="trophy" size={18} />} value={String(stats.ready)} color="#f0c040"
              pulse={stats.ready > 0} />
            <div className="w-px h-6 bg-[#2a3a5c]" />
            <HudStat
              icon={
                <img src={getFarmAnimationUrl("skull", 1)} alt="" width={16} height={16}
                  style={{ imageRendering: "pixelated" }} />
              }
              value={String(stats.dead)} color="#e04040" />
          </div>

          {/* Load badge */}
          <div
            className="font-pixel text-[13px] px-2.5 py-1 border-2"
            style={{ backgroundColor: lc.bg, borderColor: lc.text, color: lc.text }}
          >
            {stats.load}
          </div>
        </div>

        {/* Second row: invested + rarity breakdown */}
        {(stats.totalInvested > 0 || hasRareOrAbove) && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#1a2a3c]">
            {stats.totalInvested > 0 && (
              <span className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)]">
                Invested: <GoldDisplay amount={stats.totalInvested} size="sm" />
              </span>
            )}
            {hasRareOrAbove && (
              <div className="flex items-center gap-1.5">
                {(["LEGENDARY", "EPIC", "RARE", "UNCOMMON"] as const).map(r =>
                  stats.rarities[r] ? (
                    <span key={r} className="flex items-center gap-0.5">
                      <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">{stats.rarities[r]}x</span>
                      <PixelBadge rarity={r} />
                    </span>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips speech bubble */}
      {tips.length > 0 && (
        <div className="relative">
          <div className="flex items-start gap-2.5 pl-1">
            <img
              src={getUiIconUrl("liongotchi_heart")}
              alt=""
              width={22}
              height={22}
              className="flex-shrink-0 mt-1"
              style={{ imageRendering: "pixelated" }}
            />
            <div
              className="relative border-2 border-[#4080f0] bg-[#0c1428] px-3 py-2 flex-1"
              style={{ boxShadow: "2px 2px 0 #060810" }}
            >
              <div
                className="absolute -left-[7px] top-2.5 w-0 h-0"
                style={{
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderRight: "6px solid #4080f0",
                }}
              />
              {tips.map((tip, i) => (
                <p key={i} className="font-pixel text-[10px] text-[#80b0ff] leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HudStat({ icon, value, color, sub, subColor, pulse }: {
  icon: React.ReactNode; value: string; color: string; sub?: string; subColor?: string; pulse?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div>
        <span className={`font-pixel text-base ${pulse ? "animate-harvest-pulse" : ""}`} style={{ color }}>{value}</span>
        {sub && <span className="font-pixel text-[11px] block" style={{ color: subColor }}>{sub}</span>}
      </div>
    </div>
  )
}
