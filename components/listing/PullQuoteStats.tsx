// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Pull-quote stats row for the editorial profile.
//          Replaces the sidebar "Verified by Leo" card with a
//          three-column hairline-separated row of huge serif
//          numbers and tiny sans labels -- the pattern you see
//          in feature articles ("3,247 / Members tracked").
//
//          Numbers come from /api/servers/[slug]/stats so the
//          SSG payload stays cacheable. The component renders a
//          skeleton while loading and silently hides itself if
//          the API errors -- we'd rather show no stats than show
//          "..." or "0" placeholders that look broken.
// ============================================================
import React, { useEffect, useState } from "react"

import { ListingTheme } from "@/constants/ServerListingData"

interface PullQuoteStatsProps {
  theme: ListingTheme
  accent: string
  slug: string
  /** When false, suppresses the live in-voice column (not the others). */
  showLive: boolean
}

interface StatsResponse {
  tracked_members: number
  studied_minutes_30d: number
  active_voice_sessions: number
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = minutes / 60
  if (hours < 1000) return Math.round(hours).toLocaleString()
  return `${(hours / 1000).toFixed(1)}k`
}

function formatHoursLabel(minutes: number): string {
  return minutes < 60 ? "Minutes studied (30d)" : "Hours studied (30d)"
}

export function PullQuoteStats({
  theme,
  accent,
  slug,
  showLive,
}: PullQuoteStatsProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchStats = () =>
      fetch(`/api/servers/${encodeURIComponent(slug)}/stats`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data) => {
          if (!cancelled) setStats(data)
        })
        .catch(() => {
          if (!cancelled) setErrored(true)
        })
    void fetchStats()

    let timer: number | undefined
    if (showLive) {
      // Refresh once a minute, but only when the tab is visible to
      // avoid hammering the API for backgrounded tabs.
      timer = window.setInterval(() => {
        if (document.hidden) return
        void fetchStats()
      }, 60_000)
    }
    return () => {
      cancelled = true
      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [slug, showLive])

  if (errored) return null

  // Skeleton placeholders before fetch resolves -- we show the labels
  // immediately so the row reserves vertical space and doesn't cause
  // layout shift when numbers come in.
  const trackedMembers = stats?.tracked_members ?? null
  const studiedMinutes = stats?.studied_minutes_30d ?? null
  const liveCount = stats?.active_voice_sessions ?? null

  const isHairline = theme.ruleStyle !== "thick"
  const dividerStyle: React.CSSProperties = isHairline
    ? { borderLeft: `1px solid ${theme.ruleColor}` }
    : { borderLeft: `2px solid ${accent}` }

  return (
    <section
      style={{
        maxWidth: "min(1100px, 92vw)",
        margin: "0 auto",
        padding: "clamp(36px, 6vh, 64px) clamp(20px, 5vw, 40px)",
        borderTop: theme.ruleStyle === "double"
          ? `3px double ${theme.ruleColor}`
          : `1px solid ${theme.ruleColor}`,
        borderBottom: theme.ruleStyle === "double"
          ? `3px double ${theme.ruleColor}`
          : `1px solid ${theme.ruleColor}`,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
        <StatCell
          theme={theme}
          accent={accent}
          number={trackedMembers !== null ? trackedMembers.toLocaleString() : "—"}
          label="Members tracked"
        />
        <div style={{ ...dividerStyle, paddingLeft: "clamp(16px, 4vw, 40px)" }} className="hidden sm:block">
          <StatCell
            theme={theme}
            accent={accent}
            number={studiedMinutes !== null ? formatHours(studiedMinutes) : "—"}
            label={studiedMinutes !== null ? formatHoursLabel(studiedMinutes) : "Hours studied (30d)"}
            inline
          />
        </div>
        <div className="sm:hidden">
          <StatCell
            theme={theme}
            accent={accent}
            number={studiedMinutes !== null ? formatHours(studiedMinutes) : "—"}
            label={studiedMinutes !== null ? formatHoursLabel(studiedMinutes) : "Hours studied (30d)"}
          />
        </div>

        {showLive && (
          <>
            <div style={{ ...dividerStyle, paddingLeft: "clamp(16px, 4vw, 40px)" }} className="hidden sm:block">
              <StatCell
                theme={theme}
                accent={accent}
                number={liveCount !== null ? liveCount.toLocaleString() : "—"}
                label="In voice right now"
                live
                isLiveActive={!!liveCount && liveCount > 0}
                inline
              />
            </div>
            <div className="sm:hidden">
              <StatCell
                theme={theme}
                accent={accent}
                number={liveCount !== null ? liveCount.toLocaleString() : "—"}
                label="In voice right now"
                live
                isLiveActive={!!liveCount && liveCount > 0}
              />
            </div>
          </>
        )}
        {!showLive && (
          // Keep three columns on desktop even when live is suppressed
          // so the hairlines stay symmetrical.
          <div style={{ ...dividerStyle, paddingLeft: "clamp(16px, 4vw, 40px)" }} className="hidden sm:block">
            <StatCell
              theme={theme}
              accent={accent}
              number="✓"
              label="Verified premium listing"
              inline
            />
          </div>
        )}
      </div>
    </section>
  )
}

function StatCell({
  theme,
  accent,
  number,
  label,
  live,
  isLiveActive,
  inline,
}: {
  theme: ListingTheme
  accent: string
  number: React.ReactNode
  label: string
  live?: boolean
  isLiveActive?: boolean
  inline?: boolean
}) {
  return (
    <div style={{ paddingLeft: inline ? 0 : 0 }}>
      <div
        style={{
          fontFamily: theme.displayFont,
          fontSize: theme.id === "frieze" ? "clamp(2.4rem, 5vw, 3.6rem)" : "clamp(2rem, 4.5vw, 3.2rem)",
          fontWeight: theme.id === "wired" ? 800 : 600,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: theme.bodyText,
          marginBottom: "0.5rem",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: theme.bodyFont,
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.mutedText,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {live && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: isLiveActive ? "#22c55e" : theme.mutedText,
              boxShadow: isLiveActive ? "0 0 0 4px rgba(34,197,94,0.18)" : "none",
            }}
            aria-hidden="true"
          />
        )}
        {label}
      </div>
    </div>
  )
}

export default PullQuoteStats
