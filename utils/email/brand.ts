// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Single source of truth for the LionBot email brand
//          (colors, fonts, URLs, copy snippets). Templates and
//          shared components import from here so a redesign is
//          a one-file change.
// ============================================================

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lionbot.org"

export const brand = {
  name: "LionBot",
  tagline: "Study together. Grow together.",
  siteUrl: SITE_URL,
  logoUrl: `${SITE_URL}/images/lionbot-avatar.png`,
  supportEmail: "support@lionbot.org",
  fromMarketing: process.env.EMAIL_FROM_MARKETING || "LionBot <hello@lionbot.org>",
  fromSystem: process.env.EMAIL_FROM_SYSTEM || "LionBot <noreply@lionbot.org>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@lionbot.org",
  // Postal address required by CAN-SPAM. Override via env once the legal
  // entity has a registered address. Placeholder is a Discord-only fallback.
  postalAddress:
    process.env.EMAIL_POSTAL_ADDRESS ||
    "LionBot · Reach us in our Discord support server: discord.gg/studylions",
  discordInvite: "https://discord.gg/studylions",
  topggUrl: "https://top.gg/bot/889078613817831495/vote",

  colors: {
    background: "#F8F7F4",
    surface: "#FFFFFF",
    surfaceMuted: "#F1EDE5",
    border: "#E5DFD2",
    headline: "#1F2937",
    headingAccent: "#2E4C70",
    text: "#3F4756",
    textMuted: "#6B7280",
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    warmAccent: "#E7A627",
    success: "#16A34A",
    danger: "#DC2626",
    premiumGold: "#FFD700",
    premiumPink: "#FF69B4",
    premiumBlue: "#5B8DEF",
  },

  fontStack:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Rubik, 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const

// Email template identifiers used in pref checks, log records, and
// the public unsubscribe page. Adding a template means: extend this enum,
// add an entry to TEMPLATE_PREF_KEY, and create the React Email file.
export type EmailTemplate =
  | "welcome_member"
  | "welcome_admin"
  | "weekly_digest"
  | "streak_saver"
  | "reengagement"
  | "premium_expiry"
  | "test"

export type EmailPrefKey =
  | "email_pref_welcome"
  | "email_pref_weekly_digest"
  | "email_pref_lifecycle"
  | "email_pref_announcements"
  | "email_pref_premium"

// Maps a template to the user preference column that gates it. Templates
// not listed here are always sent (e.g. test, transactional security mail).
export const TEMPLATE_PREF_KEY: Partial<Record<EmailTemplate, EmailPrefKey>> = {
  welcome_member: "email_pref_welcome",
  welcome_admin: "email_pref_welcome",
  weekly_digest: "email_pref_weekly_digest",
  streak_saver: "email_pref_lifecycle",
  reengagement: "email_pref_lifecycle",
  premium_expiry: "email_pref_premium",
}

export const PREF_DESCRIPTIONS: Record<
  EmailPrefKey,
  { label: string; description: string }
> = {
  email_pref_welcome: {
    label: "Welcome and onboarding",
    description:
      "One-time emails when you first sign in, with quick links to help you get started.",
  },
  email_pref_weekly_digest: {
    label: "Weekly progress digest",
    description:
      "A short Sunday recap of how much you studied, your streak, and what to focus on next week.",
  },
  email_pref_lifecycle: {
    label: "Streak reminders and re-engagement",
    description:
      "Friendly nudges if your streak is about to break or if you have not been around for a while.",
  },
  email_pref_premium: {
    label: "Premium status updates",
    description:
      "Important notices about your LionHeart subscription (renewals, expirations, payment issues).",
  },
  email_pref_announcements: {
    label: "Product news and announcements",
    description:
      "Occasional updates about new features, big improvements, and seasonal events.",
  },
}
