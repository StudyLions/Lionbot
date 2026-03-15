// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item list view row
// ============================================================
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Coins, Users } from "lucide-react"
import type { WikiItemData } from "./ItemGrid"

const rarityColor: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-amber-400", MYTHICAL: "text-rose-400",
}
const rarityBadge: Record<string, string> = {
  COMMON: "bg-gray-500/15 text-gray-400", UNCOMMON: "bg-green-500/15 text-green-400",
  RARE: "bg-blue-500/15 text-blue-400", EPIC: "bg-purple-500/15 text-purple-400",
  LEGENDARY: "bg-amber-500/15 text-amber-400", MYTHICAL: "bg-rose-500/15 text-rose-400",
}

export default function ItemListView({ items }: { items: WikiItemData[] }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_80px_70px_80px_60px_60px] gap-2 px-3 py-2 bg-muted/10 text-[10px] font-semibold text-muted-foreground/60 uppercase">
        <span />
        <span>Name</span>
        <span>Category</span>
        <span>Rarity</span>
        <span>Price</span>
        <span>Owners</span>
        <span>Owned</span>
      </div>
      {items.map((item) => {
        const imgUrl = getItemImageUrl(item.assetPath, item.category)
        return (
          <Link key={item.id} href={`/pet/wiki/${item.id}`}>
            <div className="grid grid-cols-[40px_1fr_80px_70px_80px_60px_60px] gap-2 px-3 py-2 border-t border-border/30 hover:bg-muted/10 transition-colors items-center cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <span className="text-lg">{getCategoryPlaceholder(item.category)}</span>
                )}
              </div>
              <span className={cn("text-xs font-medium truncate", rarityColor[item.rarity])}>{item.name}</span>
              <span className="text-[10px] text-muted-foreground/60">{item.category.replace("_", " ")}</span>
              <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold w-fit", rarityBadge[item.rarity])}>
                {item.rarity}
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                {item.goldPrice ? <><Coins size={9} /> {item.goldPrice.toLocaleString()}</> : <span className="text-muted-foreground/30">--</span>}
              </span>
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                <Users size={8} /> {item.ownerCount}
              </span>
              <span className={cn("text-[10px] font-semibold", item.userOwned > 0 ? "text-emerald-400" : "text-muted-foreground/30")}>
                {item.userOwned > 0 ? `x${item.userOwned}` : "--"}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
