// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Full-bleed editorial hero for the public server profile.
//          Replaces the "card-with-icon-and-pills" pattern with a
//          90vh photo claim, magazine-style kicker, big display
//          serif headline, italic deck, and flush-left CTA.
//
//          The cover image's blend mode is theme-driven (paper /
//          duotone / monochrome / wash / spare). The accent only
//          appears on the kicker dot, the underline of "Verified",
//          and the Join CTA -- everything else is theme typography.
// ============================================================
import React from "react"

import { ListingTheme } from "@/constants/ServerListingData"
import { withAlpha } from "./EditorialThemeProvider"

interface EditorialHeroProps {
  theme: ListingTheme
  accent: string
  displayName: string
  tagline: string | null
  guildIconUrl: string | null
  coverImageUrl: string | null
  /** Pre-formatted kicker fragments shown above the title.
   *  Examples: ["FEATURED", "CODING", "18+"], joined with hairlines. */
  kicker: string[]
  /** Discord invite slug if available; renders the Join CTA. */
  inviteSlug: string | null
  /** Inline meta dot that fades in if voice channels are active. */
  inVoiceCount: number | null
  /** Optional prefix shown above the article (e.g. "Vol. I — Issue 03"). */
  issueNumber?: string
  /** Optional approval date for a colophon-style timestamp. */
  approvedAt?: string | null
}

/**
 * Build the cover background style for the chosen theme. Each blend
 * mode applies a different gradient overlay so the photo feels like
 * part of the article rather than a header banner.
 */
