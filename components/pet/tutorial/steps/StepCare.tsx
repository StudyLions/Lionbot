// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 1 -- Pet care system with live PixelBar
//          demos, mood explanation, and care button mockups
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBar from "@/components/pet/ui/PixelBar"
import { MOCK_PET_STATS, CARE_ACTIONS } from "../tutorialMockData"

export default function StepCare() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Are Pet Stats?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Your pet has 4 needs, just like a real pet. Each one is shown as a bar.
          Full bars = happy pet. Empty bars = sad pet. They go down slowly over time,
          so check in regularly to keep them filled up.
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[12px]">🍖</span>
              <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">Food</span>
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] ml-auto">How hungry your pet is</span>
            </div>
            <PixelBar value={MOCK_PET_STATS.food} max={MOCK_PET_STATS.maxStat} color="green" showText />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[12px]">🛁</span>
              <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">Bath</span>
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] ml-auto">How clean your pet is</span>
            </div>
            <PixelBar value={MOCK_PET_STATS.bath} max={MOCK_PET_STATS.maxStat} color="red" showText />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[12px]">💤</span>
              <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">Sleep</span>
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] ml-auto">How rested your pet is</span>
            </div>
            <PixelBar value={MOCK_PET_STATS.sleep} max={MOCK_PET_STATS.maxStat} color="green" showText />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[12px]">❤️</span>
              <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">Life</span>
              <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] ml-auto">Overall health</span>
            </div>
            <PixelBar value={MOCK_PET_STATS.life} max={MOCK_PET_STATS.maxStat} color="green" showText />
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">Care Buttons</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Press these buttons on your pet&apos;s overview page to fill up the bars.
          Each action fills a different stat.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARE_ACTIONS.map((action) => (
            <motion.div
              key={action.action}
              whileHover={{ scale: 1.02 }}
              className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{action.icon}</span>
                <span className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">{action.label}</span>
              </div>
              <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
                {action.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">Mood = Gold</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Your pet&apos;s mood is calculated from all 4 stats combined. The happier your pet,
          the more gold and XP you earn while studying. Neglect your pet and you earn less.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <div className="text-2xl mb-1">😊</div>
            <p className="font-pixel text-[11px] text-emerald-400">Happy</p>
            <p className="font-pixel text-[10px] text-emerald-300 mt-1">1.5x gold</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded">
            <div className="text-2xl mb-1">😐</div>
            <p className="font-pixel text-[11px] text-amber-400">Content</p>
            <p className="font-pixel text-[10px] text-amber-300 mt-1">1.0x gold</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded">
            <div className="text-2xl mb-1">😢</div>
            <p className="font-pixel text-[11px] text-red-400">Sad</p>
            <p className="font-pixel text-[10px] text-red-300 mt-1">0.5x gold</p>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}
