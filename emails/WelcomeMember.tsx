// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who do NOT manage any
//          server with LionBot. Focuses on the personal study
//          loop: dashboard, study tracking, LionGotchi pet,
//          and the first big premium teaser.
// ============================================================
import * as React from "react"
import { Section } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Callout, H1, H2, Paragraph } from "./components/Section"
import { PremiumPromo, PromoTier } from "./components/PremiumPromo"

export interface WelcomeMemberProps {
  firstName: string
  premiumTier?: PromoTier
  unsubscribeUrl?: string
  preferencesUrl?: string
}

export default function WelcomeMember({
  firstName,
  premiumTier = "free",
  unsubscribeUrl,
  preferencesUrl,
}: WelcomeMemberProps) {
  return (
    <EmailLayout
      previewText={`Welcome to ${brand.name}, ${firstName}. Here is the 2-minute setup that gets you started.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      <H1>Welcome aboard, {firstName} 🦁</H1>
      <Paragraph>
        You just joined a community of <strong>70,000+ Discord servers</strong> that
        use {brand.name} to study together — track focus time, build streaks,
        race up ranks, and (yes) raise a virtual lion cub along the way.
      </Paragraph>
      <Paragraph>
        Here is the shortest path to feeling at home in the dashboard. Pick
        whichever step grabs you.
      </Paragraph>

      <Section style={ctaSection}>
        <Button href={`${brand.siteUrl}/dashboard`} variant="primary">
          Open your dashboard
        </Button>
      </Section>

      <H2>3 things to try in your first session</H2>

      <Step
        number={1}
        title="Set your timezone and locale"
        body="Your weekly digest, streak counter, and pomodoro reminders all align to your local clock. Takes 10 seconds."
        ctaLabel="Open profile settings"
        ctaHref={`${brand.siteUrl}/dashboard/profile`}
      />

      <Step
        number={2}
        title="Join a study room"
        body="Hop into any voice channel in a server that has LionBot. The bot tracks your focus time automatically — no slash command needed."
        ctaLabel="Browse the guides"
        ctaHref={`${brand.siteUrl}/guides`}
      />

      <Step
        number={3}
        title="Meet your LionGotchi"
        body="Your personal pet grows when you study, eats food you craft on your farm, and earns gold while you focus. Genuinely fun."
        ctaLabel="Visit the pet tutorial"
        ctaHref={`${brand.siteUrl}/pet/tutorial`}
      />

      <Callout title="Pro tip" tone="warm">
        Vote for {brand.name} on top.gg every 12 hours to claim a 1.25× study
        coin boost — and a stack of LionGems if you are on premium.{" "}
        <a href={brand.topggUrl} style={{ color: brand.colors.headingAccent, fontWeight: 600 }}>
          Vote now →
        </a>
      </Callout>

      <PremiumPromo tier={premiumTier} />

      <Paragraph muted small>
        Replies to this email reach our support team. If anything is broken or
        confusing, hit reply — we read everything.
      </Paragraph>
    </EmailLayout>
  )
}

function Step({
  number,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  number: number
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={stepTable}
    >
      <tbody>
        <tr>
          <td style={stepNumberCell}>
            <span style={stepNumberStyle}>{number}</span>
          </td>
          <td style={stepBodyCell}>
            <div style={stepTitle}>{title}</div>
            <div style={stepBody}>{body}</div>
            <a href={ctaHref} style={stepLink}>
              {ctaLabel} →
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const ctaSection: React.CSSProperties = {
  margin: "8px 0 12px",
  textAlign: "center",
}

const stepTable: React.CSSProperties = {
  margin: "12px 0",
  borderCollapse: "separate",
  borderSpacing: 0,
}

const stepNumberCell: React.CSSProperties = {
  width: "44px",
  verticalAlign: "top",
  paddingRight: "12px",
}

const stepNumberStyle: React.CSSProperties = {
  display: "inline-block",
  width: "32px",
  height: "32px",
  lineHeight: "32px",
  textAlign: "center",
  borderRadius: "999px",
  backgroundColor: brand.colors.primary,
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: 700,
}

const stepBodyCell: React.CSSProperties = {
  verticalAlign: "top",
  paddingBottom: "4px",
}

const stepTitle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: brand.colors.headline,
  marginBottom: "2px",
}

const stepBody: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.55",
  color: brand.colors.text,
  marginBottom: "4px",
}

const stepLink: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: brand.colors.primary,
  textDecoration: "none",
}

export const WelcomeMemberMockProps: WelcomeMemberProps = {
  firstName: "Alex",
  premiumTier: "free",
}
