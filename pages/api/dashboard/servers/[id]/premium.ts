// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server premium purchase API - deduct gems, extend premium
// ============================================================
// --- AI-REPLACED (2026-03-22) ---
// Reason: Server premium is now handled via Stripe recurring subscriptions
//         instead of LionGem deductions. This endpoint is deprecated.
// What the new code does better: Returns 410 Gone to inform any remaining
//         callers that gem-based premium purchases are no longer supported.
// --- Original code (commented out for rollback) ---
// import type { NextApiRequest, NextApiResponse } from "next"
// import { prisma } from "@/utils/prisma"
// import { requireAdmin } from "@/utils/adminAuth"
// import { apiHandler, parseBigInt } from "@/utils/apiHandler"
//
// const PLANS = {
//   monthly: { cost: 1500, durationDays: 30 },
//   quarterly: { cost: 4000, durationDays: 90 },
//   yearly: { cost: 12000, durationDays: 365 },
// } as const
//
// type PlanKey = keyof typeof PLANS
//
// export default apiHandler({
//   async POST(req, res) {
//     const guildId = parseBigInt(req.query.id, "id")
//     const auth = await requireAdmin(req, res, guildId)
//     if (!auth) return
//     const { plan } = req.body as { plan?: string }
//     if (!plan || !(plan in PLANS)) {
//       return res.status(400).json({ error: "Invalid plan." })
//     }
//     const { cost, durationDays } = PLANS[plan as PlanKey]
//     const userId = auth.userId
//     const userConfig = await prisma.user_config.findUnique({
//       where: { userid: userId }, select: { gems: true },
//     })
//     const gems = userConfig?.gems ?? 0
//     if (gems < cost) {
//       return res.status(400).json({ error: "Not enough gems", needed: cost, balance: gems })
//     }
//     // ... gem deduction + premium_guilds extension logic ...
//   },
// })
// --- End original code ---

import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: "Gem-based server premium purchases are no longer available. Please use the Stripe subscription at /dashboard/servers/[id]/settings.",
  })
}
// --- END AI-REPLACED ---
