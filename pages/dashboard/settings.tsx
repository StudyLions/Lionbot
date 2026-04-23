// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-23
// Purpose: Dedicated user-preferences page for the LionBot dashboard.
//          Consolidates the existing UI sound toggle and theme picker
//          into a single discoverable page so users don't have to hunt
//          for them in the sidebar. Designed to grow over time
//          (notifications, language, etc.).
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  DashboardShell,
  Toggle,
} from "@/components/dashboard/ui"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useUISound } from "@/lib/SoundContext"
import { Volume2, VolumeX, Palette, Check, Play, Settings as SettingsIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { cn } from "@/lib/utils"

interface ThemeOption {
  id: string
  label: string
  colors: { bg: string; card: string; primary: string }
}

const themes: ThemeOption[] = [
  {
    id: "midnight",
    label: "Midnight",
    colors: { bg: "hsl(222, 47%, 11%)", card: "hsl(224, 40%, 14%)", primary: "hsl(217, 91%, 60%)" },
  },
  {
    id: "light",
    label: "Light",
    colors: { bg: "hsl(210, 20%, 98%)", card: "hsl(0, 0%, 100%)", primary: "hsl(217, 91%, 50%)" },
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: { bg: "hsl(200, 50%, 8%)", card: "hsl(200, 45%, 12%)", primary: "hsl(187, 80%, 50%)" },
  },
  {
    id: "forest",
    label: "Forest",
    colors: { bg: "hsl(150, 30%, 8%)", card: "hsl(150, 25%, 12%)", primary: "hsl(142, 70%, 50%)" },
  },
  {
    id: "pink",
    label: "Pink",
    colors: { bg: "hsl(320, 25%, 8%)", card: "hsl(320, 20%, 12%)", primary: "hsl(330, 80%, 60%)" },
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: { bg: "hsl(20, 30%, 8%)", card: "hsl(20, 25%, 12%)", primary: "hsl(28, 90%, 55%)" },
  },
]

function SettingCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-muted-foreground mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-border/50">{children}</div>
    </div>
  )
}

function SoundCard() {
  const { soundEnabled, setSoundEnabled, playSound } = useUISound()

  return (
    <SettingCard
      icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      title="UI sounds"
      description="Tiny 8-bit clicks and feedback chimes when you toggle, save, or interact with buttons. Stored locally in your browser."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-3">
        <div className="flex items-center gap-3">
          <Toggle
            checked={soundEnabled}
            onChange={(next) => {
              setSoundEnabled(next)
              if (next) {
                setTimeout(() => playSound("toggleOn"), 50)
              }
            }}
            label={soundEnabled ? "Sounds are on" : "Sounds are off"}
            silent
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (soundEnabled) playSound("success")
          }}
          disabled={!soundEnabled}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors",
            soundEnabled
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Play size={12} />
          Test sound
        </button>
      </div>
    </SettingCard>
  )
}

function ThemeCard() {
  const { theme, setTheme } = useTheme()
  const { playSound } = useUISound()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <SettingCard
      icon={<Palette size={18} />}
      title="Theme"
      description="Pick a color palette for the dashboard. Your choice is saved to this browser."
    >
      <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-3">
        {themes.map((t) => {
          const isActive = mounted && theme === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTheme(t.id)
                playSound("click")
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors border",
                isActive
                  ? "bg-accent text-foreground border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-border/60"
              )}
            >
              <div className="flex gap-0.5 flex-shrink-0">
                <span
                  className="w-4 h-4 rounded-l-md border border-border"
                  style={{ background: t.colors.bg }}
                />
                <span
                  className="w-4 h-4 border-y border-border"
                  style={{ background: t.colors.card }}
                />
                <span
                  className="w-4 h-4 rounded-r-md border border-border"
                  style={{ background: t.colors.primary }}
                />
              </div>
              <span className="flex-1 text-left">{t.label}</span>
              {isActive && <Check size={14} className="text-primary flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </SettingCard>
  )
}

export default function SettingsPage() {
  return (
    <Layout
      SEO={{
        title: "Settings - LionBot Dashboard",
        description: "Manage your UI preferences, theme, and sound settings.",
      }}
    >
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />}>
          <PageHeader
            title="Settings"
            description="Personalize the dashboard. These preferences are saved to your browser, not your account."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Settings" },
            ]}
          />

          <div className="space-y-4">
            <SoundCard />
            <ThemeCard />

            <div className="bg-muted/30 border border-dashed border-border rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-muted-foreground">
              <SettingsIcon size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                More preferences coming soon: notification rules, language,
                and per-module display options. Want something specific?
                Let us know on{" "}
                <a
                  href="https://discord.gg/studylions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Discord
                </a>
                .
              </span>
            </div>
          </div>
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
