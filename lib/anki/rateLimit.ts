// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Lightweight per-user, per-endpoint rate limiter for the
//          public Anki read endpoints (stats / leaderboard / farm /
//          pet-portrait / farm-portrait). These endpoints run
//          relatively expensive work (groupBy scans, sharp image
//          composition) and are about to become publicly discoverable,
//          so a hammering client could exhaust DB/CPU. This caps the
//          per-(user,endpoint) request rate as a backstop on top of the
//          existing response caches.
//
//          IMPORTANT — best-effort only: the bucket map is in-memory and
//          therefore PER Vercel lambda instance (and reset on cold
//          start). It bounds single-instance abuse, not a distributed
//          flood. If real abuse appears, move this to a shared store
//          (Upstash/Redis) keyed the same way. The limits are tuned far
//          above legitimate use (the addon polls ~once / 120s), so a
//          normal user / the dashboard will never hit them.
// ============================================================

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 50_000

// Default: 30 requests per 10s per (user, endpoint) per instance.
// Legit addon traffic is ~1 req / 120s; the dashboard a handful on load.
const DEFAULT_MAX = 30
const DEFAULT_WINDOW_MS = 10_000

export interface RateLimitResult {
  ok: boolean
  /** Seconds the client should wait before retrying (for Retry-After). */
  retryAfter: number
}

/**
 * Fixed-window limiter keyed by `${userId}:${endpoint}`. Returns
 * `{ ok: false, retryAfter }` once the window budget is exceeded.
 */
export function ankiRateLimit(
  userId: bigint,
  endpoint: string,
  max: number = DEFAULT_MAX,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const key = `${userId.toString()}:${endpoint}`
  const now = Date.now()
  let b = buckets.get(key)
  if (!b || now >= b.resetAt) {
    if (!b && buckets.size >= MAX_KEYS) {
      // Map preserves insertion order — drop the oldest key.
      const oldest = buckets.keys().next().value
      if (oldest !== undefined) buckets.delete(oldest)
    }
    b = { count: 0, resetAt: now + windowMs }
    buckets.set(key, b)
  }
  b.count++
  if (b.count > max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfter: 0 }
}
