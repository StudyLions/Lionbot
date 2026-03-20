// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Simple in-memory per-user rate limiter for marketplace
//          API endpoints. Per-instance on Vercel serverless but
//          still provides meaningful protection against rapid-fire
//          requests within the same instance lifecycle.
// ============================================================

const rateLimitMap = new Map<string, number>()

export function checkRateLimit(key: string, windowMs: number): boolean {
  const now = Date.now()
  const lastAction = rateLimitMap.get(key)
  if (lastAction !== undefined && now - lastAction < windowMs) return false
  rateLimitMap.set(key, now)
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((v, k) => {
      if (now - v > 60000) rateLimitMap.delete(k)
    })
  }
  return true
}
