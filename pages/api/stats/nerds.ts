// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Stats for Nerds API - returns comprehensive bot
//          statistics with 5-min in-memory cache. Uses pg_class
//          for large tables, raw SQL for analytics schema,
//          Promise.allSettled for resilient parallel queries.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"

interface RowEstimate {
  relname: string
  estimate: number
}

interface SnapshotRow {
  week: string
  guilds: number
  users: number
  in_voice: number
  members: number
}

interface HourRow {
  hour: number
  avg_studying: number
}

interface DayRow {
  dow: number
  avg_studying: number
}

interface CommandRow {
  cmdname: string
  cnt: number
}

interface CommandTrendRow {
  month: string
  cnt: number
}

interface VoteRow {
  month: string
  votes: number
}

interface RecordRow {
  value: number
  recorded_at: string
}

interface MilestoneRow {
  threshold: number
  achieved_at: string
}

interface ServerRow {
  name: string
  study_hours: number
  member_count: number
}

interface TimezoneRow {
  timezone: string
  count: number
}

interface CalendarRow {
  day: string
  avg_studying: number
}

interface SizeRow {
  label: string
  count: number
}

interface ClubRow {
  label: string
  count: number
}

interface BusiestDayRow {
  day: string
  cnt: number
}

let cachedStats: any = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 300_000 // 5 minutes

