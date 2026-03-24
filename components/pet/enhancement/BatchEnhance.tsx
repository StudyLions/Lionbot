// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Auto-repeat batch enhance mode. Loops enhancement
//          until success, destroy, or out of scrolls.
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import PixelButton from '@/components/pet/ui/PixelButton'

export interface BatchState {
  active: boolean
  attempt: number
  scrollsRemaining: number
  stopped: boolean
}

interface BatchEnhanceControlsProps {
  batchEnabled: boolean
  onToggleBatch: (enabled: boolean) => void
  batchState: BatchState
  onStop: () => void
  className?: string
}

export function BatchEnhanceControls({
  batchEnabled, onToggleBatch, batchState, onStop, className,
}: BatchEnhanceControlsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {batchState.active ? (
        <>
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
            Attempt {batchState.attempt} | {batchState.scrollsRemaining} scrolls left
          </span>
          <PixelButton variant="danger" size="sm" onClick={onStop}>
            Stop
          </PixelButton>
        </>
      ) : (
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={batchEnabled}
            onChange={(e) => onToggleBatch(e.target.checked)}
            className="w-3 h-3 accent-[var(--pet-gold)]"
          />
          <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
            Quick Enhance
          </span>
          <span className="font-pixel text-[9px] text-[var(--pet-text-dim)]/60">
            (auto-repeat)
          </span>
        </label>
      )}
    </div>
  )
}

export function useBatchEnhance() {
  const [batchEnabled, setBatchEnabled] = useState(false)
  const [batchState, setBatchState] = useState<BatchState>({
    active: false, attempt: 0, scrollsRemaining: 0, stopped: false,
  })

  const stateRef = useRef(batchState)
  stateRef.current = batchState

  const startBatch = useCallback((scrollQuantity: number) => {
    setBatchState({ active: true, attempt: 1, scrollsRemaining: scrollQuantity, stopped: false })
  }, [])

  const recordBatchAttempt = useCallback((outcome: 'success' | 'failed' | 'destroyed', scrollsLeft: number): boolean => {
    if (!stateRef.current.active || stateRef.current.stopped) return false

    if (outcome === 'success' || outcome === 'destroyed' || scrollsLeft <= 0) {
      setBatchState(prev => ({ ...prev, active: false, scrollsRemaining: scrollsLeft }))
      return false
    }

    setBatchState(prev => ({
      ...prev,
      attempt: prev.attempt + 1,
      scrollsRemaining: scrollsLeft,
    }))
    return true
  }, [])

  const stopBatch = useCallback(() => {
    setBatchState(prev => ({ ...prev, active: false, stopped: true }))
  }, [])

  const resetBatch = useCallback(() => {
    setBatchState({ active: false, attempt: 0, scrollsRemaining: 0, stopped: false })
  }, [])

  return {
    batchEnabled,
    setBatchEnabled,
    batchState,
    startBatch,
    recordBatchAttempt,
    stopBatch,
    resetBatch,
  }
}
