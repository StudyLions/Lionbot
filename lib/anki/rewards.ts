// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-19
// Purpose: Reward math for the Anki addon ingest endpoint.
//          Pure functions — no IO. The endpoint fetches the
//          inputs (user tier, server premium, vote boost, pet
//          mood, today's totals, today's card count) and passes
//          them in.
//
//          Mirrors the bot's gameplay.py reward shape:
//            calc_text_rewards(message_count, user_tier,
//                              server_premium, vote_gold_boost)
//          but with three additional concerns specific to Anki:
//            1. Diminishing-returns curve based on the user's
//               total cards reviewed in the rolling 24h window.
//            2. Shared daily caps that already account for any
//               voice/text gold the user earned today.
//            3. Pet care refills computed against the session's
//               cumulative card count (NOT the batch alone), so
//               a user who submits 5 batches of 10 each gets the
//               same refills as one batch of 50.
//
//          Returned `throttle` field tells the caller (and
//          ultimately the addon UI) which tier of the curve
//          this batch landed in, so we can surface a "rate
//          reduced" toast when the user crosses 500/2000/5000.
// ============================================================

export const ANKI_GOLD_PER_CARD = 0.1
export const ANKI_XP_PER_CARD = 1.0 / 3.0
export const ANKI_REFILL_PER_CARDS = 50
export const ANKI_REFILL_MAX_PER_SESSION = 3

// Pet level-up curve — MUST match the bot's gameplay.py exactly:
//   xp_for_level(level) = int(25 * level ** 1.3)
//   LEVEL_UP_GOLD_BONUS = 50 gold per level gained
export const LEVEL_UP_GOLD_BONUS = 50

export function xpForLevel(level: number): number {
  return Math.floor(25 * Math.pow(level, 1.3))
}

/**
 * Apply XP to a pet and roll up level-ups. Mirrors the bot's
 * check_level_up(current_level, current_xp).
 *
 * Returns the new level, the remaining XP within that level, and
 * how many levels were gained (for the gold bonus).
 */
export function applyPetXp(
  currentLevel: number,
  currentXp: number,
  xpToAdd: number
): { newLevel: number; remainingXp: number; levelsGained: number } {
  let level = Math.max(1, Math.floor(currentLevel) || 1)
  let xp = Math.max(0, Math.floor(currentXp)) + Math.max(0, Math.floor(xpToAdd))
  let levelsGained = 0
  // Bound the loop defensively — a malicious huge xp can't be
  // submitted (daily caps clamp it) but belt-and-braces.
  while (xp >= xpForLevel(level) && levelsGained < 10_000) {
    xp -= xpForLevel(level)
    level += 1
    levelsGained += 1
  }
  return { newLevel: level, remainingXp: xp, levelsGained }
}

export const DAILY_GOLD_CAP = 1500
export const DAILY_XP_CAP = 2500

// Diminishing-returns curve. Defined as a list of (threshold,
// multiplier) pairs in ascending threshold order. The last entry
// must be Infinity or a number larger than any plausible count.
export const ANKI_THROTTLE_CURVE: ReadonlyArray<{
  upTo: number
  multiplier: number
  label: ThrottleLabel
}> = [
  { upTo: 500, multiplier: 1.0, label: "linear" },
  { upTo: 2000, multiplier: 0.5, label: "half" },
  { upTo: 5000, multiplier: 0.25, label: "quarter" },
  { upTo: Number.POSITIVE_INFINITY, multiplier: 0, label: "zero" },
]

export type ThrottleLabel = "linear" | "half" | "quarter" | "zero"
export type Tier = "NONE" | "LIONHEART" | "LIONHEART_PLUS" | "LIONHEART_PLUS_PLUS"

export const TIER_GOLD_BONUS: Record<Tier, number> = {
  NONE: 1.0,
  LIONHEART: 1.15,
  LIONHEART_PLUS: 1.25,
  LIONHEART_PLUS_PLUS: 1.5,
}

export const SERVER_PREMIUM_GOLD_BONUS = 1.15

