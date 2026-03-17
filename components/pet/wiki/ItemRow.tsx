// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki item list view row
// ============================================================
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { Users } from "lucide-react"
import type { WikiItemData } from "./ItemGrid"
import PixelBadge from "@/components/pet/ui/PixelBadge"

const rarityTextColor: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

export default function ItemListView({ items }: { items: WikiItemData[] }) {
  return (
    <div className="border-2 border-[#2a3a5c] bg-[#0a0e1a] overflow-hidden shadow-[2px_2px_0_#060810]">
      <div className="grid grid-cols-[40px_1fr_80px_70px_80px_60px_60px] gap-2 px-3 py-2 bg-[#111828] border-b-2 border-[#2a3a5c]">
        <span />
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Name</span>
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Category</span>
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Rarity</span>
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Price</span>
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Owners</span>
        <span className="font-pixel text-[12px] text-[#4a5a70] uppercase">Owned</span>
      </div>
      {items.map((item, i) => {
        const imgUrl = getItemImageUrl(item.assetPath, item.category)
        return (
          <Link key={item.id} href={`/pet/wiki/${item.id}`}>
            <div
              className="grid grid-cols-[40px_1fr_80px_70px_80px_60px_60px] gap-2 px-3 py-2 border-t border-[#1a2a3c] hover:bg-[#111828] transition-colors items-center cursor-pointer"
              style={{ backgroundColor: i % 2 === 0 ? "#0c1020" : "#0a0e1a" }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {imgUrl ? (
                  <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-lg">{getCategoryPlaceholder(item.category)}</span>
                )}
              </div>
              <span
                className="font-pixel text-[13px] truncate"
                style={{ color: rarityTextColor[item.rarity] ?? "#8899aa" }}
              >
                {item.name}
              </span>
              <span className="font-pixel text-[12px] text-[#4a5a70]">{item.category.replace("_", " ")}</span>
              <PixelBadge rarity={item.rarity} />
              <span className="font-pixel text-[12px] text-[#4a5a70] flex items-center gap-0.5">
                <Users size={16} /> {item.ownerCount}
              </span>
              <span className="font-pixel text-[12px]" style={{ color: item.userOwned > 0 ? "#40d870" : "#2a3a50" }}>
                {item.userOwned > 0 ? `x${item.userOwned}` : "--"}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
