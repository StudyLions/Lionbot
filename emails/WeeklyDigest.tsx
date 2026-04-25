// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Weekly progress recap. Shows minutes studied this week
//          vs last week, current streak, tasks completed, top
//          server and a personalised highlight. Closes with the
//          tier-aware premium promo.
// ============================================================
import * as React from "react"
import { Section } from "@react-email/components"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Callout, H1, H2, Paragraph } from "./components/Section"
import { StatCard, StatRow } from "./components/StatCard"
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
    return {
      direction: "up" as const,
      text: `+${formatMinutes(current).value} ${formatMinutes(current).unit} vs last week`,
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
    >
      <Paragraph muted small>
        Weekly recap · {weekStartLabel} – {weekEndLabel}
      </Paragraph>
      <H1>Your week in focus, {firstName}</H1>

      {highlight ? (
        <Callout title="Highlight of the week" tone="warm">
          {highlight}
        </Callout>
      ) : null}

      <H2>The numbers</H2>

      <StatRow>
        <StatCard
          label="Focus time"
          value={studyFmt.value}
          unit={studyFmt.unit}
          accent="primary"
          delta={studyDelta}
        />
        <StatCard
          label="Current streak"
          value={currentStreak}
          unit={currentStreak === 1 ? "day" : "days"}
          accent="warm"
          delta={
            streakExtended
              ? { direction: "up", text: "Extended this week" }
              : currentStreak > 0
              ? { direction: "flat", text: "Keep it alive!" }
              : { direction: "down", text: "Time to start a new one" }
          }
        />
      </StatRow>

      <StatRow>
        <StatCard
          label="Tasks completed"
          value={tasksCompleted}
          accent="success"
        />
        <StatCard
          label="LionGems earned"
          value={gemsEarned}
          accent="warm"
        />
      </StatRow>

      {topServer ? (
        <Callout title="Top server" tone="neutral">
          You spent the most focus time in <strong>{topServer.name}</strong> this
          week — {formatMinutes(topServer.minutes).value}{" "}
          {formatMinutes(topServer.minutes).unit} of voice study with the
          community there.
        </Callout>
      ) : null}

      <Section style={{ margin: "20px 0 8px", textAlign: "center" }}>
        <Button href={`${brand.siteUrl}/dashboard`} variant="primary">
          See the full breakdown
        </Button>
      </Section>

      <Paragraph muted small>
        Drilldowns for sessions, ranks, achievements, and your LionGotchi are
        all live in the dashboard.
      </Paragraph>

      <PremiumPromo tier={premiumTier} variant="footer" />
    </EmailLayout>
  )
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
