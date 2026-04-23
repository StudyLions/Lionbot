// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Video channels configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: parseBigInt for guild ID and channel/role IDs from body
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: wrapped with apiHandler for error handling and method validation
export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-04-20) ---
    // Purpose: Surface active STUDY_BAN ticket count alongside the rest of
    //   the video-channels config so the dashboard can show "N members are
    //   currently study-blacklisted" and gate the Clear All button on it.
    //   Built for support ticket #0037 -- admins need an obvious way to
    //   see (and undo) blacklists from the dashboard.
    const [
      guildConfig,
      exemptRoles,
      studybanDurations,
      videoChannelsRaw,
      activeBlacklistCount,
    ] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: { video_grace_period: true, studyban_role: true },
      }),
      prisma.video_exempt_roles.findMany({
        where: { guildid: guildId },
        select: { roleid: true },
      }),
      prisma.studyban_durations.findMany({
        where: { guildid: guildId },
        orderBy: { duration: "asc" },
        select: { rowid: true, duration: true },
      }),
      // video_channels has @@ignore - use raw SQL
      prisma.$queryRaw<{ channelid: bigint }[]>(
        Prisma.sql`SELECT channelid FROM video_channels WHERE guildid = ${guildId}`
      ),
      prisma.tickets.count({
        where: {
          guildid: guildId,
          ticket_type: "STUDY_BAN",
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
      }),
    ])

    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    return res.status(200).json({
      videoGracePeriod: guildConfig.video_grace_period ?? null,
      studybanRole: guildConfig.studyban_role?.toString() ?? null,
      videoChannelIds: videoChannelsRaw.map((r) => r.channelid.toString()),
      exemptRoleIds: exemptRoles.map((r) => r.roleid.toString()),
      studybanDurations: studybanDurations.map((d) => ({ rowid: d.rowid, duration: d.duration })),
      activeBlacklistCount,
    })
    // --- END AI-MODIFIED ---
  },
  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: added studybanRole and studybanDurations editing support
    const body = req.body as {
      videoGracePeriod?: number | null
      studybanRole?: string | null
      videoChannelIds?: string[]
      exemptRoleIds?: string[]
      studybanDurations?: number[]
    }

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Add array size limit to prevent DoS
    if (Array.isArray(body.videoChannelIds) && body.videoChannelIds.length > 200) {
      return res.status(400).json({ error: "Too many video channels (max 200)" })
    }
    if (Array.isArray(body.exemptRoleIds) && body.exemptRoleIds.length > 200) {
      return res.status(400).json({ error: "Too many exempt roles (max 200)" })
    }
    // --- END AI-MODIFIED ---

    const updates: { video_grace_period?: number | null; studyban_role?: bigint | null } = {}
    if ("videoGracePeriod" in body) {
      updates.video_grace_period = body.videoGracePeriod ?? null
    }
    if ("studybanRole" in body) {
      updates.studyban_role = body.studybanRole ? parseBigInt(body.studybanRole, "studyban role ID") : null
    }
    // --- END AI-MODIFIED ---

    if (Object.keys(updates).length > 0) {
      await prisma.guild_config.update({
        where: { guildid: guildId },
        data: updates,
      })
    }

    // video_channels: replace entire set (table has @@ignore)
    if ("videoChannelIds" in body && Array.isArray(body.videoChannelIds)) {
      await prisma.$executeRaw`DELETE FROM video_channels WHERE guildid = ${guildId}`
      const uniqueChannels = Array.from(new Set(body.videoChannelIds)) as string[]
      for (const channelId of uniqueChannels) {
        const cid = parseBigInt(channelId, "video channel ID")
        await prisma.$executeRaw`INSERT INTO video_channels (guildid, channelid) VALUES (${guildId}, ${cid})`
      }
    }

    // video_exempt_roles: replace entire set
    if ("exemptRoleIds" in body && Array.isArray(body.exemptRoleIds)) {
      await prisma.video_exempt_roles.deleteMany({ where: { guildid: guildId } })
      for (const roleId of body.exemptRoleIds) {
        const rid = parseBigInt(roleId, "exempt role ID")
        await prisma.video_exempt_roles.upsert({
          where: { guildid_roleid: { guildid: guildId, roleid: rid } },
          create: { guildid: guildId, roleid: rid },
          update: {},
        })
      }
    }

    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: support editing studyban durations
    if ("studybanDurations" in body && Array.isArray(body.studybanDurations)) {
      await prisma.studyban_durations.deleteMany({ where: { guildid: guildId } })
      for (const duration of body.studybanDurations) {
        if (typeof duration === "number" && duration > 0) {
          await prisma.studyban_durations.create({
            data: { guildid: guildId, duration },
          })
        }
      }
    }
    // --- END AI-MODIFIED ---

    return res.status(200).json({ success: true })
  },
})
// --- END AI-MODIFIED ---
