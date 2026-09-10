// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Include campaign records in account export and erasure
//          while retaining minimal address-level delivery blocks.
// ============================================================
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"

type Db = Prisma.TransactionClient
type Tables = { campaigns: boolean; recipients: boolean; subscriptions: boolean; suppressions: boolean }

async function campaignTables(db: Db): Promise<Tables> {
  const rows = await db.$queryRaw<Tables[]>`
    SELECT to_regclass('public.email_campaigns') IS NOT NULL AS campaigns,
      to_regclass('public.email_campaign_recipients') IS NOT NULL AS recipients,
      to_regclass('public.email_campaign_subscriptions') IS NOT NULL AS subscriptions,
      to_regclass('public.email_campaign_suppressions') IS NOT NULL AS suppressions`
  return rows[0]
}

function ownedAddresses(userid: bigint, tables: Tables) {
  // Historical addresses are included only through rows belonging to this user.
  // Never return another account's recipient or consent records for a shared email.
  return Prisma.sql`
    SELECT lower(btrim(email)) AS email FROM user_config WHERE userid = ${userid} AND email IS NOT NULL AND btrim(email) <> ''
    ${tables.recipients ? Prisma.sql`UNION SELECT email FROM email_campaign_recipients WHERE userid = ${userid}` : Prisma.empty}
    ${tables.subscriptions ? Prisma.sql`UNION SELECT email FROM email_campaign_subscriptions WHERE userid = ${userid}` : Prisma.empty}`
}

export async function getUserCampaignPrivacyData(userid: bigint, db: Db = prisma) {
  const tables = await campaignTables(db)
  const [subscriptions, deliveries, suppressions] = await Promise.all([
    tables.subscriptions ? db.$queryRaw<Array<{ email: string; consented_at: Date; revoked_at: Date | null }>>`
      SELECT email, consented_at, revoked_at FROM email_campaign_subscriptions
      WHERE userid = ${userid} ORDER BY consented_at` : [],
    tables.recipients ? db.$queryRaw<Array<{
      email: string; subject: string; status: string; delivery_status: string | null;
      created_at: Date; first_attempt_at: Date | null; last_attempt_at: Date | null; sent_at: Date | null;
    }>>`
      SELECT r.email, c.content->>'subject' AS subject, r.status, r.delivery_status,
        r.created_at, r.first_attempt_at, r.last_attempt_at, r.sent_at
      FROM email_campaign_recipients r JOIN email_campaigns c ON c.id = r.campaign_id
      WHERE r.userid = ${userid} ORDER BY r.created_at` : [],
    tables.suppressions ? db.$queryRaw<Array<{ email: string; reason: string; created_at: Date }>>(Prisma.sql`
      SELECT email, reason, created_at FROM email_campaign_suppressions
      WHERE email IN (${ownedAddresses(userid, tables)}) ORDER BY created_at`) : [],
  ])
  return {
    subscriptions,
    deliveries,
    suppressions,
    suppression_retention: "Minimal email address, reason, and date records are retained after account deletion to honor opt-outs and avoid blocked deliveries.",
  }
}

export async function getUserCampaignPrivacyCounts(userid: bigint, db: Db = prisma) {
  const tables = await campaignTables(db)
  const rows = await db.$queryRaw<Array<{ recipients: bigint; subscriptions: bigint; suppressions: bigint; campaigns: bigint }>>(Prisma.sql`
    SELECT
      ${tables.recipients ? Prisma.sql`(SELECT count(*) FROM email_campaign_recipients WHERE userid = ${userid})` : Prisma.sql`0::bigint`} AS recipients,
      ${tables.subscriptions ? Prisma.sql`(SELECT count(*) FROM email_campaign_subscriptions WHERE userid = ${userid})` : Prisma.sql`0::bigint`} AS subscriptions,
      ${tables.suppressions ? Prisma.sql`(SELECT count(*) FROM email_campaign_suppressions WHERE email IN (${ownedAddresses(userid, tables)}))` : Prisma.sql`0::bigint`} AS suppressions,
      ${tables.campaigns ? Prisma.sql`(SELECT count(*) FROM email_campaigns WHERE created_by = ${userid.toString()})` : Prisma.sql`0::bigint`} AS campaigns`)
  const row = rows[0]
  return {
    recipients: Number(row.recipients), subscriptions: Number(row.subscriptions),
    suppressions: Number(row.suppressions), campaigns: Number(row.campaigns),
  }
}

export async function deleteUserCampaignData(userid: bigint, db: Db) {
  const tables = await campaignTables(db)
  const before = await getUserCampaignPrivacyCounts(userid, db)
  // Execute inside the caller's account-deletion transaction. Deleting the
  // complete recipient row also removes the stored payload and signed opt-out URL.
  const recipients = tables.recipients
    ? await db.$executeRaw`DELETE FROM email_campaign_recipients WHERE userid = ${userid}` : 0
  const subscriptions = tables.subscriptions
    ? await db.$executeRaw`DELETE FROM email_campaign_subscriptions WHERE userid = ${userid}` : 0
  const campaigns = tables.campaigns
    ? await db.$executeRaw`UPDATE email_campaigns SET created_by = '0' WHERE created_by = ${userid.toString()}` : 0
  // Address-level suppression has no user link or campaign payload. Clearing it
  // during erasure could send mail again to a shared address that opted out.
  return { recipients, subscriptions, campaigns, suppressionsRetained: before.suppressions }
}
