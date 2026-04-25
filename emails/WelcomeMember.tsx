// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who don't manage any
//          server with LionBot. Conversational opener, single CTA,
//          three quietly numbered next-steps, a tip line about voting,
//          one premium card, and a personal sign-off.
// ============================================================
import * as React from "react"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Step } from "./components/Checklist"
import { H1, H2, Paragraph, SignOff } from "./components/Section"
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
      previewText={`Welcome to ${brand.name}, ${firstName}. A few notes to get you settled in.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      <H1>Welcome aboard, {firstName}.</H1>
      <Paragraph>
        Thanks for signing in. I built {brand.name} so studying with friends on
        Discord could feel like turning up to the same library every day —
        quietly motivating, gently competitive, and worth coming back to.
      </Paragraph>
      <Paragraph>
        Your dashboard is ready, your study lion is waiting, and the bot is
        already tracking voice study in any server you share with it.
      </Paragraph>

      <div style={{ marginTop: "8px", marginBottom: "4px" }}>
        <Button href={`${brand.siteUrl}/dashboard`}>Open my dashboard</Button>
      </div>

      <H2>A few things worth doing today</H2>

      <Step
        number={1}
        title="Set your timezone"
        body="The weekly recap, streak counter, and pomodoro reminders all use your local clock. Takes about ten seconds."
        ctaLabel="Open profile settings"
        ctaHref={`${brand.siteUrl}/dashboard/profile`}
      />
      <Step
        number={2}
        title="Sit in a study voice channel"
        body="Hop into any voice room in a server that has LionBot. Tracking is automatic — no slash commands, no setup."
        ctaLabel="Read the quickstart"
        ctaHref={`${brand.siteUrl}/guides`}
      />
      <Step
        number={3}
        title="Meet your LionGotchi"
        body="A small virtual lion that grows when you study, eats food you grow on your farm, and earns gold while you focus."
        ctaLabel="Visit the pet tutorial"
        ctaHref={`${brand.siteUrl}/pet/tutorial`}
      />

      <Paragraph muted small>
        One more thing — voting for {brand.name} on{" "}
        <a href={brand.topggUrl} style={inlineLink}>top.gg</a>{" "}
        every twelve hours unlocks a 1.25× study coin boost (and a stack of
        gems if you upgrade to LionHeart).
      </Paragraph>

      <PremiumPromo tier={premiumTier} />

      <Paragraph muted small>
        Replies to this email reach me directly. If anything feels off or
        confusing, hit reply — I read everything.
      </Paragraph>

      <SignOff />
    </EmailLayout>
  )
}

const inlineLink: React.CSSProperties = {
  color: brand.colors.primary,
  fontWeight: 600,
  textDecoration: "none",
  borderBottom: `1px solid ${brand.colors.primary}`,
}

export const WelcomeMemberMockProps: WelcomeMemberProps = {
  firstName: "Alex",
  premiumTier: "free",
}
