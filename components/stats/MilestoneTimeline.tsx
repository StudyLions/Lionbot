// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Horizontal milestone timeline with glowing nodes
// ============================================================
import { motion } from "framer-motion"

interface Milestone {
  label: string
  date: string
  value: number
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function MilestoneTimeline({
  milestones,
}: {
  milestones: Milestone[]
}) {
  if (!milestones || milestones.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-6 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_MILESTONE LOG
      </h2>

      <div className="overflow-x-auto pb-4">
        <div className="relative min-w-max flex items-start">
          <div className="absolute top-4 left-0 right-0 h-px bg-green-500/20" />

          {milestones.map((m, i) => (
            <motion.div
              key={m.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center px-6 sm:px-10"
            >
              <div
                className="w-3 h-3 rounded-full bg-green-400 border-2 border-black z-10"
                style={{
                  boxShadow: "0 0 12px rgba(0,255,65,0.6)",
                }}
              />
              <div className="mt-3 text-center">
                <div className="text-[10px] font-mono text-green-500/50">
                  [{formatDate(m.date)}]
                </div>
                <div
                  className="text-xs font-mono text-green-400 mt-1"
                  style={{ textShadow: "0 0 8px rgba(0,255,65,0.4)" }}
                >
                  {m.label.toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
