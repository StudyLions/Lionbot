// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 9 -- LionGotchi config + showcase with feature
//          grid, Gameboy-style frame, and drop channel setup
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Heart, Sprout, ShoppingBag, Home, Users, Sparkles,
  ChevronDown, ChevronUp, Hammer,
} from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"
import { ChannelSelect, RoleSelect } from "@/components/dashboard/ui"
import Slider from "../Slider"

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: optional hasExistingConfig forwarded to StepLayout
// --- END AI-MODIFIED ---
interface StepLionGotchiProps {
  lgConfig: Record<string, any>
  serverName: string
  guildId: string
  onLgUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
  hasExistingConfig?: boolean
}

const FEATURES = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Virtual Pet Lions",
    desc: "Every member gets a pet lion they feed, bathe, and play with. Keep them alive!",
    color: "#ff6b6b",
  },
  {
    icon: <Sprout className="w-5 h-5" />,
    title: "Farming",
    desc: "Plant seeds, water crops, harvest LionGotchi gold. A full farming simulation inside Discord.",
    color: "#43b581",
  },
  {
    icon: <Hammer className="w-5 h-5" />,
    title: "Crafting",
    desc: "Combine materials to craft furniture, decorations, and rare items.",
    color: "#f57c00",
  },
  {
    icon: <Home className="w-5 h-5" />,
    title: "Room Decorating",
    desc: "Customize your pet's room with furniture, wallpapers, and themed décor.",
    color: "#5865F2",
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Marketplace",
    desc: "Trade items with other members. Buy low, sell high -- a real economy inside Discord.",
    color: "#DDB21D",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Families",
    desc: "Join a family, share resources, and climb the family leaderboard together.",
    color: "#e91e63",
  },
]

export default function StepLionGotchi({
  lgConfig, serverName, guildId, onLgUpdate, onNext, onBack, onSkip, saving, direction, hasExistingConfig,
}: StepLionGotchiProps) {
  const [showAdvanced, setShowAdvanced] = useState(true)

  return (
    <StepLayout
      title="LionGotchi"
      subtitle="A virtual pet game with farming, crafting, and trading -- right inside Discord"
      leoPose="starEyed"
      leoMessage={getLeoMessage("liongotchi", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass liongotchi-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("liongotchi", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
      hasExistingConfig={hasExistingConfig}
    >
      {/* Enable toggle */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Heart className="w-4 h-4 text-[#ff6b6b]" />
            LionGotchi System
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lgConfig.lg_enabled ?? true}
              onChange={(e) => onLgUpdate("lg_enabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-[#DDB21D]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDB21D]" />
          </label>
        </div>
        <p className="text-xs text-gray-400">
          When enabled, members can adopt virtual pet lions, farm, craft, trade, and compete.
          It&apos;s a full virtual economy inside your Discord server. LionGotchi uses its own currency called
          &quot;gold&quot; (separate from LionCoins) that members earn through farming and trading.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${feat.color}20` }}>
                <div style={{ color: feat.color }}>{feat.icon}</div>
              </div>
              <span className="text-sm font-medium text-white">{feat.title}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Drop Channel Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="w-4 h-4 text-[#DDB21D]" />
          Item Drops
        </div>
        <p className="text-xs text-gray-400">
          Random items drop in a designated channel. Members race to grab them.
          Think of it as Black Friday but every few hours. Set a channel for drops:
        </p>
        <ChannelSelect
          guildId={guildId}
          value={lgConfig.lg_drop_channel ?? null}
          onChange={(v) => onLgUpdate("lg_drop_channel", (v as string) || null)}
          channelTypes={[0, 5]}
          placeholder="Select a channel for item drops"
        />
      </div>

      {/* Teaser toggle */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={lgConfig.lg_teaser_enabled ?? true}
            onChange={(e) => onLgUpdate("lg_teaser_enabled", e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
          />
          <div>
            <label className="text-sm text-gray-300">Show LionGotchi teasers</label>
            <p className="text-xs text-gray-500">Occasional messages that introduce pet features to members who haven&apos;t started</p>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Advanced LionGotchi Settings</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Server Nickname in Pet Game (max 12 chars)</label>
              <input
                type="text"
                maxLength={12}
                value={lgConfig.lg_guild_display_name || ""}
                onChange={(e) => onLgUpdate("lg_guild_display_name", e.target.value || null)}
                placeholder="e.g. StudyHub"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
              <p className="text-[11px] text-gray-500">A short name shown inside the pet game instead of your full server name (e.g. &quot;StudyHub&quot;)</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Activity Role</label>
              <RoleSelect
                guildId={guildId}
                value={lgConfig.lg_activity_role ?? null}
                onChange={(v) => onLgUpdate("lg_activity_role", (v as string) || null)}
                excludeManaged
                excludeEveryone
                placeholder="Select a role for active pet owners"
              />
              <p className="text-[11px] text-gray-500">Automatically given to members who actively care for their pet -- great for engagement tracking</p>
            </div>
            <Slider
              label="Drop message delete after"
              value={lgConfig.lg_drop_delete_after ?? 0}
              min={0}
              max={300}
              step={10}
              onChange={(v) => onLgUpdate("lg_drop_delete_after", v === 0 ? null : v)}
              suffix="s"
              description="Automatically remove drop messages after this many seconds (0 = keep them forever)"
            />
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
