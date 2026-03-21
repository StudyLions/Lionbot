// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for server shop items (colour roles)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID and body roleId
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const items = await prisma.shop_items.findMany({
      where: { guildid: guildId, deleted: { not: true } },
      include: { shop_items_colour_roles: true },
      orderBy: { created_at: "desc" },
    })

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: renamed id->itemId, type->itemType to match shop.tsx interface
    return res.status(200).json({
      items: items.map((item) => ({
        itemId: item.itemid,
        itemType: item.item_type,
        price: item.price,
        purchasable: item.purchasable ?? true,
        createdAt: item.created_at,
        roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
      })),
    })
    // --- END AI-MODIFIED ---
  },
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { roleId, price } = req.body
    if (!roleId || typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "roleId and price (non-negative number) are required" })
    }

    const item = await prisma.shop_items.create({
      data: {
        guildid: guildId,
        item_type: "COLOUR_ROLE",
        price,
        purchasable: true,
        deleted: false,
        shop_items_colour_roles: {
          create: { roleid: parseBigInt(roleId, "role ID") },
        },
      },
      include: { shop_items_colour_roles: true },
    })

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: renamed id->itemId, type->itemType to match shop.tsx interface
    return res.status(201).json({
      itemId: item.itemid,
      itemType: item.item_type,
      price: item.price,
      purchasable: item.purchasable,
      roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
    })
    // --- END AI-MODIFIED ---
  },
  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { itemId, price, purchasable } = req.body
    if (!itemId) return res.status(400).json({ error: "itemId required" })

    const existing = await prisma.shop_items.findUnique({ where: { itemid: itemId } })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Item not found" })
    }

    const updates: Record<string, any> = {}
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Reject negative prices on PATCH (POST already validates >= 0)
    if (typeof price === "number") {
      if (price < 0) return res.status(400).json({ error: "Price must be non-negative" })
      updates.price = price
    }
    // --- END AI-MODIFIED ---
    if (typeof purchasable === "boolean") updates.purchasable = purchasable

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.shop_items.update({ where: { itemid: itemId }, data: updates })
    return res.status(200).json({ success: true })
  },
  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { itemId } = req.body
    if (!itemId) return res.status(400).json({ error: "itemId required" })

    const existing = await prisma.shop_items.findUnique({ where: { itemid: itemId } })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Item not found" })
    }

    await prisma.shop_items.update({
      where: { itemid: itemId },
      data: { deleted: true },
    })
    return res.status(200).json({ success: true })
  },
})
// --- END AI-MODIFIED ---
