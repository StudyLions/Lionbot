// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Editorial article-body wrapper for the public server
//          profile. Constrains the description to a 65-character
//          column, applies the theme's drop-cap on the first letter
//          if enabled, and styles the markdown-rendered HTML so it
//          reads like a magazine feature, not a card.
//
//          The renderer in `utils/listingMarkdown.ts` has already
//          escaped + allowlisted the HTML, so dangerouslySetInnerHTML
//          is safe here.
// ============================================================
import React from "react"

import { ListingTheme } from "@/constants/ServerListingData"
import { withAlpha } from "./EditorialThemeProvider"

interface EditorialArticleProps {
  theme: ListingTheme
  accent: string
  /** Pre-rendered HTML from utils/listingMarkdown.ts */
  descriptionHtml: string
  /** Optional sub-heading shown above the body (small caps). */
  sectionLabel?: string
}

export function EditorialArticle({
  theme,
  accent,
  descriptionHtml,
  sectionLabel = "The story",
}: EditorialArticleProps) {
  if (!descriptionHtml) return null

  // Drop-cap colour: Wired uses accent; Atlantic + Vogue use the bodyText
  // for restraint; Kinfolk + Frieze don't get a drop-cap at all.
  const dropCapColor =
    theme.id === "wired"
      ? accent
      : theme.id === "vogue"
      ? accent
      : theme.bodyText

  // Determine the section label treatment per theme.
  const labelStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      color: theme.mutedText,
      fontFamily: theme.bodyFont,
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.24em",
      textTransform: "uppercase",
      marginBottom: "1.4rem",
    }
    if (theme.id === "wired") {
      return { ...base, color: accent, fontWeight: 800 }
    }
    if (theme.id === "frieze") {
      return { ...base, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.32em" }
    }
    return base
  })()

  const showSectionRule = theme.ruleStyle !== "none"

  return (
    <section
      className="relative"
      style={{
        maxWidth: theme.id === "frieze" ? "62ch" : "65ch",
        margin: "0 auto",
        padding: "clamp(48px, 8vh, 96px) clamp(20px, 5vw, 0px)",
      }}
    >
      <div className="flex items-center gap-4">
        <span style={labelStyle}>{sectionLabel}</span>
        {showSectionRule && (
          <span
            className="flex-1"
            style={{
              borderTop:
                theme.ruleStyle === "thick"
                  ? `2px solid ${accent}`
                  : theme.ruleStyle === "double"
                  ? `3px double ${theme.ruleColor}`
                  : `1px solid ${theme.ruleColor}`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div
        className="editorial-article"
        data-dropcap={theme.dropCap ? "true" : "false"}
        style={{
          color: theme.bodyText,
          fontFamily: theme.bodyFont,
          fontSize: theme.id === "frieze" ? "0.96rem" : "1.075rem",
          lineHeight: theme.id === "frieze" ? 1.65 : 1.78,
        }}
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />

      <style jsx>{`
        .editorial-article :global(p) {
          margin: 0 0 1.25em;
        }
        .editorial-article :global(p:last-child) {
          margin-bottom: 0;
        }
        .editorial-article :global(h2) {
          font-family: ${theme.displayFont};
          font-size: ${theme.id === "frieze" ? "1.7rem" : "1.55rem"};
          font-weight: ${theme.id === "wired" ? 800 : 700};
          letter-spacing: -0.01em;
          margin: 2em 0 0.6em;
          color: ${theme.bodyText};
          ${theme.id === "wired" ? "text-transform: uppercase;" : ""}
        }
        .editorial-article :global(h3) {
          font-family: ${theme.displayFont};
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1.6em 0 0.5em;
          color: ${theme.bodyText};
        }
        .editorial-article :global(ul),
        .editorial-article :global(ol) {
          margin: 0 0 1.25em;
          padding-left: 1.4em;
        }
        .editorial-article :global(li) {
          margin: 0.35em 0;
        }
        .editorial-article :global(blockquote) {
          margin: 1.6em 0;
          padding: 0 0 0 1.2em;
          border-left: 2px solid ${accent};
          font-family: ${theme.displayFont};
          font-style: italic;
          font-size: 1.2em;
          color: ${theme.bodyText};
          opacity: 0.92;
        }
        .editorial-article :global(code) {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.92em;
          padding: 0.15em 0.4em;
          border-radius: 3px;
          background: ${withAlpha(theme.bodyText, 0.08)};
        }
        .editorial-article :global(a) {
          color: ${accent};
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 1px;
        }
        .editorial-article :global(strong) {
          font-weight: 700;
          color: ${theme.bodyText};
        }

        /* Drop-cap on the very first paragraph of the article. The
           selector is conservative -- only direct first <p> children
           and only when the theme opts in. */
        .editorial-article[data-dropcap="true"] :global(p:first-of-type::first-letter) {
          float: left;
          font-family: ${theme.displayFont};
          font-weight: ${theme.id === "wired" ? 900 : 700};
          font-size: ${theme.id === "vogue" ? "5.4em" : "4.6em"};
          line-height: 0.85;
          padding: 0.08em 0.12em 0 0;
          margin: 0.05em 0.06em 0 0;
          color: ${dropCapColor};
          ${theme.id === "wired" ? "text-transform: uppercase;" : ""}
        }
      `}</style>
    </section>
  )
}

export default EditorialArticle
