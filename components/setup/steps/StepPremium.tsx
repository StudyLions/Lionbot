// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 10 -- Premium, LionGems, LionHeart tiers,
//          origin story, and support Discord
// ============================================================
import { motion } from "framer-motion"
import {
  Crown, Gem, Heart, Sparkles, ExternalLink,
  MessageCircle, Users, Rocket, Check,
} from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"
// --- AI-MODIFIED (2026-03-25) ---
// Purpose: Import currency hook and price helpers for dynamic pricing
import { useCurrency } from "@/hooks/useCurrency"
import {
  SUBSCRIPTION_TIERS,
  getSubscriptionPrice,
  getServerPremiumPrice,
} from "@/constants/SubscriptionData"
// --- END AI-MODIFIED ---

interface StepPremiumProps {
  serverName: string
  onNext: () => void
  onBack: () => void
  direction: number
}

// --- AI-MODIFIED (2026-03-25) ---
// Purpose: Replace hardcoded EUR prices with tier IDs for dynamic pricing
const TIERS = [
  {
    id: "LIONHEART" as const,
    name: "LionHeart",
    color: "#DDB21D",
    perks: [
      "500 gems/month",
      "1.5x coin boost",
      "10 gems per vote",
      "5 timer themes",
      "Faster farm growth",
    ],
  },
  {
    id: "LIONHEART_PLUS" as const,
    name: "LionHeart+",
    color: "#f57c00",
    popular: true,
    perks: [
      "1,200 gems/month",
      "1.75x coin boost",
      "15 gems per vote",
      "8 timer themes",
      "Extended pet death timer",
      "Better harvest bonuses",
    ],
  },
  {
    id: "LIONHEART_PLUS_PLUS" as const,
    name: "LionHeart++",
    color: "#ff6b6b",
    perks: [
      "3,000 gems/month",
      "2x coin boost",
      "30 gems per vote",
      "10 timer themes",
      "Pets NEVER die",
      "Includes Server Premium",
      "Full refund when removing crops",
    ],
  },
]
// --- END AI-MODIFIED ---

export default function StepPremium({ serverName, onNext, onBack, direction }: StepPremiumProps) {
  // --- AI-MODIFIED (2026-03-25) ---
  // Purpose: Dynamic pricing based on user's currency preference
  const { currency, symbol } = useCurrency()
  // --- END AI-MODIFIED ---
  return (
    <StepLayout
      title="Premium & Support"
      subtitle="Help us keep LionBot alive and thriving"
      leoPose="thumbsUp"
      leoMessage={getLeoMessage("premium", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass premium-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("premium", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      nextLabel="Almost Done"
      showSkip={false}
      direction={direction}
    >
      {/* LionGems Explainer */}
      <div className="bg-gradient-to-r from-[#5865F2]/10 to-[#DDB21D]/10 border border-[#5865F2]/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Gem className="w-4 h-4 text-[#5865F2]" />
          LionGems
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          LionGems are the premium currency. Members earn them for free by voting for LionBot on
          Top.gg (the biggest Discord bot listing site) or by purchasing gem packs. Gems unlock
          exclusive card skins, pet accessories, room themes, and more. Think of them as the &quot;V-Bucks&quot; of Discord bots.
        </p>
      </div>

      {/* Server Premium */}
      <div className="bg-gray-800/60 border border-[#DDB21D]/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Crown className="w-4 h-4 text-[#DDB21D]" />
          Server Premium
        </div>
        {/* --- AI-MODIFIED (2026-03-25) --- */}
        {/* Purpose: Dynamic server premium pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#DDB21D]">{symbol}{getServerPremiumPrice("MONTHLY", currency)}</span>
          <span className="text-sm text-gray-400">/month</span>
          <span className="text-xs text-gray-500">(or {symbol}{getServerPremiumPrice("YEARLY", currency)}/year -- save 17%)</span>
        </div>
        {/* --- END AI-MODIFIED --- */}
        <p className="text-xs text-gray-400">
          Server-wide perks for every member in your server:
        </p>
        <ul className="space-y-1.5">
          {[
            "Custom server branding on all cards",
            "Premium Pomodoro themes",
            "Ambient sounds bot (plays rain, campfire, and other background sounds in voice)",
            "15% bonus LionGotchi gold & drops",
            "Priority support",
          ].map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-xs text-gray-300">
              <Check className="w-3.5 h-3.5 text-[#DDB21D] flex-shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* LionHeart Tiers */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#ff6b6b]" />
          LionHeart Subscriptions (personal perks for individual members)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-gray-800/60 rounded-xl p-4 space-y-3 border ${
                tier.popular ? "border-[#f57c00]" : "border-gray-700/50"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 bg-[#f57c00] text-white rounded-full font-semibold">
                  POPULAR
                </span>
              )}
              {/* --- AI-MODIFIED (2026-03-25) --- */}
              {/* Purpose: Dynamic tier pricing */}
              <div>
                <p className="text-sm font-semibold" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-lg font-bold text-white">{symbol}{getSubscriptionPrice(tier.id, currency)}<span className="text-xs text-gray-400">/mo</span></p>
              </div>
              {/* --- END AI-MODIFIED --- */}
              <ul className="space-y-1">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-[10px] text-gray-400">
                    <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                    {perk}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Origin Story */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="w-4 h-4 text-[#DDB21D]" />
          Our Story
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          LionBot is a small family project, built by Ari because studying alone sucked.
          What started as a simple study tracker for one Discord server grew into a platform
          serving 73,000+ servers. We&apos;re not a big company -- just a small team that
          genuinely cares about helping people study and socialize more.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Premium admins get <span className="text-white font-medium">direct contact with the developers</span>.
          You can literally DM us feature ideas and we&apos;ll build them. We ship updates
          <span className="text-white font-medium"> every week</span>. Your support keeps the lights on
          and the features flowing.
        </p>
      </div>

      {/* Support Discord */}
      <a
        href="https://discord.gg/the-study-lions-780195610154237993"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl p-5 hover:bg-[#5865F2]/15 transition-colors group"
      >
        <div className="p-2.5 bg-[#5865F2]/20 rounded-xl">
          <MessageCircle className="w-6 h-6 text-[#5865F2]" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-white">Join the Support Server</p>
          <p className="text-xs text-gray-400">
            Bug reports, feature requests, or just say hi. We fix issues fast because we actually care.
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#5865F2] transition-colors" />
      </a>
    </StepLayout>
  )
}
