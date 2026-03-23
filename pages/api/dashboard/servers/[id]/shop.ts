// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for server shop items (colour roles + room rentals)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
// --- AI-REPLACED (2026-03-23) ---
// Reason: GET needs requireAuth + isMember instead of requireModerator so all guild members can browse
// What the new code does better: allows any guild member to see shop items while keeping admin writes secure
// --- Original code (commented out for rollback) ---
// import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- End original code ---
import { requireAuth, requireAdmin, isMember, isModerator, isAdmin } from "@/utils/adminAuth"
// --- END AI-REPLACED ---
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  // --- AI-REPLACED (2026-03-23) ---
  // Reason: Allow any guild member to browse shop items, not just moderators
  // What the new code does better: returns shop items + room config + user balance for member browse view
  // --- Original code (commented out for rollback) ---
  // async GET(req, res) {
  //   const guildId = parseBigInt(req.query.id, "guild ID")
  //   const auth = await requireModerator(req, res, guildId)
  //   if (!auth) return
  //   const items = await prisma.shop_items.findMany({
  //     where: { guildid: guildId, deleted: { not: true } },
  //     include: { shop_items_colour_roles: true },
  //     orderBy: { created_at: "desc" },
  //   })
  //   return res.status(200).json({
  //     items: items.map((item) => ({
  //       itemId: item.itemid,
  //       itemType: item.item_type,
  //       price: item.price,
  //       purchasable: item.purchasable ?? true,
  //       createdAt: item.created_at,
  //       roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
  //     })),
  //   })
  // },
  // --- End original code ---
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const memberCheck = await isMember(userId, guildId)
    if (!memberCheck) {
      return res.status(403).json({ error: "You are not a member of this server" })
    }

    const [items, guildConfig, memberData, inventory, isModResult, isAdminResult] = await Promise.all([
      prisma.shop_items.findMany({
        where: { guildid: guildId, deleted: { not: true } },
        include: { shop_items_colour_roles: true, shop_items_room_rentals: true },
        orderBy: { created_at: "desc" },
      }),
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { renting_price: true, renting_category: true, renting_cap: true },
      }),
      prisma.members.findUnique({
        where: { guildid_userid: { guildid: guildId, userid: userId } },
        select: { coins: true },
      }),
      prisma.member_inventory.findMany({
        where: { guildid: guildId, userid: userId },
        select: { itemid: true },
      }),
      isModerator(auth, guildId),
      isAdmin(auth, guildId),
    ])

    const ownedItemIds = new Set(inventory.map((inv) => inv.itemid))

    return res.status(200).json({
      items: items.map((item) => ({
        itemId: item.itemid,
        itemType: item.item_type,
        price: item.price,
        purchasable: item.purchasable ?? true,
        createdAt: item.created_at,
        roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
        duration: item.shop_items_room_rentals?.duration || null,
        owned: ownedItemIds.has(item.itemid),
      })),
      roomConfig: {
        enabled: !!guildConfig?.renting_category,
        dailyRent: guildConfig?.renting_price ?? 1000,
        memberCap: guildConfig?.renting_cap ?? 25,
      },
      userBalance: memberData?.coins ?? 0,
      permissions: {
        isMod: isModResult,
        isAdmin: isAdminResult,
      },
    })
  },
  // --- END AI-REPLACED ---

  // --- AI-REPLACED (2026-03-23) ---
  // Reason: Support creating both COLOUR_ROLE and ROOM_RENTAL items
  // What the new code does better: accepts itemType param to create room rental packages
  // --- Original code (commented out for rollback) ---
  // async POST(req, res) {
  //   const guildId = parseBigInt(req.query.id, "guild ID")
  //   const auth = await requireAdmin(req, res, guildId)
  //   if (!auth) return
  //   const { roleId, price } = req.body
  //   if (!roleId || typeof price !== "number" || price < 0) {
  //     return res.status(400).json({ error: "roleId and price (non-negative number) are required" })
  //   }
  //   const item = await prisma.shop_items.create({
  //     data: {
  //       guildid: guildId,
  //       item_type: "COLOUR_ROLE",
  //       price,
  //       purchasable: true,
  //       deleted: false,
  //       shop_items_colour_roles: {
  //         create: { roleid: parseBigInt(roleId, "role ID") },
  //       },
  //     },
  //     include: { shop_items_colour_roles: true },
  //   })
  //   return res.status(201).json({
  //     itemId: item.itemid,
  //     itemType: item.item_type,
  //     price: item.price,
  //     purchasable: item.purchasable,
  //     roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
  //   })
  // },
  // --- End original code ---
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { itemType, roleId, price, duration } = req.body
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "price (non-negative number) is required" })
    }

    const type = itemType || "COLOUR_ROLE"

    if (type === "ROOM_RENTAL") {
      if (typeof duration !== "number" || duration < 1 || duration > 30) {
        return res.status(400).json({ error: "duration (1-30) is required for room rentals" })
      }
      const item = await prisma.shop_items.create({
        data: {
          guildid: guildId,
          item_type: "ROOM_RENTAL",
          price,
          purchasable: true,
          deleted: false,
          shop_items_room_rentals: { create: { duration } },
        },
        include: { shop_items_room_rentals: true },
      })
      return res.status(201).json({
        itemId: item.itemid,
        itemType: item.item_type,
        price: item.price,
        purchasable: item.purchasable,
        duration: item.shop_items_room_rentals?.duration || null,
        roleId: null,
      })
    }

    if (!roleId) {
      return res.status(400).json({ error: "roleId is required for colour roles" })
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
    return res.status(201).json({
      itemId: item.itemid,
      itemType: item.item_type,
      price: item.price,
      purchasable: item.purchasable,
      roleId: item.shop_items_colour_roles?.roleid?.toString() || null,
      duration: null,
    })
  },
  // --- END AI-REPLACED ---

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { itemId, price, purchasable, duration } = req.body
    if (!itemId) return res.status(400).json({ error: "itemId required" })

    const existing = await prisma.shop_items.findUnique({ where: { itemid: itemId } })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Item not found" })
    }

    const updates: Record<string, any> = {}
    if (typeof price === "number") {
      if (price < 0) return res.status(400).json({ error: "Price must be non-negative" })
      updates.price = price
    }
    if (typeof purchasable === "boolean") updates.purchasable = purchasable

    if (Object.keys(updates).length > 0) {
      await prisma.shop_items.update({ where: { itemid: itemId }, data: updates })
    }

    // --- AI-MODIFIED (2026-03-23) ---
    // Purpose: Support updating duration for room rental items
    if (typeof duration === "number" && duration >= 1 && duration <= 30) {
      await prisma.shop_items_room_rentals.update({
        where: { itemid: itemId },
        data: { duration },
      })
    }
    // --- END AI-MODIFIED ---

    if (Object.keys(updates).length === 0 && typeof duration !== "number") {
      return res.status(400).json({ error: "No valid fields to update" })
    }

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
