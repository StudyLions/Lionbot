// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Pixel-art anvil forge scene for enhancement ceremony.
//          Pure CSS/div-based pixel art -- no image assets needed.
// ============================================================

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface AnvilSceneProps {
  phase: 'charging' | 'striking' | 'revealing'
  outcome?: 'success' | 'failed' | 'destroyed' | null
  intensity: 'low' | 'medium' | 'high'
  equipImage?: string | null
  scrollImage?: string | null
  equipName?: string
  fastMode?: boolean
}

export default function AnvilScene({
  phase, outcome, intensity, equipImage, scrollImage, equipName, fastMode,
}: AnvilSceneProps) {
  const speedMult = fastMode ? 0.33 : 1

  const fireClass = intensity === 'high'
    ? 'animate-enhance-fire-intense'
    : 'animate-enhance-fire'

  const sparks = useMemo(() => {
    const count = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 120,
      y: -(Math.random() * 60 + 20),
      delay: Math.random() * 0.2,
      size: 2 + Math.random() * 3,
    }))
  }, [intensity])

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ minHeight: 220 }}>
      {/* Forge fire */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div
          className={fireClass}
          style={{
            width: intensity === 'high' ? 120 : 80,
            height: intensity === 'high' ? 40 : 28,
            background: `radial-gradient(ellipse at center bottom,
              ${intensity === 'high' ? 'rgba(255,100,20,0.9)' : 'rgba(240,140,40,0.7)'} 0%,
              rgba(240,192,64,0.5) 40%,
              rgba(200,60,20,0.3) 70%,
              transparent 100%)`,
            borderRadius: '50% 50% 0 0',
            transformOrigin: 'center bottom',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Anvil body */}
      <div className="relative" style={{ marginTop: 40 }}>
        <div
          className={phase === 'striking' && outcome !== null ? 'animate-enhance-impact' : ''}
          style={{
            width: 80,
            height: 32,
            background: 'linear-gradient(180deg, #5a6070 0%, #3a3e4c 50%, #2a2e3c 100%)',
            borderTop: '3px solid #7a8090',
            borderBottom: '3px solid #1a1e2c',
            position: 'relative',
          }}
        >
          {/* Anvil face */}
          <div style={{
            position: 'absolute', top: -8, left: -12, right: -12, height: 8,
            background: 'linear-gradient(180deg, #8a90a0 0%, #6a7080 100%)',
            borderTop: '2px solid #a0a8b8',
          }} />
          {/* Anvil horn */}
          <div style={{
            position: 'absolute', top: -8, right: -28, width: 20, height: 8,
            background: '#6a7080',
            clipPath: 'polygon(0 0, 100% 30%, 100% 100%, 0 100%)',
          }} />
          {/* Anvil base */}
          <div style={{
            position: 'absolute', bottom: -16, left: 8, right: 8, height: 16,
            background: 'linear-gradient(180deg, #2a2e3c 0%, #1a1e28 100%)',
            borderBottom: '2px solid #0a0e18',
          }} />
        </div>

        {/* Equipment on anvil */}
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2"
          animate={
            phase === 'revealing' && outcome === 'success'
              ? { y: [-10, -30, -20], scale: [1, 1.2, 1.1] }
              : phase === 'revealing' && outcome === 'failed'
              ? { x: [0, -4, 4, -3, 3, -1, 1, 0], rotate: [0, -3, 3, -2, 2, -1, 1, 0] }
              : phase === 'revealing' && outcome === 'destroyed'
              ? { scale: [1, 1.05, 0], opacity: [1, 1, 0] }
              : {}
          }
          transition={{ duration: 0.5 * speedMult, ease: 'easeOut' }}
        >
          <div
            className="w-12 h-12 border-2 border-[#3a4a6c] bg-[#0a0e1a] flex items-center justify-center"
            style={{
              boxShadow: phase === 'charging'
                ? `0 0 ${intensity === 'high' ? 16 : 8}px rgba(240,192,64,0.4)`
                : phase === 'revealing' && outcome === 'success'
                ? '0 0 20px rgba(255,215,0,0.6)'
                : 'none',
            }}
          >
            {equipImage ? (
              <img src={equipImage} alt="" className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim)]">
                {equipName?.slice(0, 2) || '??'}
              </span>
            )}
          </div>
        </motion.div>

        {/* Scroll floating above */}
        <AnimatePresence>
          {phase === 'charging' && (
            <motion.div
              className="absolute -top-32 left-1/2 -translate-x-1/2"
              initial={{ y: -20, opacity: 0, rotate: -10 }}
              animate={{ y: [0, -5, 0], opacity: 1, rotate: [0, 5, -5, 0] }}
              exit={{ y: 10, opacity: 0, scale: 0.5 }}
              transition={{ duration: 1 * speedMult, repeat: Infinity, repeatType: 'mirror' }}
            >
              <div className="w-10 h-10 border-2 border-[#4080f0] bg-[#0a0e1a] flex items-center justify-center"
                style={{ boxShadow: '0 0 8px rgba(64,128,240,0.3)' }}>
                {scrollImage ? (
                  <img src={scrollImage} alt="" className="w-7 h-7 object-contain" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <span className="text-base">{"\u{1F4DC}"}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pet lion beside anvil */}
      <motion.div
        className="absolute bottom-8"
        style={{ left: 'calc(50% - 70px)' }}
        animate={
          phase === 'charging'
            ? { y: [0, -5, -8, -5, 0], rotate: [0, -5, 0, 5, 0] }
            : phase === 'revealing' && outcome === 'destroyed'
            ? { y: [0, 2, 0] }
            : {}
        }
        transition={{ duration: 1.2 * speedMult, repeat: phase === 'charging' ? Infinity : 0 }}
      >
        <div className="text-2xl select-none" style={{ filter: phase === 'revealing' && outcome === 'destroyed' ? 'grayscale(0.5)' : 'none' }}>
          {phase === 'revealing' && outcome === 'destroyed' ? '\u{1F63F}' : '\u{1F981}'}
        </div>
        {/* Blessing sparkles during charge */}
        {phase === 'charging' && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="text-xs">{"\u2728"}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Hammer */}
      <AnimatePresence>
        {phase === 'striking' && (
          <motion.div
            className="absolute -top-4 left-1/2"
            style={{ transformOrigin: 'bottom center', marginLeft: 10 }}
            initial={{ rotate: -60, y: -20 }}
            animate={{ rotate: 0, y: 0 }}
            transition={{ duration: 0.25 * speedMult, ease: [0.6, 0, 0.4, 1] }}
          >
            {/* Hammer head */}
            <div style={{
              width: 24, height: 16,
              background: 'linear-gradient(180deg, #7a8090 0%, #5a6070 100%)',
              border: '2px solid #9aa0b0',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
                width: 6, height: 20,
                background: 'linear-gradient(90deg, #8a6030, #6a4820)',
                border: '1px solid #a07838',
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact sparks */}
      <AnimatePresence>
        {phase === 'striking' && (
          <>
            {sparks.map((s) => (
              <motion.div
                key={s.id}
                className="absolute"
                style={{
                  left: '50%', top: '30%',
                  width: s.size, height: s.size,
                  background: '#f0c040',
                  borderRadius: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: s.x, y: s.y, opacity: 0, scale: 0 }}
                transition={{ duration: 0.4 * speedMult, delay: s.delay, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Golden burst on success */}
      <AnimatePresence>
        {phase === 'revealing' && outcome === 'success' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 * speedMult }}
          >
            <div
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(240,192,64,0.2) 50%, transparent 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Red flash on destroy */}
      <AnimatePresence>
        {phase === 'revealing' && outcome === 'destroyed' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(180,30,30,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4 * speedMult }}
          />
        )}
      </AnimatePresence>

      {/* Rune symbols during striking suspense */}
      <AnimatePresence>
        {phase === 'striking' && (
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 * speedMult }}
          >
            {['\u2726', '\u2727', '\u2726'].map((rune, i) => (
              <motion.div
                key={i}
                className="w-6 h-8 border border-[#3a4a6c] bg-[#0a0e1a] flex items-center justify-center overflow-hidden"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i * speedMult }}
              >
                <motion.span
                  className="font-pixel text-[10px] text-[var(--pet-gold)]"
                  animate={{ y: [0, -8, -16, 0] }}
                  transition={{ duration: 0.3 * speedMult, delay: 0.1 * i * speedMult, ease: 'linear' }}
                >
                  {rune}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smoke wisps on fail */}
      <AnimatePresence>
        {phase === 'revealing' && outcome === 'failed' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `calc(50% + ${(i - 1) * 15}px)`,
                  bottom: '45%',
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'rgba(100,110,130,0.4)',
                  filter: 'blur(2px)',
                }}
                initial={{ y: 0, opacity: 0.6, scale: 1 }}
                animate={{ y: -40, opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 * speedMult, delay: i * 0.15 * speedMult }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* DESTROYED stamp text */}
      <AnimatePresence>
        {phase === 'revealing' && outcome === 'destroyed' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 3, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 * speedMult, type: 'spring', damping: 12 }}
          >
            <span
              className="font-pixel text-3xl tracking-wider"
              style={{
                color: '#e04040',
                textShadow: '0 0 10px rgba(224,64,64,0.8), 2px 2px 0 #060810',
              }}
            >
              DESTROYED
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
