// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Video channels configuration page
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: DashboardShell layout migration
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
// --- END AI-MODIFIED ---
// --- AI-MODIFIED (2026-03-24) ---
// Purpose: Removed unused Badge import (dead code cleanup)
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
// --- END AI-MODIFIED ---
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { Video, ShieldAlert, Plus, X } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface VideoChannelsData {
  videoGracePeriod: number | null
  studybanRole: string | null
  videoChannelIds: string[]
  exemptRoleIds: string[]
  studybanDurations: { rowid: number; duration: number }[]
}

export default function VideoChannelsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: vcData, error, isLoading: loading, mutate } = useDashboard<VideoChannelsData>(
    id && session ? `/api/dashboard/servers/${id}/videochannels` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"
  const [data, setData] = useState<VideoChannelsData | null>(null)
  const [original, setOriginal] = useState<VideoChannelsData | null>(null)
  useEffect(() => {
    if (vcData) {
      setData(vcData)
      setOriginal({ ...vcData })
    } else if (vcData === undefined && !loading) {
      setData(null)
      setOriginal(null)
    }
  }, [vcData, loading])
  // --- END AI-MODIFIED ---
  const [saving, setSaving] = useState(false)

  const set = useCallback((updates: Partial<VideoChannelsData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: include studybanRole and studybanDurations in change detection
  const hasChanges =
    data &&
    original &&
    (data.videoGracePeriod !== original.videoGracePeriod ||
      data.studybanRole !== original.studybanRole ||
      JSON.stringify(data.videoChannelIds?.sort()) !== JSON.stringify(original.videoChannelIds?.sort()) ||
      JSON.stringify(data.exemptRoleIds?.sort()) !== JSON.stringify(original.exemptRoleIds?.sort()) ||
      JSON.stringify(data.studybanDurations?.map(d => d.duration).sort()) !== JSON.stringify(original.studybanDurations?.map(d => d.duration).sort()))
  // --- END AI-MODIFIED ---

  const handleSave = async () => {
    if (!data || !original || !hasChanges) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/videochannels`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // --- AI-MODIFIED (2026-03-13) ---
        // Purpose: include studybanRole and studybanDurations in save
        body: JSON.stringify({
          videoGracePeriod: data.videoGracePeriod,
          studybanRole: data.studybanRole,
          videoChannelIds: data.videoChannelIds || [],
          exemptRoleIds: data.exemptRoleIds || [],
          studybanDurations: data.studybanDurations?.map(d => d.duration) || [],
        }),
        // --- END AI-MODIFIED ---
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...data })
      mutate()
      toast.success("Video channels settings saved")
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
        title: `Video Channels - ${serverName} - LionBot`,
        description: "Configure video-required channels and exempt roles",
      }}
    >
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
        {/* --- AI-REPLACED (2026-03-24) ---
            Reason: Migrate to DashboardShell for consistent layout
            --- Original code (commented out for rollback) ---
            <div className="min-h-screen bg-background pt-6 pb-20 px-4">
              <div className="max-w-5xl mx-auto flex gap-8">
                <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />
                <div className="flex-1 min-w-0">
            --- End original code --- */}
        <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />}>
        {/* --- END AI-REPLACED --- */}
              <PageHeader
                title="Video Channels"
                description="Configure which voice channels require members to have their camera on. Members without camera get a grace period before being disconnected. Exempt roles skip this requirement."
              />

              <FirstTimeBanner
                storageKey="videochannels-intro"
                title="What are Video Channels?"
                description="Video channels are voice channels where members must have their camera on to stay. LionBot warns members who join without camera and disconnects them after the grace period. Use exempt roles for members who don't need to show camera (e.g. accessibility roles)."
                icon={<Video size={22} />}
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
                    Unable to load video channels. You may not have moderator permissions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SectionCard
                    title="Video-Required Channels"
                    description="Voice channels where members must have camera on"
                    icon={<Video size={18} />}
                  >
                    <SettingRow
                      label="Channels"
                      description="Select voice channels that require camera. Members without camera will be warned and disconnected after the grace period."
                    >
                      <ChannelSelect
                        guildId={guildId}
                        value={data.videoChannelIds || []}
                        onChange={(v) => set({ videoChannelIds: Array.isArray(v) ? v : v ? [v] : [] })}
                        placeholder="Select voice channels"
                        multiple
                        channelTypes={[2]}
                      />
                    </SettingRow>
                  </SectionCard>

                  <SectionCard
                    title="Exempt Roles"
                    description="Roles that don't need to show camera in video channels"
                    icon={<ShieldAlert size={18} />}
                  >
                    <SettingRow
                      label="Roles"
                      description="Members with these roles can join video channels without turning on their camera."
                    >
                      <RoleSelect
                        guildId={guildId}
                        value={data.exemptRoleIds || []}
                        onChange={(v) => set({ exemptRoleIds: Array.isArray(v) ? v : v ? [v] : [] })}
                        placeholder="Select exempt roles"
                        multiple
                      />
                    </SettingRow>
                  </SectionCard>

                  <SectionCard
                    title="Enforcement"
                    description="Grace period and study ban durations"
                    icon={<ShieldAlert size={18} />}
                  >
                    <SettingRow
                      label="Grace Period"
                      description="Seconds before a member without camera is disconnected"
                      defaultBadge="90s"
                    >
                      <NumberInput
                        value={data.videoGracePeriod}
                        onChange={(v) => set({ videoGracePeriod: v })}
                        unit="seconds"
                        min={10}
                        max={600}
                        defaultValue={90}
                        allowNull
                      />
                    </SettingRow>
                    {/* --- AI-MODIFIED (2026-03-13) --- */}
                    {/* Purpose: added studyban role selector and editable durations */}
                    <SettingRow
                      label="Study Ban Role"
                      description="Role assigned to members who get study-banned"
                      tooltip="When a member is study-banned for camera violations, they receive this role to restrict channel access."
                    >
                      <RoleSelect
                        guildId={guildId}
                        value={data.studybanRole}
                        onChange={(v) => set({ studybanRole: (v as string) || null })}
                        placeholder="Select studyban role"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Study Ban Durations"
                      description="Ban durations for each successive violation (in seconds). First offense uses the first value, second offense uses the second, etc."
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(data.studybanDurations || []).map((d, i) => (
                            <div key={i} className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                              <input
                                type="number"
                                value={d.duration}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  const updated = [...(data.studybanDurations || [])]
                                  updated[i] = { ...updated[i], duration: val }
                                  set({ studybanDurations: updated })
                                }}
                                className="w-20 bg-card border border-border text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                min={1}
                              />
                              <span className="text-muted-foreground text-xs">s</span>
                              <button
                                onClick={() => {
                                  const updated = (data.studybanDurations || []).filter((_, j) => j !== i)
                                  set({ studybanDurations: updated })
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
                            const last = data.studybanDurations?.length
                              ? data.studybanDurations[data.studybanDurations.length - 1].duration * 2
                              : 300
                            set({
                              studybanDurations: [
                                ...(data.studybanDurations || []),
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
                    {/* --- END AI-MODIFIED --- */}
                  </SectionCard>
                </div>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
              />
        {/* --- AI-REPLACED (2026-03-24) --- Original: </div></div></div> --- */}
        </DashboardShell>
        {/* --- END AI-REPLACED --- */}
      </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
