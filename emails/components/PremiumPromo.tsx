// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Tier-aware premium promotion. A single restrained card
//          with a thin top accent line, the offer in plain sentences,
//          and one CTA. Two perks max, written like product notes,
//          not bullet-point marketing.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

export type PromoTier =
  | "free"
  | "lionheart"
  | "lionheart_plus"
  | "lionheart_plus_plus"

interface PremiumPromoProps {
  tier: PromoTier
}

interface PromoContent {
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
}

const PROMO: Record<PromoTier, PromoContent> = {
  free: {
    title: "Speed it up with LionHeart",
    body:
      "Members get 500–3,000 LionGems each month, faster pet growth, and double study coins across every server. From €4.99/month.",
    ctaLabel: "See LionHeart",
    ctaHref: `${brand.siteUrl}/donate`,
  },
  lionheart: {
    title: "Move up to LionHeart+",
    body:
      "More than double the monthly gems, bigger farm boosts, and longer water duration for your LionGotchi. €9.99/month.",
    ctaLabel: "Compare tiers",
    ctaHref: `${brand.siteUrl}/donate`,
  },
  lionheart_plus: {
    title: "Top tier — LionHeart++",
    body:
      "Includes a free Server Premium slot for one of your servers, the maximum study and farm boosts, and 3,000 monthly gems.",
    ctaLabel: "Compare tiers",
    ctaHref: `${brand.siteUrl}/donate`,
  },
  lionheart_plus_plus: {
    title: "Thank you for going all-in",
    body:
      "You are on the top tier. If you would like to spread the love, you can gift LionHeart to a friend or upgrade another one of your servers.",
    ctaLabel: "Open the LionHeart store",
    ctaHref: `${brand.siteUrl}/donate`,
  },
}

export function PremiumPromo({ tier }: PremiumPromoProps) {
  const content = PROMO[tier]

  return (
    <Section style={wrap}>
      <div style={cardStyle}>
        <Text style={titleStyle}>{content.title}</Text>
        <Text style={bodyStyle}>{content.body}</Text>
        <a href={content.ctaHref} style={ctaStyle}>
          {content.ctaLabel}
        </a>
      </div>
    </Section>
  )
}

export default PremiumPromo

const wrap: React.CSSProperties = {
  margin: "28px 0 4px",
}

const cardStyle: React.CSSProperties = {
  padding: "20px 22px 18px",
  borderRadius: "12px",
  background: brand.colors.surface,
  border: `1px solid ${brand.colors.border}`,
  borderTop: `2px solid ${brand.colors.premiumGold}`,
  fontFamily: brand.fontStack,
}

const titleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "16px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.005em",
  fontFamily: brand.fontStack,
}

const bodyStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.colors.text,
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
