// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Return pending incoming friend requests for the
//          authenticated user, with sender profile data
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const userId = BigInt(auth.discordId)

    const rows = await prisma.lg_friend_requests.findMany({
      where: { to_userid: userId, status: "PENDING" },
      orderBy: { created_at: "desc" },
    })

    if (rows.length === 0) {
      return res.status(200).json({ requests: [] })
    }

    const senderIds = rows.map((r) => r.from_userid)

    const [configs, pets] = await Promise.all([
      prisma.user_config.findMany({
        where: { userid: { in: senderIds } },
        select: { userid: true, name: true, avatar_hash: true },
      }),
      prisma.lg_pets.findMany({
        where: { userid: { in: senderIds } },
        select: { userid: true, pet_name: true },
      }),
    ])

    const configMap = new Map(configs.map((c) => [c.userid.toString(), c]))
    const petMap = new Map(pets.map((p) => [p.userid.toString(), p]))

    const requests = rows.map((r) => {
      const uid = r.from_userid.toString()
      const cfg = configMap.get(uid)
      const pet = petMap.get(uid)
      return {
        requestId: r.request_id,
        fromUserId: uid,
        fromUserName: cfg?.name ?? "Unknown",
        fromPetName: pet?.pet_name ?? "Unknown",
        fromAvatarHash: cfg?.avatar_hash ?? null,
        createdAt: r.created_at?.toISOString() ?? new Date().toISOString(),
      }
    })

    return res.status(200).json({ requests })
  },
})
