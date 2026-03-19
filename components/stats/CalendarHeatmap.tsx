// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: GitHub-style calendar heatmap showing daily study
//          activity across 620+ days
// ============================================================
import { useMemo, useState } from "react"
import { motion } from "framer-motion"

interface DayData {
  date: string
  avgStudying: number
}

function getColor(value: number, max: number): string {
  if (value === 0) return "rgba(0,255,65,0.02)"
  const ratio = Math.min(value / max, 1)
  if (ratio < 0.25) return "rgba(0,255,65,0.1)"
  if (ratio < 0.5) return "rgba(0,255,65,0.25)"
  if (ratio < 0.75) return "rgba(0,255,65,0.45)"
  return "rgba(0,255,65,0.7)"
}

export default function CalendarHeatmap({ data }: { data: DayData[] }) {
  const [hovered, setHovered] = useState<DayData | null>(null)

  const { weeks, max } = useMemo(() => {
    if (!data || data.length === 0) return { weeks: [], max: 0 }

    const maxVal = Math.max(...data.map((d) => d.avgStudying))
    const dayMap = new Map(data.map((d) => [d.date, d]))

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const start = new Date(sorted[0].date)
    const end = new Date(sorted[sorted.length - 1].date)

    start.setDate(start.getDate() - start.getDay())

    const allWeeks: Array<Array<DayData | null>> = []
    let currentWeek: Array<DayData | null> = []
    const cursor = new Date(start)

    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0]
      const entry = dayMap.get(key) || null
      currentWeek.push(entry)

      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek)
        currentWeek = []
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      allWeeks.push(currentWeek)
    }

    return { weeks: allWeeks, max: maxVal }
  }, [data])

  if (weeks.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_DAILY ACTIVITY LOG [{data.length} DAYS]
      </h2>

      <div className="relative">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[2px] min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => (
                  <motion.div
                    key={`${wi}-${di}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: wi * 0.003 }}
                    className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] cursor-default"
                    style={{
                      backgroundColor: day
                        ? getColor(day.avgStudying, max)
                        : "rgba(0,255,65,0.01)",
                      boxShadow:
                        day && day.avgStudying / max > 0.7
                          ? "0 0 4px rgba(0,255,65,0.3)"
                          : "none",
                    }}
                    onMouseEnter={() => day && setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {hovered && (
          <div className="absolute top-0 right-0 bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400 z-10">
            {hovered.date}: avg {hovered.avgStudying.toLocaleString()} in voice
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-green-500/40">
          <span>less</span>
          {[0.02, 0.1, 0.25, 0.45, 0.7].map((op) => (
            <div
              key={op}
              className="w-[10px] h-[10px]"
              style={{ backgroundColor: `rgba(0,255,65,${op})` }}
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </section>
  )
}
