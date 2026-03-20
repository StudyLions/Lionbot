// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Retro 8-bit sound effects for room editor using Web Audio API
// ============================================================
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Refactored to use the shared UISoundEngine singleton so
//          room sounds respect the global sound toggle. Room-specific
//          sounds (pickup, place, hover, colorCycle, flip) are kept here;
//          common sounds (save, undo, error, purchase) delegate to the engine.

import { useCallback } from 'react'
import { getUISoundEngine } from '@/lib/uiSoundEngine'

type SoundType = 'pickup' | 'place' | 'hover' | 'save' | 'undo' | 'error' | 'purchase' | 'colorCycle' | 'flip'

export function useRoomSounds() {
  const play = useCallback((sound: SoundType) => {
    const engine = getUISoundEngine()
    if (!engine.enabled) return

    switch (sound) {
      case 'pickup':
        roomSeq(engine, [
          { freq: 440, dur: 0.06, delay: 0 },
          { freq: 660, dur: 0.08, delay: 0.05 },
        ])
        break
      case 'place':
        roomSeq(engine, [
          { freq: 330, dur: 0.08, delay: 0 },
          { freq: 220, dur: 0.12, delay: 0.06 },
        ], 'square', 0.12)
        break
      case 'hover':
        roomTone(engine, 880, 0.03, 'sine', 0.03)
        break
      case 'colorCycle':
        roomTone(engine, 660, 0.06, 'square', 0.06)
        break
      case 'flip':
        roomSeq(engine, [
          { freq: 500, dur: 0.05, delay: 0 },
          { freq: 700, dur: 0.05, delay: 0.04 },
        ], 'triangle', 0.08)
        break
      case 'save':
        engine.play('success')
        break
      case 'undo':
        engine.play('undo')
        break
      case 'error':
        engine.play('error')
        break
      case 'purchase':
        engine.play('purchase')
        break
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    getUISoundEngine().setEnabled(enabled)
  }, [])

  return { play, setEnabled, enabled: { current: getUISoundEngine().enabled } }
}

type NoteSpec = { freq: number; dur: number; delay: number }

function getAudioCtx(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)()
}

let _roomCtx: AudioContext | null = null
function roomCtx(): AudioContext {
  if (!_roomCtx) _roomCtx = getAudioCtx()
  if (_roomCtx.state === 'suspended') _roomCtx.resume()
  return _roomCtx
}

function roomTone(_engine: ReturnType<typeof getUISoundEngine>, freq: number, dur: number, type: OscillatorType = 'square', vol = 0.1) {
  try {
    const ctx = roomCtx()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
  } catch {}
}

function roomSeq(_engine: ReturnType<typeof getUISoundEngine>, notes: NoteSpec[], type: OscillatorType = 'square', vol = 0.1) {
  try {
    const ctx = roomCtx()
    for (const n of notes) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay)
      g.gain.setValueAtTime(vol, ctx.currentTime + n.delay)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(ctx.currentTime + n.delay)
      osc.stop(ctx.currentTime + n.delay + n.dur)
    }
  } catch {}
}
// --- END AI-MODIFIED ---
