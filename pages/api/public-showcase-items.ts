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
    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Remove invalid { not: null } filter -- asset_path is non-nullable String in schema
    const items = await prisma.lg_items.findMany({
      where: {
        category: { in: ALL_CATEGORIES as any },
      },
    // --- END AI-MODIFIED ---
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

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Select items with category diversity — at most 1 per category
    //          per rarity round, so the carousel shows varied gear types
    const selected: typeof items = []
    const ids = new Set<number>()
    const categoryCounts = new Map<string, number>()

    for (const rarity of RARITIES) {
      const matching = items.filter((it) => it.rarity === rarity && !ids.has(it.itemid))
      matching.sort((a, b) => (categoryCounts.get(a.category) || 0) - (categoryCounts.get(b.category) || 0))

      let pickedThisRound = 0
      const seenCatsThisRound = new Set<string>()
      for (const item of matching) {
        if (selected.length >= 12 || pickedThisRound >= 2) break
        if (seenCatsThisRound.has(item.category)) continue
        if ((categoryCounts.get(item.category) || 0) >= 2) continue

        selected.push(item)
        ids.add(item.itemid)
        seenCatsThisRound.add(item.category)
        categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1)
        pickedThisRound++
      }
    }

    if (selected.length < 8) {
      for (const item of items) {
        if (selected.length >= 12) break
        if (!ids.has(item.itemid)) {
          selected.push(item)
          ids.add(item.itemid)
        }
      }
    }
    // --- END AI-MODIFIED ---

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
