// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Profile page - hero card, stats at a glance, skins carousel, preferences
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
  DashboardShell,
} from "@/components/dashboard/ui"
import { Globe } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Remove React ProfileCard fallback, use real bot-rendered images everywhere
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Clock,
  Flame,
  ThumbsUp,
  Gem,
  Palette,
  RefreshCw,
  Trophy,
  ImageOff,
} from "lucide-react"
// --- END AI-MODIFIED ---
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Image from "next/image"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports and static skin image map
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Static bot-rendered skin preview map
const skinPreviewMap: Record<string, any> = {
  base: require("@/public/images/skins/previews/profile_original.png"),
  original: require("@/public/images/skins/previews/profile_original.png"),
  obsidian: require("@/public/images/skins/previews/profile_obsidian.png"),
  platinum: require("@/public/images/skins/previews/profile_platinum.png"),
  blue_bayoux: require("@/public/images/skins/previews/profile_blue_bayoux.png"),
  boston_blue: require("@/public/images/skins/previews/profile_boston_blue.png"),
  bubble_gum: require("@/public/images/skins/previews/profile_bubble_gum.png"),
  bubblegum: require("@/public/images/skins/previews/profile_bubble_gum.png"),
  cotton_candy: require("@/public/images/skins/previews/profile_cotton_candy.png"),
}
// --- END AI-MODIFIED ---

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

interface StatsData {
  studyTime: {
    todayMinutes: number
    thisWeekMinutes: number
    thisMonthMinutes: number
    allTimeMinutes: number
  }
  streaks: { currentStreak: number; longestStreak: number; activeDays: string[] }
  achievements: Array<{ id: string; unlocked: boolean }>
  voteCount: number
}

