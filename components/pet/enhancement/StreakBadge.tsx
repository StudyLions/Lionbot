// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Visual streak badge showing consecutive success/fail
//          counts with playful styling.
// ============================================================

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { StreakState } from '@/hooks/useEnhancementStreak'

interface StreakBadgeProps {
  streak: StreakState
  className?: string
}

export default function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak.count < 2 || streak.type === 'none') return null

  const isSuccess = streak.type === 'success'
  const isOnFire = isSuccess && streak.count >= 5
  const isCursed = !isSuccess && streak.count >= 7

  return (
    <motion.div
      className={cn('inline-flex items-center gap-1 font-pixel', className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <div
        className={cn(
          'px-2 py-0.5 border text-[10px] flex items-center gap-1',
          isSuccess
            ? 'border-[var(--pet-green)] bg-[var(--pet-green)]/10 text-green-400'
            : 'border-[var(--pet-red)] bg-[var(--pet-red)]/10 text-red-400',
          isCursed && 'border-red-800 bg-red-900/30 text-red-300',
        )}
      >
        {isOnFire && (
          <span className="animate-enhance-streak-flame">{'\uD83D\uDD25'}</span>
        )}
        {isCursed && <span>{'\uD83D\uDC80'}</span>}
        <span>{streak.count}x</span>
        <span className="hidden sm:inline">
          {isSuccess
            ? streak.count >= 5 ? 'ON FIRE!' : streak.count >= 3 ? 'COMBO!' : 'streak'
            : streak.count >= 7 ? 'CURSED' : 'fails'}
        </span>
      </div>
    </motion.div>
  )
}

interface SessionStatsProps {
  streak: StreakState
  className?: string
}

export function SessionStats({ streak, className }: SessionStatsProps) {
  if (streak.totalAttempts === 0) return null

  return (
    <div className={cn('font-pixel text-[10px] text-[var(--pet-text-dim)] flex items-center gap-3', className)}>
      <span>Attempts: {streak.totalAttempts}</span>
      <span className="text-green-400">{streak.totalSuccesses} {'\u2713'}</span>
      <span className="text-yellow-400">{streak.totalFails} {'\u2717'}</span>
      {streak.totalDestroys > 0 && (
        <span className="text-red-400">{streak.totalDestroys} {'\uD83D\uDCA5'}</span>
      )}
    </div>
  )
}
