// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Horizontal trending items row
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { TrendingUp } from "lucide-react"

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}
const RARITY_TEXT: Record<string, string> = {
  COMMON: "#8899aa", UNCOMMON: "#80b0ff", RARE: "#ff8080",
  EPIC: "#ffe080", LEGENDARY: "#e0a0ff", MYTHICAL: "#ff90a0",
}

interface TrendingItem {
  item: { id: number; name: string; rarity: string; assetPath: string; category: string }
  tradeCount: number
}

export default function TrendingRow({ items }: { items: TrendingItem[] }) {
  if (!items.length) return null

  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0f1628] p-4 shadow-[2px_2px_0_#060810]">
      <h3 className="font-pixel text-[13px] text-[#4a5a70] flex items-center gap-1.5 mb-3 uppercase tracking-wide">
        <TrendingUp size={16} /> Trending (24h)
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {items.map((t) => {
          const imgUrl = getItemImageUrl(t.item.assetPath, t.item.category)
          const borderColor = RARITY_BORDER[t.item.rarity] || RARITY_BORDER.COMMON
          const textColor = RARITY_TEXT[t.item.rarity] || RARITY_TEXT.COMMON
          // --- AI-MODIFIED (2026-03-20) ---
          // Purpose: Wrap Link child in <a> for Next.js 12 Pages Router compatibility
          return (
            <Link key={t.item.id} href={`/pet/wiki/${t.item.id}`}>
              <a
                className="flex-shrink-0 w-28 flex flex-col items-center gap-1.5 p-2.5 border-2 bg-[#0a0e1a] shadow-[2px_2px_0_#060810] hover:brightness-125 transition-all"
                style={{ borderColor }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {imgUrl ? (
                    <CroppedItemImage src={imgUrl} alt={t.item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-lg">{getCategoryPlaceholder(t.item.category)}</span>
                  )}
                </div>
                <span
                  className="font-pixel text-[9px] truncate w-full text-center"
                  style={{ color: textColor }}
                >
                  {t.item.name}
                </span>
                <span className="font-pixel text-[8px] text-[#3a4a60]">{t.tradeCount} trades</span>
              </a>
            </Link>
          )
          // --- END AI-MODIFIED ---
        })}
      </div>
    </div>
  )
}
