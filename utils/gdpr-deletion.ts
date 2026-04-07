// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-07
// Purpose: GDPR data deletion utility. Executes a complete
//          user data deletion in a single DB transaction,
//          following strict FK dependency order.
//          Category A = DELETE, Category B = ANONYMIZE,
//          Category C = SPECIAL HANDLING.
// ============================================================
import { prisma } from "./prisma"
import { Prisma } from "@prisma/client"

export interface DeletionSummary {
  [table: string]: { action: "deleted" | "anonymized" | "special"; count: number }
}

export async function executeUserDeletion(userId: bigint): Promise<DeletionSummary> {
  const summary: DeletionSummary = {}

  function record(table: string, action: "deleted" | "anonymized" | "special", count: number | bigint) {
    summary[table] = { action, count: Number(count) }
  }

  await prisma.$transaction(async (tx) => {
    // =====================================================
    // PHASE 0: SPECIAL HANDLING (Category C)
    // =====================================================

    // Families where user is leader: transfer or dissolve
    const ledFamilies = await tx.lg_families.findMany({
      where: { leader_userid: userId },
      select: { family_id: true },
    })
    for (const family of ledFamilies) {
      const nextMember = await tx.lg_family_members.findFirst({
        where: { family_id: family.family_id, userid: { not: userId }, left_at: null },
        orderBy: { joined_at: "asc" },
      })
      if (nextMember) {
        await tx.lg_families.update({
          where: { family_id: family.family_id },
          data: { leader_userid: nextMember.userid },
        })
        record(`lg_families_leadership_transfer`, "special", 1)
      } else {
        await tx.lg_family_farm_plots.deleteMany({ where: { lg_family_farms: { family_id: family.family_id } } })
        await tx.lg_family_gold_withdrawals.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_family_gold_log.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_family_bank.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_family_invites.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_family_members.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_family_farms.deleteMany({ where: { family_id: family.family_id } })
        await tx.lg_families.delete({ where: { family_id: family.family_id } })
        record(`lg_families_dissolved`, "special", 1)
      }
    }

    // Shared boards where user is owner: transfer or delete
    const ownedBoards = await tx.shared_tasklist.findMany({
      where: { ownerid: userId, deleted_at: null },
      select: { listid: true },
    })
    for (const board of ownedBoards) {
      const nextMember = await tx.shared_tasklist_member.findFirst({
        where: { listid: board.listid, userid: { not: userId } },
        orderBy: { joined_at: "asc" },
      })
      if (nextMember) {
        await tx.shared_tasklist.update({
          where: { listid: board.listid },
          data: { ownerid: nextMember.userid },
        })
        record(`shared_tasklist_ownership_transfer`, "special", 1)
      }
      // If no other members, the board will cascade-delete when user_config is deleted
    }

    // Timers: unset owner
    const r0 = await tx.timers.updateMany({ where: { ownerid: userId }, data: { ownerid: null } })
    if (r0.count > 0) record("timers", "special", r0.count)

    // Rented rooms: delete rooms the user owns
    const r0b = await tx.rented_members.deleteMany({
      where: { rented_rooms: { ownerid: userId } },
    })
    if (r0b.count > 0) record("rented_members_from_owned_rooms", "deleted", r0b.count)
    const r0c = await tx.rented_rooms.deleteMany({ where: { ownerid: userId } })
    if (r0c.count > 0) record("rented_rooms", "deleted", r0c.count)

    // Global blacklist
    const r0d = await tx.global_user_blacklist.deleteMany({ where: { userid: userId } })
    if (r0d.count > 0) record("global_user_blacklist", "deleted", r0d.count)
    const r0e = await tx.$executeRaw`UPDATE global_user_blacklist SET ownerid = 0 WHERE ownerid = ${userId}`
    if (r0e > 0) record("global_user_blacklist_ownerid", "anonymized", r0e)

    // Customised skins owned by user (via user_skin_inventory)
    const ownedSkinIds = await tx.user_skin_inventory.findMany({
      where: { userid: userId },
      select: { custom_skin_id: true },
    })
    if (ownedSkinIds.length > 0) {
      const skinIds = ownedSkinIds.map(s => s.custom_skin_id)
      await tx.customised_skin_properties.deleteMany({ where: { custom_skin_id: { in: skinIds } } })
      // Only delete skins not referenced by other users' inventory
      for (const skinId of skinIds) {
        const otherOwners = await tx.user_skin_inventory.count({
          where: { custom_skin_id: skinId, userid: { not: userId } },
        })
        if (otherOwners === 0) {
          // Check no premium_guilds reference it
          const guildRefs = await tx.premium_guilds.count({ where: { custom_skin_id: skinId } })
          if (guildRefs === 0) {
            await tx.customised_skins.delete({ where: { custom_skin_id: skinId } }).catch(() => {})
          }
        }
      }
      record("customised_skins", "special", skinIds.length)
    }

    // =====================================================
    // PHASE 1: DELETE LionGotchi data (onDelete: NoAction)
    // =====================================================

    const r1 = await tx.lg_enhancement_achievements.deleteMany({ where: { userid: userId } })
    record("lg_enhancement_achievements", "deleted", r1.count)

    const r2 = await tx.lg_enhancement_log.deleteMany({ where: { userid: userId } })
    record("lg_enhancement_log", "deleted", r2.count)

    // Family data the user is part of (not already handled by dissolve above)
    const r3a = await tx.lg_family_farm_plots.deleteMany({ where: { planted_by: userId } })
    record("lg_family_farm_plots", "deleted", r3a.count)

    const r3b = await tx.lg_family_gold_withdrawals.deleteMany({ where: { userid: userId } })
    record("lg_family_gold_withdrawals", "deleted", r3b.count)

    // Anonymize family records before deleting member row
    const r3c = await tx.$executeRaw`UPDATE lg_family_gold_log SET userid = NULL WHERE userid = ${userId}`
    record("lg_family_gold_log", "anonymized", r3c)

    const r3d = await tx.$executeRaw`UPDATE lg_family_bank SET deposited_by = NULL WHERE deposited_by = ${userId}`
    record("lg_family_bank", "anonymized", r3d)

    const r3e = await tx.lg_family_invites.deleteMany({
      where: { OR: [{ from_userid: userId }, { to_userid: userId }] },
    })
    record("lg_family_invites", "deleted", r3e.count)

    const r3f = await tx.lg_family_members.deleteMany({ where: { userid: userId } })
    record("lg_family_members", "deleted", r3f.count)

    // Marketplace: anonymize (no FK to user_config)
    const r4a = await tx.$executeRaw`UPDATE lg_marketplace_sales SET buyer_userid = NULL WHERE buyer_userid = ${userId}`
    const r4b = await tx.$executeRaw`UPDATE lg_marketplace_sales SET seller_userid = NULL WHERE seller_userid = ${userId}`
    record("lg_marketplace_sales", "anonymized", Number(r4a) + Number(r4b))

    const r4c = await tx.$executeRaw`UPDATE lg_marketplace_listings SET seller_userid = NULL WHERE seller_userid = ${userId}`
    record("lg_marketplace_listings", "anonymized", r4c)

    // Gold transactions: anonymize (no FK to user_config)
    const r4d = await tx.$executeRaw`UPDATE lg_gold_transactions SET actorid = NULL WHERE actorid = ${userId}`
    const r4e = await tx.$executeRaw`UPDATE lg_gold_transactions SET from_account = NULL WHERE from_account = ${userId}`
    const r4f = await tx.$executeRaw`UPDATE lg_gold_transactions SET to_account = NULL WHERE to_account = ${userId}`
    record("lg_gold_transactions", "anonymized", Number(r4d) + Number(r4e) + Number(r4f))

    const r5 = await tx.lg_user_farm.deleteMany({ where: { userid: userId } })
    record("lg_user_farm", "deleted", r5.count)

    const r6 = await tx.lg_pet_equipment.deleteMany({ where: { userid: userId } })
    record("lg_pet_equipment", "deleted", r6.count)

    const r7 = await tx.lg_user_furniture.deleteMany({ where: { userid: userId } })
    record("lg_user_furniture", "deleted", r7.count)

    const r8 = await tx.lg_user_rooms.deleteMany({ where: { userid: userId } })
    record("lg_user_rooms", "deleted", r8.count)

    const r9 = await tx.lg_user_gameboy_skins.deleteMany({ where: { userid: userId } })
    record("lg_user_gameboy_skins", "deleted", r9.count)

    const r10 = await tx.lg_user_inventory.deleteMany({ where: { userid: userId } })
    record("lg_user_inventory", "deleted", r10.count)

    const r10b = await tx.lg_room_layout.deleteMany({ where: { userid: userId } })
    record("lg_room_layout", "deleted", r10b.count)

    // Friend interactions (delete before friends/blocks)
    const r11a = await tx.lg_friend_interactions.deleteMany({
      where: { OR: [{ actor_userid: userId }, { target_userid: userId }] },
    })
    record("lg_friend_interactions", "deleted", r11a.count)

    const r11 = await tx.lg_friends.deleteMany({
      where: { OR: [{ userid1: userId }, { userid2: userId }] },
    })
    record("lg_friends", "deleted", r11.count)

    const r12 = await tx.lg_friend_requests.deleteMany({
      where: { OR: [{ from_userid: userId }, { to_userid: userId }] },
    })
    record("lg_friend_requests", "deleted", r12.count)

    const r13 = await tx.lg_blocks.deleteMany({
      where: { OR: [{ blocker_userid: userId }, { blocked_userid: userId }] },
    })
    record("lg_blocks", "deleted", r13.count)

    const r14 = await tx.lg_pets.deleteMany({ where: { userid: userId } })
    record("lg_pets", "deleted", r14.count)

    // =====================================================
    // PHASE 2: ANONYMIZE shared records (Category B)
    // No FK constraints on these user ID columns
    // =====================================================

    const ra1 = await tx.$executeRaw`UPDATE coin_transactions SET actorid = 0 WHERE actorid = ${userId}`
    const ra2 = await tx.$executeRaw`UPDATE coin_transactions SET from_account = NULL WHERE from_account = ${userId}`
    const ra3 = await tx.$executeRaw`UPDATE coin_transactions SET to_account = NULL WHERE to_account = ${userId}`
    record("coin_transactions", "anonymized", Number(ra1) + Number(ra2) + Number(ra3))

    const rb1 = await tx.$executeRaw`UPDATE gem_transactions SET actorid = 0 WHERE actorid = ${userId}`
    const rb2 = await tx.$executeRaw`UPDATE gem_transactions SET from_account = NULL WHERE from_account = ${userId}`
    const rb3 = await tx.$executeRaw`UPDATE gem_transactions SET to_account = NULL WHERE to_account = ${userId}`
    record("gem_transactions", "anonymized", Number(rb1) + Number(rb2) + Number(rb3))

    const rc1 = await tx.$executeRaw`UPDATE tickets SET targetid = 0 WHERE targetid = ${userId}`
    const rc2 = await tx.$executeRaw`UPDATE tickets SET moderator_id = 0 WHERE moderator_id = ${userId}`
    const rc3 = await tx.$executeRaw`UPDATE tickets SET pardoned_by = NULL WHERE pardoned_by = ${userId}`
    record("tickets", "anonymized", Number(rc1) + Number(rc2) + Number(rc3))

    const rd = await tx.$executeRaw`UPDATE room_admin_log SET adminid = 0 WHERE adminid = ${userId}`
    record("room_admin_log", "anonymized", rd)

    const re = await tx.$executeRaw`UPDATE sticky_messages SET created_by = NULL WHERE created_by = ${userId}`
    record("sticky_messages", "anonymized", re)

    const rf = await tx.$executeRaw`UPDATE guild_text_overrides SET updated_by = NULL WHERE updated_by = ${userId}`
    record("guild_text_overrides", "anonymized", rf)

    const rg = await tx.$executeRaw`UPDATE text_override_backups SET created_by = NULL WHERE created_by = ${userId}`
    record("text_override_backups", "anonymized", rg)

    const rh = await tx.$executeRaw`UPDATE leaderboard_autopost_action_queue SET requested_by = NULL WHERE requested_by = ${userId}`
    record("leaderboard_autopost_action_queue", "anonymized", rh)

    const ri = await tx.$executeRaw`UPDATE shared_task SET assignee_id = NULL WHERE assignee_id = ${userId}`
    const rj = await tx.$executeRaw`UPDATE shared_task SET created_by = 0 WHERE created_by = ${userId}`
    record("shared_task", "anonymized", Number(ri) + Number(rj))

    const rk = await tx.$executeRaw`UPDATE shared_task_history SET userid = 0 WHERE userid = ${userId}`
    record("shared_task_history", "anonymized", rk)

    const rl = await tx.$executeRaw`UPDATE economy_admin_actions SET targetid = 0 WHERE targetid = ${userId}::int`
    record("economy_admin_actions", "anonymized", rl)

    const rm = await tx.$executeRaw`UPDATE lofi_blacklist SET blacklisted_by = NULL WHERE blacklisted_by = ${userId}`
    record("lofi_blacklist", "anonymized", rm)

    // =====================================================
    // PHASE 3: DELETE remaining user data (onDelete: NoAction)
    // =====================================================

    const s1 = await tx.pomodoro_milestones.deleteMany({ where: { userid: userId } })
    record("pomodoro_milestones", "deleted", s1.count)

    const s2 = await tx.pomodoro_streaks.deleteMany({ where: { userid: userId } })
    record("pomodoro_streaks", "deleted", s2.count)

    const s3 = await tx.user_skin_inventory.deleteMany({ where: { userid: userId } })
    record("user_skin_inventory", "deleted", s3.count)

    const s4 = await tx.premium_guild_contributions.deleteMany({ where: { userid: userId } })
    record("premium_guild_contributions", "deleted", s4.count)

    const s5 = await tx.lionheart_server_premium.deleteMany({ where: { userid: userId } })
    record("lionheart_server_premium", "deleted", s5.count)

    const s5b = await tx.user_subscriptions.deleteMany({ where: { userid: userId } })
    record("user_subscriptions", "deleted", s5b.count)

    const s5c = await tx.server_premium_subscriptions.deleteMany({ where: { userid: userId } })
    record("server_premium_subscriptions", "deleted", s5c.count)

    const s6 = await tx.user_experience.deleteMany({ where: { userid: userId } })
    record("user_experience", "deleted", s6.count)

    const s7 = await tx.user_survey.deleteMany({ where: { userid: userId } })
    record("user_survey", "deleted", s7.count)

    const s8 = await tx.user_timer_preferences.deleteMany({ where: { userid: userId } })
    record("user_timer_preferences", "deleted", s8.count)

    const s9 = await tx.user_card_preferences.deleteMany({ where: { userid: userId } })
    record("user_card_preferences", "deleted", s9.count)

    const s10 = await tx.tasklist.deleteMany({ where: { userid: userId } })
    record("tasklist", "deleted", s10.count)

    const s11 = await tx.reminders.deleteMany({ where: { userid: userId } })
    record("reminders", "deleted", s11.count)

    const s12 = await tx.user_weekly_goals.deleteMany({ where: { userid: userId } })
    record("user_weekly_goals", "deleted", s12.count)

    const s13 = await tx.user_monthly_goals.deleteMany({ where: { userid: userId } })
    record("user_monthly_goals", "deleted", s13.count)

    const s14 = await tx.topgg.deleteMany({ where: { userid: userId } })
    record("topgg", "deleted", s14.count)

    const s15 = await tx.shared_tasklist_member.deleteMany({ where: { userid: userId } })
    record("shared_tasklist_member", "deleted", s15.count)

    const s16 = await tx.ambient_sounds_rentals.deleteMany({ where: { userid: userId } })
    record("ambient_sounds_rentals", "deleted", s16.count)

    const s17 = await tx.rented_members.deleteMany({ where: { userid: userId } })
    record("rented_members", "deleted", s17.count)

    // =====================================================
    // PHASE 4: DELETE user_config (cascades to members and
    // all member-child tables via onDelete: Cascade)
    // =====================================================

    const s18 = await tx.user_config.deleteMany({ where: { userid: userId } })
    record("user_config", "deleted", s18.count)
  }, {
    timeout: 120000,
    maxWait: 10000,
  })

  return summary
}

