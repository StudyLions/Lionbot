// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Fail-closed campaign configuration and migration readiness.
// ============================================================
import { prisma } from "@/utils/prisma"
import { ValidationError } from "@/utils/apiHandler"

export const CAMPAIGN_FOOTER = {
  senderName: process.env.EMAIL_SENDER_NAME || "Ari Horesh",
  postalAddress: process.env.EMAIL_POSTAL_ADDRESS || "Via Francesco Orsi 27, Pavia, Italy",
  vatNumber: process.env.EMAIL_VAT_NUMBER || "IT02865360180",
}

export function campaignConfigurationIssues(): string[] {
  const issues: string[] = []
  if (process.env.EMAIL_CAMPAIGN_SEND_ENABLED !== "true") issues.push("Campaign sending is switched off. Drafts and previews are available.")
  if (process.env.VERCEL_ENV !== "production") issues.push("Sending is only available on the production deployment.")
  if (!process.env.RESEND_API_KEY) issues.push("Resend API key is not configured.")
  if ((process.env.EMAIL_TOKEN_SECRET || "").length < 32) issues.push("A 32-character or longer unsubscribe signing secret is required.")
  if (!process.env.RESEND_WEBHOOK_SECRET) issues.push("A verified Resend webhook must be configured for bounces and complaints.")
  if (!process.env.CRON_SECRET) issues.push("The campaign worker's cron secret is not configured.")
  if (!CAMPAIGN_FOOTER.postalAddress.trim() || !CAMPAIGN_FOOTER.senderName.trim() || !CAMPAIGN_FOOTER.vatNumber.trim()) issues.push("Complete the sender name, postal address and P.IVA before sending.")
  return issues
}

export async function campaignDatabaseReady(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ ready: boolean }>>`
    SELECT to_regclass('public.email_campaigns') IS NOT NULL
       AND to_regclass('public.email_campaign_recipients') IS NOT NULL
       AND to_regclass('public.email_campaign_suppressions') IS NOT NULL
       AND to_regclass('public.email_campaign_subscriptions') IS NOT NULL
       AND to_regclass('public.email_campaign_webhook_events') IS NOT NULL
       AND to_regclass('public.email_campaign_worker_lock') IS NOT NULL AS ready`
  if (rows[0]?.ready !== true) return false
  const provenance = await prisma.$queryRaw<Array<{ ready: boolean }>>`
    SELECT (SELECT count(*) = 3 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'email_campaign_subscriptions'
        AND column_name IN ('source', 'imported_at', 'evidence_note'))
      AND EXISTS (SELECT 1 FROM pg_constraint
        WHERE conrelid = to_regclass('public.email_campaign_subscriptions')
          AND conname = 'email_campaign_subscriptions_provenance_check' AND convalidated) AS ready`
  if (provenance[0]?.ready !== true) return false
  const indexes = await prisma.$queryRaw<Array<{ ready: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM pg_index WHERE indexrelid = to_regclass('public.user_config_campaign_email_idx')
      AND indisvalid) AS ready`
  return indexes[0]?.ready === true
}

export async function getCampaignReadiness() {
  const issues = campaignConfigurationIssues()
  let databaseReady = false
  try { databaseReady = await campaignDatabaseReady() } catch { /* Do not expose database details. */ }
  if (!databaseReady) issues.push("Apply the campaign, consent, external-consent and email-index migrations before saving or sending campaigns.")
  return { ready: issues.length === 0, issues, databaseReady, sendEnabled: process.env.EMAIL_CAMPAIGN_SEND_ENABLED === "true" }
}

export async function requireCampaignDatabase(): Promise<void> {
  if (!(await campaignDatabaseReady())) throw new ValidationError("Email campaigns need their database migrations. Draft previews are still available.", 503)
}

export async function requireCampaignSending(): Promise<void> {
  const readiness = await getCampaignReadiness()
  if (!readiness.ready) throw new ValidationError(readiness.issues.join(" "), 409)
}
