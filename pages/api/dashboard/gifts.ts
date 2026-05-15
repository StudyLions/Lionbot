// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Dashboard data for /dashboard/gifts. Returns both gifts the
//          user has SENT (LionHeart user gifts + server gift subs) and
//          gifts they've RECEIVED (LionHeart gifts they claimed +
//          server gifts on any guild where they're an admin/member).
//
//          Sender side: queried by sender_userid / gifted_by_userid.
//          Recipient side: LionHeart claims are easy (recipient_userid
//          match). For server gifts received, we surface gifts on the
//          user's admin/mod guilds (any guild where the user has a
//          members row AND the row's gifted_by_userid is non-NULL).
//
//          Display data for senders / recipients is enriched from
//          guild_config.name and members.display_name; no Discord API
//          calls happen here (we cache what we know in DB).
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"

interface SentGift {
  kind: "server" | "lionheart"
  status: string
  giftId: number | null            // server gifts: server_premium_subscriptions.id; LH gifts: lionheart_gifts.id
  recipientLabel: string            // server name OR recipient display name OR "Pending claim"
  recipientIconUrl: string | null
  tier: string | null               // LionHeart tier; null for server gifts
  monthlyAmount: number | null      // EUR or USD; we render with user's current currency separately
  monthlyCurrency: "eur" | "usd" | null
  currentPeriodEnd: string | null   // ISO
  isAnonymous: boolean
  giftMessage: string | null
  claimUrl: string | null           // LH gifts pending claim: surface so sender can re-copy
  guildId: string | null            // server gifts only
}

