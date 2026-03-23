// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 8 -- Community Tools (tabbed: Role Menus,
//          Private Rooms, Video Channels & Moderation)
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users, ChevronDown, ChevronUp, DoorOpen, Video,
  Shield, ArrowRight, Tag, Hash,
} from "lucide-react"
import Link from "next/link"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"
import { ChannelSelect } from "@/components/dashboard/ui"
import Slider from "../Slider"

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: optional hasExistingConfig forwarded to StepLayout
// --- END AI-MODIFIED ---
interface StepCommunityProps {
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

const TABS = [
  { id: "rolemenus", label: "Role Menus", icon: <Tag className="w-4 h-4" /> },
  { id: "rooms", label: "Private Rooms", icon: <DoorOpen className="w-4 h-4" /> },
  { id: "video", label: "Video & Moderation", icon: <Shield className="w-4 h-4" /> },
]

export default function StepCommunity({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction, hasExistingConfig,
}: StepCommunityProps) {
  const [tab, setTab] = useState("rolemenus")
  const [showAdvanced, setShowAdvanced] = useState(true)

  return (
    <StepLayout
      title="Community Tools"
      subtitle="Role menus, private rooms, video channels, and moderation"
      leoPose="mindBlown"
      leoMessage={getLeoMessage("community", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass community-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("community", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
      hasExistingConfig={hasExistingConfig}
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/60 rounded-xl p-1 border border-gray-700/50">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-[#DDB21D]/15 text-[#DDB21D]"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Role Menus Tab */}
      {tab === "rolemenus" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Tag className="w-4 h-4 text-[#DDB21D]" />
              Role Menus
            </div>
            <p className="text-xs text-gray-400">
              Create interactive menus where members can pick their own roles.
              Perfect for color roles, notification preferences, study groups, and more.
              The role menu editor is a dedicated tool -- we&apos;ll link you there after the wizard.
            </p>

            {/* Demo */}
            <div className="bg-[#36393f] rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-gray-300">Example: Subject Roles</p>
              <div className="flex flex-wrap gap-2">
                {["Mathematics", "Computer Science", "Physics", "Chemistry", "Biology", "Literature"].map((role) => (
                  <span
                    key={role}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <Link href={`/dashboard/servers/${guildId}/rolemenus`}>
              <a className="inline-flex items-center gap-1.5 text-xs text-[#DDB21D] hover:text-[#f57c00] transition-colors">
                Open Role Menu Editor <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Private Rooms Tab */}
      {tab === "rooms" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <DoorOpen className="w-4 h-4 text-[#DDB21D]" />
              Private Rooms
            </div>
            <p className="text-xs text-gray-400">
              Members can rent temporary voice channels for private study sessions.
              They pay coins to create and maintain rooms -- it&apos;s like Airbnb for Discord.
            </p>

            <Slider
              label="Room price"
              value={config.renting_price ?? 100}
              min={0}
              max={1000}
              step={50}
              onChange={(v) => onUpdate("renting_price", v)}
              suffix=" coins"
              description="LionCoins to create a private room (one-time fee, not recurring)"
            />

            <Slider
              label="Max rooms"
              value={config.renting_cap ?? 10}
              min={1}
              max={50}
              step={1}
              onChange={(v) => onUpdate("renting_cap", v)}
              description="Maximum number of private rooms that can exist at the same time in your server"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.renting_visible ?? true}
                onChange={(e) => onUpdate("renting_visible", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <div>
                <label className="text-sm text-gray-300">Visible rooms</label>
                <p className="text-xs text-gray-500">Rooms visible to all members (vs. only owner + invited)</p>
              </div>
            </div>
          </div>

          {/* Advanced rooms */}
          <div className="border border-gray-700/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
            >
              <span className="text-sm font-medium text-gray-400">Advanced Room Settings</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="px-5 py-4 space-y-4 bg-gray-800/30"
              >
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Category for Private Rooms</label>
                  <ChannelSelect
                    guildId={guildId}
                    value={config.renting_category ?? null}
                    onChange={(v) => onUpdate("renting_category", (v as string) || null)}
                    channelTypes={[4]}
                    placeholder="Select a channel group (category)"
                  />
                  <p className="text-[11px] text-gray-500">Private voice channels are created inside this Discord category (channel group)</p>
                </div>
                <Slider
                  label="Max rooms per user"
                  value={config.renting_max_per_user ?? 1}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(v) => onUpdate("renting_max_per_user", v)}
                  description="How many rooms a single member can rent at once"
                />
                <Slider
                  label="Room name limit"
                  value={config.renting_name_limit ?? 32}
                  min={10}
                  max={50}
                  step={1}
                  onChange={(v) => onUpdate("renting_name_limit", v)}
                  suffix=" chars"
                  description="Max characters allowed in custom room names"
                />
                <Slider
                  label="Minimum coins to open a room"
                  value={config.renting_min_deposit ?? 0}
                  min={0}
                  max={500}
                  step={10}
                  onChange={(v) => onUpdate("renting_min_deposit", v)}
                  suffix=" coins"
                  description="Members must have at least this many coins in their balance to create a room. Prevents spam room creation."
                />
                <Slider
                  label="Cooldown"
                  value={config.renting_cooldown ?? 0}
                  min={0}
                  max={60}
                  step={5}
                  onChange={(v) => onUpdate("renting_cooldown", v)}
                  suffix=" min"
                  description="Wait time between room creations for the same user"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.renting_sync_perms ?? false}
                      onChange={(e) => onUpdate("renting_sync_perms", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
                    />
                    <label className="text-xs text-gray-400">Copy permissions from the category</label>
                  </div>
                  <p className="text-[11px] text-gray-500 ml-7">When enabled, each new room inherits the same permissions (who can see/join) as the category it&apos;s created in</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.renting_auto_extend ?? false}
                      onChange={(e) => onUpdate("renting_auto_extend", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
                    />
                    <label className="text-xs text-gray-400">Auto-extend rooms when occupied</label>
                  </div>
                  <p className="text-[11px] text-gray-500 ml-7">Rooms won&apos;t expire while someone is still inside</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Video & Moderation Tab */}
      {tab === "video" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Video className="w-4 h-4 text-[#DDB21D]" />
              Camera-Required Voice Channels
            </div>
            <p className="text-xs text-gray-400">
              Require cameras to be turned on in specific voice channels. Members who don&apos;t enable their camera
              get a grace period, then are temporarily blocked from joining those channels.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.video_studyban ?? false}
                onChange={(e) => onUpdate("video_studyban", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <div>
                <label className="text-sm text-gray-300">Require cameras in designated channels</label>
                <p className="text-xs text-gray-500">Members without their camera on will be temporarily blocked from joining camera-required voice channels</p>
              </div>
            </div>

            {config.video_studyban && (
              <Slider
                label="Grace period"
                value={config.video_grace_period ?? 60}
                min={10}
                max={300}
                step={10}
                onChange={(v) => onUpdate("video_grace_period", v)}
                suffix=" sec"
                description="How many seconds a member has to turn on their camera before being removed from the channel"
              />
            )}
          </div>

          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Shield className="w-4 h-4 text-[#DDB21D]" />
              Moderation
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.persist_roles ?? false}
                onChange={(e) => onUpdate("persist_roles", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <div>
                <label className="text-sm text-gray-300">Persist roles on rejoin</label>
                <p className="text-xs text-gray-500">If a member leaves and comes back, restore their roles automatically</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </StepLayout>
  )
}
