// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Reusable layout primitives for email templates.
//          - H1 / H2: branded headings.
//          - Paragraph: body copy with consistent spacing.
//          - Divider: subtle separator between sections.
//          - Callout: highlighted box used for tips and CTAs.
// ============================================================
import * as React from "react"
import { Heading, Hr, Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

export function H1({ children }: { children: React.ReactNode }) {
  return <Heading as="h1" style={h1Style}>{children}</Heading>
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Heading as="h2" style={h2Style}>{children}</Heading>
}

export function Paragraph({
  children,
  muted = false,
  small = false,
}: {
  children: React.ReactNode
  muted?: boolean
  small?: boolean
}) {
  return (
    <Text
      style={{
        ...paragraphStyle,
        fontSize: small ? "13px" : "15px",
        color: muted ? brand.colors.textMuted : brand.colors.text,
      }}
    >
      {children}
    </Text>
  )
}

export function Divider() {
  return <Hr style={dividerStyle} />
}

export function Callout({
  title,
  children,
  tone = "neutral",
}: {
  title?: string
  children: React.ReactNode
  tone?: "neutral" | "warm" | "premium"
}) {
  return (
    <div style={{ ...calloutBase, ...calloutTones[tone] }}>
      {title ? <Text style={calloutTitle}>{title}</Text> : null}
      <Text style={calloutBody}>{children}</Text>
    </div>
  )
}

const h1Style: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "26px",
  lineHeight: "1.25",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
}

const h2Style: React.CSSProperties = {
  margin: "24px 0 8px",
  fontSize: "18px",
  lineHeight: "1.3",
  fontWeight: 700,
  color: brand.colors.headingAccent,
}

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 14px",
  lineHeight: "1.6",
  fontFamily: brand.fontStack,
}

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${brand.colors.border}`,
  margin: "28px 0",
}

const calloutBase: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: "12px",
  margin: "16px 0",
}

const calloutTones: Record<"neutral" | "warm" | "premium", React.CSSProperties> = {
  neutral: {
    backgroundColor: brand.colors.surfaceMuted,
    border: `1px solid ${brand.colors.border}`,
  },
  warm: {
    backgroundColor: "#FFF6E0",
    border: `1px solid #F2D793`,
  },
  premium: {
    backgroundColor: "#FFF9DA",
    border: `1px solid ${brand.colors.premiumGold}`,
  },
}

const calloutTitle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "14px",
  fontWeight: 700,
  color: brand.colors.headingAccent,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
}

const calloutBody: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  lineHeight: "1.55",
  color: brand.colors.text,
}
