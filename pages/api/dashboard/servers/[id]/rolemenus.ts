// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for role menus and their roles
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guildId = BigInt(req.query.id as string)

  if (req.method === "GET") {
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const menus = await prisma.role_menus.findMany({
      where: { guildid: guildId },
      include: { role_menu_roles: { orderBy: { menuroleid: "asc" } } },
      orderBy: { menuid: "asc" },
    })

    return res.status(200).json({
      menus: menus.map((m) => ({
        menuId: m.menuid,
        name: m.name,
        menuType: m.menutype,
        enabled: m.enabled,
        channelId: m.channelid?.toString() || null,
        messageId: m.messageid?.toString() || null,
        requiredRoleId: m.required_roleid?.toString() || null,
        sticky: m.sticky ?? false,
        refunds: m.refunds ?? false,
        obtainable: m.obtainable,
        defaultPrice: m.default_price,
        eventLog: m.event_log ?? false,
        roles: m.role_menu_roles.map((r) => ({
          roleEntryId: r.menuroleid,
          roleId: r.roleid.toString(),
          label: r.label,
          emoji: r.emoji,
          description: r.description,
          price: r.price,
          duration: r.duration,
        })),
      })),
    })
  }

  if (req.method === "POST") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { action } = req.body

    if (action === "createMenu") {
      const { name, menuType } = req.body
      if (!name || !menuType) return res.status(400).json({ error: "name and menuType required" })
      if (!["REACTION", "BUTTON", "DROPDOWN"].includes(menuType)) {
        return res.status(400).json({ error: "menuType must be REACTION, BUTTON, or DROPDOWN" })
      }

      const menu = await prisma.role_menus.create({
        data: {
          guildid: guildId,
          name,
          menutype: menuType,
          enabled: true,
        },
      })

      return res.status(201).json({ menuId: menu.menuid, name: menu.name })
    }

    if (action === "addRole") {
      const { menuId, roleId, label, emoji, description, price, duration } = req.body
      if (!menuId || !roleId || !label) {
        return res.status(400).json({ error: "menuId, roleId, and label required" })
      }

      const menu = await prisma.role_menus.findUnique({ where: { menuid: menuId } })
      if (!menu || menu.guildid !== guildId) return res.status(404).json({ error: "Menu not found" })

      const role = await prisma.role_menu_roles.create({
        data: {
          menuid: menuId,
          roleid: BigInt(roleId),
          label,
          emoji: emoji || null,
          description: description || null,
          price: typeof price === "number" ? price : null,
          duration: typeof duration === "number" ? duration : null,
        },
      })

      return res.status(201).json({ roleEntryId: role.menuroleid })
    }

    return res.status(400).json({ error: "Invalid action. Use createMenu or addRole." })
  }

  if (req.method === "PATCH") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { action } = req.body

    if (action === "updateMenu") {
      const { menuId, name, enabled, sticky, refunds, obtainable, defaultPrice, eventLog } = req.body
      if (!menuId) return res.status(400).json({ error: "menuId required" })

      const menu = await prisma.role_menus.findUnique({ where: { menuid: menuId } })
      if (!menu || menu.guildid !== guildId) return res.status(404).json({ error: "Menu not found" })

      const updates: Record<string, any> = {}
      if (typeof name === "string") updates.name = name
      if (typeof enabled === "boolean") updates.enabled = enabled
      if (typeof sticky === "boolean") updates.sticky = sticky
      if (typeof refunds === "boolean") updates.refunds = refunds
      if (typeof obtainable === "number" || obtainable === null) updates.obtainable = obtainable
      if (typeof defaultPrice === "number" || defaultPrice === null) updates.default_price = defaultPrice
      if (typeof eventLog === "boolean") updates.event_log = eventLog

      await prisma.role_menus.update({ where: { menuid: menuId }, data: updates })
      return res.status(200).json({ success: true })
    }

    if (action === "updateRole") {
      const { roleEntryId, label, emoji, description, price, duration } = req.body
      if (!roleEntryId) return res.status(400).json({ error: "roleEntryId required" })

      const roleEntry = await prisma.role_menu_roles.findUnique({ where: { menuroleid: roleEntryId } })
      if (!roleEntry) return res.status(404).json({ error: "Role entry not found" })

      const menu = await prisma.role_menus.findUnique({ where: { menuid: roleEntry.menuid } })
      if (!menu || menu.guildid !== guildId) return res.status(404).json({ error: "Menu not found" })

      const updates: Record<string, any> = {}
      if (typeof label === "string") updates.label = label
      if (typeof emoji === "string" || emoji === null) updates.emoji = emoji
      if (typeof description === "string" || description === null) updates.description = description
      if (typeof price === "number" || price === null) updates.price = price
      if (typeof duration === "number" || duration === null) updates.duration = duration

      await prisma.role_menu_roles.update({ where: { menuroleid: roleEntryId }, data: updates })
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: "Invalid action. Use updateMenu or updateRole." })
  }

  if (req.method === "DELETE") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { action, menuId, roleEntryId } = req.body

    if (action === "deleteMenu") {
      if (!menuId) return res.status(400).json({ error: "menuId required" })
      const menu = await prisma.role_menus.findUnique({ where: { menuid: menuId } })
      if (!menu || menu.guildid !== guildId) return res.status(404).json({ error: "Menu not found" })

      await prisma.role_menus.delete({ where: { menuid: menuId } })
      return res.status(200).json({ success: true })
    }

    if (action === "deleteRole") {
      if (!roleEntryId) return res.status(400).json({ error: "roleEntryId required" })
      const roleEntry = await prisma.role_menu_roles.findUnique({ where: { menuroleid: roleEntryId } })
      if (!roleEntry) return res.status(404).json({ error: "Role entry not found" })

      const menu = await prisma.role_menus.findUnique({ where: { menuid: roleEntry.menuid } })
      if (!menu || menu.guildid !== guildId) return res.status(404).json({ error: "Menu not found" })

      await prisma.role_menu_roles.delete({ where: { menuroleid: roleEntryId } })
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: "Invalid action. Use deleteMenu or deleteRole." })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
