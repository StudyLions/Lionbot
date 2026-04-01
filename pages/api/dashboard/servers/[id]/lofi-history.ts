// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Purpose: API route for LoFi play history per guild.
//          GET returns the most recent 50 played songs.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const rows = await prisma.lofi_play_history.findMany({
      where: { guildid: guildId },
      orderBy: { played_at: "desc" },
      take: 50,
    })

    return res.status(200).json(
      rows.map((r) => ({
        id: r.id,
        bot_number: r.bot_number,
        song_title: r.song_title,
        song_artist: r.song_artist,
        song_filename: r.song_filename,
        played_at: r.played_at.toISOString(),
      }))
    )
  },
})
