// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 3 \u2014 Member rewards.
//          Coins per hour of study, bonus for being on camera, starting funds.
//          Uses MobileSlider + RecommendedPill so admins can snap to sensible
//          defaults in one tap, and a live "1-hour-with-camera earns X" preview.
// ============================================================
import { useEffect, useState } from "react"
import { Coins } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import MobileSlider from "../MobileSlider"
import RecommendedPill from "../RecommendedPill"
import NumberInput from "@/components/dashboard/ui/NumberInput"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface ConfigData {
  study_hourly_reward: number | null
  study_hourly_live_bonus: number | null
  starting_funds: number | null
}

const RECOMMENDED = {
  hourly: 100,
  bonus: 50,
  start: 0,
}

export default function RewardsTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/config`
  const { data } = useDashboard<ConfigData & Record<string, any>>(open ? apiKey : null)
  const [draft, setDraft] = useState<ConfigData>({
    study_hourly_reward: RECOMMENDED.hourly,
    study_hourly_live_bonus: RECOMMENDED.bonus,
    starting_funds: RECOMMENDED.start,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraft({
      study_hourly_reward: data.study_hourly_reward ?? RECOMMENDED.hourly,
      study_hourly_live_bonus: data.study_hourly_live_bonus ?? RECOMMENDED.bonus,
      starting_funds: data.starting_funds ?? RECOMMENDED.start,
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

  const previewTotal = (draft.study_hourly_reward ?? 0) + (draft.study_hourly_live_bonus ?? 0)

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Member rewards"
      subtitle="How many LionCoins members earn from studying."
      icon={Coins}
      returnFocusTo="setup-task-trigger-rewards"
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
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Coins drive the in-server shop, role unlocks and accountability bookings. You can change these any time.
      </p>

      <SettingRow
        label="Coins per hour of study"
        jargon="lioncoin"
        help="A standard rate is 50\u2013150."
        recommended={
          <RecommendedPill
            value={RECOMMENDED.hourly}
            current={draft.study_hourly_reward}
            onSnap={() => update("study_hourly_reward", RECOMMENDED.hourly)}
          />
        }
      >
        <MobileSlider
          value={draft.study_hourly_reward}
          onChange={(v) => update("study_hourly_reward", v)}
          min={0}
          max={500}
          step={10}
          unit="coins"
          recommended={RECOMMENDED.hourly}
          label="Coins per hour"
        />
      </SettingRow>

      <SettingRow
        label="Bonus for being on camera"
        help="Extra coins per hour when their camera is on."
        recommended={
          <RecommendedPill
            value={RECOMMENDED.bonus}
            current={draft.study_hourly_live_bonus}
            onSnap={() => update("study_hourly_live_bonus", RECOMMENDED.bonus)}
          />
        }
      >
        <MobileSlider
          value={draft.study_hourly_live_bonus}
          onChange={(v) => update("study_hourly_live_bonus", v)}
          min={0}
          max={200}
          step={10}
          unit="coins"
          recommended={RECOMMENDED.bonus}
          label="Camera bonus per hour"
        />
      </SettingRow>

      <SettingRow
        label="Starting balance for new members"
        help="A small welcome bonus. 0 means new joiners start at zero."
      >
        <NumberInput
          value={draft.starting_funds}
          onChange={(v) => update("starting_funds", v ?? 0)}
          min={0}
          unit="coins"
          defaultValue={RECOMMENDED.start}
        />
      </SettingRow>

      {/* Live preview */}
      <div className="mt-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3">
        <div className="text-xs text-muted-foreground mb-1">Live preview</div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          A member who studies 1 hour with camera on earns{" "}
          <strong className="text-primary tabular-nums">{previewTotal} LionCoins</strong>.
        </p>
      </div>
    </TaskDrawer>
  )
}
