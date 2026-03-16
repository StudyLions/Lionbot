// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Wiki global search API - cross-type search
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const q = (req.query.q as string) || ""
    if (q.length < 2) return res.status(200).json({ items: [], recipes: [] })

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Crafting removed -- only search items, exclude MATERIAL category
    const items = await prisma.lg_items.findMany({
      where: { name: { contains: q, mode: "insensitive" }, category: { not: "MATERIAL" } },
      select: { itemid: true, name: true, category: true, rarity: true, asset_path: true },
      orderBy: { rarity: "desc" },
      take: 12,
    })

    return res.status(200).json({
      items: items.map((i) => ({
        id: i.itemid, name: i.name, category: i.category, rarity: i.rarity, assetPath: i.asset_path,
      })),
      recipes: [],
    })
    // --- END AI-MODIFIED ---
  },
})
