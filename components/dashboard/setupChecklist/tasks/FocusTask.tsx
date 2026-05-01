// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 6 \u2014 Tasks and Pomodoro timer.
//          Two task settings (reward + per-day limit) and one Pomodoro
//          toggle (leave-summary). Dead bot columns (max_tasks,
//          workout_reward, min_workout_length) are deliberately NOT
//          surfaced here \u2014 see audit notes in
//          pages/api/dashboard/servers/[id]/config.ts.
// ============================================================
import { useEffect, useState } from "react"
import { Timer } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import MobileSlider from "../MobileSlider"
import RecommendedPill from "../RecommendedPill"
import NumberInput from "@/components/dashboard/ui/NumberInput"
import Toggle from "@/components/dashboard/ui/Toggle"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface ConfigData {
  task_reward: number | null
  task_reward_limit: number | null
  session_leave_summary: boolean | null
}

const RECOMMENDED = { reward: 50, limit: 10 }

export default function FocusTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/config`
  const { data } = useDashboard<ConfigData & Record<string, any>>(open ? apiKey : null)
  const [draft, setDraft] = useState<ConfigData>({
    task_reward: RECOMMENDED.reward,
    task_reward_limit: RECOMMENDED.limit,
    session_leave_summary: false,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraft({
      task_reward: data.task_reward ?? RECOMMENDED.reward,
      task_reward_limit: data.task_reward_limit ?? RECOMMENDED.limit,
      session_leave_summary: data.session_leave_summary ?? false,
    })
    setDirty(false)
  }, [data, open])

  function update<K extends keyof ConfigData>(k: K, v: ConfigData[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      await dashboardMutate("PATCH", apiKey, draft)
      invalidate(apiKey)
      invalidate(`/api/dashboard/servers/${guildId}/setup-checklist`)
      toast.success("Saved.")
      onComplete()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Couldn't save \u2014 try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Tasks and focus timer"
      subtitle="Reward members for finishing tasks and using the Pomodoro timer."
      icon={Timer}
      returnFocusTo="setup-task-trigger-focus"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onSave={save}
          onClose={onClose}
          saving={saving}
          dirty={dirty}
          // --- AI-MODIFIED (2026-04-30) ---
          // Purpose: Always true -- bot ships with sensible defaults
          // (50 coins per task, 10/day limit, summary off).
          onComplete={onComplete}
          hasValue
          // --- END AI-MODIFIED ---
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        These two features power the daily-grind loop most servers use.
      </p>

      <SettingRow
        label="LionCoins per finished task"
        jargon="lioncoin"
        help="A small reward keeps members coming back."
        recommended={
          <RecommendedPill
            value={RECOMMENDED.reward}
            current={draft.task_reward}
            onSnap={() => update("task_reward", RECOMMENDED.reward)}
          />
        }
      >
        <MobileSlider
          value={draft.task_reward}
          onChange={(v) => update("task_reward", v)}
          min={0}
          max={200}
          step={5}
          unit="coins"
          recommended={RECOMMENDED.reward}
          label="Coins per task"
        />
      </SettingRow>

      <SettingRow
        label="Max rewarded tasks per day"
        help="Stops people farming the reward by spam-ticking tasks."
      >
        <NumberInput
          value={draft.task_reward_limit}
          onChange={(v) => update("task_reward_limit", v ?? RECOMMENDED.limit)}
          min={1}
          max={50}
          unit="tasks"
          defaultValue={RECOMMENDED.limit}
        />
      </SettingRow>

      <SettingRow
        label="Send a &quot;great session&quot; summary"
        jargon="pomodoro"
        help="A short embed when someone leaves the focus timer."
      >
        <Toggle
          checked={!!draft.session_leave_summary}
          onChange={(v) => update("session_leave_summary", v)}
          disabled={saving}
        />
      </SettingRow>

      <div className="mt-3 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
        The Pomodoro channel itself is set in <strong className="text-foreground/80">Notification channels</strong> above —
        leave it blank to keep the focus timer DM-only.
      </div>
    </TaskDrawer>
  )
}
