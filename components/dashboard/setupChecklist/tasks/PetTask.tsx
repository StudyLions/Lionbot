// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 8 \u2014 Optional Pet game (LionGotchi).
//          Single on/off + drop notification channel. The full pet config
//          (item drops, raids, marketplace, etc.) lives at /pet/settings.
// ============================================================
import { useEffect, useState } from "react"
import { PawPrint, ExternalLink } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import Toggle from "@/components/dashboard/ui/Toggle"
import ChannelSelect from "@/components/dashboard/ui/ChannelSelect"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface LgConfig {
  lg_enabled: boolean | null
  lg_drop_channel: string | null
  lg_teaser_enabled: boolean | null
}

export default function PetTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/liongotchi-config`
  const { data } = useDashboard<LgConfig>(open ? apiKey : null)
  const [draft, setDraft] = useState<LgConfig>({
    lg_enabled: false,
    lg_drop_channel: null,
    lg_teaser_enabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraft({
      lg_enabled: data.lg_enabled ?? false,
      lg_drop_channel: data.lg_drop_channel ?? null,
      lg_teaser_enabled: data.lg_teaser_enabled ?? true,
    })
    setDirty(false)
  }, [data, open])

  function update<K extends keyof LgConfig>(k: K, v: LgConfig[K]) {
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
      title="Pet game"
      subtitle="Members hatch, feed, and grow a LionGotchi pet by studying."
      icon={PawPrint}
      returnFocusTo="setup-task-trigger-pet"
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
          // Purpose: Always true -- this is a single toggle. Admin can confirm
          // their current setting (whether enabled or not) with one tap.
          onComplete={onComplete}
          hasValue
          // --- END AI-MODIFIED ---
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Adds a fun gamified loop on top of ranks. Off by default — turn on if your community likes games.
      </p>

      <SettingRow
        label="Enable the pet game in this server"
        help="Members can use /pet commands and see their pets in the dashboard."
      >
        <Toggle checked={!!draft.lg_enabled} onChange={(v) => update("lg_enabled", v)} disabled={saving} />
      </SettingRow>

      {draft.lg_enabled && (
        <>
          <SettingRow
            label="Drop notification channel"
            jargon="channel"
            help="Where item drops appear. Leave blank to skip drop posts."
          >
            <ChannelSelect
              guildId={guildId}
              value={draft.lg_drop_channel}
              onChange={(v) => update("lg_drop_channel", typeof v === "string" ? v : null)}
              channelTypes={[0, 5]}
              placeholder="None — silent drops"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow
            label="Show a teaser hint to members"
            help="Posts a one-time &quot;Try the pet game&quot; message in the drop channel."
          >
            <Toggle
              checked={!!draft.lg_teaser_enabled}
              onChange={(v) => update("lg_teaser_enabled", v)}
              disabled={saving}
            />
          </SettingRow>

          <a
            href="/pet/settings"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Open full pet settings
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </>
      )}

      {!draft.lg_enabled && (
        <p className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
          Pets are off. Members won't see /pet commands or the pet menu in their dashboard.
        </p>
      )}
    </TaskDrawer>
  )
}
