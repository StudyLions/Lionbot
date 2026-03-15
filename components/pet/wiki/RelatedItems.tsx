// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Horizontal scrollable row of related items
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Coins } from "lucide-react"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBg: Record<string, string> = {
  COMMON: "bg-gray-500/5", UNCOMMON: "bg-green-500/5", RARE: "bg-blue-500/5",
  EPIC: "bg-purple-500/5", LEGENDARY: "bg-amber-500/5", MYTHICAL: "bg-rose-500/5",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/15", UNCOMMON: "border-green-500/15", RARE: "border-blue-500/15",
  EPIC: "border-purple-500/15", LEGENDARY: "border-amber-500/15", MYTHICAL: "border-rose-500/15",
}

interface Item { id: number; name: string; rarity: string; category: string; assetPath: string | null; goldPrice: number | null }

export default function RelatedItems({ items }: { items: Item[] }) {
  if (!items.length) return null

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Related Items</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item) => {
          const imgUrl = getItemImageUrl(item.assetPath, item.category)
          return (
            <Link key={item.id} href={`/pet/wiki/${item.id}`}>
              <div className={cn(
                "flex-shrink-0 w-28 rounded-xl border p-3 flex flex-col items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer",
                rarityBorder[item.rarity], rarityBg[item.rarity]
              )}>
                <div className="w-12 h-12 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="text-xl">{getCategoryPlaceholder(item.category)}</span>
                  )}
                </div>
                <span className={cn("text-[10px] font-semibold text-center truncate w-full", rarityColor[item.rarity])}>
                  {item.name}
                </span>
                {item.goldPrice && (
                  <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                    <Coins size={8} /> {item.goldPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
