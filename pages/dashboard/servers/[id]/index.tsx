// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server overview - tabbed layout with admin control panel,
//          real-time active users, premium banner, and leaderboard
// ============================================================
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: full redesign with tabs, hero header, admin stats, skeleton loading
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Clock, Coins, Crown, Trophy, Dumbbell, Settings, Users, Shield,
  Wallet, Wand2, CheckCircle2, XCircle, ChevronRight, Radio,
  AlertTriangle, Ban, ArrowRightLeft, TrendingUp, UserPlus,
  Sparkles, Zap, Palette, HeadphonesIcon,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface ServerData {
  server: {
    id: string
    name: string
    iconUrl: string | null
    bannerUrl: string | null
    settings: {
      studyHourlyReward: number | null
      rankType: string | null
      timezone: string | null
    } | null
  }
  you: {
    trackedTimeSeconds: number
    trackedTimeHours: number
    coins: number
    displayName: string | null
    workoutCount: number | null
    firstJoined: string | null
    ranks: any
  }
  leaderboard: Array<{
    rank: number
    userId: string
    displayName: string | null
    trackedTimeHours: number
    coins: number
    isYou: boolean
  }>
}

interface Permissions {
  isMember: boolean
  isModerator: boolean
  isAdmin: boolean
}

interface OverviewStats {
  activeNow: {
    count: number
    users: Array<{ userId: string; displayName: string; channelId: string | null; startTime: string | null }>
  }
  activity: { studiedToday: number; studiedThisWeek: number; newMembersThisWeek: number; totalMembers: number }
  moderation: { openTickets: number; recentWarnings: number; activeStudyBans: number }
  economy: {
    totalCoinsInCirculation: number
    transactionsToday: number
    topEarner: { userId: string; displayName: string; coins: number } | null
  }
}

