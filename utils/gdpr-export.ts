// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: GDPR data export utility. Queries all user data
//          across the database and returns a structured JSON
//          object for the user to download.
// ============================================================
import { prisma } from "./prisma"

function bigIntToString(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "bigint") return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Buffer.isBuffer(obj)) return "[binary data omitted]"
  if (Array.isArray(obj)) return obj.map(bigIntToString)
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = bigIntToString(value)
    }
    return result
  }
  return obj
}

function stripInternalFields(obj: Record<string, unknown>, fieldsToStrip: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!fieldsToStrip.includes(key)) {
      result[key] = value
    }
  }
  return result
}

export async function exportUserData(userId: bigint) {
  const [
    profile,
    survey,
    timerPrefs,
    cardPrefs,
    memberships,
    voiceSessions,
    textSessions,
    workoutSessions,
    tasks,
    reminders,
    userWeeklyGoals,
    userMonthlyGoals,
    memberWeeklyGoals,
    memberMonthlyGoals,
    memberWeeklyGoalTasks,
    memberMonthlyGoalTasks,
    memberExperience,
    userExperience,
    memberInventory,
    skinInventory,
    memberRanks,
    seasonStats,
    pomodoroStreaks,
    pomodoroMilestones,
    scheduleBookings,
    rentedRooms,
    roleMenuHistory,
    votes,
    profileTags,
    ticketsReceived,
    coinTransactions,
    gemTransactions,
    sharedBoardMemberships,
    sharedTasksCreated,
    userSubscriptions,
    serverSubscriptions,
    premiumContributions,
    soundRentals,
    lionheartPremium,
    roomLayout,
  ] = await Promise.all([
    prisma.user_config.findUnique({
      where: { userid: userId },
      select: {
        userid: true, name: true, email: true, email_verified: true,
        timezone: true, locale: true, locale_hint: true, gems: true, gold: true,
        first_seen: true, last_seen: true, show_global_stats: true,
        schedule_dm_muted: true, topgg_vote_reminder: true,
      },
    }),
    prisma.user_survey.findUnique({ where: { userid: userId } }),
    prisma.user_timer_preferences.findUnique({ where: { userid: userId } }),
    prisma.user_card_preferences.findUnique({ where: { userid: userId } }),
    prisma.members.findMany({
      where: { userid: userId },
      select: {
        guildid: true, tracked_time: true, coins: true, workout_count: true,
        display_name: true, first_joined: true, last_left: true,
      },
    }),
    prisma.voice_sessions.findMany({
      where: { userid: userId },
      select: {
        guildid: true, channelid: true, start_time: true, duration: true,
        live_duration: true, stream_duration: true, video_duration: true,
        rating: true, tag: true, is_manual: true,
      },
    }),
    prisma.text_sessions.findMany({
      where: { userid: userId },
      select: {
        guildid: true, start_time: true, end_time: true, duration: true,
        messages: true, words: true, periods: true,
      },
    }),
    prisma.workout_sessions.findMany({
      where: { userid: userId },
      select: { guildid: true, channelid: true, start_time: true, duration: true },
    }),
    prisma.tasklist.findMany({
      where: { userid: userId },
      select: {
        content: true, completed_at: true, deleted_at: true,
        created_at: true, last_updated_at: true, parentid: true,
      },
    }),
    prisma.reminders.findMany({
      where: { userid: userId },
      select: {
        remind_at: true, content: true, title: true, footer: true,
        interval: true, created_at: true,
      },
    }),
    prisma.user_weekly_goals.findMany({ where: { userid: userId } }),
    prisma.user_monthly_goals.findMany({ where: { userid: userId } }),
    prisma.member_weekly_goals.findMany({
      where: { userid: userId },
      select: {
        guildid: true, weekid: true, study_goal: true, task_goal: true,
        review_goal: true, message_goal: true,
      },
    }),
    prisma.member_monthly_goals.findMany({
      where: { userid: userId },
      select: {
        guildid: true, monthid: true, study_goal: true, task_goal: true,
        review_goal: true, message_goal: true,
      },
    }),
    prisma.member_weekly_goal_tasks.findMany({
      where: { userid: userId },
      select: { guildid: true, weekid: true, content: true, completed: true },
    }),
    prisma.member_monthly_goal_tasks.findMany({
      where: { userid: userId },
      select: { guildid: true, monthid: true, content: true, completed: true },
    }),
    prisma.member_experience.findMany({
      where: { userid: userId },
      select: { guildid: true, earned_at: true, amount: true, exp_type: true },
    }),
    prisma.user_experience.findMany({
      where: { userid: userId },
      select: { earned_at: true, amount: true, exp_type: true },
    }),
    prisma.member_inventory.findMany({
      where: { userid: userId },
      select: { guildid: true, itemid: true },
    }),
    prisma.user_skin_inventory.findMany({
      where: { userid: userId },
      select: { custom_skin_id: true, active: true, acquired_at: true, expires_at: true },
    }),
    prisma.member_ranks.findMany({
      where: { userid: userId },
      select: {
        guildid: true, current_xp_rankid: true,
        current_voice_rankid: true, current_msg_rankid: true,
      },
    }),
    prisma.season_stats.findMany({
      where: { userid: userId },
      select: {
        guildid: true, voice_stats: true, xp_stats: true,
        message_stats: true, season_start: true, updated_at: true,
      },
    }),
    prisma.pomodoro_streaks.findUnique({ where: { userid: userId } }),
    prisma.pomodoro_milestones.findMany({
      where: { userid: userId },
      select: {
        guildid: true, milestone_type: true,
        milestone_value: true, achieved_at: true,
      },
    }),
    prisma.schedule_session_members.findMany({
      where: { userid: userId },
      select: { guildid: true, slotid: true, booked_at: true, attended: true, clock: true },
    }),
    prisma.rented_rooms.findMany({
      where: { ownerid: userId },
      select: {
        channelid: true, guildid: true, created_at: true,
        name: true, coin_balance: true,
      },
    }),
    prisma.role_menu_history.findMany({
      where: { userid: userId },
      select: {
        menuid: true, roleid: true, obtained_at: true,
        expires_at: true, removed_at: true,
      },
    }),
    prisma.topgg.findMany({
      where: { userid: userId },
      select: { boostedtimestamp: true },
    }),
    prisma.member_profile_tags.findMany({
      where: { userid: userId },
      select: { guildid: true, tag: true, timestamp: true },
    }),
    prisma.tickets.findMany({
      where: { targetid: userId },
      select: {
        guildid: true, ticket_type: true, ticket_state: true,
        created_at: true, content: true, context: true,
        duration: true, expiry: true,
        pardoned_at: true, pardoned_reason: true,
      },
    }),
    prisma.coin_transactions.findMany({
      where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] },
      select: {
        transactiontype: true, guildid: true, amount: true,
        bonus: true, from_account: true, to_account: true, created_at: true,
      },
    }),
    prisma.gem_transactions.findMany({
      where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] },
      select: {
        transaction_type: true, amount: true, description: true,
        note: true, reference: true, timestamp: true,
      },
    }),
    prisma.shared_tasklist_member.findMany({
      where: { userid: userId },
      select: { listid: true, role: true, joined_at: true },
    }),
    prisma.shared_task.findMany({
      where: { OR: [{ assignee_id: userId }, { created_by: userId }] },
      select: {
        listid: true, content: true, description: true,
        completed_at: true, created_at: true,
      },
    }),
    prisma.user_subscriptions.findUnique({
      where: { userid: userId },
      select: {
        tier: true, status: true,
        current_period_start: true, current_period_end: true,
        created_at: true,
      },
    }),
    prisma.server_premium_subscriptions.findMany({
      where: { userid: userId },
      select: {
        guildid: true, plan: true, status: true,
        current_period_start: true, current_period_end: true,
        created_at: true,
      },
    }),
    prisma.premium_guild_contributions.findMany({
      where: { userid: userId },
      select: { guildid: true, duration: true, timestamp: true },
    }),
    prisma.ambient_sounds_rentals.findMany({
      where: { userid: userId },
      select: {
        guildid: true, channelid: true, sound_type: true,
        volume: true, started_at: true, expires_at: true, ended_at: true, total_cost: true,
      },
    }),
    prisma.lionheart_server_premium.findUnique({
      where: { userid: userId },
      select: { guildid: true, created_at: true, updated_at: true },
    }),
    prisma.lg_room_layout.findUnique({
      where: { userid: userId },
      select: { layout: true, updated_at: true },
    }),
  ])

  const [
    pet,
    petInventory,
    petEquipment,
    petRooms,
    petFurniture,
    petGameboySkins,
    petFarm,
    petGoldTransactions,
    petMarketplaceListings,
    petMarketplaceSales,
    petFriends,
    petFriendRequests,
    petBlocks,
    petFamilyMembership,
    petEnhancementLog,
    petEnhancementAchievements,
  ] = await Promise.all([
    prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: {
        pet_name: true, expression: true, level: true, xp: true,
        food: true, bath: true, sleep: true, life: true,
        last_decay_at: true, active_room_id: true, created_at: true,
        fullscreen_mode: true, drop_notif: true,
      },
    }),
    prisma.lg_user_inventory.findMany({
      where: { userid: userId },
      select: {
        itemid: true, acquired_at: true, source: true,
        quantity: true, enhancement_level: true,
      },
    }),
    prisma.lg_pet_equipment.findMany({
      where: { userid: userId },
      select: { slot: true, itemid: true },
    }),
    prisma.lg_user_rooms.findMany({
      where: { userid: userId },
      select: { room_id: true, unlocked_at: true },
    }),
    prisma.lg_user_furniture.findMany({
      where: { userid: userId },
      select: { slot: true, asset_path: true },
    }),
    prisma.lg_user_gameboy_skins.findMany({
      where: { userid: userId },
      select: { skin_id: true, acquired_at: true },
    }),
    prisma.lg_user_farm.findMany({
      where: { userid: userId },
      select: {
        plot_id: true, seed_id: true, planted_at: true, last_watered: true,
        growth_stage: true, dead: true, growth_points: true, rarity: true,
      },
    }),
    prisma.lg_gold_transactions.findMany({
      where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] },
      select: {
        transaction_type: true, amount: true, description: true,
        reference: true, created_at: true,
      },
    }),
    prisma.lg_marketplace_listings.findMany({
      where: { seller_userid: userId },
      select: {
        itemid: true, enhancement_level: true, quantity_listed: true,
        quantity_remaining: true, price_per_unit: true, currency: true,
        status: true, created_at: true, expires_at: true,
      },
    }),
    prisma.lg_marketplace_sales.findMany({
      where: { OR: [{ buyer_userid: userId }, { seller_userid: userId }] },
      select: {
        itemid: true, enhancement_level: true, quantity: true,
        price_per_unit: true, total_price: true, currency: true, sold_at: true,
      },
    }),
    prisma.lg_friends.findMany({
      where: { OR: [{ userid1: userId }, { userid2: userId }] },
      select: { userid1: true, userid2: true, created_at: true },
    }),
    prisma.lg_friend_requests.findMany({
      where: { OR: [{ from_userid: userId }, { to_userid: userId }] },
      select: { from_userid: true, to_userid: true, status: true, created_at: true },
    }),
    prisma.lg_blocks.findMany({
      where: { OR: [{ blocker_userid: userId }, { blocked_userid: userId }] },
      select: { blocker_userid: true, blocked_userid: true, created_at: true },
    }),
    prisma.lg_family_members.findMany({
      where: { userid: userId },
      select: { family_id: true, role: true, joined_at: true, contribution_xp: true },
    }),
    prisma.lg_enhancement_log.findMany({
      where: { userid: userId },
      select: {
        item_name: true, scroll_name: true, outcome: true,
        from_level: true, to_level: true, created_at: true,
      },
    }),
    prisma.lg_enhancement_achievements.findMany({
      where: { userid: userId },
      select: { achievement_key: true, unlocked_at: true },
    }),
  ])

  const exportData = {
    export_info: {
      exported_at: new Date().toISOString(),
      discord_id: userId.toString(),
      format_version: 1,
    },
    profile: profile ? stripInternalFields(profile as Record<string, unknown>, ["avatar_hash", "api_timestamp"]) : null,
    survey: survey ? stripInternalFields(survey as Record<string, unknown>, ["userid"]) : null,
    preferences: {
      timer: timerPrefs ? stripInternalFields(timerPrefs as Record<string, unknown>, ["userid"]) : null,
      card: cardPrefs ? stripInternalFields(cardPrefs as Record<string, unknown>, ["userid"]) : null,
      room_layout: roomLayout ? stripInternalFields(roomLayout as Record<string, unknown>, ["userid"]) : null,
    },
    server_memberships: memberships,
    study_sessions: {
      voice: voiceSessions,
      text: textSessions,
      workouts: workoutSessions,
    },
    tasks,
    reminders,
    goals: {
      user_weekly: userWeeklyGoals.map(g => stripInternalFields(g as Record<string, unknown>, ["userid"])),
      user_monthly: userMonthlyGoals.map(g => stripInternalFields(g as Record<string, unknown>, ["userid"])),
      member_weekly: memberWeeklyGoals,
      member_monthly: memberMonthlyGoals,
      member_weekly_tasks: memberWeeklyGoalTasks,
      member_monthly_tasks: memberMonthlyGoalTasks,
    },
    experience: {
      member: memberExperience,
      user: userExperience,
    },
    economy: {
      gems: profile?.gems ?? 0,
      gold: profile?.gold?.toString() ?? "0",
      coin_transactions: coinTransactions,
      gem_transactions: gemTransactions,
      member_inventory: memberInventory,
      skin_inventory: skinInventory,
    },
    ranks: memberRanks,
    season_stats: seasonStats,
    pomodoro: {
      streaks: pomodoroStreaks ? stripInternalFields(pomodoroStreaks as Record<string, unknown>, ["userid"]) : null,
      milestones: pomodoroMilestones,
    },
    schedule_bookings: scheduleBookings,
    rented_rooms: rentedRooms,
    role_menu_history: roleMenuHistory,
    votes: votes.map(v => v.boostedtimestamp),
    profile_tags: profileTags,
    moderation: {
      tickets_received: ticketsReceived,
    },
    shared_boards: {
      memberships: sharedBoardMemberships,
      tasks_created_or_assigned: sharedTasksCreated,
    },
    subscriptions: {
      personal: userSubscriptions,
      server: serverSubscriptions,
      premium_contributions: premiumContributions,
      lionheart: lionheartPremium,
    },
    ambient_sounds_rentals: soundRentals,
    pet: {
      profile: pet,
      inventory: petInventory,
      equipment: petEquipment,
      rooms: petRooms,
      furniture: petFurniture,
      gameboy_skins: petGameboySkins,
      farm: petFarm,
      gold_transactions: petGoldTransactions,
      marketplace_listings: petMarketplaceListings,
      marketplace_sales: petMarketplaceSales,
      friends: petFriends,
      friend_requests: petFriendRequests,
      blocks: petBlocks,
      family_membership: petFamilyMembership,
      enhancement_log: petEnhancementLog,
      enhancement_achievements: petEnhancementAchievements,
    },
  }

  return bigIntToString(exportData)
}

