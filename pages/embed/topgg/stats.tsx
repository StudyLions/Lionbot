// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Live stats widget for top.gg iframe embed. Shows animated
//          counters for servers, users, sessions, studying now, and
//          active timers. Fetches from /api/public-stats with 2min cache.
// ============================================================
import { useEffect, useState, useCallback } from "react"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import EmbedLayout from "@/components/embed/EmbedLayout"

interface Stats {
  guilds: number
  users: number
  sessions: number
  studyingNow: number
  activeTimers: number
}

function useCountUp(target: number, duration = 1800): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target <= 0) {
      setCount(0)
      return
    }
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 10_000) return Math.round(n / 1_000) + "k"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toLocaleString()
}

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  color: string
  pulse?: boolean
  delay: number
}

function StatCard({ label, value, color, pulse, delay }: StatCardProps) {
  const animated = useCountUp(value, 1800 + delay * 200)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 120)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        flex: "1 1 0",
        minWidth: "100px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {pulse && (
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
              animation: "pulse-dot 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
        )}
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {formatNumber(animated)}
        </span>
      </div>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function TopggStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/public-stats")
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!stats) {
    return (
      <EmbedLayout title="LionBot Stats" height="110px">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "110px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "13px",
          }}
        >
          Loading stats...
        </div>
      </EmbedLayout>
    )
  }

  return (
    <EmbedLayout title="LionBot Stats" height="110px">
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          padding: "16px 20px",
          height: "110px",
          boxSizing: "border-box",
        }}
      >
        <StatCard
          label="Servers"
          value={stats.guilds}
          color="#60a5fa"
          delay={0}
        />
        <Divider />
        <StatCard
          label="Users"
          value={stats.users}
          color="#a78bfa"
          delay={1}
        />
        <Divider />
        <StatCard
          label="Sessions"
          value={stats.sessions}
          color="#f472b6"
          delay={2}
        />
        <Divider />
        <StatCard
          label="Studying Now"
          value={stats.studyingNow}
          color="#34d399"
          pulse
          delay={3}
        />
        <Divider />
        <StatCard
          label="Active Timers"
          value={stats.activeTimers}
          color="#fbbf24"
          delay={4}
        />
      </div>
    </EmbedLayout>
  )
}

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "40px",
        background:
          "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)",
        flexShrink: 0,
      }}
    />
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
