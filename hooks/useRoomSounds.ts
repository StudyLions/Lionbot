// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Retro 8-bit sound effects for room editor using Web Audio API
// ============================================================

import { useCallback, useRef } from 'react'

type SoundType = 'pickup' | 'place' | 'hover' | 'save' | 'undo' | 'error' | 'purchase' | 'colorCycle' | 'flip'

export function useRoomSounds() {
  const ctxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(true)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.1) => {
    if (!enabledRef.current) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }, [getCtx])

  const playSequence = useCallback((notes: Array<{ freq: number; dur: number; delay: number }>, type: OscillatorType = 'square', volume: number = 0.1) => {
    if (!enabledRef.current) return
    try {
      const ctx = getCtx()
      for (const note of notes) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.delay)
        gain.gain.setValueAtTime(volume, ctx.currentTime + note.delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.delay + note.dur)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + note.delay)
        osc.stop(ctx.currentTime + note.delay + note.dur)
      }
    } catch {}
  }, [getCtx])

  const play = useCallback((sound: SoundType) => {
    switch (sound) {
      case 'pickup':
        playSequence([
          { freq: 440, dur: 0.06, delay: 0 },
          { freq: 660, dur: 0.08, delay: 0.05 },
        ])
        break
      case 'place':
        playSequence([
          { freq: 330, dur: 0.08, delay: 0 },
          { freq: 220, dur: 0.12, delay: 0.06 },
        ], 'square', 0.12)
        break
      case 'hover':
        playTone(880, 0.03, 'sine', 0.03)
        break
      case 'save':
        playSequence([
          { freq: 523, dur: 0.1, delay: 0 },
          { freq: 659, dur: 0.1, delay: 0.1 },
          { freq: 784, dur: 0.15, delay: 0.2 },
          { freq: 1047, dur: 0.25, delay: 0.3 },
        ], 'square', 0.08)
        break
      case 'undo':
        playSequence([
          { freq: 600, dur: 0.06, delay: 0 },
          { freq: 400, dur: 0.1, delay: 0.05 },
        ], 'sawtooth', 0.06)
        break
      case 'error':
        playSequence([
          { freq: 200, dur: 0.15, delay: 0 },
          { freq: 150, dur: 0.2, delay: 0.12 },
        ], 'square', 0.1)
        break
      case 'purchase':
        playSequence([
          { freq: 523, dur: 0.08, delay: 0 },
          { freq: 659, dur: 0.08, delay: 0.08 },
          { freq: 784, dur: 0.08, delay: 0.16 },
          { freq: 1047, dur: 0.12, delay: 0.24 },
          { freq: 1319, dur: 0.2, delay: 0.32 },
        ], 'square', 0.07)
        break
      case 'colorCycle':
        playTone(660, 0.06, 'square', 0.06)
        break
      case 'flip':
        playSequence([
          { freq: 500, dur: 0.05, delay: 0 },
          { freq: 700, dur: 0.05, delay: 0.04 },
        ], 'triangle', 0.08)
        break
    }
  }, [playTone, playSequence])

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled
  }, [])

  return { play, setEnabled, enabled: enabledRef }
}
