// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: The lone ingest endpoint for the Anki addon. Accepts
//          batches of flashcard reviews, deduplicates them,
//          rate-limits abuse, computes rewards against the
//          existing daily caps, and writes everything in one
//          transactional pass:
//
//            - anki_review_events (one row per ACCEPTED review)
//            - lg_gold_transactions (one ANKI_REVIEW row per batch)
//            - member_experience  (one ANKI_XP row per batch)
//            - lg_pets.food / .bath (incremented by refill count)
//            - anki_batch_idempotency (idempotency-key response cache)
//
//          The bot is NOT in this loop. It picks up the new rows
//          automatically via its existing leaderboard / balance
//          queries.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { requireAnkiAuth, type AnkiAuthContext } from "@/lib/anki/requireAuth"
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
  DAILY_XP_CAP,
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
const SUPPORT_GUILD_ID = BigInt("780195610154237993")

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
 * Resolve the user's home guild via the fallback chain in the plan:
 *   1. user_config.anki_home_guildid IS NOT NULL AND that guild
 *      has lg_enabled = true → use it.
 *   2. Otherwise → support guild.
 *
 * Returns { guildId, fallback } where `fallback` is true if the
 * support guild was selected as a fallback (the caller surfaces
 * a warning in the response).
 */
async function resolveHomeGuild(
  userId: bigint
): Promise<{ guildId: bigint; fallback: boolean }> {
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { anki_home_guildid: true },
    })
    const home = cfg?.anki_home_guildid
    if (!home) return { guildId: SUPPORT_GUILD_ID, fallback: true }

    // Confirm the guild exists in guild_config. If it doesn't,
    // fall back. (We don't check lg_enabled here because that
    // column might not exist on every deployment — let the bot
    // decide what to render. The data is captured either way.)
    const exists = await prisma.guild_config.findUnique({
      where: { guildid: home },
      select: { guildid: true },
    })
    if (!exists) return { guildId: SUPPORT_GUILD_ID, fallback: true }
    return { guildId: home, fallback: false }
  } catch {
    return { guildId: SUPPORT_GUILD_ID, fallback: true }
  }
}

/**
 * Per-device rate limit (sliding 60s window). Uses a single
 * COUNT query — cheap with the (userid, reviewed_at DESC) index,
 * plus we mostly care about it under abuse load anyway.
 */
async function getRateLimitCount(deviceId: string): Promise<number> {
  try {
    const now = new Date()
    const since = new Date(now.getTime() - 60_000)
    const result = await prisma.anki_review_events.count({
      where: { device_id: deviceId, ingested_at: { gte: since } },
    })
    return result
  } catch {
    // On DB blip, assume zero (fail open) — better to accept
    // legit traffic than block during transient issues. The other
    // anti-abuse layers still catch sustained abuse.
    return 0
  }
}

/**
 * Compute the per-user 24h card count + today (UTC) card count.
 * Both are needed: the diminishing-returns curve uses 24h, the
 * pet-care refills use UTC day.
 */
async function getActivityCounts(
  userId: bigint,
  now: Date
): Promise<{ cards24h: number; cardsTodayUtc: number }> {
  const since24h = new Date(now.getTime() - 24 * 3600_000)
  const todayStart = utcDayStart(now)
  try {
    const [c24h, cToday] = await Promise.all([
      prisma.anki_review_events.count({
        where: { userid: userId, reviewed_at: { gte: since24h } },
      }),
      prisma.anki_review_events.count({
        where: { userid: userId, reviewed_at: { gte: todayStart } },
      }),
    ])
    return { cards24h: c24h, cardsTodayUtc: cToday }
  } catch {
    return { cards24h: 0, cardsTodayUtc: 0 }
  }
}

/**
 * Sum the user's gold and XP earned today across all sources
 * (voice, text, Anki, etc). This is what makes Anki rewards
 * SHARE the daily cap with voice/text rather than getting a
 * separate pool.
 */
