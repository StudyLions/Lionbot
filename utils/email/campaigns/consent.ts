// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Address-bound campaign consent and send-time audience checks.
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { buildCampaignAudience, normalizeCampaignEmail, isValidCampaignEmail, type CampaignAudienceRow } from "./eligibility"

type Db = Prisma.TransactionClient

async function loadAudienceRows(email?: string, db: Db = prisma): Promise<CampaignAudienceRow[]> {
  return db.$queryRaw<CampaignAudienceRow[]>(Prisma.sql`
    SELECT lower(btrim(u.email)) AS email, u.userid::text AS userid,
      u.email_verified AS verified,
      u.email_unsubscribed_all AS unsubscribed,
      u.email_pref_announcements AS announcements,
      (s.userid = u.userid AND s.revoked_at IS NULL) IS TRUE AS consented,
      (x.email IS NOT NULL) AS suppressed
    FROM user_config u
    LEFT JOIN email_campaign_subscriptions s ON s.email = lower(btrim(u.email))
    LEFT JOIN email_campaign_suppressions x ON x.email = lower(btrim(u.email))
    WHERE u.email IS NOT NULL AND btrim(u.email) <> ''
      ${email ? Prisma.sql`AND lower(btrim(u.email)) = ${email}` : Prisma.empty}
  `)
}

export async function getCampaignAudience(db: Db = prisma) {
  return buildCampaignAudience(await loadAudienceRows(undefined, db))
}

export async function isCampaignRecipientEligible(email: string, userid?: string, db: Db = prisma): Promise<boolean> {
  const normalized = normalizeCampaignEmail(email)
  if (!isValidCampaignEmail(normalized)) return false
  const recipient = buildCampaignAudience(await loadAudienceRows(normalized, db)).recipients[0]
  return Boolean(recipient && (userid === undefined || recipient.userid === userid))
}

export async function getCampaignConsentStatus(userid: bigint, email: string | null, db: Db = prisma) {
  if (!email) return { campaignOptIn: false, campaignConsentAt: null, campaignSuppressed: false }
  const rows = await db.$queryRaw<{ consented_at: Date | null; reason: string | null }[]>(Prisma.sql`
    SELECT s.consented_at, x.reason FROM (SELECT ${normalizeCampaignEmail(email)}::text AS email) a
    LEFT JOIN email_campaign_subscriptions s ON s.email = a.email AND s.userid = ${userid} AND s.revoked_at IS NULL
    LEFT JOIN email_campaign_suppressions x ON x.email = a.email
  `)
  return {
    campaignOptIn: Boolean(rows[0]?.consented_at),
    campaignConsentAt: rows[0]?.consented_at?.toISOString() ?? null,
    campaignSuppressed: Boolean(rows[0]?.reason),
  }
}

export async function revokeCampaignConsentForEmail(email: string, db: Db = prisma) {
  await db.$executeRaw(Prisma.sql`
    UPDATE email_campaign_subscriptions SET revoked_at = COALESCE(revoked_at, NOW())
    WHERE email = ${normalizeCampaignEmail(email)}
  `)
}

export async function revokeCampaignConsentForUser(userid: bigint, db: Db = prisma) {
  // Include this user's current address, even if its consent belongs to another
  // linked account; an address-level opt-out must not be undone by a legacy toggle.
  await db.$executeRaw(Prisma.sql`
    UPDATE email_campaign_subscriptions SET revoked_at = COALESCE(revoked_at, NOW())
    WHERE userid = ${userid} OR email IN (
      SELECT lower(btrim(email)) FROM user_config WHERE userid = ${userid} AND email IS NOT NULL
    )
  `)
}

export async function setCampaignConsent(userid: bigint, email: string, enabled: boolean, db: Db = prisma) {
  const normalized = normalizeCampaignEmail(email)
  if (!enabled) return revokeCampaignConsentForUser(userid, db)
  if (!isValidCampaignEmail(normalized)) throw new Error("A valid email address is required for campaign opt-in")
  // Changing the Discord address must never carry consent to a new address.
  await db.$executeRaw(Prisma.sql`
    UPDATE email_campaign_subscriptions SET revoked_at = COALESCE(revoked_at, NOW())
    WHERE userid = ${userid} AND email <> ${normalized}
  `)
  await db.$executeRaw(Prisma.sql`
    INSERT INTO email_campaign_subscriptions (email, userid, consented_at, revoked_at)
    VALUES (${normalized}, ${userid}, NOW(), NULL)
    ON CONFLICT (email) DO UPDATE SET userid = EXCLUDED.userid,
      consented_at = EXCLUDED.consented_at, revoked_at = NULL
  `)
  // A fresh, explicit opt-in may reverse unsubscribe only. Delivery failures and
  // complaints remain suppressed until reviewed by the operator.
  await db.$executeRaw(Prisma.sql`
    DELETE FROM email_campaign_suppressions WHERE email = ${normalized} AND reason = 'unsubscribed'
  `)
}
