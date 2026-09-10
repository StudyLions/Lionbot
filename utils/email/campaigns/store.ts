// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Campaign drafts, immutable audience snapshots and durable delivery state.
// ============================================================
import crypto from "crypto"
import { Prisma } from "@prisma/client"
import { prisma } from "@/utils/prisma"
import { ValidationError } from "@/utils/apiHandler"
import { validateCampaignContent, type CampaignContent } from "./content"
import { getCampaignAudience } from "./consent"

export type CampaignStatus = "draft" | "queued" | "sending" | "paused" | "completed" | "cancelled"
export type RecipientStatus = "pending" | "sending" | "sent" | "failed" | "skipped" | "unknown"
export interface CampaignRow {
  id: string; name: string; status: CampaignStatus; mode: "campaign" | "test"; content: CampaignContent;
  created_by: string; created_at: Date; updated_at: Date; queued_at: Date | null; completed_at: Date | null; last_error: string | null
}
export interface RecipientRow {
  id: string; campaign_id: string; email: string; userid: bigint; status: RecipientStatus; attempts: number;
  payload: Record<string, unknown> | null; idempotency_key: string; first_attempt_at: Date | null;
  last_attempt_at: Date | null; next_attempt_at: Date; sent_at: Date | null; provider_id: string | null; error: string | null
}

function validName(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 120) throw new ValidationError("Give this campaign a name of 1–120 characters.")
  return value.trim()
}
export function parseCampaignContent(value: unknown): CampaignContent {
  try { return validateCampaignContent(value) } catch (error) {
    throw new ValidationError(error instanceof Error ? error.message : "Check the email content.")
  }
}
export function parseCampaignId(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) throw new ValidationError("Invalid campaign ID.")
  return value
}
export async function getCampaignRow(id: string, tx: Prisma.TransactionClient = prisma): Promise<CampaignRow> {
  const rows = await tx.$queryRaw<CampaignRow[]>`SELECT * FROM email_campaigns WHERE id = ${id}`
  if (!rows[0]) throw new ValidationError("Campaign not found.", 404)
  return rows[0]
}

export function campaignRevision(row: Pick<CampaignRow, "name" | "content">): string {
  // Hash a canonical field order so JSONB's object key order is immaterial.
  const c = row.content
  return crypto.createHash("sha256").update(JSON.stringify([row.name, c.subject, c.preheader, c.eyebrow,
    c.headline, c.body, c.ctaLabel, c.ctaUrl])).digest("hex")
}
function requireReviewedRevision(row: CampaignRow, expectedRevision: unknown): void {
  if (typeof expectedRevision !== "string" || expectedRevision !== campaignRevision(row)) {
    throw new ValidationError("This draft changed since you reviewed it. Refresh, review the latest email, and try again.", 409)
  }
}

