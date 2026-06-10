// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: Password-reset code for a LionGotchi for Anki email
//          account. Requested from inside the addon ("Forgot
//          password?"); the user types the 6-digit code plus a new
//          password back into Anki. Codes expire in 15 minutes.
//          Resetting signs out every connected device.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/EmailLayout"
import { brand } from "../utils/email/brand"

interface AnkiPasswordResetProps {
  code: string // "042913"
  displayName: string
}

export const AnkiPasswordResetMockProps: AnkiPasswordResetProps = {
  code: "042913",
  displayName: "Ari",
}

export function AnkiPasswordReset({ code, displayName }: AnkiPasswordResetProps) {
  const spaced = code.split("").join(" ")
  return (
    <EmailLayout previewText={`${code} is your LionGotchi password reset code.`}>
      <Section style={wrap}>
        <div style={cardStyle}>
          <Text style={titleStyle}>Reset your password</Text>
          <Text style={bodyStyle}>
            Hi {displayName} — type this code into Anki along with your new
            password:
          </Text>

          <div style={codeBlock}>
            <Text style={codeText}>{spaced}</Text>
          </div>

          <Text style={metaStyle}>
            The code expires in 15 minutes. Resetting signs you out on every
            device. If you didn&apos;t request this, you can ignore this
            email — your password stays unchanged without the code.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  )
}

export default AnkiPasswordReset

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
