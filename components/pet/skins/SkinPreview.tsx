// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Skin preview panel -- large GameboyFrame preview,
//          compare with active skin, purchase confirmation
// ============================================================
import { useState, useCallback } from "react"
import GameboyFrame from "@/components/pet/GameboyFrame"
import PixelButton from "@/components/pet/ui/PixelButton"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import { SkinData, UNLOCK_BADGE, formatThemeName, formatSkinLabel } from "./skinTypes"

interface SkinPreviewProps {
  skin: SkinData
  activeSkin: SkinData | null
  gold: number
  gems: number
  loadingId: number | null
  onEquip: (skinId: number) => void
  onPurchase: (skinId: number) => void
  onClose: () => void
}

export default function SkinPreview({
  skin,
  activeSkin,
  gold,
  gems,
  loadingId,
  onEquip,
  onPurchase,
  onClose,
}: SkinPreviewProps) {
  const [confirming, setConfirming] = useState(false)
  const badge = UNLOCK_BADGE[skin.unlockType] ?? UNLOCK_BADGE.FREE
  const isLoading = loadingId === skin.skinId
  const isLocked = !skin.owned && !skin.eligible

  const showCompare = activeSkin && activeSkin.skinId !== skin.skinId

  const cost = skin.unlockType === "GOLD" ? skin.goldPrice ?? 0 : skin.gemPrice ?? 0
  const currency = skin.unlockType === "GOLD" ? "gold" : "gems"
  const currentBalance = currency === "gold" ? gold : gems
  const remainingAfter = currentBalance - cost
  const isExpensive = cost > currentBalance * 0.5

  const handleBuyClick = useCallback(() => {
    setConfirming(true)
  }, [])

  const handleConfirm = useCallback(() => {
    setConfirming(false)
    onPurchase(skin.skinId)
  }, [onPurchase, skin.skinId])

  const handleCancel = useCallback(() => {
    setConfirming(false)
  }, [])

  const previewScene = (
    <div className="w-full h-full bg-gradient-to-br from-[#1a2040] via-[#0c1020] to-[#181030] flex items-center justify-center">
      <div className="flex flex-col items-center gap-1 opacity-60">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#4a5a70" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill="#4a5a70" />
          <path d="M12 4V2M12 22V20M4 12H2M22 12H20" stroke="#4a5a70" strokeWidth="1" />
        </svg>
        <span className="font-pixel text-[9px] text-[#3a4a6c]">Preview</span>
      </div>
    </div>
  )

  return (
    <div className="border-[3px] border-[#3a4a6c] bg-[#0c1020] overflow-hidden" style={{ boxShadow: "3px 3px 0 #060810" }}>
      {/* Header */}
      <div className="px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center justify-between">
        <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">SKIN PREVIEW</span>
        <button
          onClick={onClose}
          className="font-pixel text-[14px] text-[#4a5a70] hover:text-[#8899aa] transition-colors px-1"
        >
          x
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview frame(s) */}
        {showCompare ? (
          {/* --- AI-MODIFIED (2026-03-21) --- */}
          {/* Purpose: Stack compare frames vertically on small screens */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-3">
          {/* --- END AI-MODIFIED --- */}
            {/* Active (current) */}
            <div className="text-center space-y-1.5">
              <span className="font-pixel text-[9px] text-[#4a5a70] uppercase block">Current</span>
              <GameboyFrame isFullscreen={false} skinAssetPath={activeSkin.assetPath} width={120}>
                {previewScene}
              </GameboyFrame>
            </div>

            <div className="font-pixel text-lg text-[#3a4a6c] pb-8">&rarr;</div>

            {/* Selected (new) */}
            <div className="text-center space-y-1.5">
              <span className="font-pixel text-[9px] text-[#d060f0] uppercase block">Selected</span>
              <GameboyFrame isFullscreen={false} skinAssetPath={skin.assetPath} width={180}>
                {previewScene}
              </GameboyFrame>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <GameboyFrame isFullscreen={false} skinAssetPath={skin.assetPath} width={220}>
              {previewScene}
            </GameboyFrame>
          </div>
        )}

        {/* Skin info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">
              {formatSkinLabel(skin.theme, skin.color)}
            </h3>
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
          </div>
          <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
            Theme: {formatThemeName(skin.theme)}
          </p>
        </div>

        {/* Purchase confirmation */}
        {confirming && !skin.owned && (
          <div
            className="border-2 p-3 space-y-3"
            style={{
              borderColor: badge.color,
              backgroundColor: `${badge.bg}08`,
            }}
          >
            <p className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">
              Confirm purchase?
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">Cost</span>
                <GoldDisplay amount={cost} size="sm" type={currency === "gold" ? "gold" : "gem"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">Balance after</span>
                <span className={`font-pixel text-[11px] ${remainingAfter < 0 ? "text-[#e04040]" : "text-[var(--pet-text-dim)]"}`}>
                  {remainingAfter.toLocaleString()}
                </span>
              </div>
              {isExpensive && remainingAfter >= 0 && (
                <p className="font-pixel text-[10px] text-[#f0c040] mt-1">
                  This will use over half your {currency}!
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <PixelButton variant="gold" size="sm" onClick={handleConfirm} loading={isLoading} className="flex-1">
                Confirm
              </PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={handleCancel} className="flex-1">
                Cancel
              </PixelButton>
            </div>
          </div>
        )}

        {/* Action button */}
        {!confirming && (
          <div>
            {skin.active ? (
              <div className="text-center">
                <span className="font-pixel text-[13px] text-[var(--pet-gold,#f0c040)]">Currently Active</span>
              </div>
            ) : skin.owned ? (
              <PixelButton variant="info" size="md" onClick={() => onEquip(skin.skinId)} loading={isLoading} className="w-full">
                Equip Skin
              </PixelButton>
            ) : skin.unlockType === "LEVEL" && !skin.eligible ? (
              <div className="text-center space-y-1">
                <span className="font-pixel text-[13px] text-[#4a5a70]">Requires Level {skin.unlockLevel}</span>
                <p className="font-pixel text-[10px] text-[#3a4a6c]">Keep studying to level up!</p>
              </div>
            ) : (skin.unlockType === "GOLD" || skin.unlockType === "GEMS") && skin.eligible ? (
              <PixelButton
                variant="gold"
                size="md"
                onClick={handleBuyClick}
                loading={isLoading}
                className="w-full"
              >
                Buy for {skin.unlockType === "GOLD" ? `${skin.goldPrice}G` : `${skin.gemPrice} Gems`}
              </PixelButton>
            ) : (skin.unlockType === "GOLD" || skin.unlockType === "GEMS") && !skin.eligible ? (
              <div className="text-center space-y-1">
                <span className="font-pixel text-[13px] text-[#4a5a70]">
                  Requires {skin.unlockType === "GOLD" ? `${skin.goldPrice} Gold` : `${skin.gemPrice} Gems`}
                </span>
                <p className="font-pixel text-[10px] text-[#3a4a6c]">
                  You have {skin.unlockType === "GOLD" ? `${gold.toLocaleString()} Gold` : `${gems.toLocaleString()} Gems`}
                </p>
              </div>
            ) : (
              <PixelButton variant="primary" size="md" onClick={() => onEquip(skin.skinId)} loading={isLoading} className="w-full">
                Equip Skin
              </PixelButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
