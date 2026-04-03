// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Updated: 2026-04-01
// Purpose: Text Branding API -- CRUD for guild text overrides
//          with catalog-backed validation, placeholder safety
//          enforcement, and blocked domain/key protection.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import fs from "fs"
import path from "path"

const MAX_CUSTOM_TEXT_LENGTH = 2000
const MAX_OVERRIDES_FREE = 3
const MAX_OVERRIDES_PREMIUM = 10000

interface CatalogString {
  key: string
  default: string
  category: string
  has_plural: boolean
  string_type: string
  safety: string
  breadcrumb: string
  context_type: string
  context_region: string
  placeholders?: Array<{ name: string; required: boolean }>
  default_plural?: string
  popular?: boolean
}

interface CatalogDomain {
  display_name: string
  strings: CatalogString[]
  count: number
}

interface Catalog {
  version: string
  total_strings: number
  total_domains: number
  domains: Record<string, CatalogDomain>
}

let _catalog: Catalog | null = null
let _keyIndex: Map<string, { domain: string; entry: CatalogString }> | null = null

function loadCatalog(): Catalog {
  if (_catalog) return _catalog
  const catalogPath = path.join(process.cwd(), "public", "string-catalog.json")
  const raw = fs.readFileSync(catalogPath, "utf-8")
  _catalog = JSON.parse(raw) as Catalog
  return _catalog
}

function getKeyIndex(): Map<string, { domain: string; entry: CatalogString }> {
  if (_keyIndex) return _keyIndex
  const catalog = loadCatalog()
  _keyIndex = new Map()
  for (const [domain, domData] of Object.entries(catalog.domains)) {
    for (const entry of domData.strings) {
      _keyIndex.set(entry.key, { domain, entry })
    }
  }
  return _keyIndex
}

function validatePlaceholders(
  customText: string,
  entry: CatalogString
): string[] {
  if (!entry.placeholders || entry.placeholders.length === 0) return []
  const missing: string[] = []
  for (const ph of entry.placeholders) {
    if (ph.required && !customText.includes(`{${ph.name}}`)) {
      missing.push(ph.name)
    }
  }
  return missing
}

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

    const keyIndex = getKeyIndex()
    const catalogEntry = keyIndex.get(text_key)
    if (!catalogEntry) {
      return res.status(400).json({ error: "This text key is not customizable." })
    }
    if (catalogEntry.domain !== domain) {
      return res.status(400).json({ error: "Domain mismatch for this text key." })
    }

    const missingPlaceholders = validatePlaceholders(custom_text, catalogEntry.entry)
    if (missingPlaceholders.length > 0) {
      return res.status(400).json({
        error: "missing_placeholders",
        missing: missingPlaceholders,
        message: `Your custom text is missing required placeholders: ${missingPlaceholders.map(p => `{${p}}`).join(", ")}. The bot needs these to work correctly.`,
      })
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

      const keyIndex = getKeyIndex()
      let imported = 0
      let skipped = 0
      const errors: Array<{ key: string; reason: string }> = []

      for (const o of overrides) {
        if (!o.text_key || !o.domain || !o.custom_text) {
          skipped++
          continue
        }
        if (typeof o.custom_text !== "string") {
          skipped++
          continue
        }
        if (o.custom_text.length > MAX_CUSTOM_TEXT_LENGTH) {
          skipped++
          continue
        }

        const catalogEntry = keyIndex.get(o.text_key)
        if (!catalogEntry) {
          errors.push({ key: o.text_key, reason: "Not in catalog (blocked or unknown)" })
          skipped++
          continue
        }

        const missing = validatePlaceholders(o.custom_text, catalogEntry.entry)
        if (missing.length > 0) {
          errors.push({ key: o.text_key, reason: `Missing placeholders: ${missing.map(p => `{${p}}`).join(", ")}` })
          skipped++
          continue
        }

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

      return res.json({ success: true, imported, skipped, errors: errors.slice(0, 20) })
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
