// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Server settings page - fully rebuilt with shared UI components
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  SectionCard, SettingRow, Toggle, NumberInput, TextInput,
  SearchSelect, ChannelSelect, SaveBar, PageHeader, toast,
} from "@/components/dashboard/ui"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback } from "react"
import {
  BookOpen, Coins, CheckSquare, Lock, Users, Trophy,
  Shield, Globe, MessageSquare, Dumbbell
} from "lucide-react"

const TIMEZONE_OPTIONS = [
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
  "America/Mexico_City", "Africa/Cairo", "Asia/Jerusalem", "UTC",
].map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))

const LOCALE_OPTIONS = [
  { value: "en_GB", label: "English" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "he_IL", label: "Hebrew" },
  { value: "tr", label: "Turkish" },
]

const RANK_TYPE_OPTIONS = [
  { value: "XP", label: "XP (Combined)" },
  { value: "VOICE", label: "Voice Time" },
  { value: "MESSAGE", label: "Messages" },
]

const DEFAULTS: Record<string, any> = {
  study_hourly_reward: 100,
  study_hourly_live_bonus: 25,
  daily_study_cap: null,
  starting_funds: 0,
  allow_transfers: true,
  coins_per_centixp: 50,
  max_tasks: 20,
  task_reward: 50,
  task_reward_limit: 10,
  renting_price: 1000,
  renting_cap: 25,
  renting_visible: true,
  accountability_price: 100,
  accountability_reward: 200,
  accountability_bonus: 200,
  rank_type: "XP",
  dm_ranks: true,
  xp_per_period: 5,
  video_studyban: true,
  video_grace_period: 90,
  persist_roles: false,
  timezone: "UTC",
  locale: "en_GB",
  force_locale: false,
  min_workout_length: 10,
  workout_reward: 50,
}

