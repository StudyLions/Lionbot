// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Setup Checklist Task 1 \u2014 Server essentials.
//          Three short fields: timezone, admin role, moderator role.
//          See docs/setup-copy.md for the canonical copy.
// ============================================================
import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import TaskDrawer from "../TaskDrawer"
import SettingRow from "../SettingRow"
import DrawerFooter from "../DrawerFooter"
import TimezoneSelect from "../TimezoneSelect"
import RoleSelect from "@/components/dashboard/ui/RoleSelect"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { toast } from "@/components/dashboard/ui"
import type { TaskComponentProps } from "../SetupChecklist"

interface EssentialsConfig {
  timezone: string | null
  admin_role: string | null
  mod_role: string | null
}

export default function EssentialsTask({ guildId, open, onClose, onComplete, onSkip }: TaskComponentProps) {
  const apiKey = `/api/dashboard/servers/${guildId}/config`
  const { data: server } = useDashboard<EssentialsConfig & Record<string, any>>(open ? apiKey : null)
  const [draft, setDraft] = useState<EssentialsConfig>({ timezone: null, admin_role: null, mod_role: null })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Sync server state into the draft on open and on subsequent fetches.
  useEffect(() => {
    if (!server) return
    setDraft({
      timezone: server.timezone ?? null,
      admin_role: server.admin_role ?? null,
      mod_role: server.mod_role ?? null,
    })
    setDirty(false)
  }, [server, open])

  function update<K extends keyof EssentialsConfig>(key: K, value: EssentialsConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setDirty(true)
  }

  async function save(thenComplete = true) {
    setSaving(true)
    try {
      await dashboardMutate("PATCH", apiKey, draft)
      invalidate(apiKey)
      invalidate(`/api/dashboard/servers/${guildId}/setup-checklist`)
      toast.success("Saved.")
      if (thenComplete) {
        onComplete()
        onClose()
      }
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
      title="Server essentials"
      subtitle="Three quick basics so the bot knows your server."
      icon={Settings}
      returnFocusTo="setup-task-trigger-essentials"
      footer={
        <DrawerFooter
          onSkip={() => {
            onSkip()
            onClose()
          }}
          onSave={() => save(true)}
          onClose={onClose}
          saving={saving}
          dirty={dirty}
        />
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Without these, leaderboards show the wrong times and only Discord owners can change settings.
      </p>

      <SettingRow
        label="Server timezone"
        help="Used for daily resets and your &quot;today&quot; statistics."
        required
      >
        <TimezoneSelect
          value={draft.timezone}
          onChange={(v) => update("timezone", v)}
          disabled={saving}
        />
      </SettingRow>

      <SettingRow
        label="Admin role"
        jargon="role"
        help="Members with this role can change every bot setting."
      >
        <RoleSelect
          guildId={guildId}
          value={draft.admin_role}
          onChange={(v) => update("admin_role", typeof v === "string" ? v : null)}
          placeholder="None — Discord owners only"
          disabled={saving}
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Empty? Only Discord server owners and members with the Administrator permission can change bot settings.
        </p>
      </SettingRow>

      <SettingRow
        label="Moderator role"
        jargon="role"
        help="Mods can warn, mute and remove people."
      >
        <RoleSelect
          guildId={guildId}
          value={draft.mod_role}
          onChange={(v) => update("mod_role", typeof v === "string" ? v : null)}
          placeholder="None — admins only"
          disabled={saving}
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Empty? Moderation features only work for full admins.
        </p>
      </SettingRow>

      {/* Done-without-saving shortcut for admins who just want to confirm */}
      {!dirty && server && (server.timezone || server.admin_role || server.mod_role) && (
        <div className="mt-5 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={() => {
              onComplete()
              onClose()
            }}
            disabled={saving}
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            These look right — mark as done
          </button>
        </div>
      )}

      {/* --- AI-MODIFIED (2026-04-29) ---
          Purpose: Fill the empty space at the bottom of the drawer with a
          reassuring note. Without this the panel reads as "is this broken?"
          when the form is short. Doubles as a trust signal: nothing here
          is permanent. */}
      <div className="mt-8 pt-5 border-t border-border/30 text-[12px] text-muted-foreground/80 leading-relaxed">
        <p>
          You can change all of these any time from <strong className="font-medium text-foreground/80">Settings</strong>.
          Nothing here is permanent — feel free to skip a field and come back to it later.
        </p>
      </div>
      {/* --- END AI-MODIFIED --- */}
    </TaskDrawer>
  )
}
