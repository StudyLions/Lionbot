// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Weekly progress recap. Hero band with the headline focus
//          number, then a row of supporting metrics, the top-server
//          highlight, and the tier-aware premium card.
// ============================================================
import * as React from "react"
import { Section, Text } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Hero } from "./components/Hero"
import { Button } from "./components/Button"
import { Callout, H2, Paragraph } from "./components/Section"
import { HeroStat, StatCard, StatRow } from "./components/StatCard"
import { PremiumPromo, PromoTier } from "./components/PremiumPromo"

export interface WeeklyDigestProps {
  firstName: string
  weekStartLabel: string
  weekEndLabel: string
  studyMinutesThisWeek: number
  studyMinutesLastWeek: number
  tasksCompleted: number
  currentStreak: number
  streakExtended: boolean
  topServer: { name: string; minutes: number } | null
  gemsEarned: number
  highlight: string | null
  premiumTier: PromoTier
  unsubscribeUrl?: string
  preferencesUrl?: string
}

function formatMinutes(min: number): { value: string; unit: string } {
  if (min < 60) return { value: String(Math.round(min)), unit: "min" }
  const hours = min / 60
  if (hours < 10)
    return { value: hours.toFixed(1).replace(/\.0$/, ""), unit: "hours" }
  return { value: String(Math.round(hours)), unit: "hours" }
}

function deltaText(current: number, prev: number) {
  if (prev === 0 && current === 0) {
    return { direction: "flat" as const, text: "Same as last week" }
  }
  if (prev === 0) {
    const fmt = formatMinutes(current)
    return {
      direction: "up" as const,
      text: `+${fmt.value} ${fmt.unit} vs last week`,
    }
  }
  const diff = current - prev
  const pct = Math.round((diff / prev) * 100)
  if (Math.abs(pct) < 3) return { direction: "flat" as const, text: "About the same" }
  return diff >= 0
    ? { direction: "up" as const, text: `+${pct}% vs last week` }
    : { direction: "down" as const, text: `${pct}% vs last week` }
}

export default function WeeklyDigest({
  firstName,
  weekStartLabel,
  weekEndLabel,
  studyMinutesThisWeek,
  studyMinutesLastWeek,
  tasksCompleted,
  currentStreak,
  streakExtended,
  topServer,
  gemsEarned,
  highlight,
  premiumTier,
  unsubscribeUrl,
  preferencesUrl,
}: WeeklyDigestProps) {
  const studyFmt = formatMinutes(studyMinutesThisWeek)
  const studyDelta = deltaText(studyMinutesThisWeek, studyMinutesLastWeek)
  const previewText = highlight
    ? `${highlight} — your ${brand.name} weekly recap is ready.`
    : `${studyFmt.value} ${studyFmt.unit} of focus this week. Here is your ${brand.name} recap.`

  return (
    <EmailLayout
      previewText={previewText}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
      hero={
        <Hero
          eyebrow={`Weekly recap · ${weekStartLabel} – ${weekEndLabel}`}
          title={
            <>
              Your week in focus,<br />
              {firstName}
            </>
          }
          subtitle={
            highlight ||
            "Here is what your last seven days looked like across LionBot — voice study, streak, and the rest."
          }
          background="digest"
        >
          <div style={{ marginTop: "20px" }}>
            <Button href={`${brand.siteUrl}/dashboard`} variant="primary">
              See the full breakdown
            </Button>
          </div>
        </Hero>
      }
    >
      <HeroStat
        label="Total focus this week"
        value={studyFmt.value}
        unit={studyFmt.unit}
        delta={studyDelta}
        accent="primary"
        caption={
          studyMinutesThisWeek === 0
            ? "No voice study tracked this week — even 25 minutes gets the streak going again."
            : "Counts every voice channel session in any LionBot server you joined."
        }
      />

      <H2>The supporting cast</H2>

      <StatRow>
        <StatCard
          label="Current streak"
          value={currentStreak}
          unit={currentStreak === 1 ? "day" : "days"}
          accent="amber"
          delta={
            streakExtended
              ? { direction: "up", text: "Extended this week" }
              : currentStreak > 0
              ? { direction: "flat", text: "Keep it alive" }
              : { direction: "down", text: "Start a new one" }
          }
        />
        <StatCard
          label="Tasks completed"
          value={tasksCompleted}
          accent="success"
        />
      </StatRow>

      <StatRow>
        <StatCard
          label="LionGems earned"
          value={gemsEarned}
          accent="violet"
        />
        <StatCard
          label="Top server time"
          value={
            topServer ? formatMinutes(topServer.minutes).value : "—"
          }
          unit={topServer ? formatMinutes(topServer.minutes).unit : undefined}
          accent="pink"
        />
      </StatRow>

      {topServer ? (
        <Callout title="Most focused with" tone="primary">
          You spent the most voice study time in{" "}
          <strong>{topServer.name}</strong> this week —{" "}
          {formatMinutes(topServer.minutes).value}{" "}
          {formatMinutes(topServer.minutes).unit} alongside that community.
        </Callout>
      ) : null}

      <Section style={{ margin: "20px 0 8px" }}>
        <Paragraph muted small>
          Drilldowns for sessions, ranks, achievements and your LionGotchi are
          all live in the{" "}
          <a
            href={`${brand.siteUrl}/dashboard`}
            style={inlineLink}
          >
            dashboard
          </a>
          .
        </Paragraph>
      </Section>

      <PremiumPromo tier={premiumTier} variant="footer" />
    </EmailLayout>
  )
}

const inlineLink: React.CSSProperties = {
  color: brand.colors.primary,
  fontWeight: 700,
  textDecoration: "none",
}

export const WeeklyDigestMockProps: WeeklyDigestProps = {
  firstName: "Alex",
  weekStartLabel: "Apr 19",
  weekEndLabel: "Apr 25",
  studyMinutesThisWeek: 612,
  studyMinutesLastWeek: 480,
  tasksCompleted: 27,
  currentStreak: 11,
  streakExtended: true,
  topServer: { name: "Study Lions", minutes: 410 },
  gemsEarned: 85,
  highlight: "New personal best — over 10 hours of focus this week!",
  premiumTier: "free",
}
