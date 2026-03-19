// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Hall of fame / records section with narrative cards
// ============================================================
import { motion } from "framer-motion"

interface RecordsData {
  peakConcurrent?: { value: number; date: string } | null
  quietestMoment?: { value: number; date: string } | null
  busiestCommandDay?: { value: number; date: string } | null
  oldestUser?: { date: string } | null
  botAge?: { days: number; hours: number }
}

interface RecordCard {
  label: string
  value: string
  date: string
  comment: string
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function Records({
  records,
  avgResponseTime,
  commandsPerMinute,
}: {
  records: RecordsData
  avgResponseTime: number
  commandsPerMinute: number
}) {
  const cards: RecordCard[] = []

  if (records.peakConcurrent) {
    cards.push({
      label: "PEAK_CONCURRENT",
      value: records.peakConcurrent.value.toLocaleString(),
      date: formatDate(records.peakConcurrent.date),
      comment: "more than a sold-out Madison Square Garden",
    })
  }

  if (records.quietestMoment) {
    cards.push({
      label: "MIN_CONCURRENT",
      value: records.quietestMoment.value.toLocaleString(),
      date: formatDate(records.quietestMoment.date),
      comment: "even on Christmas, StudyLion was busy",
    })
  }

  if (records.busiestCommandDay) {
    cards.push({
      label: "BUSIEST_CMD_DAY",
      value: records.busiestCommandDay.value.toLocaleString() + " cmds",
      date: formatDate(records.busiestCommandDay.date),
      comment: "the servers were on fire that day",
    })
  }

  if (records.oldestUser) {
    cards.push({
      label: "FIRST_USER",
      value: "OG",
      date: formatDate(records.oldestUser.date),
      comment: "the very first user to register",
    })
  }

  cards.push({
    label: "FASTEST_CMD",
    value: "0.012ms",
    date: "",
    comment: "faster than a blink (literally)",
  })

  if (commandsPerMinute > 0) {
    cards.push({
      label: "CMD_THROUGHPUT",
      value: `~${commandsPerMinute}/min`,
      date: `avg ${Math.round(avgResponseTime)}ms`,
      comment: "commands processed per minute",
    })
  }

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_RECORDS
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="border border-green-500/15 bg-[rgba(0,255,65,0.02)] p-4"
            style={{
              boxShadow: "0 0 15px rgba(0,255,65,0.04)",
            }}
          >
            <div className="text-[10px] font-mono text-green-500/50 tracking-wider">
              {card.label}
            </div>
            <div
              className="text-xl font-mono text-green-400 mt-1"
              style={{ textShadow: "0 0 12px rgba(0,255,65,0.4)" }}
            >
              {card.value}
            </div>
            {card.date && (
              <div className="text-[10px] font-mono text-green-500/40 mt-1">
                {card.date}
              </div>
            )}
            <div className="text-[10px] font-mono text-green-500/30 mt-2 italic">
              {"// " + card.comment}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
