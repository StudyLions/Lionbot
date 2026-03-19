// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Day of week chart + "In Your Timezone" personalization
// ============================================================
import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface DayData {
  day: number
  avgStudying: number
}

interface HourData {
  hour: number
  avgStudying: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black border border-green-500/30 px-2 py-1 font-mono text-xs text-green-400">
      {label}: {Number(payload[0].value).toLocaleString()} avg
    </div>
  )
}

export default function StudyPatterns({
  studyByDay,
  studyByHour,
}: {
  studyByDay: DayData[]
  studyByHour: HourData[]
}) {
  const dayData = useMemo(
    () =>
      studyByDay?.map((d) => ({
        name: DAY_NAMES[d.day] || `D${d.day}`,
        value: d.avgStudying,
      })) || [],
    [studyByDay]
  )

  const tzInfo = useMemo(() => {
    if (!studyByHour || studyByHour.length === 0) return null
    try {
      const offset = -new Date().getTimezoneOffset() / 60
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const shifted = studyByHour.map((h) => ({
        hour: (h.hour + offset + 24) % 24,
        avgStudying: h.avgStudying,
      }))
      const peak = shifted.reduce((a, b) =>
        a.avgStudying > b.avgStudying ? a : b
      )
      return {
        timezone: tz,
        peakHour: peak.hour,
      }
    } catch {
      return null
    }
  }, [studyByHour])

  if (dayData.length === 0) return null

  return (
    <section>
      <h2
        className="text-sm tracking-[0.2em] uppercase text-green-500/80 mb-4 font-mono"
        style={{ textShadow: "0 0 10px rgba(0,255,65,0.3)" }}
      >
        {">"}_TEMPORAL ANALYSIS
      </h2>

      <div className="h-[200px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dayData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,255,65,0.08)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(0,255,65,0.5)", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(0,255,65,0.4)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(0,255,65,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#00ff41" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {tzInfo && (
        <div className="mt-3 text-xs font-mono text-green-500/50 text-center">
          {"// IN YOUR TIMEZONE ("}
          {tzInfo.timezone}
          {"): PEAK_STUDY_HOUR = "}
          <span className="text-green-400">
            {String(Math.floor(tzInfo.peakHour)).padStart(2, "0")}:00
          </span>
        </div>
      )}
    </section>
  )
}
