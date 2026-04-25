// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Weekly progress recap. Conversational opener that mentions
//          the personal highlight, one big focus number, a small grid
//          of supporting metrics, an optional top-server line, the
//          premium card, and a personal sign-off.
// ============================================================
import * as React from "react"
import { brand } from "../utils/email/brand"
import { EmailLayout } from "./components/EmailLayout"
import { Button } from "./components/Button"
import { Callout, H1, Paragraph, SignOff } from "./components/Section"
import { BigStat, StatGrid } from "./components/StatCard"
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
      text: `+${fmt.value} ${fmt.unit} versus last week`,
    }
  }
  const diff = current - prev
  const pct = Math.round((diff / prev) * 100)
  if (Math.abs(pct) < 3)
    return { direction: "flat" as const, text: "About the same as last week" }
  return diff >= 0
    ? { direction: "up" as const, text: `+${pct}% versus last week` }
    : { direction: "down" as const, text: `${pct}% versus last week` }
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
    ? `${highlight} — your week in focus.`
    : `${studyFmt.value} ${studyFmt.unit} of focus this week — your ${brand.name} recap.`

  const opener = highlight
    ? highlight
    : studyMinutesThisWeek === 0
      ? "Quiet week — no voice study tracked. Even a 25-minute session this week gets the streak going again."
      : "Here is how your last seven days looked across LionBot."

  return (
    <EmailLayout
      previewText={previewText}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
    >
      <H1>Your week in focus, {firstName}.</H1>
      <Paragraph muted small>
        {weekStartLabel} – {weekEndLabel}
      </Paragraph>
      <Paragraph>{opener}</Paragraph>

      <BigStat
        label="Total focus this week"
        value={studyFmt.value}
        unit={studyFmt.unit}
        delta={studyDelta}
      />

      <StatGrid
        items={[
          {
            label: "Streak",
            value: currentStreak,
            unit: currentStreak === 1 ? "day" : "days",
          },
          {
            label: "Tasks done",
            value: tasksCompleted,
          },
          {
            label: "LionGems earned",
            value: gemsEarned,
          },
          {
            label: "Top server",
            value: topServer ? formatMinutes(topServer.minutes).value : "—",
            unit: topServer
              ? formatMinutes(topServer.minutes).unit
              : undefined,
          },
        ]}
      />

      {topServer ? (
        <Callout>
          You spent the most focus time in <strong>{topServer.name}</strong>{" "}
          this week — {formatMinutes(topServer.minutes).value}{" "}
          {formatMinutes(topServer.minutes).unit} alongside that community.
        </Callout>
      ) : null}

      {streakExtended && currentStreak > 0 ? (
        <Paragraph muted small>
          Your streak is alive at {currentStreak}{" "}
          {currentStreak === 1 ? "day" : "days"} — nicely done.
        </Paragraph>
      ) : null}

      <div style={{ marginTop: "16px", marginBottom: "4px" }}>
        <Button href={`${brand.siteUrl}/dashboard`} variant="secondary">
          See the full breakdown
        </Button>
      </div>

      <PremiumPromo tier={premiumTier} />

      <SignOff />
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
  highlight: "New personal best — over ten hours of focus this week.",
  premiumTier: "free",
}
