// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Live session API - returns active voice/pomodoro session state,
//          room members with their tasks, and the user's own task list
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

function discordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}`
}

export default apiHandler({
  async GET(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const ongoingSessions = await prisma.voice_sessions_ongoing.findMany({
      where: { userid: auth.userId, channelid: { not: null } },
      orderBy: { last_update: "desc" },
    })

    if (ongoingSessions.length === 0) {
      return res.status(200).json({ active: false })
    }

    const activeSession = ongoingSessions[0]
    const channelId = activeSession.channelid!

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Also query rented_rooms to detect if user is in a private room
    // --- Original code (commented out for rollback) ---
    // const [guildConfig, timer, roomSessions, myTasks] = await Promise.all([
    //   prisma.guild_config.findUnique({
    //     where: { guildid: activeSession.guildid },
    //     select: { name: true },
    //   }),
    //   ... (same 4 queries without rentedRoom)
    // ])
    // --- End original code ---
    const [guildConfig, timer, roomSessions, myTasks, rentedRoom] = await Promise.all([
      prisma.guild_config.findUnique({
        where: { guildid: activeSession.guildid },
        select: { name: true, renting_price: true },
      }),
      prisma.timers.findUnique({
        where: { channelid: channelId },
      }),
      prisma.voice_sessions_ongoing.findMany({
        where: {
          channelid: channelId,
          userid: { not: auth.userId },
        },
        select: {
          userid: true, guildid: true, channelid: true,
          start_time: true, live_video: true, live_stream: true,
          tag: true,
        },
      }),
      prisma.tasklist.findMany({
        where: { userid: auth.userId, deleted_at: null },
        orderBy: { created_at: "asc" },
        select: {
          taskid: true,
          content: true,
          completed_at: true,
          created_at: true,
          last_updated_at: true,
          parentid: true,
          rewarded: true,
        },
      }),
      prisma.rented_rooms.findUnique({
        where: { channelid: channelId },
        select: {
          channelid: true, guildid: true, ownerid: true,
          coin_balance: true, name: true, last_tick: true,
          created_at: true, deleted_at: true,
          rented_members: { select: { userid: true } },
        },
      }),
    ])
    // --- END AI-MODIFIED ---

    // --- AI-MODIFIED (2026-03-22) ---
    // Purpose: Compute room timer ownership flags used by both running and non-running timer states
    const isRoomChannel = !!rentedRoom && !rentedRoom.deleted_at
    const isRoomOwner = isRoomChannel && rentedRoom.ownerid === auth.userId
    // --- END AI-MODIFIED ---

    let pomodoro = null
    if (timer && timer.last_started) {
      const now = Date.now()
      const lastStarted = new Date(timer.last_started).getTime()
      const interval = timer.focus_length + timer.break_length
      const diff = ((now - lastStarted) / 1000) % interval
      const stage: "focus" | "break" = diff < timer.focus_length ? "focus" : "break"
      const stageDuration = stage === "focus" ? timer.focus_length : timer.break_length
      const stageElapsed = stage === "focus" ? diff : diff - timer.focus_length
      const remaining = Math.max(0, Math.ceil(stageDuration - stageElapsed))

      const stageStartMs = now - stageElapsed * 1000
      const stageEndMs = stageStartMs + stageDuration * 1000

      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: add cycleNumber and lastStarted for cycle counter UI
      const totalElapsedSecs = (now - lastStarted) / 1000
      const cycleNumber = Math.floor(totalElapsedSecs / interval) + 1

      pomodoro = {
        stage,
        focusLength: timer.focus_length,
        breakLength: timer.break_length,
        stageStartedAt: new Date(stageStartMs).toISOString(),
        stageEndsAt: new Date(stageEndMs).toISOString(),
        remainingSeconds: remaining,
        stageDurationSeconds: stageDuration,
        channelName: timer.pretty_name || timer.channel_name || "Pomodoro",
        cycleNumber,
        lastStarted: timer.last_started!.toISOString(),
        // --- AI-MODIFIED (2026-03-22) ---
        // Purpose: Flags so session page shows timer edit controls for room owners
        isRoomTimer: isRoomChannel,
        timerOwnerMatch: isRoomOwner,
        // --- END AI-MODIFIED ---
      }
      // --- END AI-MODIFIED ---
    } else if (timer && !timer.last_started) {
      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Return timer info even when stopped, so room owners see edit/start controls
      pomodoro = {
        stage: "stopped" as const,
        focusLength: timer.focus_length,
        breakLength: timer.break_length,
        stageStartedAt: null,
        stageEndsAt: null,
        remainingSeconds: 0,
        stageDurationSeconds: 0,
        channelName: timer.pretty_name || timer.channel_name || "Pomodoro",
        cycleNumber: 0,
        lastStarted: null,
        isRoomTimer: isRoomChannel,
        timerOwnerMatch: isRoomOwner,
      }
      // --- END AI-MODIFIED ---
    }

    const roomUserIds = roomSessions.map((s) => s.userid)

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: map full session data per room member (tag, start_time, camera, stream)
    const roomSessionMap = new Map(
      roomSessions.map((s) => [s.userid.toString(), s])
    )

    let roomMembers: Array<{
      userId: string
      displayName: string
      avatarUrl: string | null
      activity: string | null
      startTime: string | null
      isCamera: boolean
      isStream: boolean
      tasks: Array<{ id: number; content: string; completed: boolean }>
    }> = []
    // --- END AI-MODIFIED ---

    if (roomUserIds.length > 0) {
      const [userConfigs, memberRows, roomTasks] = await Promise.all([
        prisma.user_config.findMany({
          where: { userid: { in: roomUserIds } },
          select: { userid: true, name: true, avatar_hash: true },
        }),
        prisma.members.findMany({
          where: {
            guildid: activeSession.guildid,
            userid: { in: roomUserIds },
          },
          select: { userid: true, display_name: true },
        }),
        prisma.tasklist.findMany({
          where: {
            userid: { in: roomUserIds },
            deleted_at: null,
            completed_at: null,
          },
          orderBy: { created_at: "asc" },
          select: {
            taskid: true,
            userid: true,
            content: true,
            completed_at: true,
          },
        }),
      ])

      const userConfigMap = new Map(userConfigs.map((u) => [u.userid.toString(), u]))
      const memberMap = new Map(memberRows.map((m) => [m.userid.toString(), m]))
      const tasksByUser = new Map<string, typeof roomTasks>()
      for (const t of roomTasks) {
        const uid = t.userid.toString()
        if (!tasksByUser.has(uid)) tasksByUser.set(uid, [])
        tasksByUser.get(uid)!.push(t)
      }

      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: include startTime, isCamera, isStream per room member
      roomMembers = roomUserIds.map((uid) => {
        const uidStr = uid.toString()
        const uc = userConfigMap.get(uidStr)
        const mem = memberMap.get(uidStr)
        const rs = roomSessionMap.get(uidStr)
        const tasks = tasksByUser.get(uidStr) || []
        return {
          userId: uidStr,
          displayName: mem?.display_name || uc?.name || `User ${uidStr.slice(-4)}`,
          avatarUrl: discordAvatarUrl(uidStr, uc?.avatar_hash ?? null),
          activity: rs?.tag ?? null,
          startTime: rs?.start_time?.toISOString() ?? null,
          isCamera: rs?.live_video ?? false,
          isStream: rs?.live_stream ?? false,
          tasks: tasks.map((t) => ({
            id: t.taskid,
            content: t.content,
            completed: !!t.completed_at,
          })),
        }
      })
      // --- END AI-MODIFIED ---
    }

    res.status(200).json({
      active: true,
      session: {
        channelId: channelId.toString(),
        guildId: activeSession.guildid.toString(),
        guildName: guildConfig?.name || "Unknown Server",
        startTime: activeSession.start_time,
        currentMinutes: activeSession.start_time
          ? Math.round((Date.now() - new Date(activeSession.start_time).getTime()) / 60000)
          : 0,
        isCamera: activeSession.live_video,
        isStream: activeSession.live_stream,
        activity: activeSession.tag ?? null,
      },
      pomodoro,
      roomMembers,
      myTasks: myTasks.map((t) => ({
        id: t.taskid,
        content: t.content,
        completed: !!t.completed_at,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        updatedAt: t.last_updated_at,
        parentId: t.parentid,
        rewarded: t.rewarded,
      })),
      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Flags for timer creation when no timer exists yet
      roomTimerFlags: {
        isRoomChannel,
        isRoomOwner,
        hasTimer: !!timer,
      },
      // --- END AI-MODIFIED ---
      // --- AI-MODIFIED (2026-03-22) ---
      // Purpose: Include private room data when user's voice channel is a rented room
      privateRoom: rentedRoom && !rentedRoom.deleted_at ? (() => {
        const rentPrice = guildConfig?.renting_price ?? 1000
        const daysRemaining = rentPrice > 0 ? Math.floor(rentedRoom.coin_balance / rentPrice) : 999
        const nextTick = rentedRoom.last_tick
          ? new Date(new Date(rentedRoom.last_tick).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : rentedRoom.created_at
            ? new Date(new Date(rentedRoom.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
            : null
        return {
          channelId: rentedRoom.channelid.toString(),
          name: rentedRoom.name || null,
          coinBalance: rentedRoom.coin_balance,
          rentPrice,
          daysRemaining,
          isOwner: rentedRoom.ownerid === auth.userId,
          ownerId: rentedRoom.ownerid.toString(),
          nextTick,
          createdAt: rentedRoom.created_at?.toISOString() ?? null,
          memberCount: (rentedRoom.rented_members?.length ?? 0) + 1,
        }
      })() : null,
      // --- END AI-MODIFIED ---
    })
  },

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: allow setting activity tag from the website (mirrors /now command, max 10 chars)
  async PATCH(req, res) {
    const auth = await requireAuth(req, res)
    if (!auth) return

    const { activity } = req.body
    if (activity !== null && activity !== undefined) {
      if (typeof activity !== "string" || activity.length > 10) {
        return res.status(400).json({ error: "Activity must be a string, max 10 characters" })
      }
    }

    const sessions = await prisma.voice_sessions_ongoing.findMany({
      where: { userid: auth.userId, channelid: { not: null } },
    })

    if (sessions.length === 0) {
      return res.status(404).json({ error: "No active voice session" })
    }

    const s = sessions[0]
    await prisma.voice_sessions_ongoing.update({
      where: { guildid_userid: { guildid: s.guildid, userid: s.userid } },
      data: { tag: activity || null },
    })

    res.status(200).json({ success: true, activity: activity || null })
  },
  // --- END AI-MODIFIED ---
})
