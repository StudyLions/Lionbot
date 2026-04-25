// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: One-click unsubscribe endpoint. Accepts a signed token
//          via either GET ?token=... (footer link) or POST (RFC
//          8058 List-Unsubscribe-Post one-click header). Always
//          returns a tiny human-readable HTML page so a user who
//          clicks the link in a webmail client sees confirmation.
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/utils/prisma"
import { verifyUnsubscribeToken } from "@/utils/email/tokens"
import { brand, PREF_DESCRIPTIONS } from "@/utils/email/brand"
import type { EmailPrefKey } from "@/utils/email/brand"

const PREF_KEYS: EmailPrefKey[] = [
  "email_pref_welcome",
  "email_pref_weekly_digest",
  "email_pref_lifecycle",
  "email_pref_announcements",
  "email_pref_premium",
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderConfirmation(scopeLabel: string, manageUrl: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unsubscribed — ${escapeHtml(brand.name)}</title>
<style>
  body { margin:0; padding:48px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Rubik,sans-serif; background:${brand.colors.background}; color:${brand.colors.text}; }
  .card { max-width:520px; margin:0 auto; background:${brand.colors.surface}; border:1px solid ${brand.colors.border}; border-radius:16px; padding:36px 32px; box-shadow:0 2px 12px rgba(46,76,112,0.06); }
  h1 { margin:0 0 12px; font-size:22px; color:${brand.colors.headline}; }
  p { margin:0 0 16px; font-size:15px; line-height:1.6; }
  a.btn { display:inline-block; padding:11px 20px; border-radius:10px; background:${brand.colors.primary}; color:#fff; text-decoration:none; font-weight:600; }
  a.muted { color:${brand.colors.headingAccent}; text-decoration:underline; font-size:13px; }
</style>
</head><body>
<div class="card">
  <h1>You are unsubscribed</h1>
  <p>You will no longer receive <strong>${escapeHtml(scopeLabel)}</strong> from ${escapeHtml(brand.name)}.</p>
  <p>You can still adjust the rest of your email preferences from your dashboard.</p>
  <p><a class="btn" href="${escapeHtml(manageUrl)}">Manage email preferences</a></p>
  <p><a class="muted" href="${escapeHtml(brand.siteUrl)}">Return to ${escapeHtml(brand.name)}</a></p>
</div>
</body></html>`
}

function renderError(message: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Unsubscribe — ${escapeHtml(brand.name)}</title>
<style>
  body { margin:0; padding:48px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Rubik,sans-serif; background:${brand.colors.background}; color:${brand.colors.text}; }
  .card { max-width:520px; margin:0 auto; background:${brand.colors.surface}; border:1px solid ${brand.colors.border}; border-radius:16px; padding:36px 32px; box-shadow:0 2px 12px rgba(46,76,112,0.06); }
  h1 { margin:0 0 12px; font-size:22px; color:${brand.colors.danger}; }
  p { margin:0 0 16px; font-size:15px; line-height:1.6; }
  a.muted { color:${brand.colors.headingAccent}; text-decoration:underline; font-size:13px; }
</style>
</head><body>
<div class="card">
  <h1>This unsubscribe link is invalid or expired</h1>
  <p>${escapeHtml(message)}</p>
  <p>You can manage your preferences directly from your dashboard while signed in with Discord.</p>
  <p><a class="muted" href="${escapeHtml(brand.siteUrl)}/dashboard/settings#email">Open dashboard settings</a></p>
</div>
</body></html>`
}

async function applyUnsubscribe(
  userid: bigint,
  scope: "all" | EmailPrefKey
): Promise<{ scopeLabel: string }> {
  if (scope === "all") {
    const data: Partial<Record<EmailPrefKey | "email_unsubscribed_all", boolean>> = {
      email_unsubscribed_all: true,
    }
    for (const key of PREF_KEYS) data[key] = false
    await prisma.user_config.upsert({
      where: { userid },
      update: data,
      create: { userid, ...data },
    })
    return { scopeLabel: "any emails" }
  }
  await prisma.user_config.upsert({
    where: { userid },
    update: { [scope]: false },
    create: { userid, [scope]: false },
  })
  return {
    scopeLabel: PREF_DESCRIPTIONS[scope]?.label.toLowerCase() ?? "these emails",
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const tokenInput =
    (req.method === "GET"
      ? req.query.token
      : (req.body && (req.body as { token?: string }).token) ||
        req.query.token) ?? ""
  const token = Array.isArray(tokenInput) ? tokenInput[0] : tokenInput
  if (!token || typeof token !== "string") {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res.status(400).send(renderError("Missing unsubscribe token."))
  }

  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res
      .status(400)
      .send(renderError("This link could not be verified or has expired."))
  }

  try {
    const { scopeLabel } = await applyUnsubscribe(verified.userid, verified.scope)
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res
      .status(200)
      .send(
        renderConfirmation(
          scopeLabel,
          `${brand.siteUrl}/dashboard/settings#email`
        )
      )
  } catch (e) {
    console.error("[email/unsubscribe] failed:", e)
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res
      .status(500)
      .send(renderError("Something went wrong. Please try again from your dashboard."))
  }
}
