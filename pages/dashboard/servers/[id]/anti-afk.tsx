// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: Anti AFK System premium feature dashboard page.
//          Admins configure activity checks for voice channel
//          users. Website-only config, no bot commands.
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import ServerGuard from "@/components/dashboard/ServerGuard"
import ServerNav from "@/components/dashboard/ServerNav"
import DashboardShell from "@/components/dashboard/ui/DashboardShell"
import {
  PageHeader, SectionCard, Toggle, NumberInput,
  ChannelSelect, RoleSelect, SaveBar, toast,
} from "@/components/dashboard/ui"
import PremiumGate from "@/components/dashboard/PremiumGate"
import { useDashboard, dashboardMutate, invalidate } from "@/hooks/useDashboard"
import { useRouter } from "next/router"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ShieldAlert, UserX, Pause, ArrowRightLeft,
  Video, Users, Bell, MessageSquare, Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// ── Types ────────────────────────────────────────────────

interface AntiAfkConfig {
  guildid: string
  enabled: boolean
  check_interval: number
  grace_period: number
  action: string
  max_warnings: number
  min_users: number
  warning_message: string
  exempt_roles: string[]
  target_channels: string[]
  exclude_channels: string[]
  use_dms: boolean
  prompt_channelid: string | null
  fallback_channelid: string | null
  skip_streaming: boolean
  notify_on_action: boolean
  notification_channelid: string | null
  max_actions_per_hour: number
}

// --- AI-MODIFIED (2026-04-07) ---
// Purpose: Add hasAfkChannel to disable Move to AFK when server has no AFK channel
interface ApiResponse {
  config: AntiAfkConfig
  isPremium: boolean
  hasAfkChannel: boolean
}
// --- END AI-MODIFIED ---

const DEFAULT_CONFIG: AntiAfkConfig = {
  guildid: "",
  enabled: false,
  check_interval: 60,
  grace_period: 5,
  action: "kick",
  max_warnings: 1,
  min_users: 1,
  warning_message: "Are you still studying?",
  exempt_roles: [],
  target_channels: [],
  exclude_channels: [],
  use_dms: false,
  prompt_channelid: null,
  fallback_channelid: null,
  skip_streaming: true,
  notify_on_action: true,
  notification_channelid: null,
  max_actions_per_hour: 100,
}

const ACTION_OPTIONS = [
  {
    id: "kick",
    label: "Disconnect",
    description: "Remove from voice channel",
    Icon: UserX,
  },
  {
    id: "pause",
    label: "Pause Session",
    description: "Stop earning coins",
    Icon: Pause,
  },
  {
    id: "move_afk",
    label: "Move to AFK",
    description: "Move to server's AFK channel",
    Icon: ArrowRightLeft,
  },
] as const

// ── Component ────────────────────────────────────────────

