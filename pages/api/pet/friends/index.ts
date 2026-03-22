// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friends list API -- returns authenticated user's
//          friends with compact pet data + pending request count
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

function calcMaxFriends(petLevel: number): number {
  return Math.min(20, 10 + Math.floor((petLevel - 1) / 5))
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const pet = await prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { level: true },
    })
    if (!pet) {
      return res.status(404).json({ error: "No pet found. Use /pet in Discord first." })
    }

    const [friendRows, pendingCount] = await Promise.all([
      prisma.lg_friends.findMany({
        where: {
          OR: [{ userid1: userId }, { userid2: userId }],
        },
        select: { userid1: true, userid2: true, created_at: true },
      }),
      prisma.lg_friend_requests.count({
        where: { to_userid: userId, status: "PENDING" },
      }),
    ])

    const friendUserIds = friendRows.map((f) =>
      f.userid1 === userId ? f.userid2 : f.userid1
    )
    const friendCreatedMap = new Map(
      friendRows.map((f) => [
        (f.userid1 === userId ? f.userid2 : f.userid1).toString(),
        f.created_at,
      ])
    )

    const [petRows, configRows] = friendUserIds.length > 0
      ? await Promise.all([
          prisma.lg_pets.findMany({
            where: { userid: { in: friendUserIds } },
            select: {
              userid: true,
              pet_name: true,
              level: true,
              expression: true,
            },
          }),
          prisma.user_config.findMany({
            where: { userid: { in: friendUserIds } },
            select: {
              userid: true,
              name: true,
              avatar_hash: true,
            },
          }),
        ])
      : [[], []]

    const petMap = new Map(petRows.map((p) => [p.userid.toString(), p]))
    const configMap = new Map(configRows.map((c) => [c.userid.toString(), c]))

    const friends = friendUserIds.map((fid) => {
      const fidStr = fid.toString()
      const p = petMap.get(fidStr)
      const c = configMap.get(fidStr)
      return {
        discordId: fidStr,
        name: c?.name ?? null,
        avatarHash: c?.avatar_hash ?? null,
        petName: p?.pet_name ?? null,
        petLevel: p?.level ?? 0,
        expression: (p?.expression ?? "default").toLowerCase(),
        friendsSince: friendCreatedMap.get(fidStr)?.toISOString() ?? null,
      }
    })

    return res.status(200).json({
      friends,
      pendingCount,
      maxFriends: calcMaxFriends(pet.level),
    })
  },
})
