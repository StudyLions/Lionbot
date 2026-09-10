// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Secret-protected, production-only bounded campaign worker.
// ============================================================
import { apiHandler } from "@/utils/apiHandler"
import { requireCampaignCron } from "@/utils/email/campaigns/auth"
import { getCampaignReadiness } from "@/utils/email/campaigns/readiness"
import { runCampaignWorker } from "@/utils/email/campaigns/worker"

export const config = { maxDuration: 60 }
export default apiHandler({
  async GET(req, res) {
    requireCampaignCron(req)
    const readiness = await getCampaignReadiness()
    if (!readiness.ready) return res.status(200).json({ processed: 0, disabled: true })
    return res.status(200).json(await runCampaignWorker())
  },
})
