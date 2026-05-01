// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: GET/PATCH per-task status for the Setup Checklist widget.
//
//          GET returns:
//            - is_premium (bool) — drives whether the widget shows the
//              full "Premium features" section (premium servers) or a
//              single "Premium preview" teaser row (non-premium).
//            - tasks: { essentials: { status, configured }, ranks: ..., ...,
//              + premium tasks for premium servers OR premium_preview for
//              non-premium }
//            - completed_count, skipped_count, total — the overall task
//              count and progress (always counts CORE tasks; premium tasks
//              have their own counter computed by the widget).
//            - all_done (bool) — convenience flag the widget uses to
//              collapse itself once every task is done or skipped.
//
//          PATCH body:
//            { task: "essentials" | ..., status: "done" | "skipped" | "pending" }
//
//          State lives on guild_config.setup_checklist_state (jsonb). The
//          "configured" flag is computed from the bot's actual settings (e.g.
//          essentials.configured = !!admin_role && !!mod_role && !!timezone)
//          so the UI can show "already set up" trust signals without needing
//          to re-fetch /config.
//
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Premium features section.
//          Adds 7 premium task ids (ambient_sounds, anti_afk, sticky_messages,
//          leaderboard_autopost, premium_pomodoro, branding, listing) plus
//          one virtual `premium_preview` task that only appears for non-
//          premium guilds. Each premium task has its own configured-detection
//          query against the relevant feature's table; queries run in
//          parallel via Promise.all to keep the round-trip cheap.
// --- END AI-MODIFIED ---
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireAdmin } from "@/utils/adminAuth"
import { apiHandler, parseBigInt, ValidationError } from "@/utils/apiHandler"
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Use the new shared premium status helper instead of duplicating
// the query inline. See utils/premiumStatus.ts for the rationale.
import { isPremiumGuild } from "@/utils/premiumStatus"
// --- END AI-MODIFIED ---

type TaskStatus = "pending" | "done" | "skipped"

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Split the task ids into "core" (always shown) and "premium"
// (shown for premium servers as individual tasks). The virtual
// `premium_preview` id is only shown to non-premium guilds and represents
// the single browse-drawer teaser row.
const CORE_TASK_IDS = [
  "essentials",
  "ranks",
  "rewards",
  "welcome",
  "notifications",
  "focus",
  "schedule",
  "pet",
] as const

const PREMIUM_TASK_IDS = [
  "ambient_sounds",
  "anti_afk",
  "sticky_messages",
  "leaderboard_autopost",
  "premium_pomodoro",
  "branding",
  "listing",
] as const

const ALL_TASK_IDS = [...CORE_TASK_IDS, ...PREMIUM_TASK_IDS, "premium_preview"] as const

type CoreTaskId = (typeof CORE_TASK_IDS)[number]
type PremiumTaskId = (typeof PREMIUM_TASK_IDS)[number]
type TaskId = (typeof ALL_TASK_IDS)[number]
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Aggregated premium-feature configured signals. Each field
// reflects whether the corresponding feature has at least one
// "meaningful" row in its table (the threshold is per-feature -- e.g.
// ambient_sounds requires both `enabled=true` AND a channel set).
interface PremiumConfigured {
  ambient_sounds: boolean
  anti_afk: boolean
  sticky_messages: boolean
  leaderboard_autopost: boolean
  premium_pomodoro: boolean
  branding: boolean
  listing: boolean
}
// --- END AI-MODIFIED ---

