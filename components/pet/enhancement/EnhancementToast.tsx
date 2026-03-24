// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Animated corner toast for enhancement results.
//          Stacks multiple toasts, auto-dismisses, shows streaks.
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { GlowTier } from '@/utils/gameConstants'
import { GLOW_TEXT_COLORS, GLOW_LABELS } from '@/utils/gameConstants'

export interface ToastData {
  id: number
  outcome: 'success' | 'failed' | 'destroyed'
  itemName: string
  newLevel?: number
  currentLevel?: number
  goldGained?: number
  dropGained?: number
  glowTier?: GlowTier
  scrollName?: string
  streakMessage?: string | null
}

const BORDER_COLORS = {
  success: 'var(--pet-green, #40d870)',
  failed: 'var(--pet-gold, #f0c040)',
  destroyed: 'var(--pet-red, #e04040)',
}

const BG_COLORS = {
  success: 'rgba(40,100,60,0.9)',
  failed: 'rgba(80,60,20,0.9)',
  destroyed: 'rgba(100,30,30,0.9)',
}

interface EnhancementToastStackProps {
  toasts: ToastData[]
  onDismiss: (id: number) => void
}

export function EnhancementToastStack({ toasts, onDismiss }: EnhancementToastStackProps) {
  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col-reverse gap-2 max-w-[340px] w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <EnhancementToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function EnhancementToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ x: '120%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '120%', opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="cursor-pointer"
      onClick={() => onDismiss(toast.id)}
    >
      <div
        className="border-2 px-3 py-2.5 font-pixel"
        style={{
          borderColor: BORDER_COLORS[toast.outcome],
          backgroundColor: BG_COLORS[toast.outcome],
          boxShadow: `2px 2px 0 #060810, 0 0 8px ${BORDER_COLORS[toast.outcome]}40`,
        }}
      >
        {toast.outcome === 'success' && (
          <div>
            <span className="text-[13px] text-[var(--pet-green)] block">
              {toast.itemName} +{toast.newLevel}!
            </span>
            <span className="text-[10px] text-[var(--pet-text-dim)] block mt-0.5">
              {toast.scrollName}: +{toast.goldGained}% G/XP, +{toast.dropGained}% Drop
              {toast.glowTier && toast.glowTier !== 'none' && (
                <span className={cn('ml-1', GLOW_TEXT_COLORS[toast.glowTier])}>
                  [{GLOW_LABELS[toast.glowTier]}]
                </span>
              )}
            </span>
          </div>
        )}
        {toast.outcome === 'failed' && (
          <span className="text-[13px] text-[var(--pet-gold)] block">
            {toast.itemName} unchanged at +{toast.currentLevel}
          </span>
        )}
        {toast.outcome === 'destroyed' && (
          <span className="text-[13px] text-[var(--pet-red)] block">
            {toast.itemName} was destroyed!
          </span>
        )}
        {toast.streakMessage && (
          <motion.span
            className={cn(
              'text-[11px] block mt-1 italic',
              toast.outcome === 'success' ? 'text-green-300' :
              toast.outcome === 'destroyed' ? 'text-red-300' : 'text-yellow-300'
            )}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {toast.streakMessage}
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

export function useToastStack() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const nextId = useRef(0)

  const addToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { ...data, id }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}