// Mood -> reward multiplier (matches the bot's 0..8 mood scale
// from gameplay.py). Indexed by lg_pets.expression enum string
// mapped to numeric mood.
export const MOOD_MULT_BY_EXPRESSION: Record<string, number> = {
  HAPPY: 1.25,
  EXCITED: 1.2,
  CONTENT: 1.1,
  DEFAULT: 1.0,
  NEUTRAL: 1.0,
  SAD: 0.85,
  TIRED: 0.7,
  UPSET: 0.6,
  DEAD: 0.5,
}

export interface ComputeBatchRewardsInput {
  /** Number of NEW (non-dedup-hit) cards being credited in this batch. */
  cardCount: number
  /** User's LionHeart tier — pulled from existing isLionheartActive helper. */
  userTier: Tier
  /** Whether the user's HOME GUILD is premium (premium_guilds.premium_until > now()). */
  serverPremium: boolean
  /** Vote gold boost multiplier — 1.0 if no recent vote, else tier-scaled. */
  voteGoldBoost: number
  /** Pet mood multiplier (0.5..1.25). 1.0 if no pet yet. */
  moodMultiplier: number
  /** User's total cards reviewed in the rolling 24h window BEFORE this batch. */
  cardsTodayBefore: number
  /** User's total gold earned today BEFORE this batch (sum across all sources). */
  goldEarnedTodayBefore: number
  /** User's total XP earned today BEFORE this batch (sum across all sources). */
  xpEarnedTodayBefore: number
  /** Cards reviewed in THIS Anki session (server-clock day) BEFORE this batch. Used for refill counting. */
  cardsThisSessionBefore: number
  /** Refills already given in THIS session (food + bath summed). */
  refillsGivenThisSessionBefore: number
  /** Grace mode: if true, apply 10% reward rate (new-account first-7-days). */
  graceMode: boolean
}

export interface ComputeBatchRewardsOutput {
  /** Gold to credit (integer, ≥ 0). */
  gold: number
  /** XP to credit (integer, ≥ 0). */
  xp: number
  /** Food refills to apply (0..3 - prior session refills). */
  foodRefill: number
  /** Bath refills to apply. */
  bathRefill: number
  /** Highest throttle label this batch crossed. */
  throttle: ThrottleLabel
  /** True if any of the daily caps were hit during this batch (gold or xp). */
  capHit: boolean
  /** Updated cumulative count after this batch (for chaining). */
  cardsTodayAfter: number
  goldEarnedTodayAfter: number
  xpEarnedTodayAfter: number
}

/**
 * Compute rewards for a batch of Anki reviews. Pure / synchronous.
 *
 * The math is deliberately conservative: floors at each step,
 * subtracts from remaining daily budget, and applies the
 * diminishing curve across the batch boundary so that a batch
 * which crosses (say) the 500-card threshold gets a blended
 * rate, not the higher tier for the whole batch.
 */
