// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Full-width photo essay for the editorial profile.
//          Replaces the 3-column thumbnail grid with a stacked
//          column of large photos and italic captions, sized
//          per-theme. Atlantic / Vogue keep colour; Kinfolk +
//          Frieze go monochrome; Wired goes duotone via filter.
// ============================================================
import React from "react"

import { ListingTheme } from "@/constants/ServerListingData"
import { galleryFilterValue } from "./EditorialThemeProvider"

interface PhotoEssayProps {
  theme: ListingTheme
  accent: string
  images: { url: string; caption?: string }[]
}

export function PhotoEssay({ theme, accent, images }: PhotoEssayProps) {
  if (!images || images.length === 0) return null
  const filter = galleryFilterValue(theme.galleryFilter, accent)

  return (
    <section
      style={{
        maxWidth: "min(1200px, 96vw)",
        margin: "0 auto",
        padding: "clamp(48px, 8vh, 96px) clamp(20px, 5vw, 40px) clamp(24px, 4vh, 48px)",
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
          marginBottom: "1.6rem",
        }}
      >
        The community, in pictures
      </div>

      <div
        className="space-y-10 sm:space-y-14"
        style={{ marginInline: "auto" }}
      >
        {images.map((img, i) => (
          <figure key={i} style={{ margin: 0 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: i % 3 === 0 ? "16 / 9" : i % 3 === 1 ? "4 / 3" : "3 / 2",
                overflow: "hidden",
                borderRadius: theme.id === "wired" || theme.id === "frieze" ? 0 : 6,
                background: theme.mutedText,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || ""}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter,
                }}
                loading="lazy"
              />
            </div>
            {img.caption && (
              <figcaption
                style={{
                  marginTop: "0.85rem",
                  fontFamily: theme.italicDeck ? theme.displayFont : theme.bodyFont,
                  fontStyle: theme.italicDeck ? "italic" : "normal",
                  fontSize: "0.86rem",
                  lineHeight: 1.55,
                  color: theme.mutedText,
                  maxWidth: "65ch",
                }}
              >
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}

export default PhotoEssay
