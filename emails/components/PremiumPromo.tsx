// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Tier-aware premium promotion block. Renders a dark gradient
//          card with the same pink-violet-amber palette as the homepage
//          /donate banner so the email feels like a continuation of
//          the product, not a separate marketing template.
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
  variant?: "footer" | "block"
}

interface PromoContent {
  badge: string
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  perks: string[]
}

const PROMO_CONTENT: Record<PromoTier, PromoContent> = {
  free: {
    badge: "LionHeart Premium",
    title: "Unlock the next level of LionBot",
    body:
      "LionHeart members get monthly LionGems, faster pet growth, focus-timer themes and a stack of economy boosts. Pricing starts at €4.99/month.",
    ctaLabel: "See LionHeart plans",
    ctaHref: `${brand.siteUrl}/donate`,
    perks: [
      "500–3,000 LionGems every month",
      "Up to 2× study coin boost across every server",
      "Farm boosts and bonus drop rates",
      "Custom focus-timer themes",
    ],
  },
  lionheart: {
    badge: "Upgrade to LionHeart+",
    title: "Already loving LionHeart? LionHeart+ is the upgrade",
    body:
      "More than 2× the monthly gems, bigger farm boosts and longer water duration for your LionGotchi. €9.99/month.",
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
    badge: "Top tier — LionHeart++",
    title: "Go all-in with LionHeart++",
    body:
      "The top tier includes a free Server Premium slot for one of your servers, 3,000 monthly gems and the maximum farm and gold boosts.",
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
    badge: "You are at the top tier",
    title: "Thank you for going all-in",
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
    <Section style={wrapperOuter}>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={gradientCardTable}
      >
        <tbody>
          <tr>
            <td style={gradientCardCell}>
              <Text style={badgeStyle}>{content.badge}</Text>
              <Text style={titleStyle}>{content.title}</Text>
              <Text style={bodyStyle}>{content.body}</Text>

              {!isFooter ? (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={perksTable}
                >
                  <tbody>
                    {content.perks.map((perk) => (
                      <tr key={perk}>
                        <td style={perkBulletCell}>
                          <span style={perkBullet}>★</span>
                        </td>
                        <td style={perkTextCell}>{perk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ marginTop: "16px" }}
              >
                <tbody>
                  <tr>
                    <td>
                      <a href={content.ctaHref} style={ctaButtonStyle}>
                        {content.ctaLabel} →
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  )
}

export default PremiumPromo

const wrapperOuter: React.CSSProperties = {
  margin: "26px 0 8px",
}

// Outer table acts as the gradient frame. Inner cell holds the dark
// inset so the gradient feels like a glowing border, not a flat block.
const gradientCardTable: React.CSSProperties = {
  borderCollapse: "separate",
  borderSpacing: 0,
  borderRadius: "20px",
  backgroundImage: brand.gradients.premium,
  backgroundColor: brand.colors.violet,
  padding: "1.5px",
  width: "100%",
}

const gradientCardCell: React.CSSProperties = {
  borderRadius: "19px",
  padding: "22px 24px 20px",
  background:
    "linear-gradient(180deg, #0F0A1F 0%, #0B0F1A 100%)",
  fontFamily: brand.fontStack,
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  margin: "0 0 10px",
  padding: "5px 11px",
  borderRadius: "999px",
  fontSize: "10.5px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  backgroundImage: brand.gradients.premium,
  backgroundColor: brand.colors.pink,
  fontFamily: brand.fontStack,
}

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "20px",
  fontWeight: 800,
  color: brand.colors.headline,
  lineHeight: "1.25",
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
}

const bodyStyle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "14.5px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

const perksTable: React.CSSProperties = {
  margin: "14px 0 4px",
  borderCollapse: "separate",
  borderSpacing: 0,
}

const perkBulletCell: React.CSSProperties = {
  width: "20px",
  verticalAlign: "top",
  paddingTop: "5px",
  paddingRight: "8px",
}

const perkBullet: React.CSSProperties = {
  display: "inline-block",
  width: "16px",
  height: "16px",
  lineHeight: "16px",
  textAlign: "center",
  fontSize: "11px",
  color: "#FFFFFF",
  borderRadius: "999px",
  backgroundImage: brand.gradients.premium,
  backgroundColor: brand.colors.pink,
}

const perkTextCell: React.CSSProperties = {
  fontSize: "13.5px",
  lineHeight: "1.55",
  color: brand.colors.text,
  paddingBottom: "6px",
  fontFamily: brand.fontStack,
}

const ctaButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 22px",
  borderRadius: "12px",
  fontSize: "14.5px",
  fontWeight: 700,
  textDecoration: "none",
  color: "#FFFFFF",
  backgroundImage: brand.gradients.premium,
  backgroundColor: brand.colors.pink,
  border: "1px solid rgba(255,255,255,0.18)",
  fontFamily: brand.fontStack,
}
