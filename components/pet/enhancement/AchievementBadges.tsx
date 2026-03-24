// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Achievement badges display for enhancement page.
//          Shows unlocked achievements with animations for
//          newly unlocked ones.
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  ENHANCEMENT_ACHIEVEMENTS, ACHIEVEMENT_MAP, ACHIEVEMENT_TIER_COLORS,
  type AchievementDef,
} from '@/constants/enhancementAchievements'

interface AchievementBadgesProps {
  unlockedKeys: string[]
  newlyUnlocked?: string[]
  className?: string
}

export default function AchievementBadges({
  unlockedKeys, newlyUnlocked = [], className,
}: AchievementBadgesProps) {
  const [expanded, setExpanded] = useState(false)

  const unlockedSet = new Set(unlockedKeys)
  const unlockedCount = unlockedKeys.length
  const totalCount = ENHANCEMENT_ACHIEVEMENTS.length

  return (
    <div className={cn('border-[3px] border-[#3a4a6c] bg-[#0c1020]', className)}
      style={{ boxShadow: '3px 3px 0 #060810' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-3 py-2 bg-[#111828] border-b-2 border-[#1a2a3c] flex items-center justify-between hover:bg-[#151e30] transition-colors"
      >
        <span className="font-pixel text-[12px] text-[#4a5a70] tracking-[0.15em]">
          ACHIEVEMENTS ({unlockedCount}/{totalCount})
        </span>
        <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {ENHANCEMENT_ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedSet.has(achievement.key)
                const isNew = newlyUnlocked.includes(achievement.key)

                return (
                  <AchievementBadge
                    key={achievement.key}
                    achievement={achievement}
                    unlocked={isUnlocked}
                    isNew={isNew}
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AchievementBadge({
  achievement, unlocked, isNew,
}: {
  achievement: AchievementDef; unlocked: boolean; isNew: boolean
}) {
  const tierColor = ACHIEVEMENT_TIER_COLORS[achievement.tier]

  return (
    <motion.div
      className={cn(
        'relative border-2 p-2 text-center transition-all',
        unlocked
          ? 'bg-[#0a0e1a] border-[#3a4a6c]'
          : 'bg-[#060810] border-[#141c2c] opacity-40'
      )}
      style={unlocked ? { borderColor: tierColor + '60' } : undefined}
      animate={isNew ? { scale: [1, 1.1, 1], borderColor: [tierColor, tierColor + '80', tierColor + '60'] } : {}}
      transition={isNew ? { duration: 0.5, repeat: 2 } : undefined}
    >
      {isNew && (
        <motion.div
          className="absolute -top-1 -right-1 font-pixel text-[8px] px-1 bg-[var(--pet-gold)] text-[#0a0e1a]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          NEW!
        </motion.div>
      )}

      <div className="text-xl mb-1">{achievement.icon}</div>
      <p className="font-pixel text-[9px] text-[var(--pet-text)] leading-tight">
        {achievement.name}
      </p>
      {unlocked && (
        <p className="font-pixel text-[8px] text-[var(--pet-text-dim)] mt-0.5">
          {achievement.description}
        </p>
      )}
    </motion.div>
  )
}
