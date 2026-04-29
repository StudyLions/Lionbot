// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 5 \u2014 Notification channels.
//          Four channels: activity log, mod log, mod alerts, pomodoro.
//          Each picker shows a one-line "this channel will receive ___"
//          plain-English line and a permission preflight badge.
// ============================================================
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import BotPermBadge, { type PermStatus } from "../BotPermBadge"
import ChannelSelect from "@/components/dashboard/ui/ChannelSelect"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface ConfigData {
  event_log_channel: string | null
  mod_log_channel: string | null
  alert_channel: string | null
  pomodoro_channel: string | null
}

interface BotPermResp {
  bot_present: boolean
  perms: { send_messages: boolean; embed_links: boolean }
}

const FIELDS: Array<{ key: keyof ConfigData; label: string; help: string }> = [
  {
    key: "event_log_channel",
    label: "Activity log channel",
    help: "Joins, leaves, voice sessions and member updates.",
  },
  {
    key: "mod_log_channel",
    label: "Moderation log channel",
    help: "Warns, mutes, ticket actions, and other mod events.",
  },
  {
    key: "alert_channel",
    label: "Mod alert channel",
    help: "Pings moderators when something needs attention.",
  },
  {
    key: "pomodoro_channel",
    label: "Pomodoro timer channel",
    help: "Where the bot posts the live focus-timer status.",
  },
]

export default function NotificationsTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/config`
  const permsKey = `/api/dashboard/servers/${guildId}/bot-permissions`
  const { data } = useDashboard<ConfigData & Record<string, any>>(open ? apiKey : null)
  const { data: perms } = useDashboard<BotPermResp>(open ? permsKey : null)
  const [draft, setDraft] = useState<ConfigData>({
    event_log_channel: null,
    mod_log_channel: null,
    alert_channel: null,
    pomodoro_channel: null,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setDraft({
      event_log_channel: data.event_log_channel ?? null,
      mod_log_channel: data.mod_log_channel ?? null,
      alert_channel: data.alert_channel ?? null,
      pomodoro_channel: data.pomodoro_channel ?? null,
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

  // Guild-level perms: if Send Messages or Embed Links is missing at the
  // server level the bot won't be able to post in any channel. Channel
  // overwrites are not yet checked (Phase 2 enhancement).
  let topPerm: PermStatus = "unknown"
  if (perms) {
    if (!perms.bot_present) topPerm = "error"
    else if (!perms.perms.send_messages || !perms.perms.embed_links) topPerm = "warning"
    else topPerm = "ok"
  }

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Notification channels"
      subtitle="Where the bot sends logs, alerts and timer status."
      icon={Bell}
      returnFocusTo="setup-task-trigger-notifications"
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
        Each of these is optional \u2014 leave any channel blank to silence that feature.
      </p>

      {topPerm === "warning" && (
        <div className="mb-4">
          <BotPermBadge
            status="warning"
            message="The bot is missing Send Messages or Embed Links at the server level. Some channels below won't work."
            fix={[
              "Open Server Settings \u2192 Roles in Discord.",
              "Find the LionBot role.",
              "Enable: Send Messages, Embed Links.",
            ]}
          />
        </div>
      )}
      {topPerm === "error" && (
        <div className="mb-4">
          <BotPermBadge status="error" message="The bot isn't in this server yet. Invite it first." />
        </div>
      )}

      {FIELDS.map((f) => (
        <SettingRow key={f.key} label={f.label} jargon="channel" help={f.help}>
          <ChannelSelect
            guildId={guildId}
            value={draft[f.key]}
            onChange={(v) => update(f.key, typeof v === "string" ? v : null)}
            channelTypes={[0, 5]}
            placeholder="None \u2014 silent"
            disabled={saving}
          />
        </SettingRow>
      ))}
    </TaskDrawer>
  )
}
