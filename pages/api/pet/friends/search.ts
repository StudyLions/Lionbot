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
            ? { userid: { notIn: [...blockedIds].map((id) => BigInt(id)) } }
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

    const results = userResults
      .filter((u) => petMap.has(u.userid.toString()) && u.userid !== userId)
      .slice(0, 10)
      .map((u) => {
        const pet = petMap.get(u.userid.toString())!
        return {
          discordId: u.userid.toString(),
          name: u.name,
          avatarHash: u.avatar_hash,
          petName: pet.pet_name,
          petLevel: pet.level,
        }
      })

    return res.status(200).json({ results })
  },
})
