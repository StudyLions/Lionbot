// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Shared editable campaign content, safe validation, and
//          the founder-approved fundraiser and sender defaults.
// ============================================================

export type CampaignContent = {
  subject: string
  preheader: string
  eyebrow: string
  headline: string
  body: string[]
  ctaLabel: string
  ctaUrl: string
}

export const FUNDRAISER_URL =
  "https://www.gofundme.com/f/keep-lionbot-online-a-new-home-for-leo"

export const CAMPAIGN_SENDER_DEFAULTS = {
  senderName: "Ari Horesh",
  postalAddress: "Via Francesco Orsi 27, Pavia, Italy",
  vatNumber: "IT02865360180",
} as const

// --- AI-MODIFIED (2026-09-10) ---
// Purpose: Keep the founder's appeal brief and direct readers to the full GoFundMe story.
export const DEFAULT_FUNDRAISER_CONTENT: CampaignContent = {
  subject: "LionBot Might Shut Down",
  preheader: "I can’t keep funding Leo alone. Here’s how you can help.",
  eyebrow: "A note from Ari",
  headline: "LionBot Might Shut Down",
  body: [
    "I’m Ari, LionBot’s founder. I can no longer afford to keep Leo running on my own.",
    "Without enough support, I may have to take Leo offline at the end of 2026.",
  ],
  ctaLabel: "Read how you can help",
  ctaUrl: FUNDRAISER_URL,
}
// --- END AI-MODIFIED ---

function field(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string") throw new Error(`${label} is required.`)
  const cleaned = value.trim()
  if (!cleaned || cleaned.length > maximum) {
    throw new Error(`${label} must contain between 1 and ${maximum} characters.`)
  }
  // Reject header injection and invisible control characters in all fields.
  // Paragraph boundaries belong in body[], rather than embedded newlines.
  if (/[\u0000-\u001f\u007f]/.test(cleaned)) {
    throw new Error(`${label} cannot contain control characters or line breaks.`)
  }
  return cleaned
}

export function validateCampaignContent(value: unknown): CampaignContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Enter the email content before saving.")
  }
  const input = value as Record<string, unknown>
  const subject = field(input.subject, "Subject", 140)
  const preheader = field(input.preheader, "Preview text", 200)
  const eyebrow = field(input.eyebrow, "Eyebrow", 80)
  const headline = field(input.headline, "Headline", 160)
  const ctaLabel = field(input.ctaLabel, "Button label", 80)
  const ctaUrl = field(input.ctaUrl, "Button link", 2048)
  let parsed: URL
  try {
    parsed = new URL(ctaUrl)
  } catch {
    throw new Error("Enter a valid HTTPS button link.")
  }
  if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
    throw new Error("The button link must use HTTPS and must not contain login details.")
  }
  if (!Array.isArray(input.body) || input.body.length < 1 || input.body.length > 14) {
    throw new Error("The email needs between 1 and 14 paragraphs.")
  }
  const body = input.body.map((paragraph, index) => field(paragraph, `Paragraph ${index + 1}`, 1800))
  if (body.join("\n\n").length > 16000) {
    throw new Error("Keep the email body below 16,000 characters.")
  }
  return { subject, preheader, eyebrow, headline, body, ctaLabel, ctaUrl }
}
