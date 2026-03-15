// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item grid view with clickable cards
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Coins, Users } from "lucide-react"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBorder: Record<string, string> = {
  COMMON: "border-gray-500/20", UNCOMMON: "border-green-500/20", RARE: "border-blue-500/20",
  EPIC: "border-purple-500/20", LEGENDARY: "border-amber-500/20", MYTHICAL: "border-rose-500/20",
}
const rarityBg: Record<string, string> = {
  COMMON: "bg-gray-500/5", UNCOMMON: "bg-green-500/5", RARE: "bg-blue-500/5",
  EPIC: "bg-purple-500/5", LEGENDARY: "bg-amber-500/5", MYTHICAL: "bg-rose-500/5",
}
const rarityBadge: Record<string, string> = {
  COMMON: "bg-gray-500/15 text-gray-400", UNCOMMON: "bg-green-500/15 text-green-400",
  RARE: "bg-blue-500/15 text-blue-400", EPIC: "bg-purple-500/15 text-purple-400",
  LEGENDARY: "bg-amber-500/15 text-amber-400", MYTHICAL: "bg-rose-500/15 text-rose-400",
}

export interface WikiItemData {
  id: number; name: string; category: string; slot: string | null; rarity: string
  assetPath: string; goldPrice: number | null; gemPrice: number | null
  tradeable: boolean; description: string; ownerCount: number; userOwned: number
}

export default function ItemGrid({ items }: { items: WikiItemData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const imgUrl = getItemImageUrl(item.assetPath, item.category)
        return (
          <Link key={item.id} href={`/pet/wiki/${item.id}`}>
            <div className={cn(
              "group relative rounded-xl border p-3 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer flex flex-col items-center gap-2",
              rarityBorder[item.rarity], rarityBg[item.rarity]
            )}>
              <div className="w-16 h-16 flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", rarityBg[item.rarity])}>
                    {getCategoryPlaceholder(item.category)}
                  </div>
                )}
              </div>
              <p className={cn("text-xs font-semibold text-center truncate w-full", rarityColor[item.rarity])}>
                {item.name}
              </p>
              <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", rarityBadge[item.rarity])}>
                {item.rarity}
              </span>
              {item.goldPrice && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <Coins size={9} /> {item.goldPrice.toLocaleString()}
                </span>
              )}
              {item.userOwned > 0 && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  x{item.userOwned}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5">
                <Users size={8} /> {item.ownerCount}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
