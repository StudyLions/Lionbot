// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-15
// Purpose: Sent to a recipient when (a) someone gifts them a
//          LionHeart subscription and they claim it, or (b) someone
//          gifts their server premium and the gift auto-activates.
//
//          Matches PremiumPromo's restrained chrome: thin gold top
//          accent, title, 2-3 line body, single CTA. One link only.
//          Subject line has no emoji (avoids spam triage).
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/EmailLayout"
import { brand } from "../utils/email/brand"

export type GiftKind = "lionheart_user" | "server_premium"

interface GiftReceivedProps {
  // What was gifted
  kind: GiftKind
  tierLabel: string                 // e.g. "LionHeart+", "Server Premium"
  perkLine: string                  // one-line value summary
  // Who sent it
  senderDisplayName: string | null  // null when anonymous
  isAnonymous: boolean
  giftMessage: string | null
  // CTA target
  ctaHref: string                   // typically /dashboard or /dashboard/servers/<id>
  ctaLabel: string
}

export const GiftReceivedMockProps: GiftReceivedProps = {
  kind: "lionheart_user",
  tierLabel: "LionHeart+",
  perkLine: "1,200 LionGems per month, plus bigger farm and pet boosts.",
  senderDisplayName: "Alex",
  isAnonymous: false,
  giftMessage: "Thanks for keeping our co-working server alive. -A",
  ctaHref: `${brand.siteUrl}/dashboard`,
  ctaLabel: "Open dashboard",
}

export function GiftReceived(props: GiftReceivedProps) {
  const {
    kind,
    tierLabel,
    perkLine,
    senderDisplayName,
    isAnonymous,
    giftMessage,
    ctaHref,
    ctaLabel,
  } = props

  const headline =
    kind === "server_premium"
      ? "Your server received premium"
      : isAnonymous
        ? "Someone gifted you premium"
        : `${senderDisplayName ?? "A friend"} gifted you premium`

  const senderLine = isAnonymous
    ? "Sent anonymously."
    : senderDisplayName
      ? `From ${senderDisplayName}.`
      : null

  return (
    <EmailLayout previewText={`${tierLabel} is yours.`}>
      <Section style={wrap}>
        <div style={cardStyle}>
          <Text style={titleStyle}>{headline}</Text>
          <Text style={tierStyle}>{tierLabel}</Text>
          <Text style={bodyStyle}>{perkLine}</Text>

          {giftMessage ? (
            <div style={quoteWrap}>
              <Text style={quoteStyle}>{giftMessage}</Text>
            </div>
          ) : null}

          {senderLine ? <Text style={metaStyle}>{senderLine}</Text> : null}

          <a href={ctaHref} style={ctaStyle}>
            {ctaLabel}
          </a>
        </div>
      </Section>
    </EmailLayout>
  )
}

export default GiftReceived

const wrap: React.CSSProperties = {
  margin: 0,
}

const cardStyle: React.CSSProperties = {
  padding: "4px 0 0",
  borderTop: `2px solid ${brand.colors.premiumGold}`,
  fontFamily: brand.fontStack,
}

const titleStyle: React.CSSProperties = {
  margin: "16px 0 4px",
  fontSize: "18px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.005em",
  fontFamily: brand.fontStack,
}

const tierStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "14px",
  fontWeight: 600,
  color: brand.colors.premiumGold,
  letterSpacing: "0.005em",
  fontFamily: brand.fontStack,
}

const bodyStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

const quoteWrap: React.CSSProperties = {
  borderLeft: `2px solid ${brand.colors.premiumGold}`,
  paddingLeft: "12px",
  margin: "0 0 16px",
}

const quoteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "1.6",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}

const metaStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "13px",
  color: brand.colors.textMuted,
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