export default function ServerSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [original, setOriginal] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id && session) {
      fetch(`/api/dashboard/servers/${id}/config`)
        .then((r) => {
          if (!r.ok) throw new Error(r.status === 403 ? "You're not an admin of this server" : "Failed to load")
          return r.json()
        })
        .then((data) => {
          setConfig(data)
          setOriginal({ ...data })
        })
        .catch(() => setConfig(null))
        .finally(() => setLoading(false))
    }
  }, [id, session])

  const set = useCallback((key: string, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const hasChanges = config && original && JSON.stringify(config) !== JSON.stringify(original)

  const handleSave = async () => {
    if (!config || !original || !hasChanges) return
    setSaving(true)
    const changes: Record<string, any> = {}
    for (const key of Object.keys(config)) {
      if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
        changes[key] = config[key]
      }
    }
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error("Save failed")
      setOriginal({ ...config })
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setConfig({ ...original })
  }

  const guildId = id as string

  return (
    <Layout SEO={{ title: `Settings - ${config?.name || "Server"} - LionBot`, description: "Server settings" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <div className="flex-1 min-w-0">
              <ServerNav serverId={guildId} serverName={config?.name || "..."} isAdmin isMod />

              <PageHeader
                title="Server Settings"
                description="Configure how LionBot works in your server. Changes are saved when you click Save. Hover over the question mark icons for more details about each setting."
              />

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse">
                      <div className="h-5 bg-gray-700 rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-10 bg-gray-700 rounded" />
                        <div className="h-10 bg-gray-700 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !config ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">Unable to load settings. You may not have admin permissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Study Rewards */}
                  <SectionCard
                    title="Study Rewards"
                    description="Control how members earn coins from studying"
                    icon={<BookOpen size={18} />}
                  >
                    <SettingRow
                      label="Hourly Reward"
                      description="How many coins a member earns for each hour of study time"
                      tooltip="Members receive this amount of coins for every hour they spend in a voice study channel. Higher values encourage more study time."
                      defaultBadge={String(DEFAULTS.study_hourly_reward)}
                    >
                      <NumberInput value={config.study_hourly_reward} onChange={(v) => set("study_hourly_reward", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_reward} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Camera Bonus"
                      description="Extra coins per hour when studying with camera on"
                      tooltip="Members who turn on their camera while studying earn this bonus on top of the hourly reward. Great for accountability."
                      defaultBadge={String(DEFAULTS.study_hourly_live_bonus)}
                    >
                      <NumberInput value={config.study_hourly_live_bonus} onChange={(v) => set("study_hourly_live_bonus", v)} unit="coins/hr" min={0} defaultValue={DEFAULTS.study_hourly_live_bonus} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Daily Study Cap"
                      description="Maximum hours of study that earn rewards per day"
                      tooltip="After this many hours of study in a day, members stop earning coins. Leave empty for no limit. Prevents coin inflation."
                      defaultBadge="No limit"
                    >
                      <NumberInput value={config.daily_study_cap} onChange={(v) => set("daily_study_cap", v)} unit="hours" min={1} placeholder="No limit" allowNull />
                    </SettingRow>
                  </SectionCard>

                  {/* Economy */}
                  <SectionCard
                    title="Economy"
                    description="Manage the server's coin economy"
                    icon={<Coins size={18} />}
                  >
                    <SettingRow
                      label="Starting Coins"
                      description="Coins given to new members when they join"
                      tooltip="Every new member starts with this many coins. Set to 0 if you want members to earn everything from scratch."
                      defaultBadge={String(DEFAULTS.starting_funds)}
                    >
                      <NumberInput value={config.starting_funds} onChange={(v) => set("starting_funds", v)} unit="coins" min={0} defaultValue={DEFAULTS.starting_funds} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Allow Transfers"
                      description="Let members send coins to each other"
                      tooltip="When enabled, members can use the /transfer command to give coins to other members. Disable if you want a closed economy."
                    >
                      <Toggle checked={config.allow_transfers ?? true} onChange={(v) => set("allow_transfers", v)} />
                    </SettingRow>
                    <SettingRow
                      label="Coins per 100 XP"
                      description="How many coins 100 XP is worth"
                      tooltip="This sets the conversion rate between XP and coins. Higher values make coins easier to earn. XP is earned through voice study and text activity."
                      defaultBadge={String(DEFAULTS.coins_per_centixp)}
                    >
                      <NumberInput value={config.coins_per_centixp} onChange={(v) => set("coins_per_centixp", v)} unit="coins" min={0} defaultValue={DEFAULTS.coins_per_centixp} allowNull />
                    </SettingRow>
                  </SectionCard>

                  {/* Tasks */}
                  <SectionCard
                    title="Tasks"
                    description="Task completion rewards and limits"
                    icon={<CheckSquare size={18} />}
                  >
                    <SettingRow
                      label="Max Tasks"
                      description="Maximum number of tasks a member can have at once"
                      tooltip="Limits how many to-do items each member can create. Prevents list clutter."
                      defaultBadge={String(DEFAULTS.max_tasks)}
                    >
                      <NumberInput value={config.max_tasks} onChange={(v) => set("max_tasks", v)} min={1} max={100} defaultValue={DEFAULTS.max_tasks} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Task Reward"
                      description="Coins earned when a member completes a task"
                      tooltip="Each time a member marks a task as complete, they receive this many coins."
                      defaultBadge={String(DEFAULTS.task_reward)}
                    >
                      <NumberInput value={config.task_reward} onChange={(v) => set("task_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.task_reward} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Daily Reward Limit"
                      description="Max task rewards a member can earn per day"
                      tooltip="Prevents members from farming coins by creating and completing many small tasks."
                      defaultBadge={String(DEFAULTS.task_reward_limit)}
                    >
                      <NumberInput value={config.task_reward_limit} onChange={(v) => set("task_reward_limit", v)} min={0} defaultValue={DEFAULTS.task_reward_limit} allowNull />
                    </SettingRow>
                  </SectionCard>

                  {/* Private Rooms */}
                  <SectionCard
                    title="Private Rooms"
                    description="Settings for rentable private study rooms"
                    icon={<Lock size={18} />}
                  >
                    <SettingRow
                      label="Daily Rent"
                      description="Coins it costs to rent a private room per day"
                      tooltip="Members pay this amount daily to keep their private study room. The room is auto-deleted when they run out of coins."
                      defaultBadge={String(DEFAULTS.renting_price)}
                    >
                      <NumberInput value={config.renting_price} onChange={(v) => set("renting_price", v)} unit="coins/day" min={0} defaultValue={DEFAULTS.renting_price} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Max Members"
                      description="Maximum people allowed in a private room"
                      defaultBadge={String(DEFAULTS.renting_cap)}
                    >
                      <NumberInput value={config.renting_cap} onChange={(v) => set("renting_cap", v)} min={1} defaultValue={DEFAULTS.renting_cap} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Visible to Others"
                      description="Non-members can see private rooms (but can't join)"
                      tooltip="When enabled, private rooms appear in the channel list for everyone but only room members can connect."
                    >
                      <Toggle checked={config.renting_visible ?? true} onChange={(v) => set("renting_visible", v)} />
                    </SettingRow>
                  </SectionCard>

                  {/* Accountability / Schedule */}
                  <SectionCard
                    title="Accountability Sessions"
                    description="Settings for scheduled group study sessions"
                    icon={<Users size={18} />}
                  >
                    <SettingRow
                      label="Booking Cost"
                      description="Coins to book a study session"
                      tooltip="Members pay this to schedule a session. They get it back (plus rewards) if they attend."
                      defaultBadge={String(DEFAULTS.accountability_price)}
                    >
                      <NumberInput value={config.accountability_price} onChange={(v) => set("accountability_price", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_price} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Attendance Reward"
                      description="Coins earned for attending a booked session"
                      defaultBadge={String(DEFAULTS.accountability_reward)}
                    >
                      <NumberInput value={config.accountability_reward} onChange={(v) => set("accountability_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_reward} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Full Group Bonus"
                      description="Extra coins when every booked member shows up"
                      tooltip="All members in the session get this bonus if 100% attendance is achieved."
                      defaultBadge={String(DEFAULTS.accountability_bonus)}
                    >
                      <NumberInput value={config.accountability_bonus} onChange={(v) => set("accountability_bonus", v)} unit="coins" min={0} defaultValue={DEFAULTS.accountability_bonus} allowNull />
                    </SettingRow>
                  </SectionCard>

                  {/* Ranks */}
                  <SectionCard
                    title="Ranks"
                    description="Configure activity-based rank progression"
                    icon={<Trophy size={18} />}
                    badge={config.rank_type || "XP"}
                  >
                    <SettingRow
                      label="Rank Type"
                      description="Which activity drives rank progression"
                      tooltip="XP: combines voice and text activity. Voice: only study time counts. Messages: only text messages count. Choose based on what your community values most."
                      defaultBadge={DEFAULTS.rank_type}
                    >
                      <SearchSelect
                        options={RANK_TYPE_OPTIONS}
                        value={config.rank_type || null}
                        onChange={(v) => set("rank_type", v)}
                        placeholder="Select rank type"
                      />
                    </SettingRow>
                    <SettingRow
                      label="DM Rank-Up Notifications"
                      description="Send members a DM when they reach a new rank"
                      tooltip="When enabled, LionBot sends a congratulatory DM when a member levels up. Some members disable DMs, so this won't always work."
                    >
                      <Toggle checked={config.dm_ranks ?? true} onChange={(v) => set("dm_ranks", v)} />
                    </SettingRow>
                    <SettingRow
                      label="XP per Period"
                      description="Voice XP earned per tracking interval"
                      tooltip="Every few minutes in a voice channel, members earn this much XP. Higher values make ranking up faster."
                      defaultBadge={String(DEFAULTS.xp_per_period)}
                    >
                      <NumberInput value={config.xp_per_period} onChange={(v) => set("xp_per_period", v)} unit="XP" min={0} defaultValue={DEFAULTS.xp_per_period} allowNull />
                    </SettingRow>
                  </SectionCard>

                  {/* Moderation */}
                  <SectionCard
                    title="Moderation"
                    description="Moderation and enforcement settings"
                    icon={<Shield size={18} />}
                  >
                    <SettingRow
                      label="Video Study Ban"
                      description="Ban members from study channels for camera violations"
                      tooltip="When enabled, members who repeatedly disable their camera in video-required channels get temporarily banned from those channels."
                    >
                      <Toggle checked={config.video_studyban ?? true} onChange={(v) => set("video_studyban", v)} />
                    </SettingRow>
                    <SettingRow
                      label="Camera Grace Period"
                      description="Seconds before a member is kicked for no camera"
                      tooltip="When a member joins a video-required channel without camera, they get this many seconds to turn it on before being disconnected."
                      defaultBadge={`${DEFAULTS.video_grace_period}s`}
                    >
                      <NumberInput value={config.video_grace_period} onChange={(v) => set("video_grace_period", v)} unit="seconds" min={10} defaultValue={DEFAULTS.video_grace_period} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Persist Roles"
                      description="Restore member roles when they rejoin the server"
                      tooltip="When a member leaves and comes back, LionBot will reassign the roles they had before. Useful for preventing punishment evasion."
                    >
                      <Toggle checked={config.persist_roles ?? false} onChange={(v) => set("persist_roles", v)} />
                    </SettingRow>
                  </SectionCard>

                  {/* General */}
                  <SectionCard
                    title="General"
                    description="Language, timezone, and regional settings"
                    icon={<Globe size={18} />}
                  >
                    <SettingRow
                      label="Timezone"
                      description="Server timezone for schedules and time displays"
                      tooltip="All times shown by LionBot (schedules, session logs, etc.) will use this timezone. Pick the timezone where most of your members are."
                      defaultBadge="UTC"
                    >
                      <SearchSelect
                        options={TIMEZONE_OPTIONS}
                        value={config.timezone || null}
                        onChange={(v) => set("timezone", v)}
                        placeholder="Select timezone"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Language"
                      description="Bot language for this server"
                      tooltip="LionBot will respond in this language. Members can override this with their personal language preference unless Force Language is enabled."
                      defaultBadge="English"
                    >
                      <SearchSelect
                        options={LOCALE_OPTIONS}
                        value={config.locale || null}
                        onChange={(v) => set("locale", v)}
                        placeholder="Select language"
                      />
                    </SettingRow>
                    <SettingRow
                      label="Force Language"
                      description="Override individual member language preferences"
                      tooltip="When enabled, all members see the server language regardless of their personal setting. Useful for servers where you want a consistent experience."
                    >
                      <Toggle checked={config.force_locale ?? false} onChange={(v) => set("force_locale", v)} />
                    </SettingRow>
                  </SectionCard>

                  {/* Welcome Messages */}
                  <SectionCard
                    title="Welcome Messages"
                    description="Greet new and returning members automatically"
                    icon={<MessageSquare size={18} />}
                  >
                    <SettingRow
                      label="Welcome Message"
                      description="Sent when a new member joins. You can use: {mention}, {user_name}, {server_name}"
                      tooltip="This message is sent as an embed when someone joins for the first time. Leave empty to disable. Use {mention} to ping the new member."
                    >
                      <TextInput
                        value={config.greeting_message || ""}
                        onChange={(v) => set("greeting_message", v || null)}
                        multiline
                        rows={3}
                        placeholder="Welcome to {server_name}, {mention}! Start studying to earn coins."
                        maxLength={2000}
                      />
                    </SettingRow>
                    <SettingRow
                      label="Returning Member Message"
                      description="Sent when a member who previously left rejoins"
                      tooltip="This message is sent when someone who was previously a member comes back. Leave empty to use the regular welcome message."
                    >
                      <TextInput
                        value={config.returning_message || ""}
                        onChange={(v) => set("returning_message", v || null)}
                        multiline
                        rows={3}
                        placeholder="Welcome back, {mention}! Good to see you again."
                        maxLength={2000}
                      />
                    </SettingRow>
                  </SectionCard>

                  {/* Workouts */}
                  <SectionCard
                    title="Workouts"
                    description="Workout tracking and rewards"
                    icon={<Dumbbell size={18} />}
                  >
                    <SettingRow
                      label="Minimum Length"
                      description="Shortest workout that counts for a reward"
                      tooltip="Workouts shorter than this won't earn any coins. Prevents gaming the system with very short sessions."
                      defaultBadge={`${DEFAULTS.min_workout_length} min`}
                    >
                      <NumberInput value={config.min_workout_length} onChange={(v) => set("min_workout_length", v)} unit="minutes" min={1} defaultValue={DEFAULTS.min_workout_length} allowNull />
                    </SettingRow>
                    <SettingRow
                      label="Workout Reward"
                      description="Coins earned per workout session"
                      defaultBadge={String(DEFAULTS.workout_reward)}
                    >
                      <NumberInput value={config.workout_reward} onChange={(v) => set("workout_reward", v)} unit="coins" min={0} defaultValue={DEFAULTS.workout_reward} allowNull />
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
