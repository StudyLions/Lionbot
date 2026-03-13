// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Video channels configuration API
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const guildId = BigInt(req.query.id as string)

  if (req.method === "GET") {
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [guildConfig, exemptRoles, studybanDurations, videoChannelsRaw] = await Promise.all([
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
    ])

    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    return res.status(200).json({
      videoGracePeriod: guildConfig.video_grace_period ?? null,
      studybanRole: guildConfig.studyban_role?.toString() ?? null,
      videoChannelIds: videoChannelsRaw.map((r) => r.channelid.toString()),
      exemptRoleIds: exemptRoles.map((r) => r.roleid.toString()),
      studybanDurations: studybanDurations.map((d) => ({ rowid: d.rowid, duration: d.duration })),
    })
  }

  if (req.method === "PATCH") {
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const body = req.body as {
      videoGracePeriod?: number | null
      videoChannelIds?: string[]
      exemptRoleIds?: string[]
    }

    const updates: { video_grace_period?: number | null } = {}
    if ("videoGracePeriod" in body) {
      updates.video_grace_period = body.videoGracePeriod ?? null
    }

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
        const cid = BigInt(channelId)
        await prisma.$executeRaw`INSERT INTO video_channels (guildid, channelid) VALUES (${guildId}, ${cid})`
      }
    }

    // video_exempt_roles: replace entire set
    if ("exemptRoleIds" in body && Array.isArray(body.exemptRoleIds)) {
      await prisma.video_exempt_roles.deleteMany({ where: { guildid: guildId } })
      for (const roleId of body.exemptRoleIds) {
        const rid = BigInt(roleId)
        await prisma.video_exempt_roles.upsert({
          where: { guildid_roleid: { guildid: guildId, roleid: rid } },
          create: { guildid: guildId, roleid: rid },
          update: {},
        })
      }
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
