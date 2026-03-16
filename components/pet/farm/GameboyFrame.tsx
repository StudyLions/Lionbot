// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Gameboy device frame wrapper around the farm scene
// ============================================================
import { getGameboyFrameUrl } from "@/utils/petAssets"

interface GameboyFrameProps {
  children: React.ReactNode
  isFullscreen: boolean
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Fullscreen shows the upper half of the Gameboy (bezel + screen)
// cropped below the screen, so each skin still looks like a device.
// Frame PNG is 260x400: screen top at y=36 (9%), screen bottom at y=236 (59%).
// Crop at y=244 (61%) to include ~8px of bezel below the screen.

const FRAME_WIDTH = 260
const CROP_Y = 244
const CROP_RATIO = CROP_Y / 400

export default function GameboyFrame({ children, isFullscreen }: GameboyFrameProps) {
  if (isFullscreen) {
    const displayWidth = 880
    const displayHeight = displayWidth * (CROP_Y / FRAME_WIDTH)
    const screenTopPct = (36 / CROP_Y) * 100
    const screenLeftPct = (30 / FRAME_WIDTH) * 100
    const screenWidthPct = (200 / FRAME_WIDTH) * 100
    const screenHeightPct = (200 / CROP_Y) * 100

    return (
      <div className="relative inline-block" style={{ width: displayWidth, height: displayHeight }}>
        <div
          className="absolute inset-0 overflow-hidden z-10 pointer-events-none select-none"
        >
          <img
            src={getGameboyFrameUrl()}
            alt=""
            style={{
              imageRendering: "pixelated",
              width: displayWidth,
              height: displayWidth * (400 / FRAME_WIDTH),
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
  // --- END AI-MODIFIED ---

  return (
    <div className="relative inline-block">
      <img
        src={getGameboyFrameUrl()}
        alt=""
        className="relative z-10 pointer-events-none select-none"
        style={{
          imageRendering: "pixelated",
          width: 880,
          height: "auto",
        }}
        draggable={false}
      />
      <div
        className="absolute z-0 flex items-center justify-center"
        style={{
          top: "8.5%",
          left: "5.8%",
          width: "88.4%",
          height: "58%",
          overflow: "hidden",
          backgroundColor: "#0a0e1a",
        }}
      >
        {children}
      </div>
    </div>
  )
}
