// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Sent to a sender immediately after they purchase a
//          LionHeart user gift. The recipient is determined by who
//          claims the URL, so the URL itself is the only meaningful
//          action item -- this email exists primarily as a "you can
//          always come back here to find the link" record.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/EmailLayout"
import { brand } from "../utils/email/brand"

interface GiftClaimableProps {
  tierLabel: string
  claimUrl: string
  expiresAtLabel: string  // "April 12, 2026" formatted by the caller
}

export const GiftClaimableMockProps: GiftClaimableProps = {
  tierLabel: "LionHeart+",
  claimUrl: "https://lionbot.org/gift/claim/abc123def456",
  expiresAtLabel: "June 14, 2026",
}

export function GiftClaimable({ tierLabel, claimUrl, expiresAtLabel }: GiftClaimableProps) {
  return (
    <EmailLayout previewText="Your gift link is ready to share.">
      <Section style={wrap}>
        <div style={cardStyle}>
          <Text style={titleStyle}>Your gift is ready to share</Text>
          <Text style={bodyStyle}>
            Send this link to the person you're gifting {tierLabel} to. They sign in with Discord, claim, and their perks activate instantly.
          </Text>

          <div style={urlBlock}>
            <Text style={urlText}>{claimUrl}</Text>
          </div>

          <Text style={metaStyle}>
            Expires {expiresAtLabel}. If unclaimed by then, the subscription cancels and the unused portion refunds to your card.
          </Text>

          <a href={`${brand.siteUrl}/dashboard/gifts`} style={ctaStyle}>
            Manage your gifts
          </a>
        </div>
      </Section>
    </EmailLayout>
  )
}

export default GiftClaimable

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

const urlBlock: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "10px",
  background: brand.colors.surface,
  border: `1px solid ${brand.colors.border}`,
  margin: "0 0 12px",
  wordBreak: "break-all",
}

const urlText: React.CSSProperties = {
  margin: 0,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "13px",
  lineHeight: "1.5",
  color: brand.colors.text,
}

const metaStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "12.5px",
  color: brand.colors.textMuted,
  lineHeight: "1.6",
  fontFamily: brand.fontStack,
}

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "13.5px",
  fontWeight: 600,
  color: brand.colors.text,
  textDecoration: "none",
  borderBottom: `1px solid ${brand.colors.borderStrong}`,
  paddingBottom: "1px",
  fontFamily: brand.fontStack,
}
