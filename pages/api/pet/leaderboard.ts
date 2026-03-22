// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Public leaderboard API for LionGotchi pet owners.
//          Supports vc/messages/drops/marketplace categories
//          with daily/weekly/monthly timeframes.
// ============================================================
import { prisma } from "@/utils/prisma"
import { apiHandler } from "@/utils/apiHandler"
import { getAuthContext } from "@/utils/adminAuth"
import { fetchPetVisualData } from "@/pages/api/pet/profile/[userId]"

type Category = "vc" | "messages" | "drops" | "marketplace"
type Timeframe = "daily" | "weekly" | "monthly"

const VALID_CATEGORIES = new Set<Category>(["vc", "messages", "drops", "marketplace"])
const VALID_TIMEFRAMES = new Set<Timeframe>(["daily", "weekly", "monthly"])

interface RawEntry {
  userid: bigint
  value: bigint | number
  rarity_score?: number
  item_names?: string | null
  best_rarity?: string | null
}

function getCutoff(timeframe: Timeframe): Date {
  const now = new Date()
  switch (timeframe) {
    case "daily": {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      return d
    }
    case "weekly": {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const day = d.getUTCDay()
      const diff = day === 0 ? 6 : day - 1
      d.setUTCDate(d.getUTCDate() - diff)
      return d
    }
    case "monthly": {
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    }
  }
}

function formatVcDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatDisplayValue(value: number, category: Category, itemName?: string | null): string {
  switch (category) {
    case "vc":
      return formatVcDuration(value)
    case "messages":
      return value.toLocaleString()
    case "drops":
      return itemName || `${value} items`
    case "marketplace":
      return `${value.toLocaleString()} gold`
  }
}

async function queryTop10(category: Category, cutoff: Date): Promise<RawEntry[]> {
  switch (category) {
    case "vc":
      return prisma.$queryRaw<RawEntry[]>`
        SELECT vs.userid, SUM(vs.duration) as value
        FROM voice_sessions vs
        JOIN lg_pets p ON p.userid = vs.userid
        WHERE vs.start_time >= ${cutoff}
        GROUP BY vs.userid
        ORDER BY value DESC
        LIMIT 10
      `
    case "messages":
      return prisma.$queryRaw<RawEntry[]>`
        SELECT ts.userid, SUM(ts.messages) as value
        FROM text_sessions ts
        JOIN lg_pets p ON p.userid = ts.userid
        WHERE ts.start_time >= ${cutoff}
        GROUP BY ts.userid
        ORDER BY value DESC
        LIMIT 10
      `
    case "drops":
      return prisma.$queryRaw<RawEntry[]>`
        SELECT
          ui.userid,
          MAX(CASE
            WHEN i.rarity = 'MYTHICAL' THEN 6
            WHEN i.rarity = 'LEGENDARY' THEN 5
            WHEN i.rarity = 'EPIC' THEN 4
            WHEN i.rarity = 'RARE' THEN 3
            WHEN i.rarity = 'UNCOMMON' THEN 2
            ELSE 1
          END) as rarity_score,
          (array_agg(i.name ORDER BY
            CASE
              WHEN i.rarity = 'MYTHICAL' THEN 6
              WHEN i.rarity = 'LEGENDARY' THEN 5
              WHEN i.rarity = 'EPIC' THEN 4
              WHEN i.rarity = 'RARE' THEN 3
              WHEN i.rarity = 'UNCOMMON' THEN 2
              ELSE 1
            END DESC
          ))[1] as item_names,
          (array_agg(i.rarity::text ORDER BY
            CASE
              WHEN i.rarity = 'MYTHICAL' THEN 6
              WHEN i.rarity = 'LEGENDARY' THEN 5
              WHEN i.rarity = 'EPIC' THEN 4
              WHEN i.rarity = 'RARE' THEN 3
              WHEN i.rarity = 'UNCOMMON' THEN 2
              ELSE 1
            END DESC
          ))[1] as best_rarity
        FROM lg_user_inventory ui
        JOIN lg_items i ON i.itemid = ui.itemid
        JOIN lg_pets p ON p.userid = ui.userid
        WHERE ui.source = 'DROP' AND ui.acquired_at >= ${cutoff}
        GROUP BY ui.userid
        ORDER BY rarity_score DESC, COUNT(*) DESC
        LIMIT 10
      `
    case "marketplace":
      return prisma.$queryRaw<RawEntry[]>`
        SELECT ms.seller_userid as userid, SUM(ms.total_price) as value
        FROM lg_marketplace_sales ms
        JOIN lg_pets p ON p.userid = ms.seller_userid
        WHERE ms.sold_at >= ${cutoff}
        GROUP BY ms.seller_userid
        ORDER BY value DESC
        LIMIT 10
      `
  }
}

