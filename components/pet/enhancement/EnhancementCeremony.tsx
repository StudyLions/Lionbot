// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Enhancement ceremony orchestrator -- state machine
//          driving the 3-phase anvil forge animation sequence.
//          charge -> strike -> reveal -> done
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import AnvilScene from './AnvilScene'
import { ForgeEmbers, ShatterFragments, SuccessSparkles } from './CeremonyParticles'
import PixelBar from '@/components/pet/ui/PixelBar'
import { useEnhancementSFX } from '@/hooks/useEnhancementSFX'
import { GLOW_COLORS, type GlowTier } from '@/utils/gameConstants'

type CeremonyPhase = 'idle' | 'charging' | 'striking' | 'revealing' | 'done'

export type CeremonyOutcome = 'success' | 'failed' | 'destroyed'

interface CeremonyResult {
  outcome: CeremonyOutcome
  itemName: string
  newLevel?: number
  currentLevel?: number
  bonusGained?: number
  goldGained?: number
  dropGained?: number
  glowTier?: GlowTier
  scrollName?: string
}

interface EnhancementCeremonyProps {
  active: boolean
  result: CeremonyResult | null
  equipImage?: string | null
  scrollImage?: string | null
  equipName?: string
  scrollRarity?: string
  destroyRate: number
  fastMode?: boolean
  onComplete: () => void
}

function calcIntensity(scrollRarity: string, destroyRate: number): 'low' | 'medium' | 'high' {
  const rarityScore = ['COMMON', 'UNCOMMON'].includes(scrollRarity) ? 0 : ['RARE', 'EPIC'].includes(scrollRarity) ? 1 : 2
  const riskScore = destroyRate > 0.3 ? 2 : destroyRate > 0 ? 1 : 0
  const total = rarityScore + riskScore
  if (total >= 3) return 'high'
  if (total >= 1) return 'medium'
  return 'low'
}

const TIMING = {
  low:    { charge: 1500, strike: 800, reveal: 1200 },
  medium: { charge: 2000, strike: 1000, reveal: 1500 },
  high:   { charge: 2500, strike: 1200, reveal: 2000 },
}