interface SkinItem {
  id: number
  active: boolean
  acquiredAt: string | null
  expiresAt: string | null
  skinName: string
  baseSkinId: number | null
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

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

function normalizeSkinId(name: string): string {
  return name?.toLowerCase().replace(/\s+/g, "_") ?? ""
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profileData, error, isLoading: loading, mutate } = useDashboard<ProfileData>(
    session ? "/api/dashboard/profile" : null
  )
  const { data: serversData } = useDashboard<{ servers: { guildId: string; guildName: string }[] }>(
    session ? "/api/dashboard/servers" : null
  )
  const { data: stats } = useDashboard<StatsData>(session ? "/api/dashboard/stats" : null)
  const { data: gemsData } = useDashboard<{ gemBalance: number }>(session ? "/api/dashboard/gems" : null)
  const { data: invData } = useDashboard<{ skins: SkinItem[] }>(
    session ? "/api/dashboard/inventory" : null
  )

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [original, setOriginal] = useState<ProfileData | null>(null)
  const [saving, setSaving] = useState(false)
  const [cardError, setCardError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const firstGuildId = serversData?.servers?.[0]?.guildId
  const currentSkin = invData?.skins?.find(s => s.active)
  const currentSkinId = currentSkin?.skinName?.toLowerCase().replace(/\s+/g, "_") ?? "base"
  const cardSrc = skinPreviewMap[currentSkinId] || skinPreviewMap["original"] || null

  const handleCardError = useCallback(() => {
    setCardError(true)
  }, [])

  const handleRefreshPreview = useCallback(() => {
    setCardError(false)
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (profileData) {
      setProfile(profileData)
      setOriginal(profileData)
    }
  }, [profileData])

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
      await dashboardMutate("PATCH", "/api/dashboard/profile", updates)
      toast.success("Profile saved")
      setOriginal({ ...profile })
      mutate()
    } catch {
      toast.error("Error saving")
    }
    setSaving(false)
  }

  const reset = () => {
    if (original) setProfile({ ...original })
  }

  const skins = invData?.skins ?? []
  const gems = gemsData?.gemBalance ?? 0
  const studyTime = stats?.studyTime
  const currentStreak = stats?.streaks?.currentStreak ?? 0
  const voteCount = stats?.voteCount ?? 0
  const achievementCount = stats?.achievements?.filter((a) => a.unlocked).length ?? 0
  const totalAchievements = 8

  const activeSkin = skins.find((s) => s.active)

  return (
    <Layout
      SEO={{
        title: "Profile - LionBot Dashboard",
        description: "View your profile card, stats, and preferences",
      }}
    >
      <AdminGuard>
        {/* --- AI-REPLACED (2026-03-24) --- */}
        {/* Reason: Migrated to DashboardShell layout wrapper */}
        {/* Original: <div className="min-h-screen ..."><div className="max-w-6xl ..."><DashboardNav /><div className="flex-1 min-w-0 space-y-8"> */}
        <DashboardShell nav={<DashboardNav />} className="space-y-8">
              <PageHeader
                title="Profile"
                description="Your profile card, study stats, skins, and preferences. Your timezone and language affect how LionBot displays times and messages."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Profile" },
                ]}
              />

              {/* --- AI-REPLACED (2026-03-24) --- */}
              {/* Reason: Replaced custom animate-pulse divs with shared Skeleton component */}
              {/* What the new code does better: Consistent loading states using the shared Skeleton component */}
              {/* --- Original code (commented out for rollback) --- */}
              {/* loading ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card rounded-2xl p-6 animate-pulse h-80" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-2xl p-6 animate-pulse h-32" />
                </div> */}
              {/* --- End original code --- */}
              {loading ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="rounded-2xl h-80" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="rounded-xl h-24" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="rounded-2xl h-32" />
                  {/* --- END AI-REPLACED --- */}
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-400">{error.message}</div>
              ) : !profile ? (
                <div className="text-center py-20 text-muted-foreground">Unable to load profile</div>
              ) : (
                <>
                  {/* Hero Section - Profile Card + Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Profile Card */}
                    <div>
                      {/* --- AI-MODIFIED (2026-03-14) --- */}
                      {/* --- AI-MODIFIED (2026-03-14) --- */}
                      {/* Purpose: Use static skin images instead of broken API-rendered previews */}
                      <div className="flex justify-center lg:justify-start">
                        {cardSrc ? (
                          <div className="relative w-full max-w-[440px] rounded-xl overflow-hidden shadow-2xl bg-card">
                            <Image
                              src={cardSrc}
                              alt="Profile card"
                              width={440}
                              height={220}
                              objectFit="contain"
                              layout="responsive"
                            />
                          </div>
                        ) : (
                          <div className="w-full max-w-[440px] aspect-[2/1] rounded-xl bg-card border border-border flex items-center justify-center">
                            <Palette className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      {/* --- END AI-MODIFIED --- */}
                      </div>
                      {/* --- END AI-MODIFIED --- */}
                      <div className="flex gap-3 mt-4">
                        <Link href="/dashboard/inventory">
                          <a>
                            <Button variant="outline" size="sm">
                              <Palette size={14} className="mr-2" />
                              Change Skin
                            </Button>
                          </a>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleRefreshPreview}>
                          <RefreshCw size={14} className="mr-2" />
                          Refresh Preview
                        </Button>
                      </div>
                    </div>

                    {/* Right: Stats at a glance */}
                    <div className="space-y-4">
                      {studyTime && (
                        <div className="grid grid-cols-2 gap-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} />
                                Today
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold text-foreground">
                                {formatMinutes(studyTime.todayMinutes)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} />
                                This Week
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold text-foreground">
                                {formatMinutes(studyTime.thisWeekMinutes)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} />
                                This Month
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold text-foreground">
                                {formatMinutes(studyTime.thisMonthMinutes)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} />
                                All Time
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold text-foreground">
                                {formatMinutes(studyTime.allTimeMinutes)}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      <Card>
                        <CardContent className="pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Flame className="text-amber-500" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Current Streak
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <ThumbsUp className="text-primary" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Top.gg Votes
                            </p>
                            <p className="text-lg font-bold text-foreground">{voteCount}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Gem className="text-amber-500" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              LionGems
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {gems.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Trophy className="text-primary" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Achievements
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {achievementCount} of {totalAchievements} unlocked
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* --- AI-MODIFIED (2026-03-14) --- */}
                  {/* Purpose: Use real bot-rendered skin thumbnails */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Your Skins</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 scrollbar-thin">
                      <Link href="/dashboard/inventory">
                        <a
                          className={cn(
                            "shrink-0 w-36 rounded-xl border-2 overflow-hidden flex flex-col transition-all hover:border-primary/50",
                            !activeSkin
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:bg-card/80"
                          )}
                        >
                          <div className="bg-muted/30 overflow-hidden">
                            <Image src={skinPreviewMap["original"]} alt="Default skin" width={144} height={68} objectFit="cover" />
                          </div>
                          <span className="text-xs font-medium text-foreground truncate w-full px-2 py-2 text-center bg-card">
                            Default
                          </span>
                        </a>
                      </Link>
                      {skins.map((item) => {
                        const skinKey = normalizeSkinId(item.skinName)
                        const isActive = item.active
                        return (
                          <Link href="/dashboard/inventory" key={item.id}>
                            <a
                              className={cn(
                                "shrink-0 w-36 rounded-xl border-2 overflow-hidden flex flex-col transition-all hover:border-primary/50",
                                isActive
                                  ? "border-primary ring-2 ring-primary/30"
                                  : "border-border hover:bg-card/80"
                              )}
                            >
                              <div className="bg-muted/30 overflow-hidden">
                                {skinPreviewMap[skinKey] ? (
                                  <Image src={skinPreviewMap[skinKey]} alt={`${item.skinName} skin`} width={144} height={68} objectFit="cover" />
                                ) : (
                                  <div className="w-full h-16 flex items-center justify-center"><Palette className="h-6 w-6 text-muted-foreground" /></div>
                                )}
                              </div>
                              <span className="text-xs font-medium text-foreground truncate w-full px-2 py-2 text-center bg-card">
                                {item.skinName}
                              </span>
                            </a>
                          </Link>
                        )
                      })}
                      <Link href="/dashboard/inventory">
                        <a className="shrink-0 w-36 h-32 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all">
                          <Palette size={24} className="text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Browse more
                          </span>
                        </a>
                      </Link>
                    </div>
                  </div>
                  {/* --- END AI-MODIFIED --- */}

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
                                  timezone: v === NONE || v === null ? null : (v as string),
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
                                  locale: v === NONE || v === null ? null : (v as string),
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
                          setProfile((p) => (p ? { ...p, showGlobalStats: v } : p))
                        }
                        id="profile-show-global-stats"
                      />
                    </SettingRow>
                  </SectionCard>
                </>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={save}
                onReset={reset}
                saving={saving}
              />
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard"])),
  },
})
// --- END AI-MODIFIED ---