async function campaignView(row: CampaignRow) {
  const values = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
    SELECT status, count(*) AS count FROM email_campaign_recipients WHERE campaign_id = ${row.id} GROUP BY status`
  const counts = { pending: 0, sending: 0, sent: 0, failed: 0, skipped: 0, unknown: 0, total: 0 }
  for (const value of values) {
    counts[value.status as RecipientStatus] = Number(value.count)
    counts.total += Number(value.count)
  }
  return { id: row.id, name: row.name, status: row.status, mode: row.mode, subject: row.content.subject,
    content: row.content, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
    queuedAt: row.queued_at?.toISOString() || null, completedAt: row.completed_at?.toISOString() || null,
    lastError: row.last_error, revision: campaignRevision(row), counts }
}

export async function listCampaigns() {
  const rows = await prisma.$queryRaw<CampaignRow[]>`SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 50`
  return Promise.all(rows.map(campaignView))
}
export async function getCampaign(id: string) {
  return campaignView(await getCampaignRow(id))
}
export async function getCampaignRecipients(id: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string; email: string; status: string; error: string; attempts: number; sent_at: Date | null; delivery_status: string; provider_id: string | null }>>`
    SELECT id, email, status, error, attempts, sent_at, delivery_status, provider_id FROM email_campaign_recipients
    WHERE campaign_id = ${id} ORDER BY CASE WHEN status IN ('unknown','failed') THEN 0 ELSE 1 END, created_at DESC, id LIMIT 100`
  return rows.map((row) => ({ id: row.id, status: row.status, error: row.error, attempts: row.attempts,
    sentAt: row.sent_at?.toISOString() || null, deliveryStatus: row.delivery_status, providerId: row.provider_id,
    maskedEmail: `${row.email.split("@")[0].slice(0, 2)}…@${row.email.split("@")[1] || ""}` }))
}
export async function createCampaign(nameInput: unknown, contentInput: unknown, owner: string) {
  const id = crypto.randomUUID()
  const name = validName(nameInput)
  const content = parseCampaignContent(contentInput)
  await prisma.$executeRaw`INSERT INTO email_campaigns (id, name, content, created_by)
    VALUES (${id}, ${name}, ${JSON.stringify(content)}::jsonb, ${owner})`
  return getCampaign(id)
}
export async function editCampaign(id: string, nameInput: unknown, contentInput: unknown, expectedRevision: unknown) {
  const name = validName(nameInput)
  const content = parseCampaignContent(contentInput)
  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<CampaignRow[]>`SELECT * FROM email_campaigns WHERE id = ${id} FOR UPDATE`
    const campaign = rows[0]
    if (!campaign || campaign.status !== "draft") throw new ValidationError("Only a draft can be edited. Queued emails and their recipients are frozen.", 409)
    requireReviewedRevision(campaign, expectedRevision)
    await tx.$executeRaw`UPDATE email_campaigns SET name = ${name}, content = ${JSON.stringify(content)}::jsonb,
      updated_at = now() WHERE id = ${id} AND status = 'draft'`
  })
  return getCampaign(id)
}

export async function queueCampaign(id: string, confirmSubject: unknown, expectedRevision: unknown, expectedRecipientCount: unknown) {
  const audience = await getCampaignAudience()
  if (!audience.recipients.length) throw new ValidationError("There are no eligible recipients yet. Recipients need a verified email and an explicit announcement opt-in.", 409)
  if (typeof expectedRecipientCount !== "number" || expectedRecipientCount !== audience.recipients.length) {
    throw new ValidationError("The eligible audience count changed. Refresh and review the recipient count before queueing.", 409)
  }
  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<CampaignRow[]>`SELECT * FROM email_campaigns WHERE id = ${id} FOR UPDATE`
    const campaign = rows[0]
    if (!campaign || campaign.status !== "draft") throw new ValidationError("Only a draft can be queued.", 409)
    requireReviewedRevision(campaign, expectedRevision)
    if (confirmSubject !== campaign.content.subject) throw new ValidationError("Type the exact email subject to confirm this campaign.")
    const seen = new Set<string>()
    const recipients = audience.recipients.flatMap((recipient) => {
      const email = recipient.email.trim().toLowerCase()
      if (seen.has(email)) return []
      seen.add(email)
      const recipientId = crypto.randomUUID()
      return [{ id: recipientId, email, userid: recipient.userid.toString(), key: `campaign/${id}/${recipientId}` }]
    })
    await tx.$executeRaw`INSERT INTO email_campaign_recipients (id, campaign_id, email, userid, idempotency_key)
      SELECT id, ${id}, email, userid::bigint, key FROM jsonb_to_recordset(${JSON.stringify(recipients)}::jsonb)
      AS r(id text, email text, userid text, key text) ON CONFLICT (campaign_id, email) DO NOTHING`
    await tx.$executeRaw`UPDATE email_campaigns SET status = 'queued', queued_at = now(), updated_at = now() WHERE id = ${id}`
  }, { timeout: 20000 })
  return getCampaign(id)
}

export async function changeCampaignState(id: string, action: "pause" | "resume" | "cancel") {
  const changed = action === "pause"
    ? await prisma.$executeRaw`UPDATE email_campaigns SET status = 'paused', updated_at = now() WHERE id = ${id} AND status IN ('queued','sending')`
    : action === "resume"
      ? await prisma.$executeRaw`UPDATE email_campaigns SET status = 'queued', last_error = NULL, updated_at = now() WHERE id = ${id} AND status = 'paused'`
      : await prisma.$executeRaw`UPDATE email_campaigns SET status = 'cancelled', updated_at = now() WHERE id = ${id} AND status IN ('draft','queued','sending','paused')`
  if (!changed) throw new ValidationError("This action is not available in the campaign's current state.", 409)
  if (action === "cancel") await prisma.$executeRaw`UPDATE email_campaign_recipients SET status = 'skipped', error = 'Campaign cancelled'
    WHERE campaign_id = ${id} AND status = 'pending'`
  return getCampaign(id)
}

export async function isOwnerTestEligible(email: string, userid: string | bigint): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ eligible: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM user_config WHERE userid = ${BigInt(userid)} AND lower(btrim(email)) = ${email}
      AND email_verified = true AND email_unsubscribed_all IS NOT TRUE)
    AND NOT EXISTS (SELECT 1 FROM user_config WHERE email IS NOT NULL AND lower(btrim(email)) = ${email} AND email_unsubscribed_all = true)
    AND NOT EXISTS (SELECT 1 FROM email_campaign_suppressions WHERE email = ${email}) AS eligible`
  return rows[0]?.eligible === true
}

