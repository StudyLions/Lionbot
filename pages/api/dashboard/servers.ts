// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Dashboard API - list servers the user belongs to
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth, getUserGuilds, getUserGuildRoles, checkBotInGuild } from "@/utils/adminAuth"
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

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: tracked_time is not populated; batch aggregate voice_sessions per guild
    const studyByGuild = await prisma.$queryRaw<Array<{ guildid: bigint; total: number }>>`
      SELECT guildid, COALESCE(SUM(duration), 0)::int as total
      FROM voice_sessions
      WHERE userid = ${userId}
      GROUP BY guildid
    `.catch(() => [] as Array<{ guildid: bigint; total: number }>)
    const studyMap = new Map(
      (Array.isArray(studyByGuild) ? studyByGuild : []).map((r) => [r.guildid.toString(), Number(r.total)])
    )
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: skip memberships for servers the user is no longer in (stale DB records)
    const activeMemberships = memberships.filter((m) => discordGuildMap.has(m.guildid.toString()))

    const servers = await Promise.all(
      activeMemberships.map(async (m) => {
        const guildIdStr = m.guildid.toString()
        const discordGuild = discordGuildMap.get(guildIdStr)!

        let role: ServerRole = "member"
    // --- END AI-MODIFIED ---
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

        // --- AI-MODIFIED (2026-03-14) ---
        // Purpose: check actual bot presence via Discord API instead of stale guild_config
        const botPresent = await checkBotInGuild(guildIdStr)

        return {
          guildId: guildIdStr,
          guildName: discordGuild?.name || m.guild_config?.name || "Unknown Server",
          displayName: m.display_name,
          // --- AI-MODIFIED (2026-03-14) ---
          // Purpose: use voice_sessions aggregate instead of members.tracked_time
          trackedTimeSeconds: studyMap.get(m.guildid.toString()) || 0,
          trackedTimeHours: Math.round(((studyMap.get(m.guildid.toString()) || 0) / 3600) * 10) / 10,
          // --- END AI-MODIFIED ---
          coins: m.coins || 0,
          firstJoined: m.first_joined,
          role,
          iconUrl,
          botPresent,
        }
        // --- END AI-MODIFIED ---
      })
    )

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: discover admin/mod guilds where the bot is present but no members row exists yet
    // (the bot creates members rows lazily on first command, so newly added servers are invisible)
    const existingGuildIds = new Set(servers.map((s) => s.guildId))
    const candidateGuilds = discordGuilds.filter((g) => {
      if (existingGuildIds.has(g.id)) return false
      const perms = BigInt(g.permissions)
      return (perms & BigInt(ADMINISTRATOR)) !== 0n || (perms & BigInt(MANAGE_GUILD)) !== 0n
    })

    const newServerChecks = await Promise.all(
      candidateGuilds.map(async (g) => {
        const botPresent = await checkBotInGuild(g.id)
        return { guild: g, botPresent }
      })
    )

    for (const { guild: g, botPresent } of newServerChecks) {
      if (!botPresent) continue

      await prisma.guild_config.upsert({
        where: { guildid: BigInt(g.id) },
        update: {},
        create: { guildid: BigInt(g.id), name: g.name },
      })

      let iconUrl: string | null = null
      if (g.icon) {
        const ext = g.icon.startsWith("a_") ? "gif" : "webp"
        iconUrl = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${ext}?size=128`
      }
      const perms = BigInt(g.permissions)
      const role: ServerRole = (perms & BigInt(ADMINISTRATOR)) !== 0n ? "admin" : "moderator"

      servers.push({
        guildId: g.id,
        guildName: g.name || "Unknown Server",
        displayName: null,
        trackedTimeSeconds: 0,
        trackedTimeHours: 0,
        coins: 0,
        firstJoined: null,
        role,
        iconUrl,
        botPresent: true,
      })
    }
    // --- END AI-MODIFIED ---

    servers.sort((a, b) => {
      const tierDiff = rolePriority[a.role] - rolePriority[b.role]
      if (tierDiff !== 0) return tierDiff
      return b.trackedTimeSeconds - a.trackedTimeSeconds
    })

    res.status(200).json({ servers })
  },
})
