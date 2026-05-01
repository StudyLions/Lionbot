// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 4 \u2014 Welcome new members.
//          Greeting channel + greeting message + (optional) returning member
//          message. Includes per-channel bot permission preflight (Send
//          Messages, Embed Links) and a "Send test greeting" button.
//
//          The "Send test" feature is implemented in this Phase 1 ship as a
//          stub that hits a not-yet-built endpoint; if the endpoint is
//          missing it surfaces a friendly "coming soon" message. Wire-up to
//          the bot's IPC happens in a follow-up.
// ============================================================
import { useEffect, useState } from "react"
import { Hand, Send } from "lucide-react"
// --- AI-MODIFIED (2026-04-30) ---
// Purpose: Use SWR mutate to overwrite the perms cache after a Try-again.
import { mutate as globalMutate } from "swr"
// --- END AI-MODIFIED ---
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import BotPermBadge, { type PermStatus } from "../BotPermBadge"
import ChannelSelect from "@/components/dashboard/ui/ChannelSelect"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface ConfigData {
  greeting_channel: string | null
  greeting_message: string | null
  returning_message: string | null
}

interface BotPermResp {
  bot_present: boolean
  perms: { send_messages: boolean; embed_links: boolean }
}

const TEMPLATES = {
  warm: "Welcome {mention} to {server}! \u{1F44B} We're glad you're here \u2014 grab a seat and study with us.",
  brief: "Welcome {mention}!",
  study: "{mention} just joined. Pop into a voice channel and start a study session whenever you're ready.",
}

