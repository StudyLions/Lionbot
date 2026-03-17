// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-17
// Purpose: Shared Gameboy device frame wrapper used by farm,
//          overview, and any page that shows a gameboy-framed view.
//          Supports custom skins and responsive width.
// ============================================================
import { getGameboyFrameUrl } from "@/utils/petAssets"

interface GameboyFrameProps {
  children: React.ReactNode
  isFullscreen: boolean
  skinAssetPath?: string
  width?: number
}

const FRAME_NATIVE_W = 260
const FRAME_NATIVE_H = 400
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

  if (isFullscreen) {
    const displayHeight = width * (CROP_Y / FRAME_NATIVE_W)
    const screenTopPct = (SCREEN_TOP / CROP_Y) * 100
    const screenLeftPct = (SCREEN_LEFT / FRAME_NATIVE_W) * 100
    const screenWidthPct = (SCREEN_SIZE / FRAME_NATIVE_W) * 100
    const screenHeightPct = (SCREEN_SIZE / CROP_Y) * 100

    return (
      <div className="relative inline-block" style={{ width, height: displayHeight }}>
        <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none select-none">
          <img
            src={frameUrl}
            alt=""
            style={{
              imageRendering: "pixelated",
              width,
              height: width * (FRAME_NATIVE_H / FRAME_NATIVE_W),
            }}
            draggable={false}
          />
        </div>
        <div
          className="absolute z-0 flex items-center justify-center"
          style={{
            top: `${screenTopPct}%`,
            left: `${screenLeftPct}%`,
            width: `${screenWidthPct}%`,
            height: `${screenHeightPct}%`,
            overflow: "hidden",
            backgroundColor: "#0a0e1a",
          }}
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <img
        src={frameUrl}
        alt=""
        className="relative z-10 pointer-events-none select-none"
        style={{
          imageRendering: "pixelated",
          width,
          height: "auto",
        }}
        draggable={false}
      />
      <div
        className="absolute z-0 flex items-center justify-center"
        style={{
          top: `${(SCREEN_TOP / FRAME_NATIVE_H) * 100}%`,
          left: `${(SCREEN_LEFT / FRAME_NATIVE_W) * 100}%`,
          width: `${(SCREEN_SIZE / FRAME_NATIVE_W) * 100}%`,
          height: `${(SCREEN_SIZE / FRAME_NATIVE_H) * 100}%`,
          overflow: "hidden",
          backgroundColor: "#0a0e1a",
        }}
      >
        {children}
      </div>
    </div>
  )
}
