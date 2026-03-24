// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 10 -- Family system with role hierarchy
//          diagram, shared features explanation, and benefits
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import { FAMILY_ROLES, FAMILY_FEATURES } from "../tutorialMockData"
import Link from "next/link"
import { ArrowRight, Sprout, Landmark, Trophy } from "lucide-react"

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  sprout: <Sprout className="w-6 h-6 text-emerald-400" />,
  vault: <Landmark className="w-6 h-6 text-amber-400" />,
  trophy: <Trophy className="w-6 h-6 text-cyan-400" />,
}

export default function StepFamily() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is a Family?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          A Family is a <strong className="text-[var(--pet-text,#e2e8f0)]">team of players</strong> who
          work together. Think of it like starting a club with your friends. You share a bigger farm,
          pool gold in a shared bank, and compete on a family leaderboard against other teams.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Family Roles</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Every family has a hierarchy. The leader makes decisions, officers help manage, and members contribute.
        </p>

        <div className="space-y-2">
          {FAMILY_ROLES.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 p-3 bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded"
              style={{
                marginLeft: i * 16,
              }}
            >
              <span className="text-xl flex-shrink-0">{role.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)]">{role.role}</h4>
                  <span className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                    ({role.count})
                  </span>
                </div>
                <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)]">
                  {role.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">What Families Share</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FAMILY_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                {FEATURE_ICONS[feature.icon] || <span className="text-2xl">📦</span>}
              </div>
              <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">{feature.title}</h4>
              <p className="font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="p-4" corners>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] mb-1">Getting Started</h4>
            <ul className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed space-y-1">
              <li>• <strong className="text-[var(--pet-text,#e2e8f0)]">Create</strong> a family (costs gold) and invite friends</li>
              <li>• Or <strong className="text-[var(--pet-text,#e2e8f0)]">join</strong> an existing family when someone invites you</li>
              <li>• You can only be in one family at a time</li>
              <li>• Leaving or disbanding is always an option</li>
            </ul>
          </div>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/family"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          Explore Families
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
