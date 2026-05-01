// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Setup Checklist Premium Task -- Anti-AFK in study rooms.
//          Inline mini-form: enable toggle + action picker (kick / move
//          to AFK / pause tracking) + grace period slider. The full
//          editor (warning message customization, channel allow-list,
//          exempt roles, notification settings) lives at
//          /dashboard/servers/[id]/anti-afk and is reachable via the
//          "More options" link at the bottom.
// ============================================================
import { useEffect, useState } from "react"
import { ShieldOff, ExternalLink } from "lucide-react"
import TaskDrawer from "../../TaskDrawer"
import SettingRow from "../../SettingRow"
import DrawerFooter from "../../DrawerFooter"
import MobileSlider from "../../MobileSlider"
import RecommendedPill from "../../RecommendedPill"
import Toggle from "@/components/dashboard/ui/Toggle"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../../SetupChecklist"

interface AntiAfkConfig {
  enabled: boolean
  action: string
  grace_period: number
  check_interval: number
}

interface AntiAfkResponse {
  config: AntiAfkConfig & Record<string, any>
  isPremium: boolean
  hasAfkChannel: boolean
  afkTimeout: number | null
}

const RECOMMENDED = { grace: 5 }

// Action choices that mirror the bot's accepted values. We deliberately
// don't expose "warn" / "max_warnings" / "warning_message" here -- if
// admins want that depth they jump to the full editor.
type Action = "kick" | "pause" | "move_afk"
const ACTION_LABELS: Record<Action, { title: string; subtitle: string }> = {
  kick: {
    title: "Disconnect them from voice",
    subtitle: "Frees up the slot for someone who'll actually study.",
  },
  move_afk: {
    title: "Move them to the AFK channel",
    subtitle: "Quietly relocates them. Requires an AFK channel in Discord.",
  },
  pause: {
    title: "Pause their study tracking",
    subtitle: "Doesn't kick — just stops the clock until they engage.",
  },
}

export default function AntiAfkTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/anti-afk`
  const editorUrl = `/dashboard/servers/${guildId}/anti-afk`
  const { data } = useDashboard<AntiAfkResponse>(open ? apiKey : null)

  const [draft, setDraft] = useState<AntiAfkConfig>({
    enabled: false,
    action: "kick",
    grace_period: RECOMMENDED.grace,
    check_interval: 60,
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data?.config) return
    setDraft({
      enabled: !!data.config.enabled,
      action: data.config.action || "kick",
      grace_period: data.config.grace_period ?? RECOMMENDED.grace,
      check_interval: data.config.check_interval ?? 60,
    })
    setDirty(false)
  }, [data, open])

  function update<K extends keyof AntiAfkConfig>(k: K, v: AntiAfkConfig[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      await dashboardMutate("PATCH", apiKey, {
        enabled: draft.enabled,
        action: draft.action,
        grace_period: draft.grace_period,
        check_interval: draft.check_interval,
      })
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

  // Disable the "Move to AFK" choice if the guild has no AFK channel set
  // up in Discord -- the bot API rejects it server-side anyway, so we
  // surface the constraint up front instead of letting Save fail.
  const moveAfkDisabled = !data?.hasAfkChannel

  return (
    <TaskDrawer
      open={open}
      onClose={onClose}
      title="Anti-AFK in study rooms"
      subtitle="Quietly remove members who go idle in voice for too long."
      icon={ShieldOff}
      returnFocusTo="setup-task-trigger-anti_afk"
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
          onComplete={onComplete}
          // hasValue once the admin has enabled it OR explicitly toggled
          // any setting. With enabled=false and pristine defaults, the
          // primary button reads "Close" so they don't accidentally mark
          // a never-touched feature as done.
          hasValue={draft.enabled}
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Big study servers run into the same problem: members park in voice,
        forget about it, and the channel feels less alive. Anti-AFK
        catches that and frees up the slot.
      </p>

      <SettingRow
        label="Turn on anti-AFK"
        help="When off, members can stay idle in voice forever."
      >
        <Toggle checked={draft.enabled} onChange={(v) => update("enabled", v)} disabled={saving} />
      </SettingRow>

      {draft.enabled && (
        <>
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-foreground">When someone goes idle</p>
            <div className="space-y-2">
              {(Object.keys(ACTION_LABELS) as Action[]).map((opt) => {
                const isDisabled = opt === "move_afk" && moveAfkDisabled
                const checked = draft.action === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !isDisabled && update("action", opt)}
                    disabled={saving || isDisabled}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      checked
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted/50"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-pressed={checked}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`shrink-0 w-4 h-4 rounded-full border-2 ${
                          checked ? "border-primary bg-primary/20" : "border-border"
                        }`}
                      >
                        {checked && (
                          <span className="block w-2 h-2 rounded-full bg-primary mx-auto mt-[3px]" aria-hidden="true" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{ACTION_LABELS[opt].title}</div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed">
                          {ACTION_LABELS[opt].subtitle}
                          {isDisabled && (
                            <span className="block mt-0.5 text-amber-400">
                              Set an AFK channel in Discord Server Settings to enable this.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <SettingRow
            label="Grace period before action"
            help="How many minutes a member can be silent before Leo steps in."
            recommended={
              <RecommendedPill
                value={RECOMMENDED.grace}
                current={draft.grace_period}
                onSnap={() => update("grace_period", RECOMMENDED.grace)}
              />
            }
          >
            <MobileSlider
              value={draft.grace_period}
              onChange={(v) => update("grace_period", v)}
              min={2}
              max={14}
              step={1}
              unit="min"
              recommended={RECOMMENDED.grace}
              label="Grace period"
            />
          </SettingRow>
        </>
      )}

      <a
        href={editorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        More options (warning message, allow-list, exempt roles)
        <ExternalLink size={12} aria-hidden="true" />
      </a>
    </TaskDrawer>
  )
}
