// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Pomodoro timer configuration page
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import { cn } from "@/lib/utils"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: Phase 2E - add Create Timer form and Delete button on each timer
import {
  PageHeader,
  SectionCard,
  SettingRow,
  RoleSelect,
  NumberInput,
  Toggle,
  EmptyState,
  FirstTimeBanner,
  ConfirmModal,
  ChannelSelect,
  toast,
} from "@/components/dashboard/ui"
// --- END AI-MODIFIED ---
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add useEffect for pomodoro_channel state init
import { useState, useCallback, useEffect } from "react"
// --- END AI-MODIFIED ---
import { Timer, Activity } from "lucide-react"
import CountdownRing from "@/components/dashboard/CountdownRing"
// --- AI-MODIFIED (2026-03-14) ---
// Purpose: add i18n imports for serverSideTranslations
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-13) ---
// Purpose: add last_started, clarify focus/break in minutes, inactivity in cycles
interface PomodoroTimer {
  timerid: string
  guildid: string
  channelid: string
  notification_channelid: string | null
  focus_length: number  // now in MINUTES (API converts)
  break_length: number  // now in MINUTES
  voice_alerts: boolean
  inactivity_threshold: number | null  // in CYCLES not minutes
  manager_roleid: string | null
  channel_name: string | null
  pretty_name: string | null
  auto_restart: boolean
  last_started: string | null  // ISO datetime
}
// --- END AI-MODIFIED ---

interface PomodoroData {
  timers: PomodoroTimer[]
  pomodoro_channel: string | null
}

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: live timer status from bot renderer
interface TimerStatusItem {
  channelid: string
  channelName: string | null
  prettyName: string
  running: boolean
  stage: "focus" | "break" | null
  focusLength: number
  breakLength: number
  stageStartedAt: string | null
  stageEndsAt: string | null
  remainingSeconds: number
  stageDurationSeconds: number
  membersInChannel: number
  autoRestart: boolean
  voiceAlerts: boolean
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-14) ---
// Purpose: timer presets for Create form
const PRESETS = [
  { label: "Classic", focus: 25, break: 5, description: "The original Pomodoro technique" },
  { label: "Long Focus", focus: 50, break: 10, description: "Deep work sessions" },
  { label: "Short Sprint", focus: 15, break: 3, description: "Quick study bursts" },
  { label: "Lecture", focus: 45, break: 10, description: "University-style blocks" },
]
// --- END AI-MODIFIED ---