export default function AntiAfkPage() {
  const router = useRouter()
  const { id } = router.query
  const guildId = id as string

  const apiUrl = id ? `/api/dashboard/servers/${id}/anti-afk` : null
  const { data: apiData, isLoading } = useDashboard<ApiResponse>(apiUrl)
  const { data: serverData } = useDashboard<any>(
    id ? `/api/dashboard/servers/${id}` : null,
  )
  const serverName = serverData?.server?.name || "Server"
  const isPremium = apiData?.isPremium ?? false
  // --- AI-MODIFIED (2026-04-07) ---
  // Purpose: Track whether guild has an AFK channel for disabling move_afk option
  const hasAfkChannel = apiData?.hasAfkChannel ?? false
  // --- END AI-MODIFIED ---

  const [config, setConfig] = useState<AntiAfkConfig>(DEFAULT_CONFIG)
  const [original, setOriginal] = useState<AntiAfkConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    if (!apiData?.config) return
    // --- AI-MODIFIED (2026-04-07) ---
    // Purpose: If move_afk was saved but guild lost its AFK channel, fall back to kick
    const loaded = { ...apiData.config }
    if (loaded.action === "move_afk" && apiData.hasAfkChannel === false) {
      loaded.action = "kick"
    }
    // --- END AI-MODIFIED ---
    setConfig(loaded)
    setOriginal(loaded)
  }, [apiData])

  const hasChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(original),
    [config, original],
  )

  const update = useCallback((patch: Partial<AntiAfkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const body: any = {}
      for (const key of Object.keys(config) as (keyof AntiAfkConfig)[]) {
        if (JSON.stringify(config[key]) !== JSON.stringify(original[key])) {
          body[key] = config[key]
        }
      }
      if (Object.keys(body).length === 0) return

      const result = await dashboardMutate(
        "PATCH",
        `/api/dashboard/servers/${guildId}/anti-afk`,
        body,
      )
      invalidate(apiUrl!)
      if (result?.config) {
        setConfig(result.config)
        setOriginal(result.config)
      }
      toast.success("Anti AFK settings saved! Changes apply within 1-2 minutes.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings")
    }
  }, [config, original, guildId, apiUrl])

  const handleReset = useCallback(() => {
    setConfig(original)
  }, [original])

  return (
    <Layout SEO={{ title: "Anti AFK System - LionBot Dashboard", description: "Configure voice channel activity checks" }}>
      <AdminGuard>
        <ServerGuard requiredLevel="admin">
          <DashboardShell nav={<ServerNav serverId={guildId} serverName={serverName} isAdmin isMod />}>
            <PageHeader
              title="Anti AFK System"
              description="Automatically check if voice channel users are still active. Users who don't respond get disconnected, paused, or moved."
            />

            {isLoading ? (
              <div className="space-y-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !isPremium ? (
              <PremiumGate
                title="Anti AFK System"
                subtitle="Keep your voice channels honest. The Anti AFK System automatically checks that users in your voice channels are still active — and takes action on those who aren't responding."
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {ACTION_OPTIONS.map(({ id, label, description, Icon }) => (
                    <div
                      key={id}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Icon size={24} className="text-amber-400/70" />
                      <span className="text-sm font-medium text-gray-200">{label}</span>
                      <span className="text-xs text-gray-400 text-center">{description}</span>
                    </div>
                  ))}
                </div>
              </PremiumGate>
            ) : (
              <div className="space-y-6 mt-6">
                {/* ── Section 1: System Control ── */}
                <SectionCard
                  title="System Control"
                  description="Enable or disable the Anti AFK system for this server"
                  icon={<ShieldAlert size={16} />}
                >
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          config.enabled ? "bg-green-400" : "bg-gray-500",
                        )}
                      />
                      <span className="text-sm text-gray-400">
                        {config.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Toggle
                      checked={config.enabled}
                      onChange={(v) => update({ enabled: v })}
                    />
                  </div>
                </SectionCard>

                {/* ── Section 2: Check Settings ── */}
                <SectionCard title="Check Settings" icon={<ShieldAlert size={16} />}>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Check Interval (minutes)
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        How often each user is prompted to confirm they're still active. <span className="text-gray-500">(15–180 min)</span>
                      </p>
                      <NumberInput
                        value={config.check_interval}
                        onChange={(v) => update({ check_interval: v ?? 60 })}
                        min={15}
                        max={180}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Grace Period (minutes)
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        How long users have to click the confirmation button. <span className="text-gray-500">(2–14 min)</span>
                      </p>
                      <NumberInput
                        value={config.grace_period}
                        onChange={(v) => update({ grace_period: v ?? 5 })}
                        min={2}
                        max={14}
                      />
                    </div>

                    {/* --- AI-MODIFIED (2026-04-07) --- */}
                    {/* Purpose: Disable Move to AFK when server has no AFK channel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Action on Failure
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ACTION_OPTIONS.map(({ id, label, description, Icon }) => {
                          const disabled = id === "move_afk" && !hasAfkChannel
                          return (
                            <button
                              key={id}
                              onClick={() => !disabled && update({ action: id })}
                              disabled={disabled}
                              className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                                disabled
                                  ? "bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed opacity-50"
                                  : config.action === id
                                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300",
                              )}
                            >
                              <Icon size={20} />
                              <span className="text-sm font-medium">{label}</span>
                              <span className="text-[11px] text-center opacity-70">
                                {disabled ? "No AFK channel in this server" : description}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {/* --- END AI-MODIFIED --- */}

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Max Warnings Before Action
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Number of missed checks before the action is applied. Users receive warning messages for each miss until this limit is reached. <span className="text-gray-500">(1–5)</span>
                      </p>
                      <NumberInput
                        value={config.max_warnings}
                        onChange={(v) => update({ max_warnings: v ?? 1 })}
                        min={1}
                        max={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Min Users in Channel
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Only run checks when this many users are in the channel. Set to 1 to always check. <span className="text-gray-500">(1–10)</span>
                      </p>
                      <NumberInput
                        value={config.min_users}
                        onChange={(v) => update({ min_users: v ?? 1 })}
                        min={1}
                        max={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Custom Warning Message
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        The text shown to users when they're prompted to confirm. Max 500 characters.
                      </p>
                      <textarea
                        value={config.warning_message}
                        onChange={(e) => update({ warning_message: e.target.value })}
                        maxLength={500}
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                        placeholder="Are you still studying?"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {config.warning_message.length}/500
                      </p>

                      {/* Live preview */}
                      <div className="mt-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700/50">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Preview</p>
                        <div className="bg-[#2b2d31] rounded-md p-3 border-l-4 border-amber-500">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert size={14} className="text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">Anti AFK Check</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            @you {config.warning_message || "Are you still studying?"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Click the button below within <strong>{config.grace_period} minute{config.grace_period !== 1 ? "s" : ""}</strong> to confirm.
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#248046] text-white text-xs px-3 py-1.5 rounded">
                            ✅ I'm still here!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* ── Section 3: Delivery Method ── */}
                {/* --- AI-MODIFIED (2026-04-07) --- */}
                {/* Purpose: Add "Custom Channel" as a third delivery option */}
                <SectionCard title="Delivery Method" icon={<MessageSquare size={16} />}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        How should prompts be delivered?
                      </label>
                      {(() => {
                        const mode = config.prompt_channelid ? "custom" : config.use_dms ? "dm" : "vc"
                        return (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                onClick={() => update({ use_dms: false, prompt_channelid: null })}
                                className={cn(
                                  "flex flex-col items-start gap-1 p-4 rounded-lg border transition-all text-left",
                                  mode === "vc"
                                    ? "bg-amber-500/15 border-amber-500/50"
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600",
                                )}
                              >
                                <span className={cn("text-sm font-medium", mode === "vc" ? "text-amber-400" : "text-gray-300")}>
                                  Voice Channel Text
                                </span>
                                <span className="text-xs text-gray-400">
                                  Recommended — prompts in the VC&apos;s text chat
                                </span>
                              </button>
                              <button
                                onClick={() => update({ use_dms: false, prompt_channelid: "__pending" })}
                                className={cn(
                                  "flex flex-col items-start gap-1 p-4 rounded-lg border transition-all text-left",
                                  mode === "custom"
                                    ? "bg-amber-500/15 border-amber-500/50"
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600",
                                )}
                              >
                                <span className={cn("text-sm font-medium", mode === "custom" ? "text-amber-400" : "text-gray-300")}>
                                  Custom Channel
                                </span>
                                <span className="text-xs text-gray-400">
                                  All prompts sent to one text channel
                                </span>
                              </button>
                              <button
                                onClick={() => update({ use_dms: true, prompt_channelid: null })}
                                className={cn(
                                  "flex flex-col items-start gap-1 p-4 rounded-lg border transition-all text-left",
                                  mode === "dm"
                                    ? "bg-amber-500/15 border-amber-500/50"
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600",
                                )}
                              >
                                <span className={cn("text-sm font-medium", mode === "dm" ? "text-amber-400" : "text-gray-300")}>
                                  Direct Messages
                                </span>
                                <span className="text-xs text-gray-400">
                                  Private — sent to user&apos;s DMs (may be blocked)
                                </span>
                              </button>
                            </div>

                            {mode === "vc" && (
                              <div className="flex items-start gap-2 p-3 mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-300">
                                  Prompts are sent in the voice channel&apos;s built-in text chat. The user is @mentioned with a button to confirm. The bot needs <strong>Send Messages</strong> permission in voice channels.
                                </p>
                              </div>
                            )}

                            {mode === "custom" && (
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-200 mb-1">
                                  Prompt Channel
                                </label>
                                <p className="text-xs text-gray-400 mb-2">
                                  All &quot;Are you studying?&quot; prompts will be sent here with @mentions, regardless of which voice channel the user is in.
                                </p>
                                <ChannelSelect
                                  guildId={guildId}
                                  value={config.prompt_channelid === "__pending" ? null : config.prompt_channelid}
                                  onChange={(v) => update({ prompt_channelid: (v as string) || null })}
                                  channelTypes={[0]}
                                />
                              </div>
                            )}

                            {mode === "dm" && (
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-200 mb-1">
                                  Fallback Channel
                                </label>
                                <p className="text-xs text-gray-400 mb-2">
                                  Where to mention users if their DMs are blocked. Leave empty to skip users with blocked DMs.
                                </p>
                                <ChannelSelect
                                  guildId={guildId}
                                  value={config.fallback_channelid ?? null}
                                  onChange={(v) => update({ fallback_channelid: (v as string) || null })}
                                  channelTypes={[0]}
                                />
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </SectionCard>
                {/* --- END AI-MODIFIED --- */}

                {/* ── Section 4: Smart Exemptions ── */}
                <SectionCard title="Smart Exemptions" icon={<Users size={16} />}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-200">
                          Skip Streaming / Camera Users
                        </label>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Users with camera or screen share on are automatically exempt
                        </p>
                      </div>
                      <Toggle
                        checked={config.skip_streaming}
                        onChange={(v) => update({ skip_streaming: v })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Exempt Roles
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Members with these roles will never be checked.
                      </p>
                      <RoleSelect
                        guildId={guildId}
                        value={config.exempt_roles}
                        onChange={(v) => update({ exempt_roles: (v as string[]) || [] })}
                        multiple
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Target Channels
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Only check users in these channels. Leave empty to apply to all tracked voice channels.
                      </p>
                      <ChannelSelect
                        guildId={guildId}
                        value={config.target_channels}
                        onChange={(v) => update({ target_channels: (v as string[]) || [] })}
                        channelTypes={[2, 13]}
                        multiple
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Exclude Channels
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Never check users in these channels, even if they're tracked.
                      </p>
                      <ChannelSelect
                        guildId={guildId}
                        value={config.exclude_channels}
                        onChange={(v) => update({ exclude_channels: (v as string[]) || [] })}
                        channelTypes={[2, 13]}
                        multiple
                      />
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-300">
                        Users in active pomodoro timers or scheduled sessions are always exempt automatically.
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* ── Section 5: Logging ── */}
                <SectionCard title="Logging" icon={<Bell size={16} />}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-200">
                          Notify on Action
                        </label>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Post a log message when a user is disconnected, paused, or moved
                        </p>
                      </div>
                      <Toggle
                        checked={config.notify_on_action}
                        onChange={(v) => update({ notify_on_action: v })}
                      />
                    </div>

                    {config.notify_on_action && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">
                          Notification Channel
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                          Where to post action log messages.
                        </p>
                        <ChannelSelect
                          guildId={guildId}
                          value={config.notification_channelid ?? null}
                          onChange={(v) => update({ notification_channelid: (v as string) || null })}
                          channelTypes={[0]}
                        />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* ── SaveBar ── */}
                <SaveBar
                  show={hasChanges}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              </div>
            )}
          </DashboardShell>
        </ServerGuard>
      </AdminGuard>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
