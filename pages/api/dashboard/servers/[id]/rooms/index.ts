// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Admin room listing API -- paginated list of all rooms
//          in a server with filters, search, sort, and live occupancy
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { Prisma } from "@prisma/client"

function discordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}`
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const filter = (req.query.filter as string) || "active"
    const search = (req.query.search as string) || ""
    const sort = (req.query.sort as string) || "created"
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20))

    const where: Prisma.rented_roomsWhereInput = { guildid: guildId }
    if (filter === "active") where.deleted_at = null
    else if (filter === "expired") where.deleted_at = { not: null }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ownerid: { equals: (() => { try { return BigInt(search) } catch { return BigInt(0) } })() } },
      ]
    }

    // --- AI-MODIFIED (2026-04-06) ---
    // Purpose: Add "activity" sort option for last_activity column
    // --- Original code (commented out for rollback) ---
    // const orderBy: Prisma.rented_roomsOrderByWithRelationInput =
    //   sort === "balance" ? { coin_balance: "desc" } :
    //   sort === "members" ? { rented_members: { _count: "desc" } } :
    //   sort === "name" ? { name: "asc" } :
    //   { created_at: "desc" }
    // --- End original code ---
    const orderBy: Prisma.rented_roomsOrderByWithRelationInput =
      sort === "balance" ? { coin_balance: "desc" } :
      sort === "members" ? { rented_members: { _count: "desc" } } :
      sort === "name" ? { name: "asc" } :
      sort === "activity" ? { last_activity: "asc" } :
      { created_at: "desc" }
    // --- END AI-MODIFIED ---

    const [rooms, total] = await Promise.all([
      prisma.rented_rooms.findMany({
        where,
        include: {
          // --- AI-MODIFIED (2026-03-23) ---
          // Purpose: contribution column does not exist in rented_members schema
          rented_members: { select: { userid: true } },
          // --- END AI-MODIFIED ---
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rented_rooms.count({ where }),
    ])

    const guildConfig = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { renting_price: true, renting_cap: true },
    })
    const rentPrice = guildConfig?.renting_price ?? 1000

    const allUserIds = new Set<string>()
    for (const r of rooms) {
      allUserIds.add(r.ownerid.toString())
      for (const m of r.rented_members) allUserIds.add(m.userid.toString())
    }
    const userIdBigints = Array.from(allUserIds).map((id) => BigInt(id))

    const roomChannelIds = rooms.map((r) => r.channelid)

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Also fetch timer data per room for timer badges
    const [userConfigs, memberRows, ongoingSessions, roomTimers] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: userIdBigints } },
        select: { userid: true, name: true, avatar_hash: true },
      }),
      prisma.members.findMany({
        where: { guildid: guildId, userid: { in: userIdBigints } },
        select: { userid: true, display_name: true },
      }),
      prisma.voice_sessions_ongoing.findMany({
        where: { guildid: guildId, channelid: { in: roomChannelIds } },
        select: { channelid: true, userid: true },
      }),
      prisma.timers.findMany({
        where: { channelid: { in: roomChannelIds } },
        select: { channelid: true, last_started: true, focus_length: true, break_length: true },
      }),
    ])

    const timerMap = new Map(roomTimers.map((t) => [t.channelid.toString(), t]))
    // --- END AI-MODIFIED ---

    const ucMap = new Map(userConfigs.map((u) => [u.userid.toString(), u]))
    const memMap = new Map(memberRows.map((m) => [m.userid.toString(), m]))

    const occupancyMap = new Map<string, string[]>()
    for (const s of ongoingSessions) {
      const chId = s.channelid.toString()
      if (!occupancyMap.has(chId)) occupancyMap.set(chId, [])
      occupancyMap.get(chId)!.push(s.userid.toString())
    }

    function getUserDisplay(uid: bigint) {
      const uidStr = uid.toString()
      const uc = ucMap.get(uidStr)
      const mem = memMap.get(uidStr)
      return {
        userId: uidStr,
        displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
        avatarUrl: discordAvatarUrl(uidStr, uc?.avatar_hash ?? null),
      }
    }

    const roomList = rooms.map((r) => {
      const chId = r.channelid.toString()
      const daysRemaining = rentPrice > 0 ? Math.floor(r.coin_balance / rentPrice) : 999
      const owner = getUserDisplay(r.ownerid)
      const liveUsers = (occupancyMap.get(chId) || []).map((uid) => {
        const uc = ucMap.get(uid)
        return {
          userId: uid,
          displayName: memMap.get(uid)?.display_name || uc?.name || `User ${uid.slice(-4)}`,
          avatarUrl: discordAvatarUrl(uid, uc?.avatar_hash ?? null),
        }
      })

      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Include timer status per room for timer badges
      const timer = timerMap.get(chId)
      // --- END AI-MODIFIED ---

      return {
        channelId: chId,
        name: r.name || null,
        coinBalance: r.coin_balance,
        daysRemaining,
        rentPrice,
        memberCount: r.rented_members.length + 1,
        totalContribution: r.contribution,
        createdAt: r.created_at?.toISOString() ?? null,
        deletedAt: r.deleted_at?.toISOString() ?? null,
        frozenAt: r.frozen_at?.toISOString() ?? null,
        frozenBy: r.frozen_by?.toString() ?? null,
        // --- AI-MODIFIED (2026-04-06) ---
        // Purpose: Expose last_activity for inactivity display in admin panel
        lastActivity: r.last_activity?.toISOString() ?? null,
        // --- END AI-MODIFIED ---
        owner,
        liveUsers,
        isLive: liveUsers.length > 0,
        // --- AI-MODIFIED (2026-03-22) ---
        // Purpose: Timer badge data
        hasTimer: !!timer,
        timerRunning: !!timer?.last_started,
        // --- END AI-MODIFIED ---
      }
    })

    if (sort !== "balance" && sort !== "name" && sort !== "created") {
      roomList.sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0))
    }

    res.status(200).json({
      rooms: roomList,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      rentPrice,
    })
  },
})