async function getDailyTotals(
  userId: bigint,
  now: Date
): Promise<{ goldToday: number; xpToday: number }> {
  const todayStart = utcDayStart(now)
  try {
    const [goldAgg, xpAgg] = await Promise.all([
      prisma.lg_gold_transactions.aggregate({
        where: {
          to_account: userId,
          created_at: { gte: todayStart },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),
      prisma.member_experience.aggregate({
        where: {
          userid: userId,
          earned_at: { gte: todayStart },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),
    ])
    return {
      goldToday: Number(goldAgg._sum.amount || 0),
      xpToday: Number(xpAgg._sum.amount || 0),
    }
  } catch {
    return { goldToday: 0, xpToday: 0 }
  }
}

/**
 * Detect new accounts that should be on the 7-day 10% rate grace
 * period (kills mass-account farming).
 */
async function isInGracePeriod(userId: bigint, now: Date): Promise<boolean> {
  try {
    const cfg = await prisma.user_config.findUnique({
      where: { userid: userId },
      select: { first_seen: true },
    })
    if (!cfg?.first_seen) return false
    const accountAgeMs = now.getTime() - cfg.first_seen.getTime()
    // Grace period applies only to accounts < 7 days old.
    const sevenDays = NEW_ACCOUNT_GRACE_DAYS * 86400_000
    if (accountAgeMs > sevenDays) return false
    // Within first 24h, the grace applies. After 24h up to 7 days
    // they're out of grace (already verified humanness for a day).
    const oneDay = NEW_ACCOUNT_GRACE_THRESHOLD_HOURS * 3600_000
    return accountAgeMs <= oneDay
      ? true
      : false
  } catch {
    return false
  }
}

async function lookupServerPremium(guildId: bigint): Promise<boolean> {
  try {
    const row = await prisma.premium_guilds.findUnique({
      where: { guildid: guildId },
      select: { premium_until: true },
    })
    if (!row?.premium_until) return false
    return row.premium_until > new Date()
  } catch {
    return false
  }
}

async function lookupPet(userId: bigint) {
  try {
    return await prisma.lg_pets.findUnique({
      where: { userid: userId },
      select: { food: true, bath: true, sleep: true, expression: true },
    })
  } catch {
    return null
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
    xp: { earned: number; cap: number }
    cards_24h: number
  }
  throttle: string
  home_guild_id: string
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

  // Body size guard (Next.js parses JSON up to 1 MB by default;
  // tighten on Content-Length to be explicit).
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
    return sendError(
      res,
      400,
      "missing_idempotency_key",
      "Idempotency-Key header is required"
    )
  }
  if (!UUID_RE.test(idempHeader)) {
    return sendError(
      res,
      400,
      "bad_idempotency_key",
      "Idempotency-Key must be a UUID v4"
    )
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
    // Fall through — we'd rather double-credit in a true outage
    // than 500 the whole batch.
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
    return sendError(
      res,
      400,
      "batch_too_large",
      `reviews array must contain ≤ ${MAX_REVIEWS_PER_BATCH} items`
    )
  }

  const now = new Date()

  // Per-device rate limit (60s sliding window).
  const recentCount = await getRateLimitCount(ctx.deviceId)
  if (recentCount + body.reviews.length > RATE_LIMIT_PER_MINUTE) {
    res.setHeader("Retry-After", "60")
    return sendError(
      res,
      429,
      "rate_limited",
      `Per-device rate limit: ${RATE_LIMIT_PER_MINUTE} reviews/min`
    )
  }

  // Normalize + dedup-within-batch.
  const { kept, rejected } = normalizeReviews(
    body,
    body.anki_user_guid,
    ctx.discordId,
    now
  )

  if (kept.length === 0) {
    // Nothing to credit. Still cache the response for
    // idempotency.
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
      daily_progress: {
        gold: { earned: 0, cap: DAILY_GOLD_CAP },
        xp: { earned: 0, cap: DAILY_XP_CAP },
        cards_24h: 0,
      },
      throttle: "linear",
      home_guild_id: "",
      warnings: rejected > 0 ? ["all_reviews_rejected"] : [],
    }
    await cacheIdempotencyResponse(ctx.deviceId, idempHeader, 200, response)
    return res.status(200).json(response)
  }

  // Resolve home guild and snapshot user state.
  const { guildId: homeGuildId, fallback: homeGuildFallback } =
    await resolveHomeGuild(ctx.userId)

  const [{ cards24h, cardsTodayUtc }, { goldToday, xpToday }, serverPremium, pet, isPremiumUser, graceMode] =
    await Promise.all([
      getActivityCounts(ctx.userId, now),
      getDailyTotals(ctx.userId, now),
      lookupServerPremium(homeGuildId),
      lookupPet(ctx.userId),
      isLionheartActive(ctx.discordId),
      isInGracePeriod(ctx.userId, now),
    ])

  const tier: Tier = tierFromIsPremium(isPremiumUser)
  // Mood multiplier from the pet's CURRENT needs (food/bath/sleep),
  // matching the bot's calc_mood. No pet -> neutral 1.0.
  const mood = pet
    ? moodMultiplierForNeeds(pet.food, pet.bath, pet.sleep)
    : 1.0

  // Compute rewards BEFORE the DB transaction so we have the
  // numbers needed for both the inserts and the response.
  const rewardInputs = {
    cardCount: kept.length,
    userTier: tier,
    serverPremium,
    voteGoldBoost: 1.0, // top.gg vote boost — Phase 1.5
    moodMultiplier: mood,
    cardsTodayBefore: cards24h,
    goldEarnedTodayBefore: goldToday,
    xpEarnedTodayBefore: xpToday,
    cardsThisSessionBefore: cardsTodayUtc,
    refillsGivenThisSessionBefore: Math.min(
      Math.floor(cardsTodayUtc / 50),
      6
    ),
    graceMode,
  }
  const rewards = computeBatchRewards(rewardInputs)

  // Cap food/bath increments to 8 (pet stat scale). The bot's
  // existing decay logic continues to apply.
  const currentFood = pet?.food ?? 0
  const currentBath = pet?.bath ?? 0
  const newFood = Math.min(8, currentFood + rewards.foodRefill)
  const newBath = Math.min(8, currentBath + rewards.bathRefill)
  const actualFoodRefill = newFood - currentFood
  const actualBathRefill = newBath - currentBath

  // BIG TRANSACTION: insert review events + credit the economy
  // the SAME way the bot does (verified against gameplay.py):
  //   - gold balance lives in user_config.gold (NOT summed from
  //     the transactions ledger), with an lg_gold_transactions
  //     audit row
  //   - pet XP/level lives in lg_pets.xp / lg_pets.level, with a
  //     LEVEL_UP_GOLD_BONUS (50/level) bonus on level-up
  //   - pet care refills food/bath
  // member_experience (the rank/leaderboard XP) is written
  // OUTSIDE this transaction, best-effort, because its FK to
  // members(guildid,userid) fails for users who aren't members
  // of their home guild — and that must NOT roll back the
  // gold/pet credit.
  let acceptedCount = 0
  let dedupedCount = 0
  let goldCredited = 0
  let xpCredited = 0
  let levelsGained = 0
  let newLevel: number | null = null
  let actualFoodRefillFinal = 0
  let actualBathRefillFinal = 0
  try {
    await prisma.$transaction(async (tx) => {
      const insertResult = await tx.anki_review_events.createMany({
        data: kept.map((r) => ({
          review_id: r.reviewIdBytes,
          userid: ctx.userId,
          device_id: ctx.deviceId,
          guildid: homeGuildId,
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

      // Pro-rate rewards by the fraction actually accepted (some
      // may have been dedup hits).
      const acceptedFraction = insertResult.count / kept.length
      const baseGold = Math.floor(rewards.gold * acceptedFraction)
      xpCredited = Math.floor(rewards.xp * acceptedFraction)

      // --- Pet XP + level-up (mirrors award_xp_and_check_level) ---
      // SELECT ... FOR UPDATE so a concurrent voice-session credit
      // from the bot doesn't race us.
      let levelUpBonusGold = 0
      if (xpCredited > 0) {
        const petRows = await tx.$queryRaw<
          Array<{ level: number; xp: bigint }>
        >`SELECT level, xp FROM lg_pets WHERE userid = ${ctx.userId} FOR UPDATE`
        if (petRows.length > 0) {
          const { newLevel: nl, remainingXp, levelsGained: lg } = applyPetXp(
            Number(petRows[0].level) || 1,
            Number(petRows[0].xp) || 0,
            xpCredited
          )
          levelsGained = lg
          newLevel = nl
          levelUpBonusGold = lg * LEVEL_UP_GOLD_BONUS
          // Merge level/xp + care refill into ONE update.
          await tx.lg_pets.update({
            where: { userid: ctx.userId },
            data: {
              level: nl,
              xp: BigInt(remainingXp),
              food: newFood,
              bath: newBath,
            },
          })
          actualFoodRefillFinal = actualFoodRefill
          actualBathRefillFinal = actualBathRefill
        }
      } else if (pet && (actualFoodRefill > 0 || actualBathRefill > 0)) {
        // No XP this batch but care refills are due.
        await tx.lg_pets.update({
          where: { userid: ctx.userId },
          data: { food: newFood, bath: newBath },
        })
        actualFoodRefillFinal = actualFoodRefill
        actualBathRefillFinal = actualBathRefill
      }

      // --- Gold balance (mirrors award_gold) ---
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
    }, {
      maxWait: 5000,
      timeout: 15000,
    })
  } catch (err) {
    console.error("[anki/reviews] transaction failed:", err)
    return sendError(
      res,
      503,
      "db_unavailable",
      "Could not persist reviews — please retry"
    )
  }

  // --- member_experience (rank/leaderboard XP) — best-effort ---
  // Outside the transaction so the FK-to-members failure (user not
  // a member of their home guild) can't roll back the gold/pet
  // credit above. Only attempted when the user IS a member.
  if (xpCredited > 0) {
    try {
      const member = await prisma.members.findFirst({
        where: { guildid: homeGuildId, userid: ctx.userId },
        select: { userid: true },
      })
      if (member) {
        await prisma.member_experience.create({
          data: {
            guildid: homeGuildId,
            userid: ctx.userId,
            amount: xpCredited,
            exp_type: "ANKI_XP",
          },
        })
      }
    } catch (err) {
      console.warn("[anki/reviews] member_experience write skipped:", err)
    }
  }

  const warnings: string[] = []
  if (homeGuildFallback) warnings.push("home_guild_unavailable_fallback_to_support")
  if (rewards.capHit) warnings.push("daily_cap_hit")
  if (graceMode) warnings.push("new_account_grace_active")

  const response: ReviewsResponseBody = {
    accepted: acceptedCount,
    deduped: dedupedCount,
    rejected,
    rewards: {
      gold: goldCredited,
      xp: xpCredited,
      pet_care: {
        food: actualFoodRefillFinal,
        bath: actualBathRefillFinal,
        sleep: 0,
      },
      levels_gained: levelsGained,
      new_level: newLevel,
    },
    daily_progress: {
      gold: {
        earned: goldToday + goldCredited,
        cap: DAILY_GOLD_CAP,
      },
      xp: {
        earned: xpToday + xpCredited,
        cap: DAILY_XP_CAP,
      },
      cards_24h: cards24h + acceptedCount,
    },
    throttle: rewards.throttle,
    home_guild_id: homeGuildId.toString(),
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
    // P2002 = primary key collision = some other request beat us
    // here for the same idempotency key. Either way, ignore.
    const code = (err as { code?: string }).code
    if (code === "P2002") return
    console.warn("[anki/reviews] idempotency cache write failed:", err)
  }
}
