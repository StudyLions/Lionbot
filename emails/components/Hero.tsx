// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Reusable hero band that opens the welcome and digest
//          templates. Renders an inset gradient panel with the
//          template-supplied eyebrow, title, and (optional) trailing
//          children. Lives inside the EmailLayout card so the corners
//          line up cleanly.
// ============================================================
import * as React from "react"
import { Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

interface HeroProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  background?: "primary" | "warm" | "premium" | "digest"
  children?: React.ReactNode
}

const backgrounds: Record<NonNullable<HeroProps["background"]>, string> = {
  primary:
    "radial-gradient(ellipse at top right, rgba(59,130,246,0.35), transparent 60%), linear-gradient(180deg, #0E1730 0%, #0B0F1A 100%)",
  warm:
    "radial-gradient(ellipse at top right, rgba(245,158,11,0.30), transparent 60%), linear-gradient(180deg, #1B1426 0%, #0B0F1A 100%)",
  premium:
    "radial-gradient(ellipse at top right, rgba(168,85,247,0.30), transparent 60%), radial-gradient(ellipse at bottom left, rgba(244,114,182,0.20), transparent 55%), linear-gradient(180deg, #15101F 0%, #0B0F1A 100%)",
  digest:
    "radial-gradient(ellipse at top, rgba(59,130,246,0.30), transparent 60%), radial-gradient(ellipse at bottom right, rgba(245,158,11,0.18), transparent 55%), linear-gradient(180deg, #0F1729 0%, #0B0F1A 100%)",
}

export function Hero({
  eyebrow,
  title,
  subtitle,
  background = "primary",
  children,
}: HeroProps) {
  return (
    <div
      style={{
        ...heroBandStyle,
        background: backgrounds[background],
      }}
    >
      {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
      <Text style={titleStyle}>{title}</Text>
      {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
      {children}
    </div>
  )
}

const heroBandStyle: React.CSSProperties = {
  padding: "34px 32px 30px",
  borderBottom: `1px solid ${brand.colors.border}`,
  fontFamily: brand.fontStack,
}

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.colors.primary,
  fontFamily: brand.fontStack,
}

const titleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "32px",
  lineHeight: "1.1",
  fontWeight: 800,
  color: brand.colors.headline,
  letterSpacing: "-0.025em",
  fontFamily: brand.fontStack,
}

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "15.5px",
  lineHeight: "1.55",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

export default Hero