async function queryUserRank(
  category: Category,
  cutoff: Date,
  userId: bigint
): Promise<{ rank: number; value: number } | null> {
  let rows: { rank: bigint; value: bigint | number }[]

  switch (category) {
    case "vc":
      rows = await prisma.$queryRaw<{ rank: bigint; value: bigint }[]>`
        WITH ranked AS (
          SELECT vs.userid, SUM(vs.duration) as value,
                 RANK() OVER (ORDER BY SUM(vs.duration) DESC) as rank
          FROM voice_sessions vs
          JOIN lg_pets p ON p.userid = vs.userid
          WHERE vs.start_time >= ${cutoff}
          GROUP BY vs.userid
        )
        SELECT rank, value FROM ranked WHERE userid = ${userId}
      `
      break
    case "messages":
      rows = await prisma.$queryRaw<{ rank: bigint; value: bigint }[]>`
        WITH ranked AS (
          SELECT ts.userid, SUM(ts.messages) as value,
                 RANK() OVER (ORDER BY SUM(ts.messages) DESC) as rank
          FROM text_sessions ts
          JOIN lg_pets p ON p.userid = ts.userid
          WHERE ts.start_time >= ${cutoff}
          GROUP BY ts.userid
        )
        SELECT rank, value FROM ranked WHERE userid = ${userId}
      `
      break
    case "drops":
      rows = await prisma.$queryRaw<{ rank: bigint; value: bigint }[]>`
        WITH ranked AS (
          SELECT ui.userid, COUNT(*) as value,
                 RANK() OVER (ORDER BY MAX(CASE
                   WHEN i.rarity = 'MYTHICAL' THEN 6
                   WHEN i.rarity = 'LEGENDARY' THEN 5
                   WHEN i.rarity = 'EPIC' THEN 4
                   WHEN i.rarity = 'RARE' THEN 3
                   WHEN i.rarity = 'UNCOMMON' THEN 2
                   ELSE 1
                 END) DESC, COUNT(*) DESC) as rank
          FROM lg_user_inventory ui
          JOIN lg_items i ON i.itemid = ui.itemid
          JOIN lg_pets p ON p.userid = ui.userid
          WHERE ui.source = 'DROP' AND ui.acquired_at >= ${cutoff}
          GROUP BY ui.userid
        )
        SELECT rank, value FROM ranked WHERE userid = ${userId}
      `
      break
    case "marketplace":
      rows = await prisma.$queryRaw<{ rank: bigint; value: bigint }[]>`
        WITH ranked AS (
          SELECT ms.seller_userid as userid, SUM(ms.total_price) as value,
                 RANK() OVER (ORDER BY SUM(ms.total_price) DESC) as rank
          FROM lg_marketplace_sales ms
          JOIN lg_pets p ON p.userid = ms.seller_userid
          WHERE ms.sold_at >= ${cutoff}
          GROUP BY ms.seller_userid
        )
        SELECT rank, value FROM ranked WHERE userid = ${userId}
      `
      break
  }

  if (!rows || rows.length === 0) return null
  return { rank: Number(rows[0].rank), value: Number(rows[0].value) }
}

export default apiHandler({
  async GET(req, res) {
    const category = req.query.category as string
    const timeframe = req.query.timeframe as string

    if (!VALID_CATEGORIES.has(category as Category)) {
      return res.status(400).json({ error: "Invalid category. Use: vc, messages, drops, marketplace" })
    }
    if (!VALID_TIMEFRAMES.has(timeframe as Timeframe)) {
      return res.status(400).json({ error: "Invalid timeframe. Use: daily, weekly, monthly" })
    }

    const cat = category as Category
    const tf = timeframe as Timeframe
    const cutoff = getCutoff(tf)

    const auth = await getAuthContext(req)

    const rawEntries = await queryTop10(cat, cutoff)

    const entries = await Promise.all(
      rawEntries.map(async (entry, idx) => {
        const numValue = Number(entry.value ?? entry.rarity_score ?? 0)
        let profile = null
        try {
          profile = await fetchPetVisualData(entry.userid)
        } catch {}

        return {
          rank: idx + 1,
          userId: entry.userid.toString(),
          value: numValue,
          displayValue: formatDisplayValue(
            numValue,
            cat,
            cat === "drops" ? (entry.item_names as string | null) : null
          ),
          itemName: (entry.item_names as string | null) ?? null,
          itemRarity: (entry.best_rarity as string | null) ?? null,
          profile: profile
            ? {
                discordId: profile.discordId,
                discordName: profile.discordName,
                avatarHash: profile.avatarHash,
                petName: profile.pet.name,
                petLevel: profile.pet.level,
                food: profile.pet.food,
                bath: profile.pet.bath,
                sleep: profile.pet.sleep,
                petVisual: {
                  roomPrefix: profile.roomPrefix,
                  furniture: profile.furniture,
                  roomLayout: profile.roomLayout,
                  equipment: Object.fromEntries(
                    Object.entries(profile.equipment).map(([slot, eq]) => [
                      slot,
                      {
                        assetPath: eq.assetPath,
                        category: eq.category,
                        glowTier: eq.glowTier,
                        glowIntensity: eq.glowIntensity,
                      },
                    ])
                  ),
                  expression: profile.pet.expression,
                  skinPath: profile.gameboySkinPath,
                },
              }
            : null,
        }
      })
    )

    let userRank: { rank: number; value: number; displayValue: string } | null = null
    if (auth) {
      const ur = await queryUserRank(cat, cutoff, auth.userId)
      if (ur) {
        userRank = {
          rank: ur.rank,
          value: ur.value,
          displayValue: formatDisplayValue(ur.value, cat),
        }
      }
    }

    return res.status(200).json({ entries, userRank })
  },
})
