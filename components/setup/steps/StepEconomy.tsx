// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 3 -- LionCoins & Economy configuration with
//          live reward preview and shop teaser
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Coins, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import StepLayout from "../StepLayout"
import { RewardPreview } from "../DiscordPreview"
import { getLeoMessage } from "../leoMessages"

interface StepEconomyProps {
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
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#DDB21D] bg-gray-700"
      />
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}

export default function StepEconomy({
  config, serverName, guildId, onUpdate, onNext, onBack, onSkip, saving, direction,
}: StepEconomyProps) {
  const [showAdvanced, setShowAdvanced] = useState(true)
  const hourly = config.study_hourly_reward ?? 100
  const camera = config.study_hourly_live_bonus ?? 25
  const cap = config.daily_study_cap

  return (
    <StepLayout
      title="LionCoins & Economy"
      subtitle="How your members earn and spend coins"
      leoPose="thumbsUp"
      leoMessage={getLeoMessage("economy", "intro", serverName)}
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
    >
      {/* Main Reward Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Coins className="w-4 h-4 text-[#DDB21D]" />
          Study Rewards
        </div>
        <p className="text-xs text-gray-400">
          LionCoins are your server&apos;s virtual currency. Members earn them by spending time in voice channels.
          They can spend coins in your server shop, use them to join scheduled study sessions (set up in a later step), or send them to friends.
        </p>

        <Slider
          label="Coins per hour"
          value={hourly}
          min={0}
          max={500}
          step={10}
          onChange={(v) => onUpdate("study_hourly_reward", v)}
          description="How many coins members earn per hour of voice activity"
        />

        <Slider
          label="Camera bonus"
          value={camera}
          min={0}
          max={200}
          step={5}
          onChange={(v) => onUpdate("study_hourly_live_bonus", v)}
          suffix="/hr"
          description="Extra coins when camera is on (incentivizes video study)"
        />

        <Slider
          label="Daily earning limit"
          value={cap ?? 0}
          min={0}
          max={24}
          step={1}
          onChange={(v) => onUpdate("daily_study_cap", v === 0 ? null : v)}
          suffix=" hours"
          description="Maximum hours of voice time that count toward coin rewards each day (0 = no limit)"
        />
      </div>

      {/* Starting Funds */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Coins className="w-4 h-4 text-[#43b581]" />
          Starting Funds
        </div>
        <p className="text-xs text-gray-400">
          How many coins new members start with when they join your server.
        </p>
        <Slider
          label="Starting coins"
          value={config.starting_funds ?? 0}
          min={0}
          max={1000}
          step={50}
          onChange={(v) => onUpdate("starting_funds", v)}
        />
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Live Preview -- What members see after a study session:</p>
        <RewardPreview
          hourlyReward={hourly}
          cameraBonus={camera}
          dailyCap={cap}
        />
      </div>

      {/* Shop Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#DDB21D]/10 to-[#f57c00]/10 border border-[#DDB21D]/20 rounded-xl p-5"
      >
        <div className="flex items-start gap-3">
          <ShoppingBag className="w-5 h-5 text-[#DDB21D] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Server Shop</p>
            <p className="text-xs text-gray-400">
              Create a shop where members spend their coins on roles, perks, and custom items. You can set this up after the wizard.
            </p>
            <Link href={`/dashboard/servers/${guildId}/shop`}>
              <a className="inline-flex items-center gap-1 text-xs text-[#DDB21D] hover:text-[#f57c00] transition-colors">
                Set up shop later <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Advanced */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Advanced Economy</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.allow_transfers ?? true}
                onChange={(e) => onUpdate("allow_transfers", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-[#DDB21D] focus:ring-[#DDB21D]"
              />
              <div>
                <label className="text-sm text-gray-300">Allow coin transfers</label>
                <p className="text-xs text-gray-500">Members can send coins to each other</p>
              </div>
            </div>
            <Slider
              label="Bonus coins from ranking up"
              value={config.coins_per_centixp ?? 50}
              min={0}
              max={200}
              step={10}
              onChange={(v) => onUpdate("coins_per_centixp", v)}
              description="Extra coins awarded for every 100 XP earned from the rank system (on top of hourly voice rewards)"
            />
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
