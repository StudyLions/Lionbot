// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Horizontal trending items row
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { TrendingUp } from "lucide-react"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}

interface TrendingItem {
  item: { id: number; name: string; rarity: string; assetPath: string; category: string }
  tradeCount: number
}

export default function TrendingRow({ items }: { items: TrendingItem[] }) {
  if (!items.length) return null

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
      <h3 className="text-xs font-semibold text-muted-foreground/60 flex items-center gap-1.5 mb-3">
        <TrendingUp size={12} /> Trending (24h)
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {items.map((t) => {
          const imgUrl = getItemImageUrl(t.item.assetPath, t.item.category)
          return (
            <Link key={t.item.id} href={`/pet/wiki/${t.item.id}`}>
              <div className="flex-shrink-0 w-24 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/10 transition-colors">
                <div className="w-10 h-10 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="text-lg">{getCategoryPlaceholder(t.item.category)}</span>
                  )}
                </div>
                <span className={cn("text-[10px] font-semibold truncate w-full text-center", rarityColor[t.item.rarity])}>
                  {t.item.name}
                </span>
                <span className="text-[9px] text-muted-foreground/40">{t.tradeCount} trades</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
