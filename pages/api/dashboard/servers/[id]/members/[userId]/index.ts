// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Full member detail endpoint for the member slide-out panel.
//          Returns stats, ranks, sessions, records, transactions,
//          inventory, schedule, room, tasks, and saved roles.
// ============================================================
import { prisma } from "@/utils/prisma"
import { requireModerator } from "@/utils/adminAuth"
import { apiHandler } from "@/utils/apiHandler"

export default apiHandler({
  async GET(req, res) {
    const guildId = BigInt(req.query.id as string)
    const targetUserId = BigInt(req.query.userId as string)
    const auth = await requireModerator(req, res, guildId)
    if (!auth) return

    const [
      member,
      memberRanks,
      seasonStats,
      recentVoiceSessions,
      recentTextSessions,
      records,
      nonPardonedRestrictions,
      escalationDurations,
      recentTransactions,
      inventory,
      scheduleStats,
      room,
      taskStats,
      savedRolesResult,
    ] = await Promise.all([
      // --- AI-MODIFIED (2026-03-14) ---
      // Purpose: join user_config for avatar_hash
      // --- AI-MODIFIED (2026-03-15) ---
      // Purpose: select user_config.name for display name fallback
      prisma.members.findUnique({
        where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
        select: {
          userid: true,
          display_name: true,
          coins: true,
          workout_count: true,
          first_joined: true,
          last_left: true,
          timestamp: true,
          video_warned: true,
          revision_mute_count: true,
          user_config: {
            select: { avatar_hash: true, name: true },
          },
        },
      }),
      // --- END AI-MODIFIED ---

      prisma.member_ranks.findUnique({
        where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
        select: {
          current_xp_rankid: true,
          current_voice_rankid: true,
          current_msg_rankid: true,
        },
      }),

      prisma.season_stats.findUnique({
        where: { guildid_userid: { guildid: guildId, userid: targetUserId } },
        select: { voice_stats: true, xp_stats: true, message_stats: true },
      }),

      prisma.voice_sessions.findMany({
        where: { guildid: guildId, userid: targetUserId },
        orderBy: { start_time: "desc" },
        take: 15,
        select: {
          start_time: true,
          duration: true,
          channelid: true,
          tag: true,
        },
      }),

      prisma.text_sessions.findMany({
        where: { guildid: guildId, userid: targetUserId },
        orderBy: { start_time: "desc" },
        take: 15,
        select: {
          start_time: true,
          duration: true,
          messages: true,
          words: true,
        },
      }),

      prisma.tickets.findMany({
        where: { guildid: guildId, targetid: targetUserId },
        orderBy: { created_at: "desc" },
        select: {
          ticketid: true,
          ticket_type: true,
          ticket_state: true,
          created_at: true,
          content: true,
          moderator_id: true,
          duration: true,
          expiry: true,
          pardoned_by: true,
          pardoned_at: true,
          pardoned_reason: true,
        },
      }),

      prisma.tickets.count({
        where: {
          guildid: guildId,
          targetid: targetUserId,
          ticket_type: "STUDY_BAN",
          ticket_state: { notIn: ["PARDONED"] },
        },
      }),

      prisma.studyban_durations.findMany({
        where: { guildid: guildId },
        orderBy: { rowid: "asc" },
        select: { duration: true },
      }),

      prisma.coin_transactions.findMany({
        where: {
          guildid: guildId,
          OR: [
            { actorid: targetUserId },
            { from_account: targetUserId },
            { to_account: targetUserId },
          ],
        },
        orderBy: { created_at: "desc" },
        take: 20,
        select: {
          transactionid: true,
          transactiontype: true,
          amount: true,
          bonus: true,
          created_at: true,
          actorid: true,
          from_account: true,
          to_account: true,
        },
      }),

      prisma.member_inventory.findMany({
        where: { guildid: guildId, userid: targetUserId },
        select: {
          inventoryid: true,
          itemid: true,
          shop_items: {
            select: {
              item_type: true,
              price: true,
              shop_items_colour_roles: { select: { roleid: true } },
            },
          },
        },
      }),

      prisma.schedule_session_members.groupBy({
        by: ["attended"],
        where: { guildid: guildId, userid: targetUserId },
        _count: true,
      }),

      prisma.rented_rooms.findFirst({
        where: { guildid: guildId, ownerid: targetUserId, deleted_at: null },
        select: {
          channelid: true,
          name: true,
          coin_balance: true,
          created_at: true,
        },
      }),

      prisma.tasklist.aggregate({
        where: { userid: targetUserId, deleted_at: null },
        _count: { taskid: true },
      }),

      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM past_member_roles
        WHERE guildid = ${guildId} AND userid = ${targetUserId}
      `,
    ])

    if (!member) {
      return res.status(404).json({ error: "Member not found in this server" })
    }

    // --- AI-MODIFIED (2026-03-15) ---
    // Purpose: tracked_time is always 0; aggregate voice_sessions for real study time
    const studyAgg = await prisma.voice_sessions.aggregate({
      where: { guildid: guildId, userid: targetUserId },
      _sum: { duration: true },
    })
    const totalStudySeconds = studyAgg._sum?.duration || 0
    // --- END AI-MODIFIED ---

    const completedTasks = await prisma.tasklist.count({
      where: { userid: targetUserId, deleted_at: null, completed_at: { not: null } },
    })

    const voiceSessions = recentVoiceSessions.map((s) => ({
      type: "voice" as const,
      startTime: s.start_time.toISOString(),
      duration: s.duration,
      channelId: s.channelid?.toString() || null,
      tag: s.tag || null,
    }))

    const textSessions = recentTextSessions.map((s) => ({
      type: "text" as const,
      startTime: s.start_time.toISOString(),
      duration: s.duration,
      channelId: null,
      tag: null,
    }))

    const combinedSessions = [...voiceSessions, ...textSessions]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 15)

    const attendedCount = scheduleStats.find((s) => s.attended)?._count ?? 0
    const missedCount = scheduleStats.find((s) => !s.attended)?._count ?? 0
    const totalSchedule = attendedCount + missedCount

    const nextDurationIndex = nonPardonedRestrictions
    const nextDuration = escalationDurations[nextDurationIndex]?.duration ?? null

    function formatDurationSecs(secs: number): string {
      if (secs < 3600) return `${Math.round(secs / 60)}m`
      if (secs < 86400) return `${Math.round(secs / 3600)}h`
      return `${Math.round(secs / 86400)}d`
    }

    const totalTasks = taskStats._count.taskid

    // --- AI-MODIFIED (2026-03-14) ---
    // Purpose: build avatar URL from user_config.avatar_hash
    const uid = member.userid.toString()
    const avatarHash = (member as any).user_config?.avatar_hash ?? null
    let avatarUrl: string
    if (avatarHash) {
      const ext = avatarHash.startsWith("a_") ? "gif" : "webp"
      avatarUrl = `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.${ext}?size=64`
    } else {
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${Number(member.userid % BigInt(5))}.png`
    }
    // --- END AI-MODIFIED ---

    res.status(200).json({
      member: {
        userId: uid,
        // --- AI-MODIFIED (2026-03-15) ---
        // Purpose: display name fallback chain + study time from voice_sessions
        displayName: member.display_name || member.user_config?.name || null,
        avatarUrl,
        trackedTimeHours: Math.round((totalStudySeconds / 3600) * 10) / 10,
        // --- END AI-MODIFIED ---
        coins: member.coins || 0,
        workoutCount: member.workout_count || 0,
        firstJoined: member.first_joined,
        lastLeft: member.last_left,
        lastActive: member.timestamp,
        videoWarned: member.video_warned || false,
        revisionMuteCount: member.revision_mute_count || 0,
      },
      ranks: memberRanks
        ? {
            currentXpRankId: memberRanks.current_xp_rankid?.toString() || null,
            currentVoiceRankId: memberRanks.current_voice_rankid?.toString() || null,
            currentMsgRankId: memberRanks.current_msg_rankid?.toString() || null,
          }
        : null,
      seasonStats: seasonStats
        ? {
            voiceStats: seasonStats.voice_stats,
            xpStats: seasonStats.xp_stats,
            messageStats: seasonStats.message_stats,
          }
        : null,
      recentSessions: combinedSessions,
      records: records.map((t) => ({
        ticketId: t.ticketid,
        type: t.ticket_type,
        state: t.ticket_state,
        createdAt: t.created_at,
        content: t.content,
        moderatorId: t.moderator_id.toString(),
        duration: t.duration,
        expiry: t.expiry,
        pardonedBy: t.pardoned_by?.toString() || null,
        pardonedAt: t.pardoned_at,
        pardonedReason: t.pardoned_reason,
      })),
      restrictionEscalation: {
        priorRestrictions: nonPardonedRestrictions,
        nextDuration: nextDuration ? formatDurationSecs(nextDuration) : "permanent",
      },
      recentTransactions: recentTransactions.map((t) => ({
        id: t.transactionid,
        type: t.transactiontype,
        amount: t.amount,
        bonus: t.bonus,
        createdAt: t.created_at,
        fromAccount: t.from_account?.toString() || null,
        toAccount: t.to_account?.toString() || null,
      })),
      inventory: inventory.map((i) => ({
        inventoryId: i.inventoryid,
        itemId: i.itemid,
        itemType: i.shop_items.item_type,
        roleId: i.shop_items.shop_items_colour_roles?.roleid?.toString() || null,
        price: i.shop_items.price,
      })),
      schedule: {
        totalBooked: totalSchedule,
        totalAttended: attendedCount,
        totalMissed: missedCount,
        attendanceRate: totalSchedule > 0 ? Math.round((attendedCount / totalSchedule) * 100) : 0,
      },
      room: room
        ? {
            channelId: room.channelid.toString(),
            name: room.name,
            coinBalance: room.coin_balance,
            createdAt: room.created_at,
          }
        : null,
      taskStats: {
        totalCreated: totalTasks,
        totalCompleted: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      savedRolesCount: Number(savedRolesResult[0]?.count ?? 0),
    })
  },
})
