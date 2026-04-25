// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Admin-only QA endpoint that sends any email template to
//          the requester (or an explicit address) so we can preview
//          how each template looks in real inboxes — Gmail, Outlook,
//          Apple Mail, mobile, dark mode — before any user sees it.
//
//          Auth model: signed in via Discord AND your Discord ID is
//          in EMAIL_TEST_ALLOWLIST (comma-separated). Falls back to
//          the bot owner ID so this works out of the box.
//
//          POST /api/email/test
//          body: {
//            template: "welcome_member" | "welcome_admin" | "weekly_digest",
//            to?: string,           // override recipient address
//            useRealData?: boolean  // pull live stats / guilds, not mocks
//          }
// ============================================================
import * as React from "react"
import type { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "@/utils/apiHandler"
import { getDiscordId, unauthorized } from "@/utils/dashboardAuth"
import { prisma } from "@/utils/prisma"
import { sendEmail } from "@/utils/email/send"
import type { EmailTemplate } from "@/utils/email/brand"
import { getPromoTierForUser } from "@/utils/email/tier"
import { buildWeeklyDigest } from "@/utils/email/digest"
import WelcomeMember, {
  WelcomeMemberMockProps,
} from "../../../emails/WelcomeMember"
import WelcomeAdmin from "../../../emails/WelcomeAdmin"
import WeeklyDigest, {
  WeeklyDigestMockProps,
} from "../../../emails/WeeklyDigest"

const ALLOWED_TEMPLATES = ["welcome_member", "welcome_admin", "weekly_digest"] as const
type TestTemplate = (typeof ALLOWED_TEMPLATES)[number]

function isAllowed(discordId: string): boolean {
  const raw = process.env.EMAIL_TEST_ALLOWLIST
  const allowlist = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : ["757652191656804413"] // bot owner fallback so /api/email/test works on day one
  return allowlist.includes(discordId)
}

function firstNameFor(name: string | null | undefined, email: string | null | undefined): string {
  const raw = (name ?? email?.split("@")[0] ?? "Alex").trim()
  return raw.split(/\s+/)[0] || "Alex"
}

async function buildReact(
  template: TestTemplate,
  userid: bigint,
  useRealData: boolean,
  fallbackName: string
): Promise<{ react: React.ReactElement; subject: string }> {
  if (template === "welcome_member") {
    if (!useRealData) {
      return {
        react: React.createElement(WelcomeMember, WelcomeMemberMockProps),
        subject: "[TEST] Welcome to LionBot — let's get you set up",
      }
    }
    const tier = await getPromoTierForUser(userid)
    return {
      react: React.createElement(WelcomeMember, {
        firstName: fallbackName,
        premiumTier: tier,
      }),
      subject: `[TEST] Welcome to LionBot, ${fallbackName} — let's get you set up`,
    }
  }

  if (template === "welcome_admin") {
    const tier = useRealData ? await getPromoTierForUser(userid) : "free"
    const guilds = useRealData
      ? await prisma.guild_config.findMany({
          where: { ownerid: userid },
          select: { guildid: true, name: true },
          take: 6,
        })
      : []
    const guildSummaries =
      guilds.length > 0
        ? guilds.map((g) => ({
            id: g.guildid.toString(),
            name: g.name?.trim() || `Server ${g.guildid}`,
            iconUrl: null,
          }))
        : [
            { id: "111111111111111111", name: "Study Lions", iconUrl: null },
            { id: "222222222222222222", name: "Focus Friends", iconUrl: null },
          ]
    return {
      react: React.createElement(WelcomeAdmin, {
        firstName: fallbackName,
        guilds: guildSummaries,
        premiumTier: tier,
      }),
      subject: `[TEST] Welcome to LionBot — your ${
        guildSummaries.length === 1 ? "server" : "servers"
      } are ready`,
    }
  }

  // weekly_digest
  if (useRealData) {
    const data = await buildWeeklyDigest({ userid, firstName: fallbackName })
    if (data) {
      return {
        react: React.createElement(WeeklyDigest, data),
        subject: `[TEST] Your weekly recap — ${data.weekStartLabel} – ${data.weekEndLabel}`,
      }
    }
    // Fall through to mock when there is no activity to render.
  }
  return {
    react: React.createElement(WeeklyDigest, {
      ...WeeklyDigestMockProps,
      firstName: fallbackName,
    }),
    subject: `[TEST] Your weekly recap — ${WeeklyDigestMockProps.weekStartLabel} – ${WeeklyDigestMockProps.weekEndLabel}`,
  }
}

export default apiHandler({
  async GET(_req: NextApiRequest, res: NextApiResponse) {
    return res.status(200).json({
      templates: ALLOWED_TEMPLATES,
      usage: {
        method: "POST",
        body: {
          template: "welcome_member | welcome_admin | weekly_digest",
          to: "(optional) override recipient address",
          useRealData: "(optional) pull live stats / guilds for the signed-in user",
        },
      },
    })
  },

  async POST(req: NextApiRequest, res: NextApiResponse) {
    // Two valid auth paths:
    //   1. Discord session whose discordId is in EMAIL_TEST_ALLOWLIST
    //      (normal admin use from the dashboard / browser).
    //   2. Authorization: Bearer ${CRON_SECRET} for ops / CI use.
    //      Required because the QA flow needs to be drivable from the
    //      CLI without an OAuth session cookie. Cron secret is treated
    //      as a separate trust dimension; if it leaks we have bigger
    //      problems than test emails.
    const cronSecret = process.env.CRON_SECRET
    const opsAuth =
      cronSecret &&
      req.headers.authorization === `Bearer ${cronSecret}`

    let discordId: string | null = null
    if (!opsAuth) {
      discordId = await getDiscordId(req)
      if (!discordId) return unauthorized(res)
      if (!isAllowed(discordId)) {
        return res.status(403).json({ error: "Not in EMAIL_TEST_ALLOWLIST" })
      }
    }

    const body = (req.body ?? {}) as {
      template?: string
      to?: string
      useRealData?: boolean
      asUserId?: string
    }
    const template = body.template as TestTemplate | undefined
    if (!template || !ALLOWED_TEMPLATES.includes(template)) {
      return res.status(400).json({
        error: `template must be one of ${ALLOWED_TEMPLATES.join(", ")}`,
      })
    }

    // Ops auth requires an explicit `to` address and may pass `asUserId`
    // to render the template against a specific user's data. Without
    // either we'd have no way to target a recipient and useRealData
    // would have nothing to load.
    if (opsAuth && !body.to) {
      return res.status(400).json({
        error: "Ops auth requires `to` in the body so we never send to a surprise address.",
      })
    }

    const useridStr = discordId ?? body.asUserId
    if (!useridStr) {
      return res.status(400).json({
        error: "Provide `asUserId` in the body when authenticating with the ops bearer token.",
      })
    }

    let userid: bigint
    try {
      userid = BigInt(useridStr)
    } catch {
      return res.status(400).json({ error: "Invalid Discord user ID format" })
    }

    const user = await prisma.user_config.findUnique({
      where: { userid },
      select: { email: true, name: true },
    })

    const recipient = body.to || user?.email
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return res.status(400).json({
        error: "No valid recipient. Provide `to` in the body or sign in with a Discord account that has an email.",
      })
    }

    const fallbackName = firstNameFor(user?.name, recipient)
    const useRealData = body.useRealData === true

    const { react, subject } = await buildReact(
      template,
      userid,
      useRealData,
      fallbackName
    )

    const result = await sendEmail({
      userid,
      template: template as EmailTemplate,
      subject,
      react,
      toOverride: recipient,
      // QA mode: ignore prefs / unsub flags so the test always lands.
      skipPrefCheck: true,
      marketing: true,
    })

    return res.status(200).json({
      ok: result.status === "sent",
      template,
      to: recipient,
      useRealData,
      result,
    })
  },
})
