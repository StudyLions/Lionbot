// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Visual ingredient-to-result recipe flow card
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

const rarityBorderColor: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

interface ItemRef { id: number; name: string; rarity: string; category: string; assetPath: string | null }
interface Ingredient { quantity: number; item: ItemRef }
interface Recipe {
  recipeId: number; resultItem: ItemRef; resultQuantity: number
  goldCost: number; description: string | null; ingredients: Ingredient[]
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const resultImg = getItemImageUrl(recipe.resultItem.assetPath, recipe.resultItem.category)
  const resultBorder = rarityBorderColor[recipe.resultItem.rarity] ?? "#2a3a5c"

  return (
    <div
      className="border-2 border-[#2a3a5c] bg-[#0a0e1a] p-1 shadow-[2px_2px_0_#060810]"
    >
      <div
        className="border-2 border-[#1a2030] bg-[#0f1628] p-4 flex items-center gap-4"
      >
        <div className="flex-1 space-y-1">
          {recipe.ingredients.map((ing, i) => {
            const ingImg = getItemImageUrl(ing.item.assetPath, ing.item.category)
            const ingBorder = rarityBorderColor[ing.item.rarity] ?? "#2a3a5c"
            return (
              <Link key={i} href={`/pet/wiki/${ing.item.id}`}>
                <div
                  className="flex items-center gap-2 border-2 p-1.5 hover:bg-[#111828] transition-colors"
                  style={{ borderColor: `${ingBorder}60`, backgroundColor: "#0a0e1a" }}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    {ingImg ? (
                      <img src={ingImg} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                    ) : (
                      <span className="text-sm">{getCategoryPlaceholder(ing.item.category)}</span>
                    )}
                  </div>
                  <span className="font-pixel text-[10px] truncate" style={{ color: ingBorder }}>
                    {ing.item.name}
                  </span>
                  <span className="font-pixel text-[9px] text-[#4a5a70] ml-auto">x{ing.quantity}</span>
                </div>
              </Link>
            )
          })}
          {recipe.goldCost > 0 && (
            <div className="flex items-center gap-2 border-2 border-[#f0c040]/30 bg-[#0a0e1a] p-1.5">
              <GoldDisplay amount={recipe.goldCost} size="sm" />
              <span className="font-pixel text-[9px] text-[#f0c040]/60">Gold</span>
            </div>
          )}
        </div>

        <span className="font-pixel text-[#4a5a70] text-sm flex-shrink-0 select-none">&gt;&gt;&gt;</span>

        <Link href={`/pet/wiki/${recipe.resultItem.id}`} className="flex-shrink-0">
          <div className="flex flex-col items-center gap-1.5 hover:translate-y-[-2px] transition-transform">
            <div
              className="w-16 h-16 flex items-center justify-center border-2 bg-[#0a0e1a] shadow-[2px_2px_0_#060810]"
              style={{ borderColor: resultBorder }}
            >
              {resultImg ? (
                <img src={resultImg} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-xl">
                  {getCategoryPlaceholder(recipe.resultItem.category)}
                </div>
              )}
            </div>
            <span className="font-pixel text-[10px] text-center" style={{ color: resultBorder }}>
              {recipe.resultItem.name}
            </span>
            <PixelBadge rarity={recipe.resultItem.rarity} />
            {recipe.resultQuantity > 1 && (
              <span className="font-pixel text-[9px] text-[#4a5a70]">x{recipe.resultQuantity}</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
