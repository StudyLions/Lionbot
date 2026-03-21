// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Permission checking for dashboard API routes
//          Mirrors the bot's ward system:
//          - isMember: has a members row (any user)
//          - isModerator: MANAGE_GUILD or mod_role
//          - isAdmin: ADMINISTRATOR or admin_role
//          Bot-owner level (sys_admin) is NEVER exposed
// ============================================================
import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "./prisma"

const secret = process.env.SECRET
const MANAGE_GUILD = 0x20
const ADMINISTRATOR = 0x8

interface AuthContext {
  discordId: string
  userId: bigint
  accessToken: string
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function getAuthContext(req: NextApiRequest): Promise<AuthContext | null> {
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Add secureCookie for correct session reading in HTTPS/Vercel production
  const token = await getToken({
    req,
    secret,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL_URL,
  })
  // --- END AI-MODIFIED ---
  if (!token?.discordId || !token?.accessToken) return null
  return {
    discordId: token.discordId as string,
    userId: BigInt(token.discordId as string),
    accessToken: token.accessToken as string,
  }
}

export function checkRateLimit(userId: string, maxPerMinute = 60): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 })
    return true
  }
  entry.count++
  return entry.count <= maxPerMinute
}

export function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ error: "Not authenticated. Please sign in with Discord." })
}

export function forbidden(res: NextApiResponse) {
  return res.status(403).json({ error: "You do not have permission to access this resource." })
}

export function rateLimited(res: NextApiResponse) {
  return res.status(429).json({ error: "Too many requests. Please slow down." })
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: export DiscordGuild (with icon field) and getUserGuilds for reuse in servers API
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: added banner field for server overview hero header
// --- AI-MODIFIED (2026-03-15) ---
// Purpose: added approximate_member_count from Discord ?with_counts=true
export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  banner: string | null
  permissions: string
  approximate_member_count?: number
}
// --- END AI-MODIFIED ---
// --- END AI-MODIFIED ---

let guildCache = new Map<string, { guilds: DiscordGuild[]; expiresAt: number }>()

export async function getUserGuilds(accessToken: string, userId: string): Promise<DiscordGuild[]> {
// --- END AI-MODIFIED ---
  const cached = guildCache.get(userId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.guilds
  }

  // --- AI-REPLACED (2026-03-21) ---
  // Reason: Returning [] on Discord errors made API failures indistinguishable from
  //         "user has no guilds", causing false "Access Denied" on transient errors.
  // What the new code does better: Throws on Discord API errors so callers can
  //         distinguish "couldn't check" from "user lacks permission". Cache extended
  //         from 60s to 5min to reduce Discord API calls.
  // --- Original code (commented out for rollback) ---
  // try {
  //   let res = await fetch("https://discord.com/api/v10/users/@me/guilds?with_counts=true", {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   })
  //   if (res.status === 429) {
  //     const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
  //     await new Promise((r) => setTimeout(r, retryAfter * 1000))
  //     res = await fetch("https://discord.com/api/v10/users/@me/guilds?with_counts=true", {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     })
  //   }
  //   if (!res.ok) return []
  //   const guilds = (await res.json()) as DiscordGuild[]
  //   guildCache.set(userId, { guilds, expiresAt: Date.now() + 60000 })
  //   return guilds
  // } catch {
  //   return []
  // }
  // --- End original code ---
  let res = await fetch("https://discord.com/api/v10/users/@me/guilds?with_counts=true", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    res = await fetch("https://discord.com/api/v10/users/@me/guilds?with_counts=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }
  if (!res.ok) {
    const err: any = new Error(`Discord API returned ${res.status}`)
    err.discordStatus = res.status
    throw err
  }
  const guilds = (await res.json()) as DiscordGuild[]
  guildCache.set(userId, { guilds, expiresAt: Date.now() + 300000 })
  return guilds
  // --- END AI-REPLACED ---
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: fetch guild member roles via bot token for mod_role/admin_role checking
interface GuildMemberInfo {
  roles: string[]
}

let memberRoleCache = new Map<string, { roles: string[]; expiresAt: number }>()

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: export getUserGuildRoles for reuse in servers API
export async function getUserGuildRoles(guildId: bigint, userId: string): Promise<string[]> {
// --- END AI-MODIFIED ---
  const cacheKey = `${guildId}-${userId}`
  const cached = memberRoleCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.roles
  }

  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) return []

  // --- AI-REPLACED (2026-03-21) ---
  // Reason: Same fix as getUserGuilds -- throw on errors instead of returning [].
  // What the new code does better: Errors propagate to callers. Cache extended to 5min.
  // --- Original code (commented out for rollback) ---
  // try {
  //   let res = await fetch(
  //     `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
  //     { headers: { Authorization: `Bot ${botToken}` } }
  //   )
  //   if (res.status === 429) {
  //     const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
  //     await new Promise((r) => setTimeout(r, retryAfter * 1000))
  //     res = await fetch(
  //       `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
  //       { headers: { Authorization: `Bot ${botToken}` } }
  //     )
  //   }
  //   if (!res.ok) return []
  //   const member = (await res.json()) as GuildMemberInfo
  //   const roles = member.roles || []
  //   memberRoleCache.set(cacheKey, { roles, expiresAt: Date.now() + 60000 })
  //   return roles
  // } catch {
  //   return []
  // }
  // --- End original code ---
  let res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
    { headers: { Authorization: `Bot ${botToken}` } }
  )
  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      { headers: { Authorization: `Bot ${botToken}` } }
    )
  }
  if (!res.ok) {
    const err: any = new Error(`Discord member API returned ${res.status}`)
    err.discordStatus = res.status
    throw err
  }
  const member = (await res.json()) as GuildMemberInfo
  const roles = member.roles || []
  memberRoleCache.set(cacheKey, { roles, expiresAt: Date.now() + 300000 })
  return roles
  // --- END AI-REPLACED ---
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: check if the bot is actually present in a guild via Discord API (cached 5 min)
const botPresenceCache = new Map<string, { present: boolean; expiresAt: number }>()

