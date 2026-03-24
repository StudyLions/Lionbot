// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 3 -- Equipment and inventory with
//          live rarity showcase (ItemGlow + CroppedItemImage),
//          equipment slots diagram, and drop explanation
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { getItemImageUrl } from "@/utils/petAssets"
import { MOCK_ITEMS, RARITY_TIERS, EQUIPMENT_SLOTS } from "../tutorialMockData"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function StepInventory() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is Equipment?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Equipment is like clothing and accessories for your pet — hats, shirts, boots, and wings.
          You earn them by studying in voice channels or chatting in Discord. Items appear randomly
          (we call these <strong className="text-[var(--pet-text,#e2e8f0)]">&quot;drops&quot;</strong>
          — think of it like finding treasure on the ground while walking).
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">Rarity Tiers</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Every item has a <strong className="text-[var(--pet-text,#e2e8f0)]">rarity</strong> — how
          rare and valuable it is. There are 6 tiers, from very common to nearly impossible to find.
          Rarer items glow brighter and are worth more.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RARITY_TIERS.map((tier, i) => {
            const item = MOCK_ITEMS[i]
            const imgUrl = item ? getItemImageUrl(item.assetPath, item.category) : null

            return (
              <motion.div
                key={tier.rarity}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-full aspect-square flex items-center justify-center bg-[var(--pet-bg,#0a0e1a)] rounded mb-2 p-2"
                  style={{ borderWidth: 2, borderStyle: "solid", borderColor: tier.border }}
                >
                  {item && (
                    <ItemGlow rarity={tier.rarity}>
                      <div className="w-14 h-14">
                        {imgUrl ? (
                          <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                        )}
                      </div>
                    </ItemGlow>
                  )}
                </div>
                <PixelBadge rarity={tier.rarity} className="mb-1" />
                <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] mt-1">
                  {tier.sublabel}
                </p>
              </motion.div>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">Equipment Slots</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Your pet has 5 outfit slots. You can put one item in each slot —
          like getting dressed in the morning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {EQUIPMENT_SLOTS.map((slot, i) => (
            <motion.div
              key={slot.slot}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="text-center bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded bg-[var(--pet-card,#0f1628)] border border-[var(--pet-border,#2a3a5c)] flex items-center justify-center font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)]">
                {slot.label.charAt(0)}
              </div>
              <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">{slot.label}</h4>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] mt-1">{slot.example}</p>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-4" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">How Drops Work</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-3">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl mb-1">🎓</div>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Study in<br/>voice chat</p>
            </div>
            <div className="font-pixel text-[var(--pet-text-dim,#8899aa)]">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎲</div>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Random<br/>chance</p>
            </div>
            <div className="font-pixel text-[var(--pet-text-dim,#8899aa)]">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎁</div>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Item<br/>drops!</p>
            </div>
          </div>
          <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed flex-1">
            Every few minutes of studying, there&apos;s a small chance an item drops.
            Chat messages also have a chance. You don&apos;t need to do anything special — just study!
          </p>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/inventory"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          View Your Inventory
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
