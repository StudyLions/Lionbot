// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Auto-rotating feature carousel for top.gg iframe embed.
//          Cycles through 7 major features with smooth transitions,
//          accent colors, and progress dots.
// ============================================================
import { useEffect, useState } from "react"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import EmbedLayout from "@/components/embed/EmbedLayout"

interface Feature {
  title: string
  emoji: string
  color: string
  bgGlow: string
  bullets: string[]
}

const FEATURES: Feature[] = [
  {
    title: "Study Tracking & Rewards",
    emoji: "\u{1F3A4}",
    color: "#60a5fa",
    bgGlow: "rgba(96, 165, 250, 0.08)",
    bullets: [
      "Automatic voice & text session tracking",
      "Earn LionCoins for every hour of activity",
      "Daily, weekly, and monthly statistics",
      "Beautiful profile cards with progress",
    ],
  },
  {
    title: "Ranks & Leaderboards",
    emoji: "\u{1F3C6}",
    color: "#fbbf24",
    bgGlow: "rgba(251, 191, 36, 0.08)",
    bullets: [
      "Custom rank tiers with role rewards",
      "Voice, message, or XP-based progression",
      "Server-wide leaderboards with filters",
      "Seasonal resets for fresh competition",
    ],
  },
  {
    title: "Economy & Shop",
    emoji: "\u{1FA99}",
    color: "#34d399",
    bgGlow: "rgba(52, 211, 153, 0.08)",
    bullets: [
      "Full virtual economy tied to activity",
      "Colour role shop with custom pricing",
      "Rentable private voice channels",
      "Member-to-member coin transfers",
    ],
  },
  {
    title: "Pomodoro Focus Sessions",
    emoji: "\u{23F1}\u{FE0F}",
    color: "#f472b6",
    bgGlow: "rgba(244, 114, 182, 0.08)",
    bullets: [
      "Configurable focus/break timer cycles",
      "Voice channel audio alerts",
      "Focus Power streaks & milestones",
      "Weekly digest summaries",
    ],
  },
  {
    title: "LionGotchi Virtual Pets",
    emoji: "\u{1F981}",
    color: "#fb923c",
    bgGlow: "rgba(251, 146, 60, 0.08)",
    bullets: [
      "Raise a virtual pet that grows as you study",
      "Equipment drops, farm, and crafting",
      "Player-to-player marketplace",
      "Enhancement scrolls with stat boosts",
    ],
  },
  {
    title: "Tasks & Reminders",
    emoji: "\u{2705}",
    color: "#a78bfa",
    bgGlow: "rgba(167, 139, 250, 0.08)",
    bullets: [
      "Interactive to-do lists with rewards",
      "Personal reminders (time or interval)",
      "Scheduled accountability sessions",
      "Web dashboard task board",
    ],
  },
  {
    title: "Server Management",
    emoji: "\u{1F6E1}\u{FE0F}",
    color: "#818cf8",
    bgGlow: "rgba(129, 140, 248, 0.08)",
    bullets: [
      "Button, dropdown & reaction role menus",
      "Camera-required study channels",
      "Moderation notes, warns & tickets",
      "Welcome messages & autoroles",
    ],
  },
]

const INTERVAL_MS = 5500

export default function TopggFeatures() {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setActive((prev) => (prev + 1) % FEATURES.length)
        setTransitioning(false)
      }, 400)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const f = FEATURES[active]

  return (
    <EmbedLayout title="LionBot Features" height="300px">
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-bullet {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          padding: "16px 32px",
          boxSizing: "border-box",
          opacity: entered ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Feature card */}
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            borderRadius: "16px",
            border: `1px solid ${f.color}22`,
            background: f.bgGlow,
            padding: "20px 28px",
            position: "relative",
            overflow: "hidden",
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {/* Accent glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${f.color}15, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "28px", lineHeight: 1 }}>{f.emoji}</span>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: f.color,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {f.title}
            </h2>
          </div>

          {/* Bullets */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {f.bullets.map((bullet, i) => (
              <li
                key={`${active}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7px 0",
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.78)",
                  animation: transitioning
                    ? "none"
                    : `fade-bullet 0.5s ease ${i * 0.1}s both`,
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: f.color,
                    flexShrink: 0,
                    opacity: 0.7,
                  }}
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          {FEATURES.map((feat, i) => (
            <button
              key={i}
              onClick={() => {
                setTransitioning(true)
                setTimeout(() => {
                  setActive(i)
                  setTransitioning(false)
                }, 300)
              }}
              style={{
                width: i === active ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                background:
                  i === active ? feat.color : "rgba(255, 255, 255, 0.15)",
                transition: "all 0.4s ease",
                padding: 0,
              }}
              aria-label={feat.title}
            />
          ))}
        </div>
      </div>
    </EmbedLayout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
