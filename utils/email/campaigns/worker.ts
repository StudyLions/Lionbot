// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Bounded, rate-limited delivery with persisted payloads and safe retries.
// ============================================================
import crypto from "crypto"
import { prisma } from "@/utils/prisma"
import { brand } from "@/utils/email/brand"
import { renderCampaignEmail } from "./render"
import { isCampaignRecipientEligible } from "./consent"
import { createCampaignUnsubscribeToken } from "./tokens"
import { CAMPAIGN_FOOTER, campaignConfigurationIssues, requireCampaignSending } from "./readiness"
import { acquireCampaignLease, releaseCampaignLease, recoverInterruptedRecipients, nextCampaignRecipient,
  completeFinishedCampaigns, isOwnerTestEligible, type RecipientRow } from "./store"

export const SAFE_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000
export function withinSafeRetryWindow(firstAttemptAt: Date | null, now = Date.now()): boolean {
  return !firstAttemptAt || now - firstAttemptAt.getTime() < SAFE_RETRY_WINDOW_MS
}

export type ProviderOutcome = { kind: "sent"; id: string } | {
  kind: "retry" | "failed" | "unknown" | "pause"; reason: string; delaySeconds?: number
}
export function classifyCampaignProviderResponse(status: number, body: any, retryAfter?: string | null): ProviderOutcome {
  if (status >= 200 && status < 300 && typeof body?.id === "string") return { kind: "sent", id: body.id }
  const name = typeof body?.name === "string" ? body.name : ""
  if (status === 429) {
    if (/daily|monthly|quota/i.test(name)) return { kind: "pause", reason: "Provider quota reached. Review your Resend plan before resuming." }
    return { kind: "retry", reason: "Provider rate limit; waiting before retrying.", delaySeconds: Math.min(86400, Math.max(60, Number(retryAfter) || 60)) }
  }
  if (status === 401 || status === 403) return { kind: "pause", reason: "Resend rejected the sending configuration. Check the API key, sending domain and account limits." }
  if (status === 409) {
    if (name === "concurrent_idempotent_requests") return { kind: "retry", reason: "A matching request is still being processed.", delaySeconds: 60 }
    return { kind: "unknown", reason: "Provider idempotency conflict; review this delivery manually." }
  }
  if (status >= 400 && status < 500) return { kind: "failed", reason: "Resend rejected this email request. Review its content and sender configuration." }
  return { kind: "retry", reason: "Provider response was uncertain; retrying only with the original payload and key.", delaySeconds: 120 }
}

// Direct HTTP provides a bounded timeout and Retry-After access. The same stable
// JSON payload and idempotency key are reused for every attempt.
export async function sendCampaignPayload(payload: Record<string, unknown>, idempotencyKey: string): Promise<ProviderOutcome> {
  if (campaignConfigurationIssues().length) return { kind: "pause", reason: "Campaign sending is unavailable in this environment." }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    })
    const body = await response.json().catch(() => null)
    return classifyCampaignProviderResponse(response.status, body, response.headers.get("retry-after"))
  } catch {
    return { kind: "retry", reason: "Delivery outcome is uncertain after a connection interruption; the original request will be retried safely.", delaySeconds: 120 }
  } finally { clearTimeout(timeout) }
}

async function markRecipient(recipient: RecipientRow, status: string, error: string): Promise<void> {
  await prisma.$executeRaw`UPDATE email_campaign_recipients SET status = ${status}, error = ${error} WHERE id = ${recipient.id} AND status <> 'sent'`
}

