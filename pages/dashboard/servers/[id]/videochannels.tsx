// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Video channels configuration page
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  PageHeader,
  SectionCard,
  SettingRow,
  ChannelSelect,
  RoleSelect,
  NumberInput,
  Badge,
  FirstTimeBanner,
  SaveBar,
  toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { Video, ShieldAlert } from "lucide-react"

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
  const [data, setData] = useState<VideoChannelsData | null>(null)
  const [original, setOriginal] = useState<VideoChannelsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverName, setServerName] = useState("")

  const fetchData = useCallback(async () => {
    if (!id || !session) return
    try {
      const [videoRes, serverRes] = await Promise.all([
        fetch(`/api/dashboard/servers/${id}/videochannels`),
        fetch(`/api/dashboard/servers/${id}`),
      ])
      if (videoRes.ok) {
        const d = await videoRes.json()
        setData(d)
        setOriginal(d)
      }
      const serverData = await serverRes.json()
      setServerName(serverData.server?.name || "Server")
    } catch {}
    setLoading(false)
  }, [id, session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const set = useCallback((updates: Partial<VideoChannelsData>) => {
    setData((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const hasChanges =
    data &&
    original &&
    (data.videoGracePeriod !== original.videoGracePeriod ||
      JSON.stringify(data.videoChannelIds?.sort()) !== JSON.stringify(original.videoChannelIds?.sort()) ||
      JSON.stringify(data.exemptRoleIds?.sort()) !== JSON.stringify(original.exemptRoleIds?.sort()))

  const handleSave = async () => {
    if (!data || !original || !hasChanges) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/videochannels`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoGracePeriod: data.videoGracePeriod,
          videoChannelIds: data.videoChannelIds || [],
          exemptRoleIds: data.exemptRoleIds || [],
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...data })
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
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <div className="flex-1 min-w-0">
              <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />

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
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse"
                    >
                      <div className="h-5 bg-gray-700 rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-10 bg-gray-700 rounded" />
                        <div className="h-10 bg-gray-700 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !data ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">
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
                    {data.studybanDurations && data.studybanDurations.length > 0 && (
                      <SettingRow
                        label="Study Ban Durations"
                        description="Configured ban durations for repeat camera violations"
                      >
                        <div className="flex flex-wrap gap-2">
                          {data.studybanDurations.map((d) => (
                            <Badge key={d.rowid} variant="info">
                              {`${d.duration}s`}
                            </Badge>
                          ))}
                        </div>
                      </SettingRow>
                    )}
                  </SectionCard>
                </div>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
