// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Marketplace 2.0 Phase 2 -- side-effect component that
//          (1) injects the theme's Google Font stylesheet into
//              <head> exactly once per page, and
//          (2) emits the keyframe definitions used by the per-
//              theme background animations.
//
//          Pulled out of StoreCanvas so the customizer can use
//          the same machinery in its live preview without us
//          re-injecting <link rel="stylesheet"> on every keystroke.
// ============================================================
import Head from "next/head"
import { useEffect } from "react"
import {
  STORE_THEMES, STORE_ANIMATIONS,
  type StoreThemeId, type StoreAnimationId,
} from "@/constants/StoreThemes"

interface ThemeStyleProps {
  themeId: StoreThemeId
  animationId?: StoreAnimationId
}

/**
 * Idempotent <link> injection for the theme's Google Font. We don't want
 * Next/Head to re-render on every keystroke in the customizer, so the
 * link is added imperatively and de-duplicated by href.
 */
function ensureGoogleFont(href: string | undefined) {
  if (typeof window === "undefined" || !href) return
  if (document.head.querySelector(`link[data-store-font="${href}"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.dataset.storeFont = href
  document.head.appendChild(link)
}

export default function ThemeStyle({ themeId, animationId = "none" }: ThemeStyleProps) {
  const theme = STORE_THEMES[themeId] ?? STORE_THEMES.default
  const anim = STORE_ANIMATIONS[animationId] ?? STORE_ANIMATIONS.none

  useEffect(() => {
    ensureGoogleFont(theme.font.googleFontHref)
  }, [theme.font.googleFontHref])

  return (
    <Head>
      <style>{`
        @keyframes lg-store-clouds {
          0% { background-position: 0 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes lg-store-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; filter: brightness(1.15); }
        }
        @keyframes lg-store-aurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lg-store-anim {
            animation: none !important;
          }
        }
      `}</style>
      {/* Optional inline style fallback for the font (in case the link
          hasn't loaded yet, the family will at least be set in the DOM). */}
      <style>{`
        .lg-store-theme-${theme.id} {
          font-family: ${theme.font.family};
        }
      `}</style>
      {anim.id !== "none" && <style>{animationCss(anim.id)}</style>}
    </Head>
  )
}

function animationCss(id: StoreAnimationId): string {
  switch (id) {
    case "parallax-clouds":
      return `
        .lg-store-bg.lg-store-anim-parallax-clouds::after {
          content: "";
          position: absolute; inset: 0; pointer-events: none; opacity: 0.18;
          background:
            radial-gradient(circle at 25% 30%, white 1px, transparent 2px) 0 0/200px 100px,
            radial-gradient(circle at 75% 70%, white 1px, transparent 2px) 100px 50px/200px 100px;
          animation: lg-store-clouds 80s linear infinite;
        }
      `
    case "pulse":
      return `
        .lg-store-bg.lg-store-anim-pulse {
          animation: lg-store-pulse 4s ease-in-out infinite;
        }
      `
    case "rainbow":
      return `
        .lg-store-bg.lg-store-anim-rainbow {
          background-size: 400% 400% !important;
          animation: lg-store-aurora 18s ease infinite;
        }
      `
    case "none":
    default:
      return ""
  }
}
