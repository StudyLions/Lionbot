// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Web Audio API hook for retro 8-bit enhancement SFX.
//          Generates all sounds procedurally -- no audio files.
//          Respects the global UI sound toggle from SoundContext.
// ============================================================

import { useCallback, useRef } from 'react'
import { useUISound } from '@/lib/SoundContext'

export type EnhancementSFX =
  | 'tick'
  | 'charge'
  | 'hammerStrike'
  | 'sparkle'
  | 'successFanfare'
  | 'failThud'
  | 'destroyCrash'
  | 'uiClick'
  | 'runeSpinTick'
  | 'suspenseHold'

export function useEnhancementSFX() {
  const { soundEnabled } = useUISound()
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const tone = useCallback((
    freq: number, dur: number, type: OscillatorType = 'square',
    vol = 0.15, delay = 0
  ) => {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    g.gain.setValueAtTime(vol, ctx.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur)
  }, [getCtx])

  const noise = useCallback((dur: number, vol = 0.1, delay = 0) => {
    const ctx = getCtx()
    if (!ctx) return
    const bufferSize = ctx.sampleRate * dur
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, ctx.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    src.connect(g)
    g.connect(ctx.destination)
    src.start(ctx.currentTime + delay)
    src.stop(ctx.currentTime + delay + dur)
  }, [getCtx])

  const sweep = useCallback((
    startFreq: number, endFreq: number, dur: number,
    type: OscillatorType = 'sawtooth', vol = 0.1, delay = 0
  ) => {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime + delay)
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + delay + dur)
    g.gain.setValueAtTime(vol, ctx.currentTime + delay)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur)
  }, [getCtx])

  const play = useCallback((sound: EnhancementSFX) => {
    if (!soundEnabled) return
    try {
      switch (sound) {
        case 'tick':
          tone(800, 0.05, 'square', 0.08)
          break

        case 'charge':
          sweep(200, 800, 1.5, 'sawtooth', 0.12)
          break

        case 'hammerStrike':
          noise(0.15, 0.25)
          tone(100, 0.2, 'sine', 0.2)
          tone(80, 0.3, 'sine', 0.15, 0.05)
          break

        case 'sparkle':
          tone(1200, 0.08, 'triangle', 0.1)
          tone(1600, 0.06, 'triangle', 0.08, 0.06)
          tone(2000, 0.04, 'triangle', 0.06, 0.1)
          break

        case 'successFanfare':
          tone(523, 0.08, 'square', 0.12)
          tone(659, 0.08, 'square', 0.12, 0.08)
          tone(784, 0.08, 'square', 0.12, 0.16)
          tone(1047, 0.2, 'square', 0.15, 0.24)
          tone(1047, 0.15, 'triangle', 0.08, 0.28)
          break

        case 'failThud':
          tone(100, 0.25, 'sine', 0.2)
          noise(0.1, 0.08)
          tone(80, 0.15, 'sine', 0.1, 0.1)
          break

        case 'destroyCrash':
          noise(0.4, 0.3)
          sweep(600, 80, 0.3, 'sawtooth', 0.2)
          tone(60, 0.5, 'sine', 0.25)
          noise(0.2, 0.1, 0.3)
          tone(40, 0.3, 'sine', 0.1, 0.4)
          break

        case 'uiClick':
          tone(600, 0.03, 'triangle', 0.06)
          break

        case 'runeSpinTick':
          tone(1000, 0.03, 'square', 0.06)
          tone(1200, 0.02, 'square', 0.04, 0.02)
          break

        case 'suspenseHold':
          sweep(300, 500, 0.5, 'triangle', 0.08)
          break
      }
    } catch {}
  }, [soundEnabled, tone, noise, sweep])

  return { play, soundEnabled }
}
