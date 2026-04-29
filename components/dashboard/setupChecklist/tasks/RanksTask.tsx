// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 2 \u2014 How members rank up.
//
//          Fixes the legacy wizard's artificial "pick one rank type" UI.
//          The bot already supports multi-tracking via voice_ranks_enabled,
//          msg_ranks_enabled and xp_ranks_enabled flags
//          (StudyLion/src/modules/ranks/cog.py line 199), so the dashboard
//          should let admins enable any combination.
//
//          Three independent toggles + DM rank-ups + announcement channel.
//          Validates that at least one rank type is on before save (otherwise
//          members rank up to nothing).
// ============================================================
import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import Toggle from "@/components/dashboard/ui/Toggle"
import ChannelSelect from "@/components/dashboard/ui/ChannelSelect"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface RanksApiResponse {
  voiceRanksEnabled: boolean
  msgRanksEnabled: boolean
  xpRanksEnabled: boolean
  dmRanks: boolean
  rankChannel: string | null
}

interface Draft {
  voice: boolean
  msg: boolean
  xp: boolean
  dm: boolean
  channel: string | null
}

export default function RanksTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const ranksKey = `/api/dashboard/servers/${guildId}/ranks`
  const configKey = `/api/dashboard/servers/${guildId}/config`
  const { data } = useDashboard<RanksApiResponse>(open ? ranksKey : null)
  const [draft, setDraft] = useState<Draft>({ voice: true, msg: false, xp: false, dm: false, channel: null })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraft({
      voice: data.voiceRanksEnabled,
      msg: data.msgRanksEnabled,
      xp: data.xpRanksEnabled,
      dm: data.dmRanks,
      channel: data.rankChannel,
    })
    setDirty(false)
  }, [data, open])

  function update<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
    setDirty(true)
  }

  async function save() {
    if (!draft.voice && !draft.msg && !draft.xp) {
      toast.error("Pick at least one type \u2014 otherwise members can't rank up.")
      return
    }
    setSaving(true)
    try {
      // Two endpoints: ranks PUT for the enable flags, config PATCH for
      // dm_ranks + rank_channel. Run both, fail fast if either fails.
      await Promise.all([
        dashboardMutate("PUT", ranksKey, {
          voiceRanksEnabled: draft.voice,
          msgRanksEnabled: draft.msg,
          xpRanksEnabled: draft.xp,
        }),
        dashboardMutate("PATCH", configKey, {
          dm_ranks: draft.dm,
          rank_channel: draft.channel,
        }),
      ])
      invalidate(ranksKey)
      invalidate(configKey)
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

  const enabledCount = (draft.voice ? 1 : 0) + (draft.msg ? 1 : 0) + (draft.xp ? 1 : 0)

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="How members rank up"
      subtitle="Choose what counts. You can pick more than one."
      icon={Trophy}
      returnFocusTo="setup-task-trigger-ranks"
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
        Ranks are how members see their progress. Pick the activity that matches how your server already runs.
      </p>

      <SettingRow
        label="Count voice time"
        help="Hours spent in voice channels."
      >
        <Toggle checked={draft.voice} onChange={(v) => update("voice", v)} disabled={saving} />
      </SettingRow>

      <SettingRow
        label="Count messages"
        help="Number of messages sent in text channels."
      >
        <Toggle checked={draft.msg} onChange={(v) => update("msg", v)} disabled={saving} />
      </SettingRow>

      <SettingRow
        label="Count XP (combined)"
        jargon="xp"
        help="Awarded for both voice and messages. Useful as an overall activity ladder."
      >
        <Toggle checked={draft.xp} onChange={(v) => update("xp", v)} disabled={saving} />
      </SettingRow>

      {enabledCount === 0 && (
        <p className="mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Pick at least one type or members won't rank up at all.
        </p>
      )}
      {enabledCount > 1 && (
        <p className="mb-4 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
          Members will appear on {enabledCount} separate ladders \u2014 one per type you enabled.
        </p>
      )}

      <SettingRow
        label="Send a DM when someone ranks up"
        jargon="dm"
        help="A short congratulatory message in their inbox."
      >
        <Toggle checked={draft.dm} onChange={(v) => update("dm", v)} disabled={saving} />
      </SettingRow>

      <SettingRow
        label="Where to announce rank-ups"
        jargon="channel"
        help="Pick a text channel \u2014 leave blank to disable announcements."
      >
        <ChannelSelect
          guildId={guildId}
          value={draft.channel}
          onChange={(v) => update("channel", typeof v === "string" ? v : null)}
          channelTypes={[0, 5]}
          placeholder="None \u2014 silent"
          disabled={saving}
        />
        {!draft.dm && !draft.channel && enabledCount > 0 && (
          <p className="mt-1.5 text-[11px] text-amber-400">
            DMs are off and no channel is picked \u2014 members won't see rank-up notifications anywhere.
          </p>
        )}
      </SettingRow>
    </TaskDrawer>
  )
}
