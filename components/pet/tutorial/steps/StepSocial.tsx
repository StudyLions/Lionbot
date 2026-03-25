// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 9 -- Friends & social with MiniGameboy
//          preview, friend actions explanation, and gifting info
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { getRoomLayerVariantUrl } from "@/utils/petAssets"
import Link from "next/link"
import { ArrowRight, Eye, Gift, Sprout, Search, UserPlus } from "lucide-react"

export default function StepSocial() {

  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">Making Friends</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          LionGotchi has a built-in friends system. Add other players, visit their rooms,
          peek at their farms, and send gifts. It&apos;s like social media, but for pixel pet lions.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Visit a Friend&apos;s Room</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          When you visit a friend, you can see their room, their pet, and all their decorations.
          Here&apos;s what a friend&apos;s room might look like:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div style={{ width: 200, maxWidth: "100%" }}>
            <GameboyFrame isFullscreen={false} width={200}>
              <div className="relative w-full h-full">
                <img
                  src={getRoomLayerVariantUrl("rooms/beach", "wall", 1)}
                  alt="Friend's room"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
                <img
                  src={getRoomLayerVariantUrl("rooms/beach", "floor", 1)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </GameboyFrame>
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-2">
              <p className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)]">🦁 StudyBuddy&apos;s Room</p>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">Level 12 · Beach Theme</p>
            </div>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Visiting is free and doesn&apos;t change anything in their room. Just looking!
            </p>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">What You Can Do</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3 text-center"
          >
            <Eye className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Visit Room</h4>
            <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              See their room, pet, and decorations
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3 text-center"
          >
            <Gift className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Send Gifts</h4>
            <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Send gold or items directly to a friend
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3 text-center"
          >
            <Sprout className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">View Farm</h4>
            <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Check out what they&apos;re growing
            </p>
          </motion.div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Adding Friends</h3>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--pet-text-dim,#8899aa)]" />
            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Search by username</span>
          </div>
          <span className="font-pixel text-[var(--pet-text-dim,#8899aa)]">→</span>
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--pet-text-dim,#8899aa)]" />
            <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">Send request</span>
          </div>
          <span className="font-pixel text-[var(--pet-text-dim,#8899aa)]">→</span>
          <span className="font-pixel text-[10px] text-emerald-400">Friends!</span>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link href="/pet/friends">
          <a className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors">
            Find Friends
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Link>
      </div>
    </div>
  )
}
