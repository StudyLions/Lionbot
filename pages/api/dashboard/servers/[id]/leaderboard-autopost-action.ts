// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-21
// Purpose: Action API for leaderboard auto-post (test/run-now/simulate)
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin, getAuthContext } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  test: { max: 3, windowMs: 3600000 },
  run_now: { max: 1, windowMs: 3600000 },
  simulate: { max: 999, windowMs: 60000 },
}

export default apiHandler({
  async POST(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { configid, action } = req.body
    if (!configid || !action) {
      throw new ValidationError("configid and action are required")
    }

    const validActions = ["test", "run_now", "simulate"]
    if (!validActions.includes(action)) {
      throw new ValidationError(`action must be one of: ${validActions.join(", ")}`)
    }

    const config = await prisma.leaderboard_autopost_config.findFirst({
      where: { configid: parseInt(configid, 10), guildid: guildId },
    })
    if (!config) {
      throw new ValidationError("Config not found", 404)
    }

    const limit = RATE_LIMITS[action]
    if (limit && action !== "simulate") {
      const since = new Date(Date.now() - limit.windowMs)
      const recentCount = await prisma.leaderboard_autopost_test_log.count({
        where: {
          guildid: guildId,
          action_type: action,
          created_at: { gte: since },
        },
      })
      if (recentCount >= limit.max) {
        throw new ValidationError(
          `Rate limited: max ${limit.max} ${action} action(s) per hour`
        )
      }

      await prisma.leaderboard_autopost_test_log.create({
        data: {
          guildid: guildId,
          action_type: action,
        },
      })
    }

    const authCtx = await getAuthContext(req)
    const requestedBy = authCtx ? BigInt(authCtx.discordId) : BigInt(0)

    const queueEntry = await prisma.leaderboard_autopost_action_queue.create({
      data: {
        guildid: guildId,
        configid: config.configid,
        requested_by: requestedBy,
        action_type: action,
        payload: req.body.payload || null,
        status: "pending",
      },
    })

    return res.status(202).json({
      queueid: queueEntry.queueid,
      status: "pending",
    })
  },

  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const queueid = parseInt(req.query.queueid as string, 10)
    if (!queueid || isNaN(queueid)) {
      throw new ValidationError("queueid query parameter is required")
    }

    const entry = await prisma.leaderboard_autopost_action_queue.findFirst({
      where: { queueid, guildid: guildId },
    })
    if (!entry) {
      throw new ValidationError("Action not found", 404)
    }

    return res.status(200).json({
      queueid: entry.queueid,
      action_type: entry.action_type,
      status: entry.status,
      result: entry.result,
      created_at: entry.created_at.toISOString(),
      processed_at: entry.processed_at?.toISOString() ?? null,
    })
  },
})
