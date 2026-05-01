// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 7 \u2014 Optional Accountability sessions.
//
//          Off by default. When the admin enables it, the channel pickers
//          go directly to the CORRECT table (schedule_guild_config) via
//          /api/dashboard/servers/[id]/schedule \u2014 not the dead
//          accountability_lobby/category guild_config columns the legacy
//          wizard wrote to (now also fixed in config.ts but this drawer
//          is the canonical source going forward).
// ============================================================
import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: SWR mutate for the BotPermBadge Try-again handler.
import { mutate as globalMutate } from "swr"
// --- END AI-MODIFIED ---
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import MobileSlider from "../MobileSlider"
import RecommendedPill from "../RecommendedPill"
import BotPermBadge, { type PermStatus } from "../BotPermBadge"
import ChannelSelect from "@/components/dashboard/ui/ChannelSelect"
import Toggle from "@/components/dashboard/ui/Toggle"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface ScheduleData {
  lobby_channel: string | null
  room_channel: string | null
  schedule_cost: number | null
  reward: number | null
  bonus_reward: number | null
}

interface BotPermResp {
  bot_present: boolean
  perms: { move_members: boolean; connect: boolean; speak: boolean; manage_channels: boolean }
}

const RECOMMENDED = { cost: 250, reward: 200, bonus: 100 }

