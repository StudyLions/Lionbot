// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Editorial theme provider for the "Feature Your Server"
//          public profile page (and embed/OG render targets that
//          reuse the same visual language). Loads the theme's
//          Google Font pair via next/head <link> tags and writes
//          a set of CSS custom properties onto a wrapper div so
//          deeper components can style themselves with `var(--listing-*)`
//          without prop-drilling theme objects.
//
//          Design intent: typography IS the design. The provider
//          is intentionally tiny -- it only sets variables and
//          loads fonts. All visual decisions (drop-cap rendering,
//          gallery filter, rule strokes) are made downstream by
//          consuming `var(--listing-*)`.
// ============================================================
import Head from "next/head"
import React, { useMemo } from "react"

import {
  ListingTheme,
  resolveTheme,
  GalleryFilter,
} from "@/constants/ServerListingData"

interface EditorialThemeProviderProps {
  /** Persisted theme_preset id (legacy or current). resolveTheme()
   *  handles unknown / null values transparently. */
  themeId: string | null | undefined
  /** Admin-chosen accent override. Falls back to theme.defaultAccent. */
  accentOverride?: string | null
  /** Optional inline-style overrides (lets the public page constrain
   *  width/padding without wrapping in another element). */
  style?: React.CSSProperties
  /** Optional className appended to the wrapper. */
  className?: string
  children: React.ReactNode
}

/**
 * Pick the CSS filter that corresponds to the theme's gallery treatment.
 * Returned as a `filter:` value so consumers can drop it directly into
 * their own style attribute or via the CSS variable.
 */
export function galleryFilterValue(filter: GalleryFilter, accent: string): string {
  switch (filter) {
    case "grayscale":
      return "grayscale(1) contrast(1.05)"
    case "sepia":
      return "sepia(0.6) saturate(1.1)"
    case "duotone":
      // Approximation of a true duotone via CSS filters: drop colour, then
      // tint via a multiply blend on a sibling overlay (the consumer adds
      // the overlay). On its own this just goes high-contrast greyscale.
      return "grayscale(1) contrast(1.2) brightness(0.9)"
    default:
      return "none"
  }
}

/**
 * Hex / colour string -> rgba with the requested alpha. Falls back to
 * the original input if the value isn't a parseable #rrggbb (e.g. it's
 * already an rgba()). Used to derive translucent variants of the accent
 * for hover states and faint backgrounds without forcing the consumer
 * to keep two colour values in sync.
 */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const num = parseInt(m[1], 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function EditorialThemeProvider({
  themeId,
  accentOverride,
  style,
  className,
  children,
}: EditorialThemeProviderProps) {
  const theme: ListingTheme = useMemo(() => resolveTheme(themeId), [themeId])
  const accent = accentOverride && /^#[0-9a-f]{6}$/i.test(accentOverride)
    ? accentOverride
    : theme.defaultAccent

  // One <link> per font family — Google's CSS2 endpoint accepts a
  // comma-separated `family` query so we could fold these into one,
  // but separate links are easier for next/head to dedupe across
  // sibling re-mounts (e.g. when the editor switches themes).
  const fontHrefs = useMemo(
    () =>
      theme.googleFonts.map(
        (slug) =>
          `https://fonts.googleapis.com/css2?family=${slug}&display=swap`,
      ),
    [theme.googleFonts],
  )

  const cssVars: React.CSSProperties = useMemo(() => {
    const vars: Record<string, string> = {
      "--listing-bg": theme.bodyBg,
      "--listing-text": theme.bodyText,
      "--listing-muted": theme.mutedText,
      "--listing-rule": theme.ruleColor,
      "--listing-accent": accent,
      "--listing-accent-soft": withAlpha(accent, 0.12),
      "--listing-accent-strong": withAlpha(accent, 0.85),
      "--listing-display-font": theme.displayFont,
      "--listing-body-font": theme.bodyFont,
      "--listing-gallery-filter": galleryFilterValue(theme.galleryFilter, accent),
      "--listing-rule-style": theme.ruleStyle,
      "--listing-cover-blend": theme.coverBlend,
      "--listing-surface": theme.surfaceTreatment,
      "--listing-deck-style": theme.italicDeck ? "italic" : "normal",
    }
    return { ...vars, ...style } as React.CSSProperties
  }, [theme, accent, style])

  return (
    <>
      <Head>
        {fontHrefs.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </Head>
      <div
        data-listing-theme={theme.id}
        data-listing-surface={theme.surfaceTreatment}
        className={className}
        style={cssVars}
      >
        {children}
      </div>
    </>
  )
}

export default EditorialThemeProvider
