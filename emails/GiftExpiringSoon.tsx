// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Sent to a sender at T-7d and T-1d before their LionHeart
//          gift's claim window closes. Single CTA: open the gifts hub
//          (which surfaces the claim URL again).
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/EmailLayout"
import { brand } from "../utils/email/brand"

interface GiftExpiringSoonProps {
  tierLabel: string
  daysRemaining: number  // 7 or 1
}

export const GiftExpiringSoonMockProps: GiftExpiringSoonProps = {
  tierLabel: "LionHeart+",
  daysRemaining: 7,
}

export function GiftExpiringSoon({ tierLabel, daysRemaining }: GiftExpiringSoonProps) {
  const headline = daysRemaining === 1
    ? "Your gift expires tomorrow"
    : `Your gift expires in ${daysRemaining} days`

  return (
    <EmailLayout previewText={headline}>
      <Section style={wrap}>
        <div style={cardStyle}>
          <Text style={titleStyle}>{headline}</Text>
          <Text style={bodyStyle}>
            Nobody has claimed the {tierLabel} you gifted yet. The link is still valid: open your gifts hub to copy it again and forward to someone who could use it.
          </Text>
          <Text style={metaStyle}>
            If it expires unclaimed, Stripe refunds the unused portion to your card. No action needed from you.
          </Text>
          <a href={`${brand.siteUrl}/dashboard/gifts`} style={ctaStyle}>
            Open your gifts hub
          </a>
        </div>
      </Section>
    </EmailLayout>
  )
}

export default GiftExpiringSoon

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
  margin: "0 0 12px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
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
