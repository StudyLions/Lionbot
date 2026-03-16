// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Web Audio API ambient sound manager for focus mode.
//          Generates white noise, brown noise, and rain-like
//          noise entirely in-browser (no audio files needed).
// ============================================================
import { useEffect, useRef, useCallback, useState } from "react"

export type SoundType = "off" | "white" | "brown" | "rain"

const STORAGE_KEYS = {
  type: "lion-ambient-type",
  volume: "lion-ambient-volume",
  playing: "lion-ambient-playing",
}

const FADE_DURATION = 0.5

function createWhiteNoiseBuffer(ctx: AudioContext, durationSecs = 2): AudioBuffer {
  const bufferSize = durationSecs * ctx.sampleRate
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return buffer
}

function createBrownNoiseBuffer(ctx: AudioContext, durationSecs = 2): AudioBuffer {
  const bufferSize = durationSecs * ctx.sampleRate
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut + 0.02 * white) / 1.02
      data[i] = lastOut * 3.5
    }
  }
  return buffer
}

function createRainNoiseBuffer(ctx: AudioContext, durationSecs = 3): AudioBuffer {
  const bufferSize = durationSecs * ctx.sampleRate
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut + 0.05 * white) / 1.05
      const crackle = Math.random() < 0.001 ? (Math.random() - 0.5) * 0.3 : 0
      data[i] = lastOut * 2.5 + crackle
    }
  }
  return buffer
}

interface AmbientState {
  ctx: AudioContext
  source: AudioBufferSourceNode
  gain: GainNode
  filter?: BiquadFilterNode
}

export function useAmbientSound() {
  const [soundType, setSoundTypeState] = useState<SoundType>("off")
  const [volume, setVolumeState] = useState(0.3)
  const [playing, setPlaying] = useState(false)
  const stateRef = useRef<AmbientState | null>(null)

  useEffect(() => {
    try {
      const storedType = localStorage.getItem(STORAGE_KEYS.type) as SoundType | null
      const storedVol = localStorage.getItem(STORAGE_KEYS.volume)
      if (storedType && storedType !== "off") setSoundTypeState(storedType)
      if (storedVol) setVolumeState(parseFloat(storedVol))
    } catch {}
  }, [])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: smooth fade-out when stopping ambient sound
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopSound = useCallback((immediate = false) => {
    if (fadeOutTimerRef.current) {
      clearTimeout(fadeOutTimerRef.current)
      fadeOutTimerRef.current = null
    }
    if (!stateRef.current) {
      setPlaying(false)
      return
    }
    const st = stateRef.current
    if (immediate) {
      try {
        st.source.stop()
        st.source.disconnect()
        st.gain.disconnect()
        st.filter?.disconnect()
        st.ctx.close().catch(() => {})
      } catch {}
      stateRef.current = null
      setPlaying(false)
      localStorage.setItem(STORAGE_KEYS.playing, "false")
      return
    }
    try {
      st.gain.gain.linearRampToValueAtTime(0, st.ctx.currentTime + FADE_DURATION)
    } catch {}
    fadeOutTimerRef.current = setTimeout(() => {
      try {
        st.source.stop()
        st.source.disconnect()
        st.gain.disconnect()
        st.filter?.disconnect()
        st.ctx.close().catch(() => {})
      } catch {}
      stateRef.current = null
      fadeOutTimerRef.current = null
    }, FADE_DURATION * 1000 + 50)
    setPlaying(false)
    localStorage.setItem(STORAGE_KEYS.playing, "false")
  }, [])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: smooth fade-in when starting ambient sound + persist playing state
  const startSound = useCallback((type: SoundType, vol: number) => {
    stopSound(true)
    if (type === "off") return

    try {
      const ctx = new AudioContext()
      let buffer: AudioBuffer
      let filter: BiquadFilterNode | undefined

      switch (type) {
        case "white":
          buffer = createWhiteNoiseBuffer(ctx)
          break
        case "brown":
          buffer = createBrownNoiseBuffer(ctx)
          break
        case "rain":
          buffer = createRainNoiseBuffer(ctx)
          filter = ctx.createBiquadFilter()
          filter.type = "lowpass"
          filter.frequency.value = 800
          filter.Q.value = 0.5
          break
        default:
          return
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + FADE_DURATION)

      if (filter) {
        source.connect(filter)
        filter.connect(gain)
      } else {
        source.connect(gain)
      }
      gain.connect(ctx.destination)
      source.start()

      stateRef.current = { ctx, source, gain, filter }
      setPlaying(true)
      localStorage.setItem(STORAGE_KEYS.playing, "true")
    } catch {}
  }, [stopSound])
  // --- END AI-MODIFIED ---

  const setSoundType = useCallback((type: SoundType) => {
    setSoundTypeState(type)
    localStorage.setItem(STORAGE_KEYS.type, type)
    if (type === "off") {
      stopSound()
    } else if (playing || stateRef.current) {
      startSound(type, volume)
    }
  }, [playing, volume, startSound, stopSound])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: smooth volume transitions
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolumeState(clamped)
    localStorage.setItem(STORAGE_KEYS.volume, String(clamped))
    if (stateRef.current) {
      try {
        stateRef.current.gain.gain.linearRampToValueAtTime(
          clamped, stateRef.current.ctx.currentTime + 0.1
        )
      } catch {
        stateRef.current.gain.gain.value = clamped
      }
    }
  }, [])
  // --- END AI-MODIFIED ---

  const toggle = useCallback(() => {
    if (playing) {
      stopSound()
    } else if (soundType !== "off") {
      startSound(soundType, volume)
    } else {
      setSoundType("white")
      startSound("white", volume)
    }
  }, [playing, soundType, volume, startSound, stopSound, setSoundType])

  useEffect(() => {
    return () => { stopSound(true) }
  }, [stopSound])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: auto-resume ambient sound when re-entering focus mode
  const autoResume = useCallback(() => {
    try {
      const wasPlaying = localStorage.getItem(STORAGE_KEYS.playing)
      const storedType = localStorage.getItem(STORAGE_KEYS.type) as SoundType | null
      const storedVol = localStorage.getItem(STORAGE_KEYS.volume)
      if (wasPlaying === "true" && storedType && storedType !== "off") {
        const vol = storedVol ? parseFloat(storedVol) : 0.3
        setSoundTypeState(storedType)
        setVolumeState(vol)
        startSound(storedType, vol)
      }
    } catch {}
  }, [startSound])

  return { playing, soundType, volume, toggle, setSoundType, setVolume, autoResume }
  // --- END AI-MODIFIED ---
}