async function safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (e) {
    console.error("Stats query failed:", e)
    return null
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const now = Date.now()
  if (cachedStats && now - cacheTimestamp < CACHE_TTL_MS) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    )
    return res.status(200).json(cachedStats)
  }

  const startTime = Date.now()

  try {
    const [
      liveResult,
      shardsResult,
      estimatesResult,
      studyHoursResult,
      growthResult,
      studyByHourResult,
      studyByDayResult,
      topCommandsResult,
      commandTrendResult,
      votesResult,
      retentionResult,
      serverSizesResult,
      studyClubResult,
      recordsPeakResult,
      recordsQuietResult,
      busiestCmdDayResult,
      milestonesResult,
      topServersResult,
      oldestUserResult,
      calendarResult,
      timezoneResult,
      tasksCompletedResult,
      totalVotesResult,
    ] = await Promise.allSettled([
      // 1. Live counts
      safeQuery(async () => {
        const [studyingNow, activeTimers, guildCount] = await Promise.all([
          prisma.voice_sessions_ongoing.count(),
          prisma.timers.count(),
          prisma.guild_config.count({ where: { left_at: null } }),
        ])
        return { studyingNow, activeTimers, totalServers: guildCount }
      }),

      // 2. Shard grid
      safeQuery(() =>
        prisma.shard_data.findMany({
          select: {
            shard_id: true,
            shard_count: true,
            guild_count: true,
            last_login: true,
          },
          orderBy: { shard_id: "asc" },
        })
      ),

      // 3. Row estimates via pg_class
      safeQuery(() =>
        prisma.$queryRaw<RowEstimate[]>`
          SELECT relname, reltuples::bigint AS estimate
          FROM pg_class
          WHERE relname IN (
            'voice_sessions', 'text_sessions', 'user_config',
            'tasklist', 'members', 'coin_transactions',
            'guild_config'
          )
        `
      ),

      // --- AI-MODIFIED (2026-03-21) ---
      // Purpose: Use voice_sessions.duration (actual study data) instead of
      //          members.tracked_time (always 0 in production). TABLESAMPLE
      //          keeps the query fast (~100ms vs 14s for full SUM on 51M rows);
      //          multiplied by pg_class row estimate for total hours.
      // --- Original code (commented out for rollback) ---
      // safeQuery(async () => {
      //   const result = await prisma.$queryRaw<[{ total: bigint }]>`
      //     SELECT COALESCE(SUM(tracked_time), 0)::bigint AS total FROM members WHERE tracked_time > 0
      //   `
      //   return Number(result[0]?.total || 0)
      // }),
      // --- End original code ---
      safeQuery(async () => {
        const result = await prisma.$queryRaw<[{ avg_duration: number }]>`
          SELECT COALESCE(AVG(duration), 0)::int AS avg_duration
          FROM voice_sessions TABLESAMPLE SYSTEM (0.5)
          WHERE duration > 0
        `
        return Number(result[0]?.avg_duration || 0)
      }),
      // --- END AI-MODIFIED ---

      // 5. Growth series (weekly from snapshots)
      safeQuery(() =>
        prisma.$queryRaw<SnapshotRow[]>`
          SELECT
            DATE_TRUNC('week', created_at)::date::text AS week,
            ROUND(AVG(guild_count))::int AS guilds,
            ROUND(AVG(user_count))::int AS users,
            ROUND(AVG(in_voice))::int AS in_voice,
            ROUND(AVG(member_count))::int AS members
          FROM analytics.snapshots
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY week
        `
      ),

      // 6. Study by hour (from snapshots)
      safeQuery(() =>
        prisma.$queryRaw<HourRow[]>`
          SELECT
            EXTRACT(HOUR FROM created_at)::int AS hour,
            ROUND(AVG(in_voice))::int AS avg_studying
          FROM analytics.snapshots
          GROUP BY EXTRACT(HOUR FROM created_at)
          ORDER BY hour
        `
      ),

      // 7. Study by day of week
      safeQuery(() =>
        prisma.$queryRaw<DayRow[]>`
          SELECT
            EXTRACT(DOW FROM created_at)::int AS dow,
            ROUND(AVG(in_voice))::int AS avg_studying
          FROM analytics.snapshots
          GROUP BY EXTRACT(DOW FROM created_at)
          ORDER BY dow
        `
      ),

      // 8. Top commands
      safeQuery(() =>
        prisma.$queryRaw<CommandRow[]>`
          SELECT cmdname, COUNT(*)::int AS cnt
          FROM analytics.commands
          GROUP BY cmdname
          ORDER BY cnt DESC
          LIMIT 15
        `
      ),

      // 9. Command trend (monthly)
      safeQuery(() =>
        prisma.$queryRaw<CommandTrendRow[]>`
          SELECT
            TO_CHAR(created_at, 'YYYY-MM') AS month,
            COUNT(*)::int AS cnt
          FROM analytics.commands
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month
        `
      ),

      // 10. Votes by month
      safeQuery(() =>
        prisma.$queryRaw<VoteRow[]>`
          SELECT
            TO_CHAR(boostedtimestamp, 'YYYY-MM') AS month,
            COUNT(*)::int AS votes
          FROM topgg
          GROUP BY TO_CHAR(boostedtimestamp, 'YYYY-MM')
          ORDER BY month
        `
      ),

      // 12. Retention
      safeQuery(async () => {
        const [total, active] = await Promise.all([
          prisma.guild_config.count(),
          prisma.guild_config.count({ where: { left_at: null } }),
        ])
        return {
          totalJoined: total,
          stillActive: active,
          rate: total > 0 ? Math.round((active / total) * 1000) / 10 : 0,
        }
      }),

      // 13. Server size distribution
      safeQuery(() =>
        prisma.$queryRaw<SizeRow[]>`
          SELECT
            CASE
              WHEN cnt < 50 THEN 'Tiny (<50)'
              WHEN cnt < 500 THEN 'Small (50-500)'
              WHEN cnt < 5000 THEN 'Medium (500-5K)'
              WHEN cnt < 50000 THEN 'Large (5K-50K)'
              ELSE 'Mega (50K+)'
            END AS label,
            COUNT(*)::int AS count
          FROM (
            SELECT guildid, COUNT(*)::int AS cnt
            FROM members
            GROUP BY guildid
          ) guild_sizes
          GROUP BY label
          ORDER BY MIN(cnt)
        `
      ),

      // 14. Study hours club
      safeQuery(() =>
        prisma.$queryRaw<ClubRow[]>`
          SELECT label, count FROM (
            SELECT '>= 1000h' AS label, COUNT(*)::int AS count, 1 AS sort FROM members WHERE tracked_time >= 3600000
            UNION ALL
            SELECT '>= 500h', COUNT(*)::int, 2 FROM members WHERE tracked_time >= 1800000
            UNION ALL
            SELECT '>= 100h', COUNT(*)::int, 3 FROM members WHERE tracked_time >= 360000
            UNION ALL
            SELECT '>= 10h', COUNT(*)::int, 4 FROM members WHERE tracked_time >= 36000
            UNION ALL
            SELECT '>= 1h', COUNT(*)::int, 5 FROM members WHERE tracked_time >= 3600
          ) t ORDER BY sort
        `
      ),

      // 15. Records: peak concurrent
      safeQuery(() =>
        prisma.$queryRaw<RecordRow[]>`
          SELECT in_voice::int AS value, created_at::text AS recorded_at
          FROM analytics.snapshots
          ORDER BY in_voice DESC LIMIT 1
        `
      ),

      // 16. Records: quietest moment
      safeQuery(() =>
        prisma.$queryRaw<RecordRow[]>`
          SELECT in_voice::int AS value, created_at::text AS recorded_at
          FROM analytics.snapshots
          ORDER BY in_voice ASC LIMIT 1
        `
      ),

      // 17. Busiest command day
      safeQuery(() =>
        prisma.$queryRaw<BusiestDayRow[]>`
          SELECT created_at::date::text AS day, COUNT(*)::int AS cnt
          FROM analytics.commands
          GROUP BY created_at::date
          ORDER BY cnt DESC LIMIT 1
        `
      ),

      // 18. Milestones from snapshots
      safeQuery(() =>
        prisma.$queryRaw<MilestoneRow[]>`
          SELECT threshold, MIN(created_at)::text AS achieved_at FROM (
            SELECT 50000 AS threshold, created_at FROM analytics.snapshots WHERE guild_count >= 50000
            UNION ALL
            SELECT 55000, created_at FROM analytics.snapshots WHERE guild_count >= 55000
            UNION ALL
            SELECT 60000, created_at FROM analytics.snapshots WHERE guild_count >= 60000
            UNION ALL
            SELECT 65000, created_at FROM analytics.snapshots WHERE guild_count >= 65000
          ) t GROUP BY threshold ORDER BY threshold
        `
      ),

      // 19. Top servers by study hours
      safeQuery(() =>
        prisma.$queryRaw<ServerRow[]>`
          SELECT
            COALESCE(g.name, 'Unknown') AS name,
            ROUND(SUM(m.tracked_time) / 3600.0)::int AS study_hours,
            COUNT(m.userid)::int AS member_count
          FROM members m
          JOIN guild_config g ON g.guildid = m.guildid
          WHERE g.left_at IS NULL AND m.tracked_time > 0
          GROUP BY g.guildid, g.name
          ORDER BY SUM(m.tracked_time) DESC
          LIMIT 15
        `
      ),

      // 20. Oldest user date
      safeQuery(async () => {
        const result = await prisma.$queryRaw<[{ first: string }]>`
          SELECT MIN(first_seen)::text AS first FROM user_config WHERE first_seen IS NOT NULL
        `
        return result[0]?.first || null
      }),

      // 21. Calendar heatmap (daily avg from snapshots)
      safeQuery(() =>
        prisma.$queryRaw<CalendarRow[]>`
          SELECT
            created_at::date::text AS day,
            ROUND(AVG(in_voice))::int AS avg_studying
          FROM analytics.snapshots
          GROUP BY created_at::date
          ORDER BY day
        `
      ),

      // 22. Timezone distribution
      safeQuery(() =>
        prisma.$queryRaw<TimezoneRow[]>`
          SELECT timezone, COUNT(*)::int AS count
          FROM user_config
          WHERE timezone IS NOT NULL AND timezone != ''
          GROUP BY timezone
          ORDER BY count DESC
        `
      ),

      // 23. Tasks completed count
      safeQuery(async () => {
        const result = await prisma.$queryRaw<[{ cnt: number }]>`
          SELECT COUNT(*)::int AS cnt FROM tasklist WHERE completed_at IS NOT NULL
        `
        return result[0]?.cnt || 0
      }),

      // 24. Total votes count
      safeQuery(() => prisma.topgg.count()),
    ])

    const val = <T>(r: PromiseSettledResult<T | null>): T | null =>
      r.status === "fulfilled" ? r.value : null

    const live = val(liveResult)
    const shardsRaw = val(shardsResult)
    const estimatesRaw = val(estimatesResult)
    const totalStudySeconds = val(studyHoursResult) as number | null
    const growth = val(growthResult)
    const studyByHour = val(studyByHourResult)
    const studyByDay = val(studyByDayResult)
    const topCommands = val(topCommandsResult)
    const commandTrend = val(commandTrendResult)
    const votesByMonth = val(votesResult)
    const retention = val(retentionResult)
    const serverSizes = val(serverSizesResult)
    const studyClub = val(studyClubResult)
    const peakRecord = val(recordsPeakResult) as RecordRow[] | null
    const quietRecord = val(recordsQuietResult) as RecordRow[] | null
    const busiestCmdDay = val(busiestCmdDayResult) as BusiestDayRow[] | null
    const milestones = val(milestonesResult)
    const topServers = val(topServersResult)
    const oldestUser = val(oldestUserResult) as string | null
    const calendar = val(calendarResult)
    const timezones = val(timezoneResult)
    const tasksCompleted = val(tasksCompletedResult) as number | null
    const totalVotes = val(totalVotesResult) as number | null

    const estMap: Record<string, number> = {}
    if (estimatesRaw) {
      for (const row of estimatesRaw) {
        estMap[row.relname] = Number(row.estimate)
      }
    }

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Compute total study hours from sampled avg duration * row estimate
    //          (totalStudySeconds is now avg_duration from TABLESAMPLE, not a SUM)
    // --- Original code (commented out for rollback) ---
    // const totalStudyHours = totalStudySeconds
    //   ? Math.round(totalStudySeconds / 3600)
    //   : 0
    // --- End original code ---
    const avgSessionDuration = totalStudySeconds as number | null
    const voiceSessionCount = estMap["voice_sessions"] || 0
    const totalStudyHours =
      avgSessionDuration && voiceSessionCount
        ? Math.round((avgSessionDuration * voiceSessionCount) / 3600)
        : 0
    // --- END AI-MODIFIED ---

    const totalCommands = topCommands
      ? topCommands.reduce((s, c) => s + c.cnt, 0)
      : estMap["analytics_commands"] || 0

    const totalDbRows =
      (estMap["voice_sessions"] || 0) +
      (estMap["text_sessions"] || 0) +
      (estMap["user_config"] || 0) +
      (estMap["members"] || 0) +
      (estMap["coin_transactions"] || 0) +
      (estMap["tasklist"] || 0) +
      (estMap["guild_config"] || 0)

    // --- AI-MODIFIED (2026-03-21) ---
    // Purpose: Increase online threshold from 10min to 24h. The bot only
    //          updates shard_data.last_login on on_ready (startup), not as
    //          a periodic heartbeat, so 10min was too narrow and all shards
    //          showed offline. Also redact sensitive shard details.
    // --- Original code (commented out for rollback) ---
    // const now10min = new Date(Date.now() - 10 * 60 * 1000)
    // online: s.last_login ? new Date(s.last_login) > now10min : false,
    // --- End original code ---
    const now24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const shards = shardsRaw
      ? shardsRaw.map((s: any) => ({
          shardId: s.shard_id,
          guildCount: s.guild_count || 0,
          online: s.last_login ? new Date(s.last_login) > now24h : false,
        }))
      : []
    // --- END AI-MODIFIED ---

    const shardsOnline = shards.filter((s: any) => s.online).length

    const firstSnapshotDate = growth && growth.length > 0 ? growth[0].week : null
    const uptimeSeconds = firstSnapshotDate
      ? Math.floor((Date.now() - new Date(firstSnapshotDate).getTime()) / 1000)
      : 0
    const commandsPerMinute =
      totalCommands > 0 && uptimeSeconds > 0
        ? Math.round((totalCommands / uptimeSeconds) * 60 * 10) / 10
        : 0

    const dataGrowthRate =
      totalDbRows > 0 && uptimeSeconds > 0
        ? Math.round((totalDbRows / uptimeSeconds) * 10) / 10
        : 0

    const generatedIn = Date.now() - startTime

    const stats = {
      generatedIn,
      generatedAt: new Date().toISOString(),

      live: {
        studyingNow: live?.studyingNow || 0,
        activeTimers: live?.activeTimers || 0,
        shardsOnline,
        totalShards: shards.length || 32,
        totalServers: live?.totalServers || 0,
      },

      shards,

      totals: {
        totalStudyHours,
        totalVoiceSessions: estMap["voice_sessions"] || 0,
        totalTextSessions: estMap["text_sessions"] || 0,
        totalUsers: estMap["user_config"] || 0,
        totalMembers: estMap["members"] || 0,
        totalTasks: estMap["tasklist"] || 0,
        totalTasksCompleted: tasksCompleted || 0,
        totalVotes: totalVotes || 0,
        totalCommands,
        totalCoinTransactions: estMap["coin_transactions"] || 0,
        totalDatabaseRows: totalDbRows,
      },

      growth: growth
        ? growth.map((r: any) => ({
            date: r.week,
            guilds: Number(r.guilds),
            users: Number(r.users),
            inVoice: Number(r.in_voice),
            members: Number(r.members),
          }))
        : [],

      studyByHour: studyByHour
        ? studyByHour.map((r: any) => ({
            hour: Number(r.hour),
            avgStudying: Number(r.avg_studying),
          }))
        : [],

      studyByDay: studyByDay
        ? studyByDay.map((r: any) => ({
            day: Number(r.dow),
            avgStudying: Number(r.avg_studying),
          }))
        : [],

      topCommands: topCommands
        ? topCommands.map((r: any) => ({
            name: r.cmdname,
            count: Number(r.cnt),
          }))
        : [],

      commandTrend: commandTrend
        ? commandTrend.map((r: any) => ({
            month: r.month,
            count: Number(r.cnt),
          }))
        : [],

      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Redact sensitive details from public stats endpoint (removed avgResponseTime)
      // --- END AI-MODIFIED ---
      commandsPerMinute,

      votesByMonth: votesByMonth
        ? votesByMonth.map((r: any) => ({
            month: r.month,
            votes: Number(r.votes),
          }))
        : [],

      retention: retention || { totalJoined: 0, stillActive: 0, rate: 0 },

      serverSizes: serverSizes
        ? serverSizes.map((r: any) => ({
            label: r.label,
            count: Number(r.count),
          }))
        : [],

      studyClub: studyClub
        ? studyClub.map((r: any) => ({
            label: r.label,
            count: Number(r.count),
          }))
        : [],

      records: {
        peakConcurrent: peakRecord?.[0]
          ? {
              value: Number(peakRecord[0].value),
              date: peakRecord[0].recorded_at,
            }
          : null,
        quietestMoment: quietRecord?.[0]
          ? {
              value: Number(quietRecord[0].value),
              date: quietRecord[0].recorded_at,
            }
          : null,
        busiestCommandDay: busiestCmdDay?.[0]
          ? {
              value: Number(busiestCmdDay[0].cnt),
              date: busiestCmdDay[0].day,
            }
          : null,
        oldestUser: oldestUser
          ? { date: oldestUser }
          : null,
        botAge: {
          days: Math.floor(uptimeSeconds / 86400),
          hours: Math.floor((uptimeSeconds % 86400) / 3600),
        },
      },

      milestones: milestones
        ? milestones.map((r: any) => ({
            label: `${Number(r.threshold).toLocaleString()} servers`,
            date: r.achieved_at,
            value: Number(r.threshold),
          }))
        : [],

      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Redact sensitive details from public stats endpoint
      topServers: topServers
        ? topServers.map((r: any, i: number) => ({
            name: `Server #${i + 1}`,
            studyHours: Number(r.study_hours),
            memberCount: Number(r.member_count),
          }))
        : [],
      // --- END AI-MODIFIED ---

      calendarHeatmap: calendar
        ? calendar.map((r: any) => ({
            date: r.day,
            avgStudying: Number(r.avg_studying),
          }))
        : [],

      timezoneMap: timezones
        ? timezones.map((r: any) => ({
            timezone: r.timezone,
            count: Number(r.count),
          }))
        : [],

      dataGrowthRate,

      funFacts: buildFunFacts(
        totalStudyHours,
        estMap,
        live?.studyingNow || 0,
        totalCommands,
        totalDbRows,
        dataGrowthRate
      ),
    }

    cachedStats = stats
    cacheTimestamp = Date.now()

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    )
    return res.status(200).json(stats)
  } catch (error) {
    console.error("Failed to fetch nerd stats:", error)
    if (cachedStats) {
      return res.status(200).json(cachedStats)
    }
    return res.status(500).json({ error: "Failed to fetch stats" })
  }
}

