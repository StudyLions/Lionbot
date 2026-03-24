// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friend activity feed -- aggregates recent notable
//          events from the user's friends (rare drops, level
//          ups, marketplace listings) in the last 24 hours
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

interface ActivityEvent {
  type: string
  userId: string
  userName: string
  description: string
  timestamp: string
}

const RARE_RARITIES = ["EPIC", "LEGENDARY", "MYTHICAL"]

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const friendRows = await prisma.lg_friends.findMany({
      where: {
        OR: [{ userid1: userId }, { userid2: userId }],
      },
      select: { userid1: true, userid2: true },
    })

    const friendIds = friendRows.map((f) =>
      f.userid1 === userId ? f.userid2 : f.userid1
    )

    if (friendIds.length === 0) {
      return res.status(200).json({ events: [] })
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const friendConfigs = await prisma.user_config.findMany({
      where: { userid: { in: friendIds } },
      select: { userid: true, name: true },
    })
    const nameMap = new Map(
      friendConfigs.map((c) => [c.userid.toString(), c.name ?? "Unknown"])
    )

    const [rareDrops, newListings, levelUps] = await Promise.all([
      prisma.$queryRaw<
        { userid: bigint; name: string; rarity: string; acquired_at: Date }[]
      >`
        SELECT i.userid, it.name, it.rarity, i.acquired_at
        FROM lg_user_inventory i
        JOIN lg_items it ON it.itemid = i.itemid
        WHERE i.userid = ANY(${friendIds}::bigint[])
          AND i.acquired_at >= ${since}
          AND it.rarity IN ('EPIC', 'LEGENDARY', 'MYTHICAL')
        ORDER BY i.acquired_at DESC
        LIMIT 50
      `,

      prisma.lg_marketplace_listings.findMany({
        where: {
          seller_userid: { in: friendIds },
          created_at: { gte: since },
          status: "ACTIVE",
        },
        include: { lg_items: { select: { name: true, rarity: true } } },
        orderBy: { created_at: "desc" },
        take: 50,
      }),

      prisma.$queryRaw<
        { userid: bigint; level: number; xp: bigint }[]
      >`
        SELECT userid, level, xp
        FROM lg_pets
        WHERE userid = ANY(${friendIds}::bigint[])
          AND level >= 2
        ORDER BY level DESC
        LIMIT 50
      `,
    ])

    const events: ActivityEvent[] = []

    for (const drop of rareDrops) {
      const uid = drop.userid.toString()
      events.push({
        type: "rare_drop",
        userId: uid,
        userName: nameMap.get(uid) ?? "Unknown",
        description: `Found a ${drop.rarity} ${drop.name}!`,
        timestamp: drop.acquired_at.toISOString(),
      })
    }

    for (const listing of newListings) {
      const uid = listing.seller_userid.toString()
      events.push({
        type: "marketplace_listing",
        userId: uid,
        userName: nameMap.get(uid) ?? "Unknown",
        description: `Listed ${listing.lg_items.name} (${listing.lg_items.rarity}) on the marketplace for ${listing.price_per_unit} ${listing.currency}`,
        timestamp: listing.created_at.toISOString(),
      })
    }

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Wire up levelUps events (were fetched but never pushed to the array)
    for (const lu of levelUps) {
      const uid = lu.userid.toString()
      events.push({
        type: "level_up",
        userId: uid,
        userName: nameMap.get(uid) ?? "Unknown",
        description: `Reached Level ${lu.level}!`,
        timestamp: new Date().toISOString(),
      })
    }
    // --- END AI-MODIFIED ---

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return res.status(200).json({ events: events.slice(0, 50) })
  },
})
