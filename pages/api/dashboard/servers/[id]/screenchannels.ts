// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-20
// Purpose: Screen-share channels configuration API. Mirrors
//          videochannels.ts, but operates on screen_channels,
//          screen_exempt_roles, screenban_durations, and the
//          screenban_role / screen_grace_period guild_config columns.
//          Built for support ticket #0037 ("Study Space - How to
//          completely remove blacklists?") so admins can manage
//          screen-share enforcement (and, crucially, disable
//          blacklisting) from the dashboard instead of needing a
//          slash command.
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

    // The screen_grace_period and screenban_role columns exist in the
    // live schema but are not present in our prisma model for guild_config
    // (the model is auto-generated and a touch out of date). To avoid
    // forcing a `prisma db pull` here, we read both columns with a raw
    // query, matching the same pattern we already use for the screen_*
    // satellite tables below.
    const [
      guildConfigRows,
      exemptRolesRaw,
      screenbanDurationsRaw,
      screenChannelsRaw,
      activeBlacklistsRaw,
    ] = await Promise.all([
      prisma.$queryRaw<{ screen_grace_period: number | null; screenban_role: bigint | null }[]>(
        Prisma.sql`SELECT screen_grace_period, screenban_role FROM guild_config WHERE guildid = ${guildId}`
      ),
      // screen_exempt_roles is not in the prisma schema -- raw query.
      prisma.$queryRaw<{ roleid: bigint }[]>(
        Prisma.sql`SELECT roleid FROM screen_exempt_roles WHERE guildid = ${guildId} ORDER BY roleid`
      ),
      // screenban_durations is not in the prisma schema -- raw query.
      prisma.$queryRaw<{ rowid: number; duration: number }[]>(
        Prisma.sql`SELECT rowid, duration FROM screenban_durations WHERE guildid = ${guildId} ORDER BY duration ASC`
      ),
      // screen_channels has @@ignore in prisma schema -- raw query.
      prisma.$queryRaw<{ channelid: bigint }[]>(
        Prisma.sql`SELECT channelid FROM screen_channels WHERE guildid = ${guildId}`
      ),
      // Active SCREEN_BAN ticket count -- powers the "Active blacklists"
      // card on the dashboard so admins can see how many members are
      // currently affected before clicking Clear All.
      prisma.tickets.count({
        where: {
          guildid: guildId,
          ticket_type: "SCREEN_BAN",
          ticket_state: { in: ["OPEN", "EXPIRING"] },
        },
      }),
    ])

    const guildConfig = guildConfigRows[0]
    if (!guildConfig) return res.status(404).json({ error: "Server not found" })

    return res.status(200).json({
      screenGracePeriod: guildConfig.screen_grace_period ?? null,
      screenbanRole: guildConfig.screenban_role?.toString() ?? null,
      screenChannelIds: screenChannelsRaw.map((r) => r.channelid.toString()),
      exemptRoleIds: exemptRolesRaw.map((r) => r.roleid.toString()),
      screenbanDurations: screenbanDurationsRaw.map((d) => ({
        rowid: d.rowid,
        duration: d.duration,
      })),
      activeBlacklistCount: activeBlacklistsRaw,
    })
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const body = req.body as {
      screenGracePeriod?: number | null
      screenbanRole?: string | null
      screenChannelIds?: string[]
      exemptRoleIds?: string[]
      screenbanDurations?: number[]
    }

    if (Array.isArray(body.screenChannelIds) && body.screenChannelIds.length > 200) {
      return res.status(400).json({ error: "Too many screen channels (max 200)" })
    }
    if (Array.isArray(body.exemptRoleIds) && body.exemptRoleIds.length > 200) {
      return res.status(400).json({ error: "Too many exempt roles (max 200)" })
    }
    if (Array.isArray(body.screenbanDurations) && body.screenbanDurations.length > 50) {
      return res.status(400).json({ error: "Too many durations (max 50)" })
    }

    // Same reason as the GET handler: write screen_grace_period /
    // screenban_role through raw SQL because the prisma model is missing
    // these (live) columns. Each is updated independently so a request
    // that only changes one doesn't have to send the other.
    if ("screenGracePeriod" in body) {
      const gp = body.screenGracePeriod ?? null
      await prisma.$executeRaw`UPDATE guild_config SET screen_grace_period = ${gp} WHERE guildid = ${guildId}`
    }
    if ("screenbanRole" in body) {
      const role = body.screenbanRole
        ? parseBigInt(body.screenbanRole, "screenban role ID")
        : null
      await prisma.$executeRaw`UPDATE guild_config SET screenban_role = ${role} WHERE guildid = ${guildId}`
    }

    if ("screenChannelIds" in body && Array.isArray(body.screenChannelIds)) {
      await prisma.$executeRaw`DELETE FROM screen_channels WHERE guildid = ${guildId}`
      const uniqueChannels = Array.from(new Set(body.screenChannelIds)) as string[]
      for (const channelId of uniqueChannels) {
        const cid = parseBigInt(channelId, "screen channel ID")
        await prisma.$executeRaw`INSERT INTO screen_channels (guildid, channelid) VALUES (${guildId}, ${cid})`
      }
    }

    if ("exemptRoleIds" in body && Array.isArray(body.exemptRoleIds)) {
      await prisma.$executeRaw`DELETE FROM screen_exempt_roles WHERE guildid = ${guildId}`
      const uniqueRoles = Array.from(new Set(body.exemptRoleIds)) as string[]
      for (const roleId of uniqueRoles) {
        const rid = parseBigInt(roleId, "exempt role ID")
        await prisma.$executeRaw`INSERT INTO screen_exempt_roles (guildid, roleid) VALUES (${guildId}, ${rid})`
      }
    }

    if ("screenbanDurations" in body && Array.isArray(body.screenbanDurations)) {
      await prisma.$executeRaw`DELETE FROM screenban_durations WHERE guildid = ${guildId}`
      for (const duration of body.screenbanDurations) {
        if (typeof duration === "number" && duration > 0) {
          await prisma.$executeRaw`INSERT INTO screenban_durations (guildid, duration) VALUES (${guildId}, ${duration})`
        }
      }
    }

    return res.status(200).json({ success: true })
  },
})
