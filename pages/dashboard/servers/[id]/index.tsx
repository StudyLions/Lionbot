// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server overview - rebuilt with setup checklist and clean design
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { PageHeader, Badge, toast } from "@/components/dashboard/ui"
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

export default function ServerDetail() {
  const { status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<ServerData | null>(null)
  const [perms, setPerms] = useState<Permissions>({ isMember: false, isModerator: false, isAdmin: false })
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && id) {
      Promise.all([
        fetch(`/api/dashboard/servers/${id}`).then((r) => {
          if (!r.ok) throw new Error("Server not found or you're not a member")
          return r.json()
        }),
        fetch(`/api/dashboard/servers/${id}/permissions`).then((r) =>
          r.ok ? r.json() : { isMember: true, isModerator: false, isAdmin: false }
        ),
      ])
        .then(([serverData, permData]) => {
          setData(serverData)
          setPerms(permData)
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [status, id])

  useEffect(() => {
    if (!perms.isAdmin || !id) return
    Promise.all([
      fetch(`/api/dashboard/servers/${id}/ranks`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/shop`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/dashboard/servers/${id}/rolemenus`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([ranksRes, shopRes, rolemenusRes]) => {
      const settingsConfigured =
        !!data?.server.settings &&
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
  }, [perms.isAdmin, id, data?.server?.settings])

  return (
    <Layout
      SEO={{
        title: `${data?.server.name || "Server"} - LionBot Dashboard`,
        description: "Server dashboard",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ServerNav
              serverId={id as string}
              serverName={data?.server.name || (loading ? "Loading..." : "Server")}
              isAdmin={perms.isAdmin}
              isMod={perms.isModerator}
            />

            {loading ? (
              <div className="space-y-4">
                <div className="h-10 w-64 bg-gray-800 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800 rounded-2xl p-5 h-24 animate-pulse" />
                  ))}
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 h-64 animate-pulse" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <XCircle className="mx-auto text-red-400 mb-4" size={48} />
                <p className="text-red-400 text-lg">{error}</p>
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
                      <Link
                        href={`/dashboard/servers/${id}/setup`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                      >
                        <Wand2 size={16} />
                        Run Setup Wizard
                      </Link>
                    )
                  }
                />

                {/* Your Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-emerald-400/70">
                      <Clock size={16} />
                      <span className="text-xs uppercase tracking-wide">Study Time</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{data.you.trackedTimeHours}h</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-amber-400/70">
                      <Coins size={16} />
                      <span className="text-xs uppercase tracking-wide">Coins</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{data.you.coins.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-purple-400/70">
                      <Dumbbell size={16} />
                      <span className="text-xs uppercase tracking-wide">Workouts</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{data.you.workoutCount || 0}</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-cyan-400/70">
                      <Trophy size={16} />
                      <span className="text-xs uppercase tracking-wide">Reward Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.server.settings?.studyHourlyReward ?? 0}
                      <span className="text-sm text-gray-500 ml-1">/hr</span>
                    </p>
                  </div>
                </div>

                {/* Server Setup Checklist (admins only) */}
                {perms.isAdmin && setupStatus && (
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-8">
                    <div className="p-5 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings size={20} />
                        Server Setup
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Configure these to get the most out of LionBot
                      </p>
                    </div>
                    <div className="divide-y divide-gray-700/50">
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
                        className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-indigo-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                      >
                        <Settings size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white text-sm font-medium">Settings</p>
                          <p className="text-gray-500 text-xs">Configure bot</p>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/members`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Users size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Members</p>
                        <p className="text-gray-500 text-xs">View & manage</p>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/moderation`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-rose-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Shield size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Moderation</p>
                        <p className="text-gray-500 text-xs">Tickets & bans</p>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/servers/${id}/economy`)}
                      className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-amber-500/50 transition-all text-left group cursor-pointer flex items-start gap-3"
                    >
                      <Wallet size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Economy</p>
                        <p className="text-gray-500 text-xs">Coins & shop</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Trophy size={20} />
                      Study Time Leaderboard
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Study Time
                          </th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Coins
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.leaderboard.map((entry) => (
                          <tr
                            key={entry.userId}
                            className={`border-b border-gray-700/30 last:border-0 ${
                              entry.isYou ? "bg-indigo-500/10" : "hover:bg-gray-700/30"
                            }`}
                          >
                            <td className="py-3 px-5">
                              <span
                                className={`font-bold ${
                                  entry.rank === 1
                                    ? "text-amber-400"
                                    : entry.rank === 2
                                    ? "text-gray-300"
                                    : entry.rank === 3
                                    ? "text-amber-700"
                                    : "text-gray-500"
                                }`}
                              >
                                #{entry.rank}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <span className="text-white font-medium">
                                {entry.displayName || `User ...${entry.userId.slice(-4)}`}
                              </span>
                              {entry.isYou && (
                                <span className="ml-2">
                                  <Badge variant="info" size="sm">you</Badge>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-emerald-400 font-mono">{entry.trackedTimeHours}h</span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-amber-400 font-mono">
                                {entry.coins.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.leaderboard.length === 0 && (
                      <div className="text-center py-12 text-gray-500">No study activity yet</div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
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
    <Link href={href} className="flex items-center justify-between px-5 py-4 hover:bg-gray-700/30 transition-colors">
      <div className="flex items-center gap-3">
        {configured ? (
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle size={20} className="text-gray-500 flex-shrink-0" />
        )}
        <div>
          <p className="text-white font-medium">{label}</p>
          <p className="text-sm text-gray-400">{detail}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-500" />
    </Link>
  )
}
