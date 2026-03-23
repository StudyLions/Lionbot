// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Full subscription management page -- view and manage
//          paid server premiums (transfer between servers) and
//          LionHeart++ included server premium (apply/transfer).
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { PageHeader, SectionCard, toast } from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import {
  Crown,
  Server,
  ArrowRightLeft,
  ExternalLink,
  Loader2,
  Check,
  AlertTriangle,
  Clock,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface ServerPremiumSub {
  id: number
  guildId: string
  plan: string
  status: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  createdAt: string | null
  transferredAt: string | null
  transferCooldownEnds: string | null
}

interface LionheartPremiumInfo {
  guildId: string | null
  isApplied: boolean
  premiumUntil: string | null
  lastTransferredAt: string | null
  transferCooldownEnds: string | null
}

interface ServerInfo {
  guildId: string
  guildName: string
  iconUrl: string | null
  role: string
  botPresent: boolean
}

export default function SubscriptionsPage() {
  const { data: session } = useSession()

  const [paidSubs, setPaidSubs] = useState<ServerPremiumSub[]>([])
  const [lhPremium, setLhPremium] = useState<LionheartPremiumInfo | null>(null)
  const [canApplyLh, setCanApplyLh] = useState(false)
  const [loading, setLoading] = useState(true)

  const [servers, setServers] = useState<ServerInfo[]>([])
  const [serversLoading, setServersLoading] = useState(true)

  const [userSub, setUserSub] = useState<{
    tier: string
    status: string
    currentPeriodEnd: string | null
  } | null>(null)

  const [transferModalSub, setTransferModalSub] = useState<ServerPremiumSub | null>(null)
  const [transferTarget, setTransferTarget] = useState("")
  const [transferring, setTransferring] = useState(false)

  const [lhApplyTarget, setLhApplyTarget] = useState("")
  const [lhApplying, setLhApplying] = useState(false)
  const [showLhApply, setShowLhApply] = useState(false)

  const [portalLoading, setPortalLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [premRes, subRes] = await Promise.all([
        fetch("/api/subscription/my-server-premiums"),
        fetch("/api/subscription/status"),
      ])
      if (premRes.ok) {
        const data = await premRes.json()
        setPaidSubs(data.paidSubscriptions || [])
        setLhPremium(data.lionheartServerPremium || null)
        setCanApplyLh(data.canApplyLionheart || false)
      }
      if (subRes.ok) {
        const data = await subRes.json()
        setUserSub({
          tier: data.tier || "NONE",
          status: data.status || "INACTIVE",
          currentPeriodEnd: data.currentPeriodEnd || null,
        })
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    fetchData()
    setServersLoading(true)
    fetch("/api/dashboard/servers")
      .then((r) => (r.ok ? r.json() : { servers: [] }))
      .then((data: { servers: ServerInfo[] }) => {
        setServers((data.servers || []).filter((s) => s.botPresent))
      })
      .catch(() => {})
      .finally(() => setServersLoading(false))
  }, [session, fetchData])

  const getServerName = (guildId: string) =>
    servers.find((s) => s.guildId === guildId)?.guildName || `Server ${guildId}`

  const activePaidSubs = paidSubs.filter(
    (s) => s.status === "ACTIVE" || s.status === "CANCELLING" || s.status === "PAST_DUE"
  )

  const availableTransferTargets = (currentGuildId: string) =>
    servers.filter(
      (s) =>
        s.guildId !== currentGuildId &&
        s.role === "admin" &&
        !activePaidSubs.some((sub) => sub.guildId === s.guildId)
    )

  const handleTransfer = async () => {
    if (!transferModalSub || !transferTarget) return
    setTransferring(true)
    try {
      const res = await fetch("/api/subscription/server-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: transferModalSub.id,
          newGuildId: transferTarget,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Transfer failed")
        return
      }
      toast.success(
        `Server premium transferred to ${getServerName(transferTarget)}`
      )
      setTransferModalSub(null)
      fetchData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setTransferring(false)
    }
  }

  const handleLhApply = async () => {
    if (!lhApplyTarget) return
    setLhApplying(true)
    try {
      const res = await fetch("/api/subscription/lionheart-server-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: lhApplyTarget }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to apply server premium")
        return
      }
      toast.success(
        `Server premium applied to ${getServerName(lhApplyTarget)}`
      )
      setShowLhApply(false)
      fetchData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLhApplying(false)
    }
  }

  const handleServerPortal = async (guildId: string) => {
    setPortalLoading(guildId)
    try {
      const res = await fetch("/api/subscription/server-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || "Could not open billing portal")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPortalLoading(null)
    }
  }

  const handleLhPortal = async () => {
    setPortalLoading("lh")
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || "Could not open billing portal")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPortalLoading(null)
    }
  }

  const tierNames: Record<string, string> = {
    LIONHEART: "LionHeart",
    LIONHEART_PLUS: "LionHeart+",
    LIONHEART_PLUS_PLUS: "LionHeart++",
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isCooldownActive = (cd: string | null) => {
    if (!cd) return false
    return new Date(cd) > new Date()
  }

  return (
    <Layout
      SEO={{
        title: "Subscriptions - LionBot Dashboard",
        description: "Manage your LionHeart and server premium subscriptions",
      }}
    >
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Subscriptions"
                description="Manage your LionHeart membership and server premium subscriptions."
                breadcrumbs={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Subscriptions" },
                ]}
              />

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  {/* LionHeart Subscription */}
                  <SectionCard
                    title="LionHeart Membership"
                    icon={<Crown className="h-5 w-5 text-yellow-400" />}
                  >
                    {userSub && userSub.tier !== "NONE" ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                          <div>
                            <div className="text-lg font-bold text-white">
                              {tierNames[userSub.tier] || userSub.tier}
                            </div>
                            <div className="text-sm text-gray-400 mt-0.5">
                              {userSub.status === "ACTIVE"
                                ? `Renews ${formatDate(userSub.currentPeriodEnd)}`
                                : userSub.status === "CANCELLING"
                                ? `Active until ${formatDate(userSub.currentPeriodEnd)}`
                                : userSub.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                userSub.status === "ACTIVE"
                                  ? "bg-green-500/20 text-green-400"
                                  : userSub.status === "CANCELLING"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {userSub.status === "ACTIVE"
                                ? "Active"
                                : userSub.status === "CANCELLING"
                                ? "Cancelling"
                                : userSub.status}
                            </span>
                            <button
                              onClick={handleLhPortal}
                              disabled={portalLoading === "lh"}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                              {portalLoading === "lh" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ExternalLink className="h-3.5 w-3.5" />
                              )}
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-3">
                          You don&apos;t have an active LionHeart subscription.
                        </p>
                        <Link
                          href="/donate"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors"
                        >
                          <Crown className="h-4 w-4" />
                          View Plans
                        </Link>
                      </div>
                    )}
                  </SectionCard>

                  {/* Paid Server Premium Subscriptions */}
                  <SectionCard
                    title="Server Premium Subscriptions"
                    icon={<Server className="h-5 w-5 text-blue-400" />}
                  >
                    {activePaidSubs.length > 0 ? (
                      <div className="space-y-3">
                        {activePaidSubs.map((sub) => {
                          const cooldownActive = isCooldownActive(sub.transferCooldownEnds)
                          return (
                            <div
                              key={sub.id}
                              className="p-4 rounded-lg bg-gray-900/50 border border-gray-700"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Server className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-white">
                                      {getServerName(sub.guildId)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {sub.plan === "YEARLY" ? "Yearly" : "Monthly"} &middot;{" "}
                                      {sub.status === "ACTIVE"
                                        ? `Renews ${formatDate(sub.currentPeriodEnd)}`
                                        : sub.status === "CANCELLING"
                                        ? `Active until ${formatDate(sub.currentPeriodEnd)}`
                                        : "Past Due"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      sub.status === "ACTIVE"
                                        ? "bg-green-500/20 text-green-400"
                                        : sub.status === "CANCELLING"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {sub.status === "ACTIVE"
                                      ? "Active"
                                      : sub.status === "CANCELLING"
                                      ? "Cancelling"
                                      : "Past Due"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const targets = availableTransferTargets(sub.guildId)
                                      if (targets.length > 0) setTransferTarget(targets[0].guildId)
                                      setTransferModalSub(sub)
                                    }}
                                    disabled={cooldownActive || sub.status === "PAST_DUE"}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={
                                      cooldownActive
                                        ? `Cooldown until ${formatDate(sub.transferCooldownEnds)}`
                                        : "Transfer to another server"
                                    }
                                  >
                                    {cooldownActive ? (
                                      <Clock className="h-3.5 w-3.5" />
                                    ) : (
                                      <ArrowRightLeft className="h-3.5 w-3.5" />
                                    )}
                                    Transfer
                                  </button>
                                  <button
                                    onClick={() => handleServerPortal(sub.guildId)}
                                    disabled={portalLoading === sub.guildId}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                                  >
                                    {portalLoading === sub.guildId ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <CreditCard className="h-3.5 w-3.5" />
                                    )}
                                    Billing
                                  </button>
                                </div>
                              </div>
                              {cooldownActive && sub.transferCooldownEnds && (
                                <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  Transfer available {formatDate(sub.transferCooldownEnds)}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-3">
                          You don&apos;t have any active server premium subscriptions.
                        </p>
                        <Link
                          href="/donate#server-premium"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Server className="h-4 w-4" />
                          Get Server Premium
                        </Link>
                      </div>
                    )}
                  </SectionCard>

                  {/* LionHeart++ Included Server Premium */}
                  {lhPremium && (
                    <SectionCard
                      title="LionHeart++ Server Premium"
                      icon={<Crown className="h-5 w-5 text-yellow-400" />}
                    >
                      <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                              <Crown className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div>
                              {lhPremium.isApplied ? (
                                <>
                                  <div className="text-sm font-semibold text-white">
                                    {getServerName(lhPremium.guildId!)}
                                  </div>
                                  <div className="text-xs text-blue-400 font-medium mt-0.5">
                                    Included with LionHeart++
                                    {lhPremium.premiumUntil &&
                                      ` · Until ${formatDate(lhPremium.premiumUntil)}`}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm font-semibold text-white">
                                    Not applied yet
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    Your LionHeart++ includes a free server premium — apply it to any server!
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lhPremium.isApplied && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                Active
                              </span>
                            )}
                            <button
                              onClick={() => {
                                const available = servers.filter(
                                  (s) =>
                                    s.botPresent &&
                                    s.guildId !== lhPremium.guildId
                                )
                                if (available.length > 0) setLhApplyTarget(available[0].guildId)
                                setShowLhApply(true)
                              }}
                              disabled={isCooldownActive(lhPremium.transferCooldownEnds)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {lhPremium.isApplied ? (
                                <>
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                  Transfer
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  Apply Now
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        {isCooldownActive(lhPremium.transferCooldownEnds) && lhPremium.transferCooldownEnds && (
                          <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Transfer available {formatDate(lhPremium.transferCooldownEnds)}
                          </div>
                        )}
                      </div>
                    </SectionCard>
                  )}

                  {/* Buy more server premiums CTA */}
                  {activePaidSubs.length > 0 && (
                    <div className="text-center">
                      <Link
                        href="/donate#server-premium"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Want premium for another server? Purchase on the{" "}
                        <span className="text-blue-400 hover:underline">donate page</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Modal */}
        {transferModalSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">
                Transfer Server Premium
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Move your premium subscription from{" "}
                <span className="text-white font-medium">
                  {getServerName(transferModalSub.guildId)}
                </span>{" "}
                to another server. The old server will lose premium access immediately.
              </p>

              {(() => {
                const targets = availableTransferTargets(transferModalSub.guildId)
                if (targets.length === 0) {
                  return (
                    <div className="text-sm text-yellow-400 flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      No available servers. You need to be an admin of a server
                      with LionBot that doesn&apos;t already have premium.
                    </div>
                  )
                }
                return (
                  <div className="mb-5">
                    <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                      Transfer to:
                    </label>
                    <select
                      value={transferTarget}
                      onChange={(e) => setTransferTarget(e.target.value)}
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                    >
                      {targets.map((s) => (
                        <option key={s.guildId} value={s.guildId}>
                          {s.guildName}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => setTransferModalSub(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={
                    transferring ||
                    !transferTarget ||
                    availableTransferTargets(transferModalSub.guildId).length === 0
                  }
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {transferring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4" />
                  )}
                  Transfer
                </button>
              </div>

              <p className="text-[11px] text-gray-600 mt-3 text-center">
                After transferring, a 7-day cooldown applies before you can transfer again.
              </p>
            </div>
          </div>
        )}

        {/* LH++ Apply/Transfer Modal */}
        {showLhApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">
                {lhPremium?.isApplied ? "Transfer" : "Apply"} LionHeart++ Server Premium
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                {lhPremium?.isApplied
                  ? "Move your included server premium to a different server. The old server will lose the LionHeart++ premium benefit immediately."
                  : "Choose a server to apply your included server premium to."}
              </p>

              {(() => {
                const available = servers.filter(
                  (s) => s.botPresent && s.guildId !== lhPremium?.guildId
                )
                if (available.length === 0) {
                  return (
                    <div className="text-sm text-yellow-400 flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      No available servers found. Make sure LionBot is in the server you want.
                    </div>
                  )
                }
                return (
                  <div className="mb-5">
                    <label className="text-sm text-gray-300 font-medium mb-1.5 block">
                      {lhPremium?.isApplied ? "Transfer to:" : "Apply to:"}
                    </label>
                    <select
                      value={lhApplyTarget}
                      onChange={(e) => setLhApplyTarget(e.target.value)}
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                    >
                      {available.map((s) => (
                        <option key={s.guildId} value={s.guildId}>
                          {s.guildName}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLhApply(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLhApply}
                  disabled={
                    lhApplying ||
                    !lhApplyTarget ||
                    servers.filter((s) => s.botPresent && s.guildId !== lhPremium?.guildId).length === 0
                  }
                  className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {lhApplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {lhPremium?.isApplied ? "Transfer" : "Apply"}
                </button>
              </div>

              {lhPremium?.isApplied && (
                <p className="text-[11px] text-gray-600 mt-3 text-center">
                  After transferring, a 7-day cooldown applies before you can transfer again.
                </p>
              )}
            </div>
          </div>
        )}
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || "en", ["common"])),
  },
})
