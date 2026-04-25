// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: The single send pipeline used by every trigger and
//          every cron job. It checks the user's preferences,
//          renders the React Email template, calls Resend, writes
//          an email_log row, and adds the List-Unsubscribe header
//          required for inbox-provider unsubscribe buttons.
// ============================================================
import { render } from "@react-email/render"
import type { ReactElement } from "react"
import { prisma } from "../prisma"
import { brand, TEMPLATE_PREF_KEY } from "./brand"
import type { EmailTemplate } from "./brand"
import { getResend, isResendConfigured } from "./resend"
import {
  buildUnsubscribeUrl,
  createUnsubscribeToken,
} from "./tokens"
import type { UnsubscribeScope } from "./tokens"

export interface SendEmailArgs {
  userid: bigint
  template: EmailTemplate
  subject: string
  react: ReactElement
  // Override the destination address (used by /api/email/test).
  // When omitted, the address from user_config.email is used.
  toOverride?: string
  // Force-skip preference checks (use sparingly, only for security
  // mail or when the operator already validated consent).
  skipPrefCheck?: boolean
  // Use the warm "hello@" sender. Defaults to true; set to false for
  // transactional / system mail (account security, premium expiry).
  marketing?: boolean
  // Categorize for the unsubscribe header. Defaults to the template's
  // pref key, falling back to "all".
  unsubscribeScope?: UnsubscribeScope
  // Bypass the EMAIL_SEND_ENABLED kill switch. Only the admin /test
  // endpoint should ever set this -- it lets us preview templates in
  // a real inbox while the system is otherwise dormant in production.
  bypassFeatureFlag?: boolean
}

export type SendStatus =
  | "sent"
  | "skipped_unsubscribed"
  | "skipped_no_email"
  | "skipped_pref"
  | "skipped_disabled"
  | "failed"
  | "skipped_not_configured"

// Master kill switch. Defaults to OFF -- the entire email system is
// dormant until EMAIL_SEND_ENABLED=true is set in the environment.
// Lets us ship the code to production without any real email going
// out, then enable in a single env var flip when we are ready.
export function isEmailSendingEnabled(): boolean {
  return process.env.EMAIL_SEND_ENABLED === "true"
}

export interface SendEmailResult {
  status: SendStatus
  resendId?: string | null
  error?: string
}

async function logSend(
  userid: bigint,
  email: string,
  template: EmailTemplate,
  subject: string,
  status: SendStatus,
  resendId?: string | null,
  error?: string
) {
  try {
    await prisma.email_log.create({
      data: {
        userid,
        email,
        template,
        subject,
        status,
        resend_id: resendId ?? null,
        error: error ? error.slice(0, 1000) : null,
      },
    })
  } catch (e) {
    console.error("[email] failed to write email_log:", e)
  }
}

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const {
    userid,
    template,
    subject,
    react,
    toOverride,
    skipPrefCheck = false,
    marketing = true,
    unsubscribeScope,
    bypassFeatureFlag = false,
  } = args

  // Kill switch first -- before any DB read, render, or Resend call.
  // We deliberately do not write an email_log row here: when the
  // system is disabled it is the caller's job to no-op, not ours to
  // record millions of "skipped" rows for every weekly cron tick.
  if (!isEmailSendingEnabled() && !bypassFeatureFlag) {
    return { status: "skipped_disabled" }
  }

  if (!isResendConfigured()) {
    console.warn(
      `[email] Resend not configured; skipping ${template} for ${userid}`
    )
    return { status: "skipped_not_configured" }
  }

  const user = await prisma.user_config.findUnique({
    where: { userid },
    select: {
      email: true,
      email_verified: true,
      email_unsubscribed_all: true,
      email_pref_welcome: true,
      email_pref_weekly_digest: true,
      email_pref_lifecycle: true,
      email_pref_announcements: true,
      email_pref_premium: true,
    },
  })

  const recipient = toOverride || user?.email || null
  if (!recipient) {
    await logSend(userid, "", template, subject, "skipped_no_email")
    return { status: "skipped_no_email" }
  }

  if (!skipPrefCheck) {
    if (user?.email_unsubscribed_all) {
      await logSend(userid, recipient, template, subject, "skipped_unsubscribed")
      return { status: "skipped_unsubscribed" }
    }
    const prefKey = TEMPLATE_PREF_KEY[template]
    if (prefKey && user && user[prefKey] === false) {
      await logSend(userid, recipient, template, subject, "skipped_pref")
      return { status: "skipped_pref" }
    }
  }

  const scope: UnsubscribeScope =
    unsubscribeScope ?? TEMPLATE_PREF_KEY[template] ?? "all"
  const unsubscribeUrl = buildUnsubscribeUrl(brand.siteUrl, userid, scope)
  const oneClickUrl = `${brand.siteUrl}/api/email/unsubscribe?token=${createUnsubscribeToken(
    userid,
    scope
  )}`

  let html: string
  let text: string
  try {
    html = await render(react)
    text = await render(react, { plainText: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[email] render failed for ${template}:`, msg)
    await logSend(userid, recipient, template, subject, "failed", null, msg)
    return { status: "failed", error: msg }
  }

  try {
    const resend = getResend()
    const result = await resend.emails.send({
      from: marketing ? brand.fromMarketing : brand.fromSystem,
      to: recipient,
      subject,
      html,
      text,
      replyTo: brand.replyTo,
      headers: {
        "List-Unsubscribe": `<${oneClickUrl}>, <mailto:${brand.supportEmail}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    })

    if (result.error) {
      const msg = result.error.message || JSON.stringify(result.error)
      console.error(`[email] resend error for ${template}:`, msg)
      await logSend(userid, recipient, template, subject, "failed", null, msg)
      return { status: "failed", error: msg }
    }

    const resendId = result.data?.id ?? null
    await logSend(userid, recipient, template, subject, "sent", resendId)
    return { status: "sent", resendId }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[email] send threw for ${template}:`, msg)
    await logSend(userid, recipient, template, subject, "failed", null, msg)
    return { status: "failed", error: msg }
  }
}
