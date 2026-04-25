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
  toast,
} from "@/components/dashboard/ui"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useUISound } from "@/lib/SoundContext"
import {
  Volume2,
  VolumeX,
  Palette,
  Check,
  Play,
  Settings as SettingsIcon,
  Mail,
  AlertTriangle,
} from "lucide-react"
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

// --- AI-MODIFIED (2026-04-25) ---
// Purpose: Email notification preferences card. Loads /api/email/preferences
//          on mount, persists changes via PATCH, and includes a master
//          "Unsubscribe from all" red button.

interface EmailPrefsResponse {
  email: string | null
  emailVerified: boolean | null
  unsubscribedAll: boolean
  preferences: Record<string, boolean>
  descriptions: Record<string, { label: string; description: string }>
}

const EMAIL_PREF_KEYS = [
  "email_pref_welcome",
  "email_pref_weekly_digest",
  "email_pref_lifecycle",
  "email_pref_premium",
  "email_pref_announcements",
] as const

function EmailNotificationsCard() {
  const [data, setData] = useState<EmailPrefsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [confirmingUnsubAll, setConfirmingUnsubAll] = useState(false)

  useEffect(() => {
    let alive = true
    fetch("/api/email/preferences")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d: EmailPrefsResponse) => {
        if (alive) setData(d)
      })
      .catch(() => {
        if (alive) toast.error("Could not load email preferences")
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  async function patch(body: Record<string, boolean>, savingHint: string) {
    setSavingKey(savingHint)
    try {
      const res = await fetch("/api/email/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("PATCH failed")
      const updated = await res.json()
      setData((prev) =>
        prev
          ? {
              ...prev,
              preferences: updated.preferences,
              unsubscribedAll: updated.unsubscribedAll,
            }
          : prev
      )
      toast.success("Preferences saved")
    } catch {
      toast.error("Could not save your preferences")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <SettingCard
      icon={<Mail size={18} />}
      title="Email notifications"
      description="Choose what we email you about. Each kind has its own switch — and there is always an unsubscribe link in every message."
    >
      <div id="email" className="pt-3 space-y-3">
        {loading ? (
          <div className="text-xs text-muted-foreground py-3">
            Loading your preferences…
          </div>
        ) : !data ? (
          <div className="text-xs text-destructive py-3">
            Could not load preferences. Please refresh the page.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Sending to
              </span>
              <span className="text-sm text-foreground break-all">
                {data.email ?? (
                  <span className="text-muted-foreground">
                    No email on file. Sign in with Discord again to share it.
                  </span>
                )}
              </span>
              {data.email && data.emailVerified === false ? (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-amber-500">
                  <AlertTriangle size={11} /> This address is not verified on
                  Discord — verify it there to receive emails.
                </span>
              ) : null}
            </div>

            {EMAIL_PREF_KEYS.map((key) => {
              const meta = data.descriptions[key]
              const value = data.preferences[key] ?? true
              const disabledByMaster = data.unsubscribedAll
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5",
                    disabledByMaster && "opacity-60"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {meta?.label ?? key}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground leading-snug">
                      {meta?.description ?? ""}
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <Toggle
                      checked={!disabledByMaster && value}
                      disabled={disabledByMaster || savingKey === key}
                      onChange={(next) =>
                        patch({ [key]: next }, key)
                      }
                    />
                  </div>
                </div>
              )
            })}

            <div className="pt-2">
              {data.unsubscribedAll ? (
                <button
                  type="button"
                  disabled={savingKey === "all"}
                  onClick={() =>
                    patch(
                      {
                        unsubscribedAll: false,
                        email_pref_welcome: true,
                        email_pref_weekly_digest: true,
                        email_pref_lifecycle: true,
                        email_pref_premium: true,
                        email_pref_announcements: true,
                      },
                      "all"
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-50 transition-colors"
                >
                  Resubscribe to LionBot emails
                </button>
              ) : confirmingUnsubAll ? (
                <div className="flex flex-col sm:flex-row gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                  <span className="flex-1 text-xs text-foreground">
                    Stop sending you any LionBot email? You can resubscribe at
                    any time from this page.
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingUnsubAll(false)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingKey === "all"}
                      onClick={async () => {
                        await patch({ unsubscribedAll: true }, "all")
                        setConfirmingUnsubAll(false)
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      Yes, unsubscribe from all
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingUnsubAll(true)}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Unsubscribe from all LionBot emails
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </SettingCard>
  )
}
// --- END AI-MODIFIED ---

export default function SettingsPage() {
  return (
    <Layout
      SEO={{
        title: "Settings - LionBot Dashboard",
        description: "Manage your UI preferences, theme, and email settings.",
      }}
    >
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />}>
          <PageHeader
            title="Settings"
            description="Personalize the dashboard. UI preferences are saved to your browser; email preferences are saved to your account."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Settings" },
            ]}
          />

          <div className="space-y-4">
            <SoundCard />
            <ThemeCard />
            {/* --- AI-MODIFIED (2026-04-25): email notifications card --- */}
            <EmailNotificationsCard />
            {/* --- END AI-MODIFIED --- */}

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
