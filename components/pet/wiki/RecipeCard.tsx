// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Visual ingredient-to-result recipe flow card
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { ArrowRight, Coins } from "lucide-react"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/20", UNCOMMON: "border-green-500/20", RARE: "border-blue-500/20",
  EPIC: "border-purple-500/20", LEGENDARY: "border-amber-500/20", MYTHICAL: "border-rose-500/20",
}

interface ItemRef { id: number; name: string; rarity: string; category: string; assetPath: string | null }
interface Ingredient { quantity: number; item: ItemRef }
interface Recipe {
  recipeId: number; resultItem: ItemRef; resultQuantity: number
  goldCost: number; description: string | null; ingredients: Ingredient[]
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const resultImg = getItemImageUrl(recipe.resultItem.assetPath, recipe.resultItem.category)

  return (
    <div className={cn("rounded-xl border p-4 bg-muted/5 flex items-center gap-4", rarityBorder[recipe.resultItem.rarity])}>
      <div className="flex-1 space-y-2">
        {recipe.ingredients.map((ing, i) => {
          const ingImg = getItemImageUrl(ing.item.assetPath, ing.item.category)
          return (
            <Link key={i} href={`/pet/wiki/${ing.item.id}`}>
              <div className="flex items-center gap-2 hover:bg-muted/15 rounded-lg px-2 py-1 transition-colors">
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                  {ingImg ? (
                    <img src={ingImg} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="text-sm">{getCategoryPlaceholder(ing.item.category)}</span>
                  )}
                </div>
                <span className={cn("text-[11px] truncate", rarityColor[ing.item.rarity])}>{ing.item.name}</span>
                <span className="text-[10px] text-muted-foreground/40 ml-auto">x{ing.quantity}</span>
              </div>
            </Link>
          )
        })}
        {recipe.goldCost > 0 && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Coins size={14} className="text-amber-400" />
            <span className="text-[11px] text-amber-400">{recipe.goldCost.toLocaleString()} Gold</span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 text-muted-foreground/20">
        <ArrowRight size={20} />
      </div>

      <Link href={`/pet/wiki/${recipe.resultItem.id}`} className="flex-shrink-0">
        <div className="flex flex-col items-center gap-1 hover:scale-105 transition-transform">
          <div className="w-14 h-14 flex items-center justify-center">
            {resultImg ? (
              <img src={resultImg} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-xl">
                {getCategoryPlaceholder(recipe.resultItem.category)}
              </div>
            )}
          </div>
          <span className={cn("text-xs font-semibold text-center", rarityColor[recipe.resultItem.rarity])}>
            {recipe.resultItem.name}
          </span>
          {recipe.resultQuantity > 1 && (
            <span className="text-[9px] text-muted-foreground/40">x{recipe.resultQuantity}</span>
          )}
        </div>
      </Link>
    </div>
  )
}
