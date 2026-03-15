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

export default function GameboyFrame({ children, isFullscreen }: GameboyFrameProps) {
  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      {/* Frame image overlays on top */}
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
      {/* Scene renders behind the frame, inside the "screen" cutout */}
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