interface ReceivedGift {
  kind: "server" | "lionheart"
  status: string
  senderDisplayName: string | null
  isAnonymous: boolean
  giftMessage: string | null
  tier: string | null
  currentPeriodEnd: string | null
  guildName: string | null          // server gifts only
  guildId: string | null
}

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

  const userIdBig = BigInt(auth.discordId)
  const baseUrl =
    req.headers.origin ||
    process.env.NEXTAUTH_URL ||
    "https://lionbot.org"

  // ─── Sent: LionHeart gifts ─────────────────────────────────
  const sentLionheart = await prisma.lionheart_gifts.findMany({
    where: { sender_userid: userIdBig },
    orderBy: { created_at: "desc" },
    take: 50,
  })

  // Resolve recipient display names for claimed gifts in one round-trip
  const claimedRecipientIds = sentLionheart
    .map((g) => g.recipient_userid)
    .filter((id): id is bigint => id != null)
  const recipientNames = claimedRecipientIds.length
    ? await prisma.members.findMany({
        where: { userid: { in: claimedRecipientIds }, display_name: { not: null } },
        select: { userid: true, display_name: true },
      })
    : []
  const recipientNameByUserid = new Map(
    recipientNames.map((m) => [m.userid.toString(), m.display_name]),
  )

  const sentLhFormatted: SentGift[] = sentLionheart.map((g) => {
    const recipientLabel =
      g.recipient_userid
        ? recipientNameByUserid.get(g.recipient_userid.toString()) ?? "Claimed"
        : g.status === "PENDING_CLAIM"
          ? "Pending claim"
          : g.status === "EXPIRED"
            ? "Expired (unclaimed)"
            : "—"
    return {
      kind: "lionheart",
      status: g.status,
      giftId: g.id,
      recipientLabel,
      recipientIconUrl: null,
      tier: g.tier,
      monthlyAmount: null, // tier-derived in the UI from SubscriptionData
      monthlyCurrency: null,
      currentPeriodEnd: g.current_period_end?.toISOString() ?? null,
      isAnonymous: g.gift_is_anonymous,
      giftMessage: g.gift_message,
      claimUrl:
        g.status === "PENDING_CLAIM"
          ? `${baseUrl}/gift/claim/${g.claim_token}`
          : null,
      guildId: null,
    }
  })

  // ─── Sent: server gifts ────────────────────────────────────
  const sentServer = await prisma.server_premium_subscriptions.findMany({
    where: { gifted_by_userid: userIdBig },
    orderBy: { created_at: "desc" },
    take: 50,
  })

  const sentGuildIds = sentServer.map((s) => s.guildid)
  const sentGuildConfigs = sentGuildIds.length
    ? await prisma.guild_config.findMany({
        where: { guildid: { in: sentGuildIds } },
        select: { guildid: true, name: true },
      })
    : []
  const guildNameById = new Map(
    sentGuildConfigs.map((g) => [g.guildid.toString(), g.name]),
  )

  const sentServerFormatted: SentGift[] = sentServer.map((s) => ({
    kind: "server",
    status: s.status,
    giftId: s.id,
    recipientLabel: guildNameById.get(s.guildid.toString()) ?? "Unknown server",
    recipientIconUrl: null,
    tier: null,
    monthlyAmount: null,
    monthlyCurrency: null,
    currentPeriodEnd: s.current_period_end?.toISOString() ?? null,
    isAnonymous: s.gift_is_anonymous,
    giftMessage: s.gift_message,
    claimUrl: null,
    guildId: s.guildid.toString(),
  }))

  // ─── Received: claimed LionHeart gifts ─────────────────────
  const receivedLionheart = await prisma.lionheart_gifts.findMany({
    where: { recipient_userid: userIdBig },
    orderBy: { claimed_at: "desc" },
    take: 50,
  })
  const senderIds = receivedLionheart
    .filter((g) => !g.gift_is_anonymous)
    .map((g) => g.sender_userid)
  const senderNames = senderIds.length
    ? await prisma.members.findMany({
        where: { userid: { in: senderIds }, display_name: { not: null } },
        select: { userid: true, display_name: true },
      })
    : []
  const senderNameById = new Map(
    senderNames.map((m) => [m.userid.toString(), m.display_name]),
  )

  const receivedLhFormatted: ReceivedGift[] = receivedLionheart.map((g) => ({
    kind: "lionheart",
    status: g.status,
    senderDisplayName: g.gift_is_anonymous
      ? null
      : senderNameById.get(g.sender_userid.toString()) ?? null,
    isAnonymous: g.gift_is_anonymous,
    giftMessage: g.gift_message,
    tier: g.tier,
    currentPeriodEnd: g.current_period_end?.toISOString() ?? null,
    guildName: null,
    guildId: null,
  }))

  // ─── Received: server gifts on guilds the user is in ──────
  // We surface server-gift rows on any guild the user is a member of, so
  // members of a gifted community see the gift in their dashboard too.
  // Restricting to admins-only feels less inclusive.
  const userMemberships = await prisma.members.findMany({
    where: { userid: userIdBig },
    select: { guildid: true },
  })
  const userGuildIds = userMemberships.map((m) => m.guildid)

  const receivedServer = userGuildIds.length
    ? await prisma.server_premium_subscriptions.findMany({
        where: {
          guildid: { in: userGuildIds },
          gifted_by_userid: { not: null },
          status: { in: ["ACTIVE", "CANCELLING", "PAST_DUE"] },
          // Don't echo back the user's own outgoing gifts here
          NOT: { gifted_by_userid: userIdBig },
        },
        orderBy: { created_at: "desc" },
        take: 50,
      })
    : []

  const receivedGuildIds = receivedServer.map((s) => s.guildid)
  const receivedGuildConfigs = receivedGuildIds.length
    ? await prisma.guild_config.findMany({
        where: { guildid: { in: receivedGuildIds } },
        select: { guildid: true, name: true },
      })
    : []
  const receivedGuildNameById = new Map(
    receivedGuildConfigs.map((g) => [g.guildid.toString(), g.name]),
  )
  const receivedSenderIds = receivedServer
    .filter((s) => !s.gift_is_anonymous && s.gifted_by_userid)
    .map((s) => s.gifted_by_userid!)
  const receivedSenderNames = receivedSenderIds.length
    ? await prisma.members.findMany({
        where: { userid: { in: receivedSenderIds }, display_name: { not: null } },
        select: { userid: true, display_name: true },
      })
    : []
  const receivedSenderNameById = new Map(
    receivedSenderNames.map((m) => [m.userid.toString(), m.display_name]),
  )

  const receivedServerFormatted: ReceivedGift[] = receivedServer.map((s) => ({
    kind: "server",
    status: s.status,
    senderDisplayName: s.gift_is_anonymous
      ? null
      : s.gifted_by_userid
        ? receivedSenderNameById.get(s.gifted_by_userid.toString()) ?? null
        : null,
    isAnonymous: s.gift_is_anonymous,
    giftMessage: s.gift_message,
    tier: null,
    currentPeriodEnd: s.current_period_end?.toISOString() ?? null,
    guildName: receivedGuildNameById.get(s.guildid.toString()) ?? null,
    guildId: s.guildid.toString(),
  }))

  return res.status(200).json({
    sent: [...sentLhFormatted, ...sentServerFormatted],
    received: [...receivedLhFormatted, ...receivedServerFormatted],
  })
}
