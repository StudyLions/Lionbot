// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: First-touch welcome for users who manage at least one
//          server with LionBot installed. Hero band, server roster
//          chip strip, mock "setup checklist" UI tile, full 5-step
//          deep-link checklist, and the Server Premium pitch.
// ============================================================
import * as React from "react"
import { Img, Section, Text } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Hero } from "./components/Hero"
import { Button } from "./components/Button"
import { Step } from "./components/Checklist"
import { Callout, H2, Paragraph } from "./components/Section"
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
  accent: "primary" | "amber" | "violet"
}

const SETUP_STEPS: SetupStep[] = [
  {
    number: 1,
    title: "Set a welcome message",
    body: "Greet new members with a warm intro and a quick how-to so they know what to do on day one.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/settings`,
    linkLabel: "Configure greetings",
    accent: "primary",
  },
  {
    number: 2,
    title: "Build your rank ladder",
    body: "Hand out roles automatically when members hit voice / message / XP milestones. The single biggest motivator for daily activity.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/ranks`,
    linkLabel: "Open the ranks editor",
    accent: "amber",
  },
  {
    number: 3,
    title: "Stock the shop",
    body: "Members spend study coins on roles, colors, and perks they unlock by focusing in voice channels. Sticky engagement loop.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/shop`,
    linkLabel: "Edit the shop",
    accent: "violet",
  },
  {
    number: 4,
    title: "Add role menus",
    body: "Self-serve role pickers (interests, pronouns, time zones) so members customise their experience without bugging mods.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/rolemenus`,
    linkLabel: "Create a role menu",
    accent: "primary",
  },
  {
    number: 5,
    title: "Drop a Pomodoro room",
    body: "Use /pomodoro on any voice channel. Members hop in, the bot announces focus and break intervals automatically.",
    link: (id) => `${brand.siteUrl}/dashboard/servers/${id}/settings`,
    linkLabel: "Open server settings",
    accent: "amber",
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

  const heroSubtitle = guilds.length === 1 && primaryGuild
    ? `Thanks for inviting LionBot to ${primaryGuild.name}. Here is the 10-minute setup that turns it into a study engine your members actually return to.`
    : guilds.length > 1
      ? `Thanks for inviting LionBot to ${guilds.length} servers. Here is the 10-minute setup that turns it into a study engine your members actually return to.`
      : "Here is the 10-minute setup that turns LionBot into a study engine your members actually return to."

  return (
    <EmailLayout
      previewText={`Welcome to ${brand.name}, ${firstName} — your server setup checklist is inside.`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
      hero={
        <Hero
          eyebrow="Welcome — server admin"
          title={
            <>
              {firstName}, your community<br />
              just leveled up 🦁
            </>
          }
          subtitle={heroSubtitle}
          background="warm"
        >
          {guilds.length > 0 ? <ServerRoster guilds={guilds} /> : null}
          <div style={ctaRow}>
            <Button
              href={
                ctaGuildId
                  ? `${brand.siteUrl}/dashboard/servers/${ctaGuildId}`
                  : `${brand.siteUrl}/dashboard`
              }
              variant="primary"
            >
              {primaryGuild
                ? `Open ${primaryGuild.name}`
                : "Open my dashboard"}
            </Button>
            <span style={ctaSpacer} />
            <Button href={`${brand.siteUrl}/guides`} variant="secondary">
              Read the admin guide
            </Button>
          </div>
        </Hero>
      }
    >
      <SetupPreviewTile primaryName={primaryGuild?.name ?? "Your server"} />

      <H2>Your 10-minute setup checklist</H2>
      <Paragraph muted small>
        Most owners knock out steps 1–3 on day one and pick up the rest over
        the first week. Each step links straight to the right page in your
        dashboard.
      </Paragraph>

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
          accent={step.accent}
        />
      ))}

      <Callout title="Need help?" tone="primary">
        Our community runs a dedicated #server-owners channel in the official{" "}
        <a href={brand.discordInvite} style={inlineLink}>
          LionBot Discord
        </a>
        . Most setup questions get answered there in minutes.
      </Callout>

      <PremiumPromo
        tier={premiumTier === "lionheart_plus_plus" ? premiumTier : "free"}
      />

      <Paragraph muted small>
        Bonus: the <strong>LionHeart++</strong> tier includes a free{" "}
        <strong>Server Premium</strong> slot — sticky messages, anti-AFK,
        branded embeds, and ambient sounds on the server of your choice.
      </Paragraph>
    </EmailLayout>
  )
}

