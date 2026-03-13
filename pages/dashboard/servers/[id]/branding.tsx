// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server branding editor with try-before-you-buy
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  SectionCard,
  SaveBar,
  Badge,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { Paintbrush, Gem, Crown } from "lucide-react"
import ProfileCard, {
  SKIN_PRESETS,
  DEFAULT_SKIN,
  type ProfileCardSkin,
} from "@/components/dashboard/ProfileCard"
import StatsCard from "@/components/dashboard/StatsCard"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BrandingData {
  isPremium: boolean
  premiumUntil: string | null
  baseSkinName: string | null
  properties: Record<string, Record<string, string>>
  availableSkins: string[]
}

interface RendererData {
  username: string
  avatarUrl?: string | null
  coins: number
  gems: number
  studyHours: number
  currentRank: string | null
  rankProgress: number
  nextRank: string | null
  achievements: Array<{ id: string; unlocked: boolean }>
  currentStreak: number
  voteCount: number
}

interface StatsData {
  studyTime: {
    todayMinutes: number
    thisWeekMinutes: number
    thisMonthMinutes: number
    allTimeMinutes: number
  }
  streaks: {
    currentStreak: number
    longestStreak: number
    activeDays: string[]
  }
}

const PROFILE_PROPERTIES = [
  { key: "header_colour_1", label: "Header Color 1" },
  { key: "header_colour_2", label: "Header Color 2" },
  { key: "badge_text_colour", label: "Badge Text Color" },
  { key: "badge_blob_colour", label: "Badge Background Color" },
  { key: "rank_name_colour", label: "Rank Name Color" },
  { key: "rank_hours_colour", label: "Rank Hours Color" },
  { key: "bar_full_colour", label: "Progress Bar Full" },
  { key: "bar_empty_colour", label: "Progress Bar Empty" },
  { key: "next_rank_colour", label: "Next Rank Color" },
] as const

const STATS_PROPERTIES = [
  { key: "header_colour", label: "Header Color" },
  { key: "stats_subheader_colour", label: "Subheader Color" },
  { key: "stats_text_colour", label: "Stats Text Color" },
  { key: "cal_weekday_colour", label: "Calendar Weekday Color" },
  { key: "cal_number_colour", label: "Calendar Number Color" },
  { key: "cal_streak_end_colour", label: "Streak Color" },
] as const

const DEFAULT_PROFILE: Record<string, string> = {
  header_colour_1: "#9A9FCC",
  header_colour_2: "#B3B6C6",
  badge_text_colour: "#414A9F",
  badge_blob_colour: "#FFFFFF",
  rank_name_colour: "#FFFFFF",
  rank_hours_colour: "#53504D",
  bar_full_colour: "#9A9FCC",
  bar_empty_colour: "#9A9FCC4D",
  next_rank_colour: "#53504D",
}

const DEFAULT_STATS: Record<string, string> = {
  header_colour: "#FFFFFF",
  stats_subheader_colour: "#9E9E9E",
  stats_text_colour: "#757271",
  cal_weekday_colour: "#FFFFFF",
  cal_number_colour: "#6E7877",
  cal_streak_end_colour: "#545480",
}

const SAMPLE_PROFILE_DATA: RendererData = {
  username: "Sample User",
  avatarUrl: null,
  coins: 1250,
  gems: 500,
  studyHours: 42.5,
  currentRank: "Scholar",
  rankProgress: 65,
  nextRank: "Expert",
  achievements: [
    { id: "VoiceHours", unlocked: true },
    { id: "VoiceStreak", unlocked: true },
    { id: "VoiceDays", unlocked: false },
    { id: "Workout", unlocked: false },
    { id: "TasksComplete", unlocked: true },
    { id: "ScheduledSessions", unlocked: false },
    { id: "MonthlyHours", unlocked: false },
    { id: "Voting", unlocked: false },
  ],
  currentStreak: 7,
  voteCount: 12,
}

const SAMPLE_STATS_DATA = {
  todayMinutes: 45,
  weekMinutes: 320,
  monthMinutes: 1250,
  allTimeMinutes: 2550,
  activeDays: ["2026-03-01", "2026-03-03", "2026-03-05", "2026-03-07", "2026-03-10", "2026-03-12"],
  currentStreak: 7,
  longestStreak: 14,
  leaderboardPosition: 12,
}

const PREMIUM_PLANS: Array<{
  id: string
  name: string
  gems: number
  duration: string
  popular?: boolean
  save?: string
}> = [
  { id: "monthly", name: "Monthly", gems: 1500, duration: "30 days" },
  { id: "quarterly", name: "Quarterly", gems: 4000, duration: "90 days", popular: true },
  { id: "yearly", name: "Yearly", gems: 12000, duration: "365 days", save: "17%" },
]

