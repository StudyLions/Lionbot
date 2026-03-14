// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Public stats API for homepage - returns live bot statistics
//          with in-memory caching to avoid excessive DB queries.
//          Uses pg_class.reltuples for large tables (instant) and
//          exact counts only for small real-time tables.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/prisma";

interface PublicStats {
  guilds: number;
  sessions: number;
  users: number;
  tasks: number;
  studyingNow: number;
  activeTimers: number;
}

interface RowEstimate {
  relname: string;
  estimate: number;
}

let cachedStats: PublicStats | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 120_000; // 2 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const now = Date.now();
  if (cachedStats && now - cacheTimestamp < CACHE_TTL_MS) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=300"
    );
    return res.status(200).json(cachedStats);
  }

  try {
    const [estimates, studyingNowCount, timerCount, guildCount] =
      await Promise.all([
        prisma.$queryRaw<RowEstimate[]>`
          SELECT relname, reltuples::bigint AS estimate
          FROM pg_class
          WHERE relname IN ('voice_sessions', 'text_sessions', 'user_config', 'tasklist')
        `,
        prisma.voice_sessions_ongoing.count(),
        prisma.timers.count(),
        prisma.guild_config.count({ where: { left_at: null } }),
      ]);

    const estMap: Record<string, number> = {};
    for (const row of estimates) {
      estMap[row.relname] = Number(row.estimate);
    }

    const stats: PublicStats = {
      sessions:
        (estMap["voice_sessions"] || 0) + (estMap["text_sessions"] || 0),
      users: estMap["user_config"] || 0,
      tasks: estMap["tasklist"] || 0,
      studyingNow: studyingNowCount,
      activeTimers: timerCount,
      guilds: guildCount,
    };

    cachedStats = stats;
    cacheTimestamp = now;

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=300"
    );
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to fetch public stats:", error);

    if (cachedStats) {
      return res.status(200).json(cachedStats);
    }
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
