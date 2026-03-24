// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Search for users by Discord name or ID -- only
//          returns users who have pets, excludes blocked users
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)
    const q = (req.query.q as string || "").trim()

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" })
    }

    const blockedRows = await prisma.lg_blocks.findMany({
      where: {
        OR: [
          { blocker_userid: userId },
          { blocked_userid: userId },
        ],
      },
      select: { blocker_userid: true, blocked_userid: true },
    })
    const blockedIds = new Set<string>()
    for (const b of blockedRows) {
      blockedIds.add(b.blocker_userid.toString())
      blockedIds.add(b.blocked_userid.toString())
    }
    blockedIds.delete(userId.toString())

    const isNumericId = /^\d{17,20}$/.test(q)

    let userResults: { userid: bigint; name: string | null; avatar_hash: string | null }[]

    if (isNumericId) {
      const exactId = BigInt(q)
      if (blockedIds.has(q)) {
        return res.status(200).json({ results: [] })
      }
      userResults = await prisma.user_config.findMany({
        where: { userid: exactId },
        select: { userid: true, name: true, avatar_hash: true },
        take: 1,
      })
    } else {
      userResults = await prisma.user_config.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          ...(blockedIds.size > 0
            ? { userid: { notIn: Array.from(blockedIds).map((id) => BigInt(id)) } }
            : {}),
        },
        select: { userid: true, name: true, avatar_hash: true },
        take: 20,
      })
    }

    if (userResults.length === 0) {
      return res.status(200).json({ results: [] })
    }

    const userIds = userResults.map((u) => u.userid)
    const pets = await prisma.lg_pets.findMany({
      where: { userid: { in: userIds } },
      select: { userid: true, pet_name: true, level: true },
    })
    const petMap = new Map(pets.map((p) => [p.userid.toString(), p]))

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: return discordName (not name) + isFriend/isPending flags to match frontend interface
    const filtered = userResults
      .filter((u) => petMap.has(u.userid.toString()) && u.userid !== userId)
      .slice(0, 10)

    const filteredIds = filtered.map((u) => u.userid)

    const [friendRows, pendingRows] = filteredIds.length > 0
      ? await Promise.all([
          prisma.lg_friends.findMany({
            where: {
              OR: filteredIds.flatMap((fid) => {
                const [lo, hi] = userId < fid ? [userId, fid] : [fid, userId]
                return [{ userid1: lo, userid2: hi }]
              }),
            },
            select: { userid1: true, userid2: true },
          }),
          prisma.lg_friend_requests.findMany({
            where: {
              status: "PENDING",
              OR: filteredIds.flatMap((fid) => [
                { from_userid: userId, to_userid: fid },
                { from_userid: fid, to_userid: userId },
              ]),
            },
            select: { from_userid: true, to_userid: true },
          }),
        ])
      : [[], []]

    const friendSet = new Set<string>()
    for (const f of friendRows) {
      friendSet.add(f.userid1 === userId ? f.userid2.toString() : f.userid1.toString())
    }
    const pendingSet = new Set<string>()
    for (const p of pendingRows) {
      pendingSet.add(p.from_userid === userId ? p.to_userid.toString() : p.from_userid.toString())
    }

    const results = filtered.map((u) => {
      const uid = u.userid.toString()
      const pet = petMap.get(uid)!
      return {
        discordId: uid,
        discordName: u.name,
        avatarHash: u.avatar_hash,
        petName: pet.pet_name,
        petLevel: pet.level,
        isFriend: friendSet.has(uid),
        isPending: pendingSet.has(uid),
      }
    })
    // --- END AI-MODIFIED ---

    return res.status(200).json({ results })
  },
})
