// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19  (concurrency-hardened 2026-05-21)
// Purpose: The lone ingest endpoint for the Anki addon. Accepts
//          batches of flashcard reviews, deduplicates them,
//          rate-limits abuse, computes rewards against the
//          existing daily caps, and writes everything in one
//          transactional pass:
//
//            - anki_review_events (one row per ACCEPTED review)
//            - lg_gold_transactions (one ANKI_REVIEW row per batch)
//            - lg_pets.level / .xp / .food / .bath
//            - anki_batch_idempotency (idempotency-key response cache)
//
//          ECONOMY SAFETY (the load-bearing bit): the daily gold
//          cap, the 24h diminishing-returns count, the per-device
//          rate limit, and the pet-care refill count are ALL read
//          INSIDE the transaction under a per-user Postgres advisory
//          lock (pg_advisory_xact_lock). Without that, concurrent
//          batches each read a stale "~0 earned today" and each
//          credit up to the full cap — firing N parallel requests
//          would mint N x the daily cap. The advisory lock
//          serializes a user's batches so every cap/counter read is
//          consistent with prior committed batches.
//
//          The bot is NOT in this loop. It picks up the new rows
//          automatically via its existing leaderboard / balance
//          queries.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth } from "@/lib/anki/requireAuth"
import {
  computeAnkiReviewId,
  type AnkiScope,
} from "@/lib/anki/auth"
import {
  computeBatchRewards,
  applyPetXp,
  moodMultiplierForNeeds,
  LEVEL_UP_GOLD_BONUS,
  DAILY_GOLD_CAP,
  tierFromIsPremium,
  type Tier,
} from "@/lib/anki/rewards"
import { isLionheartActive } from "../auth/ios/exchange"

const REQUIRED_SCOPE: AnkiScope = "anki.review.write"

const MAX_REVIEWS_PER_BATCH = 200
const MAX_BODY_BYTES = 1_000_000
const MAX_AGE_DAYS = 14
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000
const RATE_LIMIT_PER_MINUTE = 240
const TIME_MS_MIN = 500
const TIME_MS_MAX = 30_000
const NEW_ACCOUNT_GRACE_DAYS = 7
const NEW_ACCOUNT_GRACE_THRESHOLD_HOURS = 24

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ReviewItem {
  card_id?: number | string
  deck_id?: number | string | null
  ease?: number
  time_ms?: number
  reviewed_at?: string
  type?: "review" | "cram" | "filtered"
}

interface BatchBody {
  batch_id?: string
  client_submitted_at?: string
  anki_user_guid?: string
  reviews?: ReviewItem[]
}

interface NormalizedReview {
  cardId: bigint
  deckId: bigint | null
  ease: number
  timeMs: number
  reviewedAt: Date
  reviewIdHex: string
  reviewIdBytes: Buffer
}

function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message: string,
  extra?: Record<string, unknown>
) {
  return res.status(status).json({ error, message, ...extra })
}

function toBigIntOrNull(v: unknown): bigint | null {
  if (v === null || v === undefined) return null
  try {
    if (typeof v === "bigint") return v
    if (typeof v === "number") {
      if (!Number.isFinite(v)) return null
      return BigInt(Math.floor(v))
    }
    if (typeof v === "string") {
      if (!/^-?\d+$/.test(v)) return null
      return BigInt(v)
    }
  } catch {
    return null
  }
  return null
}

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Walk through the body's reviews and produce normalized,
 * validated entries. Drops invalid rows but doesn't 400 the
 * whole batch (consistent with the plan's "filter, don't reject"
 * stance). Returns the kept entries + count of rejected ones.
 */
