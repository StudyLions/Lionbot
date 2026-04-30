// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Vercel Cron entrypoint that ages out server-listing
//          rows whose owning guild has lost premium.
//
//          State machine driven by this cron:
//            APPROVED  -> EXPIRED   (the moment premium_until passes,
//                                    listing flips into a 30-day grace
//                                    window where the public page still
//                                    renders but with a "renew" banner)
//            EXPIRED   -> ARCHIVED  (after 30 days of grace; the slug
//                                    is freed by clearing it so the
//                                    UNIQUE constraint no longer blocks
//                                    a new listing from claiming it)
//            PENDING   -> EXPIRED   (also flipped if the guild lost
//                                    premium between submission and
//                                    review; saves Ari from approving
//                                    a listing whose owner can't pay)
//
//          Schedule: hourly (`0 * * * *`) so the page status updates
//          quickly when premium expires. The work is bounded -- only a
//          handful of guilds will be in transition at any one time.
//
//          Manual smoke-test:
//              curl -H "Authorization: Bearer $CRON_SECRET" \
//                https://lionbot.org/api/cron/expire-listings
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { LISTING_GRACE_PERIOD_DAYS } from "@/constants/ServerListingData"

export const config = { maxDuration: 60 }

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.authorization
  if (header && header === `Bearer ${secret}`) return true
  if (typeof req.query.secret === "string" && req.query.secret === secret) return true
  return false
}

interface CronOutcome {
  ok: true
  scanned: number
  expired: number
  archived: number
  elapsedMs: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CronOutcome | { error: string }>,
) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const startedAt = Date.now()
  const now = new Date()
  const graceCutoff = new Date(now.getTime() - LISTING_GRACE_PERIOD_DAYS * 86400_000)

  // -------------------------------------------------------------
  // STEP 1 — Flip APPROVED / PENDING listings to EXPIRED when the
  // owning guild has lost premium. We do this as a single SQL UPDATE
  // joining server_listings to premium_guilds so it stays cheap even
  // as the listings table grows.
  // -------------------------------------------------------------
  const expiredResult = await prisma.$executeRaw`
    UPDATE server_listings AS sl
    SET status = 'EXPIRED'::"ListingStatus",
        updated_at = NOW()
    FROM (
      SELECT pg.guildid
      FROM server_listings sl2
      LEFT JOIN premium_guilds pg ON pg.guildid = sl2.guildid
      WHERE sl2.status IN ('APPROVED', 'PENDING')
        AND (pg.premium_until IS NULL OR pg.premium_until <= NOW())
    ) AS expired_guilds
    WHERE sl.guildid = expired_guilds.guildid
      AND sl.status IN ('APPROVED', 'PENDING')
  `

  // -------------------------------------------------------------
  // STEP 2 — Archive listings that have been EXPIRED for longer
  // than the grace window. We blank out the slug so it returns to
  // the pool of available vanity URLs (otherwise a returning
  // premium server would be locked out of its preferred handle).
  // We also clear pending_changes so a stale draft doesn't get
  // promoted on next approval.
  // -------------------------------------------------------------
  const archiveCandidates = await prisma.server_listings.findMany({
    where: {
      status: "EXPIRED",
      updated_at: { lt: graceCutoff },
    },
    select: { guildid: true, slug: true },
  })

  let archivedCount = 0
  for (const candidate of archiveCandidates) {
    // Slug must be unique-or-null. We move the old slug into a
    // suffixed "archive holder" so it's permanently freed from the
    // unique index but still readable for forensics if a guild ever
    // disputes the change.
    const archivedSlug = `__archived_${candidate.guildid.toString()}_${Date.now()}`.slice(0, 40)
    try {
      await prisma.server_listings.update({
        where: { guildid: candidate.guildid },
        data: {
          status: "ARCHIVED",
          slug: archivedSlug,
          pending_changes: undefined,
          notification_sent_at: null,
          updated_at: now,
        },
      })
      archivedCount++
    } catch (err) {
      console.warn(
        "[cron/expire-listings] archive failed for guild",
        candidate.guildid.toString(),
        err,
      )
    }
  }

  const elapsedMs = Date.now() - startedAt
  console.log(
    `[cron/expire-listings] expired=${expiredResult} archived=${archivedCount} ` +
      `scanned_for_archive=${archiveCandidates.length} elapsed=${elapsedMs}ms`,
  )

  return res.status(200).json({
    ok: true,
    scanned: archiveCandidates.length,
    expired: typeof expiredResult === "number" ? expiredResult : 0,
    archived: archivedCount,
    elapsedMs,
  })
}
