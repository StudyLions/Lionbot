// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who manage at least one
//          server with LionBot installed. Personal opener that
//          mentions the server by name, single CTA into that server's
//          dashboard, five quietly numbered setup steps, and a
//          mention of Server Premium at the end.
// ============================================================
import * as React from "react"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Step } from "./components/Checklist"
import { Callout, H1, H2, Paragraph, SignOff } from "./components/Section"
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
    body: "Greet new members with a warm intro and one or two pointers so they know what to do on day one.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/settings`,
    linkLabel: "Configure greetings",
  },
  {
    number: 2,
    title: "Build your rank ladder",
    body: "Hand out roles automatically when members hit voice or message milestones. The single biggest motivator for daily activity.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/ranks`,
    linkLabel: "Open the ranks editor",
  },
  {
    number: 3,
    title: "Stock the shop",
    body: "Members spend study coins on roles, colors, and perks they unlock by focusing in voice. The sticky engagement loop.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/shop`,
    linkLabel: "Edit the shop",
  },
  {
    number: 4,
    title: "Add role menus",
    body: "Self-serve role pickers for interests, pronouns, and timezones so members customise without bothering moderators.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/rolemenus`,
    linkLabel: "Create a role menu",
  },
  {
    number: 5,
    title: "Drop a Pomodoro room",
    body: "Use /pomodoro on any voice channel. Members hop in, the bot announces focus and break intervals automatically.",
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
  const ctaGuildId = primaryGuild?.id

  const opener =
    guilds.length === 1 && primaryGuild
      ? `Thanks for inviting ${brand.name} to ${primaryGuild.name}.`
      : guilds.length > 1
        ? `Thanks for inviting ${brand.name} to ${guilds.length} servers.`
        : `Thanks for adding ${brand.name} to your community.`

  return (
    <EmailLayout
      previewText={`Welcome to ${brand.name}, ${firstName} — a short setup checklist for your server.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      <H1>Welcome aboard, {firstName}.</H1>
      <Paragraph>{opener}</Paragraph>
      <Paragraph>
        The next ten minutes are the difference between a bot that sits idle
        and one that becomes the heartbeat of your community. Here is the
        setup I would do on day one — each step links straight to the right
        page in your dashboard.
      </Paragraph>

      <div style={{ marginTop: "8px", marginBottom: "4px" }}>
        <Button
          href={
            ctaGuildId
              ? `${brand.siteUrl}/dashboard/servers/${ctaGuildId}`
              : `${brand.siteUrl}/dashboard`
          }
        >
          {primaryGuild ? `Open ${primaryGuild.name}` : "Open my dashboard"}
        </Button>
      </div>

      <H2>Your ten-minute setup</H2>

      {SETUP_STEPS.map((step) => (
        <Step
          key={step.number}
          number={step.number}
          title={step.title}
          body={step.body}
          ctaLabel={step.linkLabel}
          ctaHref={
            ctaGuildId ? step.link(ctaGuildId) : `${brand.siteUrl}/dashboard`
          }
        />
      ))}

      <Callout>
        Stuck on something? The official{" "}
        <a href={brand.discordInvite} style={inlineLink}>
          {brand.name} Discord
        </a>{" "}
        has a #server-owners channel — most setup questions get answered
        there in minutes.
      </Callout>

      <PremiumPromo
        tier={premiumTier === "lionheart_plus_plus" ? premiumTier : "free"}
      />

      <Paragraph muted small>
        One thing worth knowing: <strong>LionHeart++</strong> includes a free{" "}
        <strong>Server Premium</strong> slot — sticky messages, anti-AFK,
        branded embeds, and ambient sounds — for the server of your choice.
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

export const WelcomeAdminMockProps: WelcomeAdminProps = {
  firstName: "Sam",
  guilds: [
    { id: "1", name: "Study Lions", iconUrl: null },
    { id: "2", name: "Focus Den", iconUrl: null },
  ],
  premiumTier: "free",
}
