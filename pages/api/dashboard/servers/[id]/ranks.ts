// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: CRUD for rank tiers (xp_ranks, voice_ranks, msg_ranks)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
import { apiHandler } from "@/utils/apiHandler"
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
    const guildId = BigInt(req.query.id as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [xpRanks, voiceRanks, msgRanks, guildConfig] = await Promise.all([
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
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { rank_type: true, rank_channel: true, dm_ranks: true },
      }),
    ])

    return res.status(200).json({
      rankType: guildConfig?.rank_type || null,
      rankChannel: guildConfig?.rank_channel?.toString() || null,
      dmRanks: guildConfig?.dm_ranks ?? false,
      xpRanks: xpRanks.map(serializeRank),
      voiceRanks: voiceRanks.map(serializeRank),
      msgRanks: msgRanks.map(serializeRank),
    })
  },
  async POST(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { rankType, roleId, required, reward, message } = req.body
    const model = getRankModel(rankType)
    if (!model) return res.status(400).json({ error: "Invalid rankType (XP, VOICE, or MESSAGE)" })
    if (!roleId || typeof required !== "number" || typeof reward !== "number") {
      return res.status(400).json({ error: "roleId, required (number), and reward (number) are required" })
    }

    const rank = await (model as any).create({
      data: {
        guildid: guildId,
        roleid: BigInt(roleId),
        required,
        reward,
        message: message || null,
      },
    })

    return res.status(201).json(serializeRank(rank))
  },
  async PATCH(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { rankType, rankId, required, reward, message } = req.body
    const model = getRankModel(rankType)
    if (!model || !rankId) return res.status(400).json({ error: "rankType and rankId required" })

    const updates: Record<string, any> = {}
    if (typeof required === "number") updates.required = required
    if (typeof reward === "number") updates.reward = reward
    if (typeof message === "string") updates.message = message || null

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    await (model as any).update({ where: { rankid: rankId }, data: updates })
    return res.status(200).json({ success: true })
  },
  async DELETE(req, res) {
    const guildId = BigInt(req.query.id as string)
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { rankType, rankId } = req.body
    const model = getRankModel(rankType)
    if (!model || !rankId) return res.status(400).json({ error: "rankType and rankId required" })

    await (model as any).delete({ where: { rankid: rankId } })
    return res.status(200).json({ success: true })
  },
})
// --- END AI-MODIFIED ---