function buildProfileSkin(properties: Record<string, string>, baseSkinName: string | null): ProfileCardSkin {
  const resolvedBase = baseSkinName === "original" ? "base" : baseSkinName
  const preset = resolvedBase && resolvedBase in SKIN_PRESETS
    ? SKIN_PRESETS[resolvedBase as keyof typeof SKIN_PRESETS]
    : SKIN_PRESETS.obsidian
  return {
    id: "custom",
    name: "Custom",
    primaryColor: properties.header_colour_1 ?? preset.primaryColor,
    secondaryColor: properties.header_colour_2 ?? preset.secondaryColor,
    accentColor: properties.bar_full_colour ?? preset.accentColor,
    backgroundColor: preset.backgroundColor,
    textColor: properties.rank_name_colour ?? preset.textColor,
  }
}

function buildStatsSkin(properties: Record<string, string>, baseSkinName: string | null): ProfileCardSkin {
  const resolvedBase = baseSkinName === "original" ? "base" : baseSkinName
  const preset = resolvedBase && resolvedBase in SKIN_PRESETS
    ? SKIN_PRESETS[resolvedBase as keyof typeof SKIN_PRESETS]
    : SKIN_PRESETS.obsidian
  return {
    id: "custom",
    name: "Custom",
    primaryColor: properties.header_colour ?? preset.primaryColor,
    secondaryColor: properties.stats_subheader_colour ?? preset.secondaryColor,
    accentColor: properties.cal_streak_end_colour ?? preset.accentColor,
    backgroundColor: preset.backgroundColor,
    textColor: properties.stats_text_colour ?? preset.textColor,
  }
}

function buildStatsDataFromApi(stats: StatsData) {
  return {
    todayMinutes: stats.studyTime.todayMinutes,
    weekMinutes: stats.studyTime.thisWeekMinutes,
    monthMinutes: stats.studyTime.thisMonthMinutes,
    allTimeMinutes: stats.studyTime.allTimeMinutes,
    activeDays: stats.streaks.activeDays,
    currentStreak: stats.streaks.currentStreak,
    longestStreak: stats.streaks.longestStreak,
    leaderboardPosition: undefined as number | undefined,
  }
}