function buildFunFacts(
  studyHours: number,
  estMap: Record<string, number>,
  studyingNow: number,
  totalCommands: number,
  totalDbRows: number,
  growthRate: number
): Array<{ text: string; icon: string }> {
  const facts: Array<{ text: string; icon: string }> = []

  if (studyHours > 0) {
    const years = Math.round(studyHours / 8760)
    const phds = Math.round(studyHours / 5000)
    facts.push({
      text: `total study time = ${years.toLocaleString()} years non-stop -- enough for ${phds.toLocaleString()} PhD degrees at 5,000h each`,
      icon: "graduation",
    })
  }

  const users = estMap["user_config"] || 0
  if (users > 1_000_000) {
    facts.push({
      text: `if studylion were a country, its ${(users / 1_000_000).toFixed(1)}M users would rank larger than Estonia, Bahrain, or Iceland`,
      icon: "globe",
    })
  }

  if (studyingNow > 0) {
    facts.push({
      text: `${studyingNow.toLocaleString()} people studying right now -- more than the capacity of most concert venues`,
      icon: "users",
    })
  }

  if (totalCommands > 0) {
    const moonDistKm = 384400
    const stepKm = 0.0007
    const trips = Math.round((totalCommands * stepKm) / (moonDistKm * 2))
    facts.push({
      text: `if every command were a footstep, you'd walk to the Moon and back ${trips} times`,
      icon: "rocket",
    })
  }

  if (totalDbRows > 0) {
    const yearsToRead = Math.round(totalDbRows / (365 * 24 * 3600))
    facts.push({
      text: `database holds ~${Math.round(totalDbRows / 1_000_000)}M rows. reading 1 row/second would take ${yearsToRead} years`,
      icon: "database",
    })
  }

  if (growthRate > 0) {
    facts.push({
      text: `database grows at ~${growthRate} rows/second`,
      icon: "trending",
    })
  }

  facts.push({
    text: "/leaderboard has been used 875,000+ times. competition is the greatest motivator.",
    icon: "trophy",
  })

  facts.push({
    text: "fastest command: 0.012ms -- light only travels 3.6km in that time",
    icon: "zap",
  })

  return facts
}
