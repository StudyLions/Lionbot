// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-20
// Purpose: Screen-share channels configuration page. Mirrors the
//          Video Channels page but operates on the screen_channels,
//          screen_exempt_roles and screenban_durations tables, plus
//          the screenban_role / screen_grace_period guild_config
//          columns.
//
//          Built for support ticket #0037 ("Study Space - How to
//          completely remove blacklists?") so admins can manage
//          screen-share enforcement (and turn off auto-blacklisting)
//          from the dashboard, instead of needing the slash command.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
import {
  PageHeader,
  SectionCard,
  SettingRow,
  ChannelSelect,
  RoleSelect,
  NumberInput,
  FirstTimeBanner,
  SaveBar,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard, invalidate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import {
  MonitorPlay,
  ShieldAlert,
  ShieldOff,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react"
import ClearBlacklistsModal from "@/components/dashboard/ClearBlacklistsModal"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface ScreenChannelsData {
  screenGracePeriod: number | null
  screenbanRole: string | null
  screenChannelIds: string[]
  exemptRoleIds: string[]
  screenbanDurations: { rowid: number; duration: number }[]
  activeBlacklistCount?: number
}

export default function ScreenChannelsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  const { data: scData, error, isLoading: loading, mutate } = useDashboard<ScreenChannelsData>(
    id && session ? `/api/dashboard/servers/${id}/screenchannels` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"
  const [data, setData] = useState<ScreenChannelsData | null>(null)
  const [original, setOriginal] = useState<ScreenChannelsData | null>(null)
  useEffect(() => {
    if (scData) {
      setData(scData)
      setOriginal({ ...scData })
    } else if (scData === undefined && !loading) {
      setData(null)
      setOriginal(null)
    }
  }, [scData, loading])

  const [saving, setSaving] = useState(false)
  const [clearModalOpen, setClearModalOpen] = useState(false)

  const set = useCallback((updates: Partial<ScreenChannelsData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const hasChanges =
    data &&
    original &&
    (data.screenGracePeriod !== original.screenGracePeriod ||
      data.screenbanRole !== original.screenbanRole ||
      JSON.stringify(data.screenChannelIds?.sort()) !==
        JSON.stringify(original.screenChannelIds?.sort()) ||
      JSON.stringify(data.exemptRoleIds?.sort()) !==
        JSON.stringify(original.exemptRoleIds?.sort()) ||
      JSON.stringify(data.screenbanDurations?.map((d) => d.duration).sort()) !==
        JSON.stringify(original.screenbanDurations?.map((d) => d.duration).sort()))

  const handleSave = async () => {
    if (!data || !original || !hasChanges) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/screenchannels`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenGracePeriod: data.screenGracePeriod,
          screenbanRole: data.screenbanRole,
          screenChannelIds: data.screenChannelIds || [],
          exemptRoleIds: data.exemptRoleIds || [],
          screenbanDurations: data.screenbanDurations?.map((d) => d.duration) || [],
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...data })
      mutate()
      toast.success(
        "Screen channels settings saved — allow 1-2 min for changes to take effect"
      )
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setData({ ...original })
  }

  return (
    <Layout
      SEO={{
        title: `Screen Channels - ${serverName} - LionBot`,
        description:
          "Configure screen-share-required channels and exempt roles",
      }}
    >
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <DashboardShell
            nav={<ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />}
          >
            <PageHeader
              title="Screen Channels"
              description="Set which voice channels require members to share their screen, who is exempt, and (optionally) whether repeat offenders get auto-blacklisted with a role."
            />

            <FirstTimeBanner
              storageKey="screenchannels-intro"
              title="What are Screen Channels?"
              description="Screen channels are voice channels where members must share their screen to stay. LionBot warns members who join without sharing and disconnects them after the grace period. Use exempt roles for members who don't need to share (e.g. accessibility roles)."
              icon={<MonitorPlay size={22} />}
            />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card/50 border border-border rounded-xl p-6 animate-pulse"
                  >
                    <div className="h-5 bg-muted rounded w-1/4 mb-4" />
                    <div className="space-y-3">
                      <div className="h-10 bg-muted rounded" />
                      <div className="h-10 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Unable to load screen channels. You may not have admin permissions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <SectionCard
                  title="Screen-Required Channels"
                  description="Voice channels where members must share their screen"
                  icon={<MonitorPlay size={18} />}
                >
                  <SettingRow
                    label="Channels"
                    description="Select voice channels that require screen sharing. Members not sharing will be warned and disconnected after the grace period."
                  >
                    <ChannelSelect
                      guildId={guildId}
                      value={data.screenChannelIds || []}
                      onChange={(v) =>
                        set({ screenChannelIds: Array.isArray(v) ? v : v ? [v] : [] })
                      }
                      placeholder="Select voice channels"
                      multiple
                      channelTypes={[2]}
                    />
                  </SettingRow>
                </SectionCard>

                <SectionCard
                  title="Exempt Roles"
                  description="Roles that don't need to share screen in screen channels"
                  icon={<ShieldAlert size={18} />}
                >
                  <SettingRow
                    label="Roles"
                    description="Members with these roles can join screen channels without sharing their screen."
                  >
                    <RoleSelect
                      guildId={guildId}
                      value={data.exemptRoleIds || []}
                      onChange={(v) =>
                        set({ exemptRoleIds: Array.isArray(v) ? v : v ? [v] : [] })
                      }
                      placeholder="Select exempt roles"
                      multiple
                    />
                  </SettingRow>
                </SectionCard>

                <SectionCard
                  title="Enforcement"
                  description="How long members get to start sharing before being kicked"
                  icon={<ShieldAlert size={18} />}
                >
                  <SettingRow
                    label="Grace Period"
                    description="Seconds before a member without screen share is disconnected"
                    defaultBadge="90s"
                  >
                    <NumberInput
                      value={data.screenGracePeriod}
                      onChange={(v) => set({ screenGracePeriod: v })}
                      unit="seconds"
                      min={10}
                      max={600}
                      defaultValue={90}
                      allowNull
                    />
                  </SettingRow>
                </SectionCard>

                {/* Auto-Blacklisting card. Mirrors the same card on the Video
                    Channels page. The on/off banner is purely driven by whether
                    `screenbanRole` is set. Built for support ticket #0037. */}
                <SectionCard
                  title="Auto-Blacklisting"
                  description="Optional: automatically punish repeat screen-share offenders"
                  icon={<ShieldOff size={18} />}
                >
                  {data.screenbanRole ? (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 mb-4 flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-emerald-200/90 leading-relaxed">
                        <span className="font-semibold text-emerald-100">
                          Auto-blacklisting is ON.
                        </span>{" "}
                        Repeat offenders will be assigned the role below for the configured
                        duration. Want to disable it? Clear the role selector and save.
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-4 flex items-start gap-2.5">
                      <Info size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                          Auto-blacklisting is OFF.
                        </span>{" "}
                        Members are still kicked from screen-required channels after the grace
                        period, but no role is assigned. To enable, pick a role below.
                      </div>
                    </div>
                  )}

                  {(data.activeBlacklistCount ?? 0) > 0 && (
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-xs leading-relaxed">
                          <div className="text-amber-100 font-semibold">
                            {data.activeBlacklistCount} member
                            {data.activeBlacklistCount === 1 ? " is" : "s are"} currently
                            auto-blacklisted
                          </div>
                          <div className="text-amber-200/80">
                            Pardon them all and remove the role from each member in one click.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setClearModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shrink-0"
                      >
                        <ShieldOff size={14} />
                        Clear all active blacklists
                      </button>
                    </div>
                  )}

                  <SettingRow
                    label="Blacklist Role"
                    description="Role assigned to repeat offenders. Leave empty to disable auto-blacklisting entirely."
                    tooltip="When a member is auto-blacklisted for screen-share violations, they receive this role to restrict channel access. Clear the selector to turn this feature off."
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <RoleSelect
                          guildId={guildId}
                          value={data.screenbanRole}
                          onChange={(v) => set({ screenbanRole: (v as string) || null })}
                          placeholder="Select blacklist role (or leave empty to disable)"
                        />
                      </div>
                      {data.screenbanRole && (
                        <button
                          onClick={() => set({ screenbanRole: null })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground bg-muted hover:bg-accent hover:text-foreground rounded-lg transition-colors"
                          title="Disable auto-blacklisting"
                        >
                          <X size={12} />
                          Disable
                        </button>
                      )}
                    </div>
                  </SettingRow>
                  <SettingRow
                    label="Blacklist Durations"
                    description="How long the role is held for each successive violation (in seconds). First offense uses the first value, second offense uses the second, etc."
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(data.screenbanDurations || []).map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1"
                          >
                            <input
                              type="number"
                              value={d.duration}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                const updated = [...(data.screenbanDurations || [])]
                                updated[i] = { ...updated[i], duration: val }
                                set({ screenbanDurations: updated })
                              }}
                              className="w-20 bg-card border border-border text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              min={1}
                            />
                            <span className="text-muted-foreground text-xs">s</span>
                            <button
                              onClick={() => {
                                const updated = (data.screenbanDurations || []).filter(
                                  (_, j) => j !== i
                                )
                                set({ screenbanDurations: updated })
                              }}
                              className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const last = data.screenbanDurations?.length
                            ? data.screenbanDurations[
                                data.screenbanDurations.length - 1
                              ].duration * 2
                            : 300
                          set({
                            screenbanDurations: [
                              ...(data.screenbanDurations || []),
                              { rowid: 0, duration: last },
                            ],
                          })
                        }}
                        className="flex items-center gap-1 text-sm text-indigo-400 hover:text-primary transition-colors"
                      >
                        <Plus size={14} />
                        Add duration
                      </button>
                    </div>
                  </SettingRow>
                </SectionCard>
              </div>
            )}

            <ClearBlacklistsModal
              open={clearModalOpen}
              onClose={() => setClearModalOpen(false)}
              serverId={guildId}
              serverName={serverName}
              defaultType="SCREEN_BAN"
              activeCounts={{
                STUDY_BAN: 0,
                SCREEN_BAN: data?.activeBlacklistCount ?? 0,
              }}
              onComplete={() => {
                mutate()
                invalidate(`/api/dashboard/servers/${id}/tickets`)
              }}
            />

            <SaveBar
              show={!!hasChanges}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
            />
          </DashboardShell>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
