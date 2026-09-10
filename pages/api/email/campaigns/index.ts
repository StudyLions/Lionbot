// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Owner-only campaign list, setup readiness, audience counts and drafts.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireCampaignOwner } from "@/utils/email/campaigns/auth"
import { getCampaignReadiness, requireCampaignDatabase } from "@/utils/email/campaigns/readiness"
import { getCampaignAudience } from "@/utils/email/campaigns/consent"
import { listCampaigns, createCampaign } from "@/utils/email/campaigns/store"

export default apiHandler({
  async GET(req, res) {
    await requireCampaignOwner(req)
    const readiness = await getCampaignReadiness()
    if (!readiness.databaseReady) return res.status(200).json({ campaigns: [], readiness,
      audience: { counts: { total: 0, eligible: 0, unverified: 0, unconsented: 0, unsubscribed: 0, invalid: 0, suppressed: 0 } } })
    const [campaigns, audience] = await Promise.all([listCampaigns(), getCampaignAudience()])
    return res.status(200).json({ campaigns, readiness, audience: { counts: audience.counts } })
  },
  async POST(req, res) {
    const owner = await requireCampaignOwner(req)
    await requireCampaignDatabase()
    const campaign = await createCampaign(req.body?.name, req.body?.content, owner.userid)
    return res.status(201).json({ campaign })
  },
})
