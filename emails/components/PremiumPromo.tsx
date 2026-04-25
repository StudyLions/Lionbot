// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Tier-aware premium promotion block. Renders a different
//          card depending on whether the user is on Free, LionHeart,
//          LionHeart+, or LionHeart++ — each one nudges them toward
//          the next step (upgrade / gift / renew).
// ============================================================
import * as React from "react"
import { Img, Section, Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"
import { Button } from "./Button"

export type PromoTier = "free" | "lionheart" | "lionheart_plus" | "lionheart_plus_plus"

interface PremiumPromoProps {
  tier: PromoTier
  variant?: "footer" | "block"
}

interface PromoContent {
  badge: string
  badgeColor: string
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  perks: string[]
}

const PROMO_CONTENT: Record<PromoTier, PromoContent> = {
  free: {
    badge: "LIONHEART",
    badgeColor: brand.colors.premiumBlue,
    title: "Unlock the next level of LionBot",
    body:
      "LionHeart members get monthly gems, faster LionGotchi growth, focus-timer themes, and a stack of economy boosts. Pricing starts at €4.99/month.",
    ctaLabel: "See LionHeart plans",
    ctaHref: `${brand.siteUrl}/donate`,
    perks: [
      "500–3,000 LionGems every month",
      "Up to 2× study coin boost across every server",
      "LionGotchi farm boosts and bonus drop rates",
      "Custom focus-timer themes",
    ],
  },
  lionheart: {
    badge: "LIONHEART+",
    badgeColor: brand.colors.premiumPink,
    title: "Already loving LionHeart? LionHeart+ is the upgrade",
    body:
      "More than 2× the monthly gems, bigger farm boosts, and longer water duration for your LionGotchi. €9.99/month.",
    ctaLabel: "Upgrade to LionHeart+",
    ctaHref: `${brand.siteUrl}/donate`,
    perks: [
      "1,200 monthly gems (up from 500)",
      "1.75× study coin boost",
      "+25% bonus drop rate on the farm",
      "8 unlockable focus-timer themes",
    ],
  },
  lionheart_plus: {
    badge: "LIONHEART++",
    badgeColor: brand.colors.premiumGold,
    title: "Go all-in with LionHeart++",
    body:
      "The top tier includes a free Server Premium slot for one of your servers, 3,000 monthly gems, and the maximum farm and gold boosts.",
    ctaLabel: "Upgrade to LionHeart++",
    ctaHref: `${brand.siteUrl}/donate`,
    perks: [
      "Includes Server Premium for one server",
      "3,000 monthly gems",
      "2× study coin boost (max tier)",
      "Your LionGotchi never dies",
    ],
  },
  lionheart_plus_plus: {
    badge: "THANK YOU",
    badgeColor: brand.colors.premiumGold,
    title: "You are at the top tier — thank you!",
    body:
      "Want to spread the love? You can gift LionHeart to a friend or upgrade another one of your servers to Server Premium.",
    ctaLabel: "Open the LionHeart store",
    ctaHref: `${brand.siteUrl}/donate`,
    perks: [
      "Gift LionHeart to a friend",
      "Add Server Premium for another server",
      "Buy LionGems packs at any time",
    ],
  },
}

export function PremiumPromo({ tier, variant = "block" }: PremiumPromoProps) {
  const content = PROMO_CONTENT[tier]
  const isFooter = variant === "footer"

  return (
    <Section
      style={{
        ...wrapperStyle,
        backgroundColor: isFooter ? brand.colors.surfaceMuted : "#FFF9DA",
        borderColor: isFooter ? brand.colors.border : content.badgeColor,
      }}
    >
      <Text
        style={{
          ...badgeStyle,
          backgroundColor: content.badgeColor,
        }}
      >
        {content.badge}
      </Text>
      <Text style={titleStyle}>{content.title}</Text>
      <Text style={bodyStyle}>{content.body}</Text>
      {!isFooter ? (
        <ul style={listStyle}>
          {content.perks.map((perk) => (
            <li key={perk} style={listItemStyle}>
              {perk}
            </li>
          ))}
        </ul>
      ) : null}
      <div style={{ marginTop: "12px" }}>
        <Button href={content.ctaHref} variant="primary">
          {content.ctaLabel}
        </Button>
      </div>
    </Section>
  )
}

export default PremiumPromo

const wrapperStyle: React.CSSProperties = {
  border: "1px solid",
  borderRadius: "14px",
  padding: "20px 22px",
  margin: "24px 0 8px",
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  margin: "0 0 8px",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#FFFFFF",
}

const titleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "17px",
  fontWeight: 700,
  color: brand.colors.headline,
  lineHeight: "1.3",
}

const bodyStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "14px",
  lineHeight: "1.55",
  color: brand.colors.text,
}

const listStyle: React.CSSProperties = {
  margin: "10px 0 4px",
  paddingLeft: "20px",
}

const listItemStyle: React.CSSProperties = {
  margin: "4px 0",
  fontSize: "13.5px",
  lineHeight: "1.5",
  color: brand.colors.text,
}
