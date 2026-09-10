// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Render a draft email without saving it or contacting an email provider.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireCampaignOwner } from "@/utils/email/campaigns/auth"
import { parseCampaignContent } from "@/utils/email/campaigns/store"
import { renderCampaignEmail } from "@/utils/email/campaigns/render"
import { CAMPAIGN_FOOTER } from "@/utils/email/campaigns/readiness"

export default apiHandler({
  async POST(req, res) {
    await requireCampaignOwner(req)
    const content = parseCampaignContent(req.body?.content)
    const origin = req.headers.origin as string
    return res.status(200).json(await renderCampaignEmail(content, {
      ...CAMPAIGN_FOOTER, assetBaseUrl: origin, unsubscribeUrl: `${origin}/campaign-unsubscribe/preview`,
    }))
  },
})
