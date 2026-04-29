// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: GET/PATCH per-task status for the Setup Checklist widget.
//
//          GET returns:
//            - tasks: { essentials: { status, configured }, ranks: ..., ... }
//            - completed_count, skipped_count, total
//            - all_done (bool) — convenience flag the widget uses to collapse itself
//
//          PATCH body:
//            { task: "essentials" | ..., status: "done" | "skipped" | "pending" }
//
//          State lives on guild_config.setup_checklist_state (jsonb). The
//          "configured" flag is computed from the bot's actual settings (e.g.
//          essentials.configured = !!admin_role && !!mod_role && !!timezone)
//          so the UI can show "already set up" trust signals without needing
//          to re-fetch /config.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"

type TaskStatus = "pending" | "done" | "skipped"

const TASK_IDS = [
  "essentials",
  "ranks",
  "rewards",
  "welcome",
  "notifications",
  "focus",
  "schedule",
  "pet",
] as const

type TaskId = (typeof TASK_IDS)[number]

// Whether a given task has any configured value already in the bot's settings.
// Used purely as a "we found existing settings, you might want to skip this" hint.
// Channel/role columns are read from guild_config and schedule_guild_config.
function isConfigured(
  taskId: TaskId,
  gc: any,
  sgc: { lobby_channel: bigint | null; room_channel: bigint | null } | null,
): boolean {
  switch (taskId) {
    case "essentials":
      return !!(gc.timezone || gc.admin_role || gc.mod_role)
    case "ranks":
      return !!(
        gc.voice_ranks_enabled ||
        gc.msg_ranks_enabled ||
        gc.xp_ranks_enabled ||
        gc.rank_channel ||
        gc.dm_ranks
      )
    case "rewards":
      return !!(
        gc.study_hourly_reward != null ||
        gc.study_hourly_live_bonus != null ||
        gc.starting_funds != null
      )
    case "welcome":
      return !!(gc.greeting_channel || gc.greeting_message || gc.returning_message)
    case "notifications":
      return !!(
        gc.event_log_channel ||
        gc.mod_log_channel ||
        gc.alert_channel ||
        gc.pomodoro_channel
      )
    case "focus":
      return !!(gc.task_reward != null || gc.task_reward_limit != null || gc.session_leave_summary)
    case "schedule":
      return !!(sgc?.lobby_channel || sgc?.room_channel)
    case "pet":
      return !!gc.lg_enabled
    default:
      return false
  }
}

function summarize(
  state: Record<string, TaskStatus>,
  gc: any,
  sgc: { lobby_channel: bigint | null; room_channel: bigint | null } | null,
) {
  const tasks: Record<string, { status: TaskStatus; configured: boolean }> = {}
  let done = 0
  let skipped = 0
  for (const id of TASK_IDS) {
    const status = (state[id] as TaskStatus) || "pending"
    tasks[id] = { status, configured: isConfigured(id, gc, sgc) }
    if (status === "done") done++
    else if (status === "skipped") skipped++
  }
  return {
    tasks,
    completed_count: done,
    skipped_count: skipped,
    total: TASK_IDS.length,
    all_done: done + skipped === TASK_IDS.length,
  }
}

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const [gc, sgc] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: {
          timezone: true,
          admin_role: true,
          mod_role: true,
          voice_ranks_enabled: true,
          msg_ranks_enabled: true,
          xp_ranks_enabled: true,
          rank_channel: true,
          dm_ranks: true,
          study_hourly_reward: true,
          study_hourly_live_bonus: true,
          starting_funds: true,
          greeting_channel: true,
          greeting_message: true,
          returning_message: true,
          event_log_channel: true,
          mod_log_channel: true,
          alert_channel: true,
          pomodoro_channel: true,
          task_reward: true,
          task_reward_limit: true,
          session_leave_summary: true,
          lg_enabled: true,
          setup_checklist_state: true,
        },
      }),
      prisma.schedule_guild_config.findUnique({
        where: { guildid: guildId },
        select: { lobby_channel: true, room_channel: true },
      }),
    ])

    if (!gc) return res.status(404).json({ error: "Server not found" })

    const rawState = (gc.setup_checklist_state as Record<string, TaskStatus> | null) ?? {}
    return res.status(200).json(summarize(rawState, gc, sgc))
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { task, status } = req.body ?? {}
    if (!TASK_IDS.includes(task)) {
      throw new ValidationError(`Unknown task id "${task}"`)
    }
    if (status !== "done" && status !== "skipped" && status !== "pending") {
      throw new ValidationError(`Invalid status "${status}"`)
    }

    const existing = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { setup_checklist_state: true },
    })
    if (!existing) return res.status(404).json({ error: "Server not found" })

    const next: Record<string, TaskStatus> = {
      ...((existing.setup_checklist_state as Record<string, TaskStatus> | null) ?? {}),
    }
    // Pending = the absence of a recorded status. Keeps the JSON small as servers
    // un-skip tasks rather than accumulating stale "pending" entries.
    if (status === "pending") {
      delete next[task]
    } else {
      next[task] = status
    }

    await prisma.guild_config.update({
      where: { guildid: guildId },
      data: { setup_checklist_state: next },
    })

    // Re-fetch the slim summary so the client doesn't need a second round-trip.
    const [gc, sgc] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: guildId },
        select: {
          timezone: true,
          admin_role: true,
          mod_role: true,
          voice_ranks_enabled: true,
          msg_ranks_enabled: true,
          xp_ranks_enabled: true,
          rank_channel: true,
          dm_ranks: true,
          study_hourly_reward: true,
          study_hourly_live_bonus: true,
          starting_funds: true,
          greeting_channel: true,
          greeting_message: true,
          returning_message: true,
          event_log_channel: true,
          mod_log_channel: true,
          alert_channel: true,
          pomodoro_channel: true,
          task_reward: true,
          task_reward_limit: true,
          session_leave_summary: true,
          lg_enabled: true,
        },
      }),
      prisma.schedule_guild_config.findUnique({
        where: { guildid: guildId },
        select: { lobby_channel: true, room_channel: true },
      }),
    ])

    return res.status(200).json(summarize(next, gc!, sgc))
  },
})
