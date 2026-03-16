// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Hook for browser notifications + alert sounds on
//          pomodoro stage changes. Plays the same focus/break
//          alert WAVs the bot uses in voice channels.
// ============================================================
import { useEffect, useRef, useCallback, useState } from "react"

const STORAGE_KEY = "lion-session-notifications"

export function useStageNotifications(stage: "focus" | "break" | null) {
  const prevStageRef = useRef<"focus" | "break" | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "true") setEnabled(true)
    } catch {}
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission)
    }
  }, [])

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false)
      localStorage.setItem(STORAGE_KEY, "false")
      return
    }

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      const perm = await Notification.requestPermission()
      setPermission(perm)
    }

    setEnabled(true)
    localStorage.setItem(STORAGE_KEY, "true")
  }, [enabled])

  useEffect(() => {
    if (!enabled || !stage || prevStageRef.current === null) {
      prevStageRef.current = stage
      return
    }

    if (prevStageRef.current !== stage) {
      const isFocus = stage === "focus"
      const audioSrc = isFocus ? "/audio/focus-alert.wav" : "/audio/break-alert.wav"

      try {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        const audio = new Audio(audioSrc)
        audio.volume = 0.6
        audio.play().catch(() => {})
        audioRef.current = audio
      } catch {}

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(isFocus ? "Focus Time!" : "Break Time!", {
            body: isFocus ? "Time to concentrate. You got this." : "Take a breather. You earned it.",
            icon: "/images/lionbot-avatar.png",
            tag: "lion-stage-change",
          })
        } catch {}
      }
    }

    prevStageRef.current = stage
  }, [stage, enabled])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return { enabled, toggle, permission }
}
