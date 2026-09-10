// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Owner-only campaign detail and editable drafts.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireCampaignOwner } from "@/utils/email/campaigns/auth"
import { requireCampaignDatabase } from "@/utils/email/campaigns/readiness"
import { parseCampaignId, getCampaign, getCampaignRecipients, editCampaign } from "@/utils/email/campaigns/store"

export default apiHandler({
  async GET(req, res) {
    await requireCampaignOwner(req)
    await requireCampaignDatabase()
    const id = parseCampaignId(req.query.id)
    const campaign = await getCampaign(id)
    return res.status(200).json({ campaign, recipients: await getCampaignRecipients(id) })
  },
  async PATCH(req, res) {
    await requireCampaignOwner(req)
    await requireCampaignDatabase()
    const campaign = await editCampaign(parseCampaignId(req.query.id), req.body?.name, req.body?.content, req.body?.revision)
    return res.status(200).json({ campaign })
  },
})
