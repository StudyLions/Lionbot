// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Horizontal scrollable row of related items
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

const rarityBorderColor: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

interface Item { id: number; name: string; rarity: string; category: string; assetPath: string | null; goldPrice: number | null }

export default function RelatedItems({ items }: { items: Item[] }) {
  if (!items.length) return null

  return (
    <div>
      <h3 className="font-pixel text-base text-[#c0d0e0] mb-3">Related Items</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item) => {
          const imgUrl = getItemImageUrl(item.assetPath, item.category)
          const borderColor = rarityBorderColor[item.rarity] ?? "#2a3a5c"
          return (
            <Link key={item.id} href={`/pet/wiki/${item.id}`}>
              <div
                className="flex-shrink-0 w-28 border-2 bg-[#0f1628] p-3 flex flex-col items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#060810] hover:shadow-[4px_4px_0_#060810] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                style={{ borderColor }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="text-xl">{getCategoryPlaceholder(item.category)}</span>
                  )}
                </div>
                <span
                  className="font-pixel text-[12px] text-center truncate w-full"
                  style={{ color: borderColor }}
                >
                  {item.name}
                </span>
                {item.goldPrice != null && item.goldPrice > 0 && (
                  <GoldDisplay amount={item.goldPrice} size="sm" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
