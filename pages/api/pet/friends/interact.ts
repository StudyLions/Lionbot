// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Friend interaction -- care for a friend's pet
//          (feed/bathe/sleep) or water their farm plot.
//          One interaction per type per day (UTC). WATER also
//          grants 5 XP to the actor's pet.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAuth } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Added WATER_ALL as a valid interaction type
const VALID_TYPES = ["FEED", "BATHE", "SLEEP", "WATER", "WATER_ALL"] as const
type InteractionType = typeof VALID_TYPES[number]
// --- END AI-MODIFIED ---

export default apiHandler({
  async POST(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const actorId = BigInt(auth.discordId)
    const { targetUserId, type, plotId } = req.body as {
      targetUserId?: string
      type?: string
      plotId?: number
    }

    const targetId = parseBigInt(targetUserId, "targetUserId")

    if (targetId === actorId) {
      return res.status(400).json({ error: "Use /api/pet/care for your own pet" })
    }
    if (!type || !VALID_TYPES.includes(type as InteractionType)) {
      return res.status(400).json({ error: "Invalid type. Use: FEED, BATHE, SLEEP, or WATER" })
    }
    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Only require plotId for single WATER, not WATER_ALL
    if (type === "WATER" && (plotId == null || typeof plotId !== "number")) {
      return res.status(400).json({ error: "plotId is required for WATER interactions" })
    }
    // --- END AI-MODIFIED ---

    const [lower, upper] = actorId < targetId
      ? [actorId, targetId]
      : [targetId, actorId]

    const friendship = await prisma.lg_friends.findUnique({
      where: { userid1_userid2: { userid1: lower, userid2: upper } },
    })
    if (!friendship) {
      return res.status(403).json({ error: "You are not friends with this user" })
    }

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Skip daily duplicate check for WATER_ALL (it handles per-plot checks internally)
    if (type !== "WATER_ALL") {
      const existingToday = await prisma.lg_friend_interactions.findFirst({
        where: {
          actor_userid: actorId,
          target_userid: targetId,
          interaction_type: type,
          created_at: { gte: todayStart },
          ...(type === "WATER" ? { plot_id: plotId } : {}),
        },
      })

      if (existingToday) {
        return res.status(400).json({
          error: type === "WATER"
            ? "You already watered this plot today"
            : `You already used ${type} on this friend's pet today`,
        })
      }
    }
    // --- END AI-MODIFIED ---

    const targetPet = await prisma.lg_pets.findUnique({
      where: { userid: targetId },
      select: { userid: true },
    })
    if (!targetPet) {
      return res.status(404).json({ error: "Friend's pet not found" })
    }

    if (type === "FEED") {
      await prisma.$executeRaw`
        UPDATE lg_pets SET food = LEAST(food + 2, 8) WHERE userid = ${targetId}
      `
    } else if (type === "BATHE") {
      await prisma.$executeRaw`
        UPDATE lg_pets SET bath = LEAST(bath + 2, 8) WHERE userid = ${targetId}
      `
    } else if (type === "SLEEP") {
      await prisma.$executeRaw`
        UPDATE lg_pets SET sleep = LEAST(sleep + 2, 8) WHERE userid = ${targetId}
      `
    } else if (type === "WATER") {
      const updated = await prisma.lg_user_farm.updateMany({
        where: { userid: targetId, plot_id: plotId! },
        data: { last_watered: new Date() },
      })
      if (updated.count === 0) {
        return res.status(404).json({ error: "Farm plot not found" })
      }
      await prisma.$executeRaw`
        UPDATE lg_pets SET xp = xp + 5 WHERE userid = ${actorId}
      `
    // --- AI-MODIFIED (2026-03-24) ---
    // Purpose: Handle WATER_ALL -- water all friend's alive plots not yet watered today
    } else if (type === "WATER_ALL") {
      const plots = await prisma.lg_user_farm.findMany({
        where: { userid: targetId, seed_id: { not: null }, dead: false },
        select: { plot_id: true },
      })

      let wateredCount = 0
      for (const plot of plots) {
        const alreadyWatered = await prisma.lg_friend_interactions.findFirst({
          where: {
            actor_userid: actorId,
            target_userid: targetId,
            interaction_type: "WATER",
            plot_id: plot.plot_id,
            created_at: { gte: todayStart },
          },
        })
        if (alreadyWatered) continue

        await prisma.lg_user_farm.updateMany({
          where: { userid: targetId, plot_id: plot.plot_id },
          data: { last_watered: new Date() },
        })
        await prisma.lg_friend_interactions.create({
          data: {
            actor_userid: actorId,
            target_userid: targetId,
            interaction_type: "WATER",
            plot_id: plot.plot_id,
          },
        })
        wateredCount++
      }

      if (wateredCount > 0) {
        await prisma.$executeRaw`
          UPDATE lg_pets SET xp = xp + ${wateredCount * 5} WHERE userid = ${actorId}
        `
      }

      return res.status(200).json({ success: true, wateredCount })
    }
    // --- END AI-MODIFIED ---

    await prisma.lg_friend_interactions.create({
      data: {
        actor_userid: actorId,
        target_userid: targetId,
        interaction_type: type,
        plot_id: type === "WATER" ? plotId! : null,
      },
    })

    return res.status(200).json({ success: true })
  },
})
