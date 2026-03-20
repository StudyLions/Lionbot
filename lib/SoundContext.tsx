// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: React context wrapper around the UI sound engine.
//          Provides useUISound() hook for components and syncs
//          the enabled toggle with React state for UI updates.
// ============================================================

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react'
import { getUISoundEngine, type UISoundType } from '@/lib/uiSoundEngine'

export type { UISoundType }

interface SoundContextValue {
  playSound: (type: UISoundType) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

const SoundContext = createContext<SoundContextValue>({
  playSound: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
})

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(true)

  useEffect(() => {
    setSoundEnabledState(getUISoundEngine().enabled)
  }, [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    getUISoundEngine().setEnabled(enabled)
    setSoundEnabledState(enabled)
  }, [])

  const playSound = useCallback((type: UISoundType) => {
    getUISoundEngine().play(type)
  }, [])

  return (
    <SoundContext.Provider value={{ playSound, soundEnabled, setSoundEnabled }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useUISound() {
  return useContext(SoundContext)
}
