// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 7 -- Item Wiki explanation with mock
//          item grid and collection tracker demo
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBar from "@/components/pet/ui/PixelBar"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import { getItemImageUrl } from "@/utils/petAssets"
import { MOCK_ITEMS } from "../tutorialMockData"
import Link from "next/link"
import { ArrowRight, Search, BarChart3, BookOpen } from "lucide-react"

const RARITY_BORDER: Record<string, string> = {
  COMMON: "#3a4a6c", UNCOMMON: "#4080f0", RARE: "#e04040",
  EPIC: "#f0c040", LEGENDARY: "#d060f0", MYTHICAL: "#ff6080",
}

export default function StepWiki() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is the Wiki?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          The Wiki is an <strong className="text-[var(--pet-text,#e2e8f0)]">encyclopedia</strong> for
          every item in the game. Think of it like a catalog or guide book. You can look up any
          item to see what it looks like, how rare it is, how many people own it, and its
          price history on the marketplace.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Browse Items</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          The Wiki shows every item as a card. Tap any item to see its full details.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MOCK_ITEMS.map((item, i) => {
            const imgUrl = getItemImageUrl(item.assetPath, item.category)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[var(--pet-bg,#0a0e1a)] rounded p-3 text-center"
                style={{ borderWidth: 2, borderStyle: "solid", borderColor: RARITY_BORDER[item.rarity] || "#2a3a5c" }}
              >
                <div className="w-12 h-12 mx-auto mb-2">
                  {imgUrl ? (
                    <CroppedItemImage src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate">{item.name}</p>
                <PixelBadge rarity={item.rarity} className="mt-1" />
              </motion.div>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Wiki Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <Search className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Search</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Find any item by name. Filter by rarity or category.
            </p>
          </div>
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <BarChart3 className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Price History</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              See how much items sell for on the marketplace over time.
            </p>
          </div>
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <BookOpen className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Enhancement Info</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Check enhancement success rates and calculate upgrade costs.
            </p>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Collection Tracker</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-3">
          The Wiki tracks how many unique items you own. Can you collect them all?
        </p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">Your Collection</span>
            <span className="font-pixel text-[11px] text-[var(--pet-gold,#f0c040)]">12 / 47 items</span>
          </div>
          <PixelBar value={12} max={47} color="gold" showText />
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/wiki"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          Browse the Wiki
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