function normalizeReviews(
  body: BatchBody,
  ankiUserGuid: string,
  discordId: string,
  now: Date
): { kept: NormalizedReview[]; rejected: number } {
  const out: NormalizedReview[] = []
  let rejected = 0
  const oldestAllowed = new Date(now.getTime() - MAX_AGE_DAYS * 86400_000)
  const newestAllowed = new Date(now.getTime() + MAX_FUTURE_SKEW_MS)
  const seenInBatch = new Set<string>()

  for (const r of body.reviews ?? []) {
    if (!r || typeof r !== "object") {
      rejected++
      continue
    }
    const ease = typeof r.ease === "number" ? Math.floor(r.ease) : NaN
    if (!Number.isFinite(ease) || ease < 1 || ease > 4) {
      rejected++
      continue
    }
    const cardId = toBigIntOrNull(r.card_id)
    if (!cardId || cardId <= BigInt(0)) {
      rejected++
      continue
    }
    const deckId = r.deck_id !== undefined ? toBigIntOrNull(r.deck_id) : null
    const timeMs = clamp(
      typeof r.time_ms === "number" ? Math.floor(r.time_ms) : 0,
      TIME_MS_MIN,
      TIME_MS_MAX
    )
    if (typeof r.reviewed_at !== "string") {
      rejected++
      continue
    }
    const reviewedAt = new Date(r.reviewed_at)
    if (
      Number.isNaN(reviewedAt.getTime()) ||
      reviewedAt < oldestAllowed ||
      reviewedAt > newestAllowed
    ) {
      rejected++
      continue
    }
    if (r.type && !["review", "cram", "filtered"].includes(r.type)) {
      rejected++
      continue
    }

    const reviewedAtUnixSec = Math.floor(reviewedAt.getTime() / 1000)
    const reviewIdBytes = computeAnkiReviewId({
      discordId,
      ankiUserGuid,
      cardId,
      reviewedAtUnixSeconds: reviewedAtUnixSec,
      ease,
    })
    const reviewIdHex = reviewIdBytes.toString("hex")

    // Per-batch dedup (in addition to the server-side ON CONFLICT
    // dedup). Common case: addon's local queue has a duplicate.
    if (seenInBatch.has(reviewIdHex)) {
      rejected++
      continue
    }
    seenInBatch.add(reviewIdHex)

    out.push({
      cardId,
      deckId,
      ease,
      timeMs,
      reviewedAt,
      reviewIdHex,
      reviewIdBytes,
    })
  }
  return { kept: out, rejected }
}

/**
 * Per-device rate limit (sliding 60s window) — cheap PRE-transaction
 * early reject for the common case. The authoritative check runs
 * again INSIDE the per-user advisory lock (see the transaction),
 * because this read-before-write check is racy on its own.
 */
async function getRateLimitCount(deviceId: string): Promise<number> {
  try {
    const since = new Date(Date.now() - 60_000)
    return await prisma.anki_review_events.count({
      where: { device_id: deviceId, ingested_at: { gte: since } },
    })
  } catch {
    // On DB blip, assume zero (fail open) — better to accept legit
    // traffic than block during transient issues. The in-lock
    // re-check + caps still bound abuse.
    return 0
  }
}

/**
 * Detect new accounts that should be on the 7-day 10% rate grace
 * period (kills mass-account farming). Not race-sensitive.
 */
async function isInGracePeriod(userId: bigint, now: Date): Promise<boolean> {
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { first_seen: true },
    })
    if (!cfg?.first_seen) return false
    const accountAgeMs = now.getTime() - cfg.first_seen.getTime()
    const sevenDays = NEW_ACCOUNT_GRACE_DAYS * 86400_000
    if (accountAgeMs > sevenDays) return false
    const oneDay = NEW_ACCOUNT_GRACE_THRESHOLD_HOURS * 3600_000
    return accountAgeMs <= oneDay
  } catch {
    return false
  }
}

