// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Masthead-style footer for the editorial profile.
//          Replaces the "Powered by Leo" sidebar card with a
//          single hairline-separated row at the bottom of the
//          article: who verified the listing, when, and a link
//          back to the directory.
// ============================================================
import React from "react"
import Link from "next/link"

import { ListingTheme } from "@/constants/ServerListingData"

interface ColophonProps {
  theme: ListingTheme
  accent: string
  slug: string
  approvedAt: string | null
  externalLinkUrl?: string | null
  externalLinkLabel?: string | null
}

export function Colophon({
  theme,
  accent,
  slug,
  approvedAt,
  externalLinkUrl,
  externalLinkLabel,
}: ColophonProps) {
  // Format with a fixed locale so the SSR output and the browser
  // output match -- otherwise non-en-US visitors hit React hydration
  // mismatch errors (#418).
  const approvedDate = approvedAt
    ? new Date(approvedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <footer
      style={{
        maxWidth: "min(1100px, 92vw)",
        margin: "0 auto",
        padding: "clamp(40px, 6vh, 64px) clamp(20px, 5vw, 40px) clamp(56px, 8vh, 96px)",
        borderTop: `1px solid ${theme.ruleColor}`,
      }}
    >
      {/* DoFollow link, presented as a confident centered call instead
          of a side-card. We keep rel="dofollow noopener" so this is the
          SEO-juicy backlink we promise admins on the donate page. */}
      {externalLinkUrl && (
        <div
          className="text-center"
          style={{
            marginBottom: "clamp(28px, 5vh, 56px)",
          }}
        >
          <div
            style={{
              fontFamily: theme.bodyFont,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: theme.mutedText,
              marginBottom: "0.5rem",
            }}
          >
            Continue reading
          </div>
          <a
            href={externalLinkUrl}
            rel="dofollow noopener"
            target="_blank"
            style={{
              fontFamily: theme.displayFont,
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 600,
              color: accent,
              textDecoration: "underline",
              textUnderlineOffset: 6,
              textDecorationThickness: 1,
            }}
          >
            {externalLinkLabel || "Visit website"} →
          </a>
        </div>
      )}

      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{
          fontFamily: theme.bodyFont,
          fontSize: "0.78rem",
          color: theme.mutedText,
        }}
      >
        <div>
          <span style={{ fontWeight: 600, color: theme.bodyText }}>LionBot</span>
          {" · "}
          Verified premium listing
          {approvedDate && (
            <>
              {" · "}
              <span>Featured since {approvedDate}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-5">
          <Link href="/servers" passHref>
            <a
              style={{
                color: theme.bodyText,
                textDecoration: "underline",
                textUnderlineOffset: 4,
                textDecorationColor: theme.ruleColor,
                fontWeight: 500,
              }}
            >
              All servers
            </a>
          </Link>
          <Link href="/donate#feature_server" passHref>
            <a
              style={{
                color: accent,
                textDecoration: "underline",
                textUnderlineOffset: 4,
                fontWeight: 500,
              }}
            >
              Feature your server
            </a>
          </Link>
        </div>
      </div>

      <div
        className="text-center mt-6 opacity-50"
        style={{
          fontFamily: theme.id === "frieze"
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : theme.bodyFont,
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.mutedText,
        }}
      >
        /servers/{slug}
      </div>
    </footer>
  )
}

export default Colophon