export default function BrandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: brandingData, isLoading: brandingLoading, mutate } = useDashboard<BrandingData>(
    id && session ? `/api/dashboard/servers/${id}/branding` : null
  )
  const { data: rendererData } = useDashboard<RendererData>(
    session ? "/api/dashboard/renderer-data" : null
  )
  const { data: statsData } = useDashboard<StatsData>(session ? "/api/dashboard/stats" : null)
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const { data: permData } = useDashboard<{ isAdmin: boolean; isModerator: boolean }>(
    id && session ? `/api/dashboard/servers/${id}/permissions` : null
  )

  const serverName = serverData?.server?.name || "Server"
  const isAdmin = permData?.isAdmin ?? false

  const [baseSkinName, setBaseSkinName] = useState<string>("obsidian")
  const [properties, setProperties] = useState<Record<string, Record<string, string>>>({
    profile: { ...DEFAULT_PROFILE },
    stats: { ...DEFAULT_STATS },
  })
  const [original, setOriginal] = useState<{ baseSkinName: string; properties: Record<string, Record<string, string>> } | null>(null)
  const [saving, setSaving] = useState(false)
  const [upsellOpen, setUpsellOpen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "stats">("profile")

  useEffect(() => {
    if (brandingData) {
      const base = brandingData.baseSkinName || "obsidian"
      setBaseSkinName(base)
      const prof = { ...DEFAULT_PROFILE, ...brandingData.properties?.profile }
      const stat = { ...DEFAULT_STATS, ...brandingData.properties?.stats }
      setProperties({ profile: prof, stats: stat })
      setOriginal({ baseSkinName: base, properties: { profile: prof, stats: stat } })
    }
  }, [brandingData])

  const setProp = useCallback((cardId: "profile" | "stats", key: string, value: string) => {
    setProperties((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], [key]: value },
    }))
  }, [])

  const hasChanges =
    original &&
    (baseSkinName !== original.baseSkinName ||
      JSON.stringify(properties) !== JSON.stringify(original.properties))

  const editedSkin =
    activeTab === "profile"
      ? buildProfileSkin(properties.profile, baseSkinName)
      : buildStatsSkin(properties.stats, baseSkinName)

  const profileData = rendererData ?? SAMPLE_PROFILE_DATA
  const statsDataForCard = statsData ? buildStatsDataFromApi(statsData) : SAMPLE_STATS_DATA

  const handleSave = async () => {
    if (!hasChanges) return

    if (!brandingData?.isPremium) {
      setUpsellOpen(true)
      return
    }

    setSaving(true)
    try {
      await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/branding`, {
        baseSkinName,
        properties,
      })
      setOriginal({ baseSkinName, properties: { ...properties } })
      mutate()
      toast.success("Branding saved")
    } catch {
      toast.error("Failed to save branding")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) {
      setBaseSkinName(original.baseSkinName)
      setProperties({ ...original.properties })
    }
  }

  const handlePurchase = async (plan: string) => {
    setPurchasing(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Purchase failed")
      setUpsellOpen(false)
      mutate()
      invalidate(`/api/dashboard/servers/${id}/branding`)
      invalidate("/api/dashboard/gems")
      toast.success(`Premium activated until ${new Date(data.premiumUntil).toLocaleDateString()}`)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  if (brandingLoading && !brandingData) {
    return (
      <Layout SEO={{ title: "Branding - LionBot", description: "Server branding editor" }}>
        <AdminGuard>
          <div className="min-h-screen bg-background pt-6 pb-20 px-4">
            <div className="max-w-6xl mx-auto flex gap-8">
              <ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />
              <div className="flex-1 min-w-0">
                <div className="h-8 bg-muted rounded w-48 animate-pulse mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-96 bg-muted/30 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </AdminGuard>
      </Layout>
    )
  }

  return (
    <Layout
      SEO={{
        title: `Branding - ${serverName} - LionBot`,
        description: "Customize your server's profile and stats card colors",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin={isAdmin} isMod />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Server Branding"
                description="Customize profile and stats card colors for your server members."
              />

              {/* Premium status banner */}
              <div
                className={cn(
                  "mb-6 px-4 py-3 rounded-xl border flex items-center justify-between gap-4",
                  brandingData?.isPremium
                    ? "bg-primary/10 border-primary/30"
                    : "bg-amber-500/10 border-amber-500/30"
                )}
              >
                {brandingData?.isPremium ? (
                  <div className="flex items-center gap-2">
                    <Crown size={20} className="text-primary" />
                    <span className="text-foreground font-medium">
                      Premium until {brandingData.premiumUntil ? new Date(brandingData.premiumUntil).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gem size={20} className="text-amber-500" />
                    <span className="text-foreground font-medium">
                      Try the editor below! Upgrade to save your custom branding.
                    </span>
                  </div>
                )}
                {!brandingData?.isPremium && (
                  <Link href="/dashboard/gems">
                    <a>
                      <Button variant="outline" size="sm">
                        Get Gems
                      </Button>
                    </a>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Color Editor */}
                <div className="space-y-6">
                  <SectionCard title="Base Skin" defaultOpen>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {brandingData?.availableSkins?.map((skinId) => {
                        const resolvedId = skinId === "original" ? "base" : skinId
                        const preset = resolvedId in SKIN_PRESETS ? SKIN_PRESETS[resolvedId as keyof typeof SKIN_PRESETS] : DEFAULT_SKIN
                        return (
                          <button
                            key={skinId}
                            type="button"
                            onClick={() => setBaseSkinName(skinId)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                              baseSkinName === skinId
                                ? "border-primary bg-primary/15"
                                : "border-border hover:bg-accent"
                            )}
                          >
                            <div
                              className="w-5 h-5 rounded shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                              }}
                            />
                            <span className="text-sm capitalize">
                              {skinId.replace(/_/g, " ")}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard title="Colors" defaultOpen>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "profile" | "stats")}>
                      <TabsList className="w-full">
                        <TabsTrigger value="profile" className="flex-1">Profile Card</TabsTrigger>
                        <TabsTrigger value="stats" className="flex-1">Stats Card</TabsTrigger>
                      </TabsList>
                      <TabsContent value="profile" className="space-y-4 pt-4">
                        {PROFILE_PROPERTIES.map(({ key, label }) => (
                          <ColorPicker
                            key={key}
                            label={label}
                            value={properties.profile[key] ?? DEFAULT_PROFILE[key]}
                            onChange={(v) => setProp("profile", key, v)}
                          />
                        ))}
                      </TabsContent>
                      <TabsContent value="stats" className="space-y-4 pt-4">
                        {STATS_PROPERTIES.map(({ key, label }) => (
                          <ColorPicker
                            key={key}
                            label={label}
                            value={properties.stats[key] ?? DEFAULT_STATS[key]}
                            onChange={(v) => setProp("stats", key, v)}
                          />
                        ))}
                      </TabsContent>
                    </Tabs>
                  </SectionCard>
                </div>

                {/* Right: Live Preview */}
                <div className="lg:sticky lg:top-6 self-start">
                  <div className="rounded-xl border border-border bg-card/50 p-6">
                    <p className="text-sm text-muted-foreground mb-4">Live Preview</p>
                    <div className="flex justify-center">
                      {activeTab === "profile" ? (
                        <ProfileCard skin={editedSkin} data={profileData} />
                      ) : (
                        <StatsCard skin={editedSkin} data={statsDataForCard} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
                label="You have unsaved branding changes"
              />
            </div>
          </div>
        </div>

        {/* Premium upsell dialog */}
        <Dialog open={upsellOpen} onOpenChange={setUpsellOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Your Custom Branding</DialogTitle>
              <DialogDescription>
                You&apos;ve designed a custom look for your server. Upgrade to premium to save it and apply it to all profile and stats cards in your server.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {PREMIUM_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    plan.popular ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      {plan.popular && (
                        <Badge variant="purple">Popular</Badge>
                      )}
                      {plan.save && (
                        <Badge variant="info">{plan.save}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-amber-500">{plan.gems.toLocaleString()} gems</span>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(plan.id)}
                      disabled={purchasing}
                    >
                      Buy Premium
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setUpsellOpen(false)}>
                Maybe later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminGuard>
    </Layout>
  )
}
