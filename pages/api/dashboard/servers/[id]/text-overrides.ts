// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Purpose: Text Branding API -- CRUD for guild text overrides.
//          GET returns all overrides for a guild.
//          PUT upserts a single override.
//          DELETE removes a single override.
//          POST with action=export returns all overrides as JSON.
//          POST with action=import bulk-upserts overrides.
//          POST with action=reset-all deletes all overrides.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const MAX_CUSTOM_TEXT_LENGTH = 2000
const MAX_OVERRIDES_FREE = 3
const MAX_OVERRIDES_PREMIUM = 10000

export default apiHandler({

  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const overrides = await prisma.guild_text_overrides.findMany({
      where: { guildid: guildId },
      orderBy: { text_key: "asc" },
    })

    const premium = await prisma.premium_guilds.findUnique({
      where: { guildid: guildId },
      select: { premium_until: true },
    })
    const isPremium = premium?.premium_until
      ? premium.premium_until > new Date()
      : false

    res.json({
      overrides: overrides.map((o) => ({
        text_key: o.text_key,
        domain: o.domain,
        custom_text: o.custom_text,
        custom_text_plural: o.custom_text_plural,
        updated_at: o.updated_at?.toISOString() ?? null,
        updated_by: o.updated_by?.toString() ?? null,
      })),
      count: overrides.length,
      isPremium,
      maxOverrides: isPremium ? MAX_OVERRIDES_PREMIUM : MAX_OVERRIDES_FREE,
    })
  },

  async PUT(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { text_key, domain, custom_text, custom_text_plural } = req.body
    if (!text_key || typeof text_key !== "string") {
      return res.status(400).json({ error: "text_key is required" })
    }
    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" })
    }
    if (!custom_text || typeof custom_text !== "string") {
      return res.status(400).json({ error: "custom_text is required" })
    }
    if (custom_text.length > MAX_CUSTOM_TEXT_LENGTH) {
      return res.status(400).json({ error: `custom_text exceeds max length of ${MAX_CUSTOM_TEXT_LENGTH}` })
    }

    const premium = await prisma.premium_guilds.findUnique({
      where: { guildid: guildId },
      select: { premium_until: true },
    })
    const isPremium = premium?.premium_until
      ? premium.premium_until > new Date()
      : false

    if (!isPremium) {
      const existingCount = await prisma.guild_text_overrides.count({
        where: { guildid: guildId },
      })
      const isUpdate = await prisma.guild_text_overrides.findUnique({
        where: { guildid_text_key: { guildid: guildId, text_key } },
      })
      if (!isUpdate && existingCount >= MAX_OVERRIDES_FREE) {
        return res.status(403).json({
          error: "Free servers can customize up to 3 texts. Upgrade to premium for unlimited.",
          requiresPremium: true,
        })
      }
    }

    const discordId = auth.discordId ? BigInt(auth.discordId) : null

    const override = await prisma.guild_text_overrides.upsert({
      where: {
        guildid_text_key: { guildid: guildId, text_key },
      },
      create: {
        guildid: guildId,
        text_key,
        domain,
        custom_text,
        custom_text_plural: custom_text_plural || null,
        updated_by: discordId,
      },
      update: {
        custom_text,
        custom_text_plural: custom_text_plural || null,
        domain,
        updated_at: new Date(),
        updated_by: discordId,
      },
    })

    res.json({
      success: true,
      override: {
        text_key: override.text_key,
        domain: override.domain,
        custom_text: override.custom_text,
        custom_text_plural: override.custom_text_plural,
        updated_at: override.updated_at?.toISOString() ?? null,
      },
    })
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { text_key } = req.body || req.query
    if (!text_key || typeof text_key !== "string") {
      return res.status(400).json({ error: "text_key is required" })
    }

    await prisma.guild_text_overrides.deleteMany({
      where: { guildid: guildId, text_key },
    })

    res.json({ success: true, deleted: text_key })
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { action } = req.body
    const discordId = auth.discordId ? BigInt(auth.discordId) : null

    if (action === "export") {
      const overrides = await prisma.guild_text_overrides.findMany({
        where: { guildid: guildId },
        orderBy: { text_key: "asc" },
      })

      return res.json({
        version: "1.0",
        exported_at: new Date().toISOString(),
        guild_id: guildId.toString(),
        count: overrides.length,
        overrides: overrides.map((o) => ({
          text_key: o.text_key,
          domain: o.domain,
          custom_text: o.custom_text,
          custom_text_plural: o.custom_text_plural,
        })),
      })
    }

    if (action === "import") {
      const premium = await prisma.premium_guilds.findUnique({
        where: { guildid: guildId },
        select: { premium_until: true },
      })
      const isPremium = premium?.premium_until
        ? premium.premium_until > new Date()
        : false

      if (!isPremium) {
        return res.status(403).json({
          error: "Import requires premium.",
          requiresPremium: true,
        })
      }

      const { overrides } = req.body
      if (!Array.isArray(overrides)) {
        return res.status(400).json({ error: "overrides array is required" })
      }

      let imported = 0
      for (const o of overrides) {
        if (!o.text_key || !o.domain || !o.custom_text) continue
        if (typeof o.custom_text !== "string") continue
        if (o.custom_text.length > MAX_CUSTOM_TEXT_LENGTH) continue

        await prisma.guild_text_overrides.upsert({
          where: {
            guildid_text_key: { guildid: guildId, text_key: o.text_key },
          },
          create: {
            guildid: guildId,
            text_key: o.text_key,
            domain: o.domain,
            custom_text: o.custom_text,
            custom_text_plural: o.custom_text_plural || null,
            updated_by: discordId,
          },
          update: {
            custom_text: o.custom_text,
            custom_text_plural: o.custom_text_plural || null,
            domain: o.domain,
            updated_at: new Date(),
            updated_by: discordId,
          },
        })
        imported++
      }

      return res.json({ success: true, imported })
    }

    if (action === "reset-all") {
      const deleted = await prisma.guild_text_overrides.deleteMany({
        where: { guildid: guildId },
      })
      return res.json({ success: true, deleted: deleted.count })
    }

    if (action === "backup") {
      const { backup_name } = req.body
      if (!backup_name || typeof backup_name !== "string") {
        return res.status(400).json({ error: "backup_name is required" })
      }

      const overrides = await prisma.guild_text_overrides.findMany({
        where: { guildid: guildId },
      })

      await prisma.text_override_backups.create({
        data: {
          guildid: guildId,
          backup_name,
          backup_data: overrides.map((o) => ({
            text_key: o.text_key,
            domain: o.domain,
            custom_text: o.custom_text,
            custom_text_plural: o.custom_text_plural,
          })),
          created_by: discordId,
        },
      })

      return res.json({ success: true, backed_up: overrides.length })
    }

    if (action === "list-backups") {
      const backups = await prisma.text_override_backups.findMany({
        where: { guildid: guildId },
        orderBy: { created_at: "desc" },
        select: {
          backup_id: true,
          backup_name: true,
          created_at: true,
          created_by: true,
        },
      })

      return res.json({
        backups: backups.map((b) => ({
          ...b,
          created_by: b.created_by?.toString() ?? null,
          created_at: b.created_at?.toISOString() ?? null,
        })),
      })
    }

    if (action === "restore") {
      const { backup_id } = req.body
      if (!backup_id) {
        return res.status(400).json({ error: "backup_id is required" })
      }

      const backup = await prisma.text_override_backups.findUnique({
        where: { backup_id: Number(backup_id) },
      })
      if (!backup || backup.guildid !== guildId) {
        return res.status(404).json({ error: "Backup not found" })
      }

      await prisma.guild_text_overrides.deleteMany({
        where: { guildid: guildId },
      })

      const overrides = backup.backup_data as Array<{
        text_key: string
        domain: string
        custom_text: string
        custom_text_plural?: string
      }>

      let restored = 0
      for (const o of overrides) {
        if (!o.text_key || !o.domain || !o.custom_text) continue
        await prisma.guild_text_overrides.create({
          data: {
            guildid: guildId,
            text_key: o.text_key,
            domain: o.domain,
            custom_text: o.custom_text,
            custom_text_plural: o.custom_text_plural || null,
            updated_by: discordId,
          },
        })
        restored++
      }

      return res.json({ success: true, restored })
    }

    return res.status(400).json({ error: "Unknown action" })
  },
})
