// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 4 -- Gameboy skins with side-by-side
//          GameboyFrame comparisons showing the same room in
//          different frames
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { MOCK_SKINS } from "../tutorialMockData"
import { getRoomPreviewUrl } from "@/utils/petAssets"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function StepSkins() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Are Skins?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          See the frame around your room? That&apos;s called a <strong className="text-[var(--pet-text,#e2e8f0)]">Gameboy skin</strong>.
          It&apos;s purely decorative — like putting a phone case on your phone. It doesn&apos;t change
          how your pet works or what it earns. It just looks cool.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Same Room, Different Skins</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Here&apos;s the same room with three different skins. The room inside stays the same —
          only the border changes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_SKINS.map((skin, i) => (
            <motion.div
              key={skin.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="flex justify-center">
                <div style={{ width: 200, maxWidth: "100%" }}>
                  <GameboyFrame isFullscreen={false} skinAssetPath={skin.assetPath} width={200}>
                    <img
                      src={getRoomPreviewUrl("rooms/castle")}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </GameboyFrame>
                </div>
              </div>
              <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mt-2">{skin.name}</p>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-4" corners>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] mb-1">How to Get Skins</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Browse the Skins shop, pick one you like, and buy it with gold.
              Some skins are cheap and common, others are rare and expensive.
              Once bought, equip it with one click.
            </p>
          </div>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link href="/pet/skins">
          <a className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors">
            Browse Skins
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Link>
      </div>
    </div>
  )
}
