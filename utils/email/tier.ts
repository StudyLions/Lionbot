// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Tiny helper that maps a user's row in user_subscriptions
//          to the PromoTier our email components understand. Lives
//          in utils/email so triggers and crons can import it
//          without pulling in any rendering deps.
// ============================================================
import { prisma } from "../prisma"
import type { PromoTier } from "../../emails/components/PremiumPromo"

const TIER_MAP: Record<string, PromoTier> = {
  LIONHEART: "lionheart",
  LIONHEART_PLUS: "lionheart_plus",
  LIONHEART_PLUS_PLUS: "lionheart_plus_plus",
}

export async function getPromoTierForUser(userid: bigint): Promise<PromoTier> {
  try {
    const sub = await prisma.user_subscriptions.findUnique({
      where: { userid },
      select: { tier: true, status: true },
    })
    if (!sub || sub.tier === "NONE" || sub.status === "INACTIVE") return "free"
    return TIER_MAP[sub.tier] ?? "free"
  } catch {
    return "free"
  }
}
