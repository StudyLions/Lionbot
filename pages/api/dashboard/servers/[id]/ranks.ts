// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for rank tiers (xp_ranks, voice_ranks, msg_ranks)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild/role IDs from query/body so invalid input returns 400
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

type RankType = "XP" | "VOICE" | "MESSAGE"

function getRankModel(rankType: RankType) {
  switch (rankType) {
    case "XP": return prisma.xp_ranks
    case "VOICE": return prisma.voice_ranks
    case "MESSAGE": return prisma.msg_ranks
    default: return null
  }
}

function serializeRank(r: any) {
  return {
    rankId: r.rankid,
    roleId: r.roleid.toString(),
    required: r.required,
    reward: r.reward,
    message: r.message,
  }
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: add memberCounts per rank to GET response
    const [xpRanks, voiceRanks, msgRanks, guildConfig, xpCounts, voiceCounts, msgCounts] = await Promise.all([
      prisma.xp_ranks.findMany({
        where: { guildid: guildId },
        orderBy: { required: "asc" },
      }),
      prisma.voice_ranks.findMany({
        where: { guildid: guildId },
        orderBy: { required: "asc" },
      }),
      prisma.msg_ranks.findMany({
        where: { guildid: guildId },
        orderBy: { required: "asc" },
      }),
      // --- AI-MODIFIED (2026-03-25) ---
      // Purpose: Include secondary rank type enabled flags in response
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: {
          rank_type: true, rank_channel: true, dm_ranks: true,
          voice_ranks_enabled: true, msg_ranks_enabled: true, xp_ranks_enabled: true,
        },
      }),
      // --- END AI-MODIFIED ---
      prisma.$queryRaw<Array<{ rankid: number; cnt: bigint }>>(Prisma.sql`
        SELECT current_xp_rankid as rankid, COUNT(*)::bigint as cnt
        FROM member_ranks WHERE guildid = ${guildId} AND current_xp_rankid IS NOT NULL
        GROUP BY current_xp_rankid
      `),
      prisma.$queryRaw<Array<{ rankid: number; cnt: bigint }>>(Prisma.sql`
        SELECT current_voice_rankid as rankid, COUNT(*)::bigint as cnt
        FROM member_ranks WHERE guildid = ${guildId} AND current_voice_rankid IS NOT NULL
        GROUP BY current_voice_rankid
      `),
      prisma.$queryRaw<Array<{ rankid: number; cnt: bigint }>>(Prisma.sql`
        SELECT current_msg_rankid as rankid, COUNT(*)::bigint as cnt
        FROM member_ranks WHERE guildid = ${guildId} AND current_msg_rankid IS NOT NULL
        GROUP BY current_msg_rankid
      `),
    ])

    const toCountMap = (rows: Array<{ rankid: number; cnt: bigint }>) => {
      const m: Record<number, number> = {}
      for (const r of rows) m[r.rankid] = Number(r.cnt)
      return m
    }

    // --- AI-MODIFIED (2026-03-25) ---
    // Purpose: Include secondary rank type enabled flags in response
    return res.status(200).json({
      rankType: guildConfig?.rank_type || null,
      rankChannel: guildConfig?.rank_channel?.toString() || null,
      // --- AI-MODIFIED (2026-04-07) ---
      // Purpose: Match bot's default (True) so NULL shows as ON, not OFF
      dmRanks: guildConfig?.dm_ranks ?? true,
      // --- END AI-MODIFIED ---
      voiceRanksEnabled: guildConfig?.voice_ranks_enabled ?? false,
      msgRanksEnabled: guildConfig?.msg_ranks_enabled ?? false,
      xpRanksEnabled: guildConfig?.xp_ranks_enabled ?? false,
      xpRanks: xpRanks.map(serializeRank),
      voiceRanks: voiceRanks.map(serializeRank),
      msgRanks: msgRanks.map(serializeRank),
      memberCounts: {
        XP: toCountMap(xpCounts),
        VOICE: toCountMap(voiceCounts),
        MESSAGE: toCountMap(msgCounts),
      },
    })
    // --- END AI-MODIFIED ---
  },
  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Config update endpoint for toggling secondary rank types
  async PUT(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { voiceRanksEnabled, msgRanksEnabled, xpRanksEnabled } = req.body
    const updates: Record<string, boolean> = {}
    if (typeof voiceRanksEnabled === "boolean") updates.voice_ranks_enabled = voiceRanksEnabled
    if (typeof msgRanksEnabled === "boolean") updates.msg_ranks_enabled = msgRanksEnabled
    if (typeof xpRanksEnabled === "boolean") updates.xp_ranks_enabled = xpRanksEnabled

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: updates,
    })
    return res.status(200).json({ success: true })
  },
  // --- END AI-MODIFIED ---
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add non-negative validation for required/reward, message length limit
    const { rankType, roleId, required, reward, message } = req.body
    const model = getRankModel(rankType)
    if (!model) return res.status(400).json({ error: "Invalid rankType (XP, VOICE, or MESSAGE)" })
    if (!roleId || typeof required !== "number" || typeof reward !== "number") {
      return res.status(400).json({ error: "roleId, required (number), and reward (number) are required" })
    }
    if (required < 0) return res.status(400).json({ error: "required must be non-negative" })
    if (reward < 0) return res.status(400).json({ error: "reward must be non-negative" })

    const rank = await (model as any).create({
      data: {
        guildid: guildId,
        roleid: parseBigInt(roleId, "role ID"),
        required,
        reward,
        message: typeof message === "string" ? (message || "").slice(0, 2000) || null : null,
      },
    })
    // --- END AI-MODIFIED ---

    return res.status(201).json(serializeRank(rank))
  },
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Add guildid to PATCH/DELETE WHERE clauses to prevent cross-guild
  //          rank manipulation. Add required/reward non-negative validation.
  //          Add message length limit.
  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { rankType, rankId, required, reward, message } = req.body
    const model = getRankModel(rankType)
    if (!model || !rankId) return res.status(400).json({ error: "rankType and rankId required" })

    const existing = await (model as any).findUnique({ where: { rankid: rankId } })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Rank not found in this server" })
    }

    const updates: Record<string, any> = {}
    if (typeof required === "number") {
      if (required < 0) return res.status(400).json({ error: "required must be non-negative" })
      updates.required = required
    }
    if (typeof reward === "number") {
      if (reward < 0) return res.status(400).json({ error: "reward must be non-negative" })
      updates.reward = reward
    }
    if (typeof message === "string") updates.message = (message || "").slice(0, 2000) || null

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await (model as any).update({ where: { rankid: rankId }, data: updates })
    return res.status(200).json({ success: true })
  },
  async DELETE(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { rankType, rankId } = req.body
    const model = getRankModel(rankType)
    if (!model || !rankId) return res.status(400).json({ error: "rankType and rankId required" })

    const existing = await (model as any).findUnique({ where: { rankid: rankId } })
    if (!existing || existing.guildid !== guildId) {
      return res.status(404).json({ error: "Rank not found in this server" })
    }

    await (model as any).delete({ where: { rankid: rankId } })
    return res.status(200).json({ success: true })
  },
  // --- END AI-MODIFIED ---
})
// --- END AI-MODIFIED ---
