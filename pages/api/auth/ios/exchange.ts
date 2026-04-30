// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Discord OAuth code exchange for the LionBot iOS app.
//
//          Flow:
//            1. The iOS app runs ASWebAuthenticationSession against
//               https://discord.com/api/oauth2/authorize with PKCE.
//            2. Discord returns a `code` to the iOS app via the
//               registered `lionbotios://oauth-callback` redirect.
//            3. The iOS app POSTs { code, code_verifier, redirect_uri }
//               to this route.
//            4. We finish the exchange server-side using
//               DISCORD_CLIENT_SECRET, fetch the Discord user, mint a
//               signed iOS JWT bearer (utils/iosAuth.ts), and return
//               { session_token, user }.
//
//          We mirror the side effects of the website NextAuth signIn
//          event so iOS users get the same email upsert + welcome
//          treatment as web users.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { mintIosBearer } from "@/utils/iosAuth"
import { notifyLogin } from "@/utils/surveyWebhook"
import { maybeSendWelcomeEmail } from "@/utils/email/triggers/welcome"

interface ExchangeRequestBody {
  code?: string
  code_verifier?: string
  redirect_uri?: string
}

interface DiscordTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface DiscordUser {
  id: string
  username: string
  global_name?: string | null
  avatar?: string | null
  email?: string | null
  verified?: boolean
}

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"
const DISCORD_USER_URL = "https://discord.com/api/users/@me"
const LIONHEART_TIERS = new Set([
  "LIONHEART",
  "LIONHEART_PLUS",
  "LIONHEART_PLUS_PLUS",
])

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error("[ios/exchange] Missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET")
    return res.status(500).json({ error: "Server misconfigured" })
  }

  const body = (req.body || {}) as ExchangeRequestBody
  const { code, code_verifier, redirect_uri } = body
  if (!code || !code_verifier || !redirect_uri) {
    return res
      .status(400)
      .json({ error: "Missing required fields: code, code_verifier, redirect_uri" })
  }

  // 1. Exchange the authorization code for a Discord access token.
  let tokenJson: DiscordTokenResponse
  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri,
      code_verifier,
    })
    const tokenRes = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })
    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error("[ios/exchange] Discord token exchange failed:", tokenRes.status, text)
      return res
        .status(401)
        .json({ error: "Discord rejected the authorization code" })
    }
    tokenJson = (await tokenRes.json()) as DiscordTokenResponse
  } catch (err) {
    console.error("[ios/exchange] Discord token request error:", err)
    return res
      .status(502)
      .json({ error: "Failed to reach Discord token endpoint" })
  }

  // 2. Fetch the Discord user with the freshly-minted access token.
  let discordUser: DiscordUser
  try {
    const userRes = await fetch(DISCORD_USER_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })
    if (!userRes.ok) {
      const text = await userRes.text()
      console.error("[ios/exchange] Discord users/@me failed:", userRes.status, text)
      return res
        .status(502)
        .json({ error: "Failed to fetch Discord user profile" })
    }
    discordUser = (await userRes.json()) as DiscordUser
  } catch (err) {
    console.error("[ios/exchange] Discord user request error:", err)
    return res
      .status(502)
      .json({ error: "Failed to reach Discord user endpoint" })
  }

  // 3. Mirror the NextAuth signIn-event side effects (email upsert,
  //    welcome email, login notification) so iOS users get parity.
  if (discordUser.email) {
    try {
      await prisma.user_config.upsert({
        where: { userid: BigInt(discordUser.id) },
        update: { email: discordUser.email, email_verified: discordUser.verified ?? null },
        create: {
          userid: BigInt(discordUser.id),
          email: discordUser.email,
          email_verified: discordUser.verified ?? null,
        },
      })
    } catch (err) {
      console.error("[ios/exchange] Failed to upsert user_config email:", err)
    }

    notifyLogin({
      discordId: discordUser.id,
      email: discordUser.email,
      emailVerified: discordUser.verified ?? null,
    }).catch((e) => console.error("[ios/exchange] notifyLogin failed:", e))

    maybeSendWelcomeEmail({
      discordId: discordUser.id,
      email: discordUser.email,
      emailVerified: discordUser.verified ?? null,
      accessToken: tokenJson.access_token,
      displayName:
        discordUser.global_name || discordUser.username || null,
    }).catch((e) =>
      console.error("[ios/exchange] welcome email failed:", e)
    )
  }

  // 4. Compute is_premium from the same user_subscriptions row the
  //    website uses. Treat ACTIVE and CANCELLING as both premium so
  //    paid-but-cancelling users keep their perks until period end.
  const isPremium = await isLionheartActive(discordUser.id)

  // 5. Mint the iOS bearer JWT (encrypted Discord access/refresh tokens
  //    inside, signed with the existing NextAuth SECRET).
  let sessionToken: string
  try {
    sessionToken = await mintIosBearer({
      discordId: discordUser.id,
      discordAccessToken: tokenJson.access_token,
      discordRefreshToken: tokenJson.refresh_token ?? null,
    })
  } catch (err) {
    console.error("[ios/exchange] Failed to mint iOS bearer:", err)
    return res.status(500).json({ error: "Failed to issue session token" })
  }

  return res.status(200).json({
    session_token: sessionToken,
    user: {
      discord_id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name ?? null,
      avatar: discordUser.avatar ?? null,
      email: discordUser.email ?? null,
      is_premium: isPremium,
    },
  })
}

export async function isLionheartActive(discordId: string): Promise<boolean> {
  try {
    const row = await prisma.user_subscriptions.findUnique({
      where: { userid: BigInt(discordId) },
      select: { tier: true, status: true },
    })
    if (!row) return false
    if (!LIONHEART_TIERS.has(row.tier)) return false
    return row.status === "ACTIVE" || row.status === "CANCELLING"
  } catch (err) {
    console.error("[ios/exchange] isLionheartActive failed:", err)
    return false
  }
}
