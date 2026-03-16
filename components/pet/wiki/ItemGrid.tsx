// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item grid view with clickable cards
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import { Users } from "lucide-react"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"

const rarityBorderColor: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
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
        const borderColor = rarityBorderColor[item.rarity] ?? "#2a3a5c"
        return (
          <Link key={item.id} href={`/pet/wiki/${item.id}`}>
            <div
              className="group relative bg-[#0f1628] border-2 p-3 transition-all cursor-pointer flex flex-col items-center gap-2 shadow-[2px_2px_0_#060810] hover:shadow-[4px_4px_0_#060810] hover:-translate-x-[1px] hover:-translate-y-[1px]"
              style={{ borderColor }}
            >
              <div className="w-16 h-16 flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <div
                    className="w-12 h-12 flex items-center justify-center text-2xl border-2 bg-[#0a0e1a]"
                    style={{ borderColor: `${borderColor}40` }}
                  >
                    {getCategoryPlaceholder(item.category)}
                  </div>
                )}
              </div>
              <p
                className="font-pixel text-[10px] text-center truncate w-full"
                style={{ color: borderColor }}
              >
                {item.name}
              </p>
              <PixelBadge rarity={item.rarity} />
              {item.goldPrice != null && item.goldPrice > 0 && (
                <GoldDisplay amount={item.goldPrice} size="sm" />
              )}
              {item.userOwned > 0 && (
                <span
                  className="absolute top-1 right-1 font-pixel px-1.5 py-0.5 text-[9px] border bg-[#40d870]/15 text-[#40d870] border-[#40d870]"
                >
                  x{item.userOwned}
                </span>
              )}
              <span className="font-pixel text-[9px] text-[#4a5a70] flex items-center gap-0.5">
                <Users size={8} /> {item.ownerCount}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
