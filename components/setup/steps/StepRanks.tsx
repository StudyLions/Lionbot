// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 4 -- Rank system config with real bot-rendered
//          profile card walkthrough and skin switcher
// ============================================================
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Trophy, Sparkles, BookOpen, MessageSquare, Mic } from "lucide-react"
import Image from "next/image"
import StepLayout from "../StepLayout"
import { RankUpPreview } from "../DiscordPreview"
import { getLeoMessage } from "../leoMessages"
import { ChannelSelect } from "@/components/dashboard/ui"
import Slider from "../Slider"

const RANK_TYPES = [
  { value: "XP", label: "Combined XP", description: "Counts both voice time and messages. Best for most servers.", icon: <Sparkles size={20} /> },
  { value: "VOICE", label: "Voice Time Only", description: "Only time spent in voice channels counts. Great for study servers.", icon: <Mic size={20} /> },
  { value: "MESSAGE", label: "Messages Only", description: "Only text messages count. Best for text-heavy communities.", icon: <MessageSquare size={20} /> },
]

const SKINS = [
  { id: "obsidian", label: "Obsidian", file: "profile-obsidian.png" },
  { id: "platinum", label: "Platinum", file: "profile-platinum.png" },
  { id: "cotton_candy", label: "Cotton Candy", file: "profile-cotton-candy.png" },
]

const CARD_ANNOTATIONS = [
  { label: "User Avatar & Name", top: "5%", left: "5%", width: "40%", color: "#5865F2" },
  { label: "Current Rank & Level", top: "5%", right: "5%", width: "30%", color: "#43b581" },
  { label: "Study Hours & Stats", top: "40%", left: "5%", width: "90%", color: "#DDB21D" },
  { label: "LionCoins Balance", top: "70%", left: "5%", width: "45%", color: "#f57c00" },
  { label: "Equipped Skin", top: "70%", right: "5%", width: "40%", color: "#ff6b6b" },
]

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: optional hasExistingConfig forwarded to StepLayout
// --- END AI-MODIFIED ---
interface StepRanksProps {
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

export default function StepRanks({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction, hasExistingConfig,
}: StepRanksProps) {
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [selectedSkin, setSelectedSkin] = useState(0)
  const [showAnnotations, setShowAnnotations] = useState(true)

  return (
    <StepLayout
      title="Ranks & Profile"
      subtitle="How members level up and show off their stats"
      leoPose="starEyed"
      leoMessage={getLeoMessage("ranks", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass ranks-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("ranks", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
      hasExistingConfig={hasExistingConfig}
    >
      {/* Rank Type */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Trophy className="w-4 h-4 text-[#DDB21D]" />
          Rank System
        </div>
        <p className="text-xs text-gray-400">
          XP (experience points) are earned by being active in your server. As members earn XP, they rank up and unlock new levels.
          Choose what counts toward their XP below. This affects their profile card and the server leaderboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RANK_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => onUpdate("rank_type", rt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                config.rank_type === rt.value
                  ? "border-[#DDB21D] bg-[#DDB21D]/10 text-[#DDB21D]"
                  : "border-gray-700 hover:border-gray-600 text-gray-400"
              }`}
            >
              {rt.icon}
              <span className="text-sm font-medium">{rt.label}</span>
              <span className="text-[10px] text-center">{rt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DM Ranks + XP per period */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.dm_ranks ?? true}
            onChange={(e) => onUpdate("dm_ranks", e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
          />
          <div>
            <label className="text-sm text-gray-300">Private rank-up notifications</label>
            <p className="text-xs text-gray-500">Send members a private message (DM) when they reach a new rank</p>
          </div>
        </div>
        <Slider
          label="XP per check-in"
          value={config.xp_per_period ?? 5}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onUpdate("xp_per_period", v)}
          description="The bot checks activity every few minutes and awards this much XP. Higher = faster ranking."
        />
      </div>

      {/* Rank-up Preview */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Rank-up notification preview:</p>
        <RankUpPreview serverName={serverName} rankType={config.rank_type || "XP"} />
      </div>

      {/* Profile Card Walkthrough */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <BookOpen className="w-4 h-4 text-[#DDB21D]" />
            Profile Card Walkthrough
          </div>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="text-xs text-[#DDB21D] hover:text-[#f57c00] transition-colors"
          >
            {showAnnotations ? "Hide labels" : "Show labels"}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          This is what your members&apos; profile looks like in Discord. Real data from a server with 50,000+ members.
          Members can customize their card skin -- here are a few examples:
        </p>

        {/* Skin Tabs */}
        <div className="flex gap-2">
          {SKINS.map((skin, i) => (
            <button
              key={skin.id}
              onClick={() => setSelectedSkin(i)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                selectedSkin === i
                  ? "bg-[#DDB21D] text-gray-900 font-medium"
                  : "bg-gray-700 text-gray-400 hover:text-gray-300"
              }`}
            >
              {skin.label}
            </button>
          ))}
        </div>

        {/* Card Image with Annotations */}
        <div className="relative w-full overflow-auto rounded-lg bg-gray-900/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSkin}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <Image
                src={`/images/setup/${SKINS[selectedSkin].file}`}
                alt={`Profile card - ${SKINS[selectedSkin].label} skin`}
                width={600}
                height={300}
                className="w-full h-auto rounded-lg"
                priority
              />
              {showAnnotations && CARD_ANNOTATIONS.map((ann, i) => (
                <motion.div
                  key={ann.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute border-2 rounded pointer-events-none"
                  style={{
                    top: ann.top,
                    left: ann.left,
                    right: ann.right,
                    width: ann.width,
                    height: "22%",
                    borderColor: ann.color,
                  }}
                >
                  <span
                    className="absolute -top-5 left-0 text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{ backgroundColor: ann.color, color: "#fff" }}
                  >
                    {ann.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Advanced */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Advanced Rank Settings</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <Slider
              label="XP from messages"
              value={config.xp_per_centiword ?? 1}
              min={0}
              max={10}
              step={1}
              onChange={(v) => onUpdate("xp_per_centiword", v)}
              description="How much XP members earn from chatting (awarded per 100 words sent)"
            />
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Rank-up Announcement Channel</label>
              <ChannelSelect
                guildId={guildId}
                value={config.rank_channel ?? null}
                onChange={(v) => onUpdate("rank_channel", (v as string) || null)}
                channelTypes={[0, 5]}
                placeholder="Select a channel (leave blank for DMs only)"
              />
              <p className="text-[11px] text-gray-500">Public rank-up celebrations go here. Leave empty to send private messages instead</p>
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
