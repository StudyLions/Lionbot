// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: User profile - rebuilt with shared UI
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import {
  PageHeader,
  SectionCard,
  SettingRow,
  SearchSelect,
  Toggle,
  SaveBar,
  toast,
} from "@/components/dashboard/ui"
import { User, Globe, Languages, BarChart3 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"

interface ProfileData {
  userId: string
  name: string | null
  timezone: string | null
  locale: string | null
  showGlobalStats: boolean | null
  gems: number
  firstSeen: string | null
  lastSeen: string | null
}

const NONE = "__none__"
const TIMEZONE_OPTIONS = [
  { value: NONE, label: "Not set" },
  ...[
    "US/Eastern",
    "US/Central",
    "US/Mountain",
    "US/Pacific",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Istanbul",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Australia/Sydney",
    "Pacific/Auckland",
    "America/Sao_Paulo",
    "America/Mexico_City",
    "Africa/Cairo",
    "Asia/Jerusalem",
    "UTC",
  ].map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") })),
]

const LOCALE_OPTIONS = [
  { value: NONE, label: "Default" },
  { value: "en_GB", label: "English" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "he_IL", label: "Hebrew" },
  { value: "tr", label: "Turkish" },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [original, setOriginal] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setOriginal(data)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchData()
  }, [session, fetchData])

  const hasChanges =
    profile &&
    original &&
    JSON.stringify(profile) !== JSON.stringify(original)

  const save = async () => {
    if (!profile || !original) return
    setSaving(true)
    const updates: Record<string, unknown> = {}
    if (profile.timezone !== original.timezone)
      updates.timezone = profile.timezone || null
    if (profile.locale !== original.locale)
      updates.locale = profile.locale || null
    if (profile.showGlobalStats !== original.showGlobalStats)
      updates.show_global_stats = profile.showGlobalStats

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        toast.success("Profile saved")
        setOriginal({ ...profile })
      } else toast.error("Failed to save")
    } catch {
      toast.error("Error saving")
    }
    setSaving(false)
  }

  const reset = () => {
    if (original) setProfile({ ...original })
  }

  return (
    <Layout
      SEO={{
        title: "Profile - LionBot Dashboard",
        description: "Edit your profile",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
              <PageHeader
                title="Profile"
                description="View your account info and customize your preferences. Your timezone and language affect how LionBot displays times and messages."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Profile" },
                ]}
              />

              {loading ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-2xl p-6 animate-pulse h-32" />
                  <div className="bg-gray-800 rounded-2xl p-6 animate-pulse h-48" />
                </div>
              ) : !profile ? (
                <div className="text-center py-20 text-gray-400">
                  Unable to load profile
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Account Info */}
                  <SectionCard
                    title="Account Info"
                    description="Read-only account details"
                    icon={<User size={18} />}
                    defaultOpen={true}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                          Username
                        </p>
                        <p className="text-white font-medium">
                          {profile.name ||
                            (session?.user?.name as string) ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                          Discord ID
                        </p>
                        <p className="text-gray-300 font-mono text-sm">
                          {profile.userId}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                          LionGems
                        </p>
                        <p className="text-amber-400 font-bold text-xl">
                          {profile.gems.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                          Member Since
                        </p>
                        <p className="text-gray-300 text-sm">
                          {profile.firstSeen
                            ? new Date(
                                profile.firstSeen
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Preferences */}
                  <SectionCard
                    title="Preferences"
                    description="Customize how LionBot works for you"
                    icon={<Globe size={18} />}
                    defaultOpen={true}
                  >
                    <SettingRow
                      label="Timezone"
                      description="Used for displaying times in reminders and schedules"
                      htmlFor="profile-timezone"
                    >
                      <SearchSelect
                        id="profile-timezone"
                        options={TIMEZONE_OPTIONS}
                        value={profile.timezone ?? NONE}
                        onChange={(v) =>
                          setProfile((p) =>
                            p
                              ? {
                                  ...p,
                                  timezone:
                                    v === NONE || v === null ? null : (v as string),
                                }
                              : p
                          )
                        }
                        placeholder="Select timezone"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Language"
                      description="Bot language preference"
                      htmlFor="profile-locale"
                    >
                      <SearchSelect
                        id="profile-locale"
                        options={LOCALE_OPTIONS}
                        value={profile.locale ?? NONE}
                        onChange={(v) =>
                          setProfile((p) =>
                            p
                              ? {
                                  ...p,
                                  locale:
                                    v === NONE || v === null ? null : (v as string),
                                }
                              : p
                          )
                        }
                        placeholder="Select language"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Show Global Stats"
                      description="Display your stats on global leaderboards"
                    >
                      <Toggle
                        checked={profile.showGlobalStats ?? true}
                        onChange={(v) =>
                          setProfile((p) =>
                            p ? { ...p, showGlobalStats: v } : p
                          )
                        }
                        id="profile-show-global-stats"
                      />
                    </SettingRow>
                  </SectionCard>
                </div>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={save}
                onReset={reset}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