export function computeBatchRewards(
  input: ComputeBatchRewardsInput
): ComputeBatchRewardsOutput {
  const {
    cardCount,
    userTier,
    serverPremium,
    voteGoldBoost,
    moodMultiplier,
    cardsTodayBefore,
    goldEarnedTodayBefore,
    xpEarnedTodayBefore,
    cardsThisSessionBefore,
    refillsGivenThisSessionBefore,
    graceMode,
  } = input

  // Build the multiplier outside the per-segment loop. Mood and
  // vote are applied; tier bonus is applied only to gold (XP isn't
  // tier-boosted, matching gameplay.py voice/text behavior).
  const goldMult =
    moodMultiplier *
    voteGoldBoost *
    (TIER_GOLD_BONUS[userTier] || 1.0) *
    (serverPremium ? SERVER_PREMIUM_GOLD_BONUS : 1.0) *
    (graceMode ? 0.1 : 1.0)
  const xpMult = moodMultiplier * (graceMode ? 0.1 : 1.0)

  // Walk the curve segment by segment, attributing cards from
  // this batch to each tier and accumulating fractional rewards.
  let cardsLeft = Math.max(0, Math.floor(cardCount))
  let cardsCursor = Math.max(0, cardsTodayBefore)
  let fractionalGold = 0
  let fractionalXp = 0
  let highestThrottle: ThrottleLabel = "linear"
  const throttlePriority: Record<ThrottleLabel, number> = {
    linear: 0,
    half: 1,
    quarter: 2,
    zero: 3,
  }

  for (const seg of ANKI_THROTTLE_CURVE) {
    if (cardsLeft === 0) break
    const room = Math.max(0, seg.upTo - cardsCursor)
    if (room === 0) continue
    const inSeg = Math.min(cardsLeft, room)
    fractionalGold += inSeg * ANKI_GOLD_PER_CARD * seg.multiplier
    fractionalXp += inSeg * ANKI_XP_PER_CARD * seg.multiplier
    if (throttlePriority[seg.label] > throttlePriority[highestThrottle]) {
      highestThrottle = seg.label
    }
    cardsCursor += inSeg
    cardsLeft -= inSeg
  }

  // Apply the global multipliers.
  let gold = Math.floor(fractionalGold * goldMult)
  let xp = Math.floor(fractionalXp * xpMult)

  // Subtract from the remaining daily budgets.
  const goldRoom = Math.max(0, DAILY_GOLD_CAP - goldEarnedTodayBefore)
  const xpRoom = Math.max(0, DAILY_XP_CAP - xpEarnedTodayBefore)
  let capHit = false
  if (gold > goldRoom) {
    gold = goldRoom
    capHit = true
  }
  if (xp > xpRoom) {
    xp = xpRoom
    capHit = true
  }

  // Pet care refills. Computed against the session cumulative
  // count so a chain of small batches and one big batch get the
  // same refill total. Food first, then bath (we don't refill
  // sleep from Anki — matches the text/voice split: text only
  // refills food+bath, voice does all three).
  const totalRefillCarry = Math.min(
    Math.floor((cardsThisSessionBefore + Math.floor(cardCount)) / ANKI_REFILL_PER_CARDS),
    // Cap total refills per session at MAX*2 (food + bath each
    // max'd) so a marathon session can refill food + bath each
    // up to MAX times.
    ANKI_REFILL_MAX_PER_SESSION * 2
  )
  const refillsAvailable = Math.max(0, totalRefillCarry - refillsGivenThisSessionBefore)

  // Alternate food/bath: food gets the odd slots (1st, 3rd, 5th),
  // bath gets the even slots (2nd, 4th, 6th).
  let foodRefill = 0
  let bathRefill = 0
  for (let i = 0; i < refillsAvailable; i++) {
    const slotIndex = refillsGivenThisSessionBefore + i // 0-based
    if (slotIndex % 2 === 0 && foodRefill + countSessionRefills(refillsGivenThisSessionBefore, "food") < ANKI_REFILL_MAX_PER_SESSION) {
      foodRefill++
    } else if (slotIndex % 2 === 1 && bathRefill + countSessionRefills(refillsGivenThisSessionBefore, "bath") < ANKI_REFILL_MAX_PER_SESSION) {
      bathRefill++
    }
  }

  return {
    gold,
    xp,
    foodRefill,
    bathRefill,
    throttle: highestThrottle,
    capHit,
    cardsTodayAfter: cardsCursor + Math.max(0, cardsLeft), // include unfunded cards in count
    goldEarnedTodayAfter: goldEarnedTodayBefore + gold,
    xpEarnedTodayAfter: xpEarnedTodayBefore + xp,
  }
}

/**
 * Helper: how many refills of each type have been used so far in
 * this session, given the total count and the alternation rule.
 * Used to enforce the per-session max for each individual stat.
 */
function countSessionRefills(
  totalRefillsGiven: number,
  kind: "food" | "bath"
): number {
  if (totalRefillsGiven <= 0) return 0
  if (kind === "food") return Math.ceil(totalRefillsGiven / 2)
  return Math.floor(totalRefillsGiven / 2)
}

/**
 * Helper: given a Discord user's premium tier as returned by the
 * existing isLionheartActive flow, map to the strict Tier enum
 * used here. Defaults to NONE for any unknown / inactive state.
 */
export function tierFromIsPremium(
  isPremium: boolean,
  rawTier?: string | null
): Tier {
  if (!isPremium) return "NONE"
  switch (rawTier) {
    case "LIONHEART":
      return "LIONHEART"
    case "LIONHEART_PLUS":
      return "LIONHEART_PLUS"
    case "LIONHEART_PLUS_PLUS":
      return "LIONHEART_PLUS_PLUS"
    default:
      return "LIONHEART" // benefits without knowing the exact tier
  }
}
