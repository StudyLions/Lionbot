// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Manage list-type guild settings stored in separate tables
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID and PATCH id list entries
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

const LIST_TABLE_MAP: Record<string, { table: string; idCol: string; useRawAll: boolean }> = {
  untrackedVoiceChannels: { table: "untracked_channels", idCol: "channelid", useRawAll: true },
  untrackedTextChannels: { table: "untracked_text_channels", idCol: "channelid", useRawAll: false },
  autoroles: { table: "autoroles", idCol: "roleid", useRawAll: true },
  botAutoroles: { table: "bot_autoroles", idCol: "roleid", useRawAll: true },
  unrankedRoles: { table: "unranked_roles", idCol: "roleid", useRawAll: true },
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const results: Record<string, string[]> = {}

    await Promise.all(
      Object.entries(LIST_TABLE_MAP).map(async ([key, { table, idCol, useRawAll }]) => {
        if (useRawAll) {
          const rows = await prisma.$queryRawUnsafe<{ id: bigint }[]>(
            `SELECT ${idCol} as id FROM ${table} WHERE guildid = $1`,
            guildId
          )
          results[key] = rows.map((r) => r.id.toString())
        } else if (table === "untracked_text_channels") {
          const rows = await prisma.untracked_text_channels.findMany({
            where: { guildid: guildId },
            select: { channelid: true },
          })
          results[key] = rows.map((r) => r.channelid.toString())
        }
      })
    )

    return res.status(200).json(results)
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { list, action, ids } = req.body as {
      list: string
      action: "add" | "remove"
      ids: string[]
    }

    if (!list || !action || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Missing list, action, or ids" })
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add array size limit to prevent DoS
    if (Array.isArray(ids) && ids.length > 500) {
      return res.status(400).json({ error: "Too many items (max 500)" })
    }
    // --- END AI-MODIFIED ---

    const mapping = LIST_TABLE_MAP[list]
    if (!mapping) {
      return res.status(400).json({ error: `Unknown list: ${list}` })
    }

    const { table, idCol } = mapping
    const bigIds = ids.map((id) => parseBigInt(id, "list ID"))

    if (action === "add") {
      for (const bid of bigIds) {
        if (table === "untracked_text_channels") {
          await prisma.untracked_text_channels.upsert({
            where: { channelid: bid },
            create: { channelid: bid, guildid: guildId },
            update: {},
          })
        } else {
          await prisma.$executeRawUnsafe(
            `INSERT INTO ${table} (guildid, ${idCol}) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            guildId,
            bid
          )
        }
      }
    } else if (action === "remove") {
      if (table === "untracked_text_channels") {
        await prisma.untracked_text_channels.deleteMany({
          where: { guildid: guildId, channelid: { in: bigIds } },
        })
      } else {
        for (const bid of bigIds) {
          await prisma.$executeRawUnsafe(
            `DELETE FROM ${table} WHERE guildid = $1 AND ${idCol} = $2`,
            guildId,
            bid
          )
        }
      }
    } else {
      return res.status(400).json({ error: "action must be 'add' or 'remove'" })
    }

    return res.status(200).json({ success: true, list, action, count: ids.length })
  },
})
