// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Purpose: API route for LoFi song blacklist per guild.
//          GET lists blacklisted songs. POST adds one. DELETE removes one.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
import { getDiscordId } from "@/utils/dashboardAuth"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const rows = await prisma.lofi_blacklist.findMany({
      where: { guildid: guildId },
      orderBy: { created_at: "desc" },
    })

    return res.status(200).json(
      rows.map((r) => ({
        id: r.id,
        song_filename: r.song_filename,
        blacklisted_by: r.blacklisted_by?.toString() ?? null,
        created_at: r.created_at.toISOString(),
      }))
    )
  },

  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { song_filename } = req.body as { song_filename?: string }
    if (!song_filename || song_filename.length > 300) {
      throw new ValidationError("song_filename is required and must be <= 300 chars")
    }

    const discordId = await getDiscordId(req)
    const userId = discordId ? BigInt(discordId) : null

    const row = await prisma.lofi_blacklist.upsert({
      where: {
        guildid_song_filename: { guildid: guildId, song_filename },
      },
      create: {
        guildid: guildId,
        song_filename,
        blacklisted_by: userId,
      },
      update: {},
    })

    return res.status(200).json({
      id: row.id,
      song_filename: row.song_filename,
      blacklisted_by: row.blacklisted_by?.toString() ?? null,
      created_at: row.created_at.toISOString(),
    })
  },

  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { song_filename } = req.body as { song_filename?: string }
    if (!song_filename) {
      throw new ValidationError("song_filename is required")
    }

    try {
      await prisma.lofi_blacklist.delete({
        where: {
          guildid_song_filename: { guildid: guildId, song_filename },
        },
      })
    } catch (_) {
      // Already deleted or doesn't exist
    }

    return res.status(200).json({ success: true })
  },
})