export async function getUserDataCounts(userId: bigint) {
  const [
    voiceCount, textCount, workoutCount, taskCount, reminderCount,
    memberCount, coinTxCount, gemTxCount, ticketCount,
    petExists, petInventoryCount, farmPlotCount,
  ] = await Promise.all([
    prisma.voice_sessions.count({ where: { userid: userId } }),
    prisma.text_sessions.count({ where: { userid: userId } }),
    prisma.workout_sessions.count({ where: { userid: userId } }),
    prisma.tasklist.count({ where: { userid: userId } }),
    prisma.reminders.count({ where: { userid: userId } }),
    prisma.members.count({ where: { userid: userId } }),
    prisma.coin_transactions.count({ where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] } }),
    prisma.gem_transactions.count({ where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] } }),
    prisma.tickets.count({ where: { targetid: userId } }),
    prisma.lg_pets.findUnique({ where: { userid: userId }, select: { userid: true } }),
    prisma.lg_user_inventory.count({ where: { userid: userId } }),
    prisma.lg_user_farm.count({ where: { userid: userId } }),
  ])

  return {
    voice_sessions: voiceCount,
    text_sessions: textCount,
    workout_sessions: workoutCount,
    tasks: taskCount,
    reminders: reminderCount,
    server_memberships: memberCount,
    coin_transactions: coinTxCount,
    gem_transactions: gemTxCount,
    moderation_tickets: ticketCount,
    has_pet: !!petExists,
    pet_inventory_items: petInventoryCount,
    farm_plots: farmPlotCount,
  }
}
