// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server overview - rebuilt with setup checklist and clean design
// ============================================================
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add period filter tabs to leaderboard, server activity summary cards
// --- END AI-MODIFIED ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Clock,
  Coins,
  Trophy,
  Dumbbell,
  Settings,
  Users,
  Shield,
  Wallet,
  Wand2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react"

interface ServerData {
  server: {
    id: string
    name: string
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

export default function ServerDetail() {
  const { status } = useSession()
  const router = useRouter()
  const { id } = router.query
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
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
  const perms = permsData ?? { isMember: false, isModerator: false, isAdmin: false }
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"today" | "week" | "month" | "all">("all")
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
        const ranksCount =
          (ranksRes?.xpRanks?.length || 0) +
          (ranksRes?.voiceRanks?.length || 0) +
          (ranksRes?.msgRanks?.length || 0)
        const shopCount = shopRes?.items?.length || 0
        const roleMenusCount = rolemenusRes?.menus?.length || 0
        setSetupStatus({
          settings: settingsConfigured,
          ranksCount,
          shopCount,
          roleMenusCount,
        })
      })
      .catch(() => toast.error("Failed to load setup status"))
  }, [perms.isAdmin, id, data?.server?.settings])
  // --- END AI-MODIFIED ---

  return (
    <Layout
      SEO={{
        title: `${data?.server.name || "Server"} - LionBot Dashboard`,
        description: "Server dashboard",
      }}
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
                <div className="h-10 w-64 bg-card rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-5 h-24 animate-pulse" />
                  ))}
                </div>
                <div className="bg-card rounded-2xl p-6 h-64 animate-pulse" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <XCircle className="mx-auto text-destructive mb-4" size={48} />
                <p className="text-destructive text-lg">{error}</p>
              </div>
            ) : data ? (
              <>
                <PageHeader
                  title={data.server.name}
                  description="Overview of your server stats and leaderboard"
                  breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Servers", href: "/dashboard/servers" },
                    { label: data.server.name },
                  ]}
                  actions={
                    perms.isAdmin && (
                      <Link href={`/dashboard/servers/${id}/setup`}>
                        <a className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-foreground text-sm font-medium transition-colors">
                          <Wand2 size={16} />
                          Run Setup Wizard
                        </a>
                      </Link>
                    )
                  }
                />

                {/* Server Activity Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatMinutes(serverStats?.studyTime.todayMinutes ?? 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatMinutes(serverStats?.studyTime.thisWeekMinutes ?? 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatMinutes(serverStats?.studyTime.thisMonthMinutes ?? 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">All Time</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatMinutes(serverStats?.studyTime.allTimeMinutes ?? 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Your Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-card rounded-2xl p-5 border border-border/50">
                    <div className="flex items-center gap-2 text-success/70">
                      <Clock size={16} />
                      <span className="text-xs uppercase tracking-wide">Study Time</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-1">{data.you.trackedTimeHours}h</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 border border-border/50">
                    <div className="flex items-center gap-2 text-warning/70">
                      <Coins size={16} />
                      <span className="text-xs uppercase tracking-wide">Coins</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-1">{data.you.coins.toLocaleString()}</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 border border-border/50">
                    <div className="flex items-center gap-2 text-purple-400/70">
                      <Dumbbell size={16} />
                      <span className="text-xs uppercase tracking-wide">Workouts</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-1">{data.you.workoutCount || 0}</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 border border-border/50">
                    <div className="flex items-center gap-2 text-cyan-400/70">
                      <Trophy size={16} />
                      <span className="text-xs uppercase tracking-wide">Reward Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {data.server.settings?.studyHourlyReward ?? 0}
                      <span className="text-sm text-muted-foreground ml-1">/hr</span>
                    </p>
                  </div>
                </div>

                {/* Server Setup Checklist (admins only) */}
                {perms.isAdmin && setupStatus && (
                  <div className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
                    <div className="p-5 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Settings size={20} />
                        Server Setup
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure these to get the most out of LionBot
                      </p>
                    </div>
                    <div className="divide-y divide-border/50">
                      <SetupCheckItem
                        configured={setupStatus.settings}
                        label="Settings"
                        detail={setupStatus.settings ? "Configured" : "Not configured"}
                        href={`/dashboard/servers/${id}/settings`}
                      />
                      <SetupCheckItem
                        configured={setupStatus.ranksCount > 0}
                        label="Ranks"
                        detail={
                          setupStatus.ranksCount > 0
                            ? `${setupStatus.ranksCount} tiers`
                            : "Not set up"
                        }
                        href={`/dashboard/servers/${id}/ranks`}
                      />
                      <SetupCheckItem
                        configured={setupStatus.shopCount > 0}
                        label="Shop"
                        detail={
                          setupStatus.shopCount > 0
                            ? `${setupStatus.shopCount} items`
                            : "Empty"
                        }
                        href={`/dashboard/servers/${id}/shop`}
                      />
                      <SetupCheckItem
                        configured={setupStatus.roleMenusCount > 0}
                        label="Role Menus"
                        detail={
                          setupStatus.roleMenusCount > 0
                            ? `${setupStatus.roleMenusCount} menus`
                            : "None"
                        }
                        href={`/dashboard/servers/${id}/rolemenus`}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Admin Actions */}
                {(perms.isModerator || perms.isAdmin) && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {perms.isAdmin && (
                      <button
                        onClick={() => router.push(`/dashboard/servers/${id}/settings`)}
                        className="bg-card rounded-2xl p-4 border border-border hover:border-indigo-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                      >
                        <Settings size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground text-sm font-medium">Settings</p>
                          <p className="text-muted-foreground text-xs">Configure bot</p>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/members`)}
                      className="bg-card rounded-2xl p-4 border border-border hover:border-blue-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Users size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground text-sm font-medium">Members</p>
                        <p className="text-muted-foreground text-xs">View & manage</p>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/moderation`)}
                      className="bg-card rounded-2xl p-4 border border-border hover:border-rose-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Shield size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground text-sm font-medium">Moderation</p>
                        <p className="text-muted-foreground text-xs">Tickets & bans</p>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/economy`)}
                      className="bg-card rounded-2xl p-4 border border-border hover:border-amber-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Wallet size={20} className="text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground text-sm font-medium">Economy</p>
                        <p className="text-muted-foreground text-xs">Coins & shop</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Trophy size={20} />
                      Study Time Leaderboard
                    </h3>
                    <Tabs value={leaderboardPeriod} onValueChange={(v) => setLeaderboardPeriod(v as typeof leaderboardPeriod)}>
                      <TabsList className="bg-muted">
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="month">This Month</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Member
                          </th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Study Time
                          </th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Coins
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.leaderboard.map((entry) => (
                          <tr
                            key={entry.userId}
                            className={`border-b border-border/30 last:border-0 ${
                              entry.isYou ? "bg-primary/10" : "hover:bg-accent"
                            }`}
                          >
                            <td className="py-3 px-5">
                              <span
                                className={`font-bold ${
                                  entry.rank === 1
                                    ? "text-warning"
                                    : entry.rank === 2
                                    ? "text-foreground/80"
                                    : entry.rank === 3
                                    ? "text-amber-700"
                                    : "text-muted-foreground"
                                }`}
                              >
                                #{entry.rank}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <span className="text-foreground font-medium">
                                {entry.displayName || `User ...${entry.userId.slice(-4)}`}
                              </span>
                              {entry.isYou && (
                                <span className="ml-2">
                                  <Badge variant="info" size="sm">you</Badge>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-success font-mono">{entry.trackedTimeHours}h</span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-warning font-mono">
                                {entry.coins.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.leaderboard.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No study activity yet</div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

function SetupCheckItem({
  configured,
  label,
  detail,
  href,
}: {
  configured: boolean
  label: string
  detail: string
  href: string
}) {
  return (
    <Link href={href}>
      <a className="flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
          {configured ? (
            <CheckCircle2 size={20} className="text-success flex-shrink-0" />
          ) : (
            <XCircle size={20} className="text-muted-foreground flex-shrink-0" />
          )}
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
