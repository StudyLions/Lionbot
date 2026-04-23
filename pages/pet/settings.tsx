// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-23
// Purpose: Dedicated user-preferences page for the LionGotchi /pet
//          section. Mirrors /dashboard/settings but uses the pixel-art
//          PetShell styling so it feels at home in the pet UI. Hosts
//          the UI sound toggle and theme picker (more prefs to come).
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import PetShell from "@/components/pet/PetShell"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelButton from "@/components/pet/ui/PixelButton"
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

function PixelSettingCard({
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
    <PixelCard className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[var(--pet-gold,#f0c040)] mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-pixel text-sm text-[var(--pet-text,#e2e8f0)]">{title}</h3>
          <p className="mt-1 text-[12px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="pt-3 border-t-2 border-[var(--pet-border,#2a3a5c)]/60">{children}</div>
    </PixelCard>
  )
}

function SoundCard() {
  const { soundEnabled, setSoundEnabled, playSound } = useUISound()

  return (
    <PixelSettingCard
      icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      title="UI sounds"
      description="8-bit clicks and feedback chimes when you toggle, save, or interact. Stored locally in your browser."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <button
          type="button"
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) {
              setTimeout(() => playSound("toggleOn"), 50)
            }
          }}
          className={cn(
            "font-pixel inline-flex items-center gap-2 px-3 py-2 text-sm border-2 transition-all",
            "shadow-[2px_2px_0_#060810]",
            "hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px",
            "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
            soundEnabled
              ? "bg-[#2a7a3a] border-[#40d870] text-[#d0ffd8]"
              : "bg-[#1a2438] border-[#3a4a6c] text-[#8899aa]"
          )}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? "Sounds on" : "Sounds off"}
        </button>

        <PixelButton
          variant="info"
          size="sm"
          disabled={!soundEnabled}
          onClick={() => {
            if (soundEnabled) playSound("success")
          }}
        >
          <Play size={12} />
          Test sound
        </PixelButton>
      </div>
    </PixelSettingCard>
  )
}

function ThemeCard() {
  const { theme, setTheme } = useTheme()
  const { playSound } = useUISound()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <PixelSettingCard
      icon={<Palette size={18} />}
      title="Theme"
      description="Pick a color palette for the dashboard and pet sections. Saved to this browser."
    >
      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
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
                "font-pixel flex items-center gap-2 px-2 py-2 text-[12px] border-2 transition-all",
                "shadow-[2px_2px_0_#060810]",
                "hover:shadow-[1px_1px_0_#060810] hover:translate-x-px hover:translate-y-px",
                "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
                isActive
                  ? "bg-[#1a2050] border-[#4060c0] text-[#d0e0ff]"
                  : "bg-[#0a0e1a] border-[#2a3a5c] text-[#8899aa] hover:text-[#c0d0e0]"
              )}
            >
              <div className="flex gap-0.5 flex-shrink-0">
                <span
                  className="w-3 h-3 border border-[#0a0e1a]"
                  style={{ background: t.colors.bg }}
                />
                <span
                  className="w-3 h-3 border-y border-[#0a0e1a]"
                  style={{ background: t.colors.card }}
                />
                <span
                  className="w-3 h-3 border border-[#0a0e1a]"
                  style={{ background: t.colors.primary }}
                />
              </div>
              <span className="flex-1 text-left truncate">{t.label}</span>
              {isActive && <Check size={12} className="text-[#40d870] flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </PixelSettingCard>
  )
}

export default function PetSettingsPage() {
  return (
    <Layout
      SEO={{
        title: "Settings - LionGotchi",
        description: "Manage your UI preferences, theme, and sound settings.",
      }}
    >
      <AdminGuard>
        <PetShell>
          <PixelCard className="px-4 py-3">
            <h1 className="font-pixel text-lg text-[var(--pet-gold,#f0c040)]">Settings</h1>
            <p className="mt-1 text-[12px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Personalize the pet dashboard. These preferences are saved to your
              browser, not your account.
            </p>
          </PixelCard>

          <SoundCard />
          <ThemeCard />

          <PixelCard className="px-4 py-3 border-dashed">
            <div className="flex items-start gap-3 text-[11px] text-[var(--pet-text-dim,#8899aa)]">
              <SettingsIcon size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                More preferences coming soon: notification rules, language,
                and per-module display options.
              </span>
            </div>
          </PixelCard>
        </PetShell>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
