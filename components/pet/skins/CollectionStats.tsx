// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Collection progress header with overall progress bar,
//          per-type stats, and balance display
// ============================================================
import { SkinData, UNLOCK_BADGE } from "./skinTypes"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

interface CollectionStatsProps {
  skins: SkinData[]
  gold: number
  gems: number
  petLevel: number
}

export default function CollectionStats({ skins, gold, gems, petLevel }: CollectionStatsProps) {
  const total = skins.length
  const owned = skins.filter((s) => s.owned).length
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0

  const unlockTypes = ["FREE", "GOLD", "GEMS", "LEVEL"] as const
  const typeCounts = unlockTypes.map((type) => {
    const ofType = skins.filter((s) => s.unlockType === type)
    const ownedOfType = ofType.filter((s) => s.owned)
    return { type, total: ofType.length, owned: ownedOfType.length }
  }).filter((t) => t.total > 0)

  return (
    <div
      className="border-[3px] border-[#3a4a6c] bg-gradient-to-b from-[#111828] to-[#0c1020]"
      style={{ boxShadow: "3px 3px 0 #060810, inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Top row: progress + balance */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
              {owned}/{total} Collected
            </span>
            <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
              {pct}%
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <GoldDisplay amount={gold} size="md" />
            <div className="w-px h-4 bg-[#2a3a5c]" />
            <GoldDisplay amount={gems} size="md" type="gem" />
            <div className="w-px h-4 bg-[#2a3a5c]" />
            <span className="font-pixel text-[13px] text-[#4080f0]">Lv.{petLevel}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-[2px]">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-[6px] flex-1 transition-colors"
              style={{
                backgroundColor: i < owned ? "#d060f0" : "#1a1e2c",
                minWidth: 2,
              }}
            />
          ))}
        </div>

        {/* Type breakdown */}
        <div className="flex items-center gap-3 flex-wrap">
          {typeCounts.map(({ type, total: t, owned: o }) => {
            const badge = UNLOCK_BADGE[type]
            const complete = o === t
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="font-pixel text-[9px] px-1.5 py-0.5 uppercase"
                  style={{
                    color: badge.color,
                    backgroundColor: `${badge.bg}15`,
                    border: `1px solid ${badge.bg}30`,
                  }}
                >
                  {badge.label}
                </span>
                <span
                  className="font-pixel text-[11px]"
                  style={{ color: complete ? badge.color : "#6a7a8c" }}
                >
                  {o}/{t}
                  {complete && " \u2713"}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
