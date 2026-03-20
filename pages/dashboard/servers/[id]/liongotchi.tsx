// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: LionGotchi server settings page for admins
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import {
  SectionCard, SettingRow, Toggle, NumberInput, TextInput,
  ChannelSelect, RoleSelect, SaveBar, PageHeader, toast,
} from "@/components/dashboard/ui"
import { useDashboard, dashboardMutate } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useCallback, useMemo } from "react"
import {
  PawPrint, Bell, Hash, Shield, Power,
} from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface LGConfig {
  lg_enabled: boolean | null
  lg_drop_channel: string | null
  lg_guild_display_name: string | null
  lg_teaser_enabled: boolean | null
  lg_activity_role: string | null
  lg_drop_delete_after: number | null
}

const DEFAULTS: LGConfig = {
  lg_enabled: true,
  lg_drop_channel: null,
  lg_guild_display_name: null,
  lg_teaser_enabled: true,
  lg_activity_role: null,
  lg_drop_delete_after: null,
}

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9 ]*$/

export default function LionGotchiSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const { data: configData, error, isLoading: loading, mutate } = useDashboard<LGConfig>(
    id && session ? `/api/dashboard/servers/${id}/liongotchi-config` : null
  )

  const [config, setConfig] = useState<LGConfig | null>(null)
  const [original, setOriginal] = useState<LGConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)

  useEffect(() => {
    if (configData) {
      setConfig(configData)
      setOriginal({ ...configData })
    } else if (!loading && !configData) {
      setConfig(null)
      setOriginal(null)
    }
  }, [configData, loading])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges) handleSave()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  })

  const set = useCallback(<K extends keyof LGConfig>(key: K, value: LGConfig[K]) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const isModified = useCallback((key: keyof LGConfig) => {
    if (!config || !original) return false
    return JSON.stringify(config[key]) !== JSON.stringify(original[key])
  }, [config, original])

  const hasChanges = config && original && JSON.stringify(config) !== JSON.stringify(original)

  const changeCount = useMemo(() => {
    if (!config || !original) return 0
    let count = 0
    for (const key of Object.keys(config) as (keyof LGConfig)[]) {
      if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) count++
    }
    return count
  }, [config, original])

  const handleSave = async () => {
    if (!config || !original || !hasChanges || !id) return

    if (displayNameError) {
      toast.error(displayNameError)
      return
    }

    setSaving(true)
    try {
      const changes: Record<string, any> = {}
      for (const key of Object.keys(config) as (keyof LGConfig)[]) {
        if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
          changes[key] = config[key]
        }
      }

      await dashboardMutate("PATCH", `/api/dashboard/servers/${id}/liongotchi-config`, changes)

      setOriginal({ ...config })
      mutate()
      toast.success(`Saved ${Object.keys(changes).length} LionGotchi setting${Object.keys(changes).length !== 1 ? "s" : ""} successfully`)
    } catch {
      toast.error("Failed to save. Check your permissions.")
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (original) setConfig({ ...original })
    setDisplayNameError(null)
  }

  const handleDisplayNameChange = (value: string | null) => {
    const v = value ?? ""
    if (v.length > 12) {
      setDisplayNameError("Display name must be 12 characters or fewer")
      return
    }
    if (!DISPLAY_NAME_REGEX.test(v)) {
      setDisplayNameError("Only English letters, numbers, and spaces allowed")
      return
    }
    setDisplayNameError(null)
    set("lg_guild_display_name", v || null)
  }

  const lgEnabled = config?.lg_enabled ?? true

  return (
    <Layout SEO={{ title: `LionGotchi Settings - LionBot`, description: "LionGotchi server settings" }}>
      <AdminGuard>
        <div className="min-h-screen bg-background pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <ServerNav serverId={guildId} serverName="..." isAdmin isMod />

            <div className="flex-1 min-w-0">
              <PageHeader
                title="LionGotchi Settings"
                description="Configure how LionGotchi works in your server. These settings control pet activity, drop notifications, and what your server looks like on users' Gameboy screens."
              />

              {loading && (
                <div className="space-y-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 border border-border rounded-xl p-5 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  Failed to load LionGotchi settings. Make sure you have administrator permissions.
                </div>
              )}

              {!loading && config && (
                <div className="space-y-5 mt-6">

                  {/* General */}
                  <SectionCard
                    title="General"
                    description="Master toggle and server display name"
                    icon={<PawPrint size={18} />}
                  >
                    <SettingRow
                      label="Enable LionGotchi"
                      description="When disabled, all pet activity (XP, gold, drops, teasers) is paused for everyone in this server"
                      isModified={isModified("lg_enabled")}
                    >
                      <Toggle
                        checked={config.lg_enabled ?? true}
                        onChange={(v) => set("lg_enabled", v)}
                      />
                    </SettingRow>

                    <SettingRow
                      label="Server Display Name"
                      description="Custom name shown on users' Gameboy screens (max 12 characters, English letters/numbers/spaces only). If empty, your Discord server name is used."
                      tooltip="This appears on the Gameboy GUI next to the pet name. Keep it short and recognizable."
                      defaultBadge="Discord server name"
                      isModified={isModified("lg_guild_display_name")}
                    >
                      <div className="w-full max-w-xs">
                        <TextInput
                          value={config.lg_guild_display_name || ""}
                          onChange={handleDisplayNameChange}
                          placeholder="e.g. StudyHQ"
                          maxLength={12}
                        />
                        {displayNameError && (
                          <p className="mt-1 text-xs text-red-400">{displayNameError}</p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {(config.lg_guild_display_name || "").length}/12 characters
                        </p>
                      </div>
                    </SettingRow>
                  </SectionCard>

                  {/* Drop Notifications */}
                  <SectionCard
                    title="Drop Notifications"
                    description="Control where and how item drop alerts appear"
                    icon={<Bell size={18} />}
                  >
                    {!lgEnabled && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                        <Power size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/90 leading-relaxed">
                          LionGotchi is disabled for this server. These settings will take effect when you re-enable it.
                        </p>
                      </div>
                    )}

                    <SettingRow
                      label="Drop Channel"
                      description="Channel where item drop notifications are sent. If not set, drops appear in the user's active channel."
                      tooltip="Setting a dedicated drop channel keeps other channels clean. Drop notifications sent to this channel won't auto-delete."
                      isModified={isModified("lg_drop_channel")}
                    >
                      <ChannelSelect
                        guildId={guildId}
                        value={config.lg_drop_channel ?? null}
                        onChange={(v) => set("lg_drop_channel", (v as string) || null)}
                        channelTypes={[0, 5]}
                        placeholder="User's active channel"
                      />
                    </SettingRow>

                    <SettingRow
                      label="Auto-Delete Timer"
                      description="Seconds before drop notifications auto-delete (10-600). Leave empty for default behavior (30s in active channel, permanent in drop channel)."
                      tooltip="Lower values keep channels cleaner. Higher values give users more time to see their drops."
                      defaultBadge="30s active / permanent drop ch"
                      isModified={isModified("lg_drop_delete_after")}
                    >
                      <NumberInput
                        value={config.lg_drop_delete_after}
                        onChange={(v) => set("lg_drop_delete_after", v)}
                        unit="seconds"
                        min={10}
                        max={600}
                        allowNull
                        placeholder="Default"
                      />
                    </SettingRow>
                  </SectionCard>

                  {/* Activity & Access */}
                  <SectionCard
                    title="Activity & Access"
                    description="Control who earns pet rewards and teaser messages"
                    icon={<Shield size={18} />}
                  >
                    {!lgEnabled && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                        <Power size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/90 leading-relaxed">
                          LionGotchi is disabled for this server. These settings will take effect when you re-enable it.
                        </p>
                      </div>
                    )}

                    <SettingRow
                      label="Activity Role"
                      description="Only members with this role earn pet XP, gold, and item drops in this server. Leave empty to allow all members."
                      tooltip="Useful for restricting LionGotchi to verified members, study-role holders, or premium members."
                      defaultBadge="All members"
                      isModified={isModified("lg_activity_role")}
                    >
                      <RoleSelect
                        guildId={guildId}
                        value={config.lg_activity_role ?? null}
                        onChange={(v) => set("lg_activity_role", (v as string) || null)}
                        placeholder="All members (no restriction)"
                        excludeManaged
                        excludeEveryone
                      />
                    </SettingRow>

                    <SettingRow
                      label="Teaser Messages"
                      description="Occasionally show 'Get a pet!' messages to members who don't have a LionGotchi yet"
                      tooltip="Teasers have a 5% chance of appearing when a non-pet user is active. They encourage members to adopt a pet."
                      isModified={isModified("lg_teaser_enabled")}
                    >
                      <Toggle
                        checked={config.lg_teaser_enabled ?? true}
                        onChange={(v) => set("lg_teaser_enabled", v)}
                      />
                    </SettingRow>
                  </SectionCard>

                </div>
              )}

              <SaveBar
                show={!!hasChanges}
                onSave={handleSave}
                onReset={handleReset}
                saving={saving}
                label={changeCount > 0 ? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""}` : undefined}
              />
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "dashboard", "server"])),
  },
})