interface ReviewsResponseBody {
  accepted: number
  deduped: number
  rejected: number
  rewards: {
    gold: number
    xp: number
    pet_care: { food: number; bath: number; sleep: number }
    levels_gained: number
    new_level: number | null
  }
  daily_progress: {
    gold: { earned: number; cap: number }
    cards_24h: number
  }
  throttle: string
  warnings: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return sendError(res, 405, "method_not_allowed", "POST only")
  }

  const lenHdr = req.headers["content-length"]
  const len = lenHdr ? parseInt(lenHdr as string, 10) : 0
  if (len > MAX_BODY_BYTES) {
    return sendError(res, 413, "body_too_large", `Body must be ≤ ${MAX_BODY_BYTES} bytes`)
  }

  const ctx = await requireAnkiAuth(req, res, REQUIRED_SCOPE)
  if (!ctx) return // response already sent

  // Idempotency key parse.
  const idempHeader =
    typeof req.headers["idempotency-key"] === "string"
      ? (req.headers["idempotency-key"] as string).trim()
      : null
  if (!idempHeader) {
    return sendError(res, 400, "missing_idempotency_key", "Idempotency-Key header is required")
  }
  if (!UUID_RE.test(idempHeader)) {
    return sendError(res, 400, "bad_idempotency_key", "Idempotency-Key must be a UUID v4")
  }

  // Idempotency cache hit.
  try {
    const cached = await prisma.anki_batch_idempotency.findUnique({
      where: {
        device_id_idempotency_key: {
          device_id: ctx.deviceId,
          idempotency_key: idempHeader,
        },
      },
    })
    if (cached) {
      res.setHeader("X-Cache-Replay", "hit")
      return res.status(cached.status_code).json(cached.response_body)
    }
  } catch (err) {
    console.warn("[anki/reviews] idempotency lookup failed:", err)
  }

  // Body parse + shape checks.
  const body = (req.body ?? {}) as BatchBody
  if (!body.batch_id || !UUID_RE.test(body.batch_id)) {
    return sendError(res, 400, "bad_batch_id", "batch_id must be a UUID v4")
  }
  if (typeof body.anki_user_guid !== "string" || body.anki_user_guid.length === 0 || body.anki_user_guid.length > 128) {
    return sendError(res, 400, "bad_anki_user_guid", "anki_user_guid must be a non-empty string ≤ 128 chars")
  }
  if (!Array.isArray(body.reviews)) {
    return sendError(res, 400, "bad_reviews", "reviews must be an array")
  }
  if (body.reviews.length > MAX_REVIEWS_PER_BATCH) {
    return sendError(res, 400, "batch_too_large", `reviews array must contain ≤ ${MAX_REVIEWS_PER_BATCH} items`)
  }

  const now = new Date()

  // Cheap pre-transaction rate-limit reject (best-effort; the
  // authoritative check is inside the advisory lock below).
  const recentCount = await getRateLimitCount(ctx.deviceId)
  if (recentCount + body.reviews.length > RATE_LIMIT_PER_MINUTE) {
    res.setHeader("Retry-After", "60")
    return sendError(res, 429, "rate_limited", `Per-device rate limit: ${RATE_LIMIT_PER_MINUTE} reviews/min`)
  }

  // Normalize + dedup-within-batch.
  const { kept, rejected } = normalizeReviews(body, body.anki_user_guid, ctx.discordId, now)

  if (kept.length === 0) {
    const response: ReviewsResponseBody = {
      accepted: 0,
      deduped: 0,
      rejected,
      rewards: {
        gold: 0,
        xp: 0,
        pet_care: { food: 0, bath: 0, sleep: 0 },
        levels_gained: 0,
        new_level: null,
      },
      daily_progress: { gold: { earned: 0, cap: DAILY_GOLD_CAP }, cards_24h: 0 },
      throttle: "linear",
      warnings: rejected > 0 ? ["all_reviews_rejected"] : [],
    }
    await cacheIdempotencyResponse(ctx.deviceId, idempHeader, 200, response)
    return res.status(200).json(response)
  }

  // Anki is fully GLOBAL — reviews credit the user's pet + gold +
  // global review count (guildid=0 sentinel). Server premium (a
  // per-guild boost) doesn't apply; LionHeart tier (user-level) does.
  const ANKI_GLOBAL_GUILDID = BigInt(0)

  // Tier + grace are NOT race-sensitive (stable across a burst), so
  // read them outside the lock. Everything that feeds a cap/limit is
  // read INSIDE the lock below.
  const [isPremiumUser, graceMode] = await Promise.all([
    isLionheartActive(ctx.discordId).catch(() => false),
    isInGracePeriod(ctx.userId, now),
  ])
  const tier: Tier = tierFromIsPremium(isPremiumUser)

  // Per-user advisory lock key, namespaced (top byte 0x5A) away from
  // any raw-userid locks so it can't collide with the bot. Low 56
  // bits carry the snowflake — collisions only between users sharing
  // those bits (effectively never) and only cost brief serialization.
  const lockKey = BigInt.asIntN(
    64,
    (BigInt(0x5a) << BigInt(56)) | (ctx.userId & ((BigInt(1) << BigInt(56)) - BigInt(1)))
  )

  let acceptedCount = 0
  let dedupedCount = 0
  let goldCredited = 0
  let xpCredited = 0
  let levelsGained = 0
  let newLevel: number | null = null
  let foodRefillFinal = 0
  let bathRefillFinal = 0
  let throttleStr = "linear"
  let capHit = false
  let goldTodayResp = 0
  let cards24hResp = 0
  let rateLimited = false
  let concurrentConflict = false

  try {
    await prisma.$transaction(
      async (tx) => {
        // 1. Serialize this user's review batches. NON-blocking
        //    try-lock so an attacker firing parallel batches can't
        //    pile up in lock-waits and exhaust the connection pool —
        //    a losing batch bails immediately and the addon retries.
        const lockRows = await tx.$queryRaw<Array<{ locked: boolean }>>`
          SELECT pg_try_advisory_xact_lock(${lockKey}::bigint) AS locked`
        if (!lockRows[0]?.locked) {
          concurrentConflict = true
          return
        }

        // 2. Lock the pet row: fresh food/bath/level/xp, and blocks
        //    the bot's concurrent voice/text pet writes.
        const petRows = await tx.$queryRaw<
          Array<{ level: number; xp: bigint; food: number; bath: number; sleep: number }>
        >`SELECT level, xp, food, bath, sleep FROM lg_pets WHERE userid = ${ctx.userId} FOR UPDATE`
        const pet = petRows[0] ?? null

        // 3. Cap/limit counters — now race-safe under the lock.
        const since24h = new Date(now.getTime() - 24 * 3600_000)
        const todayStart = utcDayStart(now)
        const since60s = new Date(now.getTime() - 60_000)
        const [cards24h, cardsTodayUtc, goldAgg, recentDeviceCount] = await Promise.all([
          tx.anki_review_events.count({ where: { userid: ctx.userId, reviewed_at: { gte: since24h } } }),
          tx.anki_review_events.count({ where: { userid: ctx.userId, reviewed_at: { gte: todayStart } } }),
          tx.lg_gold_transactions.aggregate({
            where: { to_account: ctx.userId, created_at: { gte: todayStart }, amount: { gt: 0 } },
            _sum: { amount: true },
          }),
          tx.anki_review_events.count({ where: { device_id: ctx.deviceId, ingested_at: { gte: since60s } } }),
        ])
        const goldToday = Number(goldAgg._sum.amount || 0)
        goldTodayResp = goldToday
        cards24hResp = cards24h

        // 4. Authoritative rate-limit re-check (accurate under the lock).
        if (recentDeviceCount + kept.length > RATE_LIMIT_PER_MINUTE) {
          rateLimited = true
          return
        }

        // 5. Rewards with the accurate counters.
        const mood = pet ? moodMultiplierForNeeds(pet.food, pet.bath, pet.sleep) : 1.0
        const rewards = computeBatchRewards({
          cardCount: kept.length,
          userTier: tier,
          serverPremium: false,
          voteGoldBoost: 1.0,
          moodMultiplier: mood,
          cardsTodayBefore: cards24h,
          goldEarnedTodayBefore: goldToday,
          xpEarnedTodayBefore: 0,
          cardsThisSessionBefore: cardsTodayUtc,
          refillsGivenThisSessionBefore: Math.min(Math.floor(cardsTodayUtc / 50), 6),
          graceMode,
        })
        throttleStr = rewards.throttle
        capHit = rewards.capHit

        const currentFood = pet?.food ?? 0
        const currentBath = pet?.bath ?? 0
        const newFood = Math.min(8, currentFood + rewards.foodRefill)
        const newBath = Math.min(8, currentBath + rewards.bathRefill)
        const actualFoodRefill = newFood - currentFood
        const actualBathRefill = newBath - currentBath

        // 6. Insert events (server-recomputed review_id PK dedups).
        const insertResult = await tx.anki_review_events.createMany({
          data: kept.map((r) => ({
            review_id: r.reviewIdBytes,
            userid: ctx.userId,
            device_id: ctx.deviceId,
            guildid: ANKI_GLOBAL_GUILDID,
            anki_user_guid: body.anki_user_guid!,
            card_id: r.cardId,
            deck_id: r.deckId,
            ease: r.ease,
            time_ms: r.timeMs,
            reviewed_at: r.reviewedAt,
            reward_gold: 0,
            reward_xp: 0,
            was_throttled: rewards.throttle !== "linear",
          })),
          skipDuplicates: true,
        })
        acceptedCount = insertResult.count
        dedupedCount = kept.length - insertResult.count
        if (insertResult.count === 0) return

        // Pro-rate by the fraction actually accepted (some may dedup).
        const acceptedFraction = insertResult.count / kept.length
        const baseGold = Math.floor(rewards.gold * acceptedFraction)
        xpCredited = Math.floor(rewards.xp * acceptedFraction)

        // 7. Pet XP + level-up + care (pet already locked above).
        let levelUpBonusGold = 0
        if (xpCredited > 0 && pet) {
          const { newLevel: nl, remainingXp, levelsGained: lg } = applyPetXp(
            Number(pet.level) || 1,
            Number(pet.xp) || 0,
            xpCredited
          )
          levelsGained = lg
          newLevel = nl
          levelUpBonusGold = lg * LEVEL_UP_GOLD_BONUS
          await tx.lg_pets.update({
            where: { userid: ctx.userId },
            data: { level: nl, xp: BigInt(remainingXp), food: newFood, bath: newBath },
          })
          foodRefillFinal = actualFoodRefill
          bathRefillFinal = actualBathRefill
        } else if (pet && (actualFoodRefill > 0 || actualBathRefill > 0)) {
          await tx.lg_pets.update({
            where: { userid: ctx.userId },
            data: { food: newFood, bath: newBath },
          })
          foodRefillFinal = actualFoodRefill
          bathRefillFinal = actualBathRefill
        }

        // 8. Gold balance + ledger (mirrors award_gold).
        goldCredited = baseGold + levelUpBonusGold
        if (goldCredited > 0) {
          await tx.user_config.update({
            where: { userid: ctx.userId },
            data: { gold: { increment: goldCredited } },
          })
          if (baseGold > 0) {
            await tx.lg_gold_transactions.create({
              data: {
                transaction_type: "ANKI_REVIEW",
                actorid: ctx.userId,
                to_account: ctx.userId,
                amount: baseGold,
                description: `Anki review batch: ${insertResult.count} cards`,
                reference: `anki:batch:${body.batch_id}`,
              },
            })
          }
          if (levelUpBonusGold > 0) {
            await tx.lg_gold_transactions.create({
              data: {
                transaction_type: "LEVEL_UP",
                actorid: ctx.userId,
                to_account: ctx.userId,
                amount: levelUpBonusGold,
                description: `Anki level up to ${newLevel}`,
              },
            })
          }
        }
      },
      { maxWait: 8000, timeout: 15000 }
    )
  } catch (err) {
    console.error("[anki/reviews] transaction failed:", err)
    return sendError(res, 503, "db_unavailable", "Could not persist reviews — please retry")
  }

  if (concurrentConflict) {
    res.setHeader("Retry-After", "2")
    return sendError(
      res,
      429,
      "concurrent_batch",
      "Another review batch for this account is being processed — retry shortly"
    )
  }

  if (rateLimited) {
    res.setHeader("Retry-After", "60")
    return sendError(res, 429, "rate_limited", `Per-device rate limit: ${RATE_LIMIT_PER_MINUTE} reviews/min`)
  }

  const warnings: string[] = []
  if (capHit) warnings.push("daily_cap_hit")
  if (graceMode) warnings.push("new_account_grace_active")

  const response: ReviewsResponseBody = {
    accepted: acceptedCount,
    deduped: dedupedCount,
    rejected,
    rewards: {
      gold: goldCredited,
      xp: xpCredited,
      pet_care: { food: foodRefillFinal, bath: bathRefillFinal, sleep: 0 },
      levels_gained: levelsGained,
      new_level: newLevel,
    },
    daily_progress: {
      gold: { earned: goldTodayResp + goldCredited, cap: DAILY_GOLD_CAP },
      cards_24h: cards24hResp + acceptedCount,
    },
    throttle: throttleStr,
    warnings,
  }

  await cacheIdempotencyResponse(ctx.deviceId, idempHeader, 200, response)
  return res.status(200).json(response)
}

async function cacheIdempotencyResponse(
  deviceId: string,
  idempotencyKey: string,
  status: number,
  body: ReviewsResponseBody
) {
  try {
    await prisma.anki_batch_idempotency.create({
      data: {
        device_id: deviceId,
        idempotency_key: idempotencyKey,
        response_body: body as unknown as object,
        status_code: status,
      },
    })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === "P2002") return
    console.warn("[anki/reviews] idempotency cache write failed:", err)
  }
}
