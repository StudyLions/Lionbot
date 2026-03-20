// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Standalone 8-bit UI sound engine (Web Audio API).
//          Module-level singleton so it can be used both from
//          React components (via SoundContext) and imperative
//          code (like toast wrappers) without a React tree.
// ============================================================

export type UISoundType =
  | 'click'
  | 'toggleOn'
  | 'toggleOff'
  | 'success'
  | 'error'
  | 'warning'
  | 'confirm'
  | 'undo'
  | 'navigate'
  | 'purchase'
  | 'notification'
  | 'delete'
  | 'open'
  | 'close'
  | 'taskComplete'

const STORAGE_KEY = 'lionbot-ui-sounds-enabled'

class UISoundEngine {
  private ctx: AudioContext | null = null
  private _enabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored !== null) this._enabled = stored === 'true'
      } catch {}
    }
  }

  get enabled() { return this._enabled }

  setEnabled(val: boolean) {
    this._enabled = val
    try { localStorage.setItem(STORAGE_KEY, String(val)) } catch {}
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08) {
    if (!this._enabled) return
    try {
      const ctx = this.getCtx()
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

  private seq(notes: Array<{ freq: number; dur: number; delay: number }>, type: OscillatorType = 'square', vol = 0.08) {
    if (!this._enabled) return
    try {
      const ctx = this.getCtx()
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

  play(sound: UISoundType) {
    switch (sound) {
      case 'click':
        this.tone(660, 0.04, 'square', 0.05)
        break
      case 'toggleOn':
        this.seq([
          { freq: 440, dur: 0.05, delay: 0 },
          { freq: 660, dur: 0.07, delay: 0.04 },
        ], 'square', 0.07)
        break
      case 'toggleOff':
        this.seq([
          { freq: 550, dur: 0.05, delay: 0 },
          { freq: 370, dur: 0.07, delay: 0.04 },
        ], 'square', 0.06)
        break
      case 'success':
        this.seq([
          { freq: 523, dur: 0.08, delay: 0 },
          { freq: 659, dur: 0.08, delay: 0.08 },
          { freq: 784, dur: 0.12, delay: 0.16 },
          { freq: 1047, dur: 0.2, delay: 0.24 },
        ], 'square', 0.07)
        break
      case 'error':
        this.seq([
          { freq: 220, dur: 0.12, delay: 0 },
          { freq: 165, dur: 0.18, delay: 0.1 },
        ], 'square', 0.08)
        break
      case 'warning':
        this.seq([
          { freq: 440, dur: 0.08, delay: 0 },
          { freq: 440, dur: 0.08, delay: 0.12 },
          { freq: 550, dur: 0.12, delay: 0.24 },
        ], 'triangle', 0.07)
        break
      case 'confirm':
        this.seq([
          { freq: 523, dur: 0.06, delay: 0 },
          { freq: 784, dur: 0.1, delay: 0.05 },
        ], 'square', 0.07)
        break
      case 'undo':
        this.seq([
          { freq: 600, dur: 0.06, delay: 0 },
          { freq: 400, dur: 0.1, delay: 0.05 },
        ], 'sawtooth', 0.05)
        break
      case 'navigate':
        this.tone(880, 0.04, 'sine', 0.04)
        break
      case 'purchase':
        this.seq([
          { freq: 523, dur: 0.06, delay: 0 },
          { freq: 659, dur: 0.06, delay: 0.06 },
          { freq: 784, dur: 0.06, delay: 0.12 },
          { freq: 1047, dur: 0.1, delay: 0.18 },
          { freq: 1319, dur: 0.16, delay: 0.24 },
        ], 'square', 0.06)
        break
      case 'notification':
        this.seq([
          { freq: 784, dur: 0.06, delay: 0 },
          { freq: 1047, dur: 0.1, delay: 0.06 },
        ], 'sine', 0.06)
        break
      case 'delete':
        this.seq([
          { freq: 400, dur: 0.06, delay: 0 },
          { freq: 300, dur: 0.06, delay: 0.05 },
          { freq: 200, dur: 0.12, delay: 0.1 },
        ], 'sawtooth', 0.06)
        break
      case 'open':
        this.seq([
          { freq: 330, dur: 0.04, delay: 0 },
          { freq: 440, dur: 0.04, delay: 0.03 },
          { freq: 550, dur: 0.06, delay: 0.06 },
        ], 'triangle', 0.05)
        break
      case 'close':
        this.seq([
          { freq: 550, dur: 0.04, delay: 0 },
          { freq: 440, dur: 0.04, delay: 0.03 },
          { freq: 330, dur: 0.06, delay: 0.06 },
        ], 'triangle', 0.04)
        break
      case 'taskComplete':
        this.seq([
          { freq: 659, dur: 0.06, delay: 0 },
          { freq: 880, dur: 0.06, delay: 0.06 },
          { freq: 1047, dur: 0.14, delay: 0.12 },
        ], 'square', 0.06)
        break
    }
  }
}

let _instance: UISoundEngine | null = null

export function getUISoundEngine(): UISoundEngine {
  if (!_instance) _instance = new UISoundEngine()
  return _instance
}