export default function EnhancementCeremony({
  active, result, equipImage, scrollImage, equipName,
  scrollRarity = 'COMMON', destroyRate, fastMode = false, onComplete,
}: EnhancementCeremonyProps) {
  const [phase, setPhase] = useState<CeremonyPhase>('idle')
  const [chargeProgress, setChargeProgress] = useState(0)
  const [showShake, setShowShake] = useState(false)
  const resultRef = useRef<CeremonyResult | null>(null)
  const sfx = useEnhancementSFX()
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const sfxRef = useRef(sfx)
  const onCompleteRef = useRef(onComplete)
  const fastModeRef = useRef(fastMode)

  useEffect(() => { sfxRef.current = sfx }, [sfx])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { fastModeRef.current = fastMode }, [fastMode])

  const intensity = calcIntensity(scrollRarity, destroyRate)
  const speedMult = fastMode ? 0.33 : 1

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []
  }, [])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    timerRefs.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    resultRef.current = result
  }, [result])

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      setChargeProgress(0)
      clearTimers()
      return
    }

    const t = TIMING[intensity]
    const chargeDur = t.charge * speedMult
    const strikeDur = t.strike * speedMult
    const revealDur = t.reveal * speedMult

    setPhase('charging')
    setChargeProgress(0)
    sfxRef.current.play('charge')

    const segments = 10
    const segInterval = chargeDur / segments
    for (let i = 1; i <= segments; i++) {
      addTimer(() => {
        setChargeProgress(i)
        sfxRef.current.play('tick')
      }, segInterval * i)
    }

    addTimer(() => {
      setPhase('striking')
      sfxRef.current.play('hammerStrike')
      sfxRef.current.play('runeSpinTick')
    }, chargeDur)

    addTimer(() => {
      sfxRef.current.play('suspenseHold')
    }, chargeDur + strikeDur * 0.3)

    addTimer(() => {
      const r = resultRef.current
      const fm = fastModeRef.current
      setPhase('revealing')

      if (r?.outcome === 'success') {
        sfxRef.current.play('successFanfare')
        sfxRef.current.play('sparkle')
        setShowShake(true)
        addTimer(() => setShowShake(false), 400 * speedMult)

        const glowColor = r.glowTier && r.glowTier !== 'none'
          ? GLOW_COLORS[r.glowTier] : '#ffd700'

        try {
          confetti({
            particleCount: fm ? 40 : 80,
            spread: 70,
            origin: { x: 0.5, y: 0.4 },
            colors: ['#ffd700', '#f0c040', glowColor, '#ffffff'],
            ticks: fm ? 100 : 200,
            gravity: 1.2,
            scalar: 0.8,
          })
        } catch {}
      } else if (r?.outcome === 'failed') {
        sfxRef.current.play('failThud')
      } else if (r?.outcome === 'destroyed') {
        sfxRef.current.play('destroyCrash')
        setShowShake(true)
        addTimer(() => setShowShake(false), 600 * speedMult)

        try {
          confetti({
            particleCount: fm ? 20 : 40,
            spread: 120,
            origin: { x: 0.5, y: 0.4 },
            colors: ['#e04040', '#a02020', '#3a3e4c', '#1a1e2c'],
            ticks: 100,
            gravity: 2,
            scalar: 0.6,
          })
        } catch {}
      }
    }, chargeDur + strikeDur)

    addTimer(() => {
      setPhase('done')
      onCompleteRef.current()
    }, chargeDur + strikeDur + revealDur)

    return clearTimers
    // Only re-run when the ceremony starts/stops or timing parameters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intensity, speedMult, clearTimers, addTimer])

  if (!active && phase === 'idle') return null

  return (
    <AnimatePresence>
      {(active || phase !== 'idle') && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          {/* --- AI-MODIFIED (2026-03-24) --- */}
          {/* Purpose: Standardize pet modal overlay to bg-black/70 + blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          {/* --- END AI-MODIFIED --- */}

          {/* Shake wrapper */}
          <div className={showShake
            ? (result?.outcome === 'destroyed' ? 'animate-enhance-shake-hard' : 'animate-enhance-shake')
            : ''
          }>
            {/* Edge glow for high-intensity */}
            {intensity === 'high' && phase === 'charging' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 60px rgba(180,30,30,0.3)',
                }}
              />
            )}

            {/* Main ceremony area */}
            <motion.div
              className="relative w-[320px] max-w-[90vw] border-[3px] border-[#3a4a6c] bg-[#0c1020] p-4"
              style={{ boxShadow: '4px 4px 0 #060810' }}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Header */}
              <div className="text-center mb-3">
                <span className="font-pixel text-sm text-[var(--pet-gold)]">
                  {phase === 'charging' ? 'FORGING...' :
                   phase === 'striking' ? 'ENHANCING!' :
                   phase === 'revealing' && result?.outcome === 'success' ? 'SUCCESS!' :
                   phase === 'revealing' && result?.outcome === 'failed' ? 'FAILED' :
                   phase === 'revealing' && result?.outcome === 'destroyed' ? 'BOOM!' :
                   ''}
                </span>
              </div>

              {/* Anvil scene */}
              <AnvilScene
                phase={phase === 'idle' || phase === 'done' ? 'charging' : phase as any}
                outcome={phase === 'revealing' ? result?.outcome ?? null : null}
                intensity={intensity}
                equipImage={equipImage}
                scrollImage={scrollImage}
                equipName={equipName}
                fastMode={fastMode}
              />

              {/* Embers */}
              {(phase === 'charging' || phase === 'striking') && (
                <ForgeEmbers
                  count={intensity === 'high' ? 10 : 5}
                  color={intensity === 'high' ? '#ff6030' : '#f0a030'}
                  speedMult={speedMult}
                />
              )}

              {/* Shatter fragments on destroy */}
              {phase === 'revealing' && result?.outcome === 'destroyed' && (
                <ShatterFragments fragCount={12} speedMult={speedMult} />
              )}

              {/* Success sparkles */}
              {phase === 'revealing' && result?.outcome === 'success' && (
                <SuccessSparkles
                  count={fastMode ? 8 : 14}
                  glowColor={result.glowTier ? GLOW_COLORS[result.glowTier] || '#ffd700' : '#ffd700'}
                  speedMult={speedMult}
                />
              )}

              {/* Charge bar */}
              {phase === 'charging' && (
                <div className="mt-4">
                  <PixelBar
                    value={chargeProgress}
                    max={10}
                    segments={10}
                    color="gold"
                    label="Power"
                  />
                </div>
              )}

              {/* Result info */}
              {phase === 'revealing' && result && (
                <motion.div
                  className="mt-4 text-center space-y-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * speedMult }}
                >
                  {result.outcome === 'success' && (
                    <>
                      <p className="font-pixel text-sm text-[var(--pet-green)]">
                        {result.itemName} +{result.newLevel}
                      </p>
                      <p className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
                        {result.scrollName}: +{result.goldGained}% Gold/XP, +{result.dropGained}% Drop
                      </p>
                    </>
                  )}
                  {result.outcome === 'failed' && (
                    <p className="font-pixel text-sm text-[var(--pet-gold)]">
                      {result.itemName} unchanged at +{result.currentLevel}
                    </p>
                  )}
                  {result.outcome === 'destroyed' && (
                    <p className="font-pixel text-sm text-[var(--pet-red)]">
                      {result.itemName} was destroyed!
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
