// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Type primitives -- H1, H2, Paragraph, Divider, Callout,
//          and a SignOff used at the end of every email. Tuned for
//          a calm, editorial rhythm: large display headline, generous
//          leading body, restrained accents.
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
        fontSize: small ? "13.5px" : "15.5px",
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

// Single quiet inset block used sparingly when one piece of info needs
// to stand apart -- a top-server highlight or a "need help?" pointer.
export function Callout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div style={calloutStyle}>{children}</div>
}

export function SignOff({
  name = "Ari",
  role = "Founder, LionBot",
}: {
  name?: string
  role?: string
}) {
  return (
    <div style={{ marginTop: "32px" }}>
      <Text style={signOffLine}>— {name}</Text>
      <Text style={signOffRole}>{role}</Text>
    </div>
  )
}

const h1Style: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "26px",
  lineHeight: "1.2",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.02em",
  fontFamily: brand.fontStack,
}

const h2Style: React.CSSProperties = {
  margin: "32px 0 12px",
  fontSize: "16px",
  lineHeight: "1.35",
  fontWeight: 600,
  color: brand.colors.headline,
  letterSpacing: "-0.005em",
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

const calloutStyle: React.CSSProperties = {
  margin: "20px 0",
  padding: "14px 16px",
  borderLeft: `2px solid ${brand.colors.primary}`,
  background: brand.colors.surface,
  borderRadius: "0 8px 8px 0",
  fontSize: "14.5px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

const signOffLine: React.CSSProperties = {
  margin: 0,
  fontSize: "15px",
  fontWeight: 600,
  color: brand.colors.headline,
  fontFamily: brand.fontStack,
}

const signOffRole: React.CSSProperties = {
  margin: "2px 0 0",
  fontSize: "13px",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}
