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
  const token = await getToken({ req, secret })
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
export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  permissions: string
}

let guildCache = new Map<string, { guilds: DiscordGuild[]; expiresAt: number }>()

export async function getUserGuilds(accessToken: string, userId: string): Promise<DiscordGuild[]> {
// --- END AI-MODIFIED ---
  const cached = guildCache.get(userId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.guilds
  }

  try {
    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: handle Discord 429 rate limits with retry
    let res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get("retry-after") || "2")
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    }
    if (!res.ok) return []
    // --- END AI-MODIFIED ---
    const guilds = (await res.json()) as DiscordGuild[]
    guildCache.set(userId, { guilds, expiresAt: Date.now() + 60000 })
    return guilds
  } catch {
    return []
  }
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

  try {
    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: handle Discord 429 rate limits with retry
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
    if (!res.ok) return []
    // --- END AI-MODIFIED ---
    const member = (await res.json()) as GuildMemberInfo
    const roles = member.roles || []
    memberRoleCache.set(cacheKey, { roles, expiresAt: Date.now() + 60000 })
    return roles
  } catch {
    return []
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