// Horizontal strip of guild icons. Caps at 4 and shows a "+N" pill for the
// rest so the hero stays balanced regardless of how many servers an admin
// runs.
function ServerRoster({ guilds }: { guilds: AdminGuildSummary[] }) {
  const visible = guilds.slice(0, 4)
  const overflow = Math.max(0, guilds.length - visible.length)

  return (
    <div style={rosterWrap}>
      <Text style={rosterEyebrow}>Your servers</Text>
      <table role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            {visible.map((g) => (
              <td key={g.id} style={rosterCell}>
                <table role="presentation" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: "middle" }}>
                        {g.iconUrl ? (
                          <Img
                            src={g.iconUrl}
                            alt={g.name}
                            width="32"
                            height="32"
                            style={rosterIcon}
                          />
                        ) : (
                          <div style={{ ...rosterIcon, ...rosterFallback }}>
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          verticalAlign: "middle",
                          paddingLeft: "10px",
                          paddingRight: "12px",
                        }}
                      >
                        <Text style={rosterName}>{g.name}</Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            ))}
            {overflow > 0 ? (
              <td style={rosterCell}>
                <div style={{ ...rosterIcon, ...rosterFallback }}>
                  +{overflow}
                </div>
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// Mock setup-progress tile. Visually echoes the dashboard "setup wizard"
// list — a concrete preview of what they'll see when they open the link.
function SetupPreviewTile({ primaryName }: { primaryName: string }) {
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
            <td style={tileHeader}>
              <Text style={tileEyebrow}>Setup wizard · {primaryName}</Text>
              <Text style={tileTitle}>You are 1 / 5 done</Text>
              <ProgressBar value={20} />
            </td>
          </tr>
          <tr>
            <td style={tileBody}>
              {[
                {
                  label: "LionBot installed and online",
                  state: "ok",
                },
                { label: "Welcome message", state: "todo" },
                { label: "Rank ladder built", state: "todo" },
                { label: "Shop stocked", state: "todo" },
                { label: "Pomodoro voice room", state: "todo" },
              ].map((row) => (
                <table
                  key={row.label}
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  width="100%"
                  style={tileRowTable}
                >
                  <tbody>
                    <tr>
                      <td style={tileRowDotCell}>
                        <span
                          style={
                            row.state === "ok" ? dotOk : dotTodo
                          }
                        />
                      </td>
                      <td style={tileRowLabelCell}>{row.label}</td>
                      <td style={tileRowStatusCell}>
                        {row.state === "ok" ? "Done" : "Pending"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={progressTrack}>
      <div style={{ ...progressFill, width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  )
}

const rosterWrap: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: "4px",
}

const rosterEyebrow: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "10.5px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.colors.amber,
  fontFamily: brand.fontStack,
}

const rosterCell: React.CSSProperties = {
  paddingRight: "8px",
  paddingBottom: "8px",
}

const rosterIcon: React.CSSProperties = {
  display: "inline-block",
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  border: `1px solid ${brand.colors.border}`,
}

const rosterFallback: React.CSSProperties = {
  backgroundColor: brand.colors.surface,
  color: brand.colors.headline,
  fontWeight: 800,
  fontSize: "13px",
  textAlign: "center",
  lineHeight: "32px",
  fontFamily: brand.fontStack,
}

const rosterName: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  fontWeight: 700,
  color: brand.colors.headline,
  fontFamily: brand.fontStack,
  whiteSpace: "nowrap",
}

const ctaRow: React.CSSProperties = {
  marginTop: "16px",
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

const tileHeader: React.CSSProperties = {
  padding: "18px 20px 14px",
  borderBottom: `1px solid ${brand.colors.border}`,
}

const tileBody: React.CSSProperties = {
  padding: "14px 20px 18px",
}

const tileEyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: "10.5px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.colors.amber,
  fontFamily: brand.fontStack,
}

const tileTitle: React.CSSProperties = {
  margin: "6px 0 10px",
  fontSize: "16.5px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
}

const progressTrack: React.CSSProperties = {
  width: "100%",
  height: "6px",
  borderRadius: "999px",
  backgroundColor: brand.colors.background,
  border: `1px solid ${brand.colors.border}`,
  overflow: "hidden",
}

const progressFill: React.CSSProperties = {
  display: "block",
  height: "100%",
  borderRadius: "999px",
  background: brand.gradients.primary,
}

const tileRowTable: React.CSSProperties = {
  borderCollapse: "separate",
  borderSpacing: 0,
  marginBottom: "4px",
}

const tileRowDotCell: React.CSSProperties = {
  width: "20px",
  verticalAlign: "middle",
  paddingTop: "2px",
  paddingBottom: "2px",
  paddingRight: "8px",
}

const tileRowLabelCell: React.CSSProperties = {
  fontSize: "13.5px",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
  paddingTop: "5px",
  paddingBottom: "5px",
}

const tileRowStatusCell: React.CSSProperties = {
  width: "70px",
  textAlign: "right",
  fontSize: "11.5px",
  fontWeight: 700,
  color: brand.colors.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontFamily: brand.fontStack,
}

const dotOk: React.CSSProperties = {
  display: "inline-block",
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  backgroundColor: brand.colors.success,
  boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
}

const dotTodo: React.CSSProperties = {
  display: "inline-block",
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  backgroundColor: "transparent",
  border: `2px solid ${brand.colors.borderStrong}`,
}

const inlineLink: React.CSSProperties = {
  color: brand.colors.primary,
  fontWeight: 700,
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
