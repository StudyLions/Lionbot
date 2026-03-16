// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Public (no-auth) API endpoint that returns a curated
//          set of items for the homepage marketplace showcase
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"

import { lgitemcategory, lgrarity } from "@prisma/client"

const ALL_CATEGORIES: lgitemcategory[] = [
  lgitemcategory.HAT, lgitemcategory.GLASSES, lgitemcategory.COSTUME,
  lgitemcategory.SHIRT, lgitemcategory.WINGS, lgitemcategory.BOOTS,
  lgitemcategory.SCROLL, lgitemcategory.FURNITURE, lgitemcategory.FARM_SEED,
]
const RARITIES: lgrarity[] = [
  lgrarity.COMMON, lgrarity.UNCOMMON, lgrarity.RARE, lgrarity.EPIC, lgrarity.LEGENDARY,
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const items = await prisma.lg_items.findMany({
      where: {
        asset_path: { not: null },
        category: { in: ALL_CATEGORIES as any },
      },
      select: {
        itemid: true,
        name: true,
        category: true,
        rarity: true,
        asset_path: true,
        gold_price: true,
        gem_price: true,
      },
      orderBy: { itemid: "asc" },
    })

    const selected: typeof items = []
    for (const rarity of RARITIES) {
      const matching = items.filter((it) => it.rarity === rarity)
      const picked = matching.slice(0, 3)
      selected.push(...picked)
    }

    if (selected.length < 8) {
      const ids = new Set(selected.map((s) => s.itemid))
      for (const item of items) {
        if (selected.length >= 12) break
        if (!ids.has(item.itemid)) {
          selected.push(item)
          ids.add(item.itemid)
        }
      }
    }

    const result = selected.slice(0, 12).map((item) => ({
      id: item.itemid,
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      assetPath: item.asset_path,
      goldPrice: item.gold_price,
      gemPrice: item.gem_price,
    }))

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    return res.status(200).json(result)
  } catch (error) {
    console.error("public-showcase-items error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