export default function ScheduleTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/schedule`
  const permsKey = `/api/dashboard/servers/${guildId}/bot-permissions`
  const { data } = useDashboard<ScheduleData & Record<string, any>>(open ? apiKey : null)
  const { data: perms } = useDashboard<BotPermResp>(open ? permsKey : null)
  const [enabled, setEnabled] = useState(false)
  const [draft, setDraft] = useState<ScheduleData>({
    lobby_channel: null,
    room_channel: null,
    schedule_cost: RECOMMENDED.cost,
    reward: RECOMMENDED.reward,
    bonus_reward: RECOMMENDED.bonus,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Local "checking..." state for BotPermBadge Try-again button.
  const [retryingPerms, setRetryingPerms] = useState(false)
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (!data) return
    const isEnabled = !!(data.lobby_channel || data.room_channel)
    setEnabled(isEnabled)
    setDraft({
      lobby_channel: data.lobby_channel ?? null,
      room_channel: data.room_channel ?? null,
      schedule_cost: data.schedule_cost ?? RECOMMENDED.cost,
      reward: data.reward ?? RECOMMENDED.reward,
      bonus_reward: data.bonus_reward ?? RECOMMENDED.bonus,
    })
    setDirty(false)
  }, [data, open])

  function update<K extends keyof ScheduleData>(k: K, v: ScheduleData[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
    setDirty(true)
  }

  function toggleEnabled(v: boolean) {
    setEnabled(v)
    if (!v) {
      // Disabling = clear lobby + room. Sliders persist for next time.
      setDraft((d) => ({ ...d, lobby_channel: null, room_channel: null }))
    }
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

  let permStatus: PermStatus = "unknown"
  let permMessage = ""
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: retryable flag so we can pass it selectively to BotPermBadge
  // (only true when the error is the bot-not-in-server case).
  let permRetryable = false
  // --- END AI-MODIFIED ---
  if (perms && enabled) {
    if (!perms.bot_present) {
      permStatus = "error"
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: Empty message lets BotPermBadge default to its softer
      // "couldn't see the bot right now" copy paired with Try-again.
      permMessage = ""
      permRetryable = true
      // --- END AI-MODIFIED ---
    } else if (
      !perms.perms.move_members ||
      !perms.perms.connect ||
      !perms.perms.speak ||
      !perms.perms.manage_channels
    ) {
      permStatus = "error"
      const missing = [
        !perms.perms.move_members && "Move Members",
        !perms.perms.connect && "Connect",
        !perms.perms.speak && "Speak",
        !perms.perms.manage_channels && "Manage Channels",
      ].filter(Boolean).join(", ")
      permMessage = `The bot needs these permissions to run sessions: ${missing}.`
    } else {
      permStatus = "ok"
    }
  }

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Same Retry handler as Welcome/Notifications -- skip the API's
  // 5s negative cache and overwrite SWR's cache with the fresh payload.
  async function retryPermsLookup() {
    setRetryingPerms(true)
    try {
      const res = await fetch(`${permsKey}?refresh=true`)
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`)
      const fresh = await res.json()
      await globalMutate(permsKey, fresh, { revalidate: false })
      if (!fresh.bot_present) {
        toast("Still can't see the bot. If you just kicked + re-invited it, give Discord ~10 seconds.")
      }
    } catch (err: any) {
      toast.error(err?.message || "Couldn't re-check the bot \u2014 try again in a moment.")
    } finally {
      setRetryingPerms(false)
    }
  }
  // --- END AI-MODIFIED ---

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Accountability sessions"
      subtitle="Members book a 1-hour study slot, show up on time, earn rewards."
      icon={Calendar}
      returnFocusTo="setup-task-trigger-schedule"
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
          // Purpose: hasValue if the admin enabled the feature OR has a
          // lobby/category already configured (e.g. they're re-opening a
          // task that was set up before this widget existed).
          onComplete={onComplete}
          hasValue={!!(enabled || draft.lobby_channel || draft.room_channel)}
          // --- END AI-MODIFIED ---
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Used by groups that want a structured, scheduled co-working rhythm. Skip if you just want free-form voice study.
      </p>

      <SettingRow label="Turn on accountability sessions" help="When off, the booking system is hidden from members.">
        <Toggle checked={enabled} onChange={toggleEnabled} disabled={saving} />
      </SettingRow>

      {enabled && (
        <>
          {permStatus !== "unknown" && permStatus !== "ok" && (
            <div className="mb-4">
              {/* --- AI-MODIFIED (2026-04-30) ---
                  Purpose: Pass retryable+onRetry; suppress the role-fix
                  steps in the bot-not-in-server case (they don't apply). */}
              <BotPermBadge
                status={permStatus}
                message={permMessage}
                retryable={permRetryable}
                onRetry={permRetryable ? retryPermsLookup : undefined}
                retrying={retryingPerms}
                fix={
                  permRetryable
                    ? undefined
                    : [
                      "Open Server Settings \u2192 Roles in Discord.",
                      "Find the LionBot role.",
                      "Enable: Move Members, Connect, Speak, Manage Channels.",
                    ]
                }
              />
              {/* --- END AI-MODIFIED --- */}
            </div>
          )}

          <SettingRow
            label="Lobby voice channel"
            jargon={["lobby", "voice_category"]}
            help="Where members wait before sessions start. Pick a voice channel."
            required
          >
            <ChannelSelect
              guildId={guildId}
              value={draft.lobby_channel}
              onChange={(v) => update("lobby_channel", typeof v === "string" ? v : null)}
              channelTypes={[2]}
              placeholder="Pick a voice channel"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow
            label="Sessions category"
            jargon={["category", "voice_category"]}
            help="The voice category the bot creates session rooms inside."
            required
          >
            <ChannelSelect
              guildId={guildId}
              value={draft.room_channel}
              onChange={(v) => update("room_channel", typeof v === "string" ? v : null)}
              channelTypes={[4]}
              placeholder="Pick a voice category"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow
            label="Booking cost (LionCoins)"
            jargon="lioncoin"
            help="What a member pays to book a slot. Higher means slots feel committal; lower means casual."
            recommended={
              <RecommendedPill
                value={RECOMMENDED.cost}
                current={draft.schedule_cost}
                onSnap={() => update("schedule_cost", RECOMMENDED.cost)}
              />
            }
          >
            <MobileSlider
              value={draft.schedule_cost}
              onChange={(v) => update("schedule_cost", v)}
              min={0}
              max={1000}
              step={25}
              unit="coins"
              recommended={RECOMMENDED.cost}
              label="Booking cost"
            />
          </SettingRow>

          <SettingRow
            label="Attendance reward"
            help="Coins earned for showing up on time."
            recommended={
              <RecommendedPill
                value={RECOMMENDED.reward}
                current={draft.reward}
                onSnap={() => update("reward", RECOMMENDED.reward)}
              />
            }
          >
            <MobileSlider
              value={draft.reward}
              onChange={(v) => update("reward", v)}
              min={0}
              max={1000}
              step={25}
              unit="coins"
              recommended={RECOMMENDED.reward}
              label="Attendance reward"
            />
          </SettingRow>

          <SettingRow
            label="Streak bonus"
            help="Extra coins for consistent attendance across sessions."
            recommended={
              <RecommendedPill
                value={RECOMMENDED.bonus}
                current={draft.bonus_reward}
                onSnap={() => update("bonus_reward", RECOMMENDED.bonus)}
              />
            }
          >
            <MobileSlider
              value={draft.bonus_reward}
              onChange={(v) => update("bonus_reward", v)}
              min={0}
              max={500}
              step={25}
              unit="coins"
              recommended={RECOMMENDED.bonus}
              label="Streak bonus"
            />
          </SettingRow>
        </>
      )}
    </TaskDrawer>
  )
}
