// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-25
// Purpose: Comprehensive server debug info endpoint for admin diagnostics
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler, parseBigInt } from "@/utils/apiHandler"

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const SHARD_COUNT = 32

function s(v: bigint | null | undefined): string | null {
  return v != null ? v.toString() : null
}

interface RawChannelRow { channelid: bigint }
interface RawRoleRow { roleid: bigint }

export default apiHandler({
  async GET(req, res) {
    const guildId = parseBigInt(req.query.id, "guild ID")
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const gid = guildId

    const shardNumber = Number((gid >> BigInt(22)) % BigInt(SHARD_COUNT))

    const [
      guildConfig,
      premiumGuild,
      premiumSubs,
      lionheartPremium,
      premiumPomodoroConfig,
      scheduleConfig,
      scheduleChannels,
      trackedChannels,
      untrackedTextChannels,
      timers,
      stickyMessages,
      ambientSoundsConfigs,
      ambientSoundsGuildConfig,
      soundsBotHeartbeats,
      roleMenus,
      autopostConfigs,
      autopostHistoryRecent,
      autopostQueuePending,
      voiceRanks,
      msgRanks,
      xpRanks,
      videoExemptRoles,
      lbFilterRoles,
      shopItemCounts,
      blacklistEntry,
      shardData,
      memberCount,
      timerCount,
      ongoingSessions,
      rentedRoomCount,
      openTicketCount,
      stickyCount,
      roleMenuCount,
      trackedChannelCount,
      recentTickets,
      recentAdminTransactions,
      recentRoomAdminLog,
      recentManualSessionLog,
      webhookRows,
      videoChannelsRaw,
      tasklistChannelsRaw,
      workoutChannelsRaw,
      untrackedVoiceRaw,
      autorolesRaw,
      botAutorolesRaw,
      donatorRolesRaw,
      unrankedRolesRaw,
      botPermissions,
    ] = await Promise.all([
      prisma.guild_config.findUnique({ where: { guildid: gid } }),

      prisma.premium_guilds.findUnique({ where: { guildid: gid } }),

      prisma.server_premium_subscriptions.findMany({
        where: { guildid: gid },
        orderBy: { created_at: "desc" },
        take: 5,
      }),

      prisma.lionheart_server_premium.findMany({
        where: { guildid: gid },
      }),

      prisma.premium_pomodoro_config.findUnique({ where: { guildid: gid } }),

      prisma.schedule_guild_config.findUnique({ where: { guildid: gid } }),

      prisma.schedule_channels.findMany({ where: { guildid: gid } }),

      prisma.tracked_channels.findMany({ where: { guildid: gid } }),

      prisma.untracked_text_channels.findMany({ where: { guildid: gid } }),

      prisma.timers.findMany({ where: { guildid: gid } }),

      prisma.sticky_messages.findMany({ where: { guildid: gid } }),

      prisma.ambient_sounds_config.findMany({ where: { guildid: gid } }),

      prisma.ambient_sounds_guild_config.findUnique({ where: { guildid: gid } }),

      prisma.sounds_bot_heartbeat.findMany(),

      prisma.role_menus.findMany({
        where: { guildid: gid },
        include: { role_menu_roles: { select: { menuroleid: true } } },
      }),

      prisma.leaderboard_autopost_config.findMany({ where: { guildid: gid } }),

      prisma.leaderboard_autopost_history.findMany({
        where: { guildid: gid },
        orderBy: { posted_at: "desc" },
        take: 10,
      }),

      prisma.leaderboard_autopost_action_queue.findMany({
        where: { guildid: gid, status: { in: ["pending", "failed"] } },
        orderBy: { created_at: "desc" },
        take: 10,
      }),

      prisma.voice_ranks.findMany({
        where: { guildid: gid },
        orderBy: { required: "asc" },
      }),

      prisma.msg_ranks.findMany({
        where: { guildid: gid },
        orderBy: { required: "asc" },
      }),

      prisma.xp_ranks.findMany({
        where: { guildid: gid },
        orderBy: { required: "asc" },
      }),

      prisma.video_exempt_roles.findMany({ where: { guildid: gid } }),

      prisma.leaderboard_filter_roles.findMany({ where: { guildid: gid } }),

      prisma.shop_items.groupBy({
        by: ["item_type"],
        where: { guildid: gid, deleted: false },
        _count: true,
      }),

      prisma.global_guild_blacklist.findUnique({ where: { guildid: gid } }),

      prisma.shard_data.findFirst({
        where: { shard_id: shardNumber },
        orderBy: { last_login: "desc" },
      }),

      prisma.members.count({ where: { guildid: gid } }),
      prisma.timers.count({ where: { guildid: gid } }),

      prisma.voice_sessions_ongoing.findMany({
        where: { guildid: gid },
        orderBy: { start_time: "asc" },
        take: 50,
      }),

      prisma.rented_rooms.count({ where: { guildid: gid, deleted_at: null } }),
      prisma.tickets.count({ where: { guildid: gid, ticket_state: "OPEN" } }),
      prisma.sticky_messages.count({ where: { guildid: gid, enabled: true } }),
      prisma.role_menus.count({ where: { guildid: gid } }),
      prisma.tracked_channels.count({ where: { guildid: gid, deleted: false } }),

      prisma.tickets.findMany({
        where: { guildid: gid },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          ticketid: true, ticket_type: true, ticket_state: true,
          targetid: true, moderator_id: true, created_at: true, auto: true,
        },
      }),

      prisma.coin_transactions.findMany({
        where: { guildid: gid, transactiontype: "ADMIN" },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          transactionid: true, transactiontype: true, actorid: true,
          amount: true, from_account: true, to_account: true, created_at: true,
        },
      }),

      prisma.room_admin_log.findMany({
        where: { guildid: gid },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          logid: true, action: true, adminid: true,
          channelid: true, created_at: true, details: true,
        },
      }),

      prisma.manual_session_log.findMany({
        where: { guildid: gid },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          id: true, action: true, userid: true, reason: true, created_at: true,
          old_duration: true, new_duration: true,
        },
      }),

      prisma.channel_webhooks.findMany({
        where: {
          channelid: { in: [] as bigint[] },
        },
      }).then(() => null as any),

      prisma.$queryRaw<RawChannelRow[]>`SELECT channelid FROM video_channels WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawChannelRow[]>`SELECT channelid FROM tasklist_channels WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawChannelRow[]>`SELECT channelid FROM workout_channels WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawChannelRow[]>`SELECT channelid FROM untracked_channels WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawRoleRow[]>`SELECT roleid FROM autoroles WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawRoleRow[]>`SELECT roleid FROM bot_autoroles WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawRoleRow[]>`SELECT roleid FROM donator_roles WHERE guildid = ${gid}`,
      prisma.$queryRaw<RawRoleRow[]>`SELECT roleid FROM unranked_roles WHERE guildid = ${gid}`,

      fetchBotPermissions(gid),
    ])

    const webhookChannelIds: bigint[] = []
    if (guildConfig?.event_log_channel) webhookChannelIds.push(guildConfig.event_log_channel)
    if (guildConfig?.pomodoro_channel) webhookChannelIds.push(guildConfig.pomodoro_channel)
    if (scheduleConfig?.lobby_channel) webhookChannelIds.push(scheduleConfig.lobby_channel)
    for (const t of timers) {
      if (t.notification_channelid) webhookChannelIds.push(t.notification_channelid)
    }

    let webhookStatus: { channelid: string; webhookid: string }[] = []
    if (webhookChannelIds.length > 0) {
      const rows = await prisma.channel_webhooks.findMany({
        where: { channelid: { in: webhookChannelIds } },
        select: { channelid: true, webhookid: true },
      })
      webhookStatus = rows.map(r => ({
        channelid: r.channelid.toString(),
        webhookid: r.webhookid.toString(),
      }))
    }

    const gc = guildConfig
    const result = {
      server: {
        guildid: gid.toString(),
        name: gc?.name || null,
        first_joined_at: gc?.first_joined_at?.toISOString() || null,
        left_at: gc?.left_at?.toISOString() || null,
        locale: gc?.locale || null,
        force_locale: gc?.force_locale ?? false,
        timezone: gc?.timezone || null,
        season_start: gc?.season_start?.toISOString() || null,
      },

      shard: {
        shard_number: shardNumber,
        shard_count: SHARD_COUNT,
        shardname: shardData?.shardname || null,
        last_login: shardData?.last_login?.toISOString() || null,
        guild_count: shardData?.guild_count || null,
      },

      blacklist: blacklistEntry ? {
        blacklisted: true,
        ownerid: blacklistEntry.ownerid.toString(),
        reason: blacklistEntry.reason,
        created_at: blacklistEntry.created_at?.toISOString() || null,
      } : { blacklisted: false },

      premium: {
        premium_since: premiumGuild?.premium_since?.toISOString() || null,
        premium_until: premiumGuild?.premium_until?.toISOString() || null,
        is_active: premiumGuild ? new Date(premiumGuild.premium_until) > new Date() : false,
        custom_skin_id: premiumGuild?.custom_skin_id || null,
        subscriptions: premiumSubs.map(sub => ({
          id: sub.id,
          userid: sub.userid.toString(),
          plan: sub.plan,
          status: sub.status,
          current_period_start: sub.current_period_start?.toISOString() || null,
          current_period_end: sub.current_period_end?.toISOString() || null,
        })),
        lionheart: lionheartPremium.map(lh => ({
          userid: lh.userid.toString(),
          last_transferred_at: lh.last_transferred_at?.toISOString() || null,
        })),
      },

      bot_permissions: botPermissions,

      stats: {
        members: memberCount,
        timers: timerCount,
        ongoing_sessions: ongoingSessions.length,
        active_rooms: rentedRoomCount,
        open_tickets: openTicketCount,
        active_stickies: stickyCount,
        role_menus: roleMenuCount,
        tracked_channels: trackedChannelCount,
        shop_items: shopItemCounts.map(g => ({
          type: g.item_type,
          count: g._count,
        })),
      },

      channels: {
        event_log_channel: s(gc?.event_log_channel),
        mod_log_channel: s(gc?.mod_log_channel),
        alert_channel: s(gc?.alert_channel),
        greeting_channel: s(gc?.greeting_channel),
        pomodoro_channel: s(gc?.pomodoro_channel),
        rank_channel: s(gc?.rank_channel),
        renting_category: s(gc?.renting_category),
        lg_drop_channel: s(gc?.lg_drop_channel),
        accountability_category: s(gc?.accountability_category),
        accountability_lobby: s(gc?.accountability_lobby),
        tracked: trackedChannels.map(c => ({
          channelid: c.channelid.toString(), deleted: c.deleted,
        })),
        untracked_text: untrackedTextChannels.map(c => c.channelid.toString()),
        untracked_voice: untrackedVoiceRaw.map(c => c.channelid.toString()),
        video: videoChannelsRaw.map(c => c.channelid.toString()),
        tasklist: tasklistChannelsRaw.map(c => c.channelid.toString()),
        workout: workoutChannelsRaw.map(c => c.channelid.toString()),
        schedule_lobby: s(scheduleConfig?.lobby_channel ?? null),
        schedule_room: s(scheduleConfig?.room_channel ?? null),
        schedule_extra: scheduleChannels.map(c => c.channelid.toString()),
      },

      roles: {
        admin_role: s(gc?.admin_role),
        mod_role: s(gc?.mod_role),
        studyban_role: s(gc?.studyban_role),
        renting_role: s(gc?.renting_role),
        lg_activity_role: s(gc?.lg_activity_role),
        focus_role: s(premiumPomodoroConfig?.focus_roleid ?? null),
        schedule_blacklist_role: s(scheduleConfig?.blacklist_role ?? null),
        video_exempt: videoExemptRoles.map(r => r.roleid.toString()),
        leaderboard_filter: lbFilterRoles.map(r => r.roleid.toString()),
        autoroles: autorolesRaw.map(r => r.roleid.toString()),
        bot_autoroles: botAutorolesRaw.map(r => r.roleid.toString()),
        donator_roles: donatorRolesRaw.map(r => r.roleid.toString()),
        unranked_roles: unrankedRolesRaw.map(r => r.roleid.toString()),
      },

      feature_toggles: {
        voice_ranks_enabled: gc?.voice_ranks_enabled ?? false,
        msg_ranks_enabled: gc?.msg_ranks_enabled ?? false,
        xp_ranks_enabled: gc?.xp_ranks_enabled ?? false,
        rank_type: gc?.rank_type || null,
        dm_ranks: gc?.dm_ranks ?? true,
        lg_enabled: gc?.lg_enabled ?? true,
        lg_teaser_enabled: gc?.lg_teaser_enabled ?? true,
        manual_sessions_enabled: gc?.manual_sessions_enabled ?? false,
        session_leave_summary: gc?.session_leave_summary ?? false,
        allow_transfers: gc?.allow_transfers ?? false,
        persist_roles: gc?.persist_roles ?? false,
        renting_visible: gc?.renting_visible ?? false,
        renting_sync_perms: gc?.renting_sync_perms ?? false,
        renting_auto_extend: gc?.renting_auto_extend ?? false,
        video_studyban: gc?.video_studyban ?? false,
        force_locale: gc?.force_locale ?? false,
        leaderboard_role_filter_enabled: gc?.leaderboard_role_filter_enabled ?? false,
        premium_session_summary: premiumPomodoroConfig?.session_summary ?? false,
        premium_animated_timer: premiumPomodoroConfig?.animated_timer ?? false,
      },

      economy: {
        study_hourly_reward: gc?.study_hourly_reward,
        study_hourly_live_bonus: gc?.study_hourly_live_bonus,
        starting_funds: gc?.starting_funds,
        daily_study_cap: gc?.daily_study_cap,
        xp_per_period: gc?.xp_per_period,
        xp_per_centiword: gc?.xp_per_centiword,
        coins_per_centixp: gc?.coins_per_centixp,
        task_reward: gc?.task_reward,
        task_reward_limit: gc?.task_reward_limit,
        max_tasks: gc?.max_tasks,
        renting_price: gc?.renting_price,
        renting_cap: gc?.renting_cap,
        renting_max_per_user: gc?.renting_max_per_user,
        renting_min_deposit: gc?.renting_min_deposit,
        renting_cooldown: gc?.renting_cooldown,
        renting_name_limit: gc?.renting_name_limit,
        workout_reward: gc?.workout_reward,
        min_workout_length: gc?.min_workout_length,
        accountability_bonus: gc?.accountability_bonus,
        accountability_reward: gc?.accountability_reward,
        accountability_price: gc?.accountability_price,
        video_grace_period: gc?.video_grace_period,
        manual_sessions_limit: gc?.manual_sessions_limit,
      },

      ranks: {
        voice: voiceRanks.map(r => ({
          rankid: r.rankid, roleid: r.roleid.toString(),
          required: r.required, reward: r.reward,
          message: r.message?.substring(0, 100) || null,
        })),
        msg: msgRanks.map(r => ({
          rankid: r.rankid, roleid: r.roleid.toString(),
          required: r.required, reward: r.reward,
          message: r.message?.substring(0, 100) || null,
        })),
        xp: xpRanks.map(r => ({
          rankid: r.rankid, roleid: r.roleid.toString(),
          required: r.required, reward: r.reward,
          message: r.message?.substring(0, 100) || null,
        })),
      },

      pomodoro: {
        default_channel: s(gc?.pomodoro_channel),
        session_leave_summary: gc?.session_leave_summary ?? false,
        timers: timers.map(t => ({
          channelid: t.channelid.toString(),
          notification_channelid: s(t.notification_channelid),
          ownerid: s(t.ownerid),
          focus_length: t.focus_length,
          break_length: t.break_length,
          inactivity_threshold: t.inactivity_threshold,
          voice_alerts: t.voice_alerts,
          auto_restart: t.auto_restart,
          channel_name: t.channel_name,
          pretty_name: t.pretty_name,
          manager_roleid: s(t.manager_roleid),
        })),
        premium_config: premiumPomodoroConfig ? {
          focus_roleid: s(premiumPomodoroConfig.focus_roleid),
          session_summary: premiumPomodoroConfig.session_summary,
          animated_timer: premiumPomodoroConfig.animated_timer,
          timer_theme: premiumPomodoroConfig.timer_theme,
          group_goal_hours: premiumPomodoroConfig.group_goal_hours,
          coin_multiplier: premiumPomodoroConfig.coin_multiplier,
          golden_hour_start: premiumPomodoroConfig.golden_hour_start?.toISOString() || null,
          golden_hour_end: premiumPomodoroConfig.golden_hour_end?.toISOString() || null,
        } : null,
      },

      schedule: scheduleConfig ? {
        lobby_channel: s(scheduleConfig.lobby_channel),
        room_channel: s(scheduleConfig.room_channel),
        schedule_cost: scheduleConfig.schedule_cost,
        reward: scheduleConfig.reward,
        bonus_reward: scheduleConfig.bonus_reward,
        min_attendance: scheduleConfig.min_attendance,
        blacklist_role: s(scheduleConfig.blacklist_role),
        blacklist_after: scheduleConfig.blacklist_after,
        extra_channels: scheduleChannels.map(c => c.channelid.toString()),
      } : null,

      shop: shopItemCounts.map(g => ({ type: g.item_type, count: g._count })),

      role_menus: roleMenus.map(m => ({
        menuid: m.menuid,
        name: m.name,
        channelid: s(m.channelid),
        messageid: s(m.messageid),
        enabled: m.enabled,
        menutype: m.menutype,
        event_log: m.event_log,
        role_count: m.role_menu_roles.length,
      })),

      autopost: {
        configs: autopostConfigs.map(c => ({
          configid: c.configid,
          config_name: c.config_name,
          enabled: c.enabled,
          lb_type: c.lb_type,
          frequency: c.frequency,
          post_channel: c.post_channel.toString(),
          mod_log_channel: s(c.mod_log_channel),
          notify_mod_log: c.notify_mod_log,
          last_posted_at: c.last_posted_at?.toISOString() || null,
        })),
        recent_history: autopostHistoryRecent.map(h => ({
          historyid: h.historyid,
          configid: h.configid,
          posted_at: h.posted_at.toISOString(),
          status: h.status,
          error_message: h.error_message,
          roles_added: h.roles_added,
          roles_removed: h.roles_removed,
          coins_awarded: h.coins_awarded,
          dms_sent: h.dms_sent,
          dms_failed: h.dms_failed,
        })),
        pending_queue: autopostQueuePending.map(q => ({
          queueid: q.queueid,
          action_type: q.action_type,
          status: q.status,
          created_at: q.created_at.toISOString(),
        })),
      },

      ambient_sounds: {
        configs: ambientSoundsConfigs.map(c => ({
          bot_number: c.bot_number,
          channelid: s(c.channelid),
          sound_type: c.sound_type,
          volume: c.volume,
          enabled: c.enabled,
          status: c.status,
          error_msg: c.error_msg,
        })),
        guild_config: ambientSoundsGuildConfig ? {
          room_rental_enabled: ambientSoundsGuildConfig.room_rental_enabled,
          room_rental_hourly_rate: ambientSoundsGuildConfig.room_rental_hourly_rate,
        } : null,
        bot_heartbeats: soundsBotHeartbeats.map(h => ({
          bot_number: h.bot_number,
          last_seen: h.last_seen?.toISOString() || null,
          bot_username: h.bot_username,
          guild_count: h.guild_count,
        })),
      },

      sticky_messages: stickyMessages.map(sm => ({
        stickyid: sm.stickyid,
        channelid: sm.channelid.toString(),
        enabled: sm.enabled,
        interval_seconds: sm.interval_seconds,
        title: sm.title,
        last_posted_id: s(sm.last_posted_id),
      })),

      webhook_status: webhookStatus,

      ongoing_sessions: ongoingSessions.map(os => ({
        userid: os.userid.toString(),
        channelid: s(os.channelid),
        start_time: os.start_time?.toISOString() || null,
        live_duration: os.live_duration,
        video_duration: os.video_duration,
        coins_earned: os.coins_earned,
        live_video: os.live_video,
        live_stream: os.live_stream,
      })),

      recent_activity: {
        tickets: recentTickets.map(t => ({
          ticketid: t.ticketid,
          ticket_type: t.ticket_type,
          ticket_state: t.ticket_state,
          targetid: t.targetid.toString(),
          moderator_id: t.moderator_id.toString(),
          created_at: t.created_at?.toISOString() || null,
          auto: t.auto,
        })),
        admin_transactions: recentAdminTransactions.map(t => ({
          transactionid: t.transactionid,
          transactiontype: t.transactiontype,
          actorid: t.actorid.toString(),
          amount: t.amount,
          from_account: s(t.from_account),
          to_account: s(t.to_account),
          created_at: t.created_at?.toISOString() || null,
        })),
        room_admin_log: recentRoomAdminLog.map(l => ({
          logid: l.logid,
          action: l.action,
          adminid: l.adminid.toString(),
          channelid: l.channelid.toString(),
          created_at: l.created_at.toISOString(),
        })),
        manual_session_log: recentManualSessionLog.map(l => ({
          id: l.id,
          action: l.action,
          userid: l.userid.toString(),
          reason: l.reason,
          old_duration: l.old_duration,
          new_duration: l.new_duration,
          created_at: l.created_at.toISOString(),
        })),
      },
    }

    return res.status(200).json(result)
  },
})

async function fetchBotPermissions(guildId: bigint): Promise<{
  permissions: string | null
  roles: string[]
} | null> {
  if (!BOT_TOKEN) return null
  try {
    const resp = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    )
    if (!resp.ok) return null
    const data = await resp.json()
    return {
      permissions: data.permissions || null,
      roles: data.roles || [],
    }
  } catch {
    return null
  }
}
