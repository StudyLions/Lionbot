// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Terminal boot sequence animation on page load
// ============================================================
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_LINES = [
  { text: "> CONNECTING TO STUDYLION MAINFRAME...", delay: 0 },
  { text: "> AUTHENTICATING.............. OK", delay: 300 },
  { text: "> LOADING 32 SHARDS........... OK", delay: 600 },
  { text: "> QUERYING 500,000,000 ROWS... OK", delay: 900 },
  { text: "> ACCESS GRANTED_", delay: 1200 },
]

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay)
      )
    })

    timers.push(
      setTimeout(() => {
        setDone(true)
        setTimeout(onComplete, 400)
      }, 1600)
    )

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <div className="font-mono text-sm sm:text-base space-y-1 px-4">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${
                  line.text.includes("ACCESS GRANTED")
                    ? "text-green-400"
                    : "text-green-500/80"
                }`}
                style={
                  line.text.includes("ACCESS GRANTED")
                    ? { textShadow: "0 0 20px rgba(0,255,65,0.6)" }
                    : {}
                }
              >
                {line.text}
              </motion.div>
            ))}
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
