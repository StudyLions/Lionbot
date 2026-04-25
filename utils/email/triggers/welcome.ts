// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Welcome-email trigger called from the NextAuth signIn
//          event. Decides between the member and admin variant by
//          looking at the user's Discord guild list and the bot's
//          membership rows, then sends the right template through
//          the standard sendEmail() pipeline.
//
//          - Idempotent: sets user_config.email_welcomed_at so a
//            second sign-in does not double-send.
//          - Best-effort: every code path catches its own errors so
//            sign-in is never blocked by an email hiccup.
// ============================================================
import * as React from "react"
import { prisma } from "../../prisma"
import { isResendConfigured } from "../resend"
import { sendEmail, isEmailSendingEnabled } from "../send"
import { getPromoTierForUser } from "../tier"
import WelcomeMember from "../../../emails/WelcomeMember"
import WelcomeAdmin, {
  AdminGuildSummary,
} from "../../../emails/WelcomeAdmin"

const ADMINISTRATOR = BigInt(0x8)

interface DiscordPartialGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

function discordIconUrl(guildId: string, hash: string | null): string | null {
  if (!hash) return null
  const ext = hash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/icons/${guildId}/${hash}.${ext}?size=64`
}

async function fetchUserGuildsForWelcome(
  accessToken: string
): Promise<DiscordPartialGuild[]> {
  try {
    const res = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) return []
    return (await res.json()) as DiscordPartialGuild[]
  } catch {
    return []
  }
}

async function pickAdminGuilds(
  accessToken: string
): Promise<AdminGuildSummary[]> {
  const guilds = await fetchUserGuildsForWelcome(accessToken)
  const ownedOrAdmin = guilds.filter((g) => {
    if (g.owner) return true
    try {
      return (BigInt(g.permissions) & ADMINISTRATOR) === ADMINISTRATOR
    } catch {
      return false
    }
  })
  if (ownedOrAdmin.length === 0) return []

  const guildIds = ownedOrAdmin.map((g) => BigInt(g.id))
  // Cross-reference with the bot's guild_config rows: a row exists for
  // every server the bot has ever been in. Filtering by this means we
  // only count "their servers running LionBot," not all admin'd servers.
  const present = await prisma.guild_config.findMany({
    where: { guildid: { in: guildIds } },
    select: { guildid: true },
  })
  const presentSet = new Set(present.map((p) => p.guildid.toString()))

  return ownedOrAdmin
    .filter((g) => presentSet.has(g.id))
    .slice(0, 10)
    .map((g) => ({
      id: g.id,
      name: g.name,
      iconUrl: discordIconUrl(g.id, g.icon),
    }))
}

interface SendWelcomeArgs {
  discordId: string
  email: string | null | undefined
  emailVerified: boolean | null | undefined
  accessToken?: string | null
  displayName?: string | null
}

export async function maybeSendWelcomeEmail(args: SendWelcomeArgs): Promise<void> {
  const { discordId, email, emailVerified, accessToken, displayName } = args
  if (!discordId || !email || emailVerified === false) return
  // Master kill switch: bail out before we make any Discord API or DB
  // calls. Means the sign-in handler stays a fast path while the email
  // system is dormant.
  if (!isEmailSendingEnabled()) return
  if (!isResendConfigured()) return

  let userid: bigint
  try {
    userid = BigInt(discordId)
  } catch {
    return
  }

  // Idempotency check: a user_config row will exist because the NextAuth
  // signIn event upserts it before this function is called. We only send
  // once, but if email_welcomed_at is null and we pass the pref check
  // we'll send and stamp.
  const existing = await prisma.user_config.findUnique({
    where: { userid },
    select: {
      email_welcomed_at: true,
      email_unsubscribed_all: true,
      email_pref_welcome: true,
      name: true,
    },
  })
  if (!existing) return
  if (existing.email_welcomed_at) return
  if (existing.email_unsubscribed_all) return
  if (existing.email_pref_welcome === false) return

  const firstName =
    (displayName ?? existing.name ?? email.split("@")[0] ?? "there")
      .trim()
      .split(/\s+/)[0] || "there"

  const adminGuilds = accessToken ? await pickAdminGuilds(accessToken) : []
  const promoTier = await getPromoTierForUser(userid)

  const isAdmin = adminGuilds.length > 0
  const subject = isAdmin
    ? `Welcome to LionBot — your ${adminGuilds.length === 1 ? "server" : "servers"} are ready`
    : `Welcome to LionBot, ${firstName} — let's get you set up`

  const react = isAdmin
    ? React.createElement(WelcomeAdmin, {
        firstName,
        guilds: adminGuilds,
        premiumTier: promoTier,
      })
    : React.createElement(WelcomeMember, {
        firstName,
        premiumTier: promoTier,
      })

  // Race the send against a 4-second timeout so a slow Resend response
  // never delays the sign-in handler. We still record the result if it
  // resolves before timeout; otherwise it logs in the background.
  const sendPromise = sendEmail({
    userid,
    template: isAdmin ? "welcome_admin" : "welcome_member",
    subject,
    react,
    marketing: true,
  })
    .then(async (result) => {
      if (result.status === "sent" || result.status === "skipped_pref") {
        try {
          await prisma.user_config.update({
            where: { userid },
            data: { email_welcomed_at: new Date() },
          })
        } catch (e) {
          console.error("[email] failed to stamp email_welcomed_at:", e)
        }
      }
      return result
    })
    .catch((e) => {
      console.error("[email] welcome trigger failed:", e)
    })

  await Promise.race([
    sendPromise,
    new Promise<void>((resolve) => setTimeout(resolve, 4000)),
  ])
}
