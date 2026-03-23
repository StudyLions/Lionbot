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
}

function Slider({ label, value, min, max, step, onChange, suffix = "", description }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; suffix?: string; description?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-[#DDB21D]">{value}{suffix}</span>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#DDB21D] bg-gray-700"
      />
    </div>
  )
}

const TABS = [
  { id: "rolemenus", label: "Role Menus", icon: <Tag className="w-4 h-4" /> },
  { id: "rooms", label: "Private Rooms", icon: <DoorOpen className="w-4 h-4" /> },
  { id: "video", label: "Video & Moderation", icon: <Shield className="w-4 h-4" /> },
]

export default function StepCommunity({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepCommunityProps) {
  const [tab, setTab] = useState("rolemenus")
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <StepLayout
      title="Community Tools"
      subtitle="Role menus, private rooms, video channels, and moderation"
      leoPose="mindBlown"
      leoMessage={getLeoMessage("community", "intro", serverName)}
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
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

            <Link
              href={`/dashboard/servers/${guildId}/rolemenus`}
              className="inline-flex items-center gap-1.5 text-xs text-[#DDB21D] hover:text-[#f57c00] transition-colors"
            >
              Open Role Menu Editor <ArrowRight className="w-3 h-3" />
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
              description="Cost to rent a private room"
            />

            <Slider
              label="Max rooms"
              value={config.renting_cap ?? 10}
              min={1}
              max={50}
              step={1}
              onChange={(v) => onUpdate("renting_cap", v)}
              description="Maximum private rooms at once"
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
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Room Category ID</label>
                  <input
                    type="text"
                    value={config.renting_category || ""}
                    onChange={(e) => onUpdate("renting_category", e.target.value || null)}
                    placeholder="Category where rooms are created"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
                  />
                </div>
                <Slider
                  label="Max rooms per user"
                  value={config.renting_max_per_user ?? 1}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(v) => onUpdate("renting_max_per_user", v)}
                />
                <Slider
                  label="Room name limit"
                  value={config.renting_name_limit ?? 32}
                  min={10}
                  max={50}
                  step={1}
                  onChange={(v) => onUpdate("renting_name_limit", v)}
                  suffix=" chars"
                />
                <Slider
                  label="Min deposit"
                  value={config.renting_min_deposit ?? 0}
                  min={0}
                  max={500}
                  step={10}
                  onChange={(v) => onUpdate("renting_min_deposit", v)}
                  suffix=" coins"
                />
                <Slider
                  label="Cooldown"
                  value={config.renting_cooldown ?? 0}
                  min={0}
                  max={60}
                  step={5}
                  onChange={(v) => onUpdate("renting_cooldown", v)}
                  suffix=" min"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.renting_sync_perms ?? false}
                    onChange={(e) => onUpdate("renting_sync_perms", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
                  />
                  <label className="text-xs text-gray-400">Sync permissions with category</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.renting_auto_extend ?? false}
                    onChange={(e) => onUpdate("renting_auto_extend", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
                  />
                  <label className="text-xs text-gray-400">Auto-extend rooms when occupied</label>
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
              Video Channel Requirements
            </div>
            <p className="text-xs text-gray-400">
              Require cameras in specific voice channels. Members who don&apos;t turn on video get
              a grace period, then get study-banned temporarily.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.video_studyban ?? false}
                onChange={(e) => onUpdate("video_studyban", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <div>
                <label className="text-sm text-gray-300">Enable video enforcement</label>
                <p className="text-xs text-gray-500">Auto-ban members without camera in video channels</p>
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
                description="Seconds before a member without camera gets banned"
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
