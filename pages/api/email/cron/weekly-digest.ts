// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Vercel Cron entrypoint that fans out weekly digest
//          emails. Authenticates via the CRON_SECRET header (or
//          Vercel's built-in cron Authorization header), aggregates
//          per-user data, and sends with a small concurrency limit
//          so we stay well under Resend's 10 req/sec ceiling.
//
//          Schedule lives in vercel.json. Manual smoke-test via:
//            curl -H "Authorization: Bearer $CRON_SECRET" \
//              https://lionbot.org/api/email/cron/weekly-digest
// ============================================================
import * as React from "react"
import type { NextApiRequest, NextApiResponse } from "next"
import {
  buildWeeklyDigest,
  getDigestRecipients,
  type DigestEligibleUser,
} from "../../../../utils/email/digest"
import { sendEmail } from "../../../../utils/email/send"
import WeeklyDigest from "../../../../emails/WeeklyDigest"

// Vercel Pro: max 5 minutes. The default 10s is way too short for a fan-out.
export const config = { maxDuration: 300 }

const CONCURRENCY = 4

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.authorization
  if (header && header === `Bearer ${secret}`) return true
  // Allow ?secret=... for manual curl testing during incident response.
  if (typeof req.query.secret === "string" && req.query.secret === secret) return true
  return false
}

function firstNameOf(user: DigestEligibleUser): string {
  const raw = (user.name ?? user.email.split("@")[0] ?? "there").trim()
  return raw.split(/\s+/)[0] || "there"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  // Optional ?dryRun=1&limit=N for safe rollout testing.
  const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true"
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  if (limit !== undefined && (!Number.isFinite(limit) || limit <= 0)) {
    return res.status(400).json({ error: "Invalid limit" })
  }

  const startedAt = Date.now()
  const recipients = await getDigestRecipients(limit)

  let queued = 0
  let sent = 0
  let skippedNoActivity = 0
  let skippedPref = 0
  let failed = 0

  let cursor = 0
  async function worker() {
    while (true) {
      const idx = cursor++
      if (idx >= recipients.length) return
      const user = recipients[idx]
      queued++
      try {
        const data = await buildWeeklyDigest({
          userid: user.userid,
          firstName: firstNameOf(user),
        })
        if (!data) {
          skippedNoActivity++
          continue
        }
        if (dryRun) {
          sent++
          continue
        }
        const result = await sendEmail({
          userid: user.userid,
          template: "weekly_digest",
          subject: `Your ${data.studyMinutesThisWeek > 0 ? "weekly recap" : "LionBot recap"} — ${
            data.weekStartLabel
          } – ${data.weekEndLabel}`,
          react: React.createElement(WeeklyDigest, data),
          marketing: true,
        })
        if (result.status === "sent") sent++
        else if (result.status === "skipped_pref" || result.status === "skipped_unsubscribed")
          skippedPref++
        else if (result.status === "failed") failed++
      } catch (e) {
        console.error("[cron/weekly-digest] worker error:", e)
        failed++
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker())
  await Promise.all(workers)

  const elapsedMs = Date.now() - startedAt
  console.log(
    `[cron/weekly-digest] processed=${queued} sent=${sent} no_activity=${skippedNoActivity} skipped=${skippedPref} failed=${failed} elapsed=${elapsedMs}ms dryRun=${dryRun}`
  )

  return res.status(200).json({
    ok: true,
    dryRun,
    processed: queued,
    sent,
    skippedNoActivity,
    skippedPref,
    failed,
    elapsedMs,
  })
}
