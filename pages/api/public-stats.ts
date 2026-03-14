// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Public stats API for homepage - returns live bot statistics
//          with in-memory caching to avoid excessive DB queries
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
    const [
      voiceSessionCount,
      textSessionCount,
      userCount,
      taskCount,
      studyingNowCount,
      timerCount,
      guildCount,
    ] = await Promise.all([
      prisma.voice_sessions.count(),
      prisma.text_sessions.count(),
      prisma.user_config.count(),
      prisma.tasklist.count({ where: { deleted_at: null } }),
      prisma.voice_sessions_ongoing.count(),
      prisma.timers.count(),
      prisma.guild_config.count({ where: { left_at: null } }),
    ]);

    const stats: PublicStats = {
      sessions: voiceSessionCount + textSessionCount,
      users: userCount,
      tasks: taskCount,
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
