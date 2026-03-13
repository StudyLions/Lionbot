// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Pomodoro timer configuration page
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
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
import { useState, useCallback } from "react"
import { Timer } from "lucide-react"

interface PomodoroTimer {
  timerid: string
  guildid: string
  channelid: string
  notification_channelid: string | null
  focus_length: number
  break_length: number
  voice_alerts: boolean
  inactivity_threshold: number | null
  manager_roleid: string | null
  channel_name: string | null
  pretty_name: string | null
  auto_restart: boolean
}

interface PomodoroData {
  timers: PomodoroTimer[]
  pomodoro_channel: string | null
}

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
  const serverName = serverData?.server?.name || "Server"
  // --- END AI-MODIFIED ---
  const [editingTimers, setEditingTimers] = useState<Record<string, Partial<PomodoroTimer>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [createForm, setCreateForm] = useState({
    channelid: "" as string | null,
    focus_length: 25,
    break_length: 5,
  })
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PomodoroTimer | null>(null)
  const [deleting, setDeleting] = useState(false)

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
        }),
      })
      if (res.ok) {
        toast.success("Timer created")
        setCreateForm({ channelid: null, focus_length: 25, break_length: 5 })
        mutate()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create timer")
      }
    } catch {
      toast.error("Failed to create timer")
    }
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
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
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete timer")
      }
    } catch {
      toast.error("Failed to delete timer")
    }
    setDeleting(false)
  }

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
                <EmptyState
                  icon={<Timer size={48} strokeWidth={1} />}
                  title="No Pomodoro timers configured"
                  description="Pomodoro timers are created via the bot. Use the bot commands in Discord to set up a timer in a voice channel, then come back here to configure its settings."
                />
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
                        <SettingRow
                          label="Inactivity threshold"
                          description="Minutes of no activity before timer pauses"
                          tooltip="If no one is in the channel for this many minutes, the timer pauses. Leave empty for no auto-pause."
                        >
                          <NumberInput
                            value={(getTimerValue(timer, "inactivity_threshold") as number | null) ?? timer.inactivity_threshold}
                            onChange={(v) => setTimerField(timer.timerid, "inactivity_threshold", v)}
                            unit="min"
                            min={1}
                            allowNull
                            placeholder="No limit"
                          />
                        </SettingRow>
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
