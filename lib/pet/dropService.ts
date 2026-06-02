// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-02
// Purpose: Server-side, cheat-safe item-drop roll for the Anki addon's
//          review ingest — the analog of the bot dropping items from
//          voice/text activity (StudyLion gameplay.py try_item_drop).
//          Each accepted review batch has a chance to drop one cosmetic
//          item or scroll into lg_user_inventory.
//
//          MUST be called INSIDE the reviews.ts advisory-locked
//          transaction: all RNG + modifiers run server-side from the
//          authenticated user's real pet/tier, the client cannot
//          influence the outcome, and the per-user lock makes the
//          read-then-insert race-free. The reviews batch Idempotency-Key
//          response is cached, so a replayed batch returns the same
//          drops WITHOUT re-rolling (roll once on first processing).
//
//          Economy parity with the bot: ITEM_DROP_WEIGHTS,
//          SCROLL_DROP_RATIO, MOOD_DROP_MULT (fainted = no drops),
//          TIER_DROP_RATE_BONUS, weighted item pick by drop_weight,
//          DAILY_DROP_CAP. Anki is global so there is no server-premium
//          bonus. Daily cap is counted from source='DROP' inventory rows
//          acquired today (a secondary backstop; the primary limiter is
//          the review diminishing-returns curve + low per-batch chance).
// ============================================================
import { Prisma } from "@prisma/client"
import type { Tier } from "@/lib/anki/rewards"

export const DAILY_DROP_CAP = 15

// Per-batch base chance + how cards scale it (Anki analog of voice mins).
const ANKI_DROP_BASE = 0.12
const ANKI_DROP_CARDS_PER_ROLL = 20
const DROP_CHANCE_CAP = 0.5
const EFFECTIVE_CHANCE_CAP = 0.95

// mood (0-8) -> drop multiplier. Fainted (0) blocks all drops.
const MOOD_DROP_MULT: Record<number, number> = {
  8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 0.5, 1: 0.5, 0: 0,
}

const TIER_DROP_RATE_BONUS: Record<Tier, number> = {
  NONE: 0.0,
  LIONHEART: 0.15,
  LIONHEART_PLUS: 0.25,
  LIONHEART_PLUS_PLUS: 0.5,
}

const RARITY_WEIGHTS: ReadonlyArray<readonly [string, number]> = [
  ["COMMON", 45],
  ["UNCOMMON", 28],
  ["RARE", 15],
  ["EPIC", 7],
  ["LEGENDARY", 3.5],
  ["MYTHICAL", 0.5],
]
const SCROLL_DROP_RATIO = 0.6
const EQUIPMENT_CATEGORIES = ["HAT", "GLASSES", "COSTUME", "SHIRT", "WINGS", "BOOTS"]

export interface DropResult {
  itemid: number
  name: string
  rarity: string
  category: string
  asset_path: string | null
  slot: string | null
}

function weightedRarity(): string {
  const total = RARITY_WEIGHTS.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [name, w] of RARITY_WEIGHTS) {
    r -= w
    if (r <= 0) return name
  }
  return "COMMON"
}

async function pickItem(
  tx: Prisma.TransactionClient,
  rarity: string | null,
  categories: string[]
): Promise<DropResult | null> {
  const rarityClause = rarity
    ? Prisma.sql`AND rarity::text = ${rarity}`
    : Prisma.sql``
  const rows = await tx.$queryRaw<DropResult[]>(Prisma.sql`
    SELECT itemid, name, rarity::text AS rarity, category::text AS category,
           asset_path, slot::text AS slot
    FROM lg_items
    WHERE category::text IN (${Prisma.join(categories)})
      ${rarityClause}
    ORDER BY -LN(1 - random()) / GREATEST(COALESCE(drop_weight, 1.0), 0.001)
    LIMIT 1`)
  return rows[0] ?? null
}

/**
 * Roll for (at most one) item drop for an accepted review batch.
 * Server-authoritative; call inside the reviews advisory lock.
 *
 * Returns the dropped items (0 or 1) and the new "drops today" count
 * for the response's daily_progress.
 */
export async function rollReviewDrops(
  tx: Prisma.TransactionClient,
  userId: bigint,
  acceptedCards: number,
  mood: number,
  tier: Tier,
  todayStart: Date
): Promise<{ drops: DropResult[]; dropsToday: number }> {
  const [everDrops, dropsTodayBefore] = await Promise.all([
    tx.lg_user_inventory.count({ where: { userid: userId, source: "DROP" } }),
    tx.lg_user_inventory.count({
      where: { userid: userId, source: "DROP", acquired_at: { gte: todayStart } },
    }),
  ])
  const none = { drops: [] as DropResult[], dropsToday: dropsTodayBefore }

  // Fainted pet -> no drops at all (even the first-ever guarantee).
  const moodMult = MOOD_DROP_MULT[Math.max(0, Math.min(8, mood))] ?? 1
  if (moodMult <= 0) return none

  const isFirstEver = everDrops === 0
  if (!isFirstEver && dropsTodayBefore >= DAILY_DROP_CAP) return none

  let chance = Math.min(
    ANKI_DROP_BASE * Math.max(1, acceptedCards / ANKI_DROP_CARDS_PER_ROLL),
    DROP_CHANCE_CAP
  )
  chance = chance * moodMult * (1 + (TIER_DROP_RATE_BONUS[tier] || 0))
  chance = Math.min(chance, EFFECTIVE_CHANCE_CAP)
  if (isFirstEver) chance = 1.0 // delightful guaranteed first drop

  if (Math.random() >= chance) return none

  const rarity = weightedRarity()
  const isScroll = Math.random() < SCROLL_DROP_RATIO
  const categories = isScroll ? ["SCROLL"] : EQUIPMENT_CATEGORIES

  let picked = await pickItem(tx, rarity, categories)
  if (!picked) picked = await pickItem(tx, null, categories) // broaden rarity
  if (!picked) return none

  // Grant it. Race-free under the caller's per-user advisory lock:
  // stack onto an existing unenhanced copy, else create a new row.
  const existing = await tx.lg_user_inventory.findFirst({
    where: { userid: userId, itemid: picked.itemid, enhancement_level: 0 },
    select: { inventoryid: true },
  })
  if (existing) {
    await tx.lg_user_inventory.update({
      where: { inventoryid: existing.inventoryid },
      data: { quantity: { increment: 1 } },
    })
  } else {
    await tx.lg_user_inventory.create({
      data: {
        userid: userId,
        itemid: picked.itemid,
        source: "DROP",
        quantity: 1,
        enhancement_level: 0,
      },
    })
  }

  return { drops: [picked], dropsToday: dropsTodayBefore + 1 }
}
