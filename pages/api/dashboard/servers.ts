// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - list servers the user belongs to
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds, getUserGuildRoles } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

const ADMINISTRATOR = 0x8
const MANAGE_GUILD = 0x20

type ServerRole = "admin" | "moderator" | "member"
const rolePriority: Record<ServerRole, number> = { admin: 0, moderator: 1, member: 2 }

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: enrich servers response with permission role, Discord icon URL, and role-based sorting
export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const [memberships, discordGuilds] = await Promise.all([
      prisma.members.findMany({
        where: { userid: userId },
        select: {
          guildid: true,
          tracked_time: true,
          coins: true,
          display_name: true,
          first_joined: true,
          guild_config: {
            select: {
              guildid: true,
              name: true,
              mod_role: true,
              admin_role: true,
            },
          },
        },
        orderBy: { tracked_time: "desc" },
      }),
      getUserGuilds(auth.accessToken, auth.discordId),
    ])

    const discordGuildMap = new Map(discordGuilds.map((g) => [g.id, g]))

    const servers = await Promise.all(
      memberships.map(async (m) => {
        const guildIdStr = m.guildid.toString()
        const discordGuild = discordGuildMap.get(guildIdStr)

        let role: ServerRole = "member"
        if (discordGuild) {
          const perms = BigInt(discordGuild.permissions)
          if (perms & BigInt(ADMINISTRATOR)) {
            role = "admin"
          } else if (perms & BigInt(MANAGE_GUILD)) {
            role = "moderator"
            if (m.guild_config?.admin_role) {
              const userRoles = await getUserGuildRoles(m.guildid, auth.discordId)
              if (userRoles.includes(m.guild_config.admin_role.toString())) {
                role = "admin"
              }
            }
          } else if (m.guild_config?.mod_role || m.guild_config?.admin_role) {
            const userRoles = await getUserGuildRoles(m.guildid, auth.discordId)
            if (m.guild_config.admin_role && userRoles.includes(m.guild_config.admin_role.toString())) {
              role = "admin"
            } else if (m.guild_config.mod_role && userRoles.includes(m.guild_config.mod_role.toString())) {
              role = "moderator"
            }
          }
        }

        let iconUrl: string | null = null
        if (discordGuild?.icon) {
          const ext = discordGuild.icon.startsWith("a_") ? "gif" : "webp"
          iconUrl = `https://cdn.discordapp.com/icons/${guildIdStr}/${discordGuild.icon}.${ext}?size=128`
        }

        return {
          guildId: guildIdStr,
          guildName: discordGuild?.name || m.guild_config?.name || "Unknown Server",
          displayName: m.display_name,
          trackedTimeSeconds: m.tracked_time || 0,
          trackedTimeHours: Math.round(((m.tracked_time || 0) / 3600) * 10) / 10,
          coins: m.coins || 0,
          firstJoined: m.first_joined,
          role,
          iconUrl,
        }
      })
    )

    servers.sort((a, b) => {
      const tierDiff = rolePriority[a.role] - rolePriority[b.role]
      if (tierDiff !== 0) return tierDiff
      return b.trackedTimeSeconds - a.trackedTimeSeconds
    })

    res.status(200).json({ servers })
  },
})
// --- END AI-MODIFIED ---
