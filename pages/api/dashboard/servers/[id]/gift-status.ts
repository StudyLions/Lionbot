// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Returns gift-premium info for the server dashboard card.
//          Only members of the guild can see this; we don't require
//          admin since regular members might find the "your community
//          received a gift" framing motivating, and the gifter info
//          isn't sensitive when not anonymous.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  const guildIdRaw = req.query.id
  if (typeof guildIdRaw !== "string") {
    return res.status(400).json({ error: "Missing guildId" })
  }

  let guildId: bigint
  try {
    guildId = BigInt(guildIdRaw)
  } catch {
    return res.status(400).json({ error: "Invalid guildId" })
  }

  // Must be a member of the guild
  const isMember = await prisma.members.findFirst({
    where: { guildid: guildId, userid: BigInt(auth.discordId) },
    select: { userid: true },
  })
  if (!isMember) {
    return res.status(404).json({ active: false })
  }

  // Find the most recent active gift sub for this guild
  const gift = await prisma.server_premium_subscriptions.findFirst({
    where: {
      guildid: guildId,
      gifted_by_userid: { not: null },
      status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
    },
    orderBy: { created_at: "desc" },
  })

  if (!gift || !gift.gifted_by_userid) {
    return res.status(200).json({ active: false })
  }

  let senderDisplayName: string | null = null
  if (!gift.gift_is_anonymous) {
    const sender = await prisma.members.findFirst({
      where: { userid: gift.gifted_by_userid, display_name: { not: null } },
      select: { display_name: true },
      orderBy: { first_joined: "desc" },
    })
    senderDisplayName = sender?.display_name ?? null
  }

  return res.status(200).json({
    active: true,
    senderDisplayName,
    senderAvatarUrl: null, // We don't have a Discord avatar cache; fall back to icon mark
    isAnonymous: gift.gift_is_anonymous,
    giftMessage: gift.gift_message,
    currentPeriodEnd: gift.current_period_end?.toISOString() ?? null,
  })
}
