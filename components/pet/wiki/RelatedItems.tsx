// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Horizontal scrollable row of related items
// ============================================================
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Show separate sections for set members, tag-related, and category-related items
import Link from "next/link"
import { getItemImageUrl, getCategoryPlaceholder } from "@/utils/petAssets"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"

const rarityBorderColor: Record<string, string> = {
  COMMON: "#6a7a8a", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

interface Item { id: number; name: string; rarity: string; category: string; assetPath: string | null; goldPrice: number | null }

const TAG_LABELS: Record<string, string> = {
  animals: "Animals", warrior: "Warrior", professions: "Professions",
  fantasy: "Fantasy", cultural: "Cultural", casual: "Casual",
  holiday: "Holiday", masks: "Masks", hero: "Hero",
}

function ItemRow({ items }: { items: Item[] }) {
  return (
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
                  <CroppedItemImage src={imgUrl} alt="" className="w-full h-full object-contain" />
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
            </div>
          </Link>
        )
      })}
    </div>
  )
}

const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"]
const RARITY_SHORT: Record<string, string> = {
  COMMON: "C", UNCOMMON: "UC", RARE: "R", EPIC: "E", LEGENDARY: "L", MYTHICAL: "M",
}

function RarityBadges({ currentRarity, variants }: { currentRarity: string; variants: Item[] }) {
  const all = [{ rarity: currentRarity, id: null as number | null }, ...variants.map(v => ({ rarity: v.rarity, id: v.id }))]
  all.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))

  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((v) => {
        const color = rarityBorderColor[v.rarity] ?? "#6a7a8a"
        const isCurrent = v.id === null
        const inner = (
          <span
            className={`font-pixel text-[11px] px-2 py-1 border-2 inline-block transition-all ${isCurrent ? "shadow-[2px_2px_0_#060810]" : "opacity-70 hover:opacity-100 cursor-pointer hover:shadow-[2px_2px_0_#060810]"}`}
            style={{ borderColor: color, color, backgroundColor: isCurrent ? `${color}20` : "#0a0e1a" }}
          >
            {RARITY_SHORT[v.rarity] ?? v.rarity}
          </span>
        )
        if (isCurrent) return <span key={v.rarity} title={`${v.rarity} (viewing)`}>{inner}</span>
        return <Link key={v.id} href={`/pet/wiki/${v.id}`}><span title={v.rarity}>{inner}</span></Link>
      })}
    </div>
  )
}

interface RelatedItemsProps {
  items?: Item[]
  setItems?: Item[]
  tagItems?: Item[]
  rarityVariants?: Item[]
  setName?: string | null
  tag?: string | null
  currentRarity?: string
}

export default function RelatedItems({ items, setItems, tagItems, rarityVariants, setName, tag, currentRarity }: RelatedItemsProps) {
  const hasVariants = rarityVariants && rarityVariants.length > 0
  const hasSet = setItems && setItems.length > 0
  const hasTag = tagItems && tagItems.length > 0
  const hasLegacy = items && items.length > 0 && !hasSet && !hasTag && !hasVariants

  if (!hasVariants && !hasSet && !hasTag && !hasLegacy) return null

  return (
    <div className="space-y-4">
      {hasVariants && currentRarity && (
        <div>
          <h3 className="font-pixel text-base text-[#c0d0e0] mb-3">Available Rarities</h3>
          <RarityBadges currentRarity={currentRarity} variants={rarityVariants} />
        </div>
      )}
      {hasSet && (
        <div>
          <h3 className="font-pixel text-base text-[#c0d0e0] mb-3">
            {setName ? `${setName}` : "Rest of Set"}
          </h3>
          <ItemRow items={setItems} />
        </div>
      )}
      {hasTag && (
        <div>
          <h3 className="font-pixel text-base text-[#c0d0e0] mb-3">
            Similar Items {tag ? `\u2022 ${TAG_LABELS[tag] ?? tag}` : ""}
          </h3>
          <ItemRow items={tagItems} />
        </div>
      )}
      {hasLegacy && (
        <div>
          <h3 className="font-pixel text-base text-[#c0d0e0] mb-3">Related Items</h3>
          <ItemRow items={items} />
        </div>
      )}
    </div>
  )
}
// --- END AI-MODIFIED ---