export async function getDeletionPreview(userId: bigint): Promise<Record<string, number>> {
  const [
    userExists, memberCount, voiceCount, textCount, workoutCount,
    taskCount, reminderCount, goalCount, expCount,
    inventoryCount, skinCount, rankCount, seasonCount,
    pomodoroExists, milestoneCount, scheduleCount,
    roomCount, roleMenuCount, voteCount, tagCount,
    ticketCount, coinTxCount, gemTxCount,
    boardMemberCount, boardOwnerCount,
    subExists, serverSubCount, premiumContribCount,
    soundRentalCount, lionheartExists,
    petExists, petInvCount, petEquipCount, petRoomCount,
    petFurnitureCount, petFarmCount, petFriendCount,
    petBlockCount, petFamilyCount, petEnhanceCount,
    petListingCount, petSaleCount,
  ] = await Promise.all([
    prisma.user_config.count({ where: { userid: userId } }),
    prisma.members.count({ where: { userid: userId } }),
    prisma.voice_sessions.count({ where: { userid: userId } }),
    prisma.text_sessions.count({ where: { userid: userId } }),
    prisma.workout_sessions.count({ where: { userid: userId } }),
    prisma.tasklist.count({ where: { userid: userId } }),
    prisma.reminders.count({ where: { userid: userId } }),
    prisma.member_weekly_goals.count({ where: { userid: userId } }),
    prisma.member_experience.count({ where: { userid: userId } }),
    prisma.member_inventory.count({ where: { userid: userId } }),
    prisma.user_skin_inventory.count({ where: { userid: userId } }),
    prisma.member_ranks.count({ where: { userid: userId } }),
    prisma.season_stats.count({ where: { userid: userId } }),
    prisma.pomodoro_streaks.count({ where: { userid: userId } }),
    prisma.pomodoro_milestones.count({ where: { userid: userId } }),
    prisma.schedule_session_members.count({ where: { userid: userId } }),
    prisma.rented_rooms.count({ where: { ownerid: userId } }),
    prisma.role_menu_history.count({ where: { userid: userId } }),
    prisma.topgg.count({ where: { userid: userId } }),
    prisma.member_profile_tags.count({ where: { userid: userId } }),
    prisma.tickets.count({ where: { OR: [{ targetid: userId }, { moderator_id: userId }] } }),
    prisma.coin_transactions.count({ where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] } }),
    prisma.gem_transactions.count({ where: { OR: [{ actorid: userId }, { from_account: userId }, { to_account: userId }] } }),
    prisma.shared_tasklist_member.count({ where: { userid: userId } }),
    prisma.shared_tasklist.count({ where: { ownerid: userId } }),
    prisma.user_subscriptions.count({ where: { userid: userId } }),
    prisma.server_premium_subscriptions.count({ where: { userid: userId } }),
    prisma.premium_guild_contributions.count({ where: { userid: userId } }),
    prisma.ambient_sounds_rentals.count({ where: { userid: userId } }),
    prisma.lionheart_server_premium.count({ where: { userid: userId } }),
    prisma.lg_pets.count({ where: { userid: userId } }),
    prisma.lg_user_inventory.count({ where: { userid: userId } }),
    prisma.lg_pet_equipment.count({ where: { userid: userId } }),
    prisma.lg_user_rooms.count({ where: { userid: userId } }),
    prisma.lg_user_furniture.count({ where: { userid: userId } }),
    prisma.lg_user_farm.count({ where: { userid: userId } }),
    prisma.lg_friends.count({ where: { OR: [{ userid1: userId }, { userid2: userId }] } }),
    prisma.lg_blocks.count({ where: { OR: [{ blocker_userid: userId }, { blocked_userid: userId }] } }),
    prisma.lg_family_members.count({ where: { userid: userId } }),
    prisma.lg_enhancement_log.count({ where: { userid: userId } }),
    prisma.lg_marketplace_listings.count({ where: { seller_userid: userId } }),
    prisma.lg_marketplace_sales.count({ where: { OR: [{ buyer_userid: userId }, { seller_userid: userId }] } }),
  ])

  return {
    user_profile: userExists,
    server_memberships: memberCount,
    voice_sessions: voiceCount,
    text_sessions: textCount,
    workout_sessions: workoutCount,
    tasks: taskCount,
    reminders: reminderCount,
    goals: goalCount,
    experience_records: expCount,
    inventory_items: inventoryCount,
    skin_items: skinCount,
    rank_records: rankCount,
    season_stats: seasonCount,
    pomodoro_streaks: pomodoroExists,
    pomodoro_milestones: milestoneCount,
    schedule_bookings: scheduleCount,
    rented_rooms: roomCount,
    role_menu_entries: roleMenuCount,
    votes: voteCount,
    profile_tags: tagCount,
    moderation_tickets_anonymized: ticketCount,
    coin_transactions_anonymized: coinTxCount,
    gem_transactions_anonymized: gemTxCount,
    shared_board_memberships: boardMemberCount,
    shared_boards_owned: boardOwnerCount,
    subscriptions: subExists,
    server_subscriptions: serverSubCount,
    premium_contributions: premiumContribCount,
    sound_rentals: soundRentalCount,
    lionheart_premium: lionheartExists,
    pet_profile: petExists,
    pet_inventory: petInvCount,
    pet_equipment: petEquipCount,
    pet_rooms: petRoomCount,
    pet_furniture: petFurnitureCount,
    pet_farm_plots: petFarmCount,
    pet_friends: petFriendCount,
    pet_blocks: petBlockCount,
    pet_family_memberships: petFamilyCount,
    pet_enhancement_logs: petEnhanceCount,
    pet_marketplace_listings_anonymized: petListingCount,
    pet_marketplace_sales_anonymized: petSaleCount,
  }
}
