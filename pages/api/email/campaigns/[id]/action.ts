// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Explicit owner actions for queueing, pausing, resuming and tests.
// ============================================================
import { apiHandler, ValidationError } from "@/utils/apiHandler"
import { requireCampaignOwner } from "@/utils/email/campaigns/auth"
import { requireCampaignDatabase, requireCampaignSending } from "@/utils/email/campaigns/readiness"
import { parseCampaignId, getCampaign, queueCampaign, changeCampaignState, queueOwnerTest } from "@/utils/email/campaigns/store"

export default apiHandler({
  async POST(req, res) {
    const owner = await requireCampaignOwner(req)
    await requireCampaignDatabase()
    const id = parseCampaignId(req.query.id)
    const action = req.body?.action
    if (action === "queue") {
      await requireCampaignSending()
      return res.status(200).json({ campaign: await queueCampaign(id, req.body?.confirmSubject, req.body?.revision, req.body?.recipientCount), message: "Campaign queued. Eligible recipients are now frozen; unsubscribes remain effective before delivery." })
    }
    if (action === "test") {
      await requireCampaignSending()
      const test = await queueOwnerTest(id, owner, req.body?.revision)
      return res.status(200).json({ campaign: await getCampaign(id), testCampaignId: test.id, message: "Test email queued for your signed-in account." })
    }
    if (action === "pause" || action === "resume" || action === "cancel") {
      if (action === "resume") await requireCampaignSending()
      const campaign = await changeCampaignState(id, action)
      return res.status(200).json({ campaign, message: action === "pause" || action === "cancel"
        ? `Campaign ${action === "pause" ? "paused" : "cancelled"}. An email already in progress may still finish.` : "Campaign resumed." })
    }
    throw new ValidationError("Choose queue, test, pause, resume or cancel.")
  },
})
