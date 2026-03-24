// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 5 -- Farm system with live FarmScene
//          demo, growth stage timeline, and planting explanation
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { getFarmBackgroundUrl } from "@/utils/petAssets"
import Link from "next/link"
import { ArrowRight, Droplets, Sprout, Sun, Coins } from "lucide-react"

const GROWTH_STAGES = [
  { label: "Plant", icon: <Sprout className="w-5 h-5 text-emerald-400" />, description: "Choose a seed and plant it in an empty plot" },
  { label: "Water", icon: <Droplets className="w-5 h-5 text-cyan-400" />, description: "Water your crop regularly so it grows" },
  { label: "Grow", icon: <Sun className="w-5 h-5 text-amber-400" />, description: "Wait for it to grow through 5 stages" },
  { label: "Harvest", icon: <Coins className="w-5 h-5 text-[var(--pet-gold,#f0c040)]" />, description: "Collect gold (and maybe a rare item!)" },
]

export default function StepFarm() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is the Farm?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          You have a small farm with 15 plots of land. Plant a seed, water it, wait for it
          to grow, then harvest it for gold. It&apos;s like having a real garden, except
          everything happens on your screen and the crops are worth in-game money.
        </p>

        <div className="flex justify-center">
          <div style={{ width: 340, maxWidth: "100%" }}>
            <GameboyFrame isFullscreen={false} width={340}>
              <img
                src={getFarmBackgroundUrl(false)}
                alt="Farm scene"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </GameboyFrame>
          </div>
        </div>

        <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] text-center mt-2">
          ↑ Your farm has 15 plots where you can plant seeds and grow crops.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">The Growing Cycle</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Every crop follows the same 4-step cycle. The whole process takes a few hours.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {GROWTH_STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex-1 flex items-start gap-2"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] flex items-center justify-center">
                  {stage.icon}
                </div>
                {i < GROWTH_STAGES.length - 1 && (
                  <div className="hidden sm:block w-px h-full bg-[var(--pet-border,#2a3a5c)]" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">
                  {i + 1}. {stage.label}
                </h4>
                <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mt-0.5">
                  {stage.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-4" corners>
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-pixel text-[12px] text-red-400 mb-1">Don&apos;t Forget to Water!</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Crops that aren&apos;t watered will eventually die and you&apos;ll lose your investment.
              Check back every few hours, or use the &quot;Water All&quot; button to water everything at once.
            </p>
          </div>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/farm"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          Visit Your Farm
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
