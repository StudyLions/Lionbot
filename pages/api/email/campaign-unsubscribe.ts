// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Scanner-safe unsubscribe lookup and signed RFC 8058 one-click POST.
// ============================================================
import { apiHandler, ValidationError } from "@/utils/apiHandler"
import { prisma } from "@/utils/prisma"
import { verifyCampaignUnsubscribeToken } from "@/utils/email/campaigns/tokens"
import { requireCampaignDatabase } from "@/utils/email/campaigns/readiness"
import { revokeCampaignConsentForEmail } from "@/utils/email/campaigns/consent"

async function recipientForToken(token: unknown) {
  const id = verifyCampaignUnsubscribeToken(token)
  if (!id) throw new ValidationError("This unsubscribe link is invalid. Open email settings from your LionBot account instead.", 400)
  await requireCampaignDatabase()
  const rows = await prisma.$queryRaw<Array<{ email: string; unsubscribed: boolean }>>`
    SELECT r.email, EXISTS (SELECT 1 FROM email_campaign_suppressions s WHERE s.email = r.email) AS unsubscribed
    FROM email_campaign_recipients r WHERE r.id = ${id}`
  if (!rows[0]) throw new ValidationError("This unsubscribe link is no longer available. Open email settings from your LionBot account instead.", 404)
  return rows[0]
}

export default apiHandler({
  async GET(req, res) {
    // Never mutate preferences on GET: mail scanners routinely visit links.
    res.setHeader("Referrer-Policy", "no-referrer")
    const recipient = await recipientForToken(req.query.token)
    return res.status(200).json({ valid: true, unsubscribed: recipient.unsubscribed })
  },
  async POST(req, res) {
    res.setHeader("Referrer-Policy", "no-referrer")
    const recipient = await recipientForToken(req.query.token || req.body?.token)
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`INSERT INTO email_campaign_suppressions (email, reason) VALUES (${recipient.email}, 'unsubscribed')
        ON CONFLICT (email) DO NOTHING`
      await revokeCampaignConsentForEmail(recipient.email, tx)
      await tx.$executeRaw`UPDATE user_config SET email_pref_announcements = false WHERE email IS NOT NULL AND lower(btrim(email)) = ${recipient.email}`
      await tx.$executeRaw`UPDATE email_campaign_recipients SET status = 'skipped', error = 'Recipient unsubscribed'
        WHERE email = ${recipient.email} AND status = 'pending'`
    })
    return res.status(200).json({ ok: true })
  },
})
