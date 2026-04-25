// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who manage at least one
//          server with LionBot installed. Personalised header,
//          a 5-step setup checklist with deep links into each
//          server's settings, and the Server Premium teaser.
// ============================================================
import * as React from "react"
import { Section, Img } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Callout, H1, H2, Paragraph } from "./components/Section"
import { PremiumPromo, PromoTier } from "./components/PremiumPromo"

export interface AdminGuildSummary {
  id: string
  name: string
  iconUrl?: string | null
}

export interface WelcomeAdminProps {
  firstName: string
  guilds: AdminGuildSummary[]
  premiumTier?: PromoTier
  unsubscribeUrl?: string
  preferencesUrl?: string
}

interface SetupStep {
  number: number
  title: string
  body: string
  link: (guildId: string) => string
  linkLabel: string
}

const SETUP_STEPS: SetupStep[] = [
  {
    number: 1,
    title: "Set a welcome message",
    body: "Greet new members with a warm intro and a quick how-to so they know what to do on day one.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/settings`,
    linkLabel: "Configure greetings",
  },
  {
    number: 2,
    title: "Build your rank ladder",
    body: "Hand out roles automatically when members hit voice / message / XP milestones. Big motivator for daily activity.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/ranks`,
    linkLabel: "Open the ranks editor",
  },
  {
    number: 3,
    title: "Stock the shop",
    body: "Members spend study coins on roles, colours, and perks they unlock by focusing in voice channels.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/shop`,
    linkLabel: "Edit the shop",
  },
  {
    number: 4,
    title: "Set up role menus",
    body: "Self-serve role pickers (interests, pronouns, time zones) so members customize their experience without bugging you.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/rolemenus`,
    linkLabel: "Create a role menu",
  },
  {
    number: 5,
    title: "Add a Pomodoro timer",
    body: "Drop a /pomodoro on any voice channel. Members hop in, the bot announces focus and break intervals automatically.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/settings`,
    linkLabel: "Open server settings",
  },
]

export default function WelcomeAdmin({
  firstName,
  guilds,
  premiumTier = "free",
  unsubscribeUrl,
  preferencesUrl,
}: WelcomeAdminProps) {
  const primaryGuild = guilds[0]
  const moreCount = Math.max(0, guilds.length - 3)
  const ctaGuildId = primaryGuild?.id

  return (
    <EmailLayout
      previewText={`Welcome to ${brand.name}, ${firstName}. Here is the 5-step setup that turns LionBot into a study engine.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      <H1>Welcome aboard, {firstName} 🦁</H1>
      <Paragraph>
        Thank you for inviting {brand.name} to{" "}
        <strong>
          {guilds.length === 1
            ? primaryGuild?.name
            : `${guilds.length} servers`}
        </strong>
        . Communities like yours are why we build this — let&apos;s make sure
        your members get the most out of it from day one.
      </Paragraph>

      {guilds.length > 0 ? (
        <Section style={{ marginTop: "8px", marginBottom: "16px" }}>
          <table role="presentation" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                {guilds.slice(0, 3).map((g) => (
                  <td key={g.id} style={{ paddingRight: "10px" }}>
                    {g.iconUrl ? (
                      <Img
                        src={g.iconUrl}
                        alt={g.name}
                        width="40"
                        height="40"
                        style={guildIcon}
                      />
                    ) : (
                      <div style={{ ...guildIcon, ...guildIconFallback }}>
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                ))}
                {moreCount > 0 ? (
                  <td>
                    <div style={{ ...guildIcon, ...guildIconFallback }}>+{moreCount}</div>
                  </td>
                ) : null}
              </tr>
            </tbody>
          </table>
        </Section>
      ) : null}

      {ctaGuildId ? (
        <Section style={ctaSection}>
          <Button
            href={`${brand.siteUrl}/dashboard/servers/${ctaGuildId}`}
            variant="primary"
          >
            Open {primaryGuild?.name ?? "your server"}
          </Button>
        </Section>
      ) : (
        <Section style={ctaSection}>
          <Button href={`${brand.siteUrl}/dashboard`} variant="primary">
            Open your dashboard
          </Button>
        </Section>
      )}

      <H2>Your 5-step setup checklist</H2>
      <Paragraph muted small>
        These take about 10 minutes total. Most server owners do steps 1–3 on
        day one, then pick up the rest over the first week.
      </Paragraph>

      {SETUP_STEPS.map((step) => (
        <Step
          key={step.number}
          number={step.number}
          title={step.title}
          body={step.body}
          ctaLabel={step.linkLabel}
          ctaHref={ctaGuildId ? step.link(ctaGuildId) : `${brand.siteUrl}/dashboard`}
        />
      ))}

      <Callout title="Want help?" tone="warm">
        Our community runs a dedicated #server-owners channel in the official{" "}
        <a href={brand.discordInvite} style={{ color: brand.colors.headingAccent, fontWeight: 600 }}>
          LionBot Discord
        </a>
        . Most setup questions are answered there in minutes.
      </Callout>

      <PremiumPromo
        tier={premiumTier === "lionheart_plus_plus" ? premiumTier : "free"}
      />

      <Paragraph muted small>
        Bonus: if you own multiple servers, the{" "}
        <strong>LionHeart++ tier</strong> includes a free Server Premium slot —
        unlocking sticky messages, anti-AFK, branded embeds, and ambient
        sounds on the server of your choice.
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

const guildIcon: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  border: `1px solid ${brand.colors.border}`,
  display: "block",
}

const guildIconFallback: React.CSSProperties = {
  backgroundColor: brand.colors.surfaceMuted,
  color: brand.colors.headingAccent,
  fontWeight: 700,
  fontSize: "16px",
  textAlign: "center",
  lineHeight: "40px",
}

const ctaSection: React.CSSProperties = {
  margin: "8px 0 12px",
  textAlign: "center",
}

const stepTable: React.CSSProperties = {
  margin: "10px 0",
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
  backgroundColor: brand.colors.headingAccent,
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

export const WelcomeAdminMockProps: WelcomeAdminProps = {
  firstName: "Sam",
  guilds: [
    { id: "1", name: "Study Lions", iconUrl: null },
    { id: "2", name: "Focus Den", iconUrl: null },
  ],
  premiumTier: "free",
}
