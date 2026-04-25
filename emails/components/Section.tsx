// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Reusable layout primitives for email templates.
//          Tuned for the dark brand: tighter heading rhythm, soft
//          lavender accent on H2, glass-style callouts.
// ============================================================
import * as React from "react"
import { Heading, Hr, Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

export function Eyebrow({
  children,
  tone = "muted",
}: {
  children: React.ReactNode
  tone?: "muted" | "primary" | "amber"
}) {
  const color =
    tone === "primary"
      ? brand.colors.primary
      : tone === "amber"
      ? brand.colors.amber
      : brand.colors.textMuted
  return (
    <Text style={{ ...eyebrowStyle, color }}>{children}</Text>
  )
}

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
        fontSize: small ? "13px" : "15.5px",
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
  tone?: "neutral" | "amber" | "primary" | "premium"
}) {
  return (
    <div style={{ ...calloutBase, ...calloutTones[tone] }}>
      {title ? (
        <Text style={{ ...calloutTitle, color: calloutTitleTones[tone] }}>
          {title}
        </Text>
      ) : null}
      <Text style={calloutBody}>{children}</Text>
    </div>
  )
}

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontFamily: brand.fontStack,
}

const h1Style: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "30px",
  lineHeight: "1.15",
  fontWeight: 800,
  color: brand.colors.headline,
  letterSpacing: "-0.02em",
  fontFamily: brand.fontStack,
}

const h2Style: React.CSSProperties = {
  margin: "28px 0 10px",
  fontSize: "19px",
  lineHeight: "1.3",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
}

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 14px",
  lineHeight: "1.65",
  fontFamily: brand.fontStack,
}

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${brand.colors.border}`,
  margin: "28px 0",
}

const calloutBase: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: "14px",
  margin: "18px 0",
}

const calloutTones: Record<
  "neutral" | "amber" | "primary" | "premium",
  React.CSSProperties
> = {
  neutral: {
    backgroundColor: brand.colors.surface,
    border: `1px solid ${brand.colors.border}`,
  },
  amber: {
    backgroundColor: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.35)",
  },
  primary: {
    backgroundColor: brand.colors.primarySoft,
    border: "1px solid rgba(59,130,246,0.35)",
  },
  premium: {
    backgroundColor: "rgba(168,85,247,0.10)",
    border: "1px solid rgba(244,114,182,0.35)",
  },
}

const calloutTitleTones: Record<
  "neutral" | "amber" | "primary" | "premium",
  string
> = {
  neutral: brand.colors.headline,
  amber: brand.colors.amber,
  primary: brand.colors.primary,
  premium: brand.colors.pink,
}

const calloutTitle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontFamily: brand.fontStack,
}

const calloutBody: React.CSSProperties = {
  margin: 0,
  fontSize: "14.5px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}