export async function checkBotInGuild(guildId: string): Promise<boolean> {
  const cached = botPresenceCache.get(guildId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.present
  }

  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) return false

  try {
    let res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      { headers: { Authorization: `Bot ${botToken}` } }
    )
    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}`,
        { headers: { Authorization: `Bot ${botToken}` } }
      )
    }
    const present = res.ok
    botPresenceCache.set(guildId, { present, expiresAt: Date.now() + 300000 })
    return present
  } catch {
    return false
  }
}
// --- END AI-MODIFIED ---

export async function isMember(userId: bigint, guildId: bigint): Promise<boolean> {
  const member = await prisma.members.findUnique({
    where: { guildid_userid: { guildid: guildId, userid: userId } },
    select: { userid: true },
  })
  return !!member
}

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: check mod_role/admin_role from guild_config against user's actual roles
export async function isModerator(
  auth: AuthContext,
  guildId: bigint
): Promise<boolean> {
  const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
  const guild = guilds.find((g) => g.id === guildId.toString())
  if (!guild) return false

  const perms = BigInt(guild.permissions)
  if (perms & BigInt(ADMINISTRATOR)) return true
  if (perms & BigInt(MANAGE_GUILD)) return true

  const guildConfig = await prisma.guild_config.findUnique({
    where: { guildid: guildId },
    select: { mod_role: true, admin_role: true },
  })
  if (!guildConfig) return false

  if (guildConfig.mod_role || guildConfig.admin_role) {
    const userRoles = await getUserGuildRoles(guildId, auth.discordId)
    if (guildConfig.admin_role && userRoles.includes(guildConfig.admin_role.toString())) return true
    if (guildConfig.mod_role && userRoles.includes(guildConfig.mod_role.toString())) return true
  }

  return false
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: check admin_role from guild_config against user's actual roles
export async function isAdmin(
  auth: AuthContext,
  guildId: bigint
): Promise<boolean> {
  const guilds = await getUserGuilds(auth.accessToken, auth.discordId)
  const guild = guilds.find((g) => g.id === guildId.toString())
  if (!guild) return false

  const perms = BigInt(guild.permissions)
  if (perms & BigInt(ADMINISTRATOR)) return true

  const guildConfig = await prisma.guild_config.findUnique({
    where: { guildid: guildId },
    select: { admin_role: true },
  })
  if (guildConfig?.admin_role) {
    const userRoles = await getUserGuildRoles(guildId, auth.discordId)
    if (userRoles.includes(guildConfig.admin_role.toString())) return true
  }

  return false
}
// --- END AI-MODIFIED ---

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthContext | null> {
  const auth = await getAuthContext(req)
  if (!auth) {
    unauthorized(res)
    return null
  }
  if (!checkRateLimit(auth.discordId)) {
    rateLimited(res)
    return null
  }
  return auth
}

export async function requireModerator(
  req: NextApiRequest,
  res: NextApiResponse,
  guildId: bigint
): Promise<AuthContext | null> {
  const auth = await requireAuth(req, res)
  if (!auth) return null
  if (!(await isModerator(auth, guildId))) {
    forbidden(res)
    return null
  }
  return auth
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  guildId: bigint
): Promise<AuthContext | null> {
  const auth = await requireAuth(req, res)
  if (!auth) return null
  if (!(await isAdmin(auth, guildId))) {
    forbidden(res)
    return null
  }
  return auth
}
