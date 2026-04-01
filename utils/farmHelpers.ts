// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-30
// Purpose: Shared farm utilities (rarity rolls, item drops) used
//          by both personal farm and family farm API routes
// ============================================================
import { prisma } from "@/utils/prisma"

export const RARITY_WEIGHTS: Record<string, number> = {
  COMMON: 50, UNCOMMON: 25, RARE: 15, EPIC: 7, LEGENDARY: 3,
}

export const RARITY_GOLD_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.5, RARE: 2.0, EPIC: 3.0, LEGENDARY: 5.0,
}

export const RARITY_DROP_MULTIPLIER: Record<string, number> = {
  COMMON: 1.0, UNCOMMON: 1.25, RARE: 1.5, EPIC: 2.0, LEGENDARY: 3.0,
}

export const ITEM_DROP_CHANCE_HARVEST = 0.15

export const ITEM_DROP_WEIGHTS: Record<string, number> = {
  COMMON: 45, UNCOMMON: 28, RARE: 15, EPIC: 7, LEGENDARY: 3.5, MYTHICAL: 0.5,
}

const SCROLL_DROP_RATIO = 0.6

export function rollRarity(): string {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight
    if (roll <= 0) return rarity
  }
  return "COMMON"
}

function pickDropRarity(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight
    if (roll <= 0) return rarity
  }
  return "COMMON"
}

export async function tryItemDrop(
  userId: bigint,
  chance: number,
  rarityMultiplier: number = 1.0
): Promise<Array<{ itemId: number; name: string; rarity: string; category: string }> | null> {
  const effectiveChance = Math.min(chance * rarityMultiplier, 0.95)
  if (Math.random() >= effectiveChance) return null

  const boostedWeights = rarityMultiplier > 1.0
    ? Object.fromEntries(
        Object.entries(ITEM_DROP_WEIGHTS).map(([r, w]) =>
          ["EPIC", "LEGENDARY", "MYTHICAL"].includes(r) ? [r, w * rarityMultiplier] : [r, w]
        )
      )
    : ITEM_DROP_WEIGHTS

  const isScroll = Math.random() < SCROLL_DROP_RATIO
  const rarity = pickDropRarity(boostedWeights)

  type ItemRow = { itemid: number; name: string; rarity: string; category: string }
  let item: ItemRow | null = null
  if (isScroll) {
    const rows = await prisma.$queryRaw<ItemRow[]>`
      SELECT itemid, name, rarity::text, category::text FROM lg_items
      WHERE category = 'SCROLL' AND rarity = ${rarity}::lgrarity
      ORDER BY -LN(1.0 - RANDOM()) / GREATEST(drop_weight, 0.001)
      LIMIT 1`
    item = rows[0] ?? null
  } else {
    const rows = await prisma.$queryRaw<ItemRow[]>`
      SELECT itemid, name, rarity::text, category::text FROM lg_items
      WHERE category IN ('HAT','GLASSES','COSTUME','SHIRT','WINGS','BOOTS')
        AND rarity = ${rarity}::lgrarity
      ORDER BY -LN(1.0 - RANDOM()) / GREATEST(drop_weight, 0.001)
      LIMIT 1`
    item = rows[0] ?? null
  }
  if (!item) {
    const rows = await prisma.$queryRaw<ItemRow[]>`
      SELECT itemid, name, rarity::text, category::text FROM lg_items
      WHERE category IN ('HAT','GLASSES','COSTUME','SHIRT','WINGS','BOOTS','SCROLL')
      ORDER BY -LN(1.0 - RANDOM()) / GREATEST(drop_weight, 0.001)
      LIMIT 1`
    item = rows[0] ?? null
  }
  if (!item) return null

  const cat = String(item.category)
  if (cat === "SCROLL") {
    const existing = await prisma.lg_user_inventory.findFirst({
      where: { userid: userId, itemid: item.itemid, enhancement_level: 0 },
    })
    if (existing) {
      await prisma.lg_user_inventory.update({
        where: { inventoryid: existing.inventoryid },
        data: { quantity: { increment: 1 } },
      })
    } else {
      await prisma.lg_user_inventory.create({
        data: { userid: userId, itemid: item.itemid, source: "DROP" as any, quantity: 1, enhancement_level: 0 },
      })
    }
  } else {
    await prisma.lg_user_inventory.create({
      data: { userid: userId, itemid: item.itemid, source: "DROP" as any, quantity: 1, enhancement_level: 0 },
    })
  }

  return [{ itemId: item.itemid, name: item.name, rarity: String(item.rarity), category: cat }]
}
