// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 6 -- Enhancement system with AnvilScene
//          demo, before/after glow comparison, and success rate
//          explanation
// ============================================================
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBar from "@/components/pet/ui/PixelBar"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { getItemImageUrl } from "@/utils/petAssets"
import { MOCK_ENHANCEMENT, GLOW_TIER_SHOWCASE } from "../tutorialMockData"
import { GLOW_COLORS } from "@/utils/gameConstants"
import type { GlowTier } from "@/utils/gameConstants"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const AnvilScene = dynamic(() => import("@/components/pet/enhancement/AnvilScene"), { ssr: false })

export default function StepEnhancement() {
  const beforeImg = getItemImageUrl(MOCK_ENHANCEMENT.before.assetPath, "SHIRT")
  const afterImg = getItemImageUrl(MOCK_ENHANCEMENT.after.assetPath, "SHIRT")

  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is Enhancement?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          Enhancement means <strong className="text-[var(--pet-text,#e2e8f0)]">upgrading your equipment</strong> to
          make it stronger. You need two things: one piece of equipment and one
          {" "}<strong className="text-[var(--pet-text,#e2e8f0)]">scroll</strong> (a special upgrade item).
          Combine them on the anvil, and if it succeeds, your item gets more powerful and starts glowing.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">The Anvil</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-3">
          This is where enhancement happens. Place your item and scroll on the anvil, then strike.
        </p>
        <div className="flex justify-center">
          <div className="w-full max-w-xs aspect-square">
            <AnvilScene
              phase="charging"
              intensity="medium"
              equipImage={beforeImg ?? undefined}
              scrollImage={getItemImageUrl(MOCK_ENHANCEMENT.scroll.assetPath, "SCROLL") ?? undefined}
              equipName={MOCK_ENHANCEMENT.before.name}
            />
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Before & After</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Successful enhancement makes your item glow. The more you enhance, the brighter it gets.
        </p>

        <div className="flex items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded mb-2 p-2">
              {beforeImg && <CroppedItemImage src={beforeImg} alt="Before" className="w-full h-full object-contain" />}
            </div>
            <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{MOCK_ENHANCEMENT.before.name}</p>
            <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">No glow</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="font-pixel text-2xl text-[var(--pet-gold,#f0c040)]"
          >
            →
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded mb-2 p-2">
              <ItemGlow rarity="RARE" glowTier="gold" glowIntensity={2}>
                {afterImg && <CroppedItemImage src={afterImg} alt="After" className="w-full h-full object-contain" />}
              </ItemGlow>
            </div>
            <p className="font-pixel text-[11px] text-yellow-400">{MOCK_ENHANCEMENT.after.name}</p>
            <p className="font-pixel text-[9px] text-yellow-300">Gold glow ✨</p>
          </motion.div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Success Rates</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Enhancement isn&apos;t guaranteed. Each attempt has a chance to
          {" "}<strong className="text-emerald-400">succeed</strong> (item gets stronger),
          {" "}<strong className="text-amber-400">fail</strong> (nothing happens), or rarely
          {" "}<strong className="text-red-400">break</strong> (item is destroyed). Better scrolls have higher success rates.
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-pixel text-[10px] text-emerald-400">Success</span>
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">70%</span>
            </div>
            <PixelBar value={70} max={100} color="green" showText={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-pixel text-[10px] text-amber-400">Fail (nothing happens)</span>
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">25%</span>
            </div>
            <PixelBar value={25} max={100} color="gold" showText={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-pixel text-[10px] text-red-400">Break (item destroyed)</span>
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">5%</span>
            </div>
            <PixelBar value={5} max={100} color="red" showText={false} />
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Glow Tiers</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          The more you enhance an item, the brighter its glow. There are 5 glow levels —
          the highest ones are extremely rare and impressive.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {GLOW_TIER_SHOWCASE.map((tier, i) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-2 bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded"
            >
              <div
                className="w-8 h-8 mx-auto rounded mb-1"
                style={{
                  backgroundColor: tier.tier === "none" ? "rgba(100,100,100,0.2)" : undefined,
                  boxShadow: tier.tier !== "none" ? `0 0 12px ${GLOW_COLORS[tier.tier as GlowTier]}, 0 0 24px ${GLOW_COLORS[tier.tier as GlowTier]}` : undefined,
                  background: tier.tier !== "none" ? `radial-gradient(circle, ${GLOW_COLORS[tier.tier as GlowTier]}, transparent 70%)` : undefined,
                }}
              />
              <p className="font-pixel text-[9px] text-[var(--pet-text,#e2e8f0)]">{tier.label}</p>
              <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)]">+{tier.level}</p>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/enhancement"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          Try Enhancement
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