function buildCoverStyle(
  theme: ListingTheme,
  accent: string,
  coverImageUrl: string | null,
): React.CSSProperties {
  if (!coverImageUrl) {
    return { background: theme.bodyBg }
  }
  const safeUrl = coverImageUrl.replace(/'/g, "%27").replace(/"/g, "%22")
  const baseImage = `url('${safeUrl}') center/cover no-repeat`

  switch (theme.coverBlend) {
    case "paper":
      // Atlantic -- soft fade into the warm-dark surface. Strong
      // bottom fade so the photo dissolves into the article body.
      return {
        background: `
          linear-gradient(180deg,
            ${withAlpha(theme.bodyBg, 0.0)} 0%,
            ${withAlpha(theme.bodyBg, 0.0)} 30%,
            ${withAlpha(theme.bodyBg, 0.45)} 65%,
            ${withAlpha(theme.bodyBg, 0.85)} 88%,
            ${theme.bodyBg} 100%),
          ${baseImage}
        `,
      }
    case "duotone":
      // Wired -- harsh black + accent. We render the photo as a
      // greyscale base, then sit two tinted gradients on top to fake
      // a duotone without needing canvas.
      return {
        backgroundImage: `
          linear-gradient(180deg,
            rgba(10,10,12,0.20) 0%,
            rgba(10,10,12,0.65) 70%,
            rgba(10,10,12,1) 100%),
          linear-gradient(135deg,
            ${withAlpha(accent, 0.45)} 0%,
            rgba(10,10,12,0) 60%),
          url('${safeUrl}')
        `,
        backgroundSize: "cover, cover, cover",
        backgroundPosition: "center, center, center",
        backgroundRepeat: "no-repeat",
        filter: "contrast(1.05)",
      }
    case "monochrome":
      // Kinfolk -- desaturated cover that eases into the cool dark
      // surface. Greyscale filter so colour photos read as still
      // life, not snapshots.
      return {
        background: `
          linear-gradient(180deg,
            ${withAlpha(theme.bodyBg, 0.0)} 0%,
            ${withAlpha(theme.bodyBg, 0.55)} 70%,
            ${theme.bodyBg} 100%),
          ${baseImage}
        `,
        filter: "grayscale(0.9) contrast(1.02)",
      }
    case "wash":
      // Vogue -- accent-tinted wash on top, fading into the deep
      // wine surface at the bottom. The diagonal accent gradient
      // gives the cover a fashion-editorial sheen without colour
      // shift on the photo itself.
      return {
        background: `
          linear-gradient(180deg,
            ${withAlpha(theme.bodyBg, 0.0)} 0%,
            ${withAlpha(theme.bodyBg, 0.5)} 60%,
            ${theme.bodyBg} 100%),
          linear-gradient(135deg,
            ${withAlpha(accent, 0.22)} 0%,
            rgba(0,0,0,0) 55%),
          ${baseImage}
        `,
      }
    case "spare":
    default:
      // Frieze -- minimal vignette only. The cover stays pristine,
      // just darkened slightly at the edges so the headline reads.
      return {
        background: `
          linear-gradient(180deg,
            rgba(0,0,0,0.10) 0%,
            rgba(0,0,0,0) 22%,
            ${withAlpha(theme.bodyBg, 0.85)} 88%,
            ${theme.bodyBg} 100%),
          ${baseImage}
        `,
      }
  }
}

/**
 * The kicker palette differs by theme. Atlantic + Vogue use letter-
 * spaced small-caps sans; Wired uses bold all-caps with a rule under;
 * Kinfolk uses a single italic word; Frieze uses tracked monospace.
 */
function renderKicker(theme: ListingTheme, accent: string, parts: string[]) {
  const items = parts.filter(Boolean)
  if (items.length === 0) return null

  const baseStyle: React.CSSProperties = {
    color: theme.textTone === "light" ? withAlpha("#ffffff", 0.85) : theme.mutedText,
  }

  if (theme.id === "wired") {
    return (
      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]" style={baseStyle}>
        <span
          className="inline-block w-8 h-px"
          style={{ background: accent }}
          aria-hidden="true"
        />
        {items.map((p, i) => (
          <React.Fragment key={p}>
            <span style={i === 0 ? { color: accent } : undefined}>{p}</span>
            {i < items.length - 1 && <span aria-hidden="true">·</span>}
          </React.Fragment>
        ))}
      </div>
    )
  }

  if (theme.id === "frieze") {
    return (
      <div
        className="text-[10px] font-medium uppercase tracking-[0.32em]"
        style={{ ...baseStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {items.join("   /   ")}
      </div>
    )
  }

  // Atlantic / Kinfolk / Vogue — small caps, dotted dividers.
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={baseStyle}>
      {items.map((p, i) => (
        <React.Fragment key={p}>
          <span>{p}</span>
          {i < items.length - 1 && (
            <span className="opacity-50" aria-hidden="true">·</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export function EditorialHero({
  theme,
  accent,
  displayName,
  tagline,
  guildIconUrl,
  coverImageUrl,
  kicker,
  inviteSlug,
  inVoiceCount,
  issueNumber,
  approvedAt,
}: EditorialHeroProps) {
  const coverStyle = buildCoverStyle(theme, accent, coverImageUrl)
  const heroTextColor =
    theme.textTone === "light" || coverImageUrl
      ? "#ffffff"
      : theme.bodyText
  const isDarkOverlay = theme.coverBlend === "duotone" || theme.textTone === "light"

  return (
    <section
      className="relative w-full"
      style={{
        ...coverStyle,
        minHeight: coverImageUrl ? "min(90vh, 820px)" : "62vh",
        color: coverImageUrl ? heroTextColor : theme.bodyText,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: "min(1200px, 92vw)",
          margin: "0 auto",
          paddingLeft: "clamp(20px, 5vw, 64px)",
          paddingRight: "clamp(20px, 5vw, 64px)",
          paddingTop: "clamp(80px, 14vh, 160px)",
          paddingBottom: "clamp(40px, 8vh, 96px)",
        }}
      >
        {issueNumber && (
          <div
            className="mb-6 text-[11px] uppercase tracking-[0.4em] opacity-75"
            style={{ fontFamily: theme.bodyFont }}
          >
            {issueNumber}
          </div>
        )}

        {kicker.length > 0 && <div className="mb-6">{renderKicker(theme, accent, kicker)}</div>}

        <div className="flex items-end gap-5 sm:gap-7">
          {guildIconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guildIconUrl}
              alt=""
              className="flex-shrink-0"
              style={{
                width: theme.id === "frieze" ? 56 : 80,
                height: theme.id === "frieze" ? 56 : 80,
                borderRadius: theme.id === "wired" ? 0 : "50%",
                border: `1px solid ${isDarkOverlay ? "rgba(255,255,255,0.25)" : theme.ruleColor}`,
                boxShadow: isDarkOverlay ? "0 8px 30px rgba(0,0,0,0.35)" : "none",
                marginBottom: theme.id === "atlantic" ? 6 : 0,
              }}
            />
          )}
          <div className="min-w-0">
            <h1
              className="font-bold tracking-tight"
              style={{
                fontFamily: theme.displayFont,
                fontSize: theme.id === "frieze" ? "clamp(2.6rem, 7vw, 5.8rem)" : "clamp(2.2rem, 6vw, 4.5rem)",
                lineHeight: theme.id === "frieze" ? 0.95 : 1.05,
                fontWeight: theme.id === "wired" ? 900 : 700,
                textTransform: theme.id === "wired" ? "uppercase" : "none",
                letterSpacing: theme.id === "wired" ? "-0.02em" : "-0.015em",
                color: "inherit",
                textShadow: isDarkOverlay ? "0 2px 24px rgba(0,0,0,0.35)" : undefined,
                margin: 0,
              }}
            >
              {displayName}
            </h1>
          </div>
        </div>

        {tagline && (
          <p
            className="mt-5 max-w-3xl"
            style={{
              fontFamily: theme.italicDeck ? theme.displayFont : theme.bodyFont,
              fontStyle: theme.italicDeck ? "italic" : "normal",
              fontWeight: theme.italicDeck ? 400 : 500,
              fontSize: "clamp(1.05rem, 2vw, 1.45rem)",
              lineHeight: 1.45,
              opacity: isDarkOverlay ? 0.92 : 0.85,
              color: "inherit",
              textShadow: isDarkOverlay ? "0 1px 12px rgba(0,0,0,0.4)" : undefined,
            }}
          >
            {tagline}
          </p>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          {inviteSlug ? (
            <a
              href={`/api/servers/${encodeURIComponent(inviteSlug)}/join`}
              rel="nofollow"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{
                background: theme.id === "wired" ? accent : theme.id === "frieze" ? theme.bodyText : accent,
                color: theme.id === "wired" || theme.id === "frieze" ? (theme.id === "frieze" ? theme.bodyBg : "#0a0a0c") : "#ffffff",
                fontFamily: theme.bodyFont,
                fontSize: "0.92rem",
                fontWeight: 600,
                letterSpacing: theme.id === "wired" ? "0.08em" : "0.02em",
                textTransform: theme.id === "wired" ? "uppercase" : "none",
                padding: theme.id === "frieze" ? "16px 28px" : "14px 26px",
                borderRadius: theme.id === "wired" || theme.id === "frieze" ? 0 : 999,
                boxShadow: isDarkOverlay ? "0 10px 30px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              {theme.id === "wired" ? "Open Invite →" : "Join the community"}
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-2 text-sm opacity-60"
              style={{ fontFamily: theme.bodyFont }}
            >
              Invite coming soon
            </span>
          )}

          {inVoiceCount !== null && inVoiceCount > 0 && (
            <span
              className="inline-flex items-center gap-2 text-sm"
              style={{ fontFamily: theme.bodyFont, color: "inherit", opacity: 0.85 }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#22c55e",
                  boxShadow: "0 0 0 4px rgba(34,197,94,0.18)",
                }}
                aria-hidden="true"
              />
              {inVoiceCount.toLocaleString("en-US")} in voice now
            </span>
          )}

          {approvedAt && (
            <span
              className="text-[11px] uppercase tracking-[0.2em] opacity-60 ml-auto"
              style={{ fontFamily: theme.bodyFont }}
            >
              {/* Fixed locale so SSR == CSR (avoids hydration mismatch). */}
              Featured · {new Date(approvedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export default EditorialHero
