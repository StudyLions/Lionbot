// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-04
// Purpose: Shared, read-only WIKI (item catalog) logic for the Anki addon.
//          browseWiki(userId, filters) -> paginated catalog with per-item
//          owner counts + "you own N". getWikiItem(userId, id) -> a light
//          detail (item fields + ownership + scroll odds + rarity variants).
//          Mirrors pages/api/pet/wiki/items.ts; the heavy detail bits
//          (marketplace stats, enhancement leaderboard, set/tag webs) are
//          intentionally left out of the addon detail.
// ============================================================
import { prisma } from "@/utils/prisma"
import { PetServiceError } from "@/lib/pet/careService"

const SORT_MAP: Record<string, any> = {
  name_asc: [{ name: "asc" as const }],
  name_desc: [{ name: "desc" as const }],
  rarity_desc: [{ rarity: "desc" as const }, { name: "asc" as const }],
  rarity_asc: [{ rarity: "asc" as const }, { name: "asc" as const }],
  price_desc: [{ gold_price: "desc" as const }, { name: "asc" as const }],
  price_asc: [{ gold_price: "asc" as const }, { name: "asc" as const }],
}

export async function browseWiki(
  userId: bigint,
  opts: { search?: string; category?: string; rarity?: string; sort?: string; page?: number; pageSize?: number }
) {
  const search = opts.search || ""
  const category = opts.category || ""
  const rarityParam = opts.rarity || ""
  const sort = opts.sort || "rarity_desc"
  const page = Math.max(1, Number(opts.page) || 1)
  const pageSize = Math.min(100, Math.max(10, Number(opts.pageSize) || 40))

  // Validate enum filters so a bad query param can't crash Prisma (→503).
  const VALID_RARITY = new Set(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"])
  const VALID_CATEGORY = new Set(["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS", "SCROLL", "FURNITURE", "FARM_SEED"])
  const where: any = { category: { not: "MATERIAL" } }
  if (search) where.name = { contains: search, mode: "insensitive" }
  if (category && VALID_CATEGORY.has(category)) where.category = category
  if (rarityParam) {
    const rarities = rarityParam.split(",").filter((r) => VALID_RARITY.has(r))
    if (rarities.length === 1) where.rarity = rarities[0]
    else if (rarities.length > 1) where.rarity = { in: rarities }
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP.rarity_desc

  const [items, total] = await Promise.all([
    prisma.lg_items.findMany({
      where,
      select: {
        itemid: true, name: true, category: true, slot: true, rarity: true,
        asset_path: true, gold_price: true, gem_price: true, tradeable: true, description: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lg_items.count({ where }),
  ])

  const itemIds = items.map((i) => i.itemid)
  const userOwnedMap: Record<number, number> = {}
  if (itemIds.length > 0) {
    const userItems = await prisma.lg_user_inventory.groupBy({
      by: ["itemid"],
      where: { userid: userId, itemid: { in: itemIds } },
      _sum: { quantity: true },
    })
    for (const ui of userItems) userOwnedMap[ui.itemid] = ui._sum.quantity ?? 0
  }

  return {
    items: items.map((i) => ({
      id: i.itemid,
      name: i.name,
      category: i.category,
      slot: i.slot,
      rarity: i.rarity,
      assetPath: i.asset_path,
      goldPrice: i.gold_price,
      gemPrice: i.gem_price,
      tradeable: i.tradeable,
      description: i.description,
      userOwned: userOwnedMap[i.itemid] ?? 0,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  }
}

export async function getWikiItem(userId: bigint, itemIdRaw: unknown) {
  const itemId = parseInt(String(itemIdRaw), 10)
  if (!Number.isFinite(itemId)) throw new PetServiceError(400, "bad_id", "Invalid itemId")

  const item = await prisma.lg_items.findUnique({
    where: { itemid: itemId },
    select: {
      itemid: true, name: true, category: true, slot: true, rarity: true,
      asset_path: true, gold_price: true, gem_price: true, tradeable: true,
      description: true, drop_weight: true, item_set: { select: { name: true } },
    },
  })
  if (!item) throw new PetServiceError(404, "not_found", "Item not found")

  const ownerCountRaw = await prisma.$queryRaw<[{ cnt: bigint }]>`
    SELECT COUNT(DISTINCT userid) as cnt FROM lg_user_inventory WHERE itemid = ${itemId}`
  const ownerCount = Number(ownerCountRaw[0]?.cnt ?? 0)

  const inv = await prisma.lg_user_inventory.aggregate({
    where: { userid: userId, itemid: itemId },
    _sum: { quantity: true },
  })

  let scrollProperties = null
  if (item.category === "SCROLL") {
    scrollProperties = await prisma.lg_scroll_properties.findUnique({
      where: { itemid: itemId },
      select: { success_rate: true, destroy_rate: true, bonus_value: true },
    })
  }

  const rarityVariants = await prisma.lg_items.findMany({
    where: { name: item.name, category: item.category, itemid: { not: itemId } },
    select: { itemid: true, rarity: true, asset_path: true },
    orderBy: { rarity: "asc" },
  })

  return {
    item: {
      id: item.itemid, name: item.name, category: item.category, slot: item.slot,
      rarity: item.rarity, assetPath: item.asset_path, goldPrice: item.gold_price,
      gemPrice: item.gem_price, tradeable: item.tradeable, description: item.description,
      setName: item.item_set?.name ?? null,
    },
    ownerCount,
    userOwned: inv._sum.quantity ?? 0,
    scrollProperties: scrollProperties
      ? {
          successRate: scrollProperties.success_rate,
          destroyRate: scrollProperties.destroy_rate,
          bonusValue: scrollProperties.bonus_value,
        }
      : null,
    rarityVariants: rarityVariants.map((r) => ({ id: r.itemid, rarity: r.rarity, assetPath: r.asset_path })),
  }
}
