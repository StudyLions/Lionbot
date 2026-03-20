// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Shared Gameboy device frame wrapper used by farm,
//          overview, and any page that shows a gameboy-framed view.
//          Supports custom skins and responsive width.
// ============================================================
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Responsive rewrite. Uses width + max-width:100% + aspect-ratio
//          so the frame always maintains correct proportions and shrinks
//          gracefully on narrow viewports without breaking small usages
//          (skin previews at 120/180/220px etc.)
import { getGameboyFrameUrl } from "@/utils/petAssets"

interface GameboyFrameProps {
  children: React.ReactNode
  isFullscreen: boolean
  skinAssetPath?: string
  width?: number
}

const FRAME_W = 260
const FRAME_H = 400
const SCREEN_TOP = 36
const SCREEN_LEFT = 30
const SCREEN_SIZE = 200
const CROP_Y = 244

export default function GameboyFrame({
  children,
  isFullscreen,
  skinAssetPath,
  width = 880,
}: GameboyFrameProps) {
  const frameUrl = getGameboyFrameUrl(skinAssetPath)
  const refH = isFullscreen ? CROP_Y : FRAME_H

  const screenTopPct = (SCREEN_TOP / refH) * 100
  const screenLeftPct = (SCREEN_LEFT / FRAME_W) * 100
  const screenWPct = (SCREEN_SIZE / FRAME_W) * 100
  const screenHPct = (SCREEN_SIZE / refH) * 100

  return (
    <div
      className="relative"
      style={{
        width,
        maxWidth: "100%",
        aspectRatio: `${FRAME_W} / ${refH}`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none select-none">
        <img
          src={frameUrl}
          alt=""
          className="w-full"
          style={{
            imageRendering: "pixelated",
            height: isFullscreen
              ? `${(FRAME_H / CROP_Y) * 100}%`
              : "100%",
          }}
          draggable={false}
        />
      </div>

      <div
        className="absolute z-0 overflow-hidden"
        style={{
          top: `${screenTopPct}%`,
          left: `${screenLeftPct}%`,
          width: `${screenWPct}%`,
          height: `${screenHPct}%`,
          backgroundColor: "#0a0e1a",
        }}
      >
        {children}
      </div>
    </div>
  )
}
// --- END AI-MODIFIED ---
