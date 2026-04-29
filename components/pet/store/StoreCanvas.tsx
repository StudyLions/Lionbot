// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 -- renders the seller's lion as a
//          "shopkeeper" using the existing RoomCanvas. Phase 2:
//          accepts a `themeId`, `animationId`, and `accentColor`
//          so the surrounding store wrapper can be styled per
//          theme; the lion + room rendering still happens via
//          RoomCanvas inside a GameBoy frame so the visual
//          investment users have already made in /pet/room shows
//          up on every theme.
//
//          Defensive: handles missing pet visual data (e.g. seller
//          never created a pet) by rendering a friendly placeholder
//          instead of crashing.
// ============================================================
import dynamic from "next/dynamic"
import { mergeLayout } from "@/utils/roomConstraints"
import SpeechBubble from "./SpeechBubble"
import { Heart } from "lucide-react"
import {
  STORE_THEMES, STORE_ANIMATIONS,
  sanitizeAccentColor,
  type StoreThemeId, type StoreAnimationId,
} from "@/constants/StoreThemes"

const GameboyFrame = dynamic(() => import("@/components/pet/GameboyFrame"), { ssr: false })
const RoomCanvas = dynamic(() => import("@/components/pet/room/RoomCanvas"), { ssr: false })

interface StorePetData {
  name: string
  level: number
  expression: string
  roomPrefix: string
  furniture: Record<string, string>
  roomLayout: Record<string, unknown>
  equipment: Record<string, {
    name: string
    category: string
    rarity: string
    assetPath: string
    glowTier: string
    glowIntensity: number
  }>
}

interface StoreCanvasProps {
  pet: StorePetData | null
  /** Path to the active gameboy skin asset, or null for the default frame. */
  gameboySkinPath?: string | null
  /** Speech bubble text. If empty/null nothing is rendered. */
  speechBubble?: string | null
  /** Owner name shown under the lion. */
  shopkeeperName?: string
  /** Hex color override used for the speech bubble border. Falls back to theme accent. */
  accentColor?: string | null
  /** Pixel width of the GameBoy frame. */
  width?: number
  /** Animate the lion sprite. Defaults to true on the public store page. */
  animated?: boolean
  /** Theme id for the surrounding wrapper styling. */
  themeId?: StoreThemeId
  /**
   * Background animation id. Honored only when the chosen animation tier
   * matches the seller's tier (validation already happened in the API
   * layer; this just maps the id to the right CSS class).
   */
  animationId?: StoreAnimationId
}

export default function StoreCanvas({
  pet,
  gameboySkinPath,
  speechBubble,
  shopkeeperName,
  accentColor,
  width = 360,
  animated = true,
  themeId = "default",
  animationId = "none",
}: StoreCanvasProps) {
  const theme = STORE_THEMES[themeId] ?? STORE_THEMES.default
  const anim = STORE_ANIMATIONS[animationId] ?? STORE_ANIMATIONS.none
  const effectiveAccent = sanitizeAccentColor(accentColor) ?? theme.accent

  if (!pet) {
    return (
      <div
        className="border-2 border-dashed flex flex-col items-center justify-center gap-2 p-6 text-center"
        style={{
          width, height: width,
          borderColor: theme.panelBorder, background: theme.panelBackground,
        }}
      >
        <Heart size={28} style={{ color: theme.textDim }} />
        <p className="font-pixel text-[11px] leading-relaxed" style={{ color: theme.textDim }}>
          This shopkeeper hasn&apos;t hatched their lion yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width }}>
        <GameboyFrame
          isFullscreen={false}
          skinAssetPath={gameboySkinPath ?? undefined}
          width={width}
        >
          <RoomCanvas
            roomPrefix={pet.roomPrefix}
            furniture={pet.furniture}
            layout={mergeLayout(pet.roomLayout as any)}
            equipment={pet.equipment}
            expression={pet.expression}
            animated={animated}
          />
        </GameboyFrame>

        {speechBubble ? (
          <div className="hidden lg:block absolute top-4 left-full ml-4 z-10">
            <SpeechBubble tailSide="left" accentColor={effectiveAccent}>
              {speechBubble}
            </SpeechBubble>
          </div>
        ) : null}
      </div>

      {speechBubble ? (
        <div className="block lg:hidden w-full max-w-sm">
          <SpeechBubble tailSide="bottom" accentColor={effectiveAccent} className="mx-auto">
            {speechBubble}
          </SpeechBubble>
        </div>
      ) : null}

      {shopkeeperName ? (
        <p className="font-pixel text-[12px]" style={{ color: theme.textDim }}>
          {pet.name} <span style={{ color: `${theme.textDim}99` }}>&middot;</span>{" "}
          <span>tended by {shopkeeperName}</span>
        </p>
      ) : (
        <p className="font-pixel text-[12px]" style={{ color: theme.textDim }}>
          {pet.name}
        </p>
      )}

      {/* Phantom animation tag so consumers don't have to wire it up
          themselves -- the actual class is also applied to the page wrapper
          by callers that want the full background animation. */}
      <span className="hidden" data-animation={anim.id} aria-hidden />
    </div>
  )
}
