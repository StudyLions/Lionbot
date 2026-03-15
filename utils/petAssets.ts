// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Map database asset_path / asset_prefix to web URLs
// ============================================================

const EQUIPMENT_CATEGORIES = new Set([
  "HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS",
])

export function getItemImageUrl(
  assetPath: string | null | undefined,
  category: string
): string | null {
  if (!assetPath) return null

  if (EQUIPMENT_CATEGORIES.has(category)) {
    return `/pet-assets/equipment/${assetPath}`
  }

  if (category === "FURNITURE") {
    return `/pet-assets/rooms/furniture/${assetPath}`
  }

  return null
}

export function getFarmPlantImageUrl(
  plantType: string,
  seedId: number,
  stage: number
): string | null {
  if (plantType === "tree") {
    const typeId = seedId
    const color = 1
    const clampedStage = Math.min(Math.max(stage, 1), 5)
    const idx = (typeId - 1) * 25 + (color - 1) * 5 + clampedStage
    return `/pet-assets/farm/trees/trees_${String(idx).padStart(2, "0")}.png`
  }

  if (plantType === "pollen") {
    const pollenId = seedId - 10
    if (pollenId >= 1 && pollenId <= 25) {
      return `/pet-assets/farm/pollen/pollen_plant_${String(pollenId).padStart(2, "0")}.png`
    }
  }

  return null
}

export function getCategoryPlaceholder(category: string): string {
  switch (category) {
    case "HAT": return "👒"
    case "GLASSES": return "👓"
    case "COSTUME": return "👔"
    case "SHIRT": return "👕"
    case "WINGS": return "🪽"
    case "MATERIAL": return "🧱"
    case "SCROLL": return "📜"
    case "FARM_SEED": return "🌱"
    case "FURNITURE": return "🪑"
    case "ROOM": return "🏠"
    case "CONSUMABLE": return "🧪"
    default: return "📦"
  }
}
