// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Client-side session streak tracker for enhancement.
//          Tracks consecutive successes/failures with playful
//          messages. Resets on page reload (no persistence).
// ============================================================

import { useCallback, useRef, useState } from 'react'

export interface StreakState {
  type: 'success' | 'fail' | 'none'
  count: number
  totalAttempts: number
  totalSuccesses: number
  totalFails: number
  totalDestroys: number
}

const SUCCESS_MESSAGES: Record<number, string> = {
  2: 'Double!',
  3: 'HAT TRICK!',
  4: 'QUAD COMBO!',
}

const FAIL_MESSAGES: Record<number, string> = {
  2: 'Unlucky...',
  3: 'The RNG gods frown upon you',
  5: 'Perseverance!',
}

export function getStreakMessage(state: StreakState, outcome: 'success' | 'failed' | 'destroyed'): string | null {
  if (outcome === 'destroyed') return 'Gone but not forgotten...'

  if (outcome === 'success') {
    if (state.type === 'success' && state.count >= 5) return `ON FIRE! (${state.count}x)`
    return SUCCESS_MESSAGES[state.count] ?? null
  }

  if (outcome === 'failed') {
    if (state.type === 'fail' && state.count >= 7) return `THE CURSE IS REAL (${state.count}x)`
    return FAIL_MESSAGES[state.count] ?? null
  }

  return null
}

export function useEnhancementStreak() {
  const [streak, setStreak] = useState<StreakState>({
    type: 'none',
    count: 0,
    totalAttempts: 0,
    totalSuccesses: 0,
    totalFails: 0,
    totalDestroys: 0,
  })

  const streakRef = useRef(streak)
  streakRef.current = streak

  const recordOutcome = useCallback((outcome: 'success' | 'failed' | 'destroyed') => {
    setStreak(prev => {
      const next = { ...prev, totalAttempts: prev.totalAttempts + 1 }

      if (outcome === 'destroyed') {
        next.totalDestroys = prev.totalDestroys + 1
        next.type = 'none'
        next.count = 0
        return next
      }

      if (outcome === 'success') {
        next.totalSuccesses = prev.totalSuccesses + 1
        if (prev.type === 'success') {
          next.count = prev.count + 1
        } else {
          next.type = 'success'
          next.count = 1
        }
      } else {
        next.totalFails = prev.totalFails + 1
        if (prev.type === 'fail') {
          next.count = prev.count + 1
        } else {
          next.type = 'fail'
          next.count = 1
        }
      }

      return next
    })
  }, [])

  const getMessage = useCallback((outcome: 'success' | 'failed' | 'destroyed'): string | null => {
    return getStreakMessage(streakRef.current, outcome)
  }, [])

  const reset = useCallback(() => {
    setStreak({ type: 'none', count: 0, totalAttempts: 0, totalSuccesses: 0, totalFails: 0, totalDestroys: 0 })
  }, [])

  return { streak, recordOutcome, getMessage, reset }
}
