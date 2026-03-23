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

const TIMEZONE_OPTIONS = [
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
  "America/Mexico_City", "Africa/Cairo", "Asia/Jerusalem", "UTC",
]

interface StepBasicsProps {
  config: Record<string, any>
  serverName: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
}

export default function StepBasics({
  config, serverName, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepBasicsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
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
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
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
          Greet new members! Use <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{mention}"}</code>, <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{user_name}"}</code>, and <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">{"{server_name}"}</code>.
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
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Greeting Channel ID</label>
              <input
                type="text"
                value={config.greeting_channel || ""}
                onChange={(e) => onUpdate("greeting_channel", e.target.value || null)}
                placeholder="Channel ID (leave blank for default)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Admin Role ID</label>
              <input
                type="text"
                value={config.admin_role || ""}
                onChange={(e) => onUpdate("admin_role", e.target.value || null)}
                placeholder="Role ID for bot admins"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Moderator Role ID</label>
              <input
                type="text"
                value={config.mod_role || ""}
                onChange={(e) => onUpdate("mod_role", e.target.value || null)}
                placeholder="Role ID for bot moderators"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Event Log Channel ID</label>
              <input
                type="text"
                value={config.event_log_channel || ""}
                onChange={(e) => onUpdate("event_log_channel", e.target.value || null)}
                placeholder="Channel for bot events"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Mod Log Channel ID</label>
              <input
                type="text"
                value={config.mod_log_channel || ""}
                onChange={(e) => onUpdate("mod_log_channel", e.target.value || null)}
                placeholder="Channel for moderation logs"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.force_locale || false}
                onChange={(e) => onUpdate("force_locale", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <label className="text-xs text-gray-400">Force locale (override member preferences)</label>
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