export default function WelcomeTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/config`
  const permsKey = `/api/dashboard/servers/${guildId}/bot-permissions`
  const { data } = useDashboard<ConfigData & Record<string, any>>(open ? apiKey : null)
  const { data: perms } = useDashboard<BotPermResp>(open ? permsKey : null)
  const [draft, setDraft] = useState<ConfigData>({
    greeting_channel: null,
    greeting_message: null,
    returning_message: null,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Local state for the BotPermBadge Try-again spinner.
  const [retryingPerms, setRetryingPerms] = useState(false)
  // --- END AI-MODIFIED ---

  useEffect(() => {
    if (!data) return
    setDraft({
      greeting_channel: data.greeting_channel ?? null,
      greeting_message: data.greeting_message ?? null,
      returning_message: data.returning_message ?? null,
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

  async function sendTest() {
    if (!draft.greeting_channel) return
    setSendingTest(true)
    try {
      // POST to a (not-yet-built) test-message endpoint. If it returns 404,
      // tell the admin it's coming soon rather than swallowing the error.
      const res = await fetch(
        `/api/dashboard/servers/${guildId}/welcome-test`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel_id: draft.greeting_channel }) },
      )
      if (res.status === 404) {
        toast("Test sending will be available in the next release.")
        return
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Test failed (${res.status})`)
      toast.success("Test greeting sent.")
    } catch (err: any) {
      toast.error(err?.message || "Couldn't send the test \u2014 try again.")
    } finally {
      setSendingTest(false)
    }
  }

  // Compute the preflight badge state from bot perms.
  let permStatus: PermStatus = "unknown"
  let permMessage = ""
  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Track whether the error is the bot-not-in-server case so we
  // can pass `retryable` selectively (admin can't "try again" for missing
  // Send Messages -- they have to fix it in Discord).
  let permRetryable = false
  // --- END AI-MODIFIED ---
  if (perms && draft.greeting_channel) {
    if (!perms.bot_present) {
      permStatus = "error"
      // --- AI-MODIFIED (2026-04-30) ---
      // Purpose: Drop the hard-coded "Re-invite it before configuring" copy
      // so the BotPermBadge default ("We couldn't see the bot in this
      // server right now...") is shown alongside the Try-again button.
      permMessage = ""
      permRetryable = true
      // --- END AI-MODIFIED ---
    } else if (!perms.perms.send_messages || !perms.perms.embed_links) {
      permStatus = "error"
      const missing = [
        !perms.perms.send_messages && "Send Messages",
        !perms.perms.embed_links && "Embed Links",
      ].filter(Boolean).join(" + ")
      permMessage = `The bot is missing ${missing} \u2014 the greeting won't post.`
    } else {
      permStatus = "ok"
    }
  }

  // --- AI-MODIFIED (2026-04-30) ---
  // Purpose: Retry handler -- hits the perms endpoint with ?refresh=true to
  // skip the API's 5s negative cache, then writes the fresh payload into
  // SWR for the bare permsKey.
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
      title="Welcome new members"
      subtitle="Greet people when they join your server."
      icon={Hand}
      returnFocusTo="setup-task-trigger-welcome"
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
          // Purpose: hasValue=true once the admin has either picked a
          // greeting channel OR written a custom message. Without one of
          // those there's nothing meaningful to confirm yet.
          onComplete={onComplete}
          hasValue={!!(draft.greeting_channel || draft.greeting_message)}
          // --- END AI-MODIFIED ---
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        First impressions matter. Personalised greetings make new members much more likely to stick around.
      </p>

      <SettingRow
        label="Channel to post greetings"
        jargon="channel"
        help="Pick a text channel — usually #welcome or #general."
      >
        <ChannelSelect
          guildId={guildId}
          value={draft.greeting_channel}
          onChange={(v) => update("greeting_channel", typeof v === "string" ? v : null)}
          channelTypes={[0, 5]}
          placeholder="No greetings"
          disabled={saving}
        />
        {permStatus !== "unknown" && (
          <div className="mt-2">
            {/* --- AI-MODIFIED (2026-04-30) ---
                Purpose: Wire retryable/onRetry/retrying. Suppress the per-
                channel "Open the channel \u2192 Permissions" fix list when the
                error is the bot-not-in-server case (those steps don't apply
                if the bot isn't present). */}
            <BotPermBadge
              status={permStatus}
              message={permMessage}
              retryable={permRetryable}
              onRetry={permRetryable ? retryPermsLookup : undefined}
              retrying={retryingPerms}
              fix={
                permStatus === "error" && !permRetryable
                  ? [
                    "Open the channel in Discord.",
                    "Tap the gear \u2192 Permissions.",
                    "Add the LionBot role.",
                    "Tick: Send Messages, Embed Links.",
                  ]
                  : undefined
              }
            />
            {/* --- END AI-MODIFIED --- */}
          </div>
        )}
      </SettingRow>

      <SettingRow
        label="Welcome message"
        jargon="mention"
        help="Use {mention} to ping the new member, {server} for your server name."
      >
        <textarea
          value={draft.greeting_message ?? ""}
          onChange={(e) => update("greeting_message", e.target.value || null)}
          rows={3}
          placeholder={TEMPLATES.warm}
          // 16px font prevents iOS auto-zoom on focus.
          className="w-full px-3 py-2 text-base bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-y min-h-[88px]"
          disabled={saving}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-[11px] text-muted-foreground self-center mr-1">Templates:</span>
          {(Object.entries(TEMPLATES) as Array<[keyof typeof TEMPLATES, string]>).map(([id, tpl]) => (
            <button
              key={id}
              type="button"
              onClick={() => update("greeting_message", tpl)}
              className="min-h-[32px] px-2.5 py-1 rounded-full text-[11px] font-medium text-foreground/80 bg-muted hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring capitalize"
            >
              {id}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span>Tokens you can use:</span>
          {["{mention}", "{user}", "{server}"].map((t) => (
            <code key={t} className="px-1.5 py-0.5 rounded bg-muted text-foreground/80 font-mono">{t}</code>
          ))}
        </div>
      </SettingRow>

      <SettingRow
        label="Message for returning members"
        help="Optional — shown when someone re-joins your server."
      >
        <textarea
          value={draft.returning_message ?? ""}
          onChange={(e) => update("returning_message", e.target.value || null)}
          rows={2}
          placeholder="Welcome back {mention}!"
          className="w-full px-3 py-2 text-base bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-y min-h-[64px]"
          disabled={saving}
        />
      </SettingRow>

      <div className="pt-2">
        <button
          type="button"
          onClick={sendTest}
          disabled={!draft.greeting_channel || sendingTest || saving || permStatus === "error"}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md text-sm font-medium bg-muted text-foreground/90 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          title={!draft.greeting_channel ? "Pick a channel first" : undefined}
        >
          <Send size={14} aria-hidden="true" />
          {sendingTest ? "Sending\u2026" : "Send a test greeting to me"}
        </button>
      </div>
    </TaskDrawer>
  )
}
