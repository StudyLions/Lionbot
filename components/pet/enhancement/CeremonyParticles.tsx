// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Particle effects for enhancement ceremony -- embers,
//          shatter fragments, smoke, sparkle trails.
// ============================================================

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface EmberProps {
  count?: number
  color?: string
  speedMult?: number
}

export function ForgeEmbers({ count = 6, color = '#f0a030', speedMult = 1 }: EmberProps) {
  const embers = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 30 + Math.random() * 40,
      delay: Math.random() * 0.8,
      duration: 0.8 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 20,
      size: 2 + Math.random() * 2,
    })),
  [count])

  return (
    <>
      {embers.map((e) => (
        <motion.div
          key={e.id}
          className="absolute pointer-events-none"
          style={{
            left: `${e.left}%`,
            bottom: '30%',
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: color,
          }}
          animate={{
            y: [-5, -35],
            x: [0, e.drift],
            opacity: [0.8, 0],
            scale: [1, 0.3],
          }}
          transition={{
            duration: e.duration * speedMult,
            delay: e.delay * speedMult,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}

interface ShatterProps {
  fragCount?: number
  speedMult?: number
}

export function ShatterFragments({ fragCount = 10, speedMult = 1 }: ShatterProps) {
  const fragments = useMemo(() =>
    Array.from({ length: fragCount }, (_, i) => {
      const angle = (i / fragCount) * Math.PI * 2
      const dist = 40 + Math.random() * 60
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist + 20,
        rot: (Math.random() - 0.5) * 360,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.1,
        color: Math.random() > 0.5 ? '#4a5060' : '#3a3e4c',
      }
    }),
  [fragCount])

  return (
    <>
      {fragments.map((f) => (
        <motion.div
          key={f.id}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '40%',
            width: f.size,
            height: f.size,
            background: f.color,
            border: '1px solid #2a2e3c',
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{
            x: f.x,
            y: f.y,
            rotate: f.rot,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{
            duration: 0.6 * speedMult,
            delay: f.delay * speedMult,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}

interface SuccessSparkleProps {
  count?: number
  glowColor?: string
  speedMult?: number
}

export function SuccessSparkles({ count = 12, glowColor = '#ffd700', speedMult = 1 }: SuccessSparkleProps) {
  const sparkles = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const dist = 30 + Math.random() * 50
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        delay: Math.random() * 0.3,
        size: 2 + Math.random() * 3,
      }
    }),
  [count])

  return (
    <>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '35%',
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: glowColor,
            boxShadow: `0 0 4px ${glowColor}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.6 * speedMult,
            delay: s.delay * speedMult,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}
