// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: CRUD API for sticky messages (premium feature)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const MAX_STICKIES_PER_GUILD = 5
const MIN_INTERVAL = 30
const MAX_INTERVAL = 300
const MAX_CONTENT_LEN = 2000
const MAX_TITLE_LEN = 256
const MAX_FOOTER_LEN = 256

async function isPremiumGuild(guildId: bigint): Promise<boolean> {
  const row = await prisma.premium_guilds.findUnique({
    where: { guildid: guildId },
    select: { premium_until: true },
  })
  return !!row && row.premium_until > new Date()
}

function serializeSticky(s: any) {
  return {
    stickyid: s.stickyid,
    guildid: s.guildid.toString(),
    channelid: s.channelid.toString(),
    title: s.title,
    content: s.content,
    color: s.color,
    image_url: s.image_url,
    footer_text: s.footer_text,
    interval_seconds: s.interval_seconds,
    last_posted_id: s.last_posted_id?.toString() ?? null,
    enabled: s.enabled,
    created_by: s.created_by?.toString() ?? null,
    created_at: s.created_at?.toISOString() ?? null,
  }
}

function validateContent(body: any) {
  if (!body.content || typeof body.content !== "string" || body.content.trim().length === 0) {
    throw new ValidationError("Content is required")
  }
  if (body.content.length > MAX_CONTENT_LEN) {
    throw new ValidationError(`Content exceeds ${MAX_CONTENT_LEN} character limit`)
  }
  if (body.title && body.title.length > MAX_TITLE_LEN) {
    throw new ValidationError(`Title exceeds ${MAX_TITLE_LEN} character limit`)
  }
  if (body.footer_text && body.footer_text.length > MAX_FOOTER_LEN) {
    throw new ValidationError(`Footer text exceeds ${MAX_FOOTER_LEN} character limit`)
  }
  if (body.image_url && body.image_url.length > 2000) {
    throw new ValidationError("Image URL is too long")
  }
  if (body.interval_seconds !== undefined) {
    const interval = Number(body.interval_seconds)
    if (isNaN(interval) || interval < MIN_INTERVAL || interval > MAX_INTERVAL) {
      throw new ValidationError(`Interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} seconds`)
    }
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const [stickies, isPremium] = await Promise.all([
      prisma.sticky_messages.findMany({
        where: { guildid: guildId },
        orderBy: { created_at: "asc" },
      }),
      isPremiumGuild(guildId),
    ])

    return res.status(200).json({
      stickies: stickies.map(serializeSticky),
      isPremium,
      limit: MAX_STICKIES_PER_GUILD,
    })
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Sticky messages require a premium server subscription" })
    }

    const existingCount = await prisma.sticky_messages.count({
      where: { guildid: guildId },
    })
    if (existingCount >= MAX_STICKIES_PER_GUILD) {
      throw new ValidationError(`Maximum ${MAX_STICKIES_PER_GUILD} sticky messages per server`)
    }

    const body = req.body
    validateContent(body)

    if (!body.channelid) {
      throw new ValidationError("Channel is required")
    }

    const channelId = parseBigInt(body.channelid, "channelid")

    const existing = await prisma.sticky_messages.findUnique({
      where: { guildid_channelid: { guildid: guildId, channelid: channelId } },
    })
    if (existing) {
      throw new ValidationError("A sticky message already exists for this channel. Edit or remove it first.")
    }

    const sticky = await prisma.sticky_messages.create({
      data: {
        guildid: guildId,
        channelid: channelId,
        title: body.title || null,
        content: body.content.trim(),
        color: body.color ?? 3447003,
        image_url: body.image_url || null,
        footer_text: body.footer_text || null,
        interval_seconds: Math.min(Math.max(body.interval_seconds ?? 60, MIN_INTERVAL), MAX_INTERVAL),
        enabled: body.enabled ?? true,
        created_by: auth.odid ? BigInt(auth.odid) : null,
      },
    })

    return res.status(201).json(serializeSticky(sticky))
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    if (!(await isPremiumGuild(guildId))) {
      return res.status(403).json({ error: "Sticky messages require a premium server subscription" })
    }

    const stickyId = Number(req.body.stickyid)
    if (!stickyId || isNaN(stickyId)) {
      throw new ValidationError("stickyid is required")
    }

    const existing = await prisma.sticky_messages.findUnique({
      where: { stickyid: stickyId },
    })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Sticky message not found" })
    }

    const body = req.body
    const data: any = {}

    if (body.title !== undefined) data.title = body.title || null
    if (body.content !== undefined) {
      if (!body.content || body.content.trim().length === 0) {
        throw new ValidationError("Content cannot be empty")
      }
      if (body.content.length > MAX_CONTENT_LEN) {
        throw new ValidationError(`Content exceeds ${MAX_CONTENT_LEN} character limit`)
      }
      data.content = body.content.trim()
    }
    if (body.color !== undefined) data.color = body.color
    if (body.image_url !== undefined) data.image_url = body.image_url || null
    if (body.footer_text !== undefined) {
      if (body.footer_text && body.footer_text.length > MAX_FOOTER_LEN) {
        throw new ValidationError(`Footer text exceeds ${MAX_FOOTER_LEN} character limit`)
      }
      data.footer_text = body.footer_text || null
    }
    if (body.interval_seconds !== undefined) {
      const interval = Number(body.interval_seconds)
      if (isNaN(interval) || interval < MIN_INTERVAL || interval > MAX_INTERVAL) {
        throw new ValidationError(`Interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} seconds`)
      }
      data.interval_seconds = interval
    }
    if (body.enabled !== undefined) data.enabled = Boolean(body.enabled)
    if (body.channelid !== undefined) {
      data.channelid = parseBigInt(body.channelid, "channelid")
    }

    if (Object.keys(data).length === 0) {
      throw new ValidationError("No fields to update")
    }

    const updated = await prisma.sticky_messages.update({
      where: { stickyid: stickyId },
      data,
    })

    return res.status(200).json(serializeSticky(updated))
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const stickyId = Number(req.body?.stickyid || req.query.stickyid)
    if (!stickyId || isNaN(stickyId)) {
      throw new ValidationError("stickyid is required")
    }

    const existing = await prisma.sticky_messages.findUnique({
      where: { stickyid: stickyId },
    })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Sticky message not found" })
    }

    await prisma.sticky_messages.delete({
      where: { stickyid: stickyId },
    })

    return res.status(200).json({ success: true })
  },
})
