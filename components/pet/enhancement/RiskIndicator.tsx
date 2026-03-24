// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Risk-themed preview wrapper that color-codes the
//          enhancement preview based on success/destroy rates.
// ============================================================

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface RiskIndicatorProps {
  effectiveSuccess: number
  effectiveDestroy: number
  children: React.ReactNode
  className?: string
}

function getRiskLevel(success: number, destroy: number) {
  if (destroy > 0) return 'destroy'
  if (success < 30) return 'danger'
  if (success < 70) return 'risky'
  return 'safe'
}

const RISK_CONFIG = {
  safe: {
    borderColor: 'var(--pet-green, #40d870)',
    label: 'Safe Enhancement',
    animClass: 'animate-[enhance-risk-pulse-safe_3s_ease-in-out_infinite]',
    labelColor: 'text-green-400',
    icon: '\u2714\uFE0F',
  },
  risky: {
    borderColor: 'var(--pet-gold, #f0c040)',
    label: 'Risky Enhancement',
    animClass: 'animate-[enhance-risk-pulse-risky_2s_ease-in-out_infinite]',
    labelColor: 'text-yellow-400',
    icon: '\u26A0\uFE0F',
  },
  danger: {
    borderColor: 'var(--pet-red, #e04040)',
    label: 'Dangerous!',
    animClass: 'animate-[enhance-risk-pulse-danger_1.2s_ease-in-out_infinite]',
    labelColor: 'text-red-400',
    icon: '\u2757',
  },
  destroy: {
    borderColor: '#b41e1e',
    label: 'WARNING: Item may be DESTROYED!',
    animClass: 'animate-[enhance-risk-pulse-destroy_0.8s_ease-in-out_infinite]',
    labelColor: 'text-red-500',
    icon: '\uD83D\uDC80',
  },
}

export default function RiskIndicator({
  effectiveSuccess, effectiveDestroy, children, className,
}: RiskIndicatorProps) {
  const risk = getRiskLevel(effectiveSuccess, effectiveDestroy)
  const config = RISK_CONFIG[risk]

  return (
    <div
      className={cn('border-[3px] p-[3px] relative', config.animClass, className)}
      style={{
        borderColor: config.borderColor,
        boxShadow: `3px 3px 0 #060810, 0 0 12px ${config.borderColor}20`,
      }}
    >
      {/* Risk label */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e1a] border-b border-[#1a2a3c]">
        {risk === 'destroy' ? (
          <motion.span
            className="text-sm"
            animate={{ y: [0, -2, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {config.icon}
          </motion.span>
        ) : (
          <span className="text-xs">{config.icon}</span>
        )}
        <span className={cn('font-pixel text-[11px]', config.labelColor)}>
          {config.label}
        </span>
      </div>

      {children}
    </div>
  )
}