export default function PomodoroPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: migrated from useEffect+fetch to SWR for proper caching and error handling
  const { data, error, isLoading: loading, mutate } = useDashboard<PomodoroData>(
    id && session ? `/api/dashboard/servers/${id}/pomodoro` : null
  )
  const { data: serverData } = useDashboard<{ server?: { name?: string } }>(
    id && session ? `/api/dashboard/servers/${id}` : null
  )
  const { data: timerStatus, mutate: mutateTimerStatus } = useDashboard<{ timers: TimerStatusItem[] }>(
    id && session ? `/api/dashboard/servers/${id}/timer-status` : null,
    { refreshInterval: 15000 }
  )
  const serverName = serverData?.server?.name || "Server"
  // --- END AI-MODIFIED ---
  const [editingTimers, setEditingTimers] = useState<Record<string, Partial<PomodoroTimer>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: complete create form with all timer options
  const [createForm, setCreateForm] = useState({
    channelid: "" as string | null,
    focus_length: 25,
    break_length: 5,
    pretty_name: "",
    notification_channelid: null as string | null,
    voice_alerts: true,
    auto_restart: true,
    inactivity_threshold: "" as string | number,
    manager_roleid: null as string | null,
    channel_name: "",
  })
  // --- END AI-MODIFIED ---
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PomodoroTimer | null>(null)
  const [deleting, setDeleting] = useState(false)
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: guild default pomodoro notification channel
  const [pomodoroChannel, setPomodoroChannel] = useState<string | null>(null)

  useEffect(() => {
    if (data) setPomodoroChannel(data.pomodoro_channel)
  }, [data])

  const controlTimer = async (channelid: string, action: string) => {
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/timer-control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelid, action }),
      })
      if (res.ok) {
        toast.success(action === "start" ? "Timer started" : "Timer stopped")
        mutateTimerStatus()
      } else {
        const err = await res.json()
        toast.error(err.reason || err.error || `Failed to ${action} timer`)
      }
    } catch {
      toast.error(`Failed to ${action} timer`)
    }
  }

  const handleSetPomodoroChannel = async (channelId: string | null) => {
    setPomodoroChannel(channelId)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pomodoro_channel: channelId }),
      })
      if (res.ok) {
        toast.success("Default notification channel updated")
        mutate()
      } else toast.error("Failed to update")
    } catch {
      toast.error("Failed to update")
    }
  }
  // --- END AI-MODIFIED ---

  const setTimerField = useCallback((timerId: string, field: keyof PomodoroTimer, value: unknown) => {
    setEditingTimers((prev) => ({
      ...prev,
      [timerId]: { ...prev[timerId], [field]: value },
    }))
  }, [])

  const getTimerValue = (timer: PomodoroTimer, field: keyof PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    if (edit && field in edit) return (edit as Record<string, unknown>)[field]
    return (timer as unknown as Record<string, unknown>)[field]
  }

  const hasChanges = (timer: PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    return edit && Object.keys(edit).length > 0
  }

  const handleSave = async (timer: PomodoroTimer) => {
    const edit = editingTimers[timer.timerid]
    if (!edit || Object.keys(edit).length === 0) return

    setSaving((prev) => ({ ...prev, [timer.timerid]: true }))
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerId: timer.timerid, ...edit }),
      })
      if (!res.ok) throw new Error("Save failed")
      const { timer: updated } = await res.json()
      setEditingTimers((prev) => {
        const next = { ...prev }
        delete next[timer.timerid]
        return next
      })
      mutate()
      toast.success("Timer settings saved")
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving((prev) => ({ ...prev, [timer.timerid]: false }))
  }

  const handleReset = (timer: PomodoroTimer) => {
    setEditingTimers((prev) => {
      const next = { ...prev }
      delete next[timer.timerid]
      return next
    })
  }

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: include all timer options in POST, reset to full defaults, notify bot to reload
  const handleCreate = async () => {
    if (!createForm.channelid) return
    setCreating(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelid: createForm.channelid,
          focus_length: createForm.focus_length,
          break_length: createForm.break_length,
          pretty_name: createForm.pretty_name || null,
          notification_channelid: createForm.notification_channelid,
          voice_alerts: createForm.voice_alerts,
          auto_restart: createForm.auto_restart,
          inactivity_threshold: createForm.inactivity_threshold || null,
          manager_roleid: createForm.manager_roleid,
          channel_name: createForm.channel_name || null,
        }),
      })
      if (res.ok) {
        toast.success("Timer created")
        setCreateForm({
          channelid: null,
          focus_length: 25,
          break_length: 5,
          pretty_name: "",
          notification_channelid: null,
          voice_alerts: true,
          auto_restart: true,
          inactivity_threshold: "",
          manager_roleid: null,
          channel_name: "",
        })
        mutate()
        fetch(`/api/dashboard/servers/${id}/timer-control`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelid: createForm.channelid, action: "reload" }),
        }).catch(() => {})
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create timer")
      }
    } catch {
      toast.error("Failed to create timer")
    }
    setCreating(false)
  }
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-14) ---
  // Purpose: notify bot to unload timer after successful delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    const channelidToUnload = deleteTarget.channelid
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/servers/${id}/pomodoro`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelid: deleteTarget.channelid }),
      })
      if (res.ok) {
        toast.success("Timer deleted")
        setDeleteTarget(null)
        mutate()
        fetch(`/api/dashboard/servers/${id}/timer-control`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelid: channelidToUnload, action: "unload" }),
        }).catch(() => {})
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete timer")
      }
    } catch {
      toast.error("Failed to delete timer")
    }
    setDeleting(false)
  }
  // --- END AI-MODIFIED ---

  return (
    <Layout SEO={{ title: `Pomodoro - ${serverName || "Server"} - LionBot`, description: "Pomodoro timer configuration" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-5xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName={serverName || "..."} isAdmin isMod />
            <div className="flex-1 min-w-0">
              <PageHeader
                title="Pomodoro Timers"
                description="Configure Pomodoro study timers for your server. Each timer runs in a voice channel and helps members stay focused with work/break cycles."
              />

              <FirstTimeBanner
                title="What are Pomodoro timers?"
                description="Pomodoro timers help your members study in focused blocks. A timer runs in a voice channel: members join to study, and the bot cycles between focus periods (e.g. 25 minutes) and short breaks (e.g. 5 minutes). You can set focus length, break length, voice alerts, and who can manage the timer."
                icon={<Timer size={22} />}
                storageKey="pomodoro_intro"
              />

              {/* --- AI-MODIFIED (2026-03-13) --- */}
              {/* Purpose: guild default pomodoro notification channel */}
              {data && (
                <div className="bg-card/50 border border-border rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Default Notification Channel</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Fallback channel for timer notifications when a timer doesn&apos;t have its own notification channel set.
                  </p>
                  <ChannelSelect
                    guildId={guildId}
                    value={pomodoroChannel}
                    onChange={(v) => handleSetPomodoroChannel((v as string) || null)}
                    channelTypes={[0, 5]}
                    placeholder="No default (use voice channel)"
                  />
                </div>
              )}
              {/* --- END AI-MODIFIED --- */}

              {/* --- AI-MODIFIED (2026-03-14) --- */}
              {/* Purpose: live timer status section */}
              {timerStatus?.timers?.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity size={20} className="text-success" />
                    Live Timers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timerStatus.timers.map((t) => (
                      <div key={t.channelid} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-start gap-5">
                          <CountdownRing
                            totalSeconds={t.stageDurationSeconds}
                            remainingSeconds={t.remainingSeconds}
                            stage={t.stage}
                            size={100}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{t.prettyName}</h4>
                            <p className="text-sm text-muted-foreground">{t.channelName}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="text-muted-foreground">{t.membersInChannel} studying</span>
                              <span className="text-muted-foreground">{t.focusLength}/{t.breakLength} min</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {t.running ? (
                                <button
                                  onClick={() => controlTimer(t.channelid, "stop")}
                                  className="px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                                >
                                  Stop
                                </button>
                              ) : (
                                <button
                                  onClick={() => controlTimer(t.channelid, "start")}
                                  className="px-3 py-1.5 text-xs font-medium text-success bg-success/10 hover:bg-success/20 rounded-md transition-colors"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* --- END AI-MODIFIED --- */}

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
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
                  <p className="text-muted-foreground">Unable to load Pomodoro settings. You may not have moderator permissions.</p>
                </div>
              ) : data.timers.length === 0 ? (
                <>
                  {/* --- AI-MODIFIED (2026-03-13) --- */}
                  <EmptyState
                    icon={<Timer size={48} strokeWidth={1} />}
                    title="No Pomodoro timers configured"
                    description="No Pomodoro timers configured yet. Create one below by selecting a voice channel and setting focus/break durations."
                  />
                  {/* --- END AI-MODIFIED --- */}
                </>
              ) : (
                <div className="space-y-4">
                  {data.timers.map((timer) => (
                    <SectionCard
                      key={timer.timerid}
                      title={timer.pretty_name || timer.channel_name || `Timer #${timer.timerid.slice(-6)}`}
                      description={`Focus: ${timer.focus_length} min · Break: ${timer.break_length} min`}
                      icon={<Timer size={18} />}
                      badge={hasChanges(timer) ? "Unsaved" : undefined}
                    >
                      <div className="space-y-0">
                        {/* --- AI-MODIFIED (2026-03-13) --- */}
                        {/* Purpose: add pretty_name and channel_name as first settings */}
                        <SettingRow
                          label="Timer name"
                          description="Display name shown in the timer card and channel name"
                        >
                          <input
                            type="text"
                            value={(getTimerValue(timer, "pretty_name") as string | null) ?? timer.pretty_name ?? ""}
                            onChange={(e) => setTimerField(timer.timerid, "pretty_name", e.target.value || null)}
                            placeholder="e.g. Main Study Timer"
                            maxLength={100}
                            className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </SettingRow>
                        <SettingRow
                          label="Channel name format"
                          description="Format for the voice channel name. Variables: {name}, {stage}, {remaining}, {pattern}, {members}"
                          tooltip="The bot updates the voice channel name with this format. {name} = timer name, {stage} = FOCUS/BREAK, {remaining} = minutes left, {pattern} = 25/5, {members} = member count."
                        >
                          <input
                            type="text"
                            value={(getTimerValue(timer, "channel_name") as string | null) ?? timer.channel_name ?? ""}
                            onChange={(e) => setTimerField(timer.timerid, "channel_name", e.target.value || null)}
                            placeholder="{name} {pattern} - {stage}"
                            maxLength={100}
                            className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </SettingRow>
                        {/* --- END AI-MODIFIED --- */}
                        <SettingRow
                          label="Focus length"
                          description="Duration of each focus period in minutes"
                          tooltip="How long each work block lasts. Common values: 25 (classic Pomodoro), 45, or 50 minutes."
                        >
                          <NumberInput
                            value={(getTimerValue(timer, "focus_length") as number) ?? timer.focus_length}
                            onChange={(v) => setTimerField(timer.timerid, "focus_length", v)}
                            unit="min"
                            min={1}
                            max={120}
                          />
                        </SettingRow>
                        <SettingRow
                          label="Break length"
                          description="Duration of each break in minutes"
                          tooltip="Short break between focus blocks. Typically 5 minutes for classic Pomodoro."
                        >
                          <NumberInput
                            value={(getTimerValue(timer, "break_length") as number) ?? timer.break_length}
                            onChange={(v) => setTimerField(timer.timerid, "break_length", v)}
                            unit="min"
                            min={1}
                            max={60}
                          />
                        </SettingRow>
                        <SettingRow
                          label="Auto restart"
                          description="Automatically start the next focus period after a break"
                          tooltip="When enabled, the timer cycles continuously without manual start. When disabled, someone must start each focus block."
                        >
                          <Toggle
                            checked={(getTimerValue(timer, "auto_restart") as boolean) ?? timer.auto_restart}
                            onChange={(v) => setTimerField(timer.timerid, "auto_restart", v)}
                          />
                        </SettingRow>
                        {/* --- AI-MODIFIED (2026-03-13) --- */}
                        <SettingRow
                          label="Inactivity cycles"
                          description="Focus+break cycles a member can be inactive before being removed from the channel"
                          tooltip="Number of focus+break cycles a member can be inactive before being removed from the channel. Leave empty for no limit."
                        >
                          <NumberInput
                            value={(getTimerValue(timer, "inactivity_threshold") as number | null) ?? timer.inactivity_threshold}
                            onChange={(v) => setTimerField(timer.timerid, "inactivity_threshold", v)}
                            unit="cycles"
                            min={1}
                            max={64}
                            allowNull
                            placeholder="No limit"
                          />
                        </SettingRow>
                        {/* --- END AI-MODIFIED --- */}
                        <SettingRow
                          label="Voice alerts"
                          description="Play sounds when focus/break periods change"
                          tooltip="When enabled, the bot plays a sound in the voice channel when switching between focus and break. Helps members who are tabbed out."
                        >
                          <Toggle
                            checked={(getTimerValue(timer, "voice_alerts") as boolean) ?? timer.voice_alerts}
                            onChange={(v) => setTimerField(timer.timerid, "voice_alerts", v)}
                          />
                        </SettingRow>
                        <SettingRow
                          label="Manager role"
                          description="Role that can start, pause, and control the timer"
                          tooltip="Members with this role can start the timer, pause it, and adjust it. Leave empty for anyone to control."
                        >
                          <RoleSelect
                            guildId={guildId}
                            value={(getTimerValue(timer, "manager_roleid") as string | null) ?? timer.manager_roleid}
                            onChange={(v) => setTimerField(timer.timerid, "manager_roleid", Array.isArray(v) ? v[0] ?? null : v)}
                            placeholder="Anyone"
                          />
                        </SettingRow>
                        {/* --- AI-MODIFIED (2026-03-13) --- */}
                        <SettingRow
                          label="Notification channel"
                          description="Channel where timer status cards and alerts are posted"
                          tooltip="Leave empty to use the server's default pomodoro channel or the voice channel itself."
                        >
                          <ChannelSelect
                            guildId={guildId}
                            value={(getTimerValue(timer, "notification_channelid") as string | null) ?? timer.notification_channelid}
                            onChange={(v) => setTimerField(timer.timerid, "notification_channelid", (v as string) || null)}
                            channelTypes={[0, 5]}
                            placeholder="Default channel"
                          />
                        </SettingRow>
                        {/* --- END AI-MODIFIED --- */}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 flex-wrap">
                        {hasChanges(timer) && (
                          <>
                            <button
                              onClick={() => handleSave(timer)}
                              disabled={saving[timer.timerid]}
                              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {saving[timer.timerid] ? "Saving..." : "Save changes"}
                            </button>
                            <button
                              onClick={() => handleReset(timer)}
                              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-white rounded-lg transition-colors"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(timer)}
                          className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}

              {data && (
              <div className="mt-8 bg-card/50 border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Create Timer</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add a new Pomodoro timer to a voice channel. Members can join the channel to study with focus/break cycles.
                </p>
                {/* --- AI-MODIFIED (2026-03-14) --- */}
                {/* Purpose: timer presets above channel selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, focus_length: p.focus, break_length: p.break }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm border transition-colors",
                        createForm.focus_length === p.focus && createForm.break_length === p.break
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className="text-xs ml-1.5 opacity-70">{p.focus}/{p.break}</span>
                    </button>
                  ))}
                </div>
                {/* --- END AI-MODIFIED --- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ChannelSelect
                    guildId={guildId}
                    value={createForm.channelid}
                    onChange={(v) => setCreateForm((f) => ({ ...f, channelid: (v as string) || null }))}
                    channelTypes={[2]}
                    label="Voice channel"
                    placeholder="Select voice channel..."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Focus length (min)</label>
                      <input
                        type="number"
                        value={createForm.focus_length}
                        onChange={(e) => setCreateForm((f) => ({ ...f, focus_length: parseInt(e.target.value, 10) || 25 }))}
                        min={1}
                        max={120}
                        className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Break length (min)</label>
                      <input
                        type="number"
                        value={createForm.break_length}
                        onChange={(e) => setCreateForm((f) => ({ ...f, break_length: parseInt(e.target.value, 10) || 5 }))}
                        min={1}
                        max={60}
                        className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                {/* --- AI-MODIFIED (2026-03-14) --- */}
                {/* Purpose: complete create form - timer name, notification channel, toggles, manager role */}
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Timer name</label>
                    <input
                      type="text"
                      value={createForm.pretty_name}
                      onChange={(e) => setCreateForm((f) => ({ ...f, pretty_name: e.target.value }))}
                      placeholder="e.g. Main Study Timer"
                      maxLength={100}
                      className="w-full bg-card border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <ChannelSelect
                    guildId={guildId}
                    value={createForm.notification_channelid}
                    onChange={(v) => setCreateForm((f) => ({ ...f, notification_channelid: (v as string) || null }))}
                    channelTypes={[0, 5]}
                    label="Notification channel"
                    placeholder="Default (voice channel)"
                  />
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-foreground/80">
                      <Toggle
                        checked={createForm.voice_alerts}
                        onChange={(v) => setCreateForm((f) => ({ ...f, voice_alerts: v }))}
                      />
                      Voice alerts
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground/80">
                      <Toggle
                        checked={createForm.auto_restart}
                        onChange={(v) => setCreateForm((f) => ({ ...f, auto_restart: v }))}
                      />
                      Auto restart
                    </label>
                  </div>
                  <RoleSelect
                    guildId={guildId}
                    value={createForm.manager_roleid}
                    onChange={(v) => setCreateForm((f) => ({ ...f, manager_roleid: (v as string) || null }))}
                    label="Manager role"
                    placeholder="Anyone can control"
                  />
                </div>
                {/* --- END AI-MODIFIED --- */}
                <button
                  onClick={handleCreate}
                  disabled={creating || !createForm.channelid}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Timer"}
                </button>
              </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          open={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          title="Delete Timer"
          message="This will remove the Pomodoro timer from this voice channel. The timer will stop and members will need to re-create it via the bot."
          confirmLabel="Delete Timer"
          variant="danger"
          loading={deleting}
        />
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
