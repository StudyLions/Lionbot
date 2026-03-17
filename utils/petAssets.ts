// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Map database asset_path / asset_prefix to web URLs
//          All assets served from Vercel Blob CDN
// ============================================================

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ""

function blobUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: Add BOOTS category for footwear (split from COSTUME)
const EQUIPMENT_CATEGORIES = new Set([
  "HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS",
])
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-15) ---
// Purpose: Add MATERIAL, SCROLL, and BOOTS support; materials/scrolls
//          use asset_path directly (no equipment/ prefix needed)
export function getItemImageUrl(
  assetPath: string | null | undefined,
  category: string
): string | null {
  if (!assetPath) return null

  if (EQUIPMENT_CATEGORIES.has(category)) {
    return blobUrl(`equipment/${assetPath}`)
  }

  if (category === "FURNITURE") {
    return blobUrl(`rooms/furniture/${assetPath}`)
  }

  if (category === "MATERIAL" || category === "SCROLL") {
    return blobUrl(assetPath)
  }

  return null
}
// --- END AI-MODIFIED ---

// --- Farm asset helpers ---

const RARITY_COLOR_INDEX: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
}

const SEED_PLANT_MAP: Record<string, string> = {
  "pollen:1":  "farm/plants/a_50.gif",
  "pollen:2":  "farm/plants/b_60.gif",
  "pollen:3":  "farm/plants/c_40.gif",
  "pollen:4":  "farm/plants/d_90.gif",
  "pollen:5":  "farm/plants/e_95.gif",
  "pollen:6":  "farm/plants/a_22.gif",
  "pollen:7":  "farm/plants/b_38.gif",
  "pollen:8":  "farm/plants/d_55.gif",
  "pollen:9":  "farm/plants/e_48.gif",
  "pollen:10": "farm/plants/c_88.gif",
}

export function getFarmBackgroundUrl(isNight: boolean): string {
  return blobUrl(`farm/backgrounds/farm_${isNight ? "night" : "day"}.png`)
}

export function getFarmSoilUrl(plotNum: number, isWatered: boolean): string {
  const prefix = isWatered ? "watered" : "dry"
  const dir = isWatered ? "watered" : "dry"
  return blobUrl(`farm/soil/${dir}/${prefix}soil${plotNum}.png`)
}

export function getFarmTreeUrl(typeId: number, stage: number, rarity: string = "COMMON"): string {
  const color = RARITY_COLOR_INDEX[rarity] || 1
  const clampedStage = Math.min(Math.max(stage, 1), 5)
  const idx = (typeId - 1) * 25 + (color - 1) * 5 + clampedStage
  return blobUrl(`farm/trees/trees_${String(idx).padStart(2, "0")}.png`)
}

export function getFarmPollenUrl(pollenId: number): string {
  return blobUrl(`farm/pollen/pollen_plant_${String(pollenId).padStart(2, "0")}.png`)
}

export function getFarmPlantImageUrl(
  assetPrefix: string,
  plantType: string,
  typeId: number,
  stage: number,
  rarity: string = "COMMON"
): string | null {
  if (stage < 1) return null

  if (plantType === "tree" && typeId >= 1 && typeId <= 20) {
    return getFarmTreeUrl(typeId, stage, rarity)
  }

  const gifPath = SEED_PLANT_MAP[assetPrefix]
  if (gifPath) {
    return blobUrl(gifPath)
  }

  if (plantType === "pollen") {
    return getFarmPollenUrl(typeId)
  }

  return getFarmTreeUrl(typeId, stage, rarity)
}

export function getFarmAnimationUrl(name: string, frame: number): string {
  return blobUrl(`farm/animations/${name}_${String(frame).padStart(2, "0")}.png`)
}

export function getUiIconUrl(name: string): string {
  return blobUrl(`ui/icons/${name}.png`)
}

export function getUiBarUrl(type: string, level: number, max: number): string {
  return blobUrl(`ui/bars/${type}_bars_${level}_${max}.png`)
}

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Accept full asset_path from DB (e.g. "gameboy/frames/flat/blue.png")
//          instead of constructing the path from a short name
export function getGameboyFrameUrl(assetPath?: string): string {
  return blobUrl(assetPath || "gameboy/frames/gameboy-basic-01.png")
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Room layer and lion sprite URL helpers for the room editor

export function getRoomLayerUrl(roomPrefix: string, layerName: string): string {
  return blobUrl(`${roomPrefix}/${layerName}.png`)
}

export function getRoomLayerVariantUrl(roomPrefix: string, layerName: string, variant: number): string {
  return blobUrl(`${roomPrefix}/${layerName}_${variant}.png`)
}

export function getLionSpriteUrl(part: string, frame: number): string {
  return blobUrl(`lion/${part}/${part}_${frame + 1}.png`)
}

export function getLionExpressionUrl(expression: string, frame: number): string {
  return blobUrl(`lion/expressions/${expression}/face_${frame + 1}.png`)
}

export function getRoomPreviewUrl(roomPrefix: string): string {
  return blobUrl(`${roomPrefix}/wall_1.png`)
}

export function getFurnitureUrl(assetPath: string): string {
  return blobUrl(`rooms/furniture/${assetPath}`)
}

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Per-frame equipment URL for animated equipment (4 frames like the lion).
//          Strips the file extension, appends _{frame+1}.png.
//          Falls back to static URL if frame images don't exist.
export function getEquipmentFrameUrl(assetPath: string, category: string, frame: number): string | null {
  if (!assetPath) return null
  if (!EQUIPMENT_CATEGORIES.has(category)) return null
  const dotIdx = assetPath.lastIndexOf('.')
  const base = dotIdx !== -1 ? assetPath.substring(0, dotIdx) : assetPath
  return blobUrl(`equipment/${base}_${frame + 1}.png`)
}
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---

export function parseAssetPrefix(assetPrefix: string): { plantType: string; typeId: number } {
  const [plantType, idStr] = assetPrefix.split(":")
  return { plantType, typeId: parseInt(idStr, 10) || 1 }
}

export function getCategoryPlaceholder(category: string): string {
  switch (category) {
    case "HAT": return "\u{1F452}"
    case "GLASSES": return "\u{1F453}"
    case "COSTUME": return "\u{1F454}"
    case "SHIRT": return "\u{1F455}"
    case "BOOTS": return "\u{1F462}"
    case "WINGS": return "\u{1FABD}"
    case "MATERIAL": return "\u{1F9F1}"
    case "SCROLL": return "\u{1F4DC}"
    case "FARM_SEED": return "\u{1F331}"
    case "FURNITURE": return "\u{1FA91}"
    case "ROOM": return "\u{1F3E0}"
    case "CONSUMABLE": return "\u{1F9EA}"
    default: return "\u{1F4E6}"
  }
}

export const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400",
  UNCOMMON: "text-blue-400",
  RARE: "text-red-400",
  EPIC: "text-yellow-400",
  LEGENDARY: "text-pink-400",
}

export const RARITY_BG_COLORS: Record<string, string> = {
  COMMON: "bg-gray-500/10 border-gray-500/20",
  UNCOMMON: "bg-blue-500/10 border-blue-500/20",
  RARE: "bg-red-500/10 border-red-500/20",
  EPIC: "bg-yellow-500/10 border-yellow-500/20",
  LEGENDARY: "bg-pink-500/10 border-pink-500/20",
}

export const RARITY_GLOW: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "shadow-blue-500/30 shadow-lg",
  RARE: "shadow-red-500/40 shadow-lg",
  EPIC: "shadow-yellow-500/40 shadow-xl",
  LEGENDARY: "shadow-pink-500/50 shadow-xl",
}
