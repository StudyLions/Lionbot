// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Verified, replay-safe Resend receipts and address-level suppression.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { getResend } from "@/utils/email/resend"
import { revokeCampaignConsentForEmail } from "@/utils/email/campaigns/consent"

export const config = { api: { bodyParser: false } }

export function campaignSuppressionReason(event: any): string | null {
  if (event.type === "email.complained") return "complaint"
  if (event.type === "email.suppressed") return "provider_suppressed"
  if (event.type === "email.bounced" && /^(permanent|hard)$/i.test(event.data?.bounce?.type || "")) return "hard_bounce"
  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }) }
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret || !process.env.RESEND_API_KEY) return res.status(503).json({ error: "Email webhook is not configured." })
  const id = req.headers["svix-id"]
  const timestamp = req.headers["svix-timestamp"]
  const signature = req.headers["svix-signature"]
  if (typeof id !== "string" || typeof timestamp !== "string" || typeof signature !== "string") return res.status(400).json({ error: "Missing webhook signature." })
  let event: any
  try {
    const buffers: Buffer[] = []
    let bytes = 0
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      bytes += buffer.length
      if (bytes > 256 * 1024) return res.status(413).json({ error: "Request too large." })
      buffers.push(buffer)
    }
    event = getResend().webhooks.verify({ payload: Buffer.concat(buffers).toString("utf8"),
      headers: { id, timestamp, signature }, webhookSecret })
  } catch { return res.status(400).json({ error: "Invalid webhook signature." }) }
  if (!event || typeof event.type !== "string") return res.status(400).json({ error: "Invalid event." })
  try {
    await prisma.$transaction(async (tx) => {
      const inserted = await tx.$executeRaw`INSERT INTO email_campaign_webhook_events (id, event_type)
        VALUES (${id}, ${event.type}) ON CONFLICT DO NOTHING`
      if (!inserted) return
      const reason = campaignSuppressionReason(event)
      if (reason && Array.isArray(event.data?.to)) {
        const addresses = Array.from(new Set<string>(event.data.to.filter((value: unknown) => typeof value === "string").map((value: string) => value.trim().toLowerCase())))
        for (const email of addresses) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) continue
          await tx.$executeRaw`INSERT INTO email_campaign_suppressions (email, reason) VALUES (${email}, ${reason})
            ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason`
          await revokeCampaignConsentForEmail(email, tx)
          await tx.$executeRaw`UPDATE email_campaign_recipients SET status = 'skipped', error = 'Address suppressed by provider'
            WHERE email = ${email} AND status = 'pending'`
        }
      }
      const providerId = event.data?.email_id
      const recipientId = event.data?.tags?.recipient_id || ""
      const occurredAt = new Date(event.created_at)
      if (typeof providerId !== "string" || !Number.isFinite(occurredAt.getTime())) return
      const status = event.type.replace(/^email\./, "")
      if (!["sent", "delivered", "delivery_delayed", "bounced", "complained", "failed", "suppressed"].includes(status)) return
      // Tags reconcile an interrupted send even if the HTTP result was never
      // recorded. Older webhook events cannot overwrite newer delivery state.
      await tx.$executeRaw`UPDATE email_campaign_recipients SET provider_id = ${providerId},
        status = 'sent', sent_at = COALESCE(sent_at, ${occurredAt}), error = NULL,
        delivery_status = ${status}, delivery_updated_at = ${occurredAt}
        WHERE (provider_id = ${providerId} OR (id = ${recipientId} AND provider_id IS NULL AND attempts > 0))
          AND (delivery_updated_at IS NULL OR delivery_updated_at <= ${occurredAt})`
    })
    return res.status(200).json({ ok: true })
  } catch {
    // Returning a failure prompts Resend to retry; the transaction rolls back
    // the event ID as well, so a transient database error never drops a receipt.
    console.error("[email-campaigns] Webhook storage failed")
    return res.status(503).json({ error: "Could not record the email event. Please retry." })
  }
}
