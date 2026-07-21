// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Email-verification code for a new LionGotchi for Anki
//          email account. The user typed their address into the
//          addon seconds ago and is sitting on the "enter code"
//          screen — the 6-digit code IS the email; everything else
//          is reassurance. Codes expire in 15 minutes.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/EmailLayout"
import { brand } from "../utils/email/brand"

interface AnkiVerifyCodeProps {
  code: string // "042913"
  displayName: string
}

export const AnkiVerifyCodeMockProps: AnkiVerifyCodeProps = {
  code: "042913",
  displayName: "Ari",
}

export function AnkiVerifyCode({ code, displayName }: AnkiVerifyCodeProps) {
  const spaced = code.split("").join(" ")
  return (
    <EmailLayout previewText={`${code} is your LionGotchi verification code.`}>
      <Section style={wrap}>
        <div style={cardStyle}>
          <Text style={titleStyle}>Confirm your email</Text>
          <Text style={bodyStyle}>
            Hi {displayName} — type this code into Anki to finish creating
            your LionGotchi account:
          </Text>

          <div style={codeBlock}>
            <Text style={codeText}>{spaced}</Text>
          </div>

          <Text style={metaStyle}>
            The code expires in 15 minutes. If you didn&apos;t create a
            LionGotchi account, you can safely ignore this email — nothing
            happens without the code.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  )
}

export default AnkiVerifyCode

const wrap: React.CSSProperties = {
  margin: 0,
}

const cardStyle: React.CSSProperties = {
  padding: "4px 0 0",
  borderTop: `2px solid ${brand.colors.premiumGold}`,
  fontFamily: brand.fontStack,
}

const titleStyle: React.CSSProperties = {
  margin: "16px 0 12px",
  fontSize: "18px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.005em",
  fontFamily: brand.fontStack,
}

const bodyStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

const codeBlock: React.CSSProperties = {
  padding: "18px 16px",
  borderRadius: "10px",
  background: brand.colors.surface,
  border: `1px solid ${brand.colors.border}`,
  margin: "0 0 14px",
  textAlign: "center" as const,
}

const codeText: React.CSSProperties = {
  margin: 0,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "0.35em",
  color: brand.colors.headline,
}

const metaStyle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "12.5px",
  color: brand.colors.textMuted,
  lineHeight: "1.6",
  fontFamily: brand.fontStack,
}
