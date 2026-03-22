// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Public pet profile with friendship context -- shows
//          pet visual data + whether viewer is friends + today's
//          interactions (what the viewer already did today)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"
import { fetchPetVisualData } from "@/pages/api/pet/profile/[userId]"

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const currentUserId = BigInt(auth.discordId)
    const targetId = parseBigInt(req.query.userId, "userId")

    if (targetId === currentUserId) {
      return res.status(400).json({ error: "Use /api/pet/overview for your own pet" })
    }

    const blocked = await prisma.lg_blocks.findUnique({
      where: {
        blocker_userid_blocked_userid: {
          blocker_userid: targetId,
          blocked_userid: currentUserId,
        },
      },
    })
    if (blocked) {
      return res.status(403).json({ error: "You cannot view this user's profile" })
    }

    const profileData = await fetchPetVisualData(targetId)
    if (!profileData) {
      return res.status(404).json({ error: "User does not have a pet" })
    }

    const [lower, upper] = currentUserId < targetId
      ? [currentUserId, targetId]
      : [targetId, currentUserId]

    const friendship = await prisma.lg_friends.findUnique({
      where: { userid1_userid2: { userid1: lower, userid2: upper } },
    })
    const isFriend = !!friendship

    let todayInteractions = { feed: false, bathe: false, sleep: false, waterPlots: [] as number[] }

    if (isFriend) {
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      const interactions = await prisma.lg_friend_interactions.findMany({
        where: {
          actor_userid: currentUserId,
          target_userid: targetId,
          created_at: { gte: todayStart },
        },
        select: { interaction_type: true, plot_id: true },
      })

      for (const i of interactions) {
        if (i.interaction_type === "FEED") todayInteractions.feed = true
        else if (i.interaction_type === "BATHE") todayInteractions.bathe = true
        else if (i.interaction_type === "SLEEP") todayInteractions.sleep = true
        else if (i.interaction_type === "WATER" && i.plot_id != null) {
          todayInteractions.waterPlots.push(i.plot_id)
        }
      }
    }

    return res.status(200).json({
      ...profileData,
      isFriend,
      todayInteractions,
    })
  },
})