// Whether a given core task has any configured value already in the bot's
// settings. Used purely as a "we found existing settings, you might want
// to skip this" hint.
function isCoreConfigured(
  taskId: CoreTaskId,
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

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Run all premium-feature configured-detection queries in
// parallel. Each query is intentionally narrow (count or single-field
// findUnique) to keep the round-trip cost low even with 7 of them.
//
// Per-feature thresholds:
//   - ambient_sounds: at least one slot with enabled=true AND a channel set
//   - anti_afk: enabled=true on the single config row
//   - sticky_messages: at least one row with enabled=true
//   - leaderboard_autopost: at least one row exists (any frequency)
//   - premium_pomodoro: a config row exists at all (admin opened the
//     editor; default values are sensible so existence == configured)
//   - branding: premium_guilds.custom_skin_id is set
//   - listing: a server_listings row exists with status APPROVED (DRAFT
//     and PENDING are not "configured" -- the public page isn't live yet)
async function getPremiumConfigured(
  guildId: bigint,
  customSkinId: number | null,
): Promise<PremiumConfigured> {
  const [
    ambientCount,
    antiAfk,
    stickyCount,
    autopostCount,
    pomoConfig,
    listing,
  ] = await Promise.all([
    prisma.ambient_sounds_config.count({
      where: { guildid: guildId, enabled: true, NOT: { channelid: null } },
    }),
    prisma.anti_afk_config.findUnique({
      where: { guildid: guildId },
      select: { enabled: true },
    }),
    prisma.sticky_messages.count({
      where: { guildid: guildId, enabled: true },
    }),
    prisma.leaderboard_autopost_config.count({
      where: { guildid: guildId },
    }),
    prisma.premium_pomodoro_config.findUnique({
      where: { guildid: guildId },
      select: { guildid: true },
    }),
    prisma.server_listings.findUnique({
      where: { guildid: guildId },
      select: { status: true },
    }),
  ])

  return {
    ambient_sounds: ambientCount > 0,
    anti_afk: !!antiAfk?.enabled,
    sticky_messages: stickyCount > 0,
    leaderboard_autopost: autopostCount > 0,
    premium_pomodoro: pomoConfig !== null,
    branding: customSkinId != null,
    listing: listing?.status === "APPROVED",
  }
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Build the task summary including premium tasks (when applicable).
// For non-premium guilds we emit the single `premium_preview` virtual task;
// for premium guilds we emit each of the 7 individual premium tasks. Core
// tasks always appear regardless.
//
// `completed_count` / `skipped_count` / `total` count the FULL visible task
// set so the widget's main progress percentage matches what the user sees.
// (Phase 2 plan called for separating the counters; on reflection it's
// simpler to count what's rendered, and the widget can derive a per-section
// breakdown from `tasks` itself if it wants to display "X of 7 premium" too.)
function summarize(
  state: Record<string, TaskStatus>,
  gc: any,
  sgc: { lobby_channel: bigint | null; room_channel: bigint | null } | null,
  isPremium: boolean,
  premiumConfigured: PremiumConfigured | null,
) {
  const tasks: Record<string, { status: TaskStatus; configured: boolean }> = {}
  let done = 0
  let skipped = 0

  for (const id of CORE_TASK_IDS) {
    const status = (state[id] as TaskStatus) || "pending"
    tasks[id] = { status, configured: isCoreConfigured(id, gc, sgc) }
    if (status === "done") done++
    else if (status === "skipped") skipped++
  }

  if (isPremium && premiumConfigured) {
    for (const id of PREMIUM_TASK_IDS) {
      const status = (state[id] as TaskStatus) || "pending"
      tasks[id] = { status, configured: premiumConfigured[id] }
      if (status === "done") done++
      else if (status === "skipped") skipped++
    }
  } else {
    // Single teaser row for non-premium servers. `configured` is always
    // false here -- there's nothing to detect because the features aren't
    // enabled at the subscription level.
    const status = (state.premium_preview as TaskStatus) || "pending"
    tasks.premium_preview = { status, configured: false }
    if (status === "done") done++
    else if (status === "skipped") skipped++
  }

  const total = Object.keys(tasks).length
  return {
    is_premium: isPremium,
    tasks,
    completed_count: done,
    skipped_count: skipped,
    total,
    all_done: done + skipped === total,
  }
}
// --- END AI-MODIFIED ---

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Fan out three parallel queries -- guild_config + schedule
    // config + premium status. Premium status drives whether we ALSO need
    // the premium-feature configured signals (skipped for non-premium to
    // save 6 round-trips per request).
    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Auto-create the guild_config row when missing. The bot
    // creates this row lazily on first member activity, but admins can be
    // linked here directly from the bot's "Setup Checklist" welcome DM
    // before any command has run -- in which case the old `findUnique`
    // returned null and we 404'd, surfacing as "Couldn't load your setup
    // checklist" on the widget. Same auto-create pattern as
    // `pages/api/dashboard/servers/[id]/config.ts` line 119+. The empty
    // `update` keeps existing rows untouched; the `create` only fires
    // once per guild and is gated by `requireAdmin` above so random users
    // can't spam-create rows for guilds they don't admin.
    const [gc, sgc, isPremium] = await Promise.all([
      prisma.guild_config.upsert({
        where: { guildid: guildId },
        update: {},
        create: { guildid: guildId },
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
      isPremiumGuild(guildId),
    ])
    // --- END AI-MODIFIED (2026-05-01) ---

    // Premium-feature configured detection runs only when the guild is
    // actually premium. For non-premium guilds the teaser row's
    // configured flag is always false anyway, so saving the round-trips.
    let premiumConfigured: PremiumConfigured | null = null
    if (isPremium) {
      // Need the guild's custom_skin_id to compute branding configured.
      // One extra query but it's a single-column lookup on a tiny table.
      const pg = await prisma.premium_guilds.findUnique({
        where: { guildid: guildId },
        select: { custom_skin_id: true },
      })
      premiumConfigured = await getPremiumConfigured(guildId, pg?.custom_skin_id ?? null)
    }

    const rawState = (gc.setup_checklist_state as Record<string, TaskStatus> | null) ?? {}
    return res.status(200).json(summarize(rawState, gc, sgc, isPremium, premiumConfigured))
    // --- END AI-MODIFIED ---
  },

  async PATCH(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireAdmin(req, res, guildId)
    if (!auth) return

    const { task, status } = req.body ?? {}
    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Validate against the FULL task id set including premium
    // tasks and the premium_preview virtual task. We still write all of
    // them into the same `setup_checklist_state` JSONB blob -- there's no
    // need to gate writes on premium status because if a non-premium guild
    // somehow PATCHes a premium task id (e.g. they downgraded mid-session)
    // it just gets stored and never displayed.
    if (!ALL_TASK_IDS.includes(task)) {
      throw new ValidationError(`Unknown task id "${task}"`)
    }
    // --- END AI-MODIFIED ---
    if (status !== "done" && status !== "skipped" && status !== "pending") {
      throw new ValidationError(`Invalid status "${status}"`)
    }

    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Tolerate a missing guild_config row (fresh guild that the
    // bot hasn't lazy-created yet -- see the GET handler comment for full
    // context) by treating "no row" as "no recorded state". The actual
    // write happens via upsert below so the row gets created in the same
    // transaction the user marks their first task done in.
    const existing = await prisma.guild_config.findUnique({
      where: { guildid: guildId },
      select: { setup_checklist_state: true },
    })
    // --- END AI-MODIFIED (2026-05-01) ---

    const next: Record<string, TaskStatus> = {
      ...((existing?.setup_checklist_state as Record<string, TaskStatus> | null) ?? {}),
    }
    // Pending = the absence of a recorded status. Keeps the JSON small as servers
    // un-skip tasks rather than accumulating stale "pending" entries.
    if (status === "pending") {
      delete next[task]
    } else {
      next[task] = status
    }

    // --- AI-MODIFIED (2026-05-01) ---
    // Purpose: Use upsert so a fresh-guild PATCH (no existing row) still
    // succeeds. The create branch only fires the very first time anyone
    // touches the checklist for this guild.
    await prisma.guild_config.upsert({
      where: { guildid: guildId },
      update: { setup_checklist_state: next },
      create: { guildid: guildId, setup_checklist_state: next },
    })
    // --- END AI-MODIFIED (2026-05-01) ---

    // --- AI-MODIFIED (2026-04-30) ---
    // Purpose: Re-fetch the slim summary so the client doesn't need a
    // second round-trip. Same fan-out as GET.
    const [gc, sgc, isPremium] = await Promise.all([
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
      isPremiumGuild(guildId),
    ])

    let premiumConfigured: PremiumConfigured | null = null
    if (isPremium) {
      const pg = await prisma.premium_guilds.findUnique({
        where: { guildid: guildId },
        select: { custom_skin_id: true },
      })
      premiumConfigured = await getPremiumConfigured(guildId, pg?.custom_skin_id ?? null)
    }

    return res.status(200).json(summarize(next, gc!, sgc, isPremium, premiumConfigured))
    // --- END AI-MODIFIED ---
  },
})
