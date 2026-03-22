// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Compact self-contained pet viewer that renders a
//          GameboyFrame + RoomCanvas at small sizes (~100-160px).
//          Used in leaderboard rows, friend cards, family members.
// ============================================================
import GameboyFrame from "@/components/pet/GameboyFrame"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import { mergeLayout } from "@/utils/roomConstraints"

export interface PetVisualData {
  roomPrefix: string
  furniture: Record<string, string>
  roomLayout: Record<string, unknown>
  equipment: Record<string, { assetPath: string; category: string; glowTier?: string; glowIntensity?: number }>
  expression: string
  skinPath?: string | null
}

interface MiniGameboyProps {
  petData: PetVisualData
  width?: number
  className?: string
}

export default function MiniGameboy({ petData, width = 140, className }: MiniGameboyProps) {
  const layout = mergeLayout(petData.roomLayout as any)

  return (
    <div className={className} style={{ width, maxWidth: "100%" }}>
      <GameboyFrame
        isFullscreen={false}
        skinAssetPath={petData.skinPath ?? undefined}
        width={width}
      >
        <RoomCanvas
          roomPrefix={petData.roomPrefix}
          furniture={petData.furniture}
          layout={layout}
          equipment={petData.equipment}
          expression={petData.expression}
          animated
        />
      </GameboyFrame>
    </div>
  )
}
