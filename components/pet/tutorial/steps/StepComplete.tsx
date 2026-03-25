// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 11 -- Celebration with confetti,
//          quick-links grid, and start exploring CTA
// ============================================================
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import LeoMascot from "@/components/setup/LeoMascot"
import { getPetLeoMessage } from "../petLeoMessages"
import Link from "next/link"
import {
  Heart, Home, Package, Palette, Sprout, Swords,
  BookOpen, Store, Users, Shield, Trophy, PawPrint,
} from "lucide-react"

const QUICK_LINKS = [
  { href: "/pet", label: "Overview", icon: <PawPrint className="w-5 h-5" />, color: "text-amber-400" },
  { href: "/pet/room", label: "Room", icon: <Home className="w-5 h-5" />, color: "text-cyan-400" },
  { href: "/pet/inventory", label: "Inventory", icon: <Package className="w-5 h-5" />, color: "text-purple-400" },
  { href: "/pet/skins", label: "Skins", icon: <Palette className="w-5 h-5" />, color: "text-pink-400" },
  { href: "/pet/farm", label: "Farm", icon: <Sprout className="w-5 h-5" />, color: "text-emerald-400" },
  { href: "/pet/enhancement", label: "Enhancement", icon: <Swords className="w-5 h-5" />, color: "text-red-400" },
  { href: "/pet/wiki", label: "Wiki", icon: <BookOpen className="w-5 h-5" />, color: "text-blue-400" },
  { href: "/pet/marketplace", label: "Marketplace", icon: <Store className="w-5 h-5" />, color: "text-orange-400" },
  { href: "/pet/leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" />, color: "text-yellow-400" },
  { href: "/pet/friends", label: "Friends", icon: <Users className="w-5 h-5" />, color: "text-indigo-400" },
  { href: "/pet/family", label: "Family", icon: <Shield className="w-5 h-5" />, color: "text-teal-400" },
]

interface StepCompleteProps {
  onFinish: () => void
  onRetake: () => void
}

export default function StepComplete({ onFinish, onRetake }: StepCompleteProps) {
  const confettiFired = useRef(false)

  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    import("canvas-confetti").then(({ default: confetti }) => {
      const end = Date.now() + 2000
      const colors = ["#f0c040", "#40d870", "#4080f0", "#e04040", "#d060f0"]

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }).catch(() => {})
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      <div className="flex flex-col items-center min-h-full px-4 py-8 pb-20 lg:pb-8 space-y-8 justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2"
      >
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pet-text,#e2e8f0)]">
          You&apos;re <span className="text-[var(--pet-gold,#f0c040)]">Ready!</span> 🎉
        </h1>
        <p className="font-pixel text-[12px] text-[var(--pet-text-dim,#8899aa)] max-w-md mx-auto leading-relaxed">
          You now know everything about LionGotchi. Time to explore!
        </p>
      </motion.div>

      <LeoMascot
        pose="celebrating"
        message={getPetLeoMessage("complete", "intro")}
        hintMessage={getPetLeoMessage("complete", "hint")}
        compact
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <PixelCard className="p-5" corners>
          <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3 text-center">Quick Links</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {QUICK_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <Link href={link.href}>
                  <a className="flex flex-col items-center gap-1.5 p-3 rounded bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] hover:border-[var(--pet-gold,#f0c040)]/30 transition-colors">
                    <span className={link.color}>{link.icon}</span>
                    <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">{link.label}</span>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </PixelCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <button
          onClick={onFinish}
          className="flex items-center gap-2 px-8 py-3 bg-[var(--pet-gold,#f0c040)] hover:bg-[var(--pet-gold,#f0c040)]/80 text-[var(--pet-bg,#0a0e1a)] font-pixel text-sm rounded transition-colors"
        >
          Start Exploring
        </button>
        <button
          onClick={onRetake}
          className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]/60 hover:text-[var(--pet-text-dim,#8899aa)] transition-colors"
        >
          Retake this tutorial
        </button>
      </motion.div>
      </div>
    </motion.div>
  )
}
