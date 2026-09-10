// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Render the same campaign for browser review and email
//          delivery, including HTML and an explicit plain-text body.
// ============================================================
import * as React from "react"
import { render } from "@react-email/render"
import CampaignAnnouncement from "../../../emails/CampaignAnnouncement"
import {
  CampaignContent, CAMPAIGN_SENDER_DEFAULTS, FUNDRAISER_URL, validateCampaignContent,
} from "./content"

export type CampaignRenderOptions = {
  unsubscribeUrl: string
  postalAddress?: string
  senderName?: string
  vatNumber?: string
  /** Trusted deployment origin for preview assets; delivery uses the public site. */
  assetBaseUrl?: string
}

function publicSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lionbot.org"
  try {
    const parsed = new URL(configured)
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return parsed.origin
  } catch { /* A malformed deployment setting must not produce broken links. */ }
  return "https://lionbot.org"
}

export async function renderCampaignEmail(
  draft: CampaignContent,
  options: CampaignRenderOptions,
): Promise<{ html: string; text: string }> {
  const content = validateCampaignContent(draft)
  const siteUrl = publicSiteUrl()
  let unsubscribeUrl: string
  try {
    const parsed = new URL(options.unsubscribeUrl)
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error()
    unsubscribeUrl = parsed.href
  } catch {
    throw new Error("A valid HTTPS unsubscribe link is required.")
  }
  const senderName = options.senderName?.trim() || process.env.EMAIL_SENDER_NAME?.trim() || CAMPAIGN_SENDER_DEFAULTS.senderName
  const postalAddress = options.postalAddress?.trim() || process.env.EMAIL_POSTAL_ADDRESS?.trim() || CAMPAIGN_SENDER_DEFAULTS.postalAddress
  const vatNumber = options.vatNumber?.trim() || process.env.EMAIL_VAT_NUMBER?.trim() || CAMPAIGN_SENDER_DEFAULTS.vatNumber
  const preferencesUrl = `${siteUrl}/dashboard/settings#email`
  let assetBaseUrl = siteUrl
  if (options.assetBaseUrl) {
    try {
      const assets = new URL(options.assetBaseUrl)
      if (assets.protocol === "https:" && !assets.username && !assets.password) assetBaseUrl = assets.origin
    } catch { /* Use the public site for invalid preview configuration. */ }
  }
  const cta = new URL(content.ctaUrl)
  const fundraiser = new URL(FUNDRAISER_URL)
  const heroUrl = cta.hostname === fundraiser.hostname && cta.pathname.replace(/\/$/, "") === fundraiser.pathname
    ? `${assetBaseUrl}/images/email/leo-fundraiser-pixel-art.png`
    : undefined

  const html = await render(React.createElement(CampaignAnnouncement, {
    content, unsubscribeUrl, preferencesUrl, siteUrl, senderName,
    postalAddress, vatNumber, heroUrl,
  }))
  // Keep plain text intentional: artwork and visual labels should not obscure
  // the letter, the destination of the button, or the opt-out instructions.
  const text = [
    "LionBot", "", content.eyebrow, content.headline, "",
    content.body.join("\n\n"), "", `${content.ctaLabel}: ${content.ctaUrl}`, "",
    senderName, "Founder of LionBot", "", "---", "",
    "You’re receiving this because you subscribed to LionBot community announcements. You can unsubscribe at any time.", "",
    `Unsubscribe from announcements: ${unsubscribeUrl}`,
    `Manage email preferences: ${preferencesUrl}`, "",
    `${senderName} · LionBot`, postalAddress, `P.IVA ${vatNumber}`,
    siteUrl, "Contact us: support@lionbot.org",
  ].join("\n")
  return { html, text }
}
