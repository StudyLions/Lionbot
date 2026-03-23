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

const RANK_TYPES = [
  { value: "XP", label: "Combined XP", description: "Voice + text combined. Best all-around.", icon: <Sparkles size={20} /> },
  { value: "VOICE", label: "Voice Time", description: "Only voice hours count. Ideal for study servers.", icon: <Mic size={20} /> },
  { value: "MESSAGE", label: "Messages", description: "Message-based. Great for chatty communities.", icon: <MessageSquare size={20} /> },
]

const SKINS = [
  { id: "obsidian", label: "Obsidian", file: "profile-obsidian.png" },
  { id: "platinum", label: "Platinum", file: "profile-platinum.png" },
  { id: "cotton_candy", label: "Cotton Candy", file: "profile-cotton-candy.png" },
]

const CARD_ANNOTATIONS = [
  { label: "User Avatar & Name", top: "5%", left: "5%", width: "40%", color: "#5865F2" },
  { label: "Current Rank & Tier", top: "5%", right: "5%", width: "30%", color: "#43b581" },
  { label: "Study Hours & Stats", top: "40%", left: "5%", width: "90%", color: "#DDB21D" },
  { label: "LionCoins Balance", top: "70%", left: "5%", width: "45%", color: "#f57c00" },
  { label: "Equipped Skin", top: "70%", right: "5%", width: "40%", color: "#ff6b6b" },
]

interface StepRanksProps {
  config: Record<string, any>
  serverName: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
}

function Slider({ label, value, min, max, step, onChange, description }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; description?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-[#DDB21D]">{value}</span>
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

export default function StepRanks({
  config, serverName, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepRanksProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedSkin, setSelectedSkin] = useState(0)
  const [showAnnotations, setShowAnnotations] = useState(true)

  return (
    <StepLayout
      title="Ranks & Your Profile"
      subtitle="How members level up and show off"
      leoPose="starEyed"
      leoMessage={getLeoMessage("ranks", "intro", serverName)}
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
    >
      {/* Rank Type */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Trophy className="w-4 h-4 text-[#DDB21D]" />
          Rank System
        </div>
        <p className="text-xs text-gray-400">
          Choose how members earn XP and rank up. This determines what shows on their profile card and the leaderboard.
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
            <label className="text-sm text-gray-300">DM rank-up notifications</label>
            <p className="text-xs text-gray-500">Send members a DM when they rank up</p>
          </div>
        </div>
        <Slider
          label="XP per period"
          value={config.xp_per_period ?? 5}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onUpdate("xp_per_period", v)}
          description="XP awarded per tracking period (higher = faster ranking)"
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
              label="XP per 100 words (text)"
              value={config.xp_per_centiword ?? 1}
              min={0}
              max={10}
              step={1}
              onChange={(v) => onUpdate("xp_per_centiword", v)}
              description="XP earned from text messages (per 100 words)"
            />
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Rank-up Channel ID</label>
              <input
                type="text"
                value={config.rank_channel || ""}
                onChange={(e) => onUpdate("rank_channel", e.target.value || null)}
                placeholder="Channel for rank-up announcements (leave blank for DMs only)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
              />
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