export async function queueOwnerTest(id: string, owner: { userid: string; email: string | null }, expectedRevision: unknown) {
  if (!owner.email || !(await isOwnerTestEligible(owner.email, owner.userid))) {
    throw new ValidationError("Your signed-in account needs a verified email that is not unsubscribed or suppressed. Sign in again after confirming your Discord email.", 409)
  }
  const original = await getCampaignRow(id)
  requireReviewedRevision(original, expectedRevision)
  const testId = crypto.randomUUID()
  const recipientId = crypto.randomUUID()
  const content = { ...original.content, subject: `[Test] ${original.content.subject}`.slice(0, 140) }
  await prisma.$transaction(async (tx) => {
    // Serializes the owner test budget across serverless instances.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(9182060910)`
    const recent = await tx.$queryRaw<Array<{ count: bigint }>>`SELECT count(*) AS count FROM email_campaigns
      WHERE mode = 'test' AND created_by = ${owner.userid} AND created_at > now() - interval '1 hour'`
    if (Number(recent[0]?.count) >= 3) throw new ValidationError("Please wait: at most three owner test emails can be queued per hour.", 429)
    await tx.$executeRaw`INSERT INTO email_campaigns (id, name, status, mode, content, created_by, queued_at)
      VALUES (${testId}, ${`Test: ${original.name}`}, 'queued', 'test', ${JSON.stringify(content)}::jsonb, ${owner.userid}, now())`
    await tx.$executeRaw`INSERT INTO email_campaign_recipients (id, campaign_id, email, userid, idempotency_key)
      VALUES (${recipientId}, ${testId}, ${owner.email}, ${BigInt(owner.userid)}, ${`campaign/${testId}/${recipientId}`})`
  })
  return getCampaign(testId)
}

export async function acquireCampaignLease(owner: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ owner: string }>>`UPDATE email_campaign_worker_lock
    SET owner = ${owner}, expires_at = now() + interval '120 seconds'
    WHERE name = 'global' AND (expires_at < now() OR owner IS NULL) RETURNING owner`
  return rows[0]?.owner === owner
}
export async function releaseCampaignLease(owner: string): Promise<void> {
  await prisma.$executeRaw`UPDATE email_campaign_worker_lock SET owner = NULL, expires_at = now()
    WHERE name = 'global' AND owner = ${owner}`
}
export async function recoverInterruptedRecipients(): Promise<void> {
  // A platform termination can happen after Resend accepted an email. Only the
  // original payload and key may be retried, and only inside its 24-hour window.
  await prisma.$executeRaw`UPDATE email_campaign_recipients r SET status = CASE
      WHEN c.status = 'cancelled' THEN 'skipped'
      WHEN r.first_attempt_at < now() - interval '23 hours' THEN 'unknown' ELSE 'pending' END,
      error = CASE WHEN c.status = 'cancelled' THEN 'Campaign cancelled during interrupted attempt; delivery may have been accepted'
      WHEN r.first_attempt_at < now() - interval '23 hours'
      THEN 'Delivery needs manual review; the safe retry window has expired' ELSE 'Recovering an interrupted attempt' END
    FROM email_campaigns c WHERE c.id = r.campaign_id AND r.status = 'sending'
      AND r.last_attempt_at < now() - interval '120 seconds'`
}
export async function nextCampaignRecipient(): Promise<{ recipient: RecipientRow; campaign: CampaignRow } | null> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<RecipientRow[]>`SELECT r.* FROM email_campaign_recipients r
      JOIN email_campaigns c ON c.id = r.campaign_id WHERE r.status = 'pending' AND r.next_attempt_at <= now()
      AND c.status IN ('queued','sending') ORDER BY c.queued_at, r.created_at, r.id FOR UPDATE OF r SKIP LOCKED LIMIT 1`
    const recipient = rows[0]
    if (!recipient) return null
    const campaign = await getCampaignRow(recipient.campaign_id, tx)
    await tx.$executeRaw`UPDATE email_campaigns SET status = 'sending', updated_at = now()
      WHERE id = ${campaign.id} AND status = 'queued'`
    return { recipient, campaign }
  })
}
export async function completeFinishedCampaigns(): Promise<void> {
  await prisma.$executeRaw`UPDATE email_campaigns c SET status = 'completed', completed_at = now(), updated_at = now()
    WHERE c.status IN ('queued','sending') AND NOT EXISTS
      (SELECT 1 FROM email_campaign_recipients r WHERE r.campaign_id = c.id AND r.status IN ('pending','sending'))`
}