interface SetupStatus {
  settings: boolean
  ranksCount: number
  shopCount: number
  roleMenusCount: number
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDuration(startTime: string | null): string {
  if (!startTime) return "just started"
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
  if (diff < 1) return "just started"
  if (diff < 60) return `${diff}m`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted/50 rounded-lg ${className}`} />
  )
}

function StatCard({ icon, label, value, color, href }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; href?: string
}) {
  const content = (
    <div className={`bg-card rounded-2xl p-4 border border-border/50 ${href ? "hover:border-primary/30 transition-colors cursor-pointer group" : ""}`}>
      <div className={`flex items-center gap-2 ${color} mb-1`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

function ServerIcon({ name, iconUrl, size = "lg" }: { name: string; iconUrl: string | null; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-14 h-14" : "w-10 h-10"
  const textSize = size === "lg" ? "text-xl" : "text-base"
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={`${dim} rounded-2xl object-cover flex-shrink-0`} loading="lazy" />
  }
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-border/50`}>
      <span className={`${textSize} font-bold text-foreground/80`}>{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default function ServerDetail() {
  const { status } = useSession()
  const router = useRouter()
  const { id } = router.query

  const { data, error: fetchError, isLoading } = useDashboard<ServerData>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}` : null
  )
  const { data: permsData, error: permsError } = useDashboard<Permissions>(
    status === "authenticated" && id ? `/api/dashboard/servers/${id}/permissions` : null
  )
  const { data: serverStats } = useDashboard<{
    studyTime: { todayMinutes: number; thisWeekMinutes: number; thisMonthMinutes: number; allTimeMinutes: number }
  }>(
    status === "authenticated" && id ? `/api/dashboard/stats?guildId=${id}` : null
  )
  const { data: premiumData } = useDashboard<{ isPremium: boolean; premiumUntil: string | null }>(
    id && status === "authenticated" ? `/api/dashboard/servers/${id}/branding` : null
  )
  const perms = permsData ?? { isMember: false, isModerator: false, isAdmin: false }
  const { data: adminStats } = useDashboard<OverviewStats>(
    status === "authenticated" && id && (permsData?.isModerator || permsData?.isAdmin)
      ? `/api/dashboard/servers/${id}/overview-stats`
      : null
  )

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const loading = isLoading || (permsData === undefined && !permsError)
  const error = fetchError?.message ?? null

  useEffect(() => {
    if (!perms.isAdmin || !id) return
    Promise.all([
      fetch(`/api/dashboard/servers/${id}/ranks`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/shop`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/rolemenus`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ranksRes, shopRes, rolemenusRes]) => {
        const settingsConfigured =
          !!data?.server?.settings &&
          (data.server.settings.timezone != null ||
            data.server.settings.studyHourlyReward != null ||
            data.server.settings.rankType != null)
        setSetupStatus({
          settings: settingsConfigured,
          ranksCount: (ranksRes?.xpRanks?.length || 0) + (ranksRes?.voiceRanks?.length || 0) + (ranksRes?.msgRanks?.length || 0),
          shopCount: shopRes?.items?.length || 0,
          roleMenusCount: rolemenusRes?.menus?.length || 0,
        })
      })
      .catch(() => toast.error("Failed to load setup status"))
  }, [perms.isAdmin, id, data?.server?.settings])

  return (
    <Layout
      SEO={{ title: `${data?.server.name || "Server"} - LionBot Dashboard`, description: "Server dashboard" }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav
              serverId={id as string}
              serverName={data?.server.name || (loading ? "Loading..." : "Server")}
              isAdmin={perms.isAdmin}
              isMod={perms.isModerator}
            />
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="h-28 rounded-none" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                  <Skeleton className="h-24" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                  <Skeleton className="h-64" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <XCircle className="mx-auto text-destructive mb-4" size={48} />
                  <p className="text-destructive text-lg">{error}</p>
                </div>
              ) : data ? (
                <>
                  {/* Hero Header */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 border border-border">
                    {data.server.bannerUrl ? (
                      <div className="absolute inset-0">
                        <img src={data.server.bannerUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/70" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background" />
                    )}
                    <div className="relative px-6 py-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <ServerIcon name={data.server.name} iconUrl={data.server.iconUrl} size="lg" />
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">{data.server.name}</h1>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Dashboard</span>
                            <span className="opacity-40">/</span>
                            <Link href="/dashboard/servers">
                              <span className="hover:text-foreground transition-colors cursor-pointer">Servers</span>
                            </Link>
                            <span className="opacity-40">/</span>
                            <span className="text-foreground/70">{data.server.name}</span>
                          </div>
                        </div>
                      </div>
                      {perms.isAdmin && (
                        <Link href={`/dashboard/servers/${id}/setup`}>
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors whitespace-nowrap">
                            <Wand2 size={16} />
                            Setup Wizard
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-muted/50 border border-border">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    </TabsList>

                    {/* ====== OVERVIEW TAB ====== */}
                    <TabsContent value="overview" className="space-y-6">
                      {/* Premium Banner */}
                      {premiumData?.isPremium ? (
                        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5">
                          <div className="flex items-center gap-3">
                            <Crown size={22} className="text-amber-400" />
                            <div>
                              <p className="font-semibold text-foreground">Premium Server</p>
                              <p className="text-sm text-muted-foreground">
                                {premiumData.premiumUntil
                                  ? `Active until ${new Date(premiumData.premiumUntil).toLocaleDateString()}`
                                  : "Premium features active"}
                              </p>
                            </div>
                            <Link href={`/dashboard/servers/${id}/branding`} className="ml-auto">
                              <span className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-medium transition-colors">
                                Edit Branding
                              </span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/10 p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
                          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Crown size={20} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-lg">Upgrade to Premium</p>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  <li className="flex items-center gap-2"><Palette size={14} className="text-amber-400/70" /> Custom server branding &amp; skins</li>
                                  <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-400/70" /> Exclusive premium features</li>
                                  <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400/70" /> Priority support &amp; early access</li>
                                </ul>
                              </div>
                            </div>
                            <Link href={`/dashboard/servers/${id}/branding`}>
                              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
                                <Crown size={16} />
                                Upgrade Now
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Admin Control Panel */}
                      {(perms.isModerator || perms.isAdmin) && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">Server Control Panel</h3>
                          </div>

                          {!adminStats ? (
                            <div className="p-5 space-y-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[72px]" />)}
                              </div>
                              <Skeleton className="h-12" />
                              <Skeleton className="h-12" />
                            </div>
                          ) : (
                            <div className="p-5 space-y-4">
                              {/* Activity row */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">Studying Now</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activeNow.count}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-blue-400/70 mb-1">
                                    <Users size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">Studied Today</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activity.studiedToday}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-indigo-400/70 mb-1">
                                    <TrendingUp size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">This Week</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">{adminStats.activity.studiedThisWeek}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 text-purple-400/70 mb-1">
                                    <UserPlus size={13} />
                                    <span className="text-[10px] uppercase tracking-wider font-medium">New Members</span>
                                  </div>
                                  <p className="text-xl font-bold text-foreground">
                                    {adminStats.activity.newMembersThisWeek}
                                    <span className="text-xs text-muted-foreground ml-1.5 font-normal">/ {adminStats.activity.totalMembers} total</span>
                                  </p>
                                </div>
                              </div>

                              {/* Moderation row */}
                              <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 rounded-xl text-sm">
                                <Shield size={16} className="text-rose-400 flex-shrink-0" />
                                <span className="text-muted-foreground font-medium mr-auto">Moderation</span>
                                <Link href={`/dashboard/servers/${id}/moderation`}>
                                  <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                    <span className="font-bold">{adminStats.moderation.openTickets}</span>
                                    <span className="text-muted-foreground ml-1">open</span>
                                  </span>
                                </Link>
                                <span className="text-border">|</span>
                                <span>
                                  <span className="font-bold text-foreground">{adminStats.moderation.recentWarnings}</span>
                                  <span className="text-muted-foreground ml-1">warnings</span>
                                </span>
                                <span className="text-border">|</span>
                                <span>
                                  <span className="font-bold text-foreground">{adminStats.moderation.activeStudyBans}</span>
                                  <span className="text-muted-foreground ml-1">bans</span>
                                </span>
                              </div>

                              {/* Economy row */}
                              <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 rounded-xl text-sm">
                                <Coins size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-muted-foreground font-medium mr-auto">Economy</span>
                                <Link href={`/dashboard/servers/${id}/economy`}>
                                  <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                    <span className="font-bold">{adminStats.economy.totalCoinsInCirculation.toLocaleString()}</span>
                                    <span className="text-muted-foreground ml-1">coins total</span>
                                  </span>
                                </Link>
                                <span className="text-border">|</span>
                                <span>
                                  <span className="font-bold text-foreground">{adminStats.economy.transactionsToday}</span>
                                  <span className="text-muted-foreground ml-1">txns today</span>
                                </span>
                                {adminStats.economy.topEarner && (
                                  <>
                                    <span className="text-border">|</span>
                                    <span className="truncate">
                                      <span className="text-warning font-bold">{adminStats.economy.topEarner.coins.toLocaleString()}</span>
                                      <span className="text-muted-foreground ml-1">{adminStats.economy.topEarner.displayName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Your Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={<Clock size={14} />} label="Study Time" value={`${data.you.trackedTimeHours}h`} color="text-emerald-400/70" />
                        <StatCard icon={<Coins size={14} />} label="Coins" value={data.you.coins} color="text-warning/70" />
                        <StatCard icon={<Dumbbell size={14} />} label="Workouts" value={data.you.workoutCount || 0} color="text-purple-400/70" />
                        <StatCard icon={<Trophy size={14} />} label="Reward Rate" value={`${data.server.settings?.studyHourlyReward ?? 0}/hr`} color="text-cyan-400/70" />
                      </div>

                      {/* Setup Checklist (admin only) */}
                      {perms.isAdmin && setupStatus && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="p-5 border-b border-border">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <Settings size={18} />
                              Server Setup
                            </h3>
                          </div>
                          <div className="divide-y divide-border/50">
                            <SetupCheckItem configured={setupStatus.settings} label="Settings" detail={setupStatus.settings ? "Configured" : "Not configured"} href={`/dashboard/servers/${id}/settings`} />
                            <SetupCheckItem configured={setupStatus.ranksCount > 0} label="Ranks" detail={setupStatus.ranksCount > 0 ? `${setupStatus.ranksCount} tiers` : "Not set up"} href={`/dashboard/servers/${id}/ranks`} />
                            <SetupCheckItem configured={setupStatus.shopCount > 0} label="Shop" detail={setupStatus.shopCount > 0 ? `${setupStatus.shopCount} items` : "Empty"} href={`/dashboard/servers/${id}/shop`} />
                            <SetupCheckItem configured={setupStatus.roleMenusCount > 0} label="Role Menus" detail={setupStatus.roleMenusCount > 0 ? `${setupStatus.roleMenusCount} menus` : "None"} href={`/dashboard/servers/${id}/rolemenus`} />
                          </div>
                        </div>
                      )}

                      {/* Quick Admin Actions */}
                      {(perms.isModerator || perms.isAdmin) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {perms.isAdmin && (
                            <button onClick={() => router.push(`/dashboard/servers/${id}/settings`)} className="bg-card rounded-2xl p-4 border border-border hover:border-indigo-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                              <Settings size={20} className="text-primary flex-shrink-0 mt-0.5" />
                              <div><p className="text-foreground text-sm font-medium">Settings</p><p className="text-muted-foreground text-xs">Configure bot</p></div>
                            </button>
                          )}
                          <button onClick={() => router.push(`/dashboard/servers/${id}/members`)} className="bg-card rounded-2xl p-4 border border-border hover:border-blue-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Users size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Members</p><p className="text-muted-foreground text-xs">View & manage</p></div>
                          </button>
                          <button onClick={() => router.push(`/dashboard/servers/${id}/moderation`)} className="bg-card rounded-2xl p-4 border border-border hover:border-rose-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Shield size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Moderation</p><p className="text-muted-foreground text-xs">Tickets & bans</p></div>
                          </button>
                          <button onClick={() => router.push(`/dashboard/servers/${id}/economy`)} className="bg-card rounded-2xl p-4 border border-border hover:border-amber-500/50 transition-all text-left cursor-pointer flex items-start gap-3">
                            <Wallet size={20} className="text-warning flex-shrink-0 mt-0.5" />
                            <div><p className="text-foreground text-sm font-medium">Economy</p><p className="text-muted-foreground text-xs">Coins & shop</p></div>
                          </button>
                        </div>
                      )}
                    </TabsContent>

                    {/* ====== ACTIVITY TAB ====== */}
                    <TabsContent value="activity" className="space-y-6">
                      {/* Currently Studying */}
                      {(perms.isModerator || perms.isAdmin) && (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            <h3 className="text-base font-bold text-foreground">
                              {adminStats?.activeNow.count ?? 0} {(adminStats?.activeNow.count ?? 0) === 1 ? "user" : "users"} studying right now
                            </h3>
                          </div>
                          {!adminStats ? (
                            <div className="p-5 space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <Skeleton className="w-8 h-8 rounded-full" />
                                  <Skeleton className="h-4 flex-1 max-w-[200px]" />
                                  <Skeleton className="h-4 w-16 ml-auto" />
                                </div>
                              ))}
                            </div>
                          ) : adminStats.activeNow.count === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                              <HeadphonesIcon size={32} className="mx-auto mb-2 opacity-40" />
                              <p>No one is currently studying</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-border/30">
                              {adminStats.activeNow.users.map((user) => (
                                <div key={user.userId} className="px-5 py-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                                    {user.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
                                  </div>
                                  <span className="ml-auto text-xs text-emerald-400 font-mono whitespace-nowrap">
                                    {formatDuration(user.startTime)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Server Activity Summary */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard icon={<Clock size={14} />} label="Today" value={formatMinutes(serverStats?.studyTime.todayMinutes ?? 0)} color="text-emerald-400/70" />
                        <StatCard icon={<Clock size={14} />} label="This Week" value={formatMinutes(serverStats?.studyTime.thisWeekMinutes ?? 0)} color="text-blue-400/70" />
                        <StatCard icon={<Clock size={14} />} label="This Month" value={formatMinutes(serverStats?.studyTime.thisMonthMinutes ?? 0)} color="text-indigo-400/70" />
                        <StatCard icon={<Clock size={14} />} label="All Time" value={formatMinutes(serverStats?.studyTime.allTimeMinutes ?? 0)} color="text-purple-400/70" />
                      </div>

                      {/* Your Stats */}
                      <div className="bg-card rounded-2xl border border-border p-5">
                        <h3 className="text-base font-bold text-foreground mb-4">Your Stats in This Server</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Study Time</p>
                            <p className="text-lg font-bold text-emerald-400">{data.you.trackedTimeHours}h</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Coins</p>
                            <p className="text-lg font-bold text-warning">{data.you.coins.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Workouts</p>
                            <p className="text-lg font-bold text-purple-400">{data.you.workoutCount || 0}</p>
                          </div>
                          {data.you.firstJoined && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Joined</p>
                              <p className="text-lg font-bold text-foreground">
                                {new Date(data.you.firstJoined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* ====== LEADERBOARD TAB ====== */}
                    <TabsContent value="leaderboard">
                      <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-5 border-b border-border">
                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Trophy size={18} />
                            Study Time Leaderboard
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                                <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Study Time</th>
                                <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Coins</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.leaderboard.map((entry) => (
                                <tr key={entry.userId} className={`border-b border-border/30 last:border-0 ${entry.isYou ? "bg-primary/10" : "hover:bg-accent"}`}>
                                  <td className="py-3 px-5">
                                    <span className={`font-bold ${entry.rank === 1 ? "text-warning" : entry.rank === 2 ? "text-foreground/80" : entry.rank === 3 ? "text-amber-700" : "text-muted-foreground"}`}>
                                      #{entry.rank}
                                    </span>
                                  </td>
                                  <td className="py-3 px-5">
                                    <span className="text-foreground font-medium">{entry.displayName || `User ...${entry.userId.slice(-4)}`}</span>
                                    {entry.isYou && <span className="ml-2"><Badge variant="info" size="sm">you</Badge></span>}
                                  </td>
                                  <td className="py-3 px-5 text-right"><span className="text-success font-mono">{entry.trackedTimeHours}h</span></td>
                                  <td className="py-3 px-5 text-right"><span className="text-warning font-mono">{entry.coins.toLocaleString()}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {data.leaderboard.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">No study activity yet</div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function SetupCheckItem({ configured, label, detail, href }: { configured: boolean; label: string; detail: string; href: string }) {
  return (
    <Link href={href}>
      <a className="flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
          {configured ? <CheckCircle2 size={20} className="text-success flex-shrink-0" /> : <XCircle size={20} className="text-muted-foreground flex-shrink-0" />}
          <div>
            <p className="text-foreground font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </a>
    </Link>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
