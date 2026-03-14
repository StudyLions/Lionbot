// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Schedule configuration page
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
  SaveBar,
  FirstTimeBanner,
  toast,
} from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import { Calendar, Clock } from "lucide-react"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

interface ScheduleData {
  lobby_channel: string | null
  room_channel: string | null
  schedule_cost: number | null
  reward: number | null
  bonus_reward: number | null
  min_attendance: number | null
  blacklist_role: string | null
  blacklist_after: number | null
  schedule_channels: { channelid: string }[]
}

const DEFAULTS: ScheduleData = {
  lobby_channel: null,
  room_channel: null,
  schedule_cost: null,
  reward: null,
  bonus_reward: null,
  min_attendance: null,
  blacklist_role: null,
  blacklist_after: null,
  schedule_channels: [],
}

function isConfigured(data: ScheduleData): boolean {
  return !!(data.lobby_channel || data.room_channel || data.schedule_cost != null || data.reward != null)
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data: scheduleData, isLoading: loading, mutate } = useDashboard<ScheduleData>(
    id && session ? `/api/dashboard/servers/${id}/schedule` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const serverName = serverData?.server?.name || "Server"
  const [data, setData] = useState<ScheduleData | null>(null)
  const [original, setOriginal] = useState<ScheduleData | null>(null)
  useEffect(() => {
    if (scheduleData) {
      setData(scheduleData)
      setOriginal({ ...scheduleData })
    } else if (scheduleData === undefined && !loading) {
      setData(null)
      setOriginal(null)
    }
  }, [scheduleData, loading])
  // --- END AI-MODIFIED ---
  const [saving, setSaving] = useState(false)

  const set = useCallback((key: keyof ScheduleData, value: unknown) => {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const hasChanges = data && original && JSON.stringify(data) !== JSON.stringify(original)

  const handleSave = async () => {
    if (!data || !original || !hasChanges) return
    setSaving(true)
    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: include schedule_channels in save payload
    const changes: Record<string, unknown> = {}
    for (const key of Object.keys(data) as (keyof ScheduleData)[]) {
      if (key === "schedule_channels") {
        if (JSON.stringify(data[key]) !== JSON.stringify(original[key])) {
          changes.schedule_channels = data.schedule_channels
        }
        continue
      }
      if (JSON.stringify(data[key]) !== JSON.stringify(original[key])) {
        changes[key] = data[key]
      }
    }
    // --- END AI-MODIFIED ---
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error("Save failed")
      const updated = await res.json()
      setData(updated)
      setOriginal({ ...updated })
      mutate()
      toast.success("Schedule settings saved successfully")
    } catch {
      toast.error("Failed to save. Check your permissions (admin required).")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setData({ ...original })
  }

  return (
    <Layout SEO={{ title: `Schedule - ${serverName} - LionBot`, description: "Schedule configuration" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Schedule"
                description="Configure scheduled study sessions. Members can book time slots, pay coins to reserve, and earn rewards for attending. Set the lobby and room channels, plus rewards and attendance rules."
              />

              {!loading && data && !isConfigured(data) && (
                <FirstTimeBanner
                  storageKey="schedule_config"
                  title="What are scheduled sessions?"
                  description="Scheduled sessions let members book study time slots in advance. They pay coins to reserve a slot, then join a lobby channel when it's time. If they attend, they get their coins back plus rewards. Configure the lobby and room channels below to get started."
                  icon={<Calendar size={22} />}
                />
              )}

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 border border-border rounded-xl p-6 animate-pulse">
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
                  <p className="text-muted-foreground">Unable to load schedule settings. You may not have moderator permissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SectionCard
                    title="Session Channels"
                    description="Where members wait and where sessions are held"
                    icon={<Clock size={18} />}
                  >
                    <SettingRow
                      label="Lobby Channel"
                      description="Where members wait before joining a session"
                      tooltip="Members join this voice channel when their session time arrives. They wait here until they're moved to the session room."
                    >
                      <ChannelSelect
                        guildId={guildId}
                        value={data.lobby_channel}
                        onChange={(v) => set("lobby_channel", (v as string) || null)}
                        channelTypes={[2]}
                        placeholder="Select lobby channel"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Session Room"
                      description="Where the actual study session takes place"
                      tooltip="After the lobby, members are moved to this voice channel for the study session. Attendance is tracked here."
                    >
                      <ChannelSelect
                        guildId={guildId}
                        value={data.room_channel}
                        onChange={(v) => set("room_channel", (v as string) || null)}
                        channelTypes={[2]}
                        placeholder="Select session room"
                      />
                    </SettingRow>
                    {/* --- AI-MODIFIED (2026-03-13) --- */}
                    {/* Purpose: added schedule_channels multi-select editor */}
                    <SettingRow
                      label="Schedule Channels"
                      description="Voice channels where scheduled sessions can take place"
                      tooltip="Select which voice channels are available for scheduled study sessions. Members will be able to book sessions in these channels."
                    >
                      <ChannelSelect
                        guildId={guildId}
                        value={data.schedule_channels.map((ch) => ch.channelid)}
                        onChange={(v) => {
                          const ids = Array.isArray(v) ? v : v ? [v] : []
                          set("schedule_channels", ids.map((channelid: string) => ({ channelid })))
                        }}
                        channelTypes={[2]}
                        multiple
                        placeholder="Select schedule channels"
                      />
                    </SettingRow>
                    {/* --- END AI-MODIFIED --- */}
                  </SectionCard>

                  <SectionCard
                    title="Rewards"
                    description="Coins for booking and attending"
                    icon={<Calendar size={18} />}
                  >
                    <SettingRow
                      label="Booking Cost"
                      description="Coins to book a session slot"
                      tooltip="Members pay this amount when they reserve a slot. They get it back (plus rewards) if they attend."
                    >
                      <NumberInput
                        value={data.schedule_cost}
                        onChange={(v) => set("schedule_cost", v)}
                        unit="coins"
                        min={0}
                        allowNull
                      />
                    </SettingRow>
                    <SettingRow
                      label="Attendance Reward"
                      description="Coins earned for attending a booked session"
                      tooltip="Members who show up for their session receive this reward on top of their refunded booking cost."
                    >
                      <NumberInput
                        value={data.reward}
                        onChange={(v) => set("reward", v)}
                        unit="coins"
                        min={0}
                        allowNull
                      />
                    </SettingRow>
                    <SettingRow
                      label="Full Group Bonus"
                      description="Extra coins when every booked member shows up"
                      tooltip="If all members who booked a session attend, everyone gets this bonus on top of the attendance reward."
                    >
                      <NumberInput
                        value={data.bonus_reward}
                        onChange={(v) => set("bonus_reward", v)}
                        unit="coins"
                        min={0}
                        allowNull
                      />
                    </SettingRow>
                  </SectionCard>

                  <SectionCard
                    title="Attendance Rules"
                    description="Minimum attendance and blacklist settings"
                    icon={<Clock size={18} />}
                  >
                    <SettingRow
                      label="Minimum Attendance"
                      description="Minimum members required for a session to count"
                      tooltip="If fewer than this many members attend, the session may not count for rewards. Set to 1 to allow solo sessions."
                    >
                      <NumberInput
                        value={data.min_attendance}
                        onChange={(v) => set("min_attendance", v)}
                        min={1}
                        allowNull
                        placeholder="e.g. 2"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Blacklist Role"
                      description="Role to assign after too many no-shows"
                      tooltip="Members who miss sessions repeatedly get this role, which can restrict their ability to book future sessions."
                    >
                      <RoleSelect
                        guildId={guildId}
                        value={data.blacklist_role}
                        onChange={(v) => set("blacklist_role", (v as string) || null)}
                        placeholder="Select blacklist role"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Blacklist After"
                      description="Number of no-shows before blacklist"
                      tooltip="After this many missed sessions without attending, a member receives the blacklist role."
                    >
                      <NumberInput
                        value={data.blacklist_after}
                        onChange={(v) => set("blacklist_after", v)}
                        min={1}
                        allowNull
                        placeholder="e.g. 3"
                      />
                    </SettingRow>
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

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add getServerSideProps for i18n serverSideTranslations
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
// --- END AI-MODIFIED ---
