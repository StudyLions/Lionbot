// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Leaderboard configuration API (season, unranked roles, role filter)
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { requireModerator, requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [guildConfig, unrankedRaw, filterRoles] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: {
          season_start: true,
          leaderboard_role_filter_enabled: true,
        },
      }),
      prisma.$queryRaw<{ roleid: bigint }[]>(
        Prisma.sql`SELECT roleid FROM unranked_roles WHERE guildid = ${guildId}`
      ),
      prisma.leaderboard_filter_roles.findMany({
        where: { guildid: guildId },
        select: { roleid: true },
      }),
    ])

    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    return res.status(200).json({
      seasonStart: guildConfig.season_start?.toISOString() ?? null,
      roleFilterEnabled: guildConfig.leaderboard_role_filter_enabled ?? false,
      unrankedRoleIds: unrankedRaw.map((r) => r.roleid.toString()),
      filterRoleIds: filterRoles.map((r) => r.roleid.toString()),
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const body = req.body as {
      seasonStart?: string | null
      roleFilterEnabled?: boolean
      unrankedRoleIds?: string[]
      filterRoleIds?: string[]
    }

    if (Array.isArray(body.unrankedRoleIds) && body.unrankedRoleIds.length > 200) {
      return res.status(400).json({ error: "Too many unranked roles (max 200)" })
    }
    if (Array.isArray(body.filterRoleIds) && body.filterRoleIds.length > 24) {
      return res.status(400).json({ error: "Too many filter roles (max 24)" })
    }

    const updates: Record<string, any> = {}
    if ("seasonStart" in body) {
      updates.season_start = body.seasonStart ? new Date(body.seasonStart) : null
    }
    if ("roleFilterEnabled" in body) {
      updates.leaderboard_role_filter_enabled = body.roleFilterEnabled ?? false
    }

    if (Object.keys(updates).length > 0) {
      await prisma.guild_config.update({
        where: { guildid: guildId },
        data: updates,
      })
    }

    if ("unrankedRoleIds" in body && Array.isArray(body.unrankedRoleIds)) {
      await prisma.$executeRaw`DELETE FROM unranked_roles WHERE guildid = ${guildId}`
      const unique = Array.from(new Set(body.unrankedRoleIds))
      for (const roleId of unique) {
        const rid = parseBigInt(roleId, "unranked role ID")
        await prisma.$executeRaw`INSERT INTO unranked_roles (guildid, roleid) VALUES (${guildId}, ${rid})`
      }
    }

    if ("filterRoleIds" in body && Array.isArray(body.filterRoleIds)) {
      await prisma.leaderboard_filter_roles.deleteMany({ where: { guildid: guildId } })
      const unique = Array.from(new Set(body.filterRoleIds))
      for (const roleId of unique) {
        const rid = parseBigInt(roleId, "filter role ID")
        await prisma.leaderboard_filter_roles.upsert({
          where: { guildid_roleid: { guildid: guildId, roleid: rid } },
          create: { guildid: guildId, roleid: rid },
          update: {},
        })
      }
    }

    return res.status(200).json({ success: true })
  },
})
