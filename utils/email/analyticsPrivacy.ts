// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-10
// Purpose: Keep signed email links and the owner email desk out of analytics,
//          including navigation with an already-loaded Google tracker.
// ============================================================
export const EMAIL_ANALYTICS_DISABLE_KEY = "ga-disable-G-5YBLTF11VW"
export type EmailAnalyticsGuard = { blocked: boolean }

export function isPrivateEmailRoute(value: string): boolean {
  let pathname: string
  try {
    pathname = decodeURIComponent(new URL(value, "https://lionbot.org").pathname).toLowerCase()
  } catch {
    // An invalid URL must not accidentally disclose a signed email token.
    return /(?:campaign-unsubscribe|unsubscribe|email-campaigns)/i.test(value)
  }
  const parts = pathname.split("/").filter(Boolean)
  // Checking path segments also covers Next's /[token] route pattern and
  // locale prefixes such as /pt-BR/campaign-unsubscribe/<token>.
  return parts.some((part, index) =>
    part === "unsubscribe" || part === "campaign-unsubscribe" ||
    (part === "dashboard" && parts[index + 1] === "email-campaigns")
  )
}

export function advanceEmailAnalyticsGuard(
  guard: EmailAnalyticsGuard,
  nextUrl: string,
  browser?: Record<string, unknown>,
): boolean {
  if (isPrivateEmailRoute(nextUrl)) guard.blocked = true
  // Deliberately never re-enable in this SPA session: leaving a signed URL
  // could otherwise expose it later as page_referrer. This flag also stops a
  // previously scheduled lazy tracker that finishes loading after navigation.
  if (guard.blocked && browser) browser[EMAIL_ANALYTICS_DISABLE_KEY] = true
  return guard.blocked
}
