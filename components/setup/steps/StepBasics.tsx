// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 2 -- Timezone, locale, welcome messages,
//          channels, roles, and advanced settings
// ============================================================
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Globe, MessageSquare } from "lucide-react"
import StepLayout from "../StepLayout"
import { GreetingPreview } from "../DiscordPreview"
import { getLeoMessage } from "../leoMessages"
import { ChannelSelect, RoleSelect } from "@/components/dashboard/ui"

const TIMEZONE_OPTIONS = [
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
  "America/Mexico_City", "Africa/Cairo", "Asia/Jerusalem", "UTC",
]

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: optional hasExistingConfig forwarded to StepLayout
// --- END AI-MODIFIED ---
interface StepBasicsProps {
  config: Record<string, any>
  serverName: string
  guildId: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
  hasExistingConfig?: boolean
}

export default function StepBasics({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction, hasExistingConfig,
}: StepBasicsProps) {
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [detectedTz, setDetectedTz] = useState("UTC")

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) setDetectedTz(tz)
    } catch { /* keep UTC */ }
  }, [])

  const tz = config.timezone || detectedTz || "UTC"

  useEffect(() => {
    if (!config.timezone && detectedTz) {
      onUpdate("timezone", detectedTz)
    }
  }, [detectedTz])

  return (
    <StepLayout
      title="The Basics"
      subtitle="Essential settings to get your server going"
      leoPose="pointing"
      leoMessage={getLeoMessage("basics", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass basics-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("basics", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
      hasExistingConfig={hasExistingConfig}
    >
      {/* Timezone */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Globe className="w-4 h-4 text-[#DDB21D]" />
          Timezone
        </div>
        <p className="text-xs text-gray-400">
          I auto-detected <span className="text-[#DDB21D] font-medium">{detectedTz}</span> from your browser.
        </p>
        <select
          value={tz}
          onChange={(e) => onUpdate("timezone", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 focus:border-[#DDB21D] outline-none"
        >
          {TIMEZONE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Welcome Message */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <MessageSquare className="w-4 h-4 text-[#DDB21D]" />
          Welcome Message
        </div>
        <p className="text-xs text-gray-400">
          This message is sent when a new member joins your server. You can use these placeholders: <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{mention}"}</code> (tags the new member), <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{user_name}"}</code> (their username), and <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{server_name}"}</code> (your server name).
        </p>
        <textarea
          value={config.greeting_message || ""}
          onChange={(e) => onUpdate("greeting_message", e.target.value || null)}
          placeholder="Welcome to {server_name}, {mention}! We're glad to have you here."
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-[#DDB21D]/50 focus:border-[#DDB21D] outline-none resize-none"
        />
        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <GreetingPreview
            message={config.greeting_message || "Welcome to {server_name}, {mention}! We're glad to have you here."}
            serverName={serverName}
          />
        </div>
      </div>

      {/* Returning Message */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <MessageSquare className="w-4 h-4 text-[#43b581]" />
          Returning Member Message
        </div>
        <p className="text-xs text-gray-400">
          Optional message for members who leave and come back.
        </p>
        <textarea
          value={config.returning_message || ""}
          onChange={(e) => onUpdate("returning_message", e.target.value || null)}
          placeholder="Welcome back, {mention}! We missed you."
          rows={2}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-[#DDB21D]/50 focus:border-[#DDB21D] outline-none resize-none"
        />
      </div>

      {/* Advanced Settings */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Advanced Settings</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <div className="space-y-1">
              <ChannelSelect
                guildId={guildId}
                value={config.greeting_channel ?? null}
                onChange={(v) => onUpdate("greeting_channel", (v as string) || null)}
                channelTypes={[0, 5]}
                label="Greeting Channel"
                placeholder="Select a channel"
              />
              <p className="text-[11px] text-gray-500">Where welcome and returning member messages are posted. If not set, messages go to your server&apos;s default channel.</p>
            </div>
            <div className="space-y-1">
              <RoleSelect
                guildId={guildId}
                value={config.admin_role ?? null}
                onChange={(v) => onUpdate("admin_role", (v as string) || null)}
                excludeManaged
                excludeEveryone
                label="Admin Role"
                placeholder="Select admin role"
              />
              <p className="text-[11px] text-gray-500">Full access to all bot commands and dashboard settings</p>
            </div>
            <div className="space-y-1">
              <RoleSelect
                guildId={guildId}
                value={config.mod_role ?? null}
                onChange={(v) => onUpdate("mod_role", (v as string) || null)}
                excludeManaged
                excludeEveryone
                label="Moderator Role"
                placeholder="Select moderator role"
              />
              <p className="text-[11px] text-gray-500">Can use moderation commands and view mod-level dashboard pages</p>
            </div>
            <div className="space-y-1">
              <ChannelSelect
                guildId={guildId}
                value={config.event_log_channel ?? null}
                onChange={(v) => onUpdate("event_log_channel", (v as string) || null)}
                channelTypes={[0, 5]}
                label="Event Log Channel"
                placeholder="Select a channel"
              />
              <p className="text-[11px] text-gray-500">Logs rank-ups, task completions, and other member milestones</p>
            </div>
            <div className="space-y-1">
              <ChannelSelect
                guildId={guildId}
                value={config.mod_log_channel ?? null}
                onChange={(v) => onUpdate("mod_log_channel", (v as string) || null)}
                channelTypes={[0, 5]}
                label="Mod Log Channel"
                placeholder="Select a channel"
              />
              <p className="text-[11px] text-gray-500">Logs moderation actions like warnings, mutes, and bans</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.force_locale || false}
                  onChange={(e) => onUpdate("force_locale", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
                />
                <label className="text-xs text-gray-400">Use one language for everyone</label>
              </div>
              <p className="text-[11px] text-gray-500 ml-7">When enabled, the bot always responds in your server&apos;s language. When disabled, each member can choose their own language.</p>
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
