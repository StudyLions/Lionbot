// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Skin card for the gallery -- larger thumbnails with
//          clear visual states and selection highlight
// ============================================================
import { getGameboyFrameUrl } from "@/utils/petAssets"
import { SkinData, UNLOCK_BADGE, formatSkinLabel } from "./skinTypes"

interface SkinCardProps {
  skin: SkinData
  selected: boolean
  onClick: (skin: SkinData) => void
}

export default function SkinCard({ skin, selected, onClick }: SkinCardProps) {
  const badge = UNLOCK_BADGE[skin.unlockType] ?? UNLOCK_BADGE.FREE
  const isLocked = !skin.owned && !skin.eligible

  const borderColor = selected
    ? "#d060f0"
    : skin.active
      ? "#f0c040"
      : skin.owned
        ? "#3a5a4c"
        : isLocked
          ? "#1a1e2c"
          : "#2a3a5c"

  const shadow = selected
    ? "0 0 12px rgba(208,96,240,0.25)"
    : skin.active
      ? "0 0 8px rgba(240,192,64,0.2)"
      : "1px 1px 0 #060810"

  return (
    <button
      onClick={() => onClick(skin)}
      className="relative text-left border-2 bg-[#080c18] p-2 transition-all duration-150 hover:brightness-110 hover:scale-[1.02] focus:outline-none group"
      style={{ borderColor, boxShadow: shadow }}
    >
      {/* Active badge */}
      {skin.active && (
        <span className="absolute top-1.5 right-1.5 font-pixel text-[9px] px-1.5 py-0.5 bg-[#f0c040]/15 border border-[#f0c040]/40 text-[#f0c040] uppercase z-10">
          Active
        </span>
      )}

      {/* Owned checkmark */}
      {skin.owned && !skin.active && (
        <span className="absolute top-1.5 right-1.5 text-[#40d870] z-10">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" fill="#40d870" fillOpacity="0.15" stroke="#40d870" strokeOpacity="0.4" strokeWidth="1" />
            <path d="M4 8L7 11L12 5" stroke="#40d870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#060810]/50 z-[5] flex items-center justify-center pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-40">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#4a5a70" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#4a5a70" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div className="flex justify-center mb-2 bg-[#060810] border border-[#1a2a3c] p-1.5">
        <img
          src={getGameboyFrameUrl(skin.assetPath)}
          alt={formatSkinLabel(skin.theme, skin.color)}
          className="h-[140px] w-auto"
          style={{ imageRendering: "pixelated", opacity: isLocked ? 0.45 : 1 }}
          draggable={false}
        />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] truncate">
            {skin.color.replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
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
            {skin.unlockType === "GOLD" && skin.goldPrice != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#f0c040]">{skin.goldPrice}G</span>
            )}
            {skin.unlockType === "GEMS" && skin.gemPrice != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#d060f0]">{skin.gemPrice} Gems</span>
            )}
            {skin.unlockType === "LEVEL" && skin.unlockLevel != null && !skin.owned && (
              <span className="font-pixel text-[10px] text-[#4080f0]">Lv.{skin.unlockLevel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#d060f0]" />
      )}
    </button>
  )
}
