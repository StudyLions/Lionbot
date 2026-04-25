// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who do NOT manage any
//          server with LionBot. Opens with a bold hero band, shows
//          a small mock "you are here" dashboard tile, then three
//          numbered first-day actions, a top.gg perk callout, and
//          the premium card.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Hero } from "./components/Hero"
import { Button } from "./components/Button"
import { Step } from "./components/Checklist"
import { Callout, H2, Paragraph } from "./components/Section"
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
      previewText={`Welcome to ${brand.name}, ${firstName} — your dashboard is ready and your study lion is waiting.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
      hero={
        <Hero
          eyebrow="Welcome to LionBot"
          title={
            <>
              Hey {firstName}, your study<br />
              cub just spawned 🦁
            </>
          }
          subtitle="You are part of a community of 70,000+ Discord servers using LionBot to focus together — track voice study, build streaks, and grow a virtual lion as you go."
          background="primary"
        >
          <div style={ctaRow}>
            <Button href={`${brand.siteUrl}/dashboard`} variant="primary">
              Open my dashboard
            </Button>
            <span style={ctaSpacer} />
            <Button href={`${brand.siteUrl}/guides`} variant="secondary">
              Read the quickstart
            </Button>
          </div>
        </Hero>
      }
    >
      <DashboardPreviewTile firstName={firstName} />

      <H2>Three things worth doing today</H2>

      <Step
        number={1}
        title="Set your timezone and locale"
        body="Your weekly digest, streak counter, and pomodoro reminders all align to your local clock. Takes 10 seconds."
        ctaLabel="Open profile settings"
        ctaHref={`${brand.siteUrl}/dashboard/profile`}
        accent="primary"
      />
      <Step
        number={2}
        title="Join a study voice channel"
        body="Hop into any voice room in a server that has LionBot. The bot tracks focus time automatically — no slash commands needed."
        ctaLabel="Browse the guides"
        ctaHref={`${brand.siteUrl}/guides`}
        accent="amber"
      />
      <Step
        number={3}
        title="Meet your LionGotchi"
        body="Your personal pet grows when you study, eats food you craft on your farm, and earns gold while you focus. Genuinely fun."
        ctaLabel="Visit the pet tutorial"
        ctaHref={`${brand.siteUrl}/pet/tutorial`}
        accent="violet"
      />

      <Callout title="Free perk · 1.25× boost" tone="amber">
        Vote for {brand.name} on top.gg every 12 hours to claim a study coin
        boost — and a stack of LionGems if you are on premium.{" "}
        <a href={brand.topggUrl} style={inlineLink}>
          Vote now →
        </a>
      </Callout>

      <PremiumPromo tier={premiumTier} />

      <Paragraph muted small>
        Replies to this email reach our support team directly. If anything
        feels off or confusing, just hit reply — we read everything.
      </Paragraph>
    </EmailLayout>
  )
}

// Inline mock card that mirrors the dashboard "you're studying" tile.
// Visual continuity with the website hero — gives the email a real screenshot
// feel without needing an actual screenshot asset.
function DashboardPreviewTile({ firstName }: { firstName: string }) {
  return (
    <Section style={tileWrap}>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={tileTable}
      >
        <tbody>
          <tr>
            <td style={tileLeft}>
              <Text style={tileEyebrow}>Your dashboard</Text>
              <Text style={tileTitle}>Hi {firstName}, here is what awaits</Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ marginTop: "8px" }}
              >
                <tbody>
                  <tr>
                    <td style={dotCellOk}><span style={dotOk} /></td>
                    <td style={tileBullet}>Voice tracking active in your servers</td>
                  </tr>
                  <tr>
                    <td style={dotCellOk}><span style={dotOk} /></td>
                    <td style={tileBullet}>Streak counter starts on your first session</td>
                  </tr>
                  <tr>
                    <td style={dotCellAmber}><span style={dotAmber} /></td>
                    <td style={tileBullet}>LionGotchi pet waiting to be claimed</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={tileRight}>
              <div style={chip}>
                <span style={chipPulse} /> Live
              </div>
              <Text style={chipBig}>10,470</Text>
              <Text style={chipLabel}>studying right now</Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  )
}

const ctaRow: React.CSSProperties = {
  marginTop: "20px",
}

const ctaSpacer: React.CSSProperties = {
  display: "inline-block",
  width: "10px",
}

const tileWrap: React.CSSProperties = {
  marginTop: "4px",
  marginBottom: "12px",
}

const tileTable: React.CSSProperties = {
  borderCollapse: "separate",
  borderSpacing: 0,
  background: brand.colors.surface,
  border: `1px solid ${brand.colors.border}`,
  borderRadius: "16px",
  width: "100%",
}

const tileLeft: React.CSSProperties = {
  verticalAlign: "top",
  padding: "20px 18px 18px 20px",
  width: "62%",
}

const tileRight: React.CSSProperties = {
  verticalAlign: "middle",
  padding: "20px 22px 18px 14px",
  width: "38%",
  textAlign: "right",
  borderLeft: `1px solid ${brand.colors.border}`,
}

const tileEyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: "10.5px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.colors.primary,
  fontFamily: brand.fontStack,
}

const tileTitle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "16.5px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
}

const dotCellOk: React.CSSProperties = {
  width: "20px",
  verticalAlign: "top",
  paddingTop: "8px",
  paddingRight: "8px",
}

const dotCellAmber: React.CSSProperties = {
  width: "20px",
  verticalAlign: "top",
  paddingTop: "8px",
  paddingRight: "8px",
}

const dotOk: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  backgroundColor: brand.colors.success,
  boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
}

const dotAmber: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  backgroundColor: brand.colors.amber,
  boxShadow: "0 0 0 3px rgba(245,158,11,0.18)",
}

const tileBullet: React.CSSProperties = {
  fontSize: "13.5px",
  lineHeight: "1.55",
  color: brand.colors.text,
  paddingBottom: "4px",
  fontFamily: brand.fontStack,
}

const chip: React.CSSProperties = {
  display: "inline-block",
  fontSize: "10.5px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.colors.success,
  marginBottom: "10px",
  fontFamily: brand.fontStack,
}

const chipPulse: React.CSSProperties = {
  display: "inline-block",
  width: "7px",
  height: "7px",
  borderRadius: "999px",
  backgroundColor: brand.colors.success,
  marginRight: "6px",
  verticalAlign: "1px",
  boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
}

const chipBig: React.CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
  color: brand.colors.headline,
  lineHeight: "1.05",
  fontFamily: brand.fontStack,
  letterSpacing: "-0.025em",
}

const chipLabel: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}

const inlineLink: React.CSSProperties = {
  color: brand.colors.amber,
  fontWeight: 700,
  textDecoration: "none",
}

export const WelcomeMemberMockProps: WelcomeMemberProps = {
  firstName: "Alex",
  premiumTier: "free",
}