export async function runCampaignWorker() {
  await requireCampaignSending()
  const lease = crypto.randomUUID()
  if (!(await acquireCampaignLease(lease))) return { processed: 0, message: "Another worker is active." }
  const started = Date.now()
  let processed = 0
  try {
    await recoverInterruptedRecipients()
    while (processed < 20 && Date.now() - started < 40000) {
      if (campaignConfigurationIssues().length) break
      const item = await nextCampaignRecipient()
      if (!item) break
      const { recipient, campaign } = item
      if (!withinSafeRetryWindow(recipient.first_attempt_at)) {
        await markRecipient(recipient, "unknown", "Delivery needs manual review; the safe retry window has expired.")
        processed++
        continue
      }
      const eligible = campaign.mode === "test"
        ? await isOwnerTestEligible(recipient.email, recipient.userid)
        : await isCampaignRecipientEligible(recipient.email, recipient.userid.toString())
      if (!eligible) {
        await markRecipient(recipient, "skipped", "Recipient unsubscribed, became ineligible, or was suppressed before sending.")
        processed++
        continue
      }
      let payload = recipient.payload
      if (!payload) {
        const token = createCampaignUnsubscribeToken(recipient.id)
        const site = brand.siteUrl.replace(/\/$/, "")
        const oneClickUrl = `${site}/api/email/campaign-unsubscribe?token=${encodeURIComponent(token)}`
        const unsubscribeUrl = `${site}/campaign-unsubscribe/${encodeURIComponent(token)}`
        let rendered: { html: string; text: string }
        try {
          rendered = await renderCampaignEmail(campaign.content, { ...CAMPAIGN_FOOTER, unsubscribeUrl })
        } catch {
          await prisma.$executeRaw`UPDATE email_campaigns SET status = 'paused',
            last_error = 'The email could not be rendered. Review the frozen template and sender configuration before resuming.', updated_at = now()
            WHERE id = ${campaign.id} AND status IN ('queued','sending')`
          break
        }
        payload = { from: brand.fromMarketing, to: [recipient.email], subject: campaign.content.subject,
          html: rendered.html, text: rendered.text, reply_to: brand.replyTo,
          headers: { "List-Unsubscribe": `<${oneClickUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
          tags: [{ name: "campaign_id", value: campaign.id }, { name: "recipient_id", value: recipient.id }] }
      }
      // Persist before crossing the network boundary. Recheck campaign state at
      // the last database boundary so pause/cancel stops subsequent requests.
      const stillEligible = campaign.mode === "test"
        ? await isOwnerTestEligible(recipient.email, recipient.userid)
        : await isCampaignRecipientEligible(recipient.email, recipient.userid.toString())
      if (!stillEligible) {
        await markRecipient(recipient, "skipped", "Recipient became ineligible before sending.")
        processed++
        continue
      }
      const saved = await prisma.$executeRaw`UPDATE email_campaign_recipients r SET payload = ${JSON.stringify(payload)}::jsonb,
        status = 'sending', first_attempt_at = COALESCE(first_attempt_at, now()), last_attempt_at = now(), attempts = attempts + 1
        WHERE r.id = ${recipient.id} AND r.status = 'pending' AND EXISTS
          (SELECT 1 FROM email_campaigns c WHERE c.id = r.campaign_id AND c.status IN ('queued','sending'))`
      if (!saved) continue
      const outcome = await sendCampaignPayload(payload, recipient.idempotency_key)
      processed++
      if (outcome.kind === "sent") {
        await prisma.$executeRaw`UPDATE email_campaign_recipients SET status = 'sent', provider_id = ${outcome.id}, sent_at = COALESCE(sent_at, now()), error = NULL
          WHERE id = ${recipient.id}`
      } else if (outcome.kind === "pause") {
        await markRecipient(recipient, "pending", outcome.reason)
        await prisma.$executeRaw`UPDATE email_campaigns SET status = 'paused', last_error = ${outcome.reason}, updated_at = now()
          WHERE id = ${campaign.id} AND status IN ('queued','sending')`
        break
      } else if (outcome.kind === "retry" && recipient.attempts < 4) {
        const delay = Math.max(outcome.delaySeconds || 60, Math.pow(2, recipient.attempts) * 60)
        await prisma.$executeRaw`UPDATE email_campaign_recipients SET status = 'pending', error = ${outcome.reason},
          next_attempt_at = now() + (${delay} * interval '1 second') WHERE id = ${recipient.id} AND status <> 'sent'`
        // A shared provider limit could affect other campaigns too.
        if (outcome.reason.includes("rate limit")) break
      } else {
        await markRecipient(recipient, outcome.kind === "failed" ? "failed" : "unknown",
          outcome.kind === "retry" ? "Delivery needs manual review after repeated uncertain responses." : outcome.reason)
      }
      await new Promise((resolve) => setTimeout(resolve, 1100))
    }
    await completeFinishedCampaigns()
    return { processed, message: "Worker pass completed." }
  } finally {
    await releaseCampaignLease(lease)
  }
}
